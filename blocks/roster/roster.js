import { PLAYERS } from '../../scripts/scripts.js';

function getInitials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function decorate(block) {
  // Read players from DA table (skip header row), fall back to scripts.js data
  const daRows = [...block.querySelectorAll('tr')].slice(1).filter(r => r.cells[0]?.innerText?.trim());
  const players = daRows.length
    ? daRows.map(r => ({
        name: r.cells[1]?.innerText?.trim() || r.cells[0]?.innerText?.trim() || '',
        pos: r.cells[2]?.innerText?.trim() || '',
        pp: (r.cells[3]?.innerText?.trim() || '').toLowerCase() === 'yes',
      })).filter(p => p.name)
    : PLAYERS;

  block.innerHTML = `
    <div class="roster-grid">
      ${players.map((p) => `
        <div class="player-card">
          <div class="player-icon">${getInitials(p.name)}</div>
          <h3>${p.name}</h3>
          <p class="player-pos">${p.pos || 'Forward / Defense'}</p>
          ${p.pp ? '<span class="pp-badge">Practice Player</span>' : ''}
        </div>
      `).join('')}
    </div>

    <div class="roster-coaches">
      <h2 class="section-title">Coaching Staff</h2>
      <div class="coaches-grid">
        <div class="coach-card">
          <div class="coach-av">DO</div>
          <div class="coach-info">
            <h4>Dan O&apos;Donoghue</h4>
            <p>Head Coach &bull; 10U Squirts</p>
          </div>
        </div>
        <div class="coach-card">
          <div class="coach-av">JC</div>
          <div class="coach-info">
            <h4>Joe Capozzoli</h4>
            <p>Assistant Coach &bull; 10U Squirts</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
