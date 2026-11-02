import { chromium } from "playwright";
import { config } from "../src/data/config.js";

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
const results = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  for (const width of [1440, 1280, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("http://127.0.0.1:4173");
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    results.push({ check: `homepage ${width}px`, pass: !overflow });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:4173");
  results.push({
    check: "single homepage heading",
    pass: (await page.locator("h1").count()) === 1,
  });
  results.push({
    check: "MeetScribe branding",
    pass:
      (await page.title()).startsWith("MeetScribe") &&
      (await page.locator(".wordmark").first().innerText()) === "MeetScribe" &&
      !/meetily/i.test(await page.locator("body").innerText()),
  });
  results.push({
    check: "Windows installer link",
    pass: await page
      .locator("#download")
      .getByRole("link", { name: "Windows x64 (.exe)" })
      .getAttribute("href")
      .then((href) => href === config.downloads.windows),
  });
  results.push({
    check: "macOS installer link",
    pass: await page
      .locator("#download")
      .getByRole("link", { name: "macOS Apple Silicon (.dmg)" })
      .getAttribute("href")
      .then((href) => href === config.downloads.macOS),
  });
  results.push({
    check: "single-page navigation",
    pass:
      (await page.locator('.desktop-links a[href^="/"]').count()) === 0 &&
      (await page.locator('.desktop-links a[href="#workflow"]').innerText()) ===
        "How it works" &&
      (await page.locator('.desktop-links a[href="#features"]').innerText()) ===
        "Features",
  });
  results.push({
    check: "FAQ space removed",
    pass: (await page.locator("#faq, .faq-section").count()) === 0,
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
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await page.waitForTimeout(100);
  results.push({
    check: "summary copy",
    pass: await page
      .getByRole("button", { name: "Copied!", exact: true })
      .isVisible(),
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle menu" }).click();
  results.push({
    check: "mobile menu opens",
    pass: await page.locator(".mobile-menu").isVisible(),
  });
  results.push({
    check: "mobile menu has section links",
    pass:
      (await page
        .locator(".mobile-menu")
        .getByRole("link", { name: "How it works", exact: true })
        .count()) === 1 &&
      (await page
        .locator(".mobile-menu")
        .getByRole("link", { name: "Features", exact: true })
        .count()) === 1,
  });
  await page
    .locator(".mobile-menu")
    .getByRole("link", { name: "Features", exact: true })
    .click();
  results.push({
    check: "mobile anchor navigation",
    pass:
      page.url().endsWith("#features") &&
      (await page.locator(".mobile-menu").count()) === 0,
  });

  await page.goto("http://127.0.0.1:4173/pricing");
  await page.waitForURL("http://127.0.0.1:4173/");
  results.push({
    check: "removed pages redirect home",
    pass: page.url() === "http://127.0.0.1:4173/",
  });
} finally {
  await browser.close();
}

console.log(
  JSON.stringify(
    { checks: results.length, failed: results.filter((result) => !result.pass), errors },
    null,
    2,
  ),
);
if (results.some((result) => !result.pass) || errors.length) process.exitCode = 1;
