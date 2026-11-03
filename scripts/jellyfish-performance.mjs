import { chromium } from "playwright";

const browser = await chromium.launch();
try {
  for (const deviceScaleFactor of [1, 2]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor,
    });
    await page.goto("http://localhost:4173/");
    await page.waitForTimeout(1000);
    const result = await page.evaluate(() => new Promise((resolve) => {
      const intervals = [];
      let started = 0, previous = 0;
      const sample = (now) => {
        if (!started) started = now;
        if (previous) intervals.push(now - previous);
        previous = now;
        if (now - started < 3000) {
          requestAnimationFrame(sample);
          return;
        }
        const sorted = [...intervals].sort((a, b) => a - b);
        resolve({
          frames: intervals.length,
          fps: +(intervals.length * 1000 / (now - started)).toFixed(1),
          medianMs: +sorted[Math.floor(sorted.length * 0.5)].toFixed(1),
          p95Ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
        });
      };
      requestAnimationFrame(sample);
    }));
    console.log(JSON.stringify({deviceScaleFactor, ...result}));
    await page.close();
  }
} finally {
  await browser.close();
}
