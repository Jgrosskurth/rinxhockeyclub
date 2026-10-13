import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('https://www.rinxhockeyclub.com/', { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelector('.instagram')?.scrollIntoView()); await p.waitForTimeout(6000);
console.log(JSON.stringify(await p.evaluate(() => {
  const hits = [];
  const walk = (root, path) => root.querySelectorAll('*').forEach((el) => {
    if (el.shadowRoot) walk(el.shadowRoot, path + ' >> ' + el.tagName);
    if (el.children.length === 0 && /free instagram feed widget/i.test(el.textContent)) {
      const chain = []; let e = el; for (let i = 0; i < 6 && e; i++) { chain.push(`${e.tagName}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ').join('.') : ''}${e.getAttribute && e.getAttribute('href') ? '[href=' + e.getAttribute('href').slice(0, 60) + ']' : ''}`); e = e.parentElement; }
      hits.push({ path, chain });
    }
  });
  walk(document, 'document');
  return { hits, iframes: [...document.querySelectorAll('.instagram iframe')].map((f) => f.src.slice(0, 80)) };
}), null, 1));
await b.close();
