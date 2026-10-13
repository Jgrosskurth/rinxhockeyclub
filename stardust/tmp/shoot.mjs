import { chromium } from 'playwright';
const [file, tag] = process.argv.slice(2);
const browser = await chromium.launch();
const out = {};
for (const [w, h, name] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('file://' + file, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  out[name] = await p.evaluate(() => ({ docW: document.documentElement.scrollWidth, vw: innerWidth, h: document.body.scrollHeight, broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(-50)) }));
  out[name].errors = errors;
  await p.screenshot({ path: `stardust/tmp/${tag}-${name}.png`, fullPage: true });
  await ctx.close();
}
console.log(JSON.stringify(out));
await browser.close();
