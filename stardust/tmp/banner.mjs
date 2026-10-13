import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }], ['small', { width: 360, height: 780 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => { localStorage.setItem('pwa-banner-dismissed', '1'); window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  for (const path of ['/', '/schedule', '/mid-atlantic-fall-classic-schedule']) {
    await p.goto(process.argv[2] + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => { const bn = document.querySelector('.promo-banner'); return { banner: !!bn, h: bn ? Math.round(bn.getBoundingClientRect().height) : 0, afterHeader: bn ? bn.previousElementSibling?.tagName : null, cta: bn?.querySelector('a')?.getAttribute('href'), img: bn ? bn.querySelector('img').naturalWidth : 0, docW: document.documentElement.scrollWidth, cls: window.__cls.toFixed(3) }; });
    if (path === '/') await p.screenshot({ path: `stardust/tmp/banner-${n}.png`, clip: { x: 0, y: 0, width: vp.width, height: 220 } });
    console.log(n, path, JSON.stringify(r));
  }
  if (errs.length) console.log(errs);
  await ctx.close();
}
await b.close();
