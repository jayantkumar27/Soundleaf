export interface Vec {
  x: number;
  y: number;
}
export interface Node extends Vec {
  z: number;
  vx: number;
  vy: number;
  vz: number;
}
export interface Tentacle {
  nodes: Node[];
  phase: number;
  length: number;
}
export interface Jellyfish extends Vec {
  id: number;
  vx: number;
  vy: number;
  phase: number;
  frequency: number;
  speed: number;
  scale: number;
  color: string;
  glow: string;
  pulse: number;
  proximity: number;
  response: number;
  bodyResponse: number;
  impulse: number;
  tentacles: Tentacle[];
}
export interface Scene {
  width: number;
  height: number;
  time: number;
  creatures: Jellyfish[];
  pointer: Vec | null;
}
export const STEP = 1 / 120;
export const clamp = (n: number, low: number, high: number) =>
  Math.max(low, Math.min(high, n));
