import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of [320, 360, 375, 390, 414, 599]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 800 } })).newPage();
  await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  console.log(w, JSON.stringify(await p.evaluate(() => { const t = document.querySelector('.promo-banner-title'); t.style.whiteSpace = 'nowrap'; t.style.display = 'block'; const r = { need: t.scrollWidth, have: t.clientWidth, font: getComputedStyle(t).fontFamily.slice(0, 20) }; t.style.whiteSpace = ''; t.style.display = ''; return r; })));
}
await b.close();
