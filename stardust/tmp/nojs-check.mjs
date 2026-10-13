import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
const p = await ctx.newPage();
await p.goto('file://' + process.argv[2]);
await p.waitForTimeout(2000);
console.log(await p.evaluate(() => ['.season-pill', '.hero-line'].map((s) => s + ' ' + getComputedStyle(document.querySelector(s)).opacity)));
await b.close();
