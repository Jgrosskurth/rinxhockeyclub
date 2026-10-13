import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, vp, opts] of [['desktop', { width: 1440, height: 900 }, {}], ['mobile', { width: 390, height: 844 }, {}], ['nojs', { width: 1440, height: 900 }, { javaScriptEnabled: false }]]) {
  const p = await (await b.newContext({ viewport: vp, ...opts })).newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  const st = () => p.evaluate(() => ({ shown: [...document.querySelectorAll('.fx-rail')].filter((r) => getComputedStyle(r).display !== 'none').map((r) => r.className), firstVisible: (() => { const r = [...document.querySelectorAll('.fx-rail')].find((x) => getComputedStyle(x).display !== 'none'); const rl = r.getBoundingClientRect(); const c = [...r.children].find((li) => li.getBoundingClientRect().right > rl.left + 10); return c.querySelector('.fx-top').textContent; })(), hero: document.getElementById('nu-14u').checked ? '14U' : '10U', docW: document.documentElement.scrollWidth }));
  const r = { start: await st() };
  if (name !== 'mobile') await p.screenshot({ path: `stardust/tmp/b3-${name}.png`, clip: { x: 0, y: 560, width: 1440, height: 260 } });
  await p.click('label[for="fx-14u"]'); await p.waitForTimeout(700); r.after14 = await st();
  if (name === 'mobile') { await p.evaluate(() => document.querySelector('.fixtures').scrollIntoView()); await p.waitForTimeout(300); await p.screenshot({ path: 'stardust/tmp/b3-mobile-14u.png' }); }
  if (name === 'desktop') await p.screenshot({ path: 'stardust/tmp/b3-desktop-14u.png', clip: { x: 0, y: 560, width: 1440, height: 260 } });
  await p.click('label[for="nu-10u"]'); await p.waitForTimeout(300); r.heroBack10 = await st();
  r.errs = errs; console.log(name, JSON.stringify(r));
}
await b.close();
