import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, vp] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
  const ctx = await b.newContext({ viewport: vp, bypassCSP: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(process.argv[2] + '?nocache=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
  await p.evaluate(() => document.querySelector('.about').scrollIntoView()); await p.waitForTimeout(800);
  console.log(n, JSON.stringify(await p.evaluate(() => ({ lastResult: !!document.querySelector('.np-last'), facilityInAbout: !!document.querySelector('.about .about-copy .col-facility'), coachRow: !!document.querySelector('.columns.columns-coaches-row'), docW: document.documentElement.scrollWidth }))), errs);
  await ctx.close();
}
await b.close();
