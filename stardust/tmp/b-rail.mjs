import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('file://' + process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
const st = () => p.evaluate(() => { const r = document.getElementById('news-rail'); return { sl: r.scrollLeft, cw: r.clientWidth, sw: r.scrollWidth, d: [...document.querySelectorAll('.rail-btn')].map((x) => x.disabled) }; });
console.log('start', await st());
for (let i = 0; i < 4; i++) { await p.click('.rail-btn[data-dir="1"]', { force: true }); await p.waitForTimeout(900); console.log('next', await st()); }
await b.close();
