import { chromium } from "playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("https://meetily.ai/");
await page.waitForTimeout(400);
const detail = await page.evaluate(() => {
  const heading = document.querySelector("h1");
  let proof = heading.parentElement.previousElementSibling;
  return {
    proof: proof?.outerHTML,
    scene: [...document.querySelectorAll("h3")].find(
      (x) => x.textContent === "The full meeting workflow, 100% local",
    )?.parentElement.parentElement.className,
  };
});
await fs.writeFile("docs/reference/hero-proof.txt", detail.proof || "");
console.log("SCENE", detail.scene);
const svg = await page.evaluate(() => {
  const h = document.querySelector("h1");
  const proof = h.parentElement.previousElementSibling;
  return [...(proof?.querySelectorAll("svg") || [])]
    .filter((x) => x.querySelectorAll("path").length > 3)
    .map((x) => x.outerHTML);
});
if (svg[0]) {
  await fs.writeFile("public/assets/laurel.svg", svg[0]);
  console.log("Laurel saved");
}
await page.goto("https://meetily.ai/pro");
await page.waitForTimeout(500);
console.log(
  "MEDIA",
  await page.evaluate(() => ({
    iframes: [...document.querySelectorAll("iframe")].map((e) => e.src),
    videos: [...document.querySelectorAll("video")].map((e) => ({
      src: e.src,
      poster: e.poster,
    })),
    buttons: [...document.querySelectorAll("button")]
      .map((e) => ({ text: e.innerText, aria: e.getAttribute("aria-label") }))
      .filter((x) => /play|video/i.test(x.aria + " " + x.text)),
    images: [...document.images].slice(0, 5).map((e) => e.src),
  })),
);
console.log(
  "IMAGE PARENT",
  await page
    .locator("img")
    .first()
    .evaluate((e) => e.parentElement.outerHTML.slice(0, 4000)),
);
await page.locator("img").first().click();
await page.waitForTimeout(1500);
console.log(
  "PLAY",
  await page.evaluate(() =>
    [...document.querySelectorAll("iframe,video")].map((e) => e.src),
  ),
);
await browser.close();
