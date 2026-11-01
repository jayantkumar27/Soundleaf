# Meetily website recreation

A React + JavaScript, Vite, Tailwind CSS and React Router recreation of the public Meetily marketing site. Reference observed **1 November 2026**. The site uses original public fonts, illustrations, portraits, logos and article images saved locally.

## Run

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open **http://localhost:4173/**. The port is fixed to avoid interfering with another application on port 5173.

```sh
npm run build
npm run preview -- --port 4174
```

The production output is in `dist/`. On a static host, configure a fallback from application routes to `index.html` so direct links and refresh work. An example Netlify fallback is supplied in [public/_redirects](./public/_redirects).

## Verification

With the development server running:

```sh
npx playwright install chromium
npm test
```

The browser suite covers six homepage viewport sizes, navigation, dialogs, required-field validation, demo stages, clipboard copying, FAQ expansion, and desktop/mobile direct-route checks. Results and screenshots are saved in [docs/](./docs/).

## Source structure

- [src/Home.jsx](./src/Home.jsx): homepage sections and article carousel.
- [src/Demo.jsx](./src/Demo.jsx): deterministic four-stage product demonstration. No microphone, audio capture, API key, or AI backend is needed.
- [src/components.jsx](./src/components.jsx): navigation, footer, buttons, links, dialogs, counters and accordion.
- [src/Pages.jsx](./src/Pages.jsx): pricing, downloads, Pro, purchase, forms, and structured page rendering.
- [src/Blog.jsx](./src/Blog.jsx): editorial blog cover and archive.
- [src/data/home.json](./src/data/home.json): observed homepage copy, FAQ, articles, testimonials and counters.
- [src/data/config.js](./src/data/config.js): prices, current version, external destinations and deterministic demo content.
- [src/data/routes/](./src/data/routes/): editable, individually loaded content for each observed route.
- [src/styles.css](./src/styles.css), [src/pages.css](./src/pages.css): responsive styling, CSS variables and motion preferences.

`src/data/pages.json` is the complete research snapshot used by the collection and verification scripts; it is not imported into the application bundle. `scripts/prepare-content.mjs` generates the smaller route files and manifest from it. The reference scripts are maintenance tools and require network access; the application never downloads source HTML at runtime.

## Service boundaries

The product demonstration is frontend sample data. Trial, waitlist and inquiry forms validate inputs and explicitly report that submission is unconfigured; they do not transmit personal data. The buyer form collects no payment details and links to official checkout after validation. Downloads, documentation, booking and video playback use their observed external destinations. Marketing privacy/compliance statements are reproduced reference copy, not capabilities implemented by this frontend.

See [validation report](./docs/validation.md), [route checklist](./docs/route-checklist.md), [asset inventory](./docs/asset-inventory.md), and [remaining differences](./docs/remaining-differences.md) for the implementation's precise coverage and limits.
