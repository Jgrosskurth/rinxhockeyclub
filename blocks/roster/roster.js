import { PLAYERS } from '../../scripts/scripts.js';

function getInitials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function decorate(block) {
  block.innerHTML = `
    <div class="roster-grid">
      ${PLAYERS.map((p) => `
        <div class="player-card">
          <div class="player-icon">${getInitials(p.name)}</div>
          <h3>${p.name}</h3>
          <p class="player-pos">Forward / Defense</p>
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
