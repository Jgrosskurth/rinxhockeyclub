import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, vp] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => { localStorage.setItem('pwa-banner-dismissed', '1'); window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  const p = await ctx.newPage();
  await p.goto(process.argv[2] || 'http://localhost:3000/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ({
    cls: window.__cls.toFixed(3),
    npMin: getComputedStyle(document.querySelector('.hero .np')).minHeight, npH: Math.round(document.querySelector('.hero .np').getBoundingClientRect().height),
    railFirstVisible: (() => { const r = document.querySelector('.fx-rail'); const rl = r.getBoundingClientRect(); const c = [...r.children].find((li) => li.getBoundingClientRect().left >= rl.left - 2); return c?.querySelector('.fx-top').textContent; })(),
    cal: document.querySelector('.np-cal')?.href.match(/dates=([^&]*)/)?.[1],
  }));
  await p.screenshot({ path: `stardust/tmp/b-live3-${n}-top.png` });
  await p.click('.recent-results button[data-team="14u"]'); await p.waitForTimeout(900);
  r.after14 = await p.evaluate(() => ({ hero: document.querySelector('.hero .np-comp')?.textContent, heroDate: document.querySelector('.hero .np-date')?.textContent, rail: [...document.querySelectorAll('.fx-rail .fx-top')].map((x) => x.textContent).join(' | '), cal: document.querySelector('.np-cal')?.href.match(/dates=([^&]*)/)?.[1] }));
  if (n === 'mobile') { await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300); await p.screenshot({ path: 'stardust/tmp/b-live3-mobile-14u.png' }); }
  console.log(n, JSON.stringify(r, null, 1));
  await ctx.close();
}
await b.close();
