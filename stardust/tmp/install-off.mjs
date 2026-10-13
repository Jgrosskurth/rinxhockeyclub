import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(5000);
console.log('install bar:', await p.evaluate(() => ({ newBar: !!document.querySelector('.install-prompt-bar'), oldBanner: !!document.querySelector('.pwa-install-banner'), bodyPad: getComputedStyle(document.body).paddingBottom })));
await b.close();
