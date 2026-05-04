import { RINX, parseCSV, findKey } from '../../scripts/scripts.js';

export default function decorate(block) {
  block.innerHTML = `
    <div class="stats-summary" id="stats-summary" style="display:none">
      <div class="stat-tile"><span class="stat-num" id="s-gp">--</span><span class="stat-lbl">Games Played</span></div>
      <div class="stat-tile"><span class="stat-num red" id="s-tg">--</span><span class="stat-lbl">Team Goals</span></div>
      <div class="stat-tile"><span class="stat-num" id="s-ta">--</span><span class="stat-lbl">Team Assists</span></div>
      <div class="stat-tile"><span class="stat-num red" id="s-tp">--</span><span class="stat-lbl">Team Points</span></div>
    </div>
    <div id="stats-container"><div class="loading-box"><div class="spinner"></div><p>Loading stats&hellip;</p></div></div>
  `;

  loadStats(block);
}

async function loadStats(block) {
  const container = block.querySelector('#stats-container');
  try {
    const resp = await fetch(RINX.statsUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    const rows = parseCSV(text);
    if (!rows.length) throw new Error('empty CSV');
    renderTable(block, container, rows);
  } catch (e) {
    container.innerHTML = `
      <div class="err-box">
        <p>Could not load stats. <a href="https://ayrabo.com/sports/1/teams/572/roster/" target="_blank">View on ayrabo.com &rarr;</a></p>
      </div>`;
  }
}

function renderTable(block, container, rows) {
  const sorted = [...rows].sort((a, b) => {
    const pa = parseFloat(findKey(a, 'pts', 'points', 'pt')) || 0;
    const pb = parseFloat(findKey(b, 'pts', 'points', 'pt')) || 0;
    if (pb !== pa) return pb - pa;
    return (parseFloat(findKey(b, 'g', 'goals')) || 0) - (parseFloat(findKey(a, 'g', 'goals')) || 0);
  });

  let tg = 0; let ta = 0; let tp = 0; let maxGP = 0;
  rows.forEach((r) => {
    tg += parseFloat(findKey(r, 'g', 'goals')) || 0;
    ta += parseFloat(findKey(r, 'a', 'assists')) || 0;
    tp += parseFloat(findKey(r, 'pts', 'points')) || 0;
    maxGP = Math.max(maxGP, parseFloat(findKey(r, 'gp', 'games played')) || 0);
  });

  const sum = block.querySelector('#stats-summary');
  sum.style.display = 'grid';
  block.querySelector('#s-gp').textContent = maxGP || '--';
  block.querySelector('#s-tg').textContent = tg;
  block.querySelector('#s-ta').textContent = ta;
  block.querySelector('#s-tp').textContent = tp;

  const chip = (pos) => {
    const p = (pos || '').toUpperCase();
    if (p.includes('G')) return 'pos-g';
    if (p.includes('D')) return 'pos-d';
    return 'pos-f';
  };

  const fmt = (v) => (v === '' || v == null) ? '—' : v;

  container.innerHTML = `
    <div class="stats-table-wrap">
      <table class="stats-tbl">
        <thead>
          <tr><th>#</th><th>Player</th><th>Pos</th><th>GP</th><th>G</th><th>A</th><th>PTS</th><th>+/&minus;</th><th>PIM</th></tr>
        </thead>
        <tbody>
          ${sorted.map((p) => {
            const num  = fmt(findKey(p, '#', 'number', 'jersey', 'jersey_number', 'no'));
            const fn   = findKey(p, 'first name', 'first_name', 'firstname');
            const ln   = findKey(p, 'last name', 'last_name', 'lastname');
            const name = fmt(findKey(p, 'name', 'player', 'full name', 'player_name') || [fn, ln].filter(Boolean).join(' '));
            const pos  = fmt(findKey(p, 'pos', 'position'));
            const gp   = fmt(findKey(p, 'gp', 'games played'));
            const g    = fmt(findKey(p, 'g', 'goals'));
            const a    = fmt(findKey(p, 'a', 'assists'));
            const pts  = fmt(findKey(p, 'pts', 'points'));
            const pm   = fmt(findKey(p, 'plus minus', '+/-', 'plus_minus', 'pm'));
            const pim  = fmt(findKey(p, 'pim', 'penalty minutes'));
            return `<tr>
              <td>${num}</td>
              <td class="player-name">${name}</td>
              <td><span class="pos-chip ${chip(pos)}">${pos || 'F'}</span></td>
              <td>${gp}</td><td>${g}</td><td>${a}</td>
              <td><strong>${pts}</strong></td>
              <td>${pm}</td><td>${pim}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <p class="stats-src">Stats sourced from <a href="https://ayrabo.com/sports/1/teams/572/roster/" target="_blank">ayrabo.com</a></p>
  `;
}
