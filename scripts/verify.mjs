import { chromium } from "playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
for (const width of [1440, 1280, 1024, 768, 390, 375]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("http://127.0.0.1:4173");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `docs/screenshots/home-${width}.png` });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  results.push({ check: `homepage ${width}px`, pass: !overflow });
  for (
    let y = 0;
    y < (await page.evaluate(() => document.body.scrollHeight));
    y += 1000
  ) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(30);
  }
  if (width === 1440 || width === 390)
    await page.screenshot({
      path: `docs/screenshots/home-${width}-full.png`,
      fullPage: true,
    });
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://127.0.0.1:4173");
await page.getByRole("button", { name: "Use Cases", exact: true }).click();
results.push({
  check: "desktop dropdown opens",
  pass: await page.getByText("Project Management", { exact: true }).isVisible(),
});
await page.keyboard.press("Escape");
results.push({
  check: "dropdown Escape closes",
  pass: (await page.locator("#use-cases-menu").count()) === 0,
});
for (const stage of ["Recording", "Transcription", "People", "Summary"]) {
  await page.getByRole("tab", { name: `Show ${stage}` }).click();
  results.push({
    check: `demo ${stage}`,
    pass:
      (await page
        .getByRole("tab", { name: `Show ${stage}` })
        .getAttribute("aria-selected")) === "true",
  });
}
await page.waitForTimeout(4200);
await page.getByRole("button", { name: "Copy", exact: true }).click();
await page.waitForTimeout(150);
results.push({
  check: "summary copy",
  pass: await page
    .getByRole("button", { name: "Copied!", exact: true })
    .isVisible(),
});
await page.locator("#faq button").first().click();
results.push({
  check: "FAQ expands",
  pass:
    (await page
      .locator("#faq button")
      .first()
      .getAttribute("aria-expanded")) === "true",
});
await page
  .getByRole("button", { name: "Start free trial", exact: true })
  .click();
results.push({
  check: "trial dialog",
  pass: await page.getByRole("dialog").isVisible(),
});
await page.getByRole("button", { name: "Get My License Key" }).click();
results.push({
  check: "required form validation",
  pass: (await page.locator("select:invalid").count()) === 1,
});
await page.locator("dialog select").selectOption({ label: "For myself" });
await page.getByLabel("Your Name *", { exact: true }).fill("Test User");
await page.getByLabel("Email *", { exact: true }).fill("test@example.com");
await page.getByRole("button", { name: "Get My License Key" }).click();
results.push({
  check: "honest unconfigured submission",
  pass: await page.getByRole("status").isVisible(),
});
await page.keyboard.press("Escape");
results.push({
  check: "dialog Escape closes",
  pass: (await page.getByRole("dialog").count()) === 0,
});
await page.setViewportSize({ width: 390, height: 1000 });
await page.getByRole("button", { name: "Toggle menu" }).click();
results.push({
  check: "mobile menu opens",
  pass: await page.locator(".mobile-menu").isVisible(),
});
await page
  .locator(".mobile-menu")
  .getByRole("link", { name: "Pricing", exact: true })
  .click();
await page.waitForURL("**/pricing");
await page.waitForTimeout(100);
results.push({
  check: "mobile navigation",
  pass:
    page.url().endsWith("/pricing") &&
    (await page.locator(".mobile-menu").count()) === 0,
});
await page.setViewportSize({ width: 1440, height: 1000 });
const pages = JSON.parse(await fs.readFile("src/data/pages.json"));
for (const route of Object.keys(pages)) {
  if (route.startsWith("/docs/")) continue;
  await page.goto("http://127.0.0.1:4173" + route);
  await page.waitForTimeout(60);
  const h = await page.locator("h1,h2").first().innerText();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  results.push({ check: `route ${route}`, pass: !!h && !overflow, heading: h });
  if (
    [
      "/pricing",
      "/downloads",
      "/pro",
      "/buy-now",
      "/about",
      "/use-cases/healthcare",
      "/blog/why-we-built-meetily",
    ].includes(route)
  )
    await page.screenshot({
      path: `docs/screenshots/${route.slice(1).replaceAll("/", "--")}.png`,
    });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(30);
  results.push({
    check: `mobile route ${route}`,
    pass: await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
}
await fs.writeFile(
  "docs/validation-results.json",
  JSON.stringify({ date: new Date().toISOString(), results, errors }, null, 2),
);
console.log(
  JSON.stringify(
    { checks: results.length, failed: results.filter((r) => !r.pass), errors },
    null,
    2,
  ),
);
await browser.close();
if (results.some((r) => !r.pass) || errors.length) process.exitCode = 1;
