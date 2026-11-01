import fs from "node:fs/promises";
import { load } from "cheerio";
const pages = JSON.parse(await fs.readFile("src/data/pages.json"));
await fs.writeFile(
  "docs/reference/pages-observed.json",
  JSON.stringify(pages, null, 2),
);
await fs.mkdir("src/data/routes", { recursive: true });
const manifest = {},
  primary = {};
for (const [route, p] of Object.entries(pages)) {
  const name = route.slice(1).replaceAll("/", "--");
  manifest[route] = {
    title: p.title,
    announcement: p.announcement,
    file: name,
  };
  const data = {
    title: p.title,
    blocks: p.blocks,
    links: p.links,
    headings: p.headings,
  };
  await fs.writeFile(`src/data/routes/${name}.json`, JSON.stringify(data));
  if (["/pricing", "/downloads", "/pro", "/buy-now"].includes(route))
    primary[route] = data;
}
await fs.writeFile(
  "src/data/route-manifest.json",
  JSON.stringify(manifest, null, 2),
);
await fs.writeFile("src/data/primary-pages.json", JSON.stringify(primary));
const known = new Set(["/", ...Object.keys(pages)]);
const missing = [
  ...new Set(
    Object.values(pages)
      .flatMap((p) => (p.links || []).map((l) => l.href))
      .filter((x) => x?.startsWith("/") && !x.startsWith("//"))
      .map((x) => x.split(/[?#]/)[0].replace(/\/$/, "") || "/")
      .filter((x) => !known.has(x)),
  ),
];
await fs.writeFile(
  "docs/internal-link-audit.json",
  JSON.stringify(missing, null, 2),
);
console.log(
  "Routes:",
  Object.keys(manifest).length,
  "Other linked paths:",
  missing.length,
);
console.log(missing);
const proof = load(await fs.readFile("docs/reference/hero-proof.txt", "utf8"));
const laurel = proof("svg").first();
laurel
  .attr("xmlns", "http://www.w3.org/2000/svg")
  .removeAttr("class")
  .attr("style", "color:#a2a2a2");
await fs.writeFile("public/assets/laurel.svg", proof.html(laurel));
const unavailable = Object.entries(pages)
  .filter(([route, p]) =>
    p.headings?.some((h) => h.text === "Page not found" || h.text === "404"),
  )
  .map(([route]) => route);
await fs.writeFile(
  "docs/source-unavailable.json",
  JSON.stringify(unavailable, null, 2),
);
console.log("Source unavailable", unavailable);
