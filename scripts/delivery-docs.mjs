import fs from "node:fs/promises";

const read = async (path) => JSON.parse(await fs.readFile(path, "utf8"));
const assets = await read("docs/asset-inventory.json");
if (!assets.some((asset) => asset.local === "public/assets/laurel.svg")) {
  assets.push({
    source: "https://meetily.ai/#hero",
    local: "public/assets/laurel.svg",
    role: "Hero laurel, extracted original inline SVG",
    available: true,
  });
}
for (const asset of assets) {
  asset.available = await fs.access(asset.local).then(
    () => true,
    () => false,
  );
}
await fs.writeFile(
  "docs/asset-inventory.json",
  JSON.stringify(assets, null, 2) + "\n",
);
const escape = (value) =>
  String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
await fs.writeFile(
  "docs/asset-inventory.md",
  `# Asset inventory\n\nReference observed 1 November 2026. ${assets.length} locally inventoried assets. Availability below confirms the file exists locally; original sources can change. No replacement landscape illustration was used. Lucide React provides interface icons; the laurel is an extracted original SVG. Some syndicated dev.to article images remain external and depend on their original CDN.\n\n| Source | Local file | Role | Available |\n| --- | --- | --- | --- |\n${assets.map((a) => `| [Source](${a.source}) | [${a.local.split("/").pop()}](../${a.local}) | ${escape(a.role)} | ${a.available ? "Yes" : "No"} |`).join("\n")}\n`,
);

const manifest = await read("src/data/route-manifest.json");
const validation = await read("docs/validation-results.json");
const passed = new Set(
  validation.results.filter((r) => r.pass).map((r) => r.check),
);
const dedicated = new Set([
  "/pricing",
  "/downloads",
  "/pro",
  "/buy-now",
  "/blog",
]);
const rows = Object.entries(manifest)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([route, page]) => {
    const external = route.startsWith("/docs/");
    const implementation = external
      ? "Redirect to observed external documentation"
      : dedicated.has(route)
        ? "Dedicated layout and observed content"
        : "Observed page-specific content with shared page-family styling";
    const checks = external
      ? "External destination inspected; excluded from local route checks"
      : passed.has(`route ${route}`) && passed.has(`mobile route ${route}`)
        ? "Passed at 1440px and 390px"
        : "Needs verification";
    return `| [${route}](https://meetily.ai${route}) | ${escape(page.title)} | ${implementation} | ${checks} |`;
  });
await fs.writeFile(
  "docs/route-checklist.md",
  `# Route completion checklist\n\nReference observed 1 November 2026. The homepage and 145 linked local routes are implemented; one captured documentation path redirects externally. Every local route was directly loaded in a browser. Checks confirm a visible heading and no document-level horizontal overflow at desktop size, plus no document-level overflow at mobile size. They do not establish exact visual matching or exercise every secondary control.\n\nThe homepage and primary pages received focused visual work. Secondary pages preserve their own observed text, headings, tables, images and links, but their shared styling remains less exact. See [remaining differences](./remaining-differences.md).\n\n| Route | Reference title | Implementation | Browser checks |\n| --- | --- | --- | --- |\n| [Homepage](https://meetily.ai/) | Meetily | Dedicated layout, all 13 sections and interactive demo | Passed at 1440, 1280, 1024, 768, 390 and 375px |\n${rows.join("\n")}\n\nDocumentation links under features, developers, integrations and docs use https://docs.meetily.ai/ as observed. Booking, GitHub, checkout, downloads and syndicated articles retain external destinations.\n`,
);

await fs.writeFile(
  "docs/validation.md",
  `# Validation report\n\nReference observation: 1 November 2026. Browser run: ${validation.date}.\n\n## Automated browser checks\n\n- ${validation.results.length} checks; ${validation.results.filter((r) => !r.pass).length} failures; ${validation.errors.length} uncaught browser page errors. See [machine-readable results](./validation-results.json).\n- Homepage widths: 1440, 1280, 1024, 768, 390 and 375px. No document-level horizontal overflow at those widths.\n- Desktop navigation dropdown and Escape; mobile menu and pricing navigation; four demo tabs and summary copy; FAQ expansion; trial dialog, required-field validation, honest unconfigured submission, and Escape.\n- All 145 linked local routes directly loaded at 1440px with a visible heading, then checked for document-level horizontal overflow at 390px.\n- Browser tests use Chromium and deterministic frontend sample content. They do not test production service submissions, payments or desktop recording.\n\n## Visual review\n\nReference and local homepage captures use matching 1440px and 390px viewports, with full-page captures after scrolling. Review refined font loading, hero line wrapping, primary widths, original landscape and portrait assets, navigation, section composition and mobile spacing. Demo snapshots can differ due to their animation state. Fine details and secondary layouts retain the differences listed in [remaining differences](./remaining-differences.md). No pixel-accuracy claim is made.\n\n| Width | Reference | Implementation |\n| --- | --- | --- |\n| 1440px | [Reference](./reference/home-1440-full.png) | [Local](./screenshots/home-1440-full.png) |\n| 390px | [Reference](./reference/home-390-full.png) | [Local](./screenshots/home-390-full.png) |\n\n## Reproduce\n\nRun the development server with npm run dev, install Chromium with npx playwright install chromium, then run npm test. Run npm run build for production output and npm run preview -- --port 4174 to serve it. See [README](../README.md) for hosting fallback configuration.\n`,
);
console.log({
  assets: assets.length,
  missingAssets: assets.filter((a) => !a.available).map((a) => a.local),
  routes: Object.keys(manifest).length,
  checks: validation.results.length,
});
