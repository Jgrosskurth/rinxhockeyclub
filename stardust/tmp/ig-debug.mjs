import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(process.argv[2], { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelector('.instagram').scrollIntoView()); await p.waitForTimeout(8000);
console.log(JSON.stringify(await p.evaluate(() => {
  const root = document.querySelector('.instagram .es-embed-root').shadowRoot;
  const a = root.querySelector('a[href*="elfsight.com"]');
  const cs = getComputedStyle(a);
  const styles = [...root.querySelectorAll('style')].map((s) => (s.dataset.rinx !== undefined ? 'RINX:' : '') + s.textContent.length);
  return { display: cs.display, visibility: cs.visibility, inline: a.getAttribute('style'), cls: a.className, adopted: root.adoptedStyleSheets?.length, styles: styles.slice(-5), nStyles: styles.length, rinxPos: [...root.children].findIndex((c) => c.dataset && c.dataset.rinx !== undefined), rootChildren: [...root.children].map((c) => c.tagName).slice(0, 12), matches: a.matches('a[href*="elfsight.com"]') };
}), null, 1));
await b.close();
