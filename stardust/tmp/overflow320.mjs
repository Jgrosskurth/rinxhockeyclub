import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 320, height: 800 } })).newPage();
await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => {
  const clipped = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a); if (/(hidden|auto|scroll|clip)/.test(o.overflowX)) return true; } return false; };
  return { docW: document.documentElement.scrollWidth, culprits: [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 && r.width > 0 && !clipped(el) && getComputedStyle(el).position !== 'fixed'; }).map((el) => `${el.tagName}.${(el.className || '').toString().slice(0, 30)} r=${Math.round(el.getBoundingClientRect().right)}`).slice(0, 6) };
})));
await b.close();
