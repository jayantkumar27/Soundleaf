// Geometric particles are baked into sprites once per color and glow level.
const atlases = new WeakMap<Document, Map<string, HTMLCanvasElement>>();
const halos = new WeakMap<Document, Map<string, HTMLCanvasElement>>();
const tissues = new WeakMap<Document, Map<string, HTMLCanvasElement>>();

// Normalized absorption and directional light, cached only by the four palettes.
// The renderer clips this material to the actual projected 3D surface.
export function drawBellTissue(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const document = ctx.canvas.ownerDocument;
  let cache = tissues.get(document);
  if (!cache) {
    cache = new Map();
    tissues.set(document, cache);
  }
  let tissue = cache.get(color);
  if (!tissue) {
    tissue = document.createElement("canvas");
    tissue.width = tissue.height = 256;
    const ink = tissue.getContext("2d");
    if (!ink) return;
    const absorption = ink.createRadialGradient(130, 100, 20, 128, 110, 170);
    absorption.addColorStop(0, `${color}08`);
    absorption.addColorStop(0.55, `${color}18`);
    absorption.addColorStop(0.88, `${color}40`);
    absorption.addColorStop(1, `${color}16`);
    ink.fillStyle = absorption;
    ink.fillRect(0, 0, 256, 256);
    const light = ink.createLinearGradient(30, 10, 180, 240);
    light.addColorStop(0, `${color}36`);
    light.addColorStop(0.45, `${color}10`);
    light.addColorStop(1, `${color}00`);
    ink.fillStyle = light;
    ink.fillRect(0, 0, 256, 256);
    // A small palette-colored backlight suggests light passing through tissue.
    // This is a visual cue, not a physical scattering or refraction model.
    const sheen = ink.createRadialGradient(78, 44, 0, 98, 65, 112);
    sheen.addColorStop(0, `${color}24`);
    sheen.addColorStop(0.35, `${color}12`);
    sheen.addColorStop(1, `${color}00`);
    ink.globalCompositeOperation = "screen";
    ink.fillStyle = sheen;
    ink.fillRect(0, 0, 256, 256);
    cache.set(color, tissue);
  }
  ctx.drawImage(tissue, x, y, width, height);
}

export function drawJellyfishGlow(
  ctx: CanvasRenderingContext2D,
  glow: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const document = ctx.canvas.ownerDocument;
  let cache = halos.get(document);
  if (!cache) {
    cache = new Map();
    halos.set(document, cache);
  }
  let halo = cache.get(glow);
  if (!halo) {
    halo = document.createElement("canvas");
    halo.width = halo.height = 256;
    const ink = halo.getContext("2d");
    if (!ink) return;
    // An asymptotic falloff reaches zero before the cached sprite boundary.
    // The same bounded resource supplies independent near and atmospheric light.
    const light = ink.createRadialGradient(128, 128, 0, 128, 128, 128);
    const faded = (alpha: number) => glow.replace(/[\d.]+\)$/, `${alpha})`);
    light.addColorStop(0, glow);
    light.addColorStop(0.16, faded(0.66));
    light.addColorStop(0.38, faded(0.38));
    light.addColorStop(0.65, faded(0.1));
    light.addColorStop(0.85, faded(0.014));
    light.addColorStop(1, "transparent");
    ink.fillStyle = light;
    ink.fillRect(0, 0, 256, 256);
    cache.set(glow, halo);
  }
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.16;
  ctx.drawImage(
    halo,
    x - width * 0.75,
    y - height * 0.8,
    width * 1.5,
    height * 1.6,
  );
  ctx.globalAlpha = 0.44;
  ctx.drawImage(
    halo,
    x - width * 0.51,
    y - height * 0.525,
    width * 1.02,
    height * 1.05,
  );
  ctx.restore();
}

export function drawDotGlyph(
  ctx: CanvasRenderingContext2D,
  char: string,
  color: string,
  x: number,
  y: number,
  size: number,
  glow: string,
  blur: number,
) {
  const document = ctx.canvas.ownerDocument;
  let atlas = atlases.get(document);
  if (!atlas) {
    atlas = new Map();
    atlases.set(document, atlas);
  }
  // Scale the cached glow with the glyph; perspective must not switch tiles.
  const softness = blur > 0 ? 12 : 0;
  const key = `${color}:${char}:${glow}:${softness}`;
  let tile = atlas.get(key);
  if (!tile) {
    tile = document.createElement("canvas");
    tile.width = 72;
    tile.height = 84;
    tile.dataset.glyph = char;
    tile.dataset.glow = String(softness);
    tile.dataset.color = color;
    const ink = tile.getContext("2d");
    if (!ink) return;
    ink.fillStyle = color;
    ink.shadowColor = glow;
    ink.shadowBlur = softness;
    ink.beginPath();
    if (char === "tile") {
      ink.fillRect(26, 32, 20, 20);
    } else if (char === "square") {
      ink.strokeStyle = color;
      ink.lineWidth = 3;
      ink.strokeRect(26, 32, 20, 20);
    } else {
      ink.arc(36, 42, 8, 0, Math.PI * 2);
      ink.fill();
    }
    atlas.set(key, tile);
  }
  // Bake glow once rather than running a blur for every glyph on every frame.
  const width = (size * 72) / 48,
    height = (size * 84) / 48;
  ctx.drawImage(tile, x - width / 2, y - height / 2, width, height);
}
