import { chromium } from 'playwright';
const [url, tag] = process.argv.slice(2);
const b = await chromium.launch();
for (const [w, h, n] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 120)));
  await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  for (let y = 0; y < 6000; y += 700) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(150); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
  await p.screenshot({ path: `stardust/tmp/${tag}-${n}.png`, fullPage: true });
  console.log(n, JSON.stringify({ docW: await p.evaluate(() => document.documentElement.scrollWidth), errs }));
}
await b.close();
