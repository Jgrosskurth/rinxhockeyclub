export default function decorate(block) {
  const rows = [...block.querySelectorAll('tr')].slice(1);
  const tournaments = rows.length > 1
    ? rows.map(row => ({
        name: row.cells[0]?.innerText?.trim() || '',
        date: row.cells[1]?.innerText?.trim() || '',
        loc:  row.cells[2]?.innerText?.trim() || '',
        div:  row.cells[3]?.innerText?.trim() || '',
        fmt:  row.cells[4]?.innerText?.trim() || '',
        status: (row.cells[5]?.innerText?.trim() || 'tbd').toLowerCase().replace(' ','-'),
      })).filter(t => t.name)
    : [
        { name: 'Long Island Squirt Classic', date: 'October 18-19, 2026', loc: 'The Rinx, Hauppauge', div: '10U Tier III/A', fmt: 'Round Robin + Playoffs', status: 'upcoming' },
        { name: 'Turkey Shoot Invitational', date: 'November 22-23, 2026', loc: 'Nassau Coliseum Ice Center', div: '10U Tier III', fmt: '4-Team Double Elimination', status: 'registered' },
        { name: 'Holiday Hockey Festival', date: 'December 27-29, 2026', loc: 'TBD', div: '10U Tier III/A', fmt: 'Round Robin', status: 'tbd' },
        { name: 'MLK Squirt Shootout', date: 'January 17-18, 2027', loc: 'Long Island Skating Academy', div: '10U', fmt: '3 Games Guaranteed', status: 'upcoming' },
        { name: "Presidents' Day Classic", date: 'February 14-16, 2027', loc: 'The Rinx, Hauppauge', div: '10U Tier III/A', fmt: 'Full Bracket', status: 'registered' },
        { name: 'End-of-Season Cup', date: 'March 2027', loc: 'TBD', div: '10U Tier III/A', fmt: 'TBD', status: 'tbd' },
      ];

  const labels = { upcoming: 'Upcoming', registered: 'Registered', tbd: 'TBD', completed: 'Completed' };

  block.innerHTML = `
    <div class="page-banner"><h2>Tournaments</h2><p>2026&ndash;2027 Season &bull; Tier III/A Tournament Schedule</p></div>
    <div class="t-grid">
      ${tournaments.map(t => `<div class="t-card">
        <div class="t-head"><h3>${t.name}</h3><div class="tdate">${t.date}</div></div>
        <div class="t-body">
          <div class="t-row"><span class="t-lbl">Location</span><span class="t-val">${t.loc}</span></div>
          <div class="t-row"><span class="t-lbl">Division</span><span class="t-val">${t.div}</span></div>
          <div class="t-row"><span class="t-lbl">Format</span><span class="t-val">${t.fmt}</span></div>
          <div class="t-row"><span class="t-lbl">Status</span><span class="t-val"><span class="ts ts-${t.status}">${labels[t.status]||t.status}</span></span></div>
        </div>
      </div>`).join('')}
    </div>
  `;
}
