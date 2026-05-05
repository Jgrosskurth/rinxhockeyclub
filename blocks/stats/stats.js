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
  const chip = (pos) => {
    const p = (pos || '').toUpperCase();
    if (p.includes('G')) return 'pos-g';
    if (p.includes('D')) return 'pos-d';
    return 'pos-f';
  };
  const fmt = (v) => (v === '' || v == null) ? '—' : v;
  const num = (v) => parseFloat(v) || 0;

  // Compute summary totals
  let tg = 0; let ta = 0; let tp = 0; let maxGP = 0;
  rows.forEach((r) => {
    tg += num(findKey(r, 'g', 'goals'));
    ta += num(findKey(r, 'a', 'assists'));
    tp += num(findKey(r, 'pts', 'points'));
    maxGP = Math.max(maxGP, num(findKey(r, 'gp', 'games played')));
  });

  const sum = block.querySelector('#stats-summary');
  sum.style.display = 'grid';
  block.querySelector('#s-gp').textContent = maxGP || '--';
  block.querySelector('#s-tg').textContent = tg;
  block.querySelector('#s-ta').textContent = ta;
  block.querySelector('#s-tp').textContent = tp;

  // Map each row to a display object
  const players = rows.map((p) => {
    const fn = findKey(p, 'first name', 'first_name', 'firstname');
    const ln = findKey(p, 'last name', 'last_name', 'lastname');
    return {
      num:  fmt(findKey(p, '#', 'number', 'jersey', 'jersey_number', 'no')),
      name: fmt(findKey(p, 'name', 'player', 'full name', 'player_name') || [fn, ln].filter(Boolean).join(' ')),
      pos:  fmt(findKey(p, 'pos', 'position')),
      gp:   fmt(findKey(p, 'gp', 'games played')),
      g:    fmt(findKey(p, 'g', 'goals')),
      a:    fmt(findKey(p, 'a', 'assists')),
      pts:  fmt(findKey(p, 'pts', 'points')),
      pm:   fmt(findKey(p, 'plus minus', '+/-', 'plus_minus', 'pm')),
      pim:  fmt(findKey(p, 'pim', 'penalty minutes')),
    };
  });

  // Sort state
  let sortCol = 'pts';
  let sortDir = -1; // -1 = desc, 1 = asc

  const cols = [
    { key: 'num',  label: '#',        numeric: false },
    { key: 'name', label: 'Player',   numeric: false },
    { key: 'pos',  label: 'Pos',      numeric: false },
    { key: 'gp',   label: 'GP',       numeric: true  },
    { key: 'g',    label: 'G',        numeric: true  },
    { key: 'a',    label: 'A',        numeric: true  },
    { key: 'pts',  label: 'PTS',      numeric: true  },
    { key: 'pm',   label: '+/−',      numeric: true  },
    { key: 'pim',  label: 'PIM',      numeric: true  },
  ];

  function sortedPlayers() {
    return [...players].sort((a, b) => {
      const col = cols.find((c) => c.key === sortCol);
      const av = a[sortCol];
      const bv = b[sortCol];
      if (col && col.numeric) {
        return (parseFloat(bv) || 0 - (parseFloat(av) || 0)) * sortDir * -1;
      }
      return av.localeCompare(bv) * sortDir;
    });
  }

  function renderRows() {
    return sortedPlayers().map((p) => `
      <tr>
        <td>${p.num}</td>
        <td class="player-name">${p.name}</td>
        <td><span class="pos-chip ${chip(p.pos)}">${p.pos === '—' ? 'F' : p.pos}</span></td>
        <td>${p.gp}</td>
        <td>${p.g}</td>
        <td>${p.a}</td>
        <td><strong>${p.pts}</strong></td>
        <td>${p.pm}</td>
        <td>${p.pim}</td>
      </tr>
    `).join('');
  }

  function renderHeaders() {
    return cols.map((c) => {
      const active = c.key === sortCol;
      const arrow = active ? (sortDir === -1 ? ' ▼' : ' ▲') : ' ⇅';
      return `<th class="sortable${active ? ' sort-active' : ''}" data-col="${c.key}">${c.label}<span class="sort-arrow">${arrow}</span></th>`;
    }).join('');
  }

  container.innerHTML = `
    <div class="stats-table-wrap">
      <table class="stats-tbl">
        <thead><tr>${renderHeaders()}</tr></thead>
        <tbody id="stats-tbody">${renderRows()}</tbody>
      </table>
    </div>
    <p class="stats-src">Stats sourced from <a href="https://ayrabo.com/sports/1/teams/572/roster/" target="_blank">ayrabo.com</a></p>
  `;

  // Add sort click handlers
  container.querySelectorAll('th.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) {
        sortDir *= -1;
      } else {
        sortCol = col;
        sortDir = cols.find((c) => c.key === col)?.numeric ? -1 : 1;
      }
      // Re-render headers and rows
      container.querySelector('thead tr').innerHTML = renderHeaders();
      container.querySelector('#stats-tbody').innerHTML = renderRows();
      // Re-attach handlers
      container.querySelectorAll('th.sortable').forEach((th2) => {
        th2.addEventListener('click', arguments.callee);
      });
    });
  });
}
