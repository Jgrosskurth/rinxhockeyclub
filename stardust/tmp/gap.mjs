import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => localStorage.setItem('pwa-banner-dismissed', '1'));
  const p = await ctx.newPage();
  await p.goto(process.argv[2], { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelector('.instagram').scrollIntoView()); await p.waitForTimeout(8000);
  console.log(n, JSON.stringify(await p.evaluate(() => {
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), bottom: Math.round(b.bottom + scrollY), pad: getComputedStyle(el).padding, margin: getComputedStyle(el).margin }; };
    const ig = document.querySelector('.instagram');
    const root = ig.querySelector('.es-embed-root');
    const imgs = [...root.shadowRoot.querySelectorAll('img')].map((i) => i.getBoundingClientRect()).filter((x) => x.height > 50);
    const chain = []; let e = ig; while (e && e !== document.body) { chain.push({ el: `${e.tagName}.${(e.className || '').toString().split(' ').slice(0, 3).join('.')}`, ...r(e) }); e = e.parentElement; }
    const main = document.querySelector('main'); const lastSection = main.lastElementChild;
    return { tilesBottom: Math.round(Math.max(...imgs.map((x) => x.bottom)) + scrollY), app: r(ig.querySelector('[data-elfsight-app-lazy]')), chain, footer: r(document.querySelector('footer')), footerBlock: r(document.querySelector('footer .footer')), mainLast: `${lastSection.tagName}.${lastSection.className}`, mainLastBox: r(lastSection), afterIg: [...main.children].slice([...main.children].indexOf(ig.closest('.section')) + 1).map((s) => `${s.className} h=${Math.round(s.getBoundingClientRect().height)}`) };
  }), null, 1));
  await ctx.close();
}
await b.close();
