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

function renderTable(block, container, rows, source) {
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
    <p class="stats-src">${source || 'Stats sourced from <a href="https://gamesheetstats.com" target="_blank" rel="noopener">GameSheet</a>'}</p>
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
    const src = `Stats sourced from <a href="https://ayrabo.com/sports/1/teams/${window.location.pathname.includes('14u') ? '573' : '572'}/roster/" target="_blank" rel="noopener">ayrabo.com</a>`;
    renderTable(block, container, rows, src);
  } catch {
    container.innerHTML = '<div class="err-box"><p>Could not load stats. <a href="https://ayrabo.com/sports/1/teams/572/roster/" target="_blank">View on ayrabo.com &rarr;</a></p></div>';
  }
}

// Current-season player stats, pulled from GameSheet into a GitHub JSON feed
// by the pull-gamesheet workflow. Map the feed's player objects to the same
// header keys renderTable/findKey expect, so the existing table renders them.
const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

// Display-name overrides for players whose GameSheet feed name differs from
// how the club wants them shown. Keyed by a lowercased substring of the feed
// name (which may arrive ALL CAPS, e.g. "DONALD PIERRE CANEL").
const NAME_OVERRIDES = [
  { match: 'donald pierre can', display: 'DJ Pierre Canal' },
];

function overrideName(name) {
  const lower = (name || '').toLowerCase();
  const hit = NAME_OVERRIDES.find((o) => lower.includes(o.match));
  return hit ? hit.display : name;
}

// Tournament pages read their own feed (see pull-schedule.yml) and have no
// archived seasons to switch to.
function isTournament() {
  return window.location.pathname.includes('mid-atlantic');
}

function feedKey() {
  if (isTournament()) return 'mid-atlantic';
  return window.location.pathname.includes('14u') ? '14u' : '10u';
}

// Current season, by game type. League stats are LIAHL's GameSheet team
// page; tournament stats come from tournament team pages (built-in below,
// plus any the club links in the other-games sheet, see
// .github/scripts/pull_sheet_stats.py); exhibition stats only from links.
const TYPES = [
  { type: 'All', label: 'All Stats' },
  { type: 'League', label: 'League Stats' },
  { type: 'Tournament', label: 'Tournament Stats' },
  { type: 'Exhibition', label: 'Exhibition Stats' },
];
// League stats come from LIHockey.com box scores (pull_lihockey.py), since
// GameSheet isn't recording LIAHL player stats; sources sharing a "group" are
// alternatives, and only the first one with players is used (no double count).
const LIHOCKEY = { label: 'LI Hockey', url: 'https://lihockey.com' };
const GAMESHEET = { label: 'GameSheet', url: 'https://gamesheetstats.com' };
const BUILT_IN = {
  '10u': [
    {
      type: 'League', name: 'LIAHL 2026–2027', file: 'stats-lihockey-10u.json', group: 'league', via: LIHOCKEY,
    },
    {
      type: 'League', name: 'LIAHL 2026–2027', file: 'stats-10u.json', group: 'league', via: GAMESHEET,
    },
    {
      type: 'Tournament', name: '2026 Mid-Atlantic Fall Classic', file: 'stats-mid-atlantic.json', via: GAMESHEET,
    },
  ],
  '14u': [
    {
      type: 'League', name: 'LIAHL 2026–2027', file: 'stats-lihockey-14u.json', group: 'league', via: LIHOCKEY,
    },
    {
      type: 'League', name: 'LIAHL 2026–2027', file: 'stats-14u.json', group: 'league', via: GAMESHEET,
    },
  ],
};

const fetchJson = (file) => fetch(`${FEED_BASE}/${file}`)
  .then((r) => (r.ok ? r.json() : null))
  .catch(() => null);

let sourcesCache;
// Every stats source for the team, each with its players (possibly none).
function loadSources(key) {
  if (!sourcesCache) {
    sourcesCache = fetchJson('stats-sources.json').then(async (manifest) => {
      const linked = (manifest?.sources || [])
        .filter((src) => src.team === key && src.file)
        .map((src) => ({
          type: src.type, name: src.name || 'GameSheet', file: src.file, via: GAMESHEET,
        }));
      const all = [...(BUILT_IN[key] || []), ...linked];
      const data = await Promise.all(all.map((src) => fetchJson(src.file)));
      return all.map((src, i) => ({ ...src, players: data[i]?.players || [] }));
    });
  }
  return sourcesCache;
}

const num = (v) => parseFloat(v) || 0;
const nameKey = (name) => (name || '').toLowerCase().replace(/[^a-z]/g, '');

// One row per player across sources: games, goals, assists, points,
// +/- and PIM added up.
function mergePlayers(sources) {
  const byPlayer = new Map();
  sources.forEach((src) => src.players.forEach((p) => {
    // By name: LI Hockey box scores have no jersey numbers.
    const key = nameKey(p.name);
    const row = byPlayer.get(key) || {
      number: p.number || '', name: p.name || '', pos: '', gp: 0, g: 0, a: 0, pts: 0, plusminus: 0, pim: 0,
    };
    row.pos = row.pos || p.pos || '';
    row.number = row.number || p.number || '';
    ['gp', 'g', 'a', 'pts', 'plusminus', 'pim'].forEach((k) => { row[k] += num(p[k]); });
    byPlayer.set(key, row);
  }));
  return [...byPlayer.values()].map((p) => ({
    '#': p.number,
    Name: overrideName(p.name),
    Pos: p.pos,
    GP: String(p.gp),
    G: String(p.g),
    A: String(p.a),
    PTS: String(p.pts),
    '+/-': String(p.plusminus),
    PIM: String(Math.round(p.pim * 10) / 10),
  }));
}

const EMPTY = {
  All: 'No player stats have been posted yet this season.',
  League: 'No league stats yet. They’ll show here once the first box scores are posted.',
  Tournament: 'No tournament stats yet. Tournament stats show here once the tournament posts them on GameSheet.',
  Exhibition: 'No exhibition stats yet. To add a game’s stats, paste the Rinx team page link from GameSheet into the GameSheet column of the other-games sheet.',
};

async function showTypeStats(block, container, key, type) {
  const sources = (await loadSources(key))
    .filter((src) => type === 'All' || src.type === type);
  const used = new Set();
  const withStats = sources.filter((src) => {
    if (!src.players.length || used.has(src.group)) return false;
    if (src.group) used.add(src.group);
    return true;
  });
  if (!withStats.length) {
    block.querySelector('#stats-summary').style.display = 'none';
    container.innerHTML = `<div class="err-box"><p>${EMPTY[type]}</p></div>`;
    return;
  }
  const list = withStats.map((src) => (type === 'All' ? `${src.type}: ${src.name}` : src.name)).join(' &bull; ');
  const vias = [...new Set(withStats.map((src) => src.via || GAMESHEET))];
  const from = vias.map((v) => `<a href="${v.url}" target="_blank" rel="noopener">${v.label}</a>`).join(' and ');
  const gpNote = vias.includes(LIHOCKEY)
    ? ' &bull; League GP counts the games a player recorded a goal, assist or penalty in'
    : '';
  renderTable(block, container, mergePlayers(withStats), `${list} &bull; Stats from ${from}${gpNote}`);
}

async function loadFeedStats(block, container) {
  const data = await fetchJson(`stats-${feedKey()}.json`);
  if (!data) throw new Error('feed unavailable');
  const rows = mergePlayers([{ players: data.players || [] }]);
  if (!rows.length) {
    container.innerHTML = '<div class="err-box"><p>Tournament stats will be posted here once games begin.</p></div>';
    return;
  }
  renderTable(block, container, rows);
}

export default function decorate(block) {
  const is14u = window.location.pathname.includes('14u');
  const archiveUrl = is14u ? '/rinxstats-14u-2025-2026.csv' : '/rinxstats-2025-2026.csv';
  const tournament = isTournament();

  // Available seasons, newest first. The first entry is the default view.
  // Current season comes from the GameSheet JSON feeds (by game type); past
  // seasons are archived CSVs committed to the repo.
  const seasons = tournament
    ? [{ label: 'Tournament', type: 'feed' }]
    : [
      { label: 'Current Season', type: 'types' },
      { label: '2025–2026', type: 'csv', url: archiveUrl },
    ];

  const buttons = seasons
    .map((s, i) => `<button class="season-btn${i === 0 ? ' active' : ''}" data-idx="${i}">${s.label}</button>`)
    .join('');

  const controls = seasons.length > 1 ? `
    <div class="stats-controls">
      <div class="season-toggle">${buttons}</div>
      <p class="season-hint">&#128197; Current season is live from GameSheet &bull; switch to view past seasons</p>
    </div>` : '';
  const typeTabs = tournament ? '' : `
    <div class="stats-types" role="group" aria-label="Game type">
      ${TYPES.map((t, i) => `<button type="button" class="stats-type-btn" data-type="${t.type}" aria-pressed="${i === 0}">${t.label}</button>`).join('')}
    </div>`;

  block.innerHTML = `${controls}${typeTabs}
    <div class="stats-summary" id="stats-summary" style="display:none">
      <div class="stat-tile"><span class="stat-num" id="s-gp">--</span><span class="stat-lbl">Games Played</span></div>
      <div class="stat-tile"><span class="stat-num red" id="s-tg">--</span><span class="stat-lbl">Team Goals</span></div>
      <div class="stat-tile"><span class="stat-num" id="s-ta">--</span><span class="stat-lbl">Team Assists</span></div>
      <div class="stat-tile"><span class="stat-num red" id="s-tp">--</span><span class="stat-lbl">Team Points</span></div>
    </div>
    <div id="stats-container"><div class="loading-box"><div class="spinner"></div><p>Loading stats&hellip;</p></div></div>
  `;

  const container = block.querySelector('#stats-container');
  const types = block.querySelector('.stats-types');
  let [{ type }] = TYPES;
  let current = 0;
  const loading = () => {
    container.innerHTML = '<div class="loading-box"><div class="spinner"></div><p>Loading stats&hellip;</p></div>';
  };
  const unavailable = () => {
    container.innerHTML = '<div class="err-box"><p>Stats are temporarily unavailable. '
      + '<a href="https://gamesheetstats.com" target="_blank" rel="noopener">View on GameSheet &rarr;</a></p></div>';
  };

  const showSeason = async (idx) => {
    current = idx;
    const season = seasons[idx];
    block.querySelectorAll('.season-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
    if (types) types.hidden = season.type !== 'types';
    loading();
    if (season.type === 'types') {
      try {
        await showTypeStats(block, container, feedKey(), type);
      } catch {
        unavailable();
      }
    } else if (season.type === 'feed') {
      try {
        await loadFeedStats(block, container);
      } catch {
        unavailable();
      }
    } else {
      loadStats(block, season.url);
    }
  };

  block.querySelectorAll('.season-btn').forEach((btn) => {
    btn.addEventListener('click', () => showSeason(Number(btn.dataset.idx)));
  });
  types?.querySelectorAll('.stats-type-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      type = btn.dataset.type;
      types.querySelectorAll('.stats-type-btn').forEach((b) => b.setAttribute('aria-pressed', b === btn));
      showSeason(current);
    });
  });

  showSeason(0);
}
