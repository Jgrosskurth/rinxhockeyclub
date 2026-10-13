import { chromium } from 'playwright';
const b = await chromium.launch();
const real = 'http://localhost:3000';
for (const [label, extra] of [['banner-only', ''], ['with-install-block', '<div class="install-prompt"><div><div>Rinx Hockey Club</div></div><div><div>Add to your home screen for quick access</div></div><div><div>Install</div></div></div>']]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); const errs = []; const reqs = [];
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 100)));
  p.on('request', (r) => { if (r.url().includes('/fragments/')) reqs.push(r.url().replace(real, '')); });
  if (extra) {
    await p.route('**/fragments/banner.plain.html', async (r) => { const resp = await r.fetch(); const body = (await resp.text()).replace(/<\/div>\s*$/, '</div>' + extra); r.fulfill({ status: 200, contentType: 'text/html', body }); });
  }
  await p.goto(real + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(5000);
  console.log(label, JSON.stringify(await p.evaluate(() => ({ banner: !!document.querySelector('.promo-banner'), title: document.querySelector('.promo-banner-title')?.textContent, cta: document.querySelector('.promo-banner-cta')?.textContent, installBar: !!document.querySelector('.install-prompt-bar'), installText: document.querySelector('.install-prompt-bar')?.innerText.replace(/\s+/g, ' ') }))), { reqs, errs });
  await ctx.close();
}
await b.close();
