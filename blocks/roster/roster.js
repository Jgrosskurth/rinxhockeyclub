import { PLAYERS } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Read players from DA table rows (skip header row)
  const rows = [...block.querySelectorAll('tr')].slice(1);
  const players = rows.length > 1
    ? rows.map(row => ({
        num: row.cells[0]?.innerText?.trim() || '',
        name: row.cells[1]?.innerText?.trim() || '',
        pos: row.cells[2]?.innerText?.trim() || '',
        pp: (row.cells[3]?.innerText?.trim() || '').toLowerCase() === 'yes',
      })).filter(p => p.name)
    : PLAYERS.map(p => ({ name: p.name, num: '', pos: '', pp: p.pp }));

  const regular = players.filter(p => !p.pp);
  const practice = players.filter(p => p.pp);

  function card(p) {
    return `<div class="player-card${p.pp?' practice':''}">
      <div class="player-num">${p.num ? '#'+p.num : ''}</div>
      <div class="player-av">${p.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
      <div class="player-name">${p.name}</div>
      ${p.pos ? `<div class="player-pos">${p.pos}</div>` : ''}
      ${p.pp ? '<div class="player-pp-badge">Practice Player</div>' : ''}
    </div>`;
  }

  block.innerHTML = `
    <div class="page-banner"><h2>Roster</h2><p>Rinx Hockey Club &bull; 10U Squirts &bull; 2026&ndash;2027</p></div>
    <div class="roster-section">
      <h3 class="section-title">Players</h3>
      <div class="player-grid">${regular.map(card).join('')}</div>
    </div>
    ${practice.length ? `<div class="roster-section practice-section">
      <h3 class="section-title">Practice Players</h3>
      <div class="player-grid">${practice.map(card).join('')}</div>
    </div>` : ''}
    <div class="coaching-staff">
      <h3 class="section-title">Coaching Staff</h3>
      <div class="coach-row">
        <div class="coach-card"><div class="coach-av">DO</div><div class="coach-info"><h4>Dan O&apos;Donoghue</h4><p>Head Coach &bull; 10U Squirts</p></div></div>
        <div class="coach-card"><div class="coach-av">JC</div><div class="coach-info"><h4>Joe Capozzoli</h4><p>Assistant Coach &bull; 10U Squirts</p></div></div>
      </div>
    </div>
  `;
}
