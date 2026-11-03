import { BELL_BASE_Y, bellGlyphs, bellScale } from "./geometry";
import { clamp, type Jellyfish, type Scene } from "./types";
import { drawDotGlyph, drawJellyfishGlow } from "./dotGlyph";

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
  return (point: Point3D) => {
    const x = point.x * cosYaw + point.z * sinYaw;
    const facingDepth = point.z * cosYaw - point.x * sinYaw;
    const y = point.y * cosPitch + facingDepth * sinPitch;
    const depth = facingDepth * cosPitch - point.y * sinPitch;
    const perspective = camera / (camera - depth);
    return {
      x: jelly.x + x * perspective,
      y: jelly.y + y * perspective,
      depth,
      perspective,
      facing: clamp(0.5 + facingDepth / (140 * jelly.scale), 0, 1),
    };
  };
}

export function render(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  density = 1,
) {
  ctx.clearRect(0, 0, scene.width, scene.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = 0;
  for (const jelly of scene.creatures) {
    const scale = bellScale(jelly);
    const projectPoint = createProjection(jelly, scene.time);
    const glowCenter = projectPoint({ x: 0, y: -14 * scale.y, z: 0 });
    drawJellyfishGlow(
      ctx,
      jelly.glow,
      glowCenter.x,
      glowCenter.y,
      190 * scale.x,
      130 * scale.y,
    );
    const glyphs: Glyph[] = [];
    ctx.fillStyle = jelly.color;
    ctx.shadowColor = jelly.glow;
    for (const tentacle of jelly.tentacles) {
      const nodes = tentacle.nodes;
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
        const a = projectPoint(
          { x: start.x - jelly.x, y: start.y - jelly.y, z: start.z },
        );
        const b = projectPoint(
          { x: end.x - jelly.x, y: end.y - jelly.y, z: end.z },
        );
        const segment = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const normalX = -(b.y - a.y) / segment;
        const normalY = (b.x - a.x) / segment;
        for (let k = 0; k < samples; k++) {
          const t = k / samples;
          const progress = (n - 1 + t) / (nodes.length - 1);
          const point = projectPoint(
            {
              x: start.x + (end.x - start.x) * t - jelly.x,
              y: start.y + (end.y - start.y) * t - jelly.y,
              z: start.z + (end.z - start.z) * t,
            },
          );
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
          for (const offset of [-3.6, -1.2, 1.2, 3.6]) {
            glyphs.push({
              char: (n + k) % 5 === 0 ? "square" : (n + k) % 3 === 0 ? "tile" : "dot",
              x: point.x + normalX * offset * width,
              y: point.y + normalY * offset * width,
              depth: point.depth,
              size:
                5.5 * jelly.scale * (0.55 + 0.45 * taper) * point.perspective,
              alpha:
                Math.min(
                  1,
                  (0.8 - progress * 0.25) *
                    1.25 *
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
      if (density < 0.7 && i % 3 === 0 && surface.y !== BELL_BASE_Y)
        continue;
      const point = projectPoint(
        {
          x: surface.x * scale.x,
          y: surface.y * scale.y,
          z: surface.z * scale.x,
        },
      );
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
        size: 10.5 * jelly.scale * point.perspective,
        alpha: Math.min(
          1,
          surface.alpha * 1.2 * (0.22 + point.facing * 0.78) * light,
        ),
        blur: 1,
      });
    }
    // Rear strands and rear surface marks are painted before the foreground.
    glyphs.sort((a, b) => a.depth - b.depth);
    for (const glyph of glyphs) {
      ctx.globalAlpha = glyph.alpha;
      drawDotGlyph(ctx, glyph.char, jelly.color, glyph.x, glyph.y, glyph.size, jelly.glow, glyph.blur);
    }
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}
