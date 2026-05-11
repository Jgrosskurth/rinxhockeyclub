import {
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

function fixBlockNames(main) {
  const path = window.location.pathname.replace(/\/$/, '');
  // Clinics page: ensure the block has class "clinics"
  if (path === '/clinics') {
    const firstBlock = main.querySelector(':scope > div > div[class]');
    if (firstBlock && !firstBlock.classList.contains('clinics')) {
      firstBlock.className = 'clinics';
    }
  }
}

// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  fixBlockNames(main);
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
}

async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const suffix = ' | Rinx Hockey Club';
  if (document.title && !document.title.includes('Rinx Hockey Club')) {
    document.title = `${document.title}${suffix}`;
  } else if (!document.title) {
    document.title = 'Rinx Hockey Club';
  }
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
