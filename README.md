# MeetScribe website

MeetScribe is a single-page marketing website built with React, Vite, and Tailwind CSS. The homepage includes a canvas jellyfish animation and an interactive product demo. The demo uses sample data; it does not record audio or call an AI service.

## Get started

Install Node.js 20.19+ or 22.12+ and npm, then run:

```sh
git clone https://github.com/shresthgoel77-png/Soundleaf.git
cd Soundleaf
npm ci
npm run dev
```

Open [http://localhost:4173/](http://localhost:4173/). Vite uses port 4173 and will report an error if another process already occupies it.

## Build and preview

```sh
npm run build
npm run preview -- --port 4174
```

The production files are generated in `dist/`. Deploy that directory to a static host. The site redirects paths other than `/` and `/index.html` to the homepage; [public/_redirects](./public/_redirects) supplies a fallback rule for hosts that support it.

## Checks

Run the production build and the jellyfish lint, typecheck, and tests:

```sh
npm run build
npm run check:jellyfish
```

The browser verification script needs a running development server in another terminal and Playwright Chromium installed:

```sh
npx playwright install chromium
npm test
```

`npm test` checks the homepage at several viewport widths, navigation, download links, and demo interactions. It writes results to [docs/validation-results.json](./docs/validation-results.json); review that file before committing generated changes.

## Where to make changes

- [src/main.jsx](./src/main.jsx) mounts the single-page app.
- [src/Home.jsx](./src/Home.jsx) contains the homepage sections and download panel.
- [src/components.jsx](./src/components.jsx) contains the navigation, footer, and shared UI.
- [src/Demo.jsx](./src/Demo.jsx) contains the interactive sample demo.
- [src/jellyfish/](./src/jellyfish/) contains the canvas animation; keep its render loop and reduced-motion behavior working when changing the hero.
- [src/styles.css](./src/styles.css) contains the active page styles and responsive rules.
- [src/data/config.js](./src/data/config.js) contains the current version and external download URLs.
- [public/assets/](./public/assets/) contains local images and fonts.

Some legacy route data and styles remain in the repository but are not imported by the current app. Check [src/main.jsx](./src/main.jsx) before editing those files for a visible page change.

## Contributing and pushing

Create a branch from the latest `main`, make your change, and run the relevant checks:

```sh
git switch main
git pull origin main
git switch -c your-change-name
# edit files, then run the checks above
git add .
git commit -m "Describe your change"
git push -u origin your-change-name
```

Open a pull request from your branch into `main` for review. Pushing requires write access to the repository; contributors without access can fork it and open a pull request from their fork. Avoid committing `node_modules/`, `dist/`, or local environment files; they are ignored by Git.

## External services

The Windows and macOS download buttons point to external installer URLs configured in [src/data/config.js](./src/data/config.js). The site does not include an installer, account service, or backend. Review external URLs and marketing copy before publishing updates.
