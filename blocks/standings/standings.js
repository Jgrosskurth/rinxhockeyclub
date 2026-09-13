/*
 * Standings Block
 * Renders a division standings table from the GameSheet JSON feed produced by
 * the pull-gamesheet workflow (data/standings-{10u|14u}.json). The team's own
 * row is highlighted. Falls back to a GameSheet link if the feed is down.
 */

const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

// Tidy GameSheet's verbose ALL-CAPS / coded team names for display.
function tidyTeam(name) {
  let s = (name || '').trim();
  s = s.replace(/^TB\s+/i, '');
  s = s.replace(/^NYH?\d+(?:[-\s]\d+)?[-\s]*/i, '');
  s = s.replace(/[-\s]*\b\d{1,2}U\b.*$/i, '');
  s = s.replace(/^[-–\s]+|[-–\s]+$/g, '').replace(/\s+/g, ' ').trim();
  if (s && s === s.toUpperCase()) {
    s = s.toLowerCase().replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
  }
  return s || name;
}

const COLS = [
  { key: 'gp', label: 'GP' },
  { key: 'w', label: 'W' },
  { key: 'l', label: 'L' },
  { key: 't', label: 'T' },
  { key: 'otl', label: 'OTL' },
  { key: 'pts', label: 'PTS' },
  { key: 'gf', label: 'GF' },
  { key: 'ga', label: 'GA' },
  { key: 'diff', label: 'DIFF' },
  { key: 'streak', label: 'STK' },
];

function renderStandings(block, data) {
  const teams = data.teams || [];
  const headCells = COLS.map((c) => `<th>${c.label}</th>`).join('');
  const rows = teams.map((tm) => {
    const cells = COLS.map((c) => `<td>${(tm[c.key] ?? '') === '' ? '—' : tm[c.key]}</td>`).join('');
    return `<tr${tm.ours ? ' class="st-ours"' : ''}>
      <td class="st-rank">${tm.rank || ''}</td>
      <td class="st-team">${tidyTeam(tm.team)}</td>
      ${cells}
    </tr>`;
  }).join('');

  block.innerHTML = `
    ${data.division ? `<p class="st-division">${data.division}</p>` : ''}
    <div class="st-table-wrap">
      <table class="st-tbl">
        <thead><tr><th class="st-rank">#</th><th class="st-team">Team</th>${headCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="st-src">2026&ndash;2027 season &bull; Source: <a href="https://gamesheetstats.com" target="_blank" rel="noopener">GameSheet</a></p>
  `;
}

export default async function decorate(block) {
  const is14u = window.location.pathname.includes('14u');
  const url = `${FEED_BASE}/standings-${is14u ? '14u' : '10u'}.json`;

  block.innerHTML = '<div class="loading-box"><div class="spinner"></div><p>Loading standings&hellip;</p></div>';

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`feed ${resp.status}`);
    const data = await resp.json();
    if (!data.teams || !data.teams.length) throw new Error('empty');
    renderStandings(block, data);
  } catch {
    block.innerHTML = '<div class="err-box"><p>Standings are temporarily unavailable. '
      + '<a href="https://gamesheetstats.com" target="_blank" rel="noopener">View on GameSheet &rarr;</a></p></div>';
  }
}
