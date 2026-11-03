// Geometric particles are baked into sprites once per color and glow level.
const atlases = new WeakMap<Document, Map<string, HTMLCanvasElement>>();
const halos = new WeakMap<Document, Map<string, HTMLCanvasElement>>();

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
    // A soft falloff adds light without a visible shell around the bell.
    const light = ink.createRadialGradient(128, 128, 0, 128, 128, 128);
    light.addColorStop(0, glow);
    light.addColorStop(0.3, glow);
    light.addColorStop(1, "transparent");
    ink.fillStyle = light;
    ink.fillRect(0, 0, 256, 256);
    cache.set(glow, halo);
  }
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(halo, x - width / 2, y - height / 2, width, height);
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
