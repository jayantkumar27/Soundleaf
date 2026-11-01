import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const out = "docs/reference";
await fs.mkdir(out, { recursive: true });
await page.goto("https://meetily.ai/", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.addStyleTag({
  content: "html,body{scroll-behavior:auto!important}",
});
const extract = () => {
  const text = (e) => e?.innerText?.trim() || "";
  const links = (e) =>
    [...(e || document).querySelectorAll("a")].map((a) => ({
      text: text(a),
      href: a.getAttribute("href"),
    }));
  return {
    title: document.title,
    headings: [...document.querySelectorAll("h1,h2,h3")].map((e) => ({
      tag: e.tagName,
      text: text(e),
    })),
    sections: [...document.querySelectorAll("section")].map((e) => ({
      id: e.id,
      text: text(e),
      height: e.offsetHeight,
      y: e.getBoundingClientRect().top + scrollY,
    })),
    assets: [...document.images].map((e) => ({ src: e.src, alt: e.alt })),
    links: links(),
    footer: [...document.querySelectorAll("footer h3")].map((h) => ({
      title: text(h),
      links: links(h.parentElement),
    })),
    faq: [...document.querySelectorAll("#faq button")].map((e) => ({
      q: text(e),
      a: text(e.nextElementSibling),
    })),
    features: [...document.querySelectorAll("#features h3")].map((e) => ({
      title: text(e),
      text: text(e.nextElementSibling),
    })),
    values: [...document.querySelectorAll("#about h3")].map((e) => ({
      title: text(e),
      text: text(e.nextElementSibling),
    })),
    articles: [...document.querySelectorAll("article")].map((e) => ({
      text: text(e),
      links: links(e),
      image: e.querySelector("img")?.src,
    })),
    styles: [...document.querySelectorAll("h1,h2,nav")]
      .slice(0, 5)
      .map((e) => ({
        text: text(e),
        font: getComputedStyle(e).fontFamily,
        size: getComputedStyle(e).fontSize,
        lineHeight: getComputedStyle(e).lineHeight,
        width: e.offsetWidth,
        y: e.getBoundingClientRect().top + scrollY,
      })),
  };
};
for (const width of [1440, 768, 390]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/home-${width}.png` });
  for (
    let y = 0;
    y < (await page.evaluate(() => document.body.scrollHeight));
    y += 800
  ) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(130);
  }
  await page.screenshot({
    path: `${out}/home-${width}-full.png`,
    fullPage: true,
  });
  if (width === 1440)
    await fs.writeFile(
      `${out}/home.json`,
      JSON.stringify(await page.evaluate(extract), null, 2),
    );
  if (width === 390) {
    await page.evaluate(() => scrollTo(0, 0));
    const menu = page.getByRole("button", { name: /open menu|toggle menu/i });
    if (await menu.count()) {
      await menu.first().click();
      await page.screenshot({ path: `${out}/mobile-menu.png` });
      await fs.writeFile(
        `${out}/mobile-menu.txt`,
        await page.locator("header").innerText(),
      );
      await page.keyboard.press("Escape");
    }
  }
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.reload();
await page.waitForTimeout(800);
await page
  .getByRole("button", { name: "Use Cases", exact: true })
  .first()
  .click();
await fs.writeFile(
  `${out}/dropdown.txt`,
  await page.locator("header").innerText(),
);
await page.screenshot({ path: `${out}/dropdown.png` });
await page.keyboard.press("Escape");
for (const stage of ["Recording", "Transcription", "People", "Summary"]) {
  await page
    .getByRole("button", { name: `Show ${stage}`, exact: true })
    .click();
  await page
    .getByRole("heading", { name: "The full meeting workflow, 100% local" })
    .scrollIntoViewIfNeeded();
  await page.evaluate(() => scrollBy(0, 250));
  await page.waitForTimeout(stage === "Summary" ? 5000 : 1000);
  await page.screenshot({ path: `${out}/demo-${stage}.png` });
}
await page
  .getByRole("button", { name: "Start free trial", exact: true })
  .click();
await page.screenshot({ path: `${out}/trial.png` });
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Talk to Us", exact: true }).click();
await page.waitForTimeout(10000);
await fs.writeFile(
  `${out}/contact.txt`,
  await page.getByRole("dialog").innerText(),
);
await page.screenshot({ path: `${out}/contact.png` });
await page.reload();
await page.waitForTimeout(500);
await page.locator("#faq button").first().click();
await page.locator("#faq").scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}/faq.png` });
const home = JSON.parse(await fs.readFile(`${out}/home.json`));
const liveData = await page.evaluate(() => ({
  articles: [...document.querySelectorAll("h3")]
    .filter(
      (e) =>
        e.closest("section")?.querySelector("h2")?.textContent ===
        "Latest from Our Blog",
    )
    .map((e) => {
      let card = e.parentElement;
      while (!card.querySelector("img") && card.parentElement)
        card = card.parentElement;
      return {
        title: e.textContent,
        excerpt: card.querySelector("p")?.innerText,
        href: card.querySelector("a")?.getAttribute("href"),
        image: card.querySelector("img")?.src,
        date: card.innerText.split("\n")[0],
      };
    }),
  testimonials: [...document.querySelectorAll("a")]
    .filter((e) => e.textContent.includes("Read more"))
    .slice(0, 8)
    .map((e) => ({ text: e.parentElement.innerText, href: e.href })),
}));
const content = JSON.parse(await fs.readFile("src/data/home.json"));
Object.assign(content, liveData);
await fs.writeFile("src/data/home.json", JSON.stringify(content, null, 2));
const dropdownRoutes = [
  "/use-cases/project-management",
  "/use-cases/mental-health",
];
const routes = [
  ...new Set(
    [
      ...home.footer.flatMap((g) => g.links),
      ...home.links.filter((x) =>
        [
          "/pricing",
          "/pro",
          "/blog",
          "/downloads",
          "/buy-now",
          "/license-request/organization",
          "/cli",
        ].includes(x.href),
      ),
      ...home.links.filter((x) => x.href?.startsWith("/blog/")).slice(0, 29),
    ]
      .map((x) => x.href?.split("#")[0].replace(/\/$/, ""))
      .filter((x) => x?.startsWith("/") && x !== "/"),
  ),
];
const pages = {};
routes.push(...dropdownRoutes);
for (const route of routes) {
  try {
    await page.goto(`https://meetily.ai${route}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(250);
    for (
      let y = 0;
      y < (await page.evaluate(() => document.body.scrollHeight));
      y += 1500
    ) {
      await page.evaluate((y) => scrollTo(0, y), y);
      await page.waitForTimeout(40);
    }
    const data = await page.evaluate(extract);
    data.blocks = await page.evaluate(() => {
      const main = document.querySelector("main") || document.body;
      const skip = "header,footer,nav,script,style,svg,[aria-hidden=true]";
      const walk = (e) => {
        if (e.nodeType === 3)
          return e.textContent.trim()
            ? { type: "text", text: e.textContent }
            : null;
        if (e.nodeType !== 1 || e.matches(skip)) return null;
        const tag = e.tagName.toLowerCase();
        if (
          [
            "h1",
            "h2",
            "h3",
            "h4",
            "p",
            "li",
            "blockquote",
            "pre",
            "table",
            "a",
            "button",
            "img",
            "input",
            "label",
            "select",
            "textarea",
            "summary",
          ].includes(tag)
        ) {
          return {
            type: tag,
            text: e.innerText || e.textContent || "",
            href: e.getAttribute("href"),
            src: tag === "img" ? e.src : undefined,
            alt: e.getAttribute("alt"),
            id: e.id || undefined,
            children:
              tag === "table"
                ? [...e.querySelectorAll("tr")].map((r) =>
                    [...r.children].map((c) => c.innerText),
                  )
                : undefined,
          };
        }
        return {
          type: tag,
          id: e.id || undefined,
          children: [...e.childNodes].map(walk).filter(Boolean),
        };
      };
      return walk(main);
    });
    pages[route] = data;
    await fs.writeFile("src/data/pages.json", JSON.stringify(pages, null, 2));
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: `${out}/${route.slice(1).replaceAll("/", "--")}.png`,
    });
    console.log(route, data.headings[0]?.text);
  } catch (e) {
    console.log("FAILED", route, e.message);
  }
}
await fs.writeFile("src/data/pages.json", JSON.stringify(pages, null, 2));
await browser.close();
