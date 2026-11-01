# Reference observations

Observed 2026-11-01 using Chromium, including full-page scrolls to reveal lazy content. The integrated browser's viewport did not remain stable; the reliable reference captures were made with a separate Playwright browser. The earlier integrated-browser image is retained only as a diagnostic.

## Homepage anchors

At 1440 × 1000:

- Announcement: 44px tall, pale yellow; dismissed independently of the header.
- Navigation: fixed white capsule, 896px wide, approximately 60px tall; sits 16px below the announcement and moves to the top after scrolling.
- Display: Instrument Serif regular, 80px / 84px, letter-spacing -0.8px; 896px hero text width.
- Supporting copy: Montserrat / system sans stack, 20px / 28px, letter-spacing -0.5px.
- Hero heading begins at approximately y=366; illustrated panel begins at approximately y=828 and is 1232px wide.
- Mobile display at 390px: 40px / 42px, letter-spacing -0.4px, 358px text width. Supporting copy is 18px / 29.25px, letter-spacing -0.45px.
- Mobile header keeps the wordmark and repository badge, hides desktop navigation/download, and exposes a full-screen menu.

Section order: announcement, floating navigation, hero proof and copy, benefit strip, illustrated demo, community/testimonials, dark data-control cards, seven feature cards, illustrated pricing CTA, article carousel, 23 FAQ rows, values, six-column desktop footer.

## Inspected interactions

- Use Cases opens links to Technology (labelled Project Management), Psychology (labelled Mental Health), Legal, Financial Services, Healthcare and Government.
- Start free trial opens the 14-day Pro license form: evaluation audience, name, email, company, designation and referral source.
- Talk to Us opens the Cal.com `meetily/30min` calendar.
- Recording, Transcription, People and Summary are manually selectable; the reference also autoplays. The participant grid disappears during later stages.
- FAQ rows expand answers beneath their questions.
- Pro's play overlay opens YouTube video `FYuuRL9ba7o` in a privacy-enhanced embed.
- Purchase uses buyer name, email, company, optional discount code and quantity before checkout.
- The old custom-API documentation URL redirects to `https://docs.meetily.ai/integrations/custom-apis-and-local-llms`.

See [reference captures](./reference/) and [implementation captures](./screenshots/) for the recorded images. Secondary route inspection included DOM content and desktop captures; not every secondary route received a manual visual comparison.
