import { bellScale, bellSurfacePoint } from "./geometry";
import type { Jellyfish } from "./types";

export interface SurfacePoint {
  x: number;
  y: number;
  z: number;
}
export interface ProjectedPoint {
  x: number;
  y: number;
  depth: number;
  perspective: number;
  facing: number;
}
export type Projection = (
  point: SurfacePoint,
  target?: ProjectedPoint,
) => ProjectedPoint;

// Static, shared geometry. Only projected coordinates are updated each frame.
const RINGS = 21,
  COLUMNS = 48,
  CONTOUR_ROWS = 56;
// Denser samples at apex and lip keep rounded extrema smooth at every scale.
const contourFractions = Array.from(
  { length: CONTOUR_ROWS },
  (_, i) => (1 - Math.cos((i / (CONTOUR_ROWS - 1)) * Math.PI)) / 2,
);
export const bellMesh = Array.from({ length: RINGS * COLUMNS }, (_, i) =>
  bellSurfacePoint(
    ((Math.floor(i / COLUMNS) / (RINGS - 1)) * Math.PI) / 2,
    ((i % 48) / 48) * Math.PI * 2,
  ),
);
export const bellLip = Array.from({ length: 64 }, (_, i) =>
  bellSurfacePoint(Math.PI / 2, (i / 64) * Math.PI * 2),
);
const canals = Array.from({ length: 5 }, (_, canal) =>
  Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    const p = bellSurfacePoint(
      ((0.2 + (canal % 3) * 0.14 + t * 0.26) * Math.PI) / 2,
      (canal / 5) * Math.PI * 2 + 0.3,
    );
    return {
      x: p.x * 0.88,
      y: p.y + 4,
      z: p.z * 0.88,
    };
  }),
);
const highlights = [
  [2.35, 0.1, 0.47],
  [0.68, 0.2, 0.39],
  [2.8, 0.7, 0.93],
].map(([angle, from, to]) =>
  Array.from({ length: 15 }, (_, i) =>
    bellSurfacePoint(((from + ((to - from) * i) / 14) * Math.PI) / 2, angle),
  ),
);
const point = (): ProjectedPoint => ({
  x: 0,
  y: 0,
  depth: 0,
  perspective: 1,
  facing: 0,
});
function workspace() {
  const surface = bellMesh.map(point);
  const rim = bellLip.map(point);
  const highlightBuffers = highlights.map((points) => points.map(point));
  const lipHighlights = [rim.slice(3, 14), rim.slice(21, 29)];
  return {
    surface,
    outline: [] as ProjectedPoint[],
    leftEdge: Array.from({ length: CONTOUR_ROWS }, point),
    rightEdge: Array.from({ length: CONTOUR_ROWS }, point),
    minX: new Float64Array(CONTOUR_ROWS),
    maxX: new Float64Array(CONTOUR_ROWS),
    rim,
    lipHighlights,
    recess: bellLip.map(point),
    canals: canals.map((points) => points.map(point)),
    highlights: highlightBuffers,
    emission: [...highlightBuffers, ...lipHighlights],
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };
}
const frames = new WeakMap<Jellyfish, ReturnType<typeof workspace>>();

export function projectBell(jelly: Jellyfish, project: Projection) {
  let frame = frames.get(jelly);
  if (!frame) {
    frame = workspace();
    frames.set(jelly, frame);
  }
  const scale = bellScale(jelly);
  const local = { x: 0, y: 0, z: 0 };
  const apply = (
    source: SurfacePoint,
    target: ProjectedPoint,
    inset = false,
  ) => {
    local.x = source.x * scale.x * (inset ? 0.81 : 1);
    local.y = (source.y - (inset ? 7.5 : 0)) * scale.y;
    local.z = source.z * scale.x * (inset ? 0.81 : 1);
    project(local, target);
  };
  bellMesh.forEach((p, i) => apply(p, frame.surface[i]));
  bellLip.forEach((p, i) => {
    apply(p, frame.rim[i]);
    apply(p, frame.recess[i], true);
  });
  canals.forEach((points, c) =>
    points.forEach((p, i) => apply(p, frame.canals[c][i])),
  );
  highlights.forEach((points, c) =>
    points.forEach((p, i) => apply(p, frame.highlights[c][i])),
  );
  // Horizontal envelopes of projected surface edges retain the actual shoulder,
  // flare and curl. A convex hull would bridge these concavities into a bowl.
  let top = frame.surface[0],
    bottom = top,
    left = top.x,
    right = top.x;
  for (const p of frame.surface) {
    if (p.y < top.y) top = p;
    if (p.y > bottom.y) bottom = p;
    left = Math.min(left, p.x);
    right = Math.max(right, p.x);
  }
  frame.left = left;
  frame.top = top.y;
  frame.width = right - left;
  frame.height = bottom.y - top.y;
  const rowAt = (y: number) =>
    (Math.acos(
      Math.max(-1, Math.min(1, 1 - (2 * (y - top.y)) / frame.height)),
    ) /
      Math.PI) *
    (CONTOUR_ROWS - 1);
  frame.minX.fill(Infinity);
  frame.maxX.fill(-Infinity);
  const edge = (a: ProjectedPoint, b: ProjectedPoint) => {
    if (Math.abs(b.y - a.y) < 1e-9) return;
    const start = Math.max(0, Math.ceil(rowAt(Math.min(a.y, b.y))));
    const end = Math.min(
      CONTOUR_ROWS - 1,
      Math.floor(rowAt(Math.max(a.y, b.y))),
    );
    for (let row = start; row <= end; row++) {
      const y = top.y + contourFractions[row] * frame.height;
      const x = a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y);
      frame.minX[row] = Math.min(frame.minX[row], x);
      frame.maxX[row] = Math.max(frame.maxX[row], x);
    }
  };
  for (let ring = 0; ring < RINGS; ring++) {
    for (let column = 0; column < COLUMNS; column++) {
      const i = ring * COLUMNS + column;
      edge(
        frame.surface[i],
        frame.surface[ring * COLUMNS + ((column + 1) % COLUMNS)],
      );
      if (ring + 1 < RINGS) edge(frame.surface[i], frame.surface[i + COLUMNS]);
    }
  }
  frame.minX[0] = frame.maxX[0] = top.x;
  frame.minX[CONTOUR_ROWS - 1] = frame.maxX[CONTOUR_ROWS - 1] = bottom.x;
  const outline = frame.outline;
  outline.length = 0;
  for (let row = 0; row < CONTOUR_ROWS; row++) {
    frame.leftEdge[row].x = frame.minX[row];
    frame.leftEdge[row].y = frame.rightEdge[row].y =
      top.y + contourFractions[row] * frame.height;
    frame.rightEdge[row].x = frame.maxX[row];
    outline.push(frame.leftEdge[row]);
  }
  for (let row = CONTOUR_ROWS - 1; row >= 0; row--)
    outline.push(frame.rightEdge[row]);
  return frame;
}

export function traceClosed(
  ctx: CanvasRenderingContext2D,
  points: ProjectedPoint[],
) {
  const last = points[points.length - 1],
    first = points[0];
  ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
  for (let i = 0; i < points.length; i++) {
    const p = points[i],
      next = points[(i + 1) % points.length];
    ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
  }
  ctx.closePath();
}

export function traceOpen(
  ctx: CanvasRenderingContext2D,
  points: ProjectedPoint[],
) {
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i],
      next = points[i + 1];
    ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
}
