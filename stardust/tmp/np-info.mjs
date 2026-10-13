import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => localStorage.setItem('pwa-banner-dismissed', '1'));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  const info = async () => p.evaluate(() => ({ recs: [...document.querySelectorAll('.hero .np-rec')].map((r) => r.textContent), names: [...document.querySelectorAll('.hero .np-name')].map((r) => r.textContent), pin: decodeURIComponent(document.querySelector('.hero .np-pin')?.href.split('destination=')[1] || ''), where: document.querySelector('.hero .np-where span')?.textContent }));
  const r10 = await info();
  await p.screenshot({ path: `stardust/tmp/pins-${n}-10u.png`, clip: { x: 0, y: 70, width: vp.width, height: n === 'mobile' ? 640 : 520 } });
  await p.click('.hero button[data-team="14u"]'); await p.waitForTimeout(900);
  const r14 = await info();
  await p.screenshot({ path: `stardust/tmp/pins-${n}-14u.png`, clip: { x: 0, y: 70, width: vp.width, height: n === 'mobile' ? 640 : 520 } });
  console.log(n, JSON.stringify({ r10, r14 }), errs);
  await ctx.close();
}
await b.close();
