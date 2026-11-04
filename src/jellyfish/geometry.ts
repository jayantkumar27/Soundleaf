import { type Scene, type Jellyfish, clamp } from "./types";

const palettes = [
  ["#9BBFFF", "rgba(133, 174, 255, 0.8)"], // Ice blue
  ["#809DE8", "rgba(120, 155, 240, 0.8)"], // Sapphire
  ["#B09CBE", "rgba(191, 157, 220, 0.8)"], // Royal plum
  ["#CFB384", "rgba(235, 196, 132, 0.8)"], // Champagne gold
];
const sizeFactors = [1.1, 0.72, 0.6, 0.9];

function creatureScale(width: number, id: number) {
  const responsiveScale = width < 600 ? 0.72 : width < 1000 ? 1.2 : 1.55;
  return responsiveScale * sizeFactors[id];
}

export const BELL_BASE_Y = 16;
const BELL_RADIUS = 59;

export function bellScale(jelly: Jellyfish) {
  const contraction = Math.sin(jelly.pulse) * 0.5 + 0.5;
  return {
    x: jelly.scale * 1.22 * (1 + contraction * 0.1 - jelly.impulse * 0.12),
    y: jelly.scale * 1.18 * (1 - contraction * 0.13 + jelly.impulse * 0.11),
  };
}

export function tentacleRoot(jelly: Jellyfish, index: number, count: number) {
  const scale = bellScale(jelly);
  const angle = (index / count) * Math.PI * 2 + jelly.phase;
  // A ring of attachments gives the bell both front and rear tentacles.
  return {
    x: jelly.x + Math.cos(angle) * 43 * scale.x,
    y: jelly.y + (BELL_BASE_Y - 10.5) * scale.y,
    z: Math.sin(angle) * 43 * scale.x,
  };
}

export function createScene(width: number, height: number): Scene {
  const creatures: Jellyfish[] = palettes.map(([color, glow], id) => {
    const scale = creatureScale(width, id);
    const x =
      width * (id % 2 ? (width < 600 ? 0.82 : 0.9) : width < 600 ? 0.18 : 0.1);
    const y =
      height * (width < 600 ? (id < 2 ? 0.18 : 0.29) : id < 2 ? 0.24 : 0.76);
    const phase = id * 2.399 + 0.7;
    const jelly: Jellyfish = {
      id,
      x,
      y,
      vx: Math.cos(phase) * 3,
      vy: Math.sin(phase) * 2,
      phase,
      frequency: 0.8 + id * 0.137,
      speed: 27 + id * 6,
      scale,
      color,
      glow,
      pulse: 0,
      proximity: 0,
      response: 0,
      bodyResponse: 0,
      impulse: 0,
      tentacles: [],
    };
    jelly.tentacles = Array.from({ length: 7 + id }, (_, t) => {
      const root = tentacleRoot(jelly, t, 7 + id);
      const length = (140 + 50 * Math.sin(t * 1.8 + id) ** 2) * scale;
      return {
        phase: phase + t * 1.73,
        length,
        nodes: Array.from({ length: 14 }, (_, n) => ({
          x: root.x + Math.sin(n * 0.65 + t) * n * scale * 0.6,
          y: root.y + (n / 13) * length,
          z: root.z,
          vx: 0,
          vy: 0,
          vz: 0,
        })),
      };
    });
    return jelly;
  });
  return { width, height, creatures, time: 0, pointer: null };
}

export function resizeScene(scene: Scene, width: number, height: number) {
  const sx = width / scene.width,
    sy = height / scene.height;
  for (const jelly of scene.creatures) {
    const nextScale = creatureScale(width, jelly.id);
    const oldScale = jelly.scale,
      scaleRatio = nextScale / oldScale;
    jelly.x = clamp(jelly.x * sx, 24 * nextScale, width - 24 * nextScale);
    jelly.y = clamp(jelly.y * sy, 34 * nextScale, height - 34 * nextScale);
    jelly.vx *= sx;
    jelly.vy *= sy;
    jelly.scale = nextScale;
    for (const [index, tentacle] of jelly.tentacles.entries()) {
      const oldRoot = { ...tentacle.nodes[0] };
      const root = tentacleRoot(jelly, index, jelly.tentacles.length);
      tentacle.length *= scaleRatio;
      for (const node of tentacle.nodes) {
        node.x = root.x + (node.x - oldRoot.x) * scaleRatio;
        node.y = root.y + (node.y - oldRoot.y) * scaleRatio;
        node.z = root.z + (node.z - oldRoot.z) * scaleRatio;
        node.vx *= scaleRatio;
        node.vy *= scaleRatio;
        node.vz *= scaleRatio;
      }
    }
  }
  if (scene.pointer) {
    scene.pointer.x *= sx;
    scene.pointer.y *= sy;
  }
  scene.width = width;
  scene.height = height;
}

// One local-space profile for both the membrane and its permanent markings.
// The apex/base envelope and the attachment skirt stay at their original heights.
const bellProfile = [
  [
    [0, -43],
    [18, -43],
    [39, -35],
    [44, -23],
  ],
  [
    [44, -23],
    [49, -11],
    [51, -3],
    [53, 4],
  ],
  [
    [53, 4],
    [54.333, 8.667],
    [58, 9.5],
    [58, 12],
  ],
  [
    [58, 12],
    [58, 14.5],
    [56, 16],
    [55, 16],
  ],
];
export function bellSurfacePoint(polar: number, angle: number) {
  const t = clamp(polar / (Math.PI / 2), 0, 1);
  const section = Math.min(3, Math.floor(t * 4));
  const u = t * 4 - section,
    v = 1 - u;
  const [a, b, c, d] = bellProfile[section];
  const radius =
    (a[0] * v ** 3 +
      3 * b[0] * v * v * u +
      3 * c[0] * v * u * u +
      d[0] * u ** 3) *
    (1 + 0.011 * Math.cos(angle) + 0.005 * Math.sin(angle * 2)) *
    (1 - 0.016 * t ** 10 * (1 - Math.cos(angle * 7)));
  return {
    x: Math.cos(angle) * radius,
    y:
      a[1] * v ** 3 +
      3 * b[1] * v * v * u +
      3 * c[1] * v * u * u +
      d[1] * u ** 3 -
      1.3 * Math.sin(angle * 3) * Math.sin(Math.PI * t) ** 2 * t,
    z: Math.sin(angle) * radius,
  };
}

// Stable identities, now on the same gently shouldered surface as the tissue.
export const bellGlyphs = (() => {
  const points: {
    x: number;
    y: number;
    z: number;
    char: string;
    alpha: number;
  }[] = [];
  const lastRow = 14;
  for (let row = 0; row <= lastRow; row++) {
    const y = BELL_BASE_Y - BELL_RADIUS + (row / lastRow) * BELL_RADIUS;
    const half = Math.sqrt(
      Math.max(0, BELL_RADIUS ** 2 - (y - BELL_BASE_Y) ** 2),
    );
    const columns =
      row === 0 ? 1 : Math.max(10, Math.round((Math.PI * 2 * half) / 7));
    for (let column = 0; column < columns; column++) {
      const angle = (column / columns) * Math.PI * 2;
      const surface = bellSurfacePoint(
        Math.acos((BELL_BASE_Y - y) / BELL_RADIUS),
        angle,
      );
      // Each surface point keeps its shape while the creature moves.
      const texture = (column * 7 + row * 3) % 5;
      const shapes = ["dot", "tile", "square", "dot", "tile"];
      const char = shapes[texture];
      points.push({
        x: surface.x,
        y: surface.y,
        z: surface.z,
        char,
        alpha: row === lastRow ? 0.94 : 0.84,
      });
    }
  }
  return points;
})();
