import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of [390, 600, 899, 900, 1200, 1440]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.goto(process.argv[2], { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelector('.instagram').scrollIntoView()); await p.waitForTimeout(8000);
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const app = document.querySelector('.instagram [data-elfsight-app-lazy]');
    const root = app.querySelector('.es-embed-root');
    const imgs = [...root.shadowRoot.querySelectorAll('img')].map((i) => i.getBoundingClientRect()).filter((r) => r.height > 50);
    const top = app.getBoundingClientRect().top;
    const sec = document.querySelector('.instagram').closest('.section');
    return { app: Math.round(app.getBoundingClientRect().height), root: Math.round(root.getBoundingClientRect().height), tilesBottom: imgs.length ? Math.round(Math.max(...imgs.map((r) => r.bottom)) - top) : null, sectionPad: getComputedStyle(sec).padding, blockPad: getComputedStyle(document.querySelector('.instagram')).padding };
  })));
}
await b.close();
