export default function decorate(block) {
  const rows = [...block.children];
  const tournaments = rows.map((row) => {
    const cells = [...row.children];
    const logoImg = cells[0]?.querySelector('img');
    return {
      logo: logoImg?.src || '',
      name: cells[1]?.textContent?.trim() || '',
      date: cells[2]?.textContent?.trim() || '',
      loc: cells[3]?.textContent?.trim() || '',
      link: cells[4]?.querySelector('a')?.href || cells[4]?.textContent?.trim() || '',
      status: (cells[5]?.textContent?.trim() || 'Upcoming').toLowerCase().replace(/\s+/g, '-'),
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
          <div class="t-head">
            ${t.logo ? `<img src="${t.logo}" alt="${t.name}" class="t-logo" onerror="this.style.display='none'">` : ''}
            <h3>${t.name}</h3>
            <div class="tdate">${t.date}</div>
          </div>
          <div class="t-body">
            <div class="t-row"><span class="t-lbl">Location</span><span class="t-val">${t.loc}</span></div>
            <div class="t-row"><span class="t-lbl">Status</span><span class="t-val"><span class="ts ts-${t.status}">${labels[t.status] || t.status}</span></span></div>
            ${t.link ? `<a href="${t.link}" target="_blank" class="t-link">Learn More &rarr;</a>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
