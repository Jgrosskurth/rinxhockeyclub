/*
 * Trophy Room Block
 * Tabs per team (10U first). Each tab shows the team's championship banners
 * in one horizontal line, then its photo gallery.
 *
 * Images come from GitHub, listed in /data/trophy-room.json by
 * .github/workflows/trophy-gallery.yml:
 *   images/trophyroom-<team>/          banners, in upload order
 *   images/trophyroom-<team>/gallery/  gallery photos, newest first
 *
 * The words are authored in DA, one row per setting: | Team | Item | Text | Link |
 *   | 10U | Tab             | 10U Squirts |  |
 *   | 10U | Banners heading | Awards & Accolades |  |
 *   | 10U | Gallery heading | Photo Gallery |  |
 *   | 10U | <file name, e.g. "3.jpeg"> | caption | optional URL |
 * Anything left blank falls back to a default (a banner's caption comes from
 * its file name). A row with an image in the Item cell adds an extra banner.
 * A first row of "Team | Item | Text | Link" is treated as column labels.
 * The page's h1 (and an intro paragraph after it) becomes the title band.
 * Link straight to a team with #14u.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';
import { TEAMS, DEFAULT_TEAM } from '../../scripts/team-feeds.js';

const MANIFEST = '/data/trophy-room.json';

const teamKey = (text) => Object.keys(TEAMS).find((k) => new RegExp(`\\b${k}\\b`, 'i').test(text));

const DEFAULT_HEADINGS = { banners: 'Awards & Accolades', gallery: 'Photo Gallery' };

// File name as authored or as stored ("images/.../3.jpeg"), compared loosely.
const fileKey = (name) => (name || '').split('/').pop().trim().toLowerCase();

function readSettings(block) {
  const settings = {};
  Object.keys(TEAMS).forEach((key) => {
    settings[key] = {
      tab: '', headings: {}, captions: {}, links: {}, banners: [],
    };
  });
  [...block.children].forEach((row) => {
    const [teamCell, itemCell, textCell, linkCell] = row.children;
    const key = teamKey(teamCell?.textContent || '');
    if (!key) return;
    const team = settings[key];
    const text = textCell?.textContent.trim() || '';
    const link = linkCell?.querySelector('a')?.href || linkCell?.textContent.trim() || '';
    const img = itemCell?.querySelector('img');
    if (img) {
      team.banners.push({
        src: img.src, alt: img.alt || text, title: text, link,
      });
      return;
    }
    const item = itemCell?.textContent.trim() || '';
    if (!item || !text) return;
    if (/^tab\b/i.test(item)) team.tab = text;
    else if (/^banners?\b.*heading|^awards?\b.*heading/i.test(item)) team.headings.banners = text;
    else if (/^(gallery|photos?)\b.*heading/i.test(item)) team.headings.gallery = text;
    else {
      team.captions[fileKey(item)] = text;
      if (link) team.links[fileKey(item)] = link;
    }
  });
  return settings;
}

// A caption authored for an image file, matched with or without extension.
function captionFor(team, source) {
  const name = fileKey(source);
  return team.captions[name] || team.captions[name.replace(/\.[a-z0-9]+$/, '')] || '';
}

// A link authored for an image file, matched with or without extension.
function linkFor(team, source) {
  const name = fileKey(source);
  return team.links[name] || team.links[name.replace(/\.[a-z0-9]+$/, '')] || '';
}

const attr = (text) => (text || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function bannerList(list, label) {
  if (!list?.length) return `<p class="tr-empty">${label} banners will hang here.</p>`;
  return `<ul class="tr-rafters" tabindex="0" aria-label="${label} championship banners">${list.map((b, i) => {
    const imgMarkup = b.full
      ? `<img src="${b.full}" alt="${attr(b.alt)}" width="${b.width}" height="${b.height}" loading="lazy" decoding="async">`
      : `<span class="tr-banner-art" data-src="${attr(b.src)}" data-alt="${attr(b.alt || b.title)}"></span>`;
    const inner = `
      <figure>
        ${b.link
    ? `<a href="${attr(b.link)}" class="tr-banner-link" aria-label="${attr(b.title || b.alt)}">${imgMarkup}</a>`
    : imgMarkup}
        ${b.title ? `<figcaption>${attr(b.title)}</figcaption>` : ''}
      </figure>`;
    return `<li class="tr-banner" style="--i: ${i}">${inner}</li>`;
  }).join('')}</ul>`;
}

// The gallery shows 2 photos a row on phones, 3 on tablets and 5 on desktop.
// Past 3 rows it becomes a carousel of 3-row pages, regrouped whenever the
// screen crosses a breakpoint (rotating a tablet, resizing a window).
const TABLET = window.matchMedia('(min-width: 600px)');
const DESKTOP = window.matchMedia('(min-width: 900px)');

function pageSize() {
  if (DESKTOP.matches) return 15;
  return TABLET.matches ? 9 : 6;
}

// Photo tags: the event (from the photo's gallery sub-folder on GitHub), else
// the month and year it was taken (from its EXIF date). See trophy_gallery.py.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];

function monthYear(iso) {
  const m = (iso || '').match(/^(\d{4})-(\d{2})/);
  return m ? `${MONTHS[+m[2] - 1]} ${m[1]}` : '';
}

const tagOf = (p) => p.event || monthYear(p.taken);

// The tags in a gallery, newest first (by each tag's latest photo).
function tagList(photos) {
  const latest = new Map();
  photos.forEach((p) => {
    if (!p.tag) return;
    const when = p.taken || p.added || '';
    if (!latest.has(p.tag) || when > latest.get(p.tag)) latest.set(p.tag, when);
  });
  return [...latest.keys()].sort((a, b) => latest.get(b).localeCompare(latest.get(a)));
}

function galleryList(photos, label, size, showTags) {
  if (!photos?.length) return `<p class="tr-empty">${label} photos are on the way.</p>`;
  const items = photos.map((p, i) => `
    <li>
      <button type="button" class="tr-thumb" data-index="${i}" aria-label="Open photo ${i + 1} of ${photos.length}: ${attr(p.alt)}">
        <img src="${p.thumb}"${p.small ? ` srcset="${p.small} 400w, ${p.thumb} 800w" sizes="(min-width: 900px) 20vw, (min-width: 600px) 33vw, 50vw"` : ''} alt="${attr(p.alt)}" width="${p.thumbWidth}" height="${p.thumbHeight}" loading="lazy" decoding="async">
        ${showTags && p.tag ? `<span class="tr-tag" aria-hidden="true">${attr(p.tag)}</span>` : ''}
      </button>
    </li>`);
  if (items.length <= size) return `<ul class="tr-gallery">${items.join('')}</ul>`;
  const pages = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return `<div class="tr-pages" tabindex="0" role="region" aria-label="${label} photos">
    ${pages.map((page, i) => `<ul class="tr-gallery tr-page" aria-label="Page ${i + 1} of ${pages.length}">${page.join('')}</ul>`).join('')}
  </div>`;
}

const ARROW = (d) => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function pageControls(key) {
  return `<div class="tr-page-ctrl" hidden>
    <button type="button" class="tr-page-btn" data-dir="-1" aria-controls="tr-panel-${key}" aria-label="Previous page of photos">${ARROW('M15 5l-7 7 7 7')}</button>
    <span class="tr-page-count" aria-live="polite"></span>
    <button type="button" class="tr-page-btn" data-dir="1" aria-controls="tr-panel-${key}" aria-label="Next page of photos">${ARROW('M9 5l7 7-7 7')}</button>
  </div>`;
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The photos a panel shows under its current tag filter.
const visiblePhotos = (panel, photos) => (panel.trTag
  ? photos.filter((p) => p.tag === panel.trTag)
  : photos);

// Tag filter buttons: All photos, then each event / month. Only worth showing
// when there is more than one way to slice the gallery.
function filterBar(key, photos) {
  const tags = tagList(photos);
  const untagged = photos.some((p) => !p.tag);
  if (!tags.length || (tags.length === 1 && !untagged)) return '';
  return `<div class="tr-filters" role="group" aria-label="Show photos from">
      ${['', ...tags].map((t) => `<button type="button" class="tr-filter" data-tag="${attr(t)}" aria-pressed="${!t}" aria-controls="tr-panel-${key}">${t ? attr(t) : 'All photos'}</button>`).join('')}
    </div>`;
}

// (Re)build one panel's gallery for the current page size and filter.
function renderGallery(panel, allPhotos, label) {
  const body = panel.querySelector('.tr-photos-body');
  const ctrl = panel.querySelector('.tr-page-ctrl');
  const photos = visiblePhotos(panel, allPhotos);
  panel.trObserver?.disconnect();
  // Corner tags only help when photos differ (the filter buttons are shown)
  // and no filter is picked; a single shared tag is in the viewer caption.
  const showTags = !panel.trTag && !!panel.querySelector('.tr-filter');
  body.innerHTML = galleryList(photos, label, pageSize(), showTags);
  const track = body.querySelector('.tr-pages');
  ctrl.hidden = !track;
  if (!track) return;
  const [prev, next] = ctrl.querySelectorAll('.tr-page-btn');
  const count = ctrl.querySelector('.tr-page-count');
  const total = track.children.length;
  const sync = () => {
    const page = track.clientWidth ? Math.round(track.scrollLeft / track.clientWidth) + 1 : 1;
    count.textContent = `${page} / ${total}`;
    prev.disabled = page <= 1;
    next.disabled = page >= total;
  };
  track.addEventListener('scroll', sync, { passive: true });
  panel.trObserver = new ResizeObserver(sync);
  panel.trObserver.observe(track);
  sync();
}

// Arrow buttons page whichever track the panel currently holds.
function wireControls(panel) {
  panel.querySelectorAll('.tr-page-btn').forEach((btn) => btn.addEventListener('click', () => {
    const track = panel.querySelector('.tr-pages');
    if (!track) return;
    track.scrollBy({ left: track.clientWidth * Number(btn.dataset.dir), behavior: reduceMotion() ? 'auto' : 'smooth' });
  }));
}

// One shared viewer: a modal <dialog> that closes on Esc or a backdrop tap.
function buildViewer() {
  const dialog = document.createElement('dialog');
  dialog.className = 'tr-viewer';
  dialog.setAttribute('closedby', 'any');
  dialog.setAttribute('aria-label', 'Photo viewer');
  dialog.innerHTML = `
    <figure class="tr-viewer-frame"><figcaption><span class="tr-viewer-caption"></span><span class="tr-viewer-count"></span></figcaption></figure>
    <button type="button" class="tr-viewer-btn tr-viewer-prev" aria-label="Previous photo">‹</button>
    <button type="button" class="tr-viewer-btn tr-viewer-next" aria-label="Next photo">›</button>
    <button type="button" class="tr-viewer-close" aria-label="Close">&times;</button>`;
  // Safari has no closedby yet: close on a click outside the photo frame.
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  }
  document.body.append(dialog);
  return dialog;
}

function openViewer(dialog, photos, start) {
  let index = start;
  const caption = dialog.querySelector('figcaption');
  let img = dialog.querySelector('.tr-viewer-img');
  if (!img) {
    img = document.createElement('img');
    img.className = 'tr-viewer-img';
    caption.before(img);
  }
  const show = (i) => {
    index = (i + photos.length) % photos.length;
    const p = photos[index];
    img.src = p.full;
    img.alt = p.alt;
    img.width = p.width;
    img.height = p.height;
    caption.querySelector('.tr-viewer-caption').textContent = [p.caption, p.tag].filter(Boolean).join(' · ');
    caption.querySelector('.tr-viewer-count').textContent = `${index + 1} / ${photos.length}`;
  };
  const many = photos.length > 1;
  dialog.querySelectorAll('.tr-viewer-btn').forEach((b) => { b.hidden = !many; });
  dialog.querySelector('.tr-viewer-prev').onclick = () => show(index - 1);
  dialog.querySelector('.tr-viewer-next').onclick = () => show(index + 1);
  dialog.querySelector('.tr-viewer-close').onclick = () => dialog.close();
  dialog.onkeydown = (e) => {
    if (!many) return;
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  };
  show(start);
  dialog.showModal();
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const settings = readSettings(block);
  const teams = Object.values(TEAMS).map((t) => ({ ...t, label: settings[t.key].tab || t.label }));

  // Title band from the page heading that precedes the block.
  const section = block.closest('.section');
  const h1 = section?.querySelector('h1');
  let head = '';
  if (h1 && !block.contains(h1)) {
    const intro = h1.nextElementSibling?.tagName === 'P' ? h1.nextElementSibling : null;
    head = `<header class="tr-head"><h1>${h1.innerHTML}</h1>${intro ? `<p>${intro.innerHTML}</p>` : ''}</header>`;
    const wrapper = h1.parentElement;
    h1.remove();
    intro?.remove();
    if (wrapper && !wrapper.children.length) wrapper.remove();
  }

  let manifest = {};
  try {
    const resp = await fetch(MANIFEST);
    if (resp.ok) manifest = await resp.json();
  } catch {
    // Banners and galleries show their empty state.
  }

  // GitHub banners first (in upload order), then any added in the block;
  // captions and links authored in DA win over file-name captions.
  const banners = {};
  const gallery = {};
  teams.forEach(({ key }) => {
    const team = settings[key];
    banners[key] = [
      ...(manifest[key]?.banners || []).map((b) => {
        const title = captionFor(team, b.source) || b.title;
        const link = linkFor(team, b.source);
        return {
          ...b, title, alt: title ? `${title} banner` : b.alt, link,
        };
      }),
      ...team.banners,
    ];
    gallery[key] = (manifest[key]?.gallery || []).map((p) => {
      const caption = captionFor(team, p.source);
      const tag = tagOf(p);
      return {
        ...p, caption, tag, alt: [caption || p.alt, tag].filter(Boolean).join(', '),
      };
    });
  });

  const fromHash = teamKey(window.location.hash.slice(1));
  let current = fromHash || DEFAULT_TEAM;

  block.innerHTML = `
    ${head}
    <div class="tr-inner">
      <div class="tr-tabs" role="tablist" aria-label="Team">
        ${teams.map((t) => `<button type="button" role="tab" id="tr-tab-${t.key}" aria-controls="tr-panel-${t.key}" aria-selected="${t.key === current}" tabindex="${t.key === current ? 0 : -1}">${t.label}</button>`).join('')}
      </div>
      ${teams.map((t) => `
        <section class="tr-panel" id="tr-panel-${t.key}" role="tabpanel" aria-labelledby="tr-tab-${t.key}"${t.key === current ? '' : ' hidden'}>
          <div class="tr-hall">
            <h2>${attr(settings[t.key].headings.banners || DEFAULT_HEADINGS.banners)}</h2>
            ${bannerList(banners[t.key], t.label)}
          </div>
          <div class="tr-photos">
            <div class="tr-photos-head">
              <h2>${attr(settings[t.key].headings.gallery || DEFAULT_HEADINGS.gallery)}</h2>
              ${pageControls(t.key)}
            </div>
            ${filterBar(t.key, gallery[t.key])}
            <div class="tr-photos-body"></div>
          </div>
        </section>`).join('')}
    </div>`;

  // Banner art: optimized pictures from the authored images.
  block.querySelectorAll('.tr-banner-art').forEach((span) => {
    const pic = createOptimizedPicture(span.dataset.src, span.dataset.alt, false, [{ media: '(min-width: 600px)', width: '600' }, { width: '400' }]);
    span.replaceWith(pic);
  });

  // Tabs: click, or arrow keys between tabs.
  const tabs = [...block.querySelectorAll('[role="tab"]')];
  const select = (key, focus) => {
    current = key;
    tabs.forEach((tab) => {
      const on = tab.id === `tr-tab-${key}`;
      tab.setAttribute('aria-selected', on);
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    block.querySelectorAll('.tr-panel').forEach((panel) => {
      panel.hidden = panel.id !== `tr-panel-${key}`;
    });
    window.history.replaceState(null, '', `#${key}`);
  };
  tabs.forEach((tab, i) => {
    const key = tab.id.replace('tr-tab-', '');
    tab.addEventListener('click', () => select(key));
    tab.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = tabs[(i + step + tabs.length) % tabs.length];
      select(next.id.replace('tr-tab-', ''), true);
    });
  });

  // Galleries: built now, regrouped into pages when a breakpoint is crossed.
  const panels = teams.map((t) => ({ t, panel: block.querySelector(`#tr-panel-${t.key}`) }));
  const renderAll = () => panels.forEach(({ t, panel }) => {
    renderGallery(panel, gallery[t.key], t.label);
  });
  panels.forEach(({ panel }) => wireControls(panel));
  panels.forEach(({ t, panel }) => panel.querySelectorAll('.tr-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      panel.trTag = btn.dataset.tag;
      panel.querySelectorAll('.tr-filter').forEach((b) => b.setAttribute('aria-pressed', b === btn));
      renderGallery(panel, gallery[t.key], t.label);
    });
  }));
  renderAll();
  [TABLET, DESKTOP].forEach((mq) => mq.addEventListener('change', renderAll));

  // Gallery viewer (delegated, so it survives a regroup).
  let viewer;
  panels.forEach(({ t, panel }) => {
    panel.querySelector('.tr-photos-body').addEventListener('click', (e) => {
      const thumb = e.target.closest('.tr-thumb');
      if (!thumb) return;
      viewer ||= buildViewer();
      openViewer(viewer, visiblePhotos(panel, gallery[t.key]), Number(thumb.dataset.index));
    });
  });
}
