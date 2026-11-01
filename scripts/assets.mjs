import fs from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import { execFileSync } from "node:child_process";
const fetch = async (url) => {
  const body = execFileSync(
    "curl",
    ["-L", "--fail", "--retry", "3", "--silent", String(url)],
    { maxBuffer: 30 * 1024 * 1024 },
  );
  return {
    ok: true,
    text: async () => body.toString(),
    arrayBuffer: async () => body,
  };
};
const html = await fs.readFile("/tmp/meetily-reference.html", "utf8");
const $ = load(html);
const inventory = [];
const urls = new Set(["/nature/hero-1280.webp", "/nature/hero-760.webp"]);
$("img").each((i, e) => {
  let src = $(e).attr("src");
  if (src?.startsWith("/")) urls.add(src);
});
const cssUrls = $("link[rel=stylesheet]")
  .map((i, e) => $(e).attr("href"))
  .get();
let fontCSS = "";
for (const cssUrl of cssUrls) {
  const css = await (await fetch(new URL(cssUrl, "https://meetily.ai"))).text();
  for (const match of css.matchAll(/@font-face\{[^}]+\}/g)) {
    let face = match[0];
    for (const url of face.matchAll(/url\(([^)]+)\)/g)) {
      const source = new URL(
        url[1].replaceAll('"', ""),
        new URL(cssUrl, "https://meetily.ai"),
      ).href;
      const name = path.basename(new URL(source).pathname);
      await fs.writeFile(
        `public/assets/${name}`,
        Buffer.from(await (await fetch(source)).arrayBuffer()),
      );
      face = face.replace(url[1], `/assets/${name}`);
      inventory.push({
        source,
        local: `public/assets/${name}`,
        role: "font",
        available: true,
      });
    }
    fontCSS += face + "\n";
  }
}
await fs.writeFile("src/fonts.css", fontCSS);
await Promise.all(
  [...urls].map(async (src) => {
    try {
      const res = await fetch("https://meetily.ai" + src);
      if (!res.ok) throw Error(res.status);
      const filename = path.basename(src);
      await fs.writeFile(
        `public/assets/${filename}`,
        Buffer.from(await res.arrayBuffer()),
      );
      inventory.push({
        source: "https://meetily.ai" + src,
        local: `public/assets/${filename}`,
        role: src.includes("nature")
          ? "landscape"
          : src.includes("avatars")
            ? "participant"
            : src.includes("logos")
              ? "platform"
              : "article",
        available: true,
      });
    } catch (e) {
      inventory.push({ source: src, available: false, error: e.message });
    }
  }),
);
await fs.writeFile(
  "docs/asset-inventory.json",
  JSON.stringify(inventory, null, 2),
);
const faq = JSON.parse(
  $('script[type="application/ld+json"]')
    .filter((i, e) => $(e).text().includes("FAQPage"))
    .first()
    .text(),
).mainEntity.map((q) => ({ q: q.name, a: q.acceptedAnswer.text }));
const features = $("#features h3")
  .map((i, e) => ({ title: $(e).text(), text: $(e).next("p").text() }))
  .get();
const values = $("#about h3")
  .map((i, e) => ({ title: $(e).text(), text: $(e).next("p").text() }))
  .get();
const footer = $("footer h3")
  .map((i, e) => ({
    title: $(e).text(),
    links: $(e)
      .parent()
      .find("li")
      .map((i, li) => ({
        text: $(li).text(),
        href: $(li).find("a").attr("href") || "contact",
      }))
      .get(),
  }))
  .get()
  .filter((x) => x.links.length);
const articles = $("h3")
  .filter(
    (i, e) =>
      $(e).closest("section").find("h2").first().text() ===
      "Latest from Our Blog",
  )
  .map((i, e) => {
    const card = $(e).parent();
    return {
      title: $(e).text(),
      excerpt: card.find("p").text(),
      href: card.find("a").attr("href"),
      image: card.parent().find("img").attr("src"),
      date: card.find("time").text() || card.children().first().text(),
    };
  })
  .get();
const testimonials = $("a")
  .filter((i, e) => $(e).text().includes("Read more"))
  .map((i, e) => ({ text: $(e).parent().text(), href: $(e).attr("href") }))
  .get()
  .slice(0, 8);
await fs.writeFile(
  "src/data/home.json",
  JSON.stringify(
    {
      observed: "2026-11-01",
      stats: {
        stars: "32.4K",
        users: "738K+",
        downloads: "738.0K",
        forks: "3.1K",
      },
      faq,
      features,
      values,
      footer,
      articles,
      testimonials,
    },
    null,
    2,
  ),
);
console.log(
  "Saved",
  inventory.length,
  "assets;",
  faq.length,
  "FAQs;",
  articles.length,
  "articles",
);
