import { chromium } from "playwright";
import fs from "node:fs/promises";
const pages = JSON.parse(await fs.readFile("src/data/pages.json"));
const hasHeading = (node) =>
  node?.type === "h1" ||
  node?.children?.some((child) => !Array.isArray(child) && hasHeading(child));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
for (const [route, data] of Object.entries(pages)) {
  if (hasHeading(data.blocks) || route.startsWith("/docs/")) continue;
  await page.goto("https://meetily.ai" + route, {
    waitUntil: "domcontentloaded",
  });
  const intro = await page.evaluate(() => {
    const h = document.querySelector("h1");
    if (!h) return null;
    const container = h.closest("header") || h.parentElement;
    return {
      type: "section",
      id: "page-intro",
      children: [
        { type: "h1", text: h.innerText },
        ...[...container.querySelectorAll("p")].map((e) => ({
          type: "p",
          text: e.innerText,
        })),
        ...[...container.querySelectorAll("a")]
          .filter((e) => e.innerText.trim())
          .map((e) => ({
            type: "a",
            text: e.innerText,
            href: e.getAttribute("href"),
          })),
      ],
    };
  });
  if (intro) {
    data.blocks = { type: "div", children: [intro, data.blocks] };
    console.log("Restored page heading", route);
  } else console.log("NO SOURCE H1", route);
}
await fs.writeFile("src/data/pages.json", JSON.stringify(pages, null, 2));
await browser.close();
