import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, vp] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => localStorage.setItem('pwa-banner-dismissed', '1'));
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await p.screenshot({ path: `stardust/tmp/b2-${n}-hero.png` });
  await p.evaluate(() => document.querySelector('.about').scrollIntoView()); await p.waitForTimeout(800);
  const el = await p.$('.about');
  const box = await p.evaluate(() => { const a = document.querySelector('.about').getBoundingClientRect(); const c = document.querySelector('.columns').getBoundingClientRect(); return { y: a.top + scrollY, h: a.height + c.height }; });
  await p.screenshot({ path: `stardust/tmp/b2-${n}-about.png`, fullPage: true, clip: { x: 0, y: box.y, width: vp.width, height: Math.min(box.h, 2600) } });
  await ctx.close();
}
await b.close();
