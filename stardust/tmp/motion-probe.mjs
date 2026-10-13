import { chromium } from 'playwright';
const file = process.argv[2];
const browser = await chromium.launch();
const res = {};
async function run(label, opts, fn) {
  const ctx = await browser.newContext({ viewport: opts.vp, reducedMotion: opts.rm || 'no-preference', javaScriptEnabled: opts.js !== false });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('file://' + file, { waitUntil: 'networkidle' });
  res[label] = await fn(p); res[label].errors = errors;
  await ctx.close();
}
const hiddenInView = () => [...document.querySelectorAll('main *, header *')].filter((el) => {
  const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.width === 0) return false;
  if (!el.textContent.trim() && el.tagName !== 'IMG') return false;
  const cs = getComputedStyle(el); return parseFloat(cs.opacity) < 0.05 && el.children.length === 0;
}).map((el) => el.className || el.tagName).slice(0, 12);
for (const [vpName, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  await run(`${vpName}-motion`, { vp }, async (p) => {
    const out = {};
    await p.waitForTimeout(500); out.t500 = await p.evaluate(hiddenInView);
    await p.waitForTimeout(2000); out.t2500 = await p.evaluate(hiddenInView);
    await p.screenshot({ path: `stardust/tmp/Ccine-${vpName}-top.png` });
    const H = await p.evaluate(() => document.body.scrollHeight);
    for (const frac of [0.25, 0.5, 0.75]) {
      await p.evaluate((y) => { window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }, Math.round(H * frac));
      await p.waitForTimeout(1600);
      out[`s${frac}`] = await p.evaluate(hiddenInView);
      if (frac === 0.5) await p.screenshot({ path: `stardust/tmp/Ccine-${vpName}-mid.png` });
    }
    out.flips = await p.evaluate(() => [...document.querySelectorAll('[data-flip]')].slice(0, 6).map((e) => e.textContent + '/' + e.dataset.flip));
    out.docW = await p.evaluate(() => document.documentElement.scrollWidth);
    out.lenis = await p.evaluate(() => !!window.__lenis);
    out.marqueeAnim = await p.evaluate(() => getComputedStyle(document.querySelector('.marquee__track')).animationName);
    return out;
  });
}
await run('reduced', { vp: { width: 1440, height: 900 }, rm: 'reduce' }, async (p) => {
  await p.waitForTimeout(800);
  const H = await p.evaluate(() => document.body.scrollHeight);
  const out = { top: await p.evaluate(hiddenInView) };
  await p.evaluate((y) => scrollTo(0, y), Math.round(H * 0.5)); await p.waitForTimeout(500);
  out.mid = await p.evaluate(hiddenInView);
  out.marqueeAnim = await p.evaluate(() => getComputedStyle(document.querySelector('.marquee__track')).animationName);
  out.flips = await p.evaluate(() => [...document.querySelectorAll('[data-flip]')].every((e) => e.textContent === e.dataset.flip));
  return out;
});
await run('nojs', { vp: { width: 1440, height: 900 }, js: false }, async (p) => {
  const H = await p.evaluate(() => document.body.scrollHeight);
  const out = { top: await p.evaluate(hiddenInView) };
  await p.evaluate((y) => scrollTo(0, y), Math.round(H * 0.5));
  out.mid = await p.evaluate(hiddenInView);
  return out;
});
console.log(JSON.stringify(res, null, 1));
await browser.close();
