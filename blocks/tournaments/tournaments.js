export default function decorate(block) {
  const rows = [...block.children];
  const tournaments = rows.map((row) => {
    const cells = [...row.children];
    return {
      name: cells[0]?.textContent?.trim() || '',
      date: cells[1]?.textContent?.trim() || '',
      loc: cells[2]?.textContent?.trim() || '',
      div: cells[3]?.textContent?.trim() || '',
      fmt: cells[4]?.textContent?.trim() || '',
      status: (cells[5]?.textContent?.trim() || 'TBD').toLowerCase().replace(/\s+/g, '-'),
    };
  }).filter((t) => t.name);

  const labels = {
    upcoming: 'Upcoming',
    registered: 'Registered',
    tbd: 'TBD',
    completed: 'Completed',
  };

  block.innerHTML = `
    <div class="t-grid">
      ${tournaments.map((t) => `
        <div class="t-card">
          <div class="t-head"><h3>${t.name}</h3><div class="tdate">${t.date}</div></div>
          <div class="t-body">
            <div class="t-row"><span class="t-lbl">Location</span><span class="t-val">${t.loc}</span></div>
            <div class="t-row"><span class="t-lbl">Division</span><span class="t-val">${t.div}</span></div>
            <div class="t-row"><span class="t-lbl">Format</span><span class="t-val">${t.fmt}</span></div>
            <div class="t-row"><span class="t-lbl">Status</span><span class="t-val"><span class="ts ts-${t.status}">${labels[t.status] || t.status}</span></span></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
