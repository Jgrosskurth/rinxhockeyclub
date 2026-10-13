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

function galleryList(photos, label) {
  if (!photos?.length) return `<p class="tr-empty">${label} photos are on the way.</p>`;
  return `<ul class="tr-gallery">${photos.map((p, i) => `
    <li>
      <button type="button" class="tr-thumb" data-index="${i}" aria-label="Open photo ${i + 1} of ${photos.length}: ${attr(p.alt)}">
        <img src="${p.thumb}" alt="${attr(p.alt)}" width="${p.thumbWidth}" height="${p.thumbHeight}" loading="lazy" decoding="async">
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
    caption.querySelector('.tr-viewer-caption').textContent = p.caption || '';
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
      return { ...p, caption, alt: caption || p.alt };
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
            <h2>${attr(settings[t.key].headings.gallery || DEFAULT_HEADINGS.gallery)}</h2>
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
