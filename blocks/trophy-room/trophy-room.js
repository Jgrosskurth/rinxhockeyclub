/*
 * Trophy Room Block
 * Tabs per team (10U first). Each tab shows the team's championship banners,
 * then its photo gallery.
 *
 * Authoring: one row per championship --
 *   | team (e.g. "10U Squirts") | banner image | title (e.g. "2025 LIAHL Tier 3 Champions") |
 * The page's h1 (and an intro paragraph after it) becomes the title band.
 *
 * Gallery photos come from the trophy-room/<team>/ folders in GitHub, listed in
 * /data/trophy-room.json by .github/workflows/trophy-gallery.yml.
 * Link straight to a team with #14u.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';
import { TEAMS, DEFAULT_TEAM } from '../../scripts/team-feeds.js';

const MANIFEST = '/data/trophy-room.json';

const teamKey = (text) => Object.keys(TEAMS).find((k) => new RegExp(`\\b${k}\\b`, 'i').test(text));

function readBanners(block) {
  const banners = {};
  [...block.children].forEach((row) => {
    const [teamCell, imageCell, titleCell] = row.children;
    const key = teamKey(teamCell?.textContent || '');
    const img = imageCell?.querySelector('img');
    if (!key || !img) return;
    (banners[key] ||= []).push({
      src: img.src,
      alt: img.alt,
      title: titleCell?.textContent.trim() || '',
    });
  });
  return banners;
}

function bannerList(list, label) {
  if (!list?.length) return `<p class="tr-empty">${label} championship banners will hang here.</p>`;
  return `<ul class="tr-rafters">${list.map((b, i) => `
    <li class="tr-banner" style="--i: ${i}">
      <figure>
        <span class="tr-banner-art" data-src="${b.src}" data-alt="${(b.alt || b.title).replace(/"/g, '&quot;')}"></span>
        ${b.title ? `<figcaption>${b.title}</figcaption>` : ''}
      </figure>
    </li>`).join('')}</ul>`;
}

function galleryList(photos, label) {
  if (!photos?.length) return `<p class="tr-empty">${label} photos are on the way.</p>`;
  return `<ul class="tr-gallery">${photos.map((p, i) => `
    <li>
      <button type="button" class="tr-thumb" data-index="${i}" aria-label="Open photo ${i + 1} of ${photos.length}: ${p.alt}">
        <img src="${p.thumb}" alt="${p.alt}" width="${p.thumbWidth}" height="${p.thumbHeight}" loading="lazy" decoding="async">
      </button>
    </li>`).join('')}</ul>`;
}

// One shared viewer: a modal <dialog> that closes on Esc or a backdrop tap.
function buildViewer() {
  const dialog = document.createElement('dialog');
  dialog.className = 'tr-viewer';
  dialog.setAttribute('closedby', 'any');
  dialog.setAttribute('aria-label', 'Photo viewer');
  dialog.innerHTML = `
    <figure class="tr-viewer-frame"><figcaption></figcaption></figure>
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
  // The photo element is created on first open and given its source straight
  // away, so the viewer never holds an image without one.
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
    caption.textContent = `${index + 1} / ${photos.length}`;
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
  const banners = readBanners(block);
  const teams = Object.values(TEAMS);

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

  let gallery = {};
  try {
    const resp = await fetch(MANIFEST);
    if (resp.ok) gallery = await resp.json();
  } catch {
    // Galleries show their empty state.
  }

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
            <h2>Championship Banners</h2>
            ${bannerList(banners[t.key], t.label)}
          </div>
          <div class="tr-photos">
            <h2>Photo Gallery</h2>
            ${galleryList(gallery[t.key], t.label)}
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

  // Gallery viewer.
  let viewer;
  block.querySelectorAll('.tr-gallery').forEach((list) => {
    const key = list.closest('.tr-panel').id.replace('tr-panel-', '');
    list.addEventListener('click', (e) => {
      const thumb = e.target.closest('.tr-thumb');
      if (!thumb) return;
      viewer ||= buildViewer();
      openViewer(viewer, gallery[key], Number(thumb.dataset.index));
    });
  });
}
