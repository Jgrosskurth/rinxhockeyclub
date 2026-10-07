/*
 * Standings Block
 * Renders a division standings table from the GameSheet JSON feed produced by
 * the pull-gamesheet workflow (data/standings-{10u|14u}.json). The team's own
 * row is highlighted. Falls back to a GameSheet link if the feed is down.
 */

import { gameSheetLogo, RINX_LOGO } from '../../scripts/team-logos.js';
import { buildRace, renderPointsRace } from './points-race.js';

const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

// Tidy GameSheet's verbose ALL-CAPS / coded team names for display.
function tidyTeam(name) {
  let s = (name || '').trim();
  s = s.replace(/^TB\s+/i, '');
  s = s.replace(/^NYH?\d+(?:[-\s]\d+)?[-\s]*/i, '');
  s = s.replace(/[-\s]*\b\d{1,2}(?:U|AAA|AA|A|B)\b.*$/i, '');
  s = s.replace(/^[-–\s]+|[-–\s]+$/g, '').replace(/\s+/g, ' ').trim();
  if (s && s === s.toUpperCase()) {
    s = s.toLowerCase().replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
  }
  return s || name;
}

// Tournament pages read their own feed (see pull-schedule.yml).
function isTournament() {
  return window.location.pathname.includes('mid-atlantic');
}

// Team logo (ours, or a known GameSheet logo) with an initials fallback.
function teamCell(tm) {
  const name = tidyTeam(tm.team);
  const src = tm.ours ? RINX_LOGO : gameSheetLogo(name);
  const ini = name.split(' ').slice(0, 2).map((w) => w[0])
    .join('')
    .toUpperCase();
  // Same pattern as the schedule block: show initials if the logo fails.
  const logo = src
    ? `<img class="st-logo" src="${src}" alt="" width="28" height="28" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex'">`
    : '';
  const fb = `<span class="st-logo st-logo-fb" aria-hidden="true"${src ? ' style="display:none"' : ''}>${ini}</span>`;
  return `<span class="st-team-wrap">${logo}${fb}<span>${name}</span></span>`;
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
      <td class="st-team">${isTournament() ? teamCell(tm) : tidyTeam(tm.team)}</td>
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
    <p class="st-src">${isTournament() ? '2026 Mid-Atlantic Fall Showcase' : '2026&ndash;2027 season'} &bull; Source: <a href="https://gamesheetstats.com" target="_blank" rel="noopener">GameSheet</a></p>
  `;
}

export default async function decorate(block) {
  let key = window.location.pathname.includes('14u') ? '14u' : '10u';
  if (isTournament()) key = 'mid-atlantic';
  const url = `${FEED_BASE}/standings-${key}.json`;

  block.innerHTML = '<div class="loading-box"><div class="spinner"></div><p>Loading standings&hellip;</p></div>';

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`feed ${resp.status}`);
    const data = await resp.json();
    if (!data.teams || !data.teams.length) throw new Error('empty');
    renderStandings(block, data);
    // League pages also get the season points race, from the division's
    // completed games. Optional: the table stands on its own if this fails.
    // The chart's legend and plot space render right away (from the
    // standings) so the table doesn't shift down when the games arrive.
    if (!isTournament()) {
      const wrap = document.createElement('div');
      wrap.className = 'points-race';
      block.querySelector('.st-table-wrap')?.before(wrap);
      renderPointsRace(wrap, buildRace([], data.teams, tidyTeam));
      fetch(`${FEED_BASE}/games-${key}.json`)
        .then((r) => (r.ok ? r.json() : null))
        .then((games) => {
          const race = buildRace(games?.games || [], data.teams, tidyTeam);
          if (!race.some((t) => t.series.length > 1)) throw new Error('no games');
          renderPointsRace(wrap, race);
        })
        .catch(() => wrap.remove());
    }
  } catch {
    block.innerHTML = '<div class="err-box"><p>Standings are temporarily unavailable. '
      + '<a href="https://gamesheetstats.com" target="_blank" rel="noopener">View on GameSheet &rarr;</a></p></div>';
  }
}
