import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
const pages = JSON.parse(await fs.readFile("src/data/pages.json"));
const home = JSON.parse(await fs.readFile("src/data/home.json"));
const inventory = JSON.parse(await fs.readFile("docs/asset-inventory.json"));
const urls = [
  ...new Set(
    [
      ...Object.values(pages).flatMap((p) =>
        (p.assets || []).map((a) => a.src),
      ),
      ...home.articles.map((a) => a.image),
    ].filter((x) => x?.startsWith("https://meetily.ai/")),
  ),
];
for (const url of urls) {
  const local = "public/assets/" + path.basename(new URL(url).pathname);
  try {
    await fs.access(local);
  } catch {
    try {
      execFileSync("curl", [
        "-L",
        "--fail",
        "--silent",
        "--retry",
        "2",
        url,
        "-o",
        local,
      ]);
      inventory.push({
        source: url,
        local,
        role: "linked-page image",
        available: true,
      });
      console.log(local);
    } catch {
      inventory.push({ source: url, local, available: false });
    }
  }
}
await fs.writeFile(
  "docs/asset-inventory.json",
  JSON.stringify(inventory, null, 2),
);
await fs.writeFile(
  "docs/page-observations.txt",
  Object.entries(pages)
    .map(
      ([route, p]) =>
        route +
        "\n" +
        (p.headings || []).map((h) => h.tag + ": " + h.text).join("\n") +
        "\n" +
        (p.sections || []).map((s) => s.text).join("\n"),
    )
    .join("\n\n"),
);
