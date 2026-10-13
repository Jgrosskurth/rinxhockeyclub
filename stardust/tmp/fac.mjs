import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, vp] of [['desktop', { width: 1440, height: 900 }], ['tablet', { width: 768, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => localStorage.setItem('pwa-banner-dismissed', '1'));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(process.argv[2], { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelector('.col-facility').scrollIntoView({ block: 'center' })); await p.waitForTimeout(1200);
  const box = await p.evaluate(() => { const r = document.querySelector('.about .about-grid').getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top), w: innerWidth, h: Math.min(r.height, innerHeight - Math.max(0, r.top)) }; });
  const fb = await p.evaluate(() => { const r = document.querySelector('.col-facility').getBoundingClientRect(); return { y: r.top - 10, h: r.height + 20 }; });
  await p.screenshot({ path: `stardust/tmp/fac-${n}.png`, clip: { x: 0, y: Math.max(0, fb.y), width: vp.width, height: Math.min(fb.h, vp.height - Math.max(0, fb.y)) } });
  console.log(n, JSON.stringify(await p.evaluate(() => ({ phoneLine: !!document.querySelector('.facility-phone'), btns: [...document.querySelectorAll('.facility-btn')].map((a) => [a.textContent.trim(), a.getAttribute('href').slice(0, 40), Math.round(a.getBoundingClientRect().width)]), docW: document.documentElement.scrollWidth }))), errs);
  await ctx.close();
}
await b.close();
