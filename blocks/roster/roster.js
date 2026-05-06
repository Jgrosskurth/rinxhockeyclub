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

function buildCoaches(coaches) {
  return coaches.map((c) => {
    const imgHtml = c.img
      ? `<img src="${c.img}" alt="${c.name}" class="coach-av coach-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    return `
      <div class="coach-card">
        ${imgHtml}
        <div class="coach-av"${c.img ? ' style="display:none"' : ''}>${c.initials}</div>
        <div class="coach-info">
          <h4>${c.name}</h4>
          <p>${c.role}</p>
        </div>
      </div>`;
  }).join('');
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
    const num = cells[3]?.textContent?.trim() || '';
    return {
      name, note, img: imgSrc, num,
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
    ];

  const coaches = coachData.length ? coachData : defaultCoaches;

  block.innerHTML = `
    <div class="roster-grid">
      ${players.map((p) => `
        <div class="player-card">
          ${p.img
    ? `<img src="${p.img}" alt="${p.name}" class="player-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : ''}
          <div class="player-icon"${p.img ? ' style="display:none"' : ''}>${p.num || getInitials(p.name)}</div>
          <h3>${p.name}</h3>
          ${p.num ? `<span class="player-num">#${p.num}</span>` : ''}
          ${getBadge(p.note)}
        </div>
      `).join('')}
    </div>

    <div class="roster-coaches">
      <h2 class="section-title">Coaching Staff</h2>
      <div class="coaches-grid">
        ${buildCoaches(coaches)}
      </div>
    </div>
  `;
}
