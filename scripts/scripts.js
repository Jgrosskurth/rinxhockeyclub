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
  createOptimizedPicture,
} from './aem.js';

// Site-wide announcement strip under the header, authored in DA at
// /fragments/banner: an image, a headline (bold words are highlighted) and a
// link for the button. Delete or unpublish that page to remove the banner.
// It is fetched at the start of the eager phase and placed just before the
// first section is shown, so it never pushes the page down; if it isn't back
// within a second it is skipped for that page view.
const BANNER_PATH = '/fragments/banner';
const BANNER_WAIT = 1000;

async function fetchBanner() {
  try {
    const resp = await fetch(`${BANNER_PATH}.plain.html`);
    if (!resp.ok) return null;
    const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
    const link = doc.querySelector('a[href]');
    const titleEl = [...doc.querySelectorAll('h1, h2, h3, h4, p')]
      .find((el) => el.textContent.trim() && !el.querySelector('a, picture, img'));
    if (!link || !titleEl) return null;
    const href = new URL(link.getAttribute('href'), window.location.href);
    // Not on the page the banner points to.
    if (href.origin === window.location.origin
      && href.pathname.replace(/\/$/, '') === window.location.pathname.replace(/\/$/, '')) return null;

    const banner = document.createElement('aside');
    banner.className = 'promo-banner';
    banner.setAttribute('aria-label', 'Club news');
    const inner = document.createElement('div');
    inner.className = 'promo-banner-inner';

    const img = doc.querySelector('img');
    if (img) {
      const src = new URL(img.getAttribute('src'), new URL(BANNER_PATH, window.location.href)).href;
      const pic = createOptimizedPicture(src, '', true, [{ width: '120' }]);
      pic.querySelector('img').setAttribute('width', '40');
      pic.querySelector('img').setAttribute('height', '60');
      inner.append(pic);
    }

    // Headline: keep only text and bold/italic emphasis.
    const title = document.createElement('p');
    title.className = 'promo-banner-title';
    titleEl.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) title.append(n.textContent);
      else if (/^(STRONG|B|EM|I)$/.test(n.nodeName)) {
        const em = document.createElement(/^(STRONG|B)$/.test(n.nodeName) ? 'strong' : 'em');
        em.textContent = n.textContent;
        title.append(em);
      } else title.append(n.textContent);
    });
    inner.append(title);

    const cta = document.createElement('a');
    cta.className = 'promo-banner-cta';
    cta.href = href.origin === window.location.origin ? `${href.pathname}${href.search}${href.hash}` : href.href;
    cta.textContent = link.textContent.trim();
    inner.append(cta);

    banner.append(inner);
    return banner;
  } catch {
    return null;
  }
}

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
  // Contact page: wrap section content in a contact block if not already present
  if (path === '/contact') {
    const section = main.querySelector(':scope > div');
    if (section && !section.querySelector('.contact')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'contact';
      while (section.firstChild) wrapper.appendChild(section.firstChild);
      section.appendChild(wrapper);
    }
  }
}

// Highlight the jump-nav link for the section currently scrolled to.
function trackJumpNav(nav) {
  const links = [...nav.querySelectorAll('a')];
  const targets = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))));
  let ticking = false;
  const update = () => {
    ticking = false;
    const offset = nav.offsetHeight + 24;
    let active = -1;
    targets.forEach((t, i) => {
      if (t && t.getBoundingClientRect().top <= offset) active = i;
    });
    links.forEach((a, i) => {
      if (i === active) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

// A paragraph made up only of in-page links (e.g. "Schedule | Stats | Hotel")
// becomes a sticky jump nav of pill buttons. It is moved out to be a direct
// child of <main>, splitting its section in two, so it stays pinned for the
// whole page. decorateSections only wraps <div>s, so the <nav> stays as-is.
function buildJumpNav(main) {
  const isSeparator = (n) => n.nodeType === Node.TEXT_NODE && /^[\s|•·/]*$/.test(n.textContent);
  const p = [...main.querySelectorAll(':scope > div > p')].find((el) => {
    const links = [...el.querySelectorAll('a')];
    return links.length > 1
      && links.every((a) => a.getAttribute('href')?.startsWith('#'))
      && [...el.childNodes].every((n) => n.nodeName === 'A' || isSeparator(n));
  });
  if (!p) return;

  const nav = document.createElement('nav');
  nav.className = 'jump-nav';
  nav.setAttribute('aria-label', 'On this page');
  const list = document.createElement('ul');
  p.querySelectorAll('a').forEach((a) => {
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
  });
  nav.append(list);

  const section = p.parentElement;
  const rest = document.createElement('div');
  while (p.nextSibling) rest.append(p.nextSibling);
  p.remove();
  section.after(nav);
  if (rest.children.length) nav.after(rest);
  trackJumpNav(nav);
}

// A section is only shown once every block in it has loaded. The homepage
// authors its hero together with five blocks below it in one section, so the
// hero (the LCP element) waited on all of them. Move everything after a
// leading hero into its own section; .hero-followup keeps the hero section's
// full-bleed styling (see hero.css) so the layout is unchanged.
function splitHeroSection(main) {
  const first = main.querySelector(':scope > div');
  const hero = first?.querySelector(':scope > .hero');
  if (!hero || hero !== first.firstElementChild || !hero.nextElementSibling) return;
  const rest = document.createElement('div');
  rest.className = 'hero-followup';
  while (hero.nextSibling) rest.append(hero.nextSibling);
  first.after(rest);
}

// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  splitHeroSection(main);
  buildJumpNav(main);
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
  const banner = Promise.race([
    fetchBanner(),
    new Promise((resolve) => { setTimeout(() => resolve(null), BANNER_WAIT); }),
  ]);
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), async (section) => {
      await waitForFirstImage(section);
      // Placed before the first section is revealed, so nothing shifts.
      const el = await banner;
      if (el && !doc.querySelector('.promo-banner')) doc.querySelector('header')?.after(el);
    });
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
