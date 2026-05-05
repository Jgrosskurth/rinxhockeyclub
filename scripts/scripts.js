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
  const isHome = window.location.pathname === '/' || window.location.pathname === '/index';
  if (!isHome) return;

  // Insert recent-results block after news-slider section if not already present
  if (!main.querySelector('.recent-results')) {
    const sections = [...main.querySelectorAll(':scope > div')];
    const newsSection = sections.find((s) => s.querySelector('.news-slider'));
    if (newsSection) {
      const section = document.createElement('div');
      section.append(buildBlock('recent-results', ''));
      newsSection.after(section);
    }
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
