import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of [901, 1024, 1100, 1280, 1440]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 800 } })).newPage();
  await p.goto(process.argv[2] || 'http://localhost:3000/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  console.log(w, JSON.stringify(await p.evaluate(() => { const n = document.querySelector('.header-nav'); const r = n.getBoundingClientRect(); return { docW: document.documentElement.scrollWidth, navRight: Math.round(r.right), navH: Math.round(r.height), hdrH: Math.round(document.querySelector('header').getBoundingClientRect().height) }; })));
}
await b.close();
