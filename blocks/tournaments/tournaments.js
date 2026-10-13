import { optimizedMediaUrl } from '../../scripts/media.js';

const FALLBACK_TOURNAMENTS = [
  {
    logo: '/images/lobstahfest.png',
    name: 'Lobstah Fest 2026',
    date: 'October 2026',
    loc: 'New England',
    format: 'Round Robin',
    link: 'https://www.nes.com/Flier/2569532.pdf',
    status: 'upcoming',
    ages: '10U, 14U',
  },
  {
    logo: '/images/canam.png',
    name: 'CAN/AM Challenge Cup',
    date: 'November 6–8, 2026',
    loc: 'Shelton, CT',
    format: 'Double Elimination',
    link: 'https://www.canamhockey.com/tournaments/tournaments/boys/shelton-november-6-8-2026',
    status: 'upcoming',
    ages: '10U, 14U',
  },
  {
    logo: '/images/mht.png',
    name: 'The Congressional Cup',
    date: 'February 13–15, 2027',
    loc: 'Washington, DC Area',
    format: 'Round Robin + Playoffs',
    link: 'https://myhockeytournaments.com/locations/washington/the-congressional-cup',
    status: 'upcoming',
    ages: '10U, 14U',
  },
];

function splitLinks(cell) {
  const links = [...(cell?.querySelectorAll('a') || [])];
  const isLocal = (a) => new URL(a.href, window.location.href).origin === window.location.origin;
  const external = links.find((a) => !isLocal(a));
  const local = links.find(isLocal);
  return {
    link: external?.href || (links.length ? '' : cell?.textContent?.trim() || ''),
    cta: local ? { href: local.getAttribute('href'), text: local.textContent.trim() } : null,
  };
}

function parseDateRange(dateStr) {
  if (!dateStr) return null;
  const s = dateStr.replace(/\u2013|\u2014/g, '-').trim();

  const rangeMatch = s.match(/^(\w+)\s+(\d+)-(\d+),?\s+(\d{4})$/);
  if (rangeMatch) {
    const [, month, d1, d2, year] = rangeMatch;
    const start = new Date(`${month} ${d1}, ${year}`);
    const end = new Date(`${month} ${d2}, ${year}`);
    if (!Number.isNaN(start.getTime())) return { start, end };
  }

  const crossMatch = s.match(/^(\w+)\s+(\d+),?\s+(\d{4})\s*-\s*(\w+)\s+(\d+),?\s+(\d{4})$/);
  if (crossMatch) {
    const [, m1, d1, y1, m2, d2, y2] = crossMatch;
    const start = new Date(`${m1} ${d1}, ${y1}`);
    const end = new Date(`${m2} ${d2}, ${y2}`);
    if (!Number.isNaN(start.getTime())) return { start, end };
  }

  const monthMatch = s.match(/^(\w+)\s+(\d{4})$/);
  if (monthMatch) {
    const [, month, year] = monthMatch;
    const start = new Date(`${month} 1, ${year}`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    if (!Number.isNaN(start.getTime())) return { start, end };
  }

  const singleMatch = s.match(/^(\w+)\s+(\d+),?\s+(\d{4})$/);
  if (singleMatch) {
    const [, month, day, year] = singleMatch;
    const start = new Date(`${month} ${day}, ${year}`);
    if (!Number.isNaN(start.getTime())) return { start, end: start };
  }

  return null;
}

function getBucket(t) {
  const range = parseDateRange(t.date);
  if (!range) return t.status === 'completed' ? 'completed' : 'upcoming';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(range.end);
  end.setHours(23, 59, 59, 999);

  if (today < range.start) return 'upcoming';
  if (today > end) return 'completed';
  return 'live';
}

const STATUS_LABELS = {
  upcoming: 'Upcoming',
  confirmed: 'Confirmed',
  completed: 'Completed',
  postponed: 'Postponed',
  registered: 'Registered',
  champions: 'Champions',
  tbd: 'TBD',
};

function ageChips(ages) {
  return ages.split(',').map((a) => {
    const age = a.trim();
    const cls = age.toLowerCase().includes('10u') ? 't-age-10u' : 't-age-14u';
    return `<span class="t-age ${cls}">${age}</span>`;
  }).join(' ');
}

function renderCard(t) {
  return `
    <div class="t-card">
      <div class="t-head">
        ${t.logo ? `<div class="t-logo-wrap"><img src="${t.logo}" alt="${t.name}" class="t-logo" onerror="this.closest('.t-logo-wrap').style.display='none'"></div>` : ''}
        <h3>${t.name}</h3>
      </div>
      <div class="t-body">
        <div class="t-row"><span class="t-lbl">Dates</span><span class="t-val">${t.date}</span></div>
        <div class="t-row"><span class="t-lbl">Location</span><span class="t-val">${t.loc}</span></div>
        ${t.format ? `<div class="t-row"><span class="t-lbl">Format</span><span class="t-val">${t.format}</span></div>` : ''}
        ${t.ages ? `<div class="t-row"><span class="t-lbl">Age Groups</span><span class="t-val t-ages">${ageChips(t.ages)}</span></div>` : ''}
        <div class="t-row"><span class="t-lbl">Status</span><span class="t-val"><span class="ts ts-${t.status}">${STATUS_LABELS[t.status] || t.status}</span></span></div>
        ${t.link ? `<a href="${t.link}" target="_blank" class="t-link">Learn More &rarr;</a>` : ''}
      </div>
      ${t.cta ? `<a href="${t.cta.href}" class="t-cta">${t.cta.text}</a>` : ''}
    </div>`;
}

function renderSection(title, items, sectionClass) {
  if (!items.length) return '';
  return `
    <div class="t-section ${sectionClass}">
      <h2 class="t-section-title">${title}</h2>
      <div class="t-grid">
        ${items.map(renderCard).join('')}
      </div>
    </div>`;
}

export default function decorate(block) {
  const rows = [...block.children];
  let tournaments = rows.map((row) => {
    const cells = [...row.children];
    if (cells.length < 3) return null;
    const logoImg = cells[0]?.querySelector('img');
    const { link, cta } = splitLinks(cells[5]);
    return {
      logo: optimizedMediaUrl(logoImg?.src || '', 160),
      name: cells[1]?.textContent?.trim() || '',
      date: cells[2]?.textContent?.trim() || '',
      loc: cells[3]?.textContent?.trim() || '',
      format: cells[4]?.textContent?.trim() || '',
      link,
      cta,
      status: (cells[6]?.textContent?.trim() || 'Upcoming').toLowerCase().replace(/\s+/g, '-'),
      ages: cells[7]?.textContent?.trim() || '',
    };
  }).filter(Boolean);

  if (!tournaments.length) tournaments = FALLBACK_TOURNAMENTS;

  const live = tournaments.filter((t) => getBucket(t) === 'live');
  const upcoming = tournaments.filter((t) => getBucket(t) === 'upcoming');
  const completed = tournaments.filter((t) => getBucket(t) === 'completed');

  block.innerHTML = `
    ${renderSection('🏒 Live Tournament', live, 't-section-live')}
    ${renderSection('📅 Upcoming Tournaments', upcoming, 't-section-upcoming')}
    ${renderSection('🏆 Completed Tournaments', completed, 't-section-completed')}
  `;
}
