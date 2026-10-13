import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
const page = await ctx.newPage();
await page.goto('https://www.rinxhockeyclub.com/', { waitUntil: 'networkidle' });
for (let i = 0; i < 5; i += 1) { await page.mouse.wheel(0, 900); await page.waitForTimeout(300); }
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
const data = await page.evaluate(() => {
  const bg = {}; const fg = {}; const radii = {}; const shadows = {}; const fonts = {}; const sizes = {};
  const add = (m, k, v) => { m[k] = (m[k] || 0) + v; };
  const sel = (el) => el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  document.querySelectorAll('body *').forEach((el) => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width * r.height === 0) return;
    const area = r.width * r.height;
    if (cs.backgroundColor && !/rgba\(.*, 0\)|transparent/.test(cs.backgroundColor)) add(bg, cs.backgroundColor, area);
    const txt = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (txt) { add(fg, cs.color, 1); add(fonts, `${cs.fontFamily.split(',')[0].replace(/["']/g, '')}|${cs.fontWeight}`, 1); add(sizes, `${cs.fontFamily.split(',')[0].replace(/["']/g, '')}|${cs.fontSize}|${cs.lineHeight}`, 1); }
    if (cs.borderRadius && cs.borderRadius !== '0px') add(radii, cs.borderRadius, 1);
    if (cs.boxShadow && cs.boxShadow !== 'none') add(shadows, cs.boxShadow, 1);
  });
  const top = (m, n) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);
  const sections = [...document.querySelectorAll('main > .section, header, footer')].map((s) => ({ sel: sel(s) + (s.className ? ' ' + s.className.split(' ').slice(0, 4).join('.') : ''), h: Math.round(s.getBoundingClientRect().height), bg: getComputedStyle(s).backgroundColor, pad: getComputedStyle(s).padding, blocks: [...s.querySelectorAll('.block')].map((b) => b.dataset.blockName) }));
  const navItems = [...document.querySelectorAll('header a, header button')].map((a) => a.textContent.trim()).filter(Boolean);
  return { bg: top(bg, 12), fg: top(fg, 10), radii: top(radii, 10), shadows: top(shadows, 6), fonts: top(fonts, 12), sizes: top(sizes, 18), sections, navItems, docH: document.body.scrollHeight };
});
// mobile pass: header + first viewport
await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const mobile = await page.evaluate(() => ({ docH: document.body.scrollHeight, heroH: document.querySelector('.hero')?.getBoundingClientRect().height, firstFold: [...document.querySelectorAll('main h1, main h2, main h3')].filter((h) => h.getBoundingClientRect().top < 844).map((h) => h.textContent.trim().slice(0, 40)), burger: !!document.querySelector('header button[aria-label*="enu" i], .nav-hamburger, .hamburger, .menu-toggle') }));
await page.screenshot({ path: 'stardust/current/assets/screenshots/index-mobile.png', fullPage: true });
console.log(JSON.stringify({ ...data, mobile }, null, 1));
await browser.close();
