import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('https://www.rinxhockeyclub.com/', { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelector('.instagram')?.scrollIntoView()); await p.waitForTimeout(8000);
console.log(JSON.stringify(await p.evaluate(() => {
  const desc = (e) => `${e.tagName}${typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : ''}`;
  const out = { links: [], textEls: [] };
  const all = [];
  const walk = (root) => root.querySelectorAll('*').forEach((el) => { all.push(el); if (el.shadowRoot) { out.shadow = true; walk(el.shadowRoot); } });
  walk(document);
  all.filter((a) => a.tagName === 'A' && /elfsight/i.test(a.getAttribute('href') || '')).forEach((a) => {
    const chain = []; let e = a; for (let i = 0; i < 5 && e; i++) { chain.push(desc(e)); e = e.parentElement; }
    const r = a.getBoundingClientRect();
    out.links.push({ href: a.getAttribute('href').slice(0, 90), text: a.textContent.trim().slice(0, 40), chain, size: [Math.round(r.width), Math.round(r.height)] });
  });
  out.inShadow = all.filter((a) => a.tagName === "A" && /elfsight/i.test(a.getAttribute("href") || "")).map((a) => a.getRootNode() !== document && a.getRootNode().host ? desc(a.getRootNode().host) : "document");
  const app = document.querySelector('[class*="elfsight-app-"]');
  out.appChildren = app ? [...app.children].map(desc) : 'no app';
  return out;
}), null, 1));
await b.close();
