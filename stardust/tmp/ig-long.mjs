import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(process.argv[2], { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelector('.instagram').scrollIntoView());
const snap = () => p.evaluate(() => { const root = document.querySelector('.instagram .es-embed-root')?.shadowRoot; return { imgs: root ? [...root.querySelectorAll('img')].filter((i) => i.naturalWidth > 0).length : 0, badge: !!root?.querySelector('a[href*="elfsight.com"]'), h: Math.round(document.querySelector('.instagram').getBoundingClientRect().height) }; });
for (const t of [5, 15, 30]) { await p.waitForTimeout(t === 5 ? 5000 : 10000 + (t === 30 ? 5000 : 0)); console.log(`${t}s`, JSON.stringify(await snap())); }
const box = await p.evaluate(() => { const r = document.querySelector('.instagram').getBoundingClientRect(); return { y: r.top + scrollY, h: r.height }; });
await p.screenshot({ path: 'stardust/tmp/ig-final-' + (process.argv[3] || 'x') + '.png', fullPage: true, clip: { x: 0, y: box.y, width: 1440, height: box.h } });
console.log(errs);
await b.close();
