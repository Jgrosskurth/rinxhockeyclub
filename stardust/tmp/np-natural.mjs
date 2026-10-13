import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of [360, 390, 600, 899, 900, 1200, 1440]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.goto(process.argv[2] || 'http://localhost:3000/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  const out = [];
  for (const t of ['10u', '14u']) { await p.click(`.hero button[data-team="${t}"]`); await p.waitForTimeout(700); out.push(await p.evaluate(() => { const np = document.querySelector('.hero .np'); np.style.minHeight = '0'; const h = Math.round(np.getBoundingClientRect().height); np.style.minHeight = ''; return h; })); }
  console.log(w, out);
}
await b.close();
