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

// Links in the "links" cell that point to a page on this site (e.g. a
// tournament schedule page) are shown as a button at the bottom of the card;
// the first off-site link stays the "Learn More" link.
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

// Parse a date string like "October 9-11, 2026" or "February 13–15, 2027"
// or "November 6–8, 2026" into { start: Date, end: Date }.
// Returns null if the string can't be parsed.
function parseDateRange(dateStr) {
  if (!dateStr) return null;

  // Normalize dashes
  const s = dateStr.replace(/\u2013|\u2014/g, '-').trim();

  // "Month D1-D2, YYYY"
  const rangeMatch = s.match(/^(\w+)\s+(\d+)-(\d+),?\s+(\d{4})$/);
  if (rangeMatch) {
    const [, month, d1, d2, year] = rangeMatch;
    const start = new Date(`${month} ${d1}, ${year}`);
    const end = new Date(`${month} ${d2}, ${year}`);
    if (!Number.isNaN(start.getTime())) return { start, end };
  }

  // "Month D1, YYYY – Month D2, YYYY" (cross-month)
  const crossMatch = s.match(/^(\w+)\s+(\d+),?\s+(\d{4})\s*-\s*(\w+)\s+(\d+),?\s+(\d{4})$/);
  if (crossMatch) {
    const [, m1, d1, y1, m2, d2, y2] = crossMatch;
    const start = new Date(`${m1} ${d1}, ${y1}`);
    const end = new Date(`${m2} ${d2}, ${y2}`);
    if (!Number.isNaN(start.getTime())) return { start, end };
  }

  // "Month YYYY" — whole month
  const monthMatch = s.match(/^(\w+)\s+(\d{4})$/);
  if (monthMatch) {
    const [, month, year] = monthMatch;
    const start = new Date(`${month} 1, ${year}`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0); // last day of month
    if (!Number.isNaN(start.getTime())) return { start, end };
  }

  // Single date "Month D, YYYY"
  const singleMatch = s.match(/^(\w+)\s+(\d+),?\s+(\d{4})$/);
  if (singleMatch) {
    const [, month, day, year] = singleMatch;
    const start = new Date(`${month} ${day}, ${year}`);
    if (!Number.isNaN(start.getTime())) return { start, end: start };
  }

  return null;
}

// Determine dynamic bucket: 'live', 'upcoming', or 'completed'
// based on today's date vs the tournament date range.
// Falls back to the authored status if dates can't be parsed.
function getBucket(t) {
  const range = parseDateRange(t.date);
  if (!range) {
    // Can't parse — use authored status to guess bucket
    if (t.status === 'completed') return 'completed';
    return 'upcoming';
  }

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
        ${t.ages ? `<div class="t-row"><span class="t-lbl">Age Groups</span><span class="t-val t-ages">${t.ages.split(',').map((a) => {
    const age = a.trim();
    const cls = age.toLowerCase().includes('10u') ? 't-age-10u' : 't-age-14u';
    return `<span class="t-age ${cls}">${age}</span>`;
  }).join(' ')}</span></div>` : ''}
        <div class="t-row"><span class="t-lbl">Status</span><span class="t-val"><span class="ts ts-${t.status}">${STATUS_LABELS[t.status] || t.status}</span></span></div>
        ${t.link ? `<a href="${t.link}" target="_blank" class="t-link">Learn More &rarr;</a>` : ''}
      </div>
      ${t.cta ? `<a href="${t.cta.href}" class="t-cta">${t.cta.text}</a>` : ''}
    </div>`;
}

function renderSection(title, tournaments, sectionClass) {
  if (!tournaments.length) return '';
  return `
    <div class="t-section ${sectionClass}">
      <h2 class="t-section-title">${title}</h2>
      <div class="t-grid">
        ${tournaments.map(renderCard).join('')}
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

  // Bucket tournaments dynamically by date
  const live = tournaments.filter((t) => getBucket(t) === 'live');
  const upcoming = tournaments.filter((t) => getBucket(t) === 'upcoming');
  const completed = tournaments.filter((t) => getBucket(t) === 'completed');

  block.innerHTML = `
    ${renderSection('🏒 Live Tournament', live, 't-section-live')}
    ${renderSection('📅 Upcoming Tournaments', upcoming, 't-section-upcoming')}
    ${renderSection('🏆 Completed Tournaments', completed, 't-section-completed')}
  `;
}
And add these styles to your tournaments.css:

.t-section {
  margin-bottom: 60px;
}

.t-section-title {
  font-family: var(--heading-font-family);
  font-size: 1.6rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-navy);
  padding: 0 40px 16px;
  border-bottom: 3px solid var(--color-gray-light);
  margin-bottom: 0;
}

.t-section-live .t-section-title {
  color: var(--color-red);
  border-bottom-color: var(--color-red);
}

.t-section-completed .t-section-title {
  color: var(--color-gray);
}
