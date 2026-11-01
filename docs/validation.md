# Validation report

Reference observation: 1 November 2026. Browser run: 2026-11-01T17:24:24.597Z.

## Automated browser checks

Production build: `npm run build` passed on 1 November 2026. The initial JavaScript bundle is 448.61 kB (128.39 kB gzip); secondary route content is loaded separately. A separate production preview was not started because permission was declined. Browser results below are from the development server.

- 310 checks; 0 failures; 0 uncaught browser page errors. See [machine-readable results](./validation-results.json).
- Homepage widths: 1440, 1280, 1024, 768, 390 and 375px. No document-level horizontal overflow at those widths.
- Desktop navigation dropdown and Escape; mobile menu and pricing navigation; four demo tabs and summary copy; FAQ expansion; trial dialog, required-field validation, honest unconfigured submission, and Escape.
- All 145 linked local routes directly loaded at 1440px with a visible heading, then checked for document-level horizontal overflow at 390px.
- Browser tests use Chromium and deterministic frontend sample content. They do not test production service submissions, payments or desktop recording.

## Visual review

Reference and local homepage captures use matching 1440px and 390px viewports, with full-page captures after scrolling. Review refined font loading, hero line wrapping, primary widths, original landscape and portrait assets, navigation, section composition and mobile spacing. Demo snapshots can differ due to their animation state. Fine details and secondary layouts retain the differences listed in [remaining differences](./remaining-differences.md). No pixel-accuracy claim is made.

| Width | Reference | Implementation |
| --- | --- | --- |
| 1440px | [Reference](./reference/home-1440-full.png) | [Local](./screenshots/home-1440-full.png) |
| 390px | [Reference](./reference/home-390-full.png) | [Local](./screenshots/home-390-full.png) |

## Reproduce

Run the development server with npm run dev, install Chromium with npx playwright install chromium, then run npm test. Run npm run build for production output and npm run preview -- --port 4174 to serve it. See [README](../README.md) for hosting fallback configuration.
