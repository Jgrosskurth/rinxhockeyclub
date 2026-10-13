import { chromium } from 'playwright';
import fs from 'fs';
const files = process.argv.slice(2);
const browser = await chromium.launch();
const out = {};
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const r = { };
  r.viewportMeta = /<meta name="viewport" content="width=device-width/.test(src);
  const mq = [...src.matchAll(/@media \(max-width:\s*(\d+)px\)/g)].map((m) => +m[1]);
  r.mediaMaxWidths = [...new Set(mq)].sort((a, b) => a - b);
  r.hasRuleLe640 = mq.some((v) => v <= 640);
  r.rootFirstInStyle = /<style>\s*:root\s*\{/.test(src);
  r.provFirstInHead = /<head>\s*<!-- stardust:provenance/.test(src);
  r.jsHiddenCss = (src.match(/(clip-path:\s*inset\(0\s+100%|opacity:\s*0\s*[;}]|transform:\s*translate[XY]\(-?100%)/g) || []).length;
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const p = await ctx.newPage();
  await p.goto('file://' + f, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  Object.assign(r, await p.evaluate(() => {
    const de = document.documentElement;
    const navFonts = [...document.querySelectorAll('header nav *')].filter((e) => e.getClientRects().length && e.textContent.trim()).map((e) => parseFloat(getComputedStyle(e).fontSize));
    const firstImg = [...document.images].find((i) => { const b = i.getBoundingClientRect(); return b.top < innerHeight && b.bottom > 0 && b.width > 60; });
    // contrast: every visible text leaf vs its first opaque ancestor background
    const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v[3] === undefined ? 1 : v[3] }; };
    const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const bgOf = (el) => { let base = { r: 245, g: 246, b: 248 }; const chain = []; for (let e = el; e; e = e.parentElement) chain.push(e); for (const e of chain) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0.5) { base = c; break; } if (e.classList && (e.classList.contains('hero') || e.classList.contains('mhero'))) { base = { r: 4, g: 30, b: 66 }; break; } } return base; };
    const fails = [];
    document.querySelectorAll('body *').forEach((el) => {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || !el.getClientRects().length) return;
      const fg = parse(cs.color); if (!fg) return;
      const bg = bgOf(el);
      const fgm = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
      const L1 = lum(fgm), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
      const large = size >= 24 || (bold && size >= 18.66);
      if (ratio < (large ? 3 : 4.5)) fails.push(`${(el.className || el.tagName).toString().slice(0, 24)} "${el.textContent.trim().slice(0, 24)}" ${ratio.toFixed(2)}`);
    });
    return {
      overflow360: de.scrollWidth > de.clientWidth || document.body.scrollWidth > document.body.clientWidth,
      navMinFont: navFonts.length ? Math.min(...navFonts) : null,
      lcpImg: firstImg ? { src: firstImg.src.slice(-30), loading: firstImg.loading, fetchpriority: firstImg.getAttribute('fetchpriority') } : null,
      contrastFails: [...new Set(fails)].slice(0, 12),
      placeholders: document.querySelectorAll('[data-placeholder]').length,
      sectionsMissingAttrs: [...document.querySelectorAll('main > section, body > header, body > footer')].filter((s) => !(s.dataset.section && s.dataset.intent && s.dataset.layout)).length,
      h1Count: document.querySelectorAll('h1').length,
    };
  }));
  await ctx.close();
  out[f.split('/').pop()] = r;
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
