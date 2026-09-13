function toProperCase(str) {
  if (!str || str !== str.toUpperCase()) return str;
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

function findKey(obj, ...candidates) {
  const keys = Object.keys(obj);
  for (let i = 0; i < candidates.length; i += 1) {
    const c = candidates[i];
    const found = keys.find((k) => k.trim().toLowerCase() === c.toLowerCase());
    if (found !== undefined) return obj[found];
  }
  return '';
}

function renderTable(block, container, rows) {
  const fmt = (v) => ((v === '' || v == null) ? '—' : v);
  const n = (v) => parseFloat(v) || 0;

  const chip = (pos) => {
    const p = (pos || '').toUpperCase();
    if (p.includes('G')) return 'pos-g';
    if (p.includes('D')) return 'pos-d';
    return 'pos-f';
  };

  let tg = 0;
  let ta = 0;
  let tp = 0;
  let maxGP = 0;
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

  const players = rows.map((p) => {
    const fn = findKey(p, 'first name', 'first_name', 'firstname');
    const ln = findKey(p, 'last name', 'last_name', 'lastname');
    return {
      num: fmt(findKey(p, '#', 'number', 'jersey', 'jersey_number', 'no')),
      name: toProperCase(fmt(findKey(p, 'name', 'player', 'full name', 'player_name') || [fn, ln].filter(Boolean).join(' '))),
      pos: fmt(findKey(p, 'pos', 'position')),
      gp: fmt(findKey(p, 'gp', 'games played')),
      g: fmt(findKey(p, 'g', 'goals')),
      a: fmt(findKey(p, 'a', 'assists')),
      pts: fmt(findKey(p, 'pts', 'points')),
      pm: fmt(findKey(p, 'plus minus', '+/-', 'plus_minus', 'pm')),
      pim: fmt(findKey(p, 'pim', 'penalty minutes')),
    };
  });

  const cols = [
    { key: 'num', label: '#', numeric: false },
    { key: 'name', label: 'Player', numeric: false },
    { key: 'pos', label: 'Pos', numeric: false },
    { key: 'gp', label: 'GP', numeric: true },
    { key: 'g', label: 'G', numeric: true },
    { key: 'a', label: 'A', numeric: true },
    { key: 'pts', label: 'PTS', numeric: true },
    { key: 'pm', label: '+/−', numeric: true },
    { key: 'pim', label: 'PIM', numeric: true },
  ];

  let sortCol = 'pts';
  let sortAsc = false;

  function getSorted() {
    const col = cols.find((c) => c.key === sortCol);
    return [...players].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      let result;
      if (col && col.numeric) {
        result = n(bv) - n(av);
      } else {
        result = String(av).localeCompare(String(bv));
      }
      return sortAsc ? -result : result;
    });
  }

  function buildHeaders() {
    return cols.map((c) => {
      const active = c.key === sortCol;
      let arrow = ' ⇅';
      if (active) arrow = sortAsc ? ' ▲' : ' ▼';
      return `<th class="sortable${active ? ' sort-active' : ''}" data-col="${c.key}">${c.label}<span class="sort-arrow">${arrow}</span></th>`;
    }).join('');
  }

  function buildRows() {
    return getSorted().map((p) => {
      const posVal = p.pos === '—' ? 'F' : p.pos;
      return `<tr>
        <td>${p.num}</td>
        <td class="player-name">${p.name}</td>
        <td><span class="pos-chip ${chip(p.pos)}">${posVal}</span></td>
        <td>${p.gp}</td>
        <td>${p.g}</td>
        <td>${p.a}</td>
        <td><strong>${p.pts}</strong></td>
        <td>${p.pm}</td>
        <td>${p.pim}</td>
      </tr>`;
    }).join('');
  }

  function render() {
    const thead = container.querySelector('thead tr');
    const tbody = container.querySelector('#stats-tbody');
    if (thead) thead.innerHTML = buildHeaders();
    if (tbody) tbody.innerHTML = buildRows();
    container.querySelectorAll('th.sortable').forEach((th) => {
      th.onclick = function onClick() {
        const { col } = this.dataset;
        if (sortCol === col) {
          sortAsc = !sortAsc;
        } else {
          sortCol = col;
          sortAsc = false;
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
    <p class="stats-src">Stats sourced from <a href="https://ayrabo.com/sports/1/teams/${window.location.pathname.includes('14u') ? '573' : '572'}/roster/" target="_blank">ayrabo.com</a></p>
  `;

  render();
}

async function loadStats(block, statsUrl) {
  const container = block.querySelector('#stats-container');
  try {
    const resp = await fetch(statsUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    const rows = parseCSV(text);
    if (!rows.length) throw new Error('empty');
    renderTable(block, container, rows);
  } catch {
    container.innerHTML = '<div class="err-box"><p>Could not load stats. <a href="https://ayrabo.com/sports/1/teams/572/roster/" target="_blank">View on ayrabo.com &rarr;</a></p></div>';
  }
}

// Current-season player stats, pulled from GameSheet into a GitHub JSON feed
// by the pull-gamesheet workflow. Map the feed's player objects to the same
// header keys renderTable/findKey expect, so the existing table renders them.
const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

async function loadFeedStats(block, container) {
  const is14u = window.location.pathname.includes('14u');
  const url = `${FEED_BASE}/stats-${is14u ? '14u' : '10u'}.json`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`feed ${resp.status}`);
  const data = await resp.json();
  const rows = (data.players || []).map((p) => ({
    '#': p.number || '',
    Name: p.name || '',
    Pos: p.pos || '',
    GP: p.gp || '',
    G: p.g || '',
    A: p.a || '',
    PTS: p.pts || '',
    '+/-': p.plusminus || '',
    PIM: p.pim || '',
  }));
  if (!rows.length) throw new Error('empty feed');
  renderTable(block, container, rows);
}

export default function decorate(block) {
  const is14u = window.location.pathname.includes('14u');
  const archiveUrl = is14u ? '/rinxstats-14u-2025-2026.csv' : '/rinxstats-2025-2026.csv';

  // Available seasons, newest first. The first entry is the default view.
  // Current season comes from the live GameSheet JSON feed; past seasons are
  // archived CSVs committed to the repo.
  const seasons = [
    { label: 'Current Season', type: 'feed' },
    { label: '2025–2026', type: 'csv', url: archiveUrl },
  ];

  const buttons = seasons
    .map((s, i) => `<button class="season-btn${i === 0 ? ' active' : ''}" data-idx="${i}">${s.label}</button>`)
    .join('');

  block.innerHTML = `
    <div class="stats-controls">
      <div class="season-toggle">${buttons}</div>
      <p class="season-hint">&#128197; Current season is live from GameSheet &bull; switch to view past seasons</p>
    </div>
    <div class="stats-summary" id="stats-summary" style="display:none">
      <div class="stat-tile"><span class="stat-num" id="s-gp">--</span><span class="stat-lbl">Games Played</span></div>
      <div class="stat-tile"><span class="stat-num red" id="s-tg">--</span><span class="stat-lbl">Team Goals</span></div>
      <div class="stat-tile"><span class="stat-num" id="s-ta">--</span><span class="stat-lbl">Team Assists</span></div>
      <div class="stat-tile"><span class="stat-num red" id="s-tp">--</span><span class="stat-lbl">Team Points</span></div>
    </div>
    <div id="stats-container"><div class="loading-box"><div class="spinner"></div><p>Loading stats&hellip;</p></div></div>
  `;

  const container = block.querySelector('#stats-container');
  const showSeason = async (idx) => {
    const season = seasons[idx];
    block.querySelectorAll('.season-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
    container.innerHTML = '<div class="loading-box"><div class="spinner"></div><p>Loading stats&hellip;</p></div>';
    if (season.type === 'feed') {
      try {
        await loadFeedStats(block, container);
      } catch {
        container.innerHTML = '<div class="err-box"><p>Stats are temporarily unavailable. '
          + '<a href="https://gamesheetstats.com" target="_blank" rel="noopener">View on GameSheet &rarr;</a></p></div>';
      }
    } else {
      loadStats(block, season.url);
    }
  };

  block.querySelectorAll('.season-btn').forEach((btn) => {
    btn.addEventListener('click', () => showSeason(Number(btn.dataset.idx)));
  });

  showSeason(0);
}
