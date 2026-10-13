import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, vp] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => { localStorage.setItem('pwa-banner-dismissed', '1'); window.__s = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__s.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: e.sources.map((s) => { const el = s.node; return el ? `${el.nodeName}.${(el.className || '').toString().slice(0, 30)} ${Math.round(s.previousRect.y)}->${Math.round(s.currentRect.y)} h${Math.round(s.previousRect.height)}->${Math.round(s.currentRect.height)}` : '?'; }) }); }).observe({ type: 'layout-shift', buffered: true }); });
  const p = await ctx.newPage();
  await p.goto(process.argv[2] || 'http://localhost:3000/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  console.log(n, JSON.stringify(await p.evaluate(() => window.__s), null, 1));
  await ctx.close();
}
await b.close();
