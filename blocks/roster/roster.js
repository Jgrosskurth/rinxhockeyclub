import { optimizedMediaUrl, headshotAttrs, HEADSHOT_ONERROR } from '../../scripts/media.js';

// Shown for players with no authored photo, or whose photo fails to load
const PLACEHOLDER = '/images/headshots/placeholder.png';
const PLACEHOLDER_ONERROR = `if(this.dataset.orig){this.src=this.dataset.orig;this.removeAttribute('data-orig')}else if(!this.dataset.ph){this.dataset.ph=1;this.classList.add('roster-photo-placeholder');this.src='${PLACEHOLDER.replace(/\.png$/, '.webp')}'}else{this.style.visibility='hidden'}`;

// Position groups, in page order. The card keeps the authored label ("Offense");
// the group heading uses the hockey term.
const GROUPS = [
  { key: 'forwards', title: 'Forwards' },
  { key: 'defense', title: 'Defense' },
  { key: 'goalies', title: 'Goalies' },
  { key: 'reserves', title: 'Reserves' },
  { key: 'players', title: 'Players' },
];

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
}[c]));

function getInitials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0])
    .join('')
    .toUpperCase();
}

function classify(note) {
  const n = (note || '').toLowerCase();
  if (n.includes('reserve') || n.includes('practice')) return { group: 'reserves', pos: 'reserve' };
  if (n.includes('goalie')) return { group: 'goalies', pos: 'goalie' };
  if (n.includes('defense')) return { group: 'defense', pos: 'defense' };
  if (n.includes('offense') || n.includes('forward')) return { group: 'forwards', pos: 'offense' };
  return { group: 'players', pos: 'other' };
}

// by jersey number; players without a number go last, by name
function byNumber(a, b) {
  const na = parseInt(a.num, 10);
  const nb = parseInt(b.num, 10);
  if (Number.isNaN(na) !== Number.isNaN(nb)) return Number.isNaN(na) ? 1 : -1;
  if (!Number.isNaN(na) && na !== nb) return na - nb;
  return a.name.localeCompare(b.name);
}

function buildCard(p, index) {
  let loading = 'loading="lazy"';
  if (index === 0) loading = 'loading="eager" fetchpriority="high"';
  else if (index < 8) loading = 'loading="eager"';
  const photo = p.img
    ? `<img src="${escapeHtml(p.img)}" alt="" width="120" height="150" ${loading} onerror="${PLACEHOLDER_ONERROR}">`
    : `<img ${headshotAttrs(PLACEHOLDER)} alt="" class="roster-photo-placeholder" width="120" height="150" ${loading} data-ph="1" onerror="${PLACEHOLDER_ONERROR}">`;
  const label = p.num ? `<span class="roster-visually-hidden">Number ${escapeHtml(p.num)}, </span>` : '';
  return `
    <li class="roster-card" data-pos="${p.pos}">
      <div class="roster-photo">${photo}</div>
      <div class="roster-card-body">
        <span class="roster-num" aria-hidden="true">${escapeHtml(p.num)}</span>
        <div class="roster-id">
          <h3>${label}${escapeHtml(p.name)}</h3>
          ${p.note ? `<span class="roster-pos roster-pos-${p.pos}">${escapeHtml(p.note)}</span>` : ''}
        </div>
      </div>
    </li>`;
}

function buildGroup(g, players, startIndex) {
  return `
    <section class="roster-group" aria-labelledby="roster-${g.key}">
      <h2 class="section-title" id="roster-${g.key}">${g.title}<span class="roster-count">${players.length}<span class="roster-visually-hidden"> players</span></span></h2>
      <ul class="roster-cards">${players.map((p, i) => buildCard(p, startIndex + i)).join('')}
      </ul>
    </section>`;
}

function buildCoaches(coaches) {
  return coaches.map((c) => {
    const imgHtml = c.img
      ? `<img ${headshotAttrs(c.img)} alt="" class="coach-photo" width="72" height="72" loading="lazy" onerror="${HEADSHOT_ONERROR}">`
      : '';
    return `
      <li class="roster-coach">
        ${imgHtml}
        <div class="coach-initials" aria-hidden="true"${c.img ? ' style="display:none"' : ''}>${escapeHtml(c.initials || getInitials(c.name || ''))}</div>
        <div>
          <h3>${escapeHtml(c.name)}</h3>
          <p>${escapeHtml(c.role)}</p>
        </div>
      </li>`;
  }).join('');
}

export default function decorate(block) {
  const rows = [...block.children];
  const players = rows.map((row) => {
    const cells = [...row.children];
    const name = cells[0]?.textContent?.trim() || '';
    const note = cells[1]?.textContent?.trim() || '';
    const imgEl = cells[2]?.querySelector('img');
    let imgSrc = optimizedMediaUrl(imgEl?.src || '', 240);
    if (imgSrc.includes('about:error') || imgSrc.includes('about:blank')) imgSrc = '';
    const num = cells[3]?.textContent?.trim() || '';
    return {
      name, note, img: imgSrc, num, ...classify(note),
    };
  }).filter((p) => p.name);

  // Read coaches from section default content (pipe-delimited paragraphs after the block)
  const section = block.closest('.section');
  const sectionPs = [...(section?.querySelectorAll(':scope > p') || [])];
  const coachData = sectionPs
    .filter((p) => p.textContent.includes('|'))
    .map((p) => {
      const parts = p.textContent.split('|');
      return {
        name: parts[0]?.trim(),
        initials: parts[1]?.trim(),
        role: parts[2]?.trim(),
        img: parts[3]?.trim() || '',
      };
    });
  sectionPs.filter((p) => p.textContent.includes('|')).forEach((p) => p.remove());

  // Determine which coaches to show
  const is14u = window.location.pathname.includes('14u');
  const defaultCoaches = is14u
    ? [
      {
        name: 'Greg Skillman', initials: 'GS', role: 'Head Coach • 14U Bantam', img: '/images/headshots/coachskillman.png',
      },
      {
        name: 'Joe Capozzoli', initials: 'JC', role: 'Assistant Coach • 14U Bantam', img: '/images/headshots/joecap.png',
      },
      {
        name: 'Jon Mazzarone', initials: 'JM', role: 'Assistant Coach • 14U Bantam', img: '/images/headshots/coachmazz.png',
      },
    ]
    : [
      {
        name: "Dan O'Donoghue", initials: 'DO', role: 'Head Coach • 10U Squirts', img: '/images/headshots/coachdan.jpg',
      },
      {
        name: 'Joe Capozzoli', initials: 'JC', role: 'Assistant Coach • 10U Squirts', img: '/images/headshots/joecap.png',
      },
        {
        name: 'Chris Daly', initials: 'CD', role: 'Assistant Coach • 10U Squirts', img: '/images/headshots/coachdaly.png',
      },
    ];

  const coaches = coachData.length ? coachData : defaultCoaches;

  let index = 0;
  const groups = GROUPS
    .map((g) => ({ g, list: players.filter((p) => p.group === g.key).sort(byNumber) }))
    .filter(({ list }) => list.length)
    .map(({ g, list }) => {
      const html = buildGroup(g, list, index);
      index += list.length;
      return { key: g.key, html };
    });
  // Goalies and Reserves are small groups: they share one row on wide screens
  const small = groups.filter((x) => x.key === 'goalies' || x.key === 'reserves');
  const pairSmall = small.length === 2 && small.every((x) => (x.html.match(/class="roster-card"/g) || []).length <= 2);
  const groupsHtml = groups.map((x) => {
    if (!pairSmall || (x.key !== 'goalies' && x.key !== 'reserves')) return x.html;
    if (x.key === 'goalies') return `<div class="roster-pair">${x.html}`;
    return `${x.html}</div>`;
  }).join('');

  block.innerHTML = `
    <p class="roster-stats-link"><a href="${is14u ? '/stats-14u' : '/stats'}">Season stats →</a></p>
    ${groupsHtml}
    <section class="roster-coaches" aria-labelledby="roster-coaches">
      <h2 class="section-title" id="roster-coaches">Coaching Staff</h2>
      <ul class="roster-coach-list">${buildCoaches(coaches)}
      </ul>
    </section>
  `;
}
