/*
 * Trophy Room Block ("The Banner Wall")
 * Every championship banner on one wall (filter: All / 10U / 14U), each with its
 * team, title and, where the site has the tournament's box scores, its record;
 * then each team's photos, grouped by event or month in their own shapes, with
 * a full-screen viewer.
 *
 * Images come from GitHub, listed in /data/trophy-room.json by
 * .github/workflows/trophy-gallery.yml:
 *   images/trophyroom-<team>/          banners, in upload order
 *   images/trophyroom-<team>/gallery/  gallery photos, newest first
 *
 * The words are authored in DA, one row per setting: | Team | Item | Text | Link |
 *   | 10U | Tab             | 10U Squirts |  |
 *   | 10U | <file name, e.g. "3.jpeg"> | caption | optional URL |
 * Anything left blank falls back to a default (a banner's caption comes from
 * its file name). A row with an image in the Item cell adds an extra banner.
 * A first row of "Team | Item | Text | Link" is treated as column labels.
 * ("Banners heading" / "Gallery heading" rows are no longer used: the wall and
 * the gallery are club-wide, headed "Championship Banners" / "From the Season".)
 * The page's h1 (and an intro paragraph after it) becomes the title band.
 * Link straight to a team's photos with #14u.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';
import { TEAMS, DEFAULT_TEAM } from '../../scripts/team-feeds.js';

const MANIFEST = '/data/trophy-room.json';
const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

// Banners that link to a tournament page the site keeps box scores for get
// their record from that feed (see .github/scripts/pull_gamesheet_boxscores.py).
const RESULTS = { '/mid-atlantic-fall-classic-schedule': 'boxscores-mid-atlantic' };

const HEADINGS = { banners: 'Championship Banners', gallery: 'From the Season' };

const teamKey = (text) => Object.keys(TEAMS).find((k) => new RegExp(`\\b${k}\\b`, 'i').test(text));

// File name as authored or as stored ("images/.../3.jpeg"), compared loosely.
const fileKey = (name) => (name || '').split('/').pop().trim().toLowerCase();

function readSettings(block) {
  const settings = {};
  Object.keys(TEAMS).forEach((key) => {
    settings[key] = {
      tab: '', captions: {}, links: {}, banners: [],
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
    // (old "... heading" rows are ignored)
    if (/^tab\b/i.test(item)) team.tab = text;
    else if (!/heading/i.test(item)) {
      team.captions[fileKey(item)] = text;
      if (link) team.links[fileKey(item)] = link;
    }
  });
  return settings;
}

// A caption / link authored for an image file, matched with or without extension.
function authored(map, source) {
  const name = fileKey(source);
  return map[name] || map[name.replace(/\.[a-z0-9]+$/, '')] || '';
}

const attr = (text) => (text || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];

function monthYear(iso) {
  const m = (iso || '').match(/^(\d{4})-(\d{2})/);
  return m ? `${MONTHS[+m[2] - 1]} ${m[1]}` : '';
}

// A photo's group: its event (gallery sub-folder on GitHub), else the month it
// was taken (EXIF). Its month: EXIF date, else its event folder's year/month.
const tagOf = (p) => p.event || monthYear(p.taken);
const dateOf = (p) => monthYear(p.taken) || monthYear(p.eventDate);

const pathOf = (link) => {
  try {
    return new URL(link, window.location.href).pathname.replace(/\/$/, '');
  } catch {
    return '';
  }
};

// "4-0" and "October 2026" from a tournament's box scores, or null.
async function tournamentResult(link) {
  const feed = RESULTS[pathOf(link)];
  if (!feed) return null;
  try {
    const resp = await fetch(`${FEED_BASE}/${feed}.json`);
    if (!resp.ok) return null;
    const games = ((await resp.json()).games || [])
      .map((g) => g.detail).filter((d) => d?.teams?.length === 2);
    if (!games.length) return null;
    let w = 0;
    let l = 0;
    let t = 0;
    games.forEach((d) => {
      const us = d.teams.find((x) => /\brinx\b/i.test(x.name)) || d.teams[0];
      const them = d.teams.find((x) => x !== us);
      if (+us.total > +them.total) w += 1;
      else if (+us.total < +them.total) l += 1;
      else t += 1;
    });
    const months = [...new Set(games.map((d) => monthYear(d.isoDate)).filter(Boolean))];
    return { record: `${w}-${l}${t ? `-${t}` : ''}`, when: months.length === 1 ? months[0] : '' };
  } catch {
    return null;
  }
}

function bannerCard(b, eager) {
  const art = b.full
    ? `<img src="${b.full}" alt="${attr(b.alt)}" width="${b.width}" height="${b.height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`
    : `<span class="tr-banner-art" data-src="${attr(b.src)}" data-alt="${attr(b.alt || b.title)}"></span>`;
  const results = b.link && RESULTS[pathOf(b.link)];
  return `
        <li class="tr-banner" data-team="${b.team}">
          <div class="tr-hang"><span class="tr-hoist">${art}</span></div>
          <span class="tr-team">${attr(b.teamLabel)}</span>
          ${b.title ? `<h3 class="tr-banner-title">${attr(b.title)}</h3>` : ''}
          <p class="tr-result" hidden></p>
          ${b.link ? `<a class="tr-more" href="${attr(b.link)}">${results ? 'Tournament results' : 'Details'}</a>` : ''}
        </li>`;
}

// Photos grouped by event / month, newest group first; untagged photos last.
function groups(photos) {
  const latest = new Map();
  const members = new Map();
  photos.forEach((p) => {
    const key = p.tag || '';
    if (!members.has(key)) members.set(key, []);
    members.get(key).push(p);
    const when = p.taken || p.eventDate || p.added || '';
    if (!latest.has(key) || when > latest.get(key)) latest.set(key, when);
  });
  return [...members.keys()]
    .sort((a, b) => (!a) - (!b) || latest.get(b).localeCompare(latest.get(a)))
    .map((key) => ({ key, photos: members.get(key) }));
}

const isLandscape = (p) => p.thumbWidth / p.thumbHeight > 1.2;

function thumb(p, index, sizes) {
  const ar = (p.thumbWidth / p.thumbHeight).toFixed(2);
  return `<button type="button" class="tr-thumb" data-index="${index}" style="--ar: ${ar}" aria-label="Open photo: ${attr(p.alt)}">
          <img src="${p.thumb}"${p.small ? ` srcset="${p.small} 400w, ${p.thumb} 800w${p.full ? `, ${p.full} 1600w` : ''}" sizes="${sizes}"` : ''} alt="${attr(p.alt)}" width="${p.thumbWidth}" height="${p.thumbHeight}" loading="lazy" decoding="async">
        </button>`;
}

// One team's photos: a heading per group; landscape shots in a mostly-portrait
// group (team photos) get their own row, sized to their shape; the rest flow
// in columns. Returns the markup and the photos in display order (for the viewer).
function teamGallery(photos, label) {
  if (!photos.length) return { html: `<p class="tr-empty">${attr(label)} photos are on the way.</p>`, order: [] };
  const order = [];
  const html = groups(photos).map(({ key, photos: list }) => {
    const land = list.filter(isLandscape);
    const split = land.length && land.length < list.length / 2;
    const wides = split ? land : [];
    const rest = split ? list.filter((p) => !isLandscape(p)) : list;
    const event = key && list[0].event === key;
    const month = event ? dateOf(list[0]) : '';
    const count = `${list.length} photo${list.length === 1 ? '' : 's'}`;
    const tiles = (items, sizes) => items.map((p) => { order.push(p); return thumb(p, order.length - 1, sizes); }).join('');
    return `
      <div class="tr-group">
        <h3>${attr(key || 'More photos')} <small>${[month, count].filter(Boolean).map(attr).join(' · ')}</small></h3>
        ${wides.length ? `<div class="tr-wides">${tiles(wides, '(min-width: 900px) 50vw, 100vw')}</div>` : ''}
        ${rest.length ? `<div class="tr-columns">${tiles(rest, '(min-width: 600px) 33vw, 50vw')}</div>` : ''}
      </div>`;
  }).join('');
  return { html, order };
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
    caption.querySelector('.tr-viewer-caption').textContent = [p.caption, p.event, p.date].filter(Boolean).join(' · ');
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
    // The wall and galleries show their empty state.
  }

  // GitHub banners first (in upload order), then any added in the block;
  // captions and links authored in DA win over file-name captions.
  const banners = teams.flatMap(({ key, label }) => {
    const team = settings[key];
    return [
      ...(manifest[key]?.banners || []).map((b) => {
        const title = authored(team.captions, b.source) || b.title;
        return {
          ...b, title, alt: title ? `${title} banner` : b.alt, link: authored(team.links, b.source),
        };
      }),
      ...team.banners,
    ].map((b) => ({ ...b, team: key, teamLabel: label }));
  });
  const galleries = Object.fromEntries(teams.map(({ key, label }) => {
    const photos = (manifest[key]?.gallery || []).map((p) => {
      const caption = authored(settings[key].captions, p.source);
      const date = dateOf(p);
      return {
        ...p, caption, tag: tagOf(p), date, alt: [caption || p.alt, p.event, date].filter(Boolean).join(', '),
      };
    });
    return [key, teamGallery(photos, label)];
  }));

  let current = teamKey(window.location.hash.slice(1)) || DEFAULT_TEAM;
  const showFilter = new Set(banners.map((b) => b.team)).size > 1;

  block.innerHTML = `
    ${head}
    <section class="tr-hall" aria-labelledby="tr-banners-h">
      <div class="tr-hall-row">
        <h2 class="section-title" id="tr-banners-h">${HEADINGS.banners}</h2>
        ${showFilter ? `<div class="tr-filter" role="group" aria-label="Show banners for">
          <button type="button" data-team="" aria-pressed="true">All teams</button>
          ${teams.map((t) => `<button type="button" data-team="${t.key}" aria-pressed="false">${attr(t.label)}</button>`).join('')}
        </div>` : ''}
      </div>
      ${banners.length
    ? `<ul class="tr-wall" tabindex="0" aria-label="Championship banners">${banners.map((b, i) => bannerCard(b, i < 4)).join('')}
      </ul>`
    : '<p class="tr-empty">Championship banners will hang here.</p>'}
    </section>
    <section class="tr-photos" aria-labelledby="tr-photos-h"><div class="tr-photos-inner">
      <h2 class="section-title" id="tr-photos-h">${HEADINGS.gallery}</h2>
      <div class="tr-tabs" role="tablist" aria-label="Team">
        ${teams.map((t) => `<button type="button" role="tab" id="tr-tab-${t.key}" aria-controls="tr-panel-${t.key}" aria-selected="${t.key === current}" tabindex="${t.key === current ? 0 : -1}">${attr(t.label)}</button>`).join('')}
      </div>
      ${teams.map((t) => `
      <div class="tr-panel" id="tr-panel-${t.key}" role="tabpanel" aria-labelledby="tr-tab-${t.key}"${t.key === current ? '' : ' hidden'}>${galleries[t.key].html}
      </div>`).join('')}
    </div></section>`;

  // Banner art authored in the block: optimized pictures.
  block.querySelectorAll('.tr-banner-art').forEach((span) => {
    const pic = createOptimizedPicture(span.dataset.src, span.dataset.alt, false, [{ media: '(min-width: 600px)', width: '600' }, { width: '400' }]);
    span.replaceWith(pic);
  });

  // Records for banners that link to a tournament with box scores.
  block.querySelectorAll('.tr-banner').forEach((li, i) => {
    const b = banners[i];
    if (!b?.link || !RESULTS[pathOf(b.link)]) return;
    tournamentResult(b.link).then((res) => {
      if (!res) return;
      const p = li.querySelector('.tr-result');
      p.innerHTML = `<span class="tr-record">${attr(res.record)}</span><span class="tr-sr"> tournament record</span>${res.when && !b.title.includes(res.when) ? ` ${attr(res.when)}` : ''}`;
      p.hidden = false;
    });
  });

  // Wall filter: All / one team.
  const filterBtns = [...block.querySelectorAll('.tr-filter button')];
  filterBtns.forEach((btn) => btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', b === btn));
    block.querySelectorAll('.tr-banner').forEach((li) => {
      li.hidden = !!btn.dataset.team && li.dataset.team !== btn.dataset.team;
    });
  }));

  // Gallery tabs: click, or arrow keys between tabs.
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

  // Photo viewer, over the team's photos in display order.
  let viewer;
  teams.forEach((t) => {
    block.querySelector(`#tr-panel-${t.key}`).addEventListener('click', (e) => {
      const btn = e.target.closest('.tr-thumb');
      if (!btn) return;
      viewer ||= buildViewer();
      openViewer(viewer, galleries[t.key].order, Number(btn.dataset.index));
    });
  });
}
