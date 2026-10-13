import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(500);
console.log(await p.evaluate(() => [...document.querySelectorAll('.st-card tbody tr')].slice(0, 3).map((tr) => { const c = (el) => { const r = el.getBoundingClientRect(); return Math.round(r.top + r.height / 2); }; return [c(tr.querySelector('.st-team')), c(tr.cells[3])]; })));
await b.close();
