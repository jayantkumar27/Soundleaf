import { chromium } from "playwright";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// Verification artifacts are not source files or historical checked-in evidence.
const output =
  process.env.JELLYFISH_CAPTURE_DIR ||
  (await fs.mkdtemp(path.join(os.tmpdir(), "jellyfish-browser-")));
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
await page.goto("http://localhost:4173/");
await page.waitForTimeout(500);
const geometry = await page.evaluate(() => {
  const c = document.querySelector(".hero .jellyfish-canvas");
  const r = c.getBoundingClientRect();
  const h = document.querySelector(".hero h1").getBoundingClientRect();
  return {
    canvasCount: document.querySelectorAll(".hero canvas").length,
    canvas: { x: r.x, y: r.y, width: r.width, height: r.height },
    heading: { x: h.x, y: h.y, width: h.width, height: h.height },
    initialBackground: getComputedStyle(document.querySelector(".hero"))
      .backgroundColor,
  };
});
await page.screenshot({ path: path.join(output, "hero-desktop.png") });
await page.evaluate(() => {
  const ctx = document
      .querySelector(".hero .jellyfish-canvas")
      .getContext("2d"),
    old = ctx.drawImage;
  window.__glyphs = [];
  window.__frames = [];
  const oldClear = ctx.clearRect;
  ctx.clearRect = function (...args) {
    if (window.__glyphs.length) window.__frames.push(window.__glyphs.splice(0));
    if (window.__frames.length > 3) window.__frames.shift();
    return oldClear.apply(this, args);
  };
  window.__arcs = [];
  window.__frameNumber = 0;
  window.__cachedGlow = false;
  const inspected = new WeakSet();
  const clear = ctx.clearRect;
  ctx.clearRect = function (...args) {
    window.__frameNumber++;
    return clear.apply(this, args);
  };
  const oldArc = ctx.arc;
  ctx.arc = function (...args) {
    window.__arcs.push({
      frame: window.__frameNumber,
      args: args.slice(0, 5),
      alpha: this.globalAlpha,
    });
    return oldArc.apply(this, args);
  };
  ctx.drawImage = function (tile, x, y, width, height) {
    if (!tile.dataset.glyph) return old.call(this, tile, x, y, width, height);
    // The glow is baked into the sprite, not set on the live canvas context.
    const glow = Number(tile.dataset.glow);
    if (glow > 0 && !inspected.has(tile)) {
      inspected.add(tile);
      // This pixel is outside all three glyph shapes, in the cached glow only.
      window.__cachedGlow ||=
        tile.getContext("2d").getImageData(22, 42, 1, 1).data[3] > 0;
    }
    window.__glyphs.push({
      char: tile.dataset.glyph,
      x: x + width / 2,
      y: y + height / 2,
      color: tile.dataset.color || tile.getContext("2d").fillStyle,
      blur: glow,
      alpha: this.globalAlpha,
    });
    return old.call(this, tile, x, y, width, height);
  };
});
const take = () => page.evaluate(() => window.__frames.splice(0).at(-1) || []);
const centers = (points) => {
  const groups = new Map();
  for (const p of points) {
    const v = groups.get(p.color) || { x: 0, y: 0, n: 0 };
    v.x += p.x;
    v.y += p.y;
    v.n++;
    groups.set(p.color, v);
  }
  return new Map(
    [...groups].map(([c, v]) => [c, { x: v.x / v.n, y: v.y / v.n }]),
  );
};
await page.waitForFunction(() => window.__frames.length >= 2);
const firstFrame = await take();
const first = centers(firstFrame);
await page.waitForTimeout(500);
const secondFrame = await take();
const second = centers(secondFrame);
const independentMotion =
  first.size === 4 &&
  [...second].every(([color, p]) => {
    const q = first.get(color);
    return q && Math.hypot(p.x - q.x, p.y - q.y) > 0.15;
  });
// Depth sorting changes draw order without changing the characters themselves.
const glyphSignature = (frame) =>
  frame
    .map((g) => `${g.color}:${g.char}:${g.blur}`)
    .sort()
    .join("|");
const glyphsStableWhileMoving =
  firstFrame.length > 0 &&
  glyphSignature(firstFrame) === glyphSignature(secondFrame);
const colors = new Set(first.keys()),
  hero = geometry.canvas;
await page.mouse.move(hero.x + hero.width * 0.1, hero.y + hero.height * 0.24);
await page.waitForTimeout(350);
const hover = await take();
await page.evaluate(() => (window.__arcs = []));
await page.mouse.click(hero.x + hero.width * 0.1, hero.y + hero.height * 0.24);
await page.waitForTimeout(450);
await take();
// Organic geometry may use arcs. A ripple is a growing circle fixed at the click,
// across successive frames; counting unrelated arc calls cannot establish that.
const expandingClickRipple = await page.evaluate(
  ({ x, y }) => {
    const radii = new Map();
    for (const {
      frame,
      args: [cx, cy, radius, start, end],
      alpha,
    } of window.__arcs) {
      if (
        Math.hypot(cx - x, cy - y) < 2 &&
        end - start >= Math.PI * 1.9 &&
        alpha > 0
      )
        radii.set(frame, Math.max(radii.get(frame) || 0, radius));
    }
    const samples = [...radii.values()];
    return (
      samples.length >= 3 &&
      samples.at(-1) - samples[0] > 8 &&
      samples.every((r, i) => i === 0 || r >= samples[i - 1] - 0.5)
    );
  },
  { x: hero.width * 0.1, y: hero.height * 0.24 },
);
await page.screenshot({ path: path.join(output, "interaction-click.png") });
const beforeReduced = await page.evaluate(() => window.__frameNumber);
await page.emulateMedia({ reducedMotion: "reduce" });
// Wait for the actual static redraw, then count completed clears directly.
// Buffered glyph frames and a fixed 50ms delay can race the media-change event.
await page.waitForFunction(
  (before) =>
    matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.__frameNumber > before,
  beforeReduced,
);
const reducedFrame = await page.evaluate(() => window.__frameNumber);
await page.waitForTimeout(100);
const reducedMotionStopsFrames = await page.evaluate(
  (frame) => window.__frameNumber === frame && window.__glyphs.length > 0,
  reducedFrame,
);
await page.mouse.move(hero.x + hero.width * 0.15, hero.y + hero.height * 0.26);
await page.waitForFunction(
  (frame) => window.__frameNumber > frame,
  reducedFrame,
);
const interactionFrame = await page.evaluate(() => window.__frameNumber);
await page.waitForTimeout(100);
const reducedMotionInteraction = await page.evaluate(
  (frame) => window.__frameNumber === frame,
  interactionFrame,
);
const mobilePage = await browser.newPage({
  viewport: { width: 390, height: 844 },
});
mobilePage.on("pageerror", (e) => errors.push(e.message));
mobilePage.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
await mobilePage.goto("http://localhost:4173/");
await mobilePage.waitForTimeout(400);
await mobilePage.screenshot({ path: path.join(output, "hero-mobile.png") });
const mobile = await mobilePage.evaluate(() => ({
  width: document.documentElement.scrollWidth,
  viewport: innerWidth,
  canvasCount: document.querySelectorAll(".hero canvas").length,
  canvasHeight: document
    .querySelector(".hero .jellyfish-canvas")
    .getBoundingClientRect().height,
}));
await mobilePage.close();
// /pricing redirects home and therefore cannot prove component cleanup.
// Mount the real component independently, track its own resources, then unmount.
await page.locator("#root").evaluate((root) => {
  root.style.display = "none";
});
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.waitForTimeout(150);
await page.evaluate(async () => {
  const { default: React } = await import("/node_modules/.vite/deps/react.js");
  const { default: ReactDOM } =
    await import("/node_modules/.vite/deps/react-dom_client.js");
  const { default: JellyfishCanvas } =
    await import("/src/jellyfish/JellyfishCanvas.tsx");
  const host = document.createElement("div");
  host.style.cssText = "position:relative;width:800px;height:600px";
  document.body.prepend(host);
  const root = ReactDOM.createRoot(host);
  const state = {
    draws: 0,
    pending: new Set(),
    observers: new Set(),
    listeners: [],
  };
  const raf = window.requestAnimationFrame,
    cancel = window.cancelAnimationFrame;
  window.requestAnimationFrame = (callback) => {
    const id = raf.call(window, (time) => {
      state.pending.delete(id);
      callback(time);
    });
    state.pending.add(id);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    state.pending.delete(id);
    cancel.call(window, id);
  };
  for (const name of ["ResizeObserver", "IntersectionObserver"]) {
    const Native = window[name];
    window[name] = class extends Native {
      observe(...args) {
        state.observers.add(this);
        return super.observe(...args);
      }
      disconnect() {
        state.observers.delete(this);
        return super.disconnect();
      }
    };
  }
  const add = EventTarget.prototype.addEventListener,
    remove = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (
      (this === host &&
        ["pointermove", "pointerleave", "pointerdown"].includes(type)) ||
      (this === document && type === "visibilitychange") ||
      (this instanceof MediaQueryList && type === "change")
    )
      state.listeners.push({ target: this, type, listener });
    return add.call(this, type, listener, options);
  };
  EventTarget.prototype.removeEventListener = function (
    type,
    listener,
    options,
  ) {
    state.listeners = state.listeners.filter(
      (item) =>
        item.target !== this ||
        item.type !== type ||
        item.listener !== listener,
    );
    return remove.call(this, type, listener, options);
  };
  const clear = CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    if (this.canvas.parentElement === host) state.draws++;
    return clear.apply(this, args);
  };
  window.__fixture = { root, host, state };
  root.render(React.createElement(JellyfishCanvas));
});
await page.waitForFunction(() => window.__fixture.state.draws > 3);
const mountedResources = await page.evaluate(() => {
  const { state } = window.__fixture;
  return {
    observers: state.observers.size,
    listeners: state.listeners.length,
    pending: state.pending.size,
  };
});
await page.evaluate(() => {
  Object.defineProperty(document, "hidden", {
    configurable: true,
    get: () => true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
});
const hiddenFrames = await page.evaluate(() => window.__fixture.state.draws);
await page.waitForTimeout(180);
const visibilityPauses = await page.evaluate(
  (n) =>
    window.__fixture.state.draws === n &&
    window.__fixture.state.pending.size === 0,
  hiddenFrames,
);
await page.evaluate(() => {
  delete document.hidden;
  document.dispatchEvent(new Event("visibilitychange"));
});
await page.waitForFunction(
  (n) => window.__fixture.state.draws > n,
  hiddenFrames,
);
await page.evaluate(() => {
  window.__fixture.host.style.display = "none";
});
await page.waitForTimeout(180);
const offscreenFrames = await page.evaluate(() => window.__fixture.state.draws);
await page.waitForTimeout(180);
const intersectionPauses = await page.evaluate(
  (n) =>
    window.__fixture.state.draws === n &&
    window.__fixture.state.pending.size === 0,
  offscreenFrames,
);
await page.evaluate(() => {
  window.__fixture.host.style.display = "block";
});
await page.waitForFunction(
  (n) => window.__fixture.state.draws > n,
  offscreenFrames,
);
await page.evaluate(() => window.__fixture.root.unmount());
const unmountedFrames = await page.evaluate(() => window.__fixture.state.draws);
await page.waitForTimeout(180);
const cleanup = await page.evaluate((n) => {
  const { host, state } = window.__fixture;
  return (
    !host.querySelector("canvas") &&
    state.draws === n &&
    !state.pending.size &&
    !state.observers.size &&
    !state.listeners.length
  );
}, unmountedFrames);
const canvasStateRestored = await page.evaluate(async () => {
  const { render } = await import("/src/jellyfish/render.ts");
  const { createScene } = await import("/src/jellyfish/geometry.ts");
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(1.25, 1.25);
  ctx.globalAlpha = 0.42;
  ctx.globalCompositeOperation = "multiply";
  ctx.filter = "opacity(80%)";
  ctx.shadowBlur = 3;
  ctx.fillStyle = "#123456";
  ctx.beginPath();
  ctx.rect(0, 0, 5, 5);
  ctx.clip();
  const read = () =>
    JSON.stringify([
      ctx.globalAlpha,
      ctx.globalCompositeOperation,
      ctx.filter,
      ctx.shadowBlur,
      ctx.fillStyle,
      Array.from(ctx.getTransform().toFloat64Array()),
    ]);
  const before = read();
  render(ctx, createScene(200, 200));
  const same = before === read();
  ctx.fillRect(20, 20, 1, 1);
  const clipRetained = ctx.getImageData(25, 25, 1, 1).data[3] === 0;
  ctx.restore();
  ctx.fillRect(25, 25, 1, 1);
  return same && clipRetained && ctx.getImageData(25, 25, 1, 1).data[3] > 0;
});
const results = {
  geometry,
  uniquePalettes: colors.size,
  independentMotion,
  glyphsStableWhileMoving,
  movementGlow:
    (await page.evaluate(() => window.__cachedGlow)) &&
    firstFrame.some((g) => g.blur > 0 && g.alpha > 0.25),
  hoverKeepsGlow:
    hover.length > 0 && glyphSignature(hover) === glyphSignature(firstFrame),
  expandingClickRipple,
  ripplesRemoved: !expandingClickRipple,
  reducedMotionStopsFrames,
  reducedMotionInteraction,
  mobile,
  cleanup,
  mountedResources,
  visibilityPauses,
  intersectionPauses,
  canvasStateRestored,
  errors,
};
await fs.writeFile(
  path.join(output, "browser-results.json"),
  JSON.stringify(results, null, 2) + "\n",
);
console.log(JSON.stringify(results, null, 2));
console.log(`Captures: ${output}`);
await browser.close();
if (
  geometry.canvasCount !== 1 ||
  colors.size !== 4 ||
  !independentMotion ||
  !glyphsStableWhileMoving ||
  !results.movementGlow ||
  !results.hoverKeepsGlow ||
  !results.ripplesRemoved ||
  !results.reducedMotionStopsFrames ||
  !reducedMotionInteraction ||
  mobile.width !== mobile.viewport ||
  mobile.canvasCount !== 1 ||
  !cleanup ||
  mountedResources.observers !== 2 ||
  mountedResources.listeners !== 5 ||
  mountedResources.pending !== 1 ||
  !visibilityPauses ||
  !intersectionPauses ||
  !canvasStateRestored ||
  errors.length
)
  process.exitCode = 1;
