import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [label, on, vp] of [['off-mobile', false, { width: 390, height: 844 }], ['on-mobile', true, { width: 390, height: 844 }], ['on-desktop', true, { width: 1440, height: 900 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  if (on) await p.route('**/fragments/install-prompt.plain.html', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<div><p>Rinx Hockey Club</p><p>Add to your home screen for quick access</p><p>Install</p></div>' }));
  await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(4500);
  const st = () => p.evaluate(() => { const bar = document.querySelector('.install-prompt-bar'); return { bar: !!bar, visible: bar ? getComputedStyle(bar).display !== 'none' : false, text: bar?.innerText.replace(/\s+/g, ' ').trim(), bodyPad: getComputedStyle(document.body).paddingBottom, oldBanner: !!document.querySelector('.pwa-install-banner') }; });
  const r = { before: await st() };
  if (label === 'on-mobile') {
    await p.screenshot({ path: 'stardust/tmp/install-on-mobile.png' });
    await p.click('.install-prompt-close'); r.afterClose = await st();
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(4500); r.afterReload = await st();
  }
  console.log(label, JSON.stringify(r), errs);
  await ctx.close();
}
await b.close();
