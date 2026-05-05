import { PLAYERS } from '../../scripts/scripts.js';

function getInitials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function decorate(block) {
  // Read from DA table rows (skip header row), fall back to scripts.js PLAYERS
  const daRows = [...block.querySelectorAll('tr')].slice(1).filter((r) => r.cells[1]?.innerText?.trim());
  const players = daRows.length
    ? daRows.map((r) => ({
        num:  r.cells[0]?.innerText?.trim() || '',
        name: r.cells[1]?.innerText?.trim() || '',
        pos:  r.cells[2]?.innerText?.trim() || '',
        pp:   (r.cells[3]?.innerText?.trim() || '').toLowerCase() === 'yes',
      })).filter((p) => p.name)
    : PLAYERS.map((p) => ({ num: '', name: p.name, pos: '', pp: p.pp }));

  // Identical HTML output as original — design unchanged
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
          <img src="https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/icons/dan.jpg"
               alt="Dan O'Donoghue" class="coach-av coach-photo"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="coach-av" style="display:none">DO</div>
          <div class="coach-info">
            <h4>Dan O&apos;Donoghue</h4>
            <p>Head Coach &bull; 10U Squirts</p>
          </div>
        </div>
        <div class="coach-card">
          <img src="https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/icons/cap.png"
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
