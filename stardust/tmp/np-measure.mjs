import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of [360, 390, 600, 899, 900, 1200, 1440]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.addInitScript(() => localStorage.setItem('pwa-banner-dismissed', '1'));
  await p.goto(process.argv[2] || 'http://localhost:3000/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  const h = [];
  for (const t of ['10u', '14u']) { await p.click(`.hero button[data-team="${t}"]`); await p.waitForTimeout(700); h.push(await p.evaluate(() => { const np = document.querySelector('.hero .np'); return [Math.round(np.getBoundingClientRect().height), np.scrollHeight]; })); }
  const rail = await p.evaluate(() => [Math.round(document.querySelector('.fx-rail').getBoundingClientRect().height), getComputedStyle(document.querySelector('.fx-rail')).minHeight, document.querySelector('.fx-rail').scrollLeft]);
  console.log(w, JSON.stringify({ np: h, min: await p.evaluate(() => getComputedStyle(document.querySelector('.hero .np')).minHeight), rail }));
}
await b.close();
