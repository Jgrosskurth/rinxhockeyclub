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

  const labels = {
    upcoming: 'Upcoming',
    confirmed: 'Confirmed',
    completed: 'Completed',
    postponed: 'Postponed',
    registered: 'Registered',
    tbd: 'TBD',
  };

  block.innerHTML = `
    <div class="t-grid">
      ${tournaments.map((t) => `
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
            <div class="t-row"><span class="t-lbl">Status</span><span class="t-val"><span class="ts ts-${t.status}">${labels[t.status] || t.status}</span></span></div>
            ${t.link ? `<a href="${t.link}" target="_blank" class="t-link">Learn More &rarr;</a>` : ''}
          </div>
          ${t.cta ? `<a href="${t.cta.href}" class="t-cta">${t.cta.text}</a>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}
