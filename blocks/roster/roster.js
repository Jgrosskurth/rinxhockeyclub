function getInitials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0])
    .join('')
    .toUpperCase();
}

function getBadge(note) {
  const lower = (note || '').toLowerCase();
  if (lower.includes('practice')) return '<span class="pp-badge">Practice Player</span>';
  if (lower.includes('goalie')) return '<span class="pos-badge pos-badge-goalie">Goalie</span>';
  if (lower.includes('offense')) return '<span class="pos-badge pos-badge-offense">Offense</span>';
  if (lower.includes('defense')) return '<span class="pos-badge pos-badge-defense">Defense</span>';
  return '';
}

export default function decorate(block) {
  const rows = [...block.children];
  const players = rows.map((row) => {
    const cells = [...row.children];
    const name = cells[0]?.textContent?.trim() || '';
    const note = cells[1]?.textContent?.trim() || '';
    const imgEl = cells[2]?.querySelector('img');
    let imgSrc = imgEl?.src || '';
    if (imgSrc.includes('about:error') || imgSrc.includes('about:blank')) imgSrc = '';
    return { name, note, img: imgSrc };
  }).filter((p) => p.name);

  block.innerHTML = `
    <div class="roster-grid">
      ${players.map((p) => `
        <div class="player-card">
          ${p.img
    ? `<img src="${p.img}" alt="${p.name}" class="player-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : ''}
          <div class="player-icon"${p.img ? ' style="display:none"' : ''}>${getInitials(p.name)}</div>
          <h3>${p.name}</h3>
          ${getBadge(p.note)}
        </div>
      `).join('')}
    </div>

    <div class="roster-coaches">
      <h2 class="section-title">Coaching Staff</h2>
      <div class="coaches-grid">
        <div class="coach-card">
          <img src="/icons/dan.jpg"
               alt="Dan O'Donoghue" class="coach-av coach-photo"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="coach-av" style="display:none">DO</div>
          <div class="coach-info">
            <h4>Dan O'Donoghue</h4>
            <p>Head Coach &bull; 10U Squirts</p>
          </div>
        </div>
        <div class="coach-card">
          <img src="/icons/cap.png"
               alt="Joe Capozzoli" class="coach-av coach-photo"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="coach-av" style="display:none">JC</div>
          <div class="coach-info">
            <h4>Joe Capozzoli</h4>
            <p>Assistant Coach &bull; 10U Squirts</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
