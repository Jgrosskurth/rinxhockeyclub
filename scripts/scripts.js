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

// Site-wide announcement strip under the header. Built in the eager phase,
// before first paint, so it never pushes the page down. Not shown on the page
// it links to. To retire it, set PROMO to null.
const PROMO = {
  href: '/mid-atlantic-fall-classic-schedule',
  image: '/images/2026midatlanticchamps-banner.webp',
  lead: '10U Mid-Atlantic Fall Showcase',
  highlight: 'Champions',
  cta: 'View Tournament Details',
};

function buildPromoBanner(doc) {
  const header = doc.querySelector('header');
  if (!PROMO || !header || doc.querySelector('.promo-banner')) return;
  if (window.location.pathname.replace(/\/$/, '') === PROMO.href) return;
  const banner = doc.createElement('aside');
  banner.className = 'promo-banner';
  banner.setAttribute('aria-label', 'Club news');
  banner.innerHTML = `
    <div class="promo-banner-inner">
      <img src="${PROMO.image}" alt="" width="40" height="60" fetchpriority="low">
      <p class="promo-banner-title">${PROMO.lead} <strong>${PROMO.highlight}</strong></p>
      <a class="promo-banner-cta" href="${PROMO.href}">${PROMO.cta}</a>
    </div>`;
  header.after(banner);
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
  buildPromoBanner(doc);
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
