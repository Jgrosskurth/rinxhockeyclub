import { chromium } from 'playwright';
const b = await chromium.launch();
for (const f of process.argv.slice(2)) for (const w of [1440, 390]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.goto('file://' + f); await p.waitForTimeout(800);
  console.log(f.split('/').pop(), w, JSON.stringify(await p.evaluate(() => ({
    nextLines: [...document.querySelectorAll('.gd-label.next')].map((e) => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight || 16))),
    nextH: [...document.querySelectorAll('.gd-label')].map((e) => Math.round(e.getBoundingClientRect().height)),
    ph: document.querySelectorAll('[data-placeholder]').length, docW: document.documentElement.scrollWidth,
  }))));
}
await b.close();
