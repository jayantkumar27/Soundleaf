import { chromium } from "playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:4173/scripts/jellyfish-preview.html");
await page.waitForTimeout(800);
await fs.mkdir("docs/jellyfish", { recursive: true });
await page.screenshot({ path: "docs/jellyfish/static-desktop.png" });
console.log({ canvas: await page.locator("canvas").count(), errors });
await browser.close();
if (errors.length) process.exitCode = 1;
