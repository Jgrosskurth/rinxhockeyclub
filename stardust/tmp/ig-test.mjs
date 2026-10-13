import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => localStorage.setItem('pwa-banner-dismissed', '1'));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(process.argv[2], { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelector('.instagram').scrollIntoView()); await p.waitForTimeout(8000);
  const r = await p.evaluate(() => {
    const root = document.querySelector('.instagram .es-embed-root')?.shadowRoot;
    const a = root?.querySelector('a[href*="elfsight.com"]');
    return { rendered: !!root, badgeFound: !!a, badgeVisible: a ? a.getBoundingClientRect().height > 0 && getComputedStyle(a).display !== 'none' : null, injected: !!root?.querySelector('style[data-rinx]') };
  });
  const box = await p.evaluate(() => { const r = document.querySelector('.instagram').getBoundingClientRect(); return { y: r.top + scrollY, h: r.height }; });
  await p.screenshot({ path: `stardust/tmp/ig-${n}.png`, fullPage: true, clip: { x: 0, y: box.y, width: vp.width, height: box.h } });
  console.log(n, JSON.stringify(r), errs);
  await ctx.close();
}
await b.close();
