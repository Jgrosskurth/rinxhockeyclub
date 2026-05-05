import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
}

function buildAutoBlocks(main) {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const isHome = path === '/' || path === '/index';
  if (!isHome) return;

  // Insert recent-results block after news-slider if not present
  if (!main.querySelector('.recent-results')) {
    const sections = [...main.querySelectorAll(':scope > div')];
    const newsSection = sections.find((s) => s.querySelector('.news-slider'));
    if (newsSection) {
      const section = document.createElement('div');
      section.append(buildBlock('recent-results', ''));
      newsSection.after(section);
    }
  }

  // Insert about block if not present
  if (!main.querySelector('.about')) {
    const section = document.createElement('div');
    const content = document.createElement('div');
    content.innerHTML = `<div>
      <picture><img src="https://static.wixstatic.com/media/4d0004_9c4b74e112a042159df552c350dad98d~mv2.png/v1/crop/x_0,y_4,w_1280,h_355/fill/w_980,h_272,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/League%20Header.png" alt="2026-2027 Rinx Hockey Club 10U Squirts"></picture>
      <h3>2026–2027 Rinx Hockey Club • 10U Squirts</h3>
      <p>The Rinx 10U Squirts travel hockey team represents the best young talent from the Long Island area, competing at the Tier III/A level. Based out of The Rinx in Hauppauge, New York, our program is dedicated to developing elite young players both on and off the ice.</p>
      <p>This season, our roster features dedicated players, led by an experienced coaching staff committed to skill development, teamwork, and competitive excellence. From the first whistle to the final buzzer, our Squirts play with heart, hustle, and Rinx pride.</p>
      <p>The Rinx facility, located on 97 acres of Hidden Pond Park in the Town of Islip, provides two full-size indoor NHL rinks and first-class training conditions for our athletes.</p>
    </div>`;
    const aboutBlock = buildBlock('about', content.innerHTML);
    section.append(aboutBlock);
    main.append(section);
  }

  // Insert columns (coaching/facility) if not present
  if (!main.querySelector('.columns')) {
    const section = document.createElement('div');
    const content = document.createElement('div');
    content.innerHTML = `<div>
      <div>
        <h3>Coaching Staff</h3>
        <p>Dan O'Donoghue|DO|Head Coach • 10U Squirts</p>
        <p>Joe Capozzoli|JC|Assistant Coach • 10U Squirts</p>
      </div>
      <div>
        <h3>Our Facility</h3>
        <picture><img src="/icons/877c6298be0986da90566f459a2a2874.webp" alt="The Rinx — Hauppauge, NY"></picture>
        <p>Located at 660 Terry Road, Hauppauge, The Rinx features two full-size indoor NHL rinks, a pro shop, skate sharpening, and year-round programming on 97 acres of Hidden Pond Park.</p>
        <p><strong>Phone:</strong> (631) 232-3222</p>
      </div>
    </div>`;
    const columnsBlock = buildBlock('columns', content.innerHTML);
    section.append(columnsBlock);
    main.append(section);
  }

  // Remove old cards block if present (replaced by about + columns)
  const cardsBlock = main.querySelector('.cards');
  if (cardsBlock) {
    const cardsSection = cardsBlock.closest('.section') || cardsBlock.parentElement;
    if (cardsSection) cardsSection.remove();
  }
}

// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  buildAutoBlocks(main);
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
}

async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }
}

async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));
  const main = doc.querySelector('main');
  await loadSections(main);
  loadFooter(doc.querySelector('footer'));
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

function loadDelayed() {
  window.setTimeout(() => import('./delayed.js').catch(() => {}), 3000);
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
