import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of [320, 360, 390, 430, 599, 600, 768, 899, 900, 1024, 1440]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 800 } })).newPage();
  await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  console.log(w, JSON.stringify(await p.evaluate(() => { const t = document.querySelector('.promo-banner-title'); const c = document.querySelector('.promo-banner-cta'); const bn = document.querySelector('.promo-banner'); return { bannerH: Math.round(bn.getBoundingClientRect().height), titleClipped: t.scrollWidth > t.clientWidth + 1 || t.scrollHeight > t.clientHeight + 1, titleLines: Math.round(t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight)), cta: c.innerText.trim(), ctaW: Math.round(c.getBoundingClientRect().width), sameRow: Math.abs(c.getBoundingClientRect().top + c.offsetHeight / 2 - (t.getBoundingClientRect().top + t.offsetHeight / 2)) < 6, docW: document.documentElement.scrollWidth }; })));
}
await b.close();
