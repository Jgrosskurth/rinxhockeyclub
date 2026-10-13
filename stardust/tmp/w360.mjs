import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 360, height: 800 } })).newPage();
await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
console.log(JSON.stringify(await p.evaluate(() => ({ docW: document.documentElement.scrollWidth, btns: [...document.querySelectorAll('.facility-btn')].map((a) => [Math.round(a.getBoundingClientRect().width), a.scrollWidth > a.clientWidth + 1 ? 'CLIPPED' : 'ok']) }))));
await b.close();
