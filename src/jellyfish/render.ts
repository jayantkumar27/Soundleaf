import { BELL_BASE_Y, bellGlyphs, bellScale } from "./geometry";
import { clamp, type Jellyfish, type Scene, type Tentacle } from "./types";
import { drawBellTissue, drawDotGlyph, drawJellyfishGlow } from "./dotGlyph";
import {
  projectBell,
  traceClosed,
  traceOpen,
  type ProjectedPoint,
} from "./bellSurface";

interface Point3D {
  x: number;
  y: number;
  z: number;
}
interface Glyph {
  char: string;
  x: number;
  y: number;
  depth: number;
  size: number;
  alpha: number;
  blur: number;
}
interface Strand {
  points: ProjectedPoint[];
  normals: { x: number; y: number }[];
  radii: number[];
  depth: number;
}
const strandFrames = new WeakMap<Tentacle, Strand>();

function drawStrand(
  ctx: CanvasRenderingContext2D,
  strand: Strand,
  jelly: Jellyfish,
) {
  const { points, normals, radii } = strand;
  const first = points[0],
    last = points[points.length - 1];
  ctx.save();
  const emergence = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
  emergence.addColorStop(0, `${jelly.color}00`);
  emergence.addColorStop(0.012, `${jelly.color}00`);
  emergence.addColorStop(0.09, jelly.color);
  emergence.addColorStop(0.75, jelly.color);
  emergence.addColorStop(1, `${jelly.color}00`);
  ctx.fillStyle = emergence;
  for (const outer of [true, false]) {
    const width = outer ? 2.4 : 1;
    ctx.globalAlpha = (outer ? 0.17 : 0.52) * (0.58 + first.facing * 0.42);
    ctx.globalCompositeOperation = outer ? "source-over" : "screen";
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    // Midpoint quadratics stay inside the neighboring-node hull. No spring
    // overshoot or interpolated coordinates are fed back to the simulation.
    for (const side of [1, -1]) {
      for (let i = 0; i < points.length; i++) {
        const n = side === 1 ? i : points.length - 1 - i;
        const next = Math.max(0, Math.min(points.length - 1, n + side));
        const p = points[n],
          q = points[next];
        const x = p.x + normals[n].x * radii[n] * width * side;
        const y = p.y + normals[n].y * radii[n] * width * side;
        const nx = q.x + normals[next].x * radii[next] * width * side;
        const ny = q.y + normals[next].y * radii[next] * width * side;
        ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// A slightly low camera reveals both sides of the rim as the creature turns.
export function project(jelly: Jellyfish, point: Point3D, time: number) {
  return createProjection(jelly, time)(point);
}

function createProjection(jelly: Jellyfish, time: number) {
  const yaw = Math.sin(time * 0.22 + jelly.phase) * 0.28;
  const pitch = 0.3 + Math.sin(time * 0.18 + jelly.phase) * 0.025;
  const cosYaw = Math.cos(yaw),
    sinYaw = Math.sin(yaw);
  const cosPitch = Math.cos(pitch),
    sinPitch = Math.sin(pitch);
  const camera = 420 * jelly.scale;
  // All points on a creature share the same camera during this frame.
  return (point: Point3D, target?: ProjectedPoint) => {
    const x = point.x * cosYaw + point.z * sinYaw;
    const facingDepth = point.z * cosYaw - point.x * sinYaw;
    const y = point.y * cosPitch + facingDepth * sinPitch;
    const depth = facingDepth * cosPitch - point.y * sinPitch;
    const perspective = camera / (camera - depth);
    const result = target ?? {
      x: 0,
      y: 0,
      depth: 0,
      perspective: 1,
      facing: 0,
    };
    result.x = jelly.x + x * perspective;
    result.y = jelly.y + y * perspective;
    result.depth = depth;
    result.perspective = perspective;
    result.facing = clamp(0.5 + facingDepth / (140 * jelly.scale), 0, 1);
    return result;
  };
}

export function render(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  density = 1,
) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  if ("filter" in ctx) ctx.filter = "none";
  ctx.clearRect(0, 0, scene.width, scene.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 0;
  for (const jelly of scene.creatures) {
    const scale = bellScale(jelly);
    const projectPoint = createProjection(jelly, scene.time);
    const bell = projectBell(jelly, projectPoint);
    const glowCenter = projectPoint({ x: 0, y: -14 * scale.y, z: 0 });
    drawJellyfishGlow(
      ctx,
      jelly.glow,
      glowCenter.x,
      glowCenter.y,
      190 * scale.x,
      130 * scale.y,
    );
    const glyphs: (Glyph | Strand)[] = [];
    ctx.save();
    ctx.beginPath();
    traceClosed(ctx, bell.outline);
    ctx.fillStyle = jelly.color;
    ctx.globalAlpha = 0.045;
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = jelly.color;
    ctx.shadowColor = jelly.glow;
    for (const tentacle of jelly.tentacles) {
      const nodes = tentacle.nodes;
      let strand = strandFrames.get(tentacle);
      if (!strand) {
        strand = {
          points: nodes.map(() => ({
            x: 0,
            y: 0,
            depth: 0,
            perspective: 1,
            facing: 0,
          })),
          normals: nodes.map(() => ({ x: 0, y: 0 })),
          radii: nodes.map(() => 0),
          depth: 0,
        };
        strandFrames.set(tentacle, strand);
      }
      for (let n = 0; n < nodes.length; n++) {
        const node = nodes[n];
        projectPoint(
          { x: node.x - jelly.x, y: node.y - jelly.y, z: node.z },
          strand.points[n],
        );
      }
      for (let n = 0; n < nodes.length; n++) {
        const a = strand.points[Math.max(0, n - 1)],
          b = strand.points[Math.min(nodes.length - 1, n + 1)];
        const distance = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        strand.normals[n].x = -(b.y - a.y) / distance;
        strand.normals[n].y = (b.x - a.x) / distance;
        strand.radii[n] =
          n === 0
            ? 0
            : 0.85 *
              jelly.scale *
              (1 - 0.82 * (n / (nodes.length - 1)) ** 0.9) *
              strand.points[n].perspective;
      }
      // Root depth places rear attachments behind the tissue and front ones over
      // it. The continuous ribbon below the bell remains unbroken by layer cuts.
      strand.depth = strand.points[0].depth;
      glyphs.push(strand);
      // Fixed sampling keeps character identities stable while the strands move.
      const samples = Math.max(
        1,
        Math.ceil(
          tentacle.length /
            (nodes.length - 1) /
            ((3.5 * jelly.scale) / density),
        ),
      );
      for (let n = 1; n < nodes.length; n++) {
        const start = nodes[n - 1],
          end = nodes[n];
        const a = strand.points[n - 1],
          b = strand.points[n];
        const segment = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const normalX = -(b.y - a.y) / segment;
        const normalY = (b.x - a.x) / segment;
        for (let k = 0; k < samples; k++) {
          const t = k / samples;
          const progress = (n - 1 + t) / (nodes.length - 1);
          const point = projectPoint({
            x: start.x + (end.x - start.x) * t - jelly.x,
            y: start.y + (end.y - start.y) * t - jelly.y,
            z: start.z + (end.z - start.z) * t,
          });
          const blend = clamp(
            ((progress * tentacle.length) / jelly.scale - 2) / 15,
            0,
            1,
          );
          const taper = 1 - 0.82 * progress ** 0.9;
          const width =
            jelly.scale *
            taper *
            point.perspective *
            (0.8 + point.facing * 0.2);
          for (const offset of [-1, 1]) {
            glyphs.push({
              char:
                (n + k) % 5 === 0
                  ? "square"
                  : (n + k) % 3 === 0
                    ? "tile"
                    : "dot",
              x: point.x + normalX * offset * width,
              y: point.y + normalY * offset * width,
              depth: point.depth,
              size:
                3.8 * jelly.scale * (0.55 + 0.45 * taper) * point.perspective,
              alpha: Math.min(
                1,
                (0.8 - progress * 0.25) *
                  1.1 *
                  blend *
                  blend *
                  (3 - 2 * blend) *
                  (0.42 + point.facing * 0.58),
              ),
              // Stable highlights use pre-rendered glow, never live canvas blur.
              blur: (n + k) % 3 === 0 ? 1 : 0,
            });
          }
        }
      }
    }
    for (let i = 0; i < bellGlyphs.length; i++) {
      const surface = bellGlyphs[i];
      if ((i * 7) % 5 > 1) continue;
      if (density < 0.7 && i % 3 === 0 && surface.y !== BELL_BASE_Y) continue;
      const point = projectPoint({
        x: surface.x * scale.x,
        y: surface.y * scale.y,
        z: surface.z * scale.x,
      });
      const light = clamp(
        0.82 - surface.x * 0.003 - (surface.y - BELL_BASE_Y) * 0.003,
        0.65,
        1,
      );
      glyphs.push({
        char: surface.char,
        x: point.x,
        y: point.y,
        depth: point.depth,
        size: 5.8 * jelly.scale * point.perspective,
        alpha: Math.min(
          1,
          surface.alpha * 0.4 * (0.22 + point.facing * 0.78) * light,
        ),
        blur: 1,
      });
    }
    // Rear strands and rear surface marks are painted before the foreground.
    glyphs.sort((a, b) => a.depth - b.depth);
    let frontDrawn = false;
    let interiorDrawn = false;
    const interiorDepth = projectPoint({ x: 0, y: 0, z: 0 }).depth;
    const frontDepth = projectPoint({ x: 0, y: 0, z: 24 * scale.x }).depth;
    const interior = () => {
      ctx.save();
      ctx.beginPath();
      traceClosed(ctx, bell.outline);
      ctx.clip();
      ctx.strokeStyle = jelly.color;
      ctx.lineCap = "round";
      for (const canal of bell.canals) {
        const first = canal[0],
          end = canal[canal.length - 1];
        const fold = ctx.createLinearGradient(first.x, first.y, end.x, end.y);
        fold.addColorStop(0, `${jelly.color}00`);
        fold.addColorStop(0.4, jelly.color);
        fold.addColorStop(1, `${jelly.color}00`);
        ctx.strokeStyle = fold;
        ctx.beginPath();
        traceOpen(ctx, canal);
        ctx.lineWidth = 2.4 * jelly.scale;
        ctx.globalAlpha = 0.018;
        ctx.stroke();
        ctx.lineWidth = 0.55 * jelly.scale;
        ctx.globalAlpha = 0.025 + end.facing * 0.025;
        ctx.stroke();
      }
      ctx.restore();
      interiorDrawn = true;
    };
    const frontMembrane = () => {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      traceClosed(ctx, bell.outline);
      ctx.clip();
      drawBellTissue(
        ctx,
        jelly.color,
        bell.left,
        bell.top,
        bell.width,
        bell.height,
      );
      // A recessed cavity and one fading front lip, with no closed wireframe hoop.
      const cy =
        bell.recess.reduce((sum, p) => sum + p.y, 0) / bell.recess.length;
      const cavity = ctx.createLinearGradient(
        0,
        cy - 12 * scale.y,
        0,
        cy + 12 * scale.y,
      );
      cavity.addColorStop(0, "#02070800");
      cavity.addColorStop(0.45, "#02070860");
      cavity.addColorStop(1, "#02070800");
      ctx.beginPath();
      traceClosed(ctx, bell.recess);
      ctx.fillStyle = cavity;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      const lip = ctx.createLinearGradient(
        bell.left,
        0,
        bell.left + bell.width,
        0,
      );
      lip.addColorStop(0, `${jelly.color}00`);
      lip.addColorStop(0.25, `${jelly.color}18`);
      lip.addColorStop(0.6, `${jelly.color}38`);
      lip.addColorStop(1, `${jelly.color}00`);
      ctx.beginPath();
      ctx.moveTo(bell.rim[3].x, bell.rim[3].y);
      for (let i = 4; i <= 29; i++) ctx.lineTo(bell.rim[i].x, bell.rim[i].y);
      for (let i = 29; i >= 3; i--)
        ctx.lineTo(bell.recess[i].x, bell.recess[i].y);
      ctx.closePath();
      ctx.fillStyle = lip;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.restore();
      // Emission is independent of tissue opacity and sits outside its clip, so
      // the soft shoulder light extends beyond the surface at small view sizes.
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.lineCap = "round";
      for (const points of bell.emission) {
        const first = points[0],
          end = points[points.length - 1];
        const light = ctx.createLinearGradient(first.x, first.y, end.x, end.y);
        light.addColorStop(0, "transparent");
        light.addColorStop(0.28, jelly.glow);
        light.addColorStop(0.65, jelly.glow);
        light.addColorStop(1, "transparent");
        ctx.strokeStyle = light;
        ctx.beginPath();
        traceOpen(ctx, points);
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 3.5 * jelly.scale;
        ctx.stroke();
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = Math.max(0.6, 0.75 * jelly.scale);
        ctx.stroke();
      }
      ctx.restore();
      frontDrawn = true;
    };
    for (const glyph of glyphs) {
      if (!interiorDrawn && glyph.depth >= interiorDepth) interior();
      if (!frontDrawn && glyph.depth >= frontDepth) frontMembrane();
      if ("points" in glyph) {
        drawStrand(ctx, glyph, jelly);
        continue;
      }
      ctx.globalAlpha = glyph.alpha;
      drawDotGlyph(
        ctx,
        glyph.char,
        jelly.color,
        glyph.x,
        glyph.y,
        glyph.size,
        jelly.glow,
        glyph.blur,
      );
    }
    if (!interiorDrawn) interior();
    if (!frontDrawn) frontMembrane();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}
