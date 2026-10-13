import { chromium } from 'playwright';
const f = 'file://' + process.argv[2];
const b = await chromium.launch();
const out = {};
for (const [name, vp, opts] of [['desktop', { width: 1440, height: 900 }, {}], ['mobile', { width: 390, height: 844 }, {}], ['reduced', { width: 1440, height: 900 }, { reducedMotion: 'reduce' }], ['nojs', { width: 1440, height: 900 }, { javaScriptEnabled: false }]]) {
  const ctx = await b.newContext({ viewport: vp, ...opts });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(f, { waitUntil: 'networkidle' }); await p.waitForTimeout(1400);
  const r = { errs };
  r.docW = await p.evaluate(() => document.documentElement.scrollWidth);
  r.heroBtns = await p.evaluate(() => [...document.querySelectorAll('.mhero a.btn')].map((a) => a.textContent));
  r.ctrlHidden = await p.evaluate(() => document.querySelector('.rail-ctrl').hidden || getComputedStyle(document.querySelector('.rail-ctrl')).display === 'none');
  r.newsRowTops = await p.evaluate(() => [...new Set([...document.querySelectorAll('#news-rail .news-card')].map((c) => Math.round(c.offsetTop)))]);
  r.cardsVisible = await p.evaluate(() => { const rl = document.getElementById('news-rail').getBoundingClientRect(); return [...document.querySelectorAll('#news-rail .news-card')].filter((c) => { const x = c.getBoundingClientRect(); return x.left >= rl.left - 2 && x.right <= rl.right + 2; }).length; });
  r.brokenImgs = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(-40)));
  if (name === 'desktop' || name === 'mobile') await p.screenshot({ path: `stardust/tmp/b2-${name}-top.png` });
  // standings visible after scroll
  await p.evaluate(() => document.querySelector('.standings').scrollIntoView()); await p.waitForTimeout(1200);
  r.stOpacity = await p.evaluate(() => [...document.querySelectorAll('.st-card tbody tr')].map((t) => getComputedStyle(t).opacity).join(''));
  if (name === 'desktop' || name === 'mobile') await p.screenshot({ path: `stardust/tmp/b2-${name}-standings.png` });
  if (name === 'desktop') {
    await p.evaluate(() => document.querySelector('[data-section="news"]').scrollIntoView());
    r.btnStart = await p.evaluate(() => [...document.querySelectorAll('.rail-btn')].map((x) => x.disabled));
    await p.click('.rail-btn[data-dir="1"]'); await p.waitForTimeout(700);
    r.afterNext = await p.evaluate(() => ({ sl: Math.round(document.getElementById('news-rail').scrollLeft), d: [...document.querySelectorAll('.rail-btn')].map((x) => x.disabled) }));
    await p.click('.rail-btn[data-dir="1"]'); await p.click('.rail-btn[data-dir="1"]'); await p.click('.rail-btn[data-dir="1"]'); await p.waitForTimeout(900);
    r.atEnd = await p.evaluate(() => [...document.querySelectorAll('.rail-btn')].map((x) => x.disabled));
    await p.screenshot({ path: 'stardust/tmp/b2-desktop-news.png' });
    // tab switch replays faceoff, ends visible
    await p.evaluate(() => scrollTo(0, 0)); await p.click('label[for="nu-14u"]'); await p.waitForTimeout(150);
    r.midFaceoff = await p.evaluate(() => getComputedStyle(document.querySelector('.np-14u .side.away')).transform);
    await p.waitForTimeout(1000);
    r.endFaceoff = await p.evaluate(() => [getComputedStyle(document.querySelector('.np-14u .side.away')).transform, getComputedStyle(document.querySelector('.np-14u .np-date')).opacity]);
  }
  if (name === 'mobile') { await p.evaluate(() => document.querySelector('[data-section="news"]').scrollIntoView()); await p.screenshot({ path: 'stardust/tmp/b2-mobile-news.png' }); }
  out[name] = r; await ctx.close();
}
console.log(JSON.stringify(out, null, 1));
await b.close();
