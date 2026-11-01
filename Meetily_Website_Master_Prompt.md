# Meetily Website Recreation — Master Prompt

You are a senior frontend engineer with strong visual implementation and browser testing skills. Build a new website from scratch that recreates the public website at https://meetily.ai/ as closely as possible.

This is a high-fidelity recreation task. The reference controls the design, content placement, responsive behavior, assets, page structure, and interactions. Implement the website with new, maintainable source code.

## 1. Objective and scope

Deliver a complete, runnable recreation of the marketing website. Prioritize an accurate homepage, then reproduce the linked first-party pages and shared navigation.

The target is the public website, including its embedded interactive product demonstration. Actual desktop audio capture, production transcription, AI inference, licensing, payment processing, and third-party service infrastructure are separate systems. Reproduce their visible website entry points and demo states without claiming that unimplemented backend functionality works.

Preserve the reference brand for this recreation. Keep brand names, logos, navigation labels, and visual hierarchy consistent with the reference. Do not introduce a new brand or visual identity.

## 2. Inspect the reference before coding

Use the live website as the primary source of truth. Inspect it in a browser if your environment supports one.

Before implementation:

- Capture the homepage at desktop, tablet, and mobile widths.
- Scroll through the entire page gradually, allowing images and scroll-triggered sections to appear.
- Record the section order, content widths, vertical spacing, typography, colors, borders, shadows, radii, imagery, and background treatments.
- Open dropdowns, expand representative FAQ items, switch all product-demo states, and inspect the mobile navigation.
- Inspect primary call-to-action destinations and any dialogs they open.
- Build an inventory of first-party routes linked from the header and footer.
- Identify the actual image assets, logo files, icon sources, and font families where publicly accessible.
- Record the observation date. Keep changeable content such as article lists, counters, prices, and versions in a central content file.

Do not claim to have inspected a page or interaction unless you actually did. If browser access is unavailable, use supplied screenshots and clearly list the observations still needed for exact matching. Continue with the available evidence.

Do not rebuild the website by embedding the original website in an iframe, using full-page screenshots as the UI, or depending on its HTML at runtime.

## 3. Implementation stack

Use:

- React with JavaScript
- Vite
- Tailwind CSS, with custom CSS where precision requires it
- React Router for local page navigation
- Lucide React or accurate SVG icons when appropriate

Use an animation library only if it helps match an observed interaction. Prefer lightweight CSS animation for simple fades, transitions, and decorative motion.

Keep content and route data separate from components. Use reusable components for the header, footer, buttons, cards, accordions, dialogs, and page containers.

Provide package.json, a lockfile, all required source files, local assets where available, and clear development and production commands.

## 4. Visual direction and measured anchors

The reference has an editorial presentation: warm off-white surfaces, large expressive serif headings, clean sans-serif interface text, restrained borders, rounded controls, soft shadows, and generous whitespace. It combines a floating capsule header with illustrated landscape imagery and an embedded desktop product mockup.

Observed desktop typography provides useful starting anchors:

- Main display face: Instrument Serif, regular weight.
- At an approximately 1348px-wide browser viewport, the hero heading was 80px with 84px line height.
- Navigation used Inter at 17px with 25.5px line height.
- Hero supporting text used a Montserrat/system sans-serif stack at 20px with 28px line height.
- A prominent lower-page section heading was 60px with 66px line height.

Re-measure these values in your own viewport. These are observed anchors, not universal values for every breakpoint or heading.

Create CSS variables for backgrounds, text colors, accents, borders, typography, radii, shadows, container widths, and section spacing. Derive final values from the reference. Treat any unmeasured numeric value as provisional.

Match actual font loading, glyph shapes, weight, letter spacing, line breaks, and text-block width. Font substitution can change the whole composition.

Preserve the observed hierarchy of green, black, white, muted orange, and subtle warm background accents. Match each button individually rather than applying one global primary color.

## 5. Homepage composition

Reproduce the following observed sequence, checking the live page for changes:

1. Announcement strip.
2. Floating navigation.
3. Centered hero and credibility badges.
4. Thin benefit strip.
5. Illustrated interactive product showcase.
6. Community proof, counters, and testimonial cards.
7. Data-control information section.
8. Feature-card grid.
9. Illustrated deployment/pricing call-to-action.
10. Article cards.
11. Long FAQ accordion.
12. Values section.
13. Multi-column footer.

Keep all sections. Preserve their relative widths and the substantial spacing between them. Scroll-triggered content may look absent in an immediate full-page screenshot; inspect the scrolled, settled state before reproducing apparent empty space.

### Announcement and navigation

Recreate the shallow pale announcement bar, its badge, text link, and dismissal control. Dismissing it must adjust the layout cleanly.

Recreate the centered white capsule navigation with its subtle outline and shadow, wordmark, repository badge, links, dropdown, and dark download control. Match the observed positioning and scroll behavior rather than assuming it is sticky.

Build the dropdown with the same alignment, spacing, visual treatment, open/close behavior, and destinations. Support keyboard access, Escape, and outside-click dismissal.

Inspect the mobile header and menu directly. Reproduce the actual mobile arrangement.

### Hero

Recreate the centered award-style badge, decorative laurels, rating treatment, and stacked social proof above the main heading.

Preserve the display heading's line count, width, alignment, and spacing at the desktop reference width. Load the correct font before tuning layout.

Match the supporting paragraph, three adjacent actions, and thin uppercase benefit strip. Reproduce the different fill colors, outlines, dimensions, icon placement, and shadows across the actions.

Use the same restrained background atmosphere: warm surface, very subtle color variation, and sparse decorative detail. Keep decoration behind the content and outside the interaction layer.

Obtain the actual visible hero wording from the live page; do not substitute generic marketing copy.

### Interactive product showcase

Recreate the large rounded illustrated scene, including the sky, clouds, landscape, fade into the page background, section heading, and segmented workflow controls.

Inside it, rebuild the desktop application window using real HTML and CSS. Match the window chrome, sidebar, panels, controls, typography, borders, and relative proportions.

Recreate the adjacent participant video grid, participant labels, meeting controls, and platform-support panel.

Implement the observed recording, transcript, speaker, and summary stages. Use deterministic sample data and timed frontend states to reproduce the presentation:

- Recording indicator and elapsed-time display.
- Animated audio activity where observed.
- Progressive transcript presentation.
- Speaker-selection or naming presentation.
- Summary-generation progress and completed result.
- Replay, copying, tab selection, and other controls that the reference actually exposes.

Distinguish genuinely interactive controls from decorative elements. Do not invent additional controls merely because they would fit a meeting app.

Allow manual stage selection and match the observed autoplay behavior. Clear timers on unmount. Respect reduced-motion preferences and avoid autoplaying sound.

The demonstration should work without API keys. Do not request microphone access merely to display the reference demo.

### Community, information, and features

Match the compact community link, centered social proof, animated statistics, rating badge, and horizontally arranged testimonial cards. If the cards move, reproduce their direction, speed, edge fades, hover behavior, and reduced-motion fallback.

Keep statistics data separate from animation. Ensure rolling digits resolve to readable values, including for assistive technology.

Reproduce the data-control information area in its fully revealed state. Match its internal arrangement and bullet treatment after inspecting it while scrolled into view.

Build the feature cards as a reusable grid with accurate icons, subdued surfaces, spacing, and text density. Preserve the reference's actual final-row arrangement.

### Deployment, articles, FAQ, values, and footer

Match the rounded illustrated call-to-action panel, background crop, overlays, typography, button, and small reassurance details.

Recreate the article-card layout, media aspect ratios, metadata, excerpts, link treatment, and carousel controls if present. Inspect lazy-loaded images before concluding that the reference uses blank media areas.

Build the complete FAQ dataset from the live reference. Match its narrower centered column, individual outlined rows, padding, chevrons, and expanded-answer spacing. Use real buttons with appropriate expanded-state attributes.

Match the values section's background transition, three-card arrangement, icon scale, supporting text, and actions.

Recreate the footer's brand block, social icons, link columns, spacing, separators, and bottom legal area. Preserve actual column groupings and link density.

## 6. Linked pages and navigation

Discover paths from the live website instead of guessing them.

Complete the pages linked from the main navigation and primary actions first, then the remaining first-party destinations exposed by the recreated footer. Inspect each page before applying a shared page template.

Keep first-party navigation inside the local application. Keep genuine external destinations external.

For each route:

- Reproduce its own layout and content structure.
- Share the correct header and footer variants.
- Ensure direct URL loading and refresh work.
- Provide the appropriate document title.
- Preserve anchor behavior and sensible scroll restoration.

Maintain a route checklist. Do not present an empty route, generic placeholder, or repeated homepage as a completed page.

For documentation or other externally hosted properties, preserve the observed external destination unless those properties are explicitly included in scope.

## 7. Assets and content fidelity

Create an asset inventory before substituting imagery. For each asset, record its source, local filename, role, and availability.

Use the reference's publicly available assets when accessible. Preserve aspect ratios, crop positions, transparency, image quality, and loading behavior.

Do not replace the characteristic illustrated scenery with an unrelated stock photo. If an exact asset is unavailable, use a carefully matched temporary substitute and identify that substitution in the handoff.

Keep text in editable data files, not baked into images. Retrieve visible copy directly from the reference when building. Preserve content length and line wrapping.

Do not invent customer endorsements, live counters, prices, compliance capabilities, or download versions. Keep observed reference claims as reference content; do not imply that the recreated frontend implements the underlying product guarantees.

## 8. Responsive behavior and interaction quality

Verify at 1440px, 1280px, 1024px, 768px, 390px, and 375px widths.

Derive breakpoints from actual layout behavior. Use fluid typography and containers where appropriate.

Ensure:

- No accidental horizontal overflow.
- Correct hero wrapping.
- A usable mobile menu.
- Product-demo panels that remain legible and fit the viewport.
- Cards that stack or scroll as the reference does.
- Correct landscape-image cropping.
- Comfortable touch targets.
- Footer columns that reflow cleanly.
- No layout shift when fonts or images load.

Use semantic landmarks, meaningful alternative text, visible keyboard focus, accessible tabs and accordions, and appropriate dialog focus management.

Only reproduce motion supported by observations. Match timing and easing. Use reduced-motion alternatives without hiding essential content.

## 9. Functional boundaries

All visible controls need a defined outcome: navigation, opening or closing a dialog, selecting a tab, expanding content, copying demo text, or another observed action.

For any form, implement validation and clear error states. If no submission service is configured, show an honest unconfigured state instead of pretending a message was sent.

Keep checkout and download destinations configurable. Do not collect payment details or create a pretend successful purchase flow.

Do not add unrelated authentication, dashboards, AI chat interfaces, or backend features. Finish the requested website before considering extra functionality.

## 10. Verification and delivery

Run the application and its production build. Fix syntax, import, routing, asset, and console errors.

Use browser checks for the highest-value interactions: navigation dropdown, mobile menu, demo stage switching, FAQ expansion, dialogs, primary links, and direct route loading.

Compare reference and implementation screenshots at identical viewport sizes and equivalent animation states. Scroll through both pages to load content before capturing full-page comparisons.

Review in this order:

1. Overall composition and section dimensions.
2. Fonts, text width, and line breaks.
3. Backgrounds and imagery.
4. Spacing and alignment.
5. Borders, radii, shadows, and icons.
6. Interaction states and motion.
7. Responsive edge cases.

Iterate after comparison. Do not declare pixel accuracy without comparison evidence.

Deliver:

- The complete runnable source.
- Setup and production-build instructions.
- An asset inventory.
- A route completion checklist.
- A short validation report.
- A precise list of unresolved differences or unavailable assets.

Start by inspecting the reference, then implement the website. Continue through verification and corrections. The final result should closely match the reference in both appearance and observable website behavior.
