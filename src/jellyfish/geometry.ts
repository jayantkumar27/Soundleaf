import { type Scene, type Jellyfish, clamp } from "./types";

const palettes = [
  ["#7EB7C5", "rgba(111, 196, 218, 0.8)"], // Silver teal
  ["#8CC5AA", "rgba(120, 218, 173, 0.8)"], // Emerald
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

// Stable glyphs on a hemisphere. Perspective exposes the elliptical underside.
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
      const x = Math.cos(angle) * half;
      const z = Math.sin(angle) * half;
      // Each surface point keeps its shape while the creature moves.
      const texture = (column * 7 + row * 3) % 5;
      const shapes = ["dot", "tile", "square", "dot", "tile"];
      const char = shapes[texture];
      points.push({
        x,
        y,
        z,
        char,
        alpha: row === lastRow ? 0.94 : 0.84,
      });
    }
  }
  return points;
})();
