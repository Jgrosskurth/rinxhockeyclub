const TOURNAMENTS = [
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

export default function decorate(block) {
  const labels = {
    upcoming: 'Upcoming',
    registered: 'Registered',
    tbd: 'TBD',
    completed: 'Completed',
  };

  block.innerHTML = `
    <div class="t-grid">
      ${TOURNAMENTS.map((t) => `
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
        </div>
      `).join('')}
    </div>
  `;
}
