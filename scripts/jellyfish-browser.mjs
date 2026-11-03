import { chromium } from "playwright";
import fs from "node:fs/promises";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
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
await page.screenshot({ path: "docs/jellyfish/hero-desktop.png" });
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
  const oldArc = ctx.arc;
  ctx.arc = function (...args) {
    window.__arcs.push(args.slice(0, 5));
    return oldArc.apply(this, args);
  };
  ctx.drawImage = function (tile, x, y, width, height) {
    window.__glyphs.push({
      char: tile.dataset.glyph,
      x: x + width / 2,
      y: y + height / 2,
      color: this.fillStyle,
      blur: this.shadowBlur,
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
await page.waitForTimeout(40);
await take();
const rippleArcs = await page.evaluate(() => window.__arcs.length);
await page.screenshot({ path: "docs/jellyfish/interaction-click.png" });
await page.emulateMedia({ reducedMotion: "reduce" });
await page.waitForTimeout(50);
const reducedFirst = (await take()).length;
await page.waitForTimeout(100);
const reducedSecond = (await take()).length;
const mobilePage = await browser.newPage({
  viewport: { width: 390, height: 844 },
});
await mobilePage.goto("http://localhost:4173/");
await mobilePage.waitForTimeout(400);
await mobilePage.screenshot({ path: "docs/jellyfish/hero-mobile.png" });
const mobile = await mobilePage.evaluate(() => ({
  width: document.documentElement.scrollWidth,
  viewport: innerWidth,
  canvasCount: document.querySelectorAll(".hero canvas").length,
  canvasHeight: document
    .querySelector(".hero .jellyfish-canvas")
    .getBoundingClientRect().height,
}));
await mobilePage.close();
await page.goto("http://localhost:4173/pricing");
const cleanup = (await page.locator(".jellyfish-canvas").count()) === 0;
const results = {
  geometry,
  uniquePalettes: colors.size,
  independentMotion,
  glyphsStableWhileMoving,
  movementGlow: firstFrame.some((g) => g.blur > 2),
  hoverKeepsGlow:
    hover.length > 0 && glyphSignature(hover) === glyphSignature(firstFrame),
  rippleArcs,
  ripplesRemoved: rippleArcs === 0,
  reducedMotionStopsFrames: reducedFirst > 0 && reducedSecond === 0,
  mobile,
  cleanup,
  errors,
};
await fs.writeFile(
  "docs/jellyfish/browser-results.json",
  JSON.stringify(results, null, 2) + "\n",
);
console.log(JSON.stringify(results, null, 2));
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
  mobile.width !== mobile.viewport ||
  mobile.canvasCount !== 1 ||
  !cleanup ||
  errors.length
)
  process.exitCode = 1;
