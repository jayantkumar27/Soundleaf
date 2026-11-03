import {
  clamp,
  STEP,
  type Jellyfish,
  type Scene,
  type Tentacle,
} from "./types";
import { tentacleRoot } from "./geometry";

function unit(seed: number, t: number) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  const phase = (s - Math.floor(s)) * Math.PI * 2;
  return Math.sin(phase + t) * 0.64 + Math.sin(phase * 0.73 + t * 0.57) * 0.36;
}
export function updateTentacle(
  tentacle: Tentacle,
  jelly: Jellyfish,
  time: number,
  dt: number,
) {
  const nodes = tentacle.nodes;
  const count = nodes.length - 1;
  const index = Math.round((tentacle.phase - jelly.phase) / 1.73);
  const {
    x: rootX,
    y: rootY,
    z: rootZ,
  } = tentacleRoot(jelly, index, jelly.tentacles.length);
  nodes[0].x = rootX;
  nodes[0].y = rootY;
  nodes[0].z = rootZ;
  for (let i = 1; i <= count; i++) {
    const node = nodes[i],
      parent = nodes[i - 1];
    const rest = tentacle.length / count;
    const progress = i / count;
    const flexibility = progress ** 1.15;
    // Travel down the strand with a delayed, wider sweep toward the free tip.
    const wave = time * 2.05 + tentacle.phase - progress * 4.3;
    const sway =
      (Math.sin(wave) * 26 +
        Math.sin(time * 0.85 + jelly.phase - progress * 2.2) * 9) *
      flexibility *
      (1 + jelly.response * 0.25) *
      jelly.scale;
    const desiredX = rootX + sway - jelly.vx * 0.16 * flexibility;
    const desiredY =
      rootY + rest * i + Math.cos(wave) * 3.5 * flexibility * jelly.scale;
    const desiredZ =
      rootZ + Math.cos(wave + 1.2) * 14 * flexibility * jelly.scale;
    const spring = 26,
      damping = 8;
    node.vx +=
      ((desiredX - node.x) * spring + jelly.vx * 0.08 - node.vx * damping) * dt;
    node.vy +=
      ((desiredY - node.y) * spring +
        jelly.vy * (0.1 + i * 0.025) -
        node.vy * damping) *
      dt;
    node.x += node.vx * dt;
    node.y += node.vy * dt;
    node.vz += ((desiredZ - node.z) * spring - node.vz * damping) * dt;
    node.z += node.vz * dt;
    // Preserve node spacing without removing the elastic side-to-side response.
    const dx = node.x - parent.x,
      dy = node.y - parent.y,
      dz = node.z - parent.z;
    const distance = Math.hypot(dx, dy, dz) || 1;
    if (distance > rest * 1.55) {
      node.x = parent.x + (dx / distance) * rest * 1.55;
      node.y = parent.y + (dy / distance) * rest * 1.55;
      node.z = parent.z + (dz / distance) * rest * 1.55;
    }
  }
}
export function step(scene: Scene, dt = STEP) {
  scene.time += dt;
  const { width, height, pointer } = scene;
  for (const jelly of scene.creatures) {
    const t = scene.time * jelly.frequency;
    jelly.pulse += dt * jelly.frequency * (Math.PI * 2);
    const marginX = Math.min(86 * jelly.scale, width * 0.15),
      marginY = Math.min(180 * jelly.scale, height * 0.27);
    let ax =
      unit(jelly.id + 5, t * 0.72) * 42 + Math.sin(t * 0.31 + jelly.phase) * 16;
    let ay = unit(jelly.id + 15, t * 0.58 + 7) * 28;
    const wanderX =
      width * 0.5 +
      unit(jelly.id + 37, scene.time * (0.14 + jelly.id * 0.008)) *
        width *
        0.42;
    const wanderY =
      height * 0.5 +
      Math.sin(scene.time * (0.11 + jelly.id * 0.013) + jelly.phase) *
        height *
        0.38;
    ax += (wanderX - jelly.x) * 0.06;
    ay += (wanderY - jelly.y) * 0.07;
    for (const other of scene.creatures) {
      if (other === jelly) continue;
      const dx = jelly.x - other.x;
      const dy = jelly.y - other.y;
      const distance = Math.hypot(dx, dy);
      const separation = 117.5 * (jelly.scale + other.scale);
      if (distance < separation) {
        const proximity = 1 - distance / separation;
        const angle = distance > 0.01 ? Math.atan2(dy, dx) : jelly.phase;
        const turnAway = proximity * 900;
        ax += Math.cos(angle) * turnAway;
        ay += Math.sin(angle) * turnAway;
      }
    }
    if (jelly.x < marginX) ax += (marginX - jelly.x) * 0.16;
    if (jelly.x > width - marginX) ax -= (jelly.x - (width - marginX)) * 0.16;
    if (jelly.y < marginY) ay += (marginY - jelly.y) * 0.13;
    if (jelly.y > height - marginY) ay -= (jelly.y - (height - marginY)) * 0.13;
    jelly.proximity = 0;
    if (pointer) {
      const dx = jelly.x - pointer.x,
        dy = jelly.y - pointer.y,
        d = Math.hypot(dx, dy);
      const p = 1 - clamp(d / (175 * jelly.scale), 0, 1);
      jelly.proximity = p * p * (3 - 2 * p);
      if (d < 145 && d > 0.01) {
        const repel = jelly.bodyResponse * 13;
        ax += (dx / d) * repel;
        ay += (dy / d) * repel;
      }
    }
    jelly.response += (jelly.proximity - jelly.response) * Math.min(1, dt * 9);
    jelly.bodyResponse +=
      (jelly.response - jelly.bodyResponse) * Math.min(1, dt * 2.2);
    jelly.impulse *= Math.exp(-dt * 2.1);
    jelly.vx += ax * dt;
    jelly.vy += ay * dt;
    jelly.vx *= Math.exp(-dt * 0.62);
    jelly.vy *= Math.exp(-dt * 0.62);
    const max = jelly.speed * jelly.scale;
    const velocity = Math.hypot(jelly.vx, jelly.vy);
    if (velocity > max) {
      jelly.vx = (jelly.vx / velocity) * max;
      jelly.vy = (jelly.vy / velocity) * max;
    }
    jelly.x = clamp(jelly.x + jelly.vx * dt, marginX, width - marginX);
    jelly.y = clamp(jelly.y + jelly.vy * dt, marginY, height - marginY);
    jelly.tentacles.forEach((t) => updateTentacle(t, jelly, scene.time, dt));
  }
}
export function advance(scene: Scene, accumulator: number, elapsed: number) {
  accumulator = Math.min(accumulator + Math.min(elapsed, 0.05), 0.05);
  while (accumulator >= STEP) {
    step(scene, STEP);
    accumulator -= STEP;
  }
  return accumulator;
}
export function disturb(scene: Scene, x: number, y: number) {
  for (const jelly of scene.creatures) {
    const dx = jelly.x - x,
      dy = jelly.y - y,
      d = Math.hypot(dx, dy);
    if (d < 420) {
      const force = 13 * (1 - d / 420);
      const nx = d > 0.01 ? dx / d : Math.cos(jelly.phase);
      const ny = d > 0.01 ? dy / d : Math.sin(jelly.phase);
      if (d > 0.01) {
        jelly.vx += nx * force;
        jelly.vy += ny * force;
      }
      jelly.impulse = Math.max(jelly.impulse, 1 - d / 420);
      for (const t of jelly.tentacles)
        for (let n = 1; n < t.nodes.length; n++) {
          t.nodes[n].vx += nx * force * (1 - n / t.nodes.length) * 0.8;
          t.nodes[n].vy += ny * force * (1 - n / t.nodes.length) * 0.35;
        }
    }
  }
}
