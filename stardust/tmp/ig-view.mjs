import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => localStorage.setItem('pwa-banner-dismissed', '1'));
  const p = await ctx.newPage();
  await p.goto(process.argv[2], { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelector('.instagram').scrollIntoView({ block: 'start' })); await p.waitForTimeout(9000);
  await p.evaluate(() => scrollBy(0, -90)); await p.waitForTimeout(800);
  await p.screenshot({ path: `stardust/tmp/ig-view-${n}.png` });
  await ctx.close();
}
await b.close();
