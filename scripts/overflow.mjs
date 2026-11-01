import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const route of [
  "/use-cases/healthcare",
  "/llm-privacy/openai",
  "/llm-privacy/llama-cpp",
]) {
  await page.goto("http://127.0.0.1:4173" + route);
  await page.locator("h1,h2").first().waitFor();
  console.log(
    route,
    await page.evaluate(() =>
      [...document.querySelectorAll("main *")]
        .filter((e) => e.getBoundingClientRect().right > innerWidth + 2)
        .map((e) => ({
          tag: e.tagName,
          cls: e.className,
          text: e.textContent.slice(0, 70),
          width: e.getBoundingClientRect().width,
          right: e.getBoundingClientRect().right,
        }))
        .slice(-15),
    ),
  );
  await page.screenshot({
    path: `docs/screenshots/overflow-${route.replaceAll("/", "-")}.png`,
  });
}
await browser.close();
