import { chromium } from 'playwright';
const sites = [['islanders', 'https://www.nhl.com/islanders'], ['kraken', 'https://www.nhl.com/kraken'], ['mlssoccer-nycfc', 'https://www.nycfc.com/']];
const browser = await chromium.launch();
const out = {};
for (const [k, url] of sites) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' });
  const p = await ctx.newPage();
  try {
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForTimeout(5000);
    const info = await p.evaluate(() => {
      const vis = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.top < 900 && r.bottom > 0 && r.height > 0 && e.children.length === 0 && e.textContent.trim().length > 1; }).map((e) => e.textContent.trim()).slice(0, 120);
      return { title: document.title, firstViewText: [...new Set(vis)].join(' | ').slice(0, 900) };
    });
    await p.screenshot({ path: `stardust/tmp/ref-${k}.png` });
    out[k] = { url, ...info };
  } catch (e) { out[k] = { url, error: e.message.slice(0, 120) }; }
  await ctx.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
