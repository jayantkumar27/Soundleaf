import { chromium } from "playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pages = JSON.parse(await fs.readFile("src/data/pages.json"));
delete pages["/use-cases/project-management"];
delete pages["/use-cases/mental-health"];
pages["/use-cases/psychology"] ||= {};
const routes = process.argv.includes("--route")
  ? [process.argv[process.argv.indexOf("--route") + 1]]
  : process.argv.includes("--additional")
    ? JSON.parse(await fs.readFile("docs/internal-link-audit.json")).filter(
        (route) => !/^\/(features|developers|integrations)(\/|$)/.test(route),
      )
    : Object.keys(pages);
for (const route of routes) {
  let response;
  try {
    response = await page.goto("https://meetily.ai" + route, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
  } catch (e) {
    console.log("Unavailable", route, e.message);
    continue;
  }
  await page.waitForTimeout(150);
  const data = await page.evaluate(() => {
    const cleanText = (e) => e.innerText?.trim() || "";
    const walk = (e) => {
      if (e.nodeType === 3)
        return e.textContent.trim()
          ? { type: "text", text: e.textContent }
          : null;
      if (
        e.nodeType !== 1 ||
        e.matches(
          "header:not(:has(h1)),footer,nav,script,style,svg,[aria-hidden=true],.ann-bar",
        )
      )
        return null;
      const type = e.tagName.toLowerCase();
      if (type === "table")
        return {
          type,
          children: [...e.querySelectorAll("tr")].map((r) =>
            [...r.children].map(
              (c) =>
                c.innerText.trim() ||
                (c.querySelector(".lucide-check")
                  ? "✓"
                  : c.querySelector(".lucide-x")
                    ? "—"
                    : ""),
            ),
          ),
        };
      if (type === "img") return { type, src: e.src, alt: e.alt };
      if (type === "video")
        return {
          type,
          src: e.src || e.querySelector("source")?.src,
          poster: e.poster,
        };
      const directButton = [...e.children].find(
        (x) => x.tagName === "BUTTON" && x.innerText.trim().endsWith("?"),
      );
      if (
        directButton &&
        e.children.length < 4 &&
        e.innerText.trim() !== directButton.innerText.trim()
      )
        return {
          type: "faq",
          q: directButton.innerText.trim(),
          a: [...e.children]
            .filter((x) => x !== directButton)
            .map((x) => x.innerText.trim())
            .join("\n"),
        };
      if (type === "a" && e.querySelector("h2,h3,img"))
        return {
          type,
          href: e.getAttribute("href"),
          children: [...e.childNodes].map(walk).filter(Boolean),
        };
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
          "a",
          "button",
          "summary",
        ].includes(type)
      )
        return {
          type,
          text: cleanText(e),
          href: e.getAttribute("href") || undefined,
          id: e.id || undefined,
        };
      if (["input", "select", "textarea", "label", "form"].includes(type))
        return null;
      const children = [...e.childNodes].map(walk).filter(Boolean);
      if (!children.length) return null;
      const style = getComputedStyle(e);
      let layout;
      if (style.display === "grid") {
        const count = style.gridTemplateColumns.split(" ").length;
        if (count > 1) layout = "grid-" + Math.min(count, 4);
      }
      if (children.length === 1 && type === "div" && !e.id) return children[0];
      return {
        type: ["section", "ul", "ol", "article"].includes(type) ? type : "div",
        id: e.id || undefined,
        layout,
        children,
      };
    };
    return {
      title: document.title,
      announcement: !!document.querySelector(".ann-bar"),
      blocks: walk(document.body),
      links: [...document.querySelectorAll("a")].map((e) => ({
        text: cleanText(e),
        href: e.getAttribute("href"),
      })),
      headings: [...document.querySelectorAll("main h1,main h2,main h3")].map(
        (e) => ({ tag: e.tagName, text: cleanText(e) }),
      ),
      assets: [...document.images].map((e) => ({ src: e.src, alt: e.alt })),
    };
  });
  pages[route] = { ...pages[route], ...data, sourceStatus: response?.status() };
  if (process.argv.includes("--additional"))
    for (const link of data.links) {
      const next = link.href?.split("#")[0].replace(/\/$/, "");
      if (
        next?.startsWith("/releases/pro/") &&
        !pages[next] &&
        !routes.includes(next)
      )
        routes.push(next);
    }
  await fs.writeFile("src/data/pages.json", JSON.stringify(pages, null, 2));
  if (process.argv.includes("--additional"))
    await page.screenshot({
      path: `docs/reference/${route.slice(1).replaceAll("/", "--")}.png`,
    });
  console.log("Refined", route, response?.status());
}
await fs.writeFile("src/data/pages.json", JSON.stringify(pages, null, 2));
for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("https://meetily.ai/");
  await page.waitForTimeout(400);
  console.log(
    "REFERENCE METRICS",
    width,
    await page.locator("h1").evaluate((e) => ({
      size: getComputedStyle(e).fontSize,
      weight: getComputedStyle(e).fontWeight,
      spacing: getComputedStyle(e).letterSpacing,
      line: getComputedStyle(e).lineHeight,
      width: e.offsetWidth,
    })),
  );
  console.log(
    "DESCRIPTION",
    await page
      .locator("h1 + h2")
      .evaluate((e) => ({
        font: getComputedStyle(e).fontFamily,
        spacing: getComputedStyle(e).letterSpacing,
        size: getComputedStyle(e).fontSize,
        line: getComputedStyle(e).lineHeight,
      }))
      .catch(() => null),
  );
}
await browser.close();
