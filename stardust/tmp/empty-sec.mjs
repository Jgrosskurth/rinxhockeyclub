import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
for (const path of ['/', '/schedule', '/tournaments', '/contact']) {
  await p.goto('https://www.rinxhockeyclub.com' + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(1000);
  console.log(path, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('main > .section')].filter((s) => !s.textContent.trim() && !s.querySelector('img,iframe,picture,video,svg')).map((s) => ({ cls: s.className, html: s.innerHTML.slice(0, 80), h: Math.round(s.getBoundingClientRect().height), empty: s.matches(':empty') })))));
}
await b.close();
