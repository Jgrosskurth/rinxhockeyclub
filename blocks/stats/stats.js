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
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const text = await resp.text();
    const rows = parseCSV(text);
    if (!rows.length) throw new Error('empty');
    renderTable(block, container, rows);
  } catch (e) {
    container.innerHTML = '<div class="err-box"><p>Could not load stats. <a href="https://ayrabo.com/sports/1/teams/572/roster/" target="_blank">View on ayrabo.com &rarr;</a></p></div>';
  }
}

function renderTable(block, container, rows) {
  const fmt = (v) => (v === '' || v == null) ? '—' : v;
  const n = (v) => parseFloat(v) || 0;

  const chip = (pos) => {
    const p = (pos || '').toUpperCase();
    if (p.includes('G')) return 'pos-g';
    if (p.includes('D')) return 'pos-d';
    return 'pos-f';
  };

  // Summary totals
  let tg = 0, ta = 0, tp = 0, maxGP = 0;
  rows.forEach((r) => {
    tg += n(findKey(r, 'g', 'goals'));
    ta += n(findKey(r, 'a', 'assists'));
    tp += n(findKey(r, 'pts', 'points'));
    maxGP = Math.max(maxGP, n(findKey(r, 'gp', 'games played')));
  });
  const sum = block.querySelector('#stats-summary');
  sum.style.display = 'grid';
  block.querySelector('#s-gp').textContent = maxGP || '--';
  block.querySelector('#s-tg').textContent = tg;
  block.querySelector('#s-ta').textContent = ta;
  block.querySelector('#s-tp').textContent = tp;

  // Build player objects
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

  const cols = [
    { key: 'num',  label: '#',     numeric: false },
    { key: 'name', label: 'Player',numeric: false },
    { key: 'pos',  label: 'Pos',   numeric: false },
    { key: 'gp',   label: 'GP',    numeric: true  },
    { key: 'g',    label: 'G',     numeric: true  },
    { key: 'a',    label: 'A',     numeric: true  },
    { key: 'pts',  label: 'PTS',   numeric: true  },
    { key: 'pm',   label: '+/−',   numeric: true  },
    { key: 'pim',  label: 'PIM',   numeric: true  },
  ];

  let sortCol = 'pts';
  let sortAsc = false;

  function getSorted() {
    const col = cols.find((c) => c.key === sortCol);
    return [...players].sort((a, b) => {
      let av = a[sortCol];
      let bv = b[sortCol];
      let result;
      if (col && col.numeric) {
        result = n(bv) - n(av); // default desc for numeric
      } else {
        result = String(av).localeCompare(String(bv));
      }
      return sortAsc ? -result : result;
    });
  }

  function buildHeaders() {
    return cols.map((c) => {
      const active = c.key === sortCol;
      const arrow = active ? (sortAsc ? ' ▲' : ' ▼') : ' ⇅';
      return '<th class="sortable' + (active ? ' sort-active' : '') + '" data-col="' + c.key + '">' + c.label + '<span class="sort-arrow">' + arrow + '</span></th>';
    }).join('');
  }

  function buildRows() {
    return getSorted().map((p) => {
      const posVal = p.pos === '—' ? 'F' : p.pos;
      return '<tr>'
        + '<td>' + p.num + '</td>'
        + '<td class="player-name">' + p.name + '</td>'
        + '<td><span class="pos-chip ' + chip(p.pos) + '">' + posVal + '</span></td>'
        + '<td>' + p.gp + '</td>'
        + '<td>' + p.g + '</td>'
        + '<td>' + p.a + '</td>'
        + '<td><strong>' + p.pts + '</strong></td>'
        + '<td>' + p.pm + '</td>'
        + '<td>' + p.pim + '</td>'
        + '</tr>';
    }).join('');
  }

  function render() {
    const thead = container.querySelector('thead tr');
    const tbody = container.querySelector('#stats-tbody');
    if (thead) thead.innerHTML = buildHeaders();
    if (tbody) tbody.innerHTML = buildRows();
    // Attach sort handlers
    container.querySelectorAll('th.sortable').forEach((th) => {
      th.onclick = function() {
        const col = this.dataset.col;
        if (sortCol === col) {
          sortAsc = !sortAsc;
        } else {
          sortCol = col;
          sortAsc = false; // default desc when switching columns
        }
        render();
      };
    });
  }

  container.innerHTML = `
    <div class="stats-table-wrap">
      <table class="stats-tbl">
        <thead><tr></tr></thead>
        <tbody id="stats-tbody"></tbody>
      </table>
    </div>
    <p class="stats-src">Stats sourced from <a href="https://ayrabo.com/sports/1/teams/572/roster/" target="_blank">ayrabo.com</a></p>
  `;

  render();
}
