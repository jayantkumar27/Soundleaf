import { chromium } from "playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("https://meetily.ai/");
await page
  .getByRole("button", { name: "Use Cases", exact: true })
  .first()
  .click();
console.log(
  "DROPDOWN",
  await page
    .locator("header a")
    .evaluateAll((a) =>
      a.map((x) => ({ text: x.textContent, href: x.getAttribute("href") })),
    ),
);
const pages = JSON.parse(await fs.readFile("src/data/pages.json"));
for (const route of [
  "/pricing",
  "/buy-now",
  "/pro",
  "/downloads",
  "/about",
  "/use-cases/healthcare",
  "/blog",
]) {
  const p = pages[route];
  console.log("\n", route);
  console.log(
    p.sections
      .map((s) => s.text)
      .join("\n")
      .slice(0, 20000),
  );
}
await browser.close();
