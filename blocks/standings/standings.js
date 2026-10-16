/*
 * Standings Block
 * Renders a division standings table from the GameSheet JSON feed produced by
 * the pull-gamesheet workflow (data/standings-{10u|14u}.json). The team's own
 * row is highlighted. Falls back to a GameSheet link if the feed is down.
 *
 * Team pages add tabs: League (the LIAHL standings, default), Tournament,
 * Exhibition and All Games. The last three show Rinx's record and results for
 * that game type, from GameSheet plus the DA sheet /other-games (see
 * scripts/team-feeds.js); Tournament also shows GameSheet tournament standings.
 */

import { gameSheetLogo, RINX_LOGO, teamLogo } from '../../scripts/team-logos.js';
import { loadTeamGames, tidyTeam, tidyDivision } from '../../scripts/team-feeds.js';
import { buildRace, renderPointsRace } from './points-race.js';

const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

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

function renderStandings(block, data, opts = {}) {
  const tournament = opts.tournament ?? isTournament();
  const source = opts.source || (tournament ? '2026 Mid-Atlantic Fall Classic' : '2026&ndash;2027 season');
  const teams = data.teams || [];
  const headCells = COLS.map((c) => `<th>${c.label}</th>`).join('');
  const rows = teams.map((tm) => {
    const cells = COLS.map((c) => `<td>${(tm[c.key] ?? '') === '' ? '—' : tm[c.key]}</td>`).join('');
    return `<tr${tm.ours ? ' class="st-ours"' : ''}>
      <td class="st-rank">${tm.rank || ''}</td>
      <td class="st-team">${tournament ? teamCell(tm) : tidyTeam(tm.team)}</td>
      ${cells}
    </tr>`;
  }).join('');

  block.innerHTML = `
    ${opts.title ? `<h3 class="st-subhead">${opts.title}</h3>` : ''}
    ${data.division ? `<p class="st-division">${tidyDivision(data.division)}</p>` : ''}
    <div class="st-table-wrap">
      <table class="st-tbl">
        <thead><tr><th class="st-rank">#</th><th class="st-team">Team</th>${headCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="st-src">${source} &bull; Source: <a href="https://gamesheetstats.com" target="_blank" rel="noopener">GameSheet</a></p>
  `;
}

// GameSheet tournaments with their own standings, per team page.
const TEAM_TOURNAMENTS = {
  '10u': [{ feed: 'mid-atlantic', title: 'Mid-Atlantic Fall Classic' }],
};

const TABS = [
  { type: 'League', label: 'LIAHL Standings' },
  { type: 'Tournament', label: 'Tournament' },
  { type: 'Exhibition', label: 'Exhibition' },
  { type: 'All', label: 'All Games' },
];

const typeTag = (type) => `<span class="st-type st-type-${type.toLowerCase()}">${type}</span>`;

// Record tiles + a results list for one game type (or all games).
// A small logo with an initials fallback (same pattern as teamCell).
function logoMark(src, name) {
  const ini = name.split(' ').slice(0, 2).map((w) => w[0])
    .join('')
    .toUpperCase();
  const img = src
    ? `<img class="st-logo" src="${src}" alt="" width="28" height="28" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex'">`
    : '';
  return `${img}<span class="st-logo st-logo-fb" aria-hidden="true"${src ? ' style="display:none"' : ''}>${ini}</span>`;
}

// "Rinx [logo] vs [logo] Opponent" for the games list.
function matchup(g) {
  return `<span class="st-matchup">
      ${logoMark(RINX_LOGO, 'Rinx')}<span class="st-vs">${g.prefix}</span>
      ${logoMark(g.oppLogo || teamLogo(g.opp), g.opp)}<span class="st-opp-name">${g.opp}</span>
    </span>`;
}

function recordHtml(games, type) {
  const label = type === 'All' ? 'games' : `${type.toLowerCase()} games`;
  if (!games.length) return `<p class="st-empty">No ${label} yet.</p>`;
  const played = games.filter((g) => g.result);
  const count = (r) => played.filter((g) => g.result === r).length;
  const goals = (i) => played.reduce((n, g) => n + (parseInt((g.score || '').split(/[-–]/)[i], 10) || 0), 0);
  const [w, l, t, gf, ga] = [count('W'), count('L'), count('T'), goals(0), goals(1)];
  const diff = gf - ga;
  const tiles = [
    ['GP', played.length], ['Record', `${w}-${l}-${t}`], ['PTS', w * 2 + t],
    ['GF', gf], ['GA', ga], ['DIFF', diff > 0 ? `+${diff}` : diff],
  ];
  const rows = games.map((g) => `
    <tr>
      <td class="st-gdate">${g.shortDate}</td>
      <td>${typeTag(g.type)}</td>
      <td class="st-gopp">${matchup(g)}</td>
      <td class="st-gres">${g.result ? `<span class="st-res st-res-${g.result.toLowerCase()}">${g.result}</span>` : '<span class="st-upcoming">Upcoming</span>'}</td>
      <td class="st-gscore">${g.result ? g.score : g.time || ''}</td>
    </tr>`).join('');
  return `
    <div class="st-record" role="list" aria-label="Rinx record">
      ${tiles.map(([k, v]) => `<div class="st-rec-tile" role="listitem"><span class="st-rec-num">${v}</span><span class="st-rec-lbl">${k}</span></div>`).join('')}
    </div>
    <div class="st-table-wrap">
      <table class="st-tbl st-games${type === 'All' ? '' : ' st-games-one-type'}">
        <thead><tr><th>Date</th><th>Type</th><th class="st-team">Opponent</th><th>Result</th><th>Score</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

async function fillRecordPanel(panel, key, type) {
  panel.innerHTML = '<div class="loading-box"><div class="spinner"></div><p>Loading games&hellip;</p></div>';
  try {
    const { finals, upcoming } = await loadTeamGames(key);
    const games = [...finals, ...upcoming].filter((g) => type === 'All' || g.type === type);
    panel.innerHTML = `${recordHtml(games, type)}
      <p class="st-src">League and tournament games from <a href="https://gamesheetstats.com" target="_blank" rel="noopener">GameSheet</a>; exhibition and other games added by the club.</p>`;
  } catch {
    panel.innerHTML = '<div class="err-box"><p>Games are temporarily unavailable.</p></div>';
    return;
  }
  if (type !== 'Tournament') return;
  // GameSheet tournament standings below the record.
  await Promise.all((TEAM_TOURNAMENTS[key] || []).map(async ({ feed, title }) => {
    try {
      const resp = await fetch(`${FEED_BASE}/standings-${feed}.json`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (!data.teams?.length) return;
      const box = document.createElement('div');
      box.className = 'st-tournament';
      renderStandings(box, data, { tournament: true, title, source: title });
      panel.append(box);
    } catch {
      // The record stands on its own.
    }
  }));
}

// Team pages: tabs over the league standings and per-type records.
function buildTabs(block, key) {
  block.innerHTML = `
    <div class="st-tabs" role="tablist" aria-label="Standings">
      ${TABS.map((t, i) => `<button type="button" role="tab" id="st-tab-${t.type}" aria-controls="st-panel-${t.type}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${t.label}</button>`).join('')}
    </div>
    ${TABS.map((t, i) => `<div class="st-panel" id="st-panel-${t.type}" role="tabpanel" aria-labelledby="st-tab-${t.type}"${i === 0 ? '' : ' hidden'}></div>`).join('')}`;
  const tabs = [...block.querySelectorAll('[role="tab"]')];
  const select = (type, focus) => {
    tabs.forEach((tab) => {
      const on = tab.id === `st-tab-${type}`;
      tab.setAttribute('aria-selected', on);
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    block.querySelectorAll('.st-panel').forEach((panel) => {
      panel.hidden = panel.id !== `st-panel-${type}`;
      if (!panel.hidden && type !== 'League' && !panel.dataset.loaded) {
        panel.dataset.loaded = 'true';
        fillRecordPanel(panel, key, type);
      }
    });
  };
  tabs.forEach((tab, i) => {
    const type = tab.id.replace('st-tab-', '');
    tab.addEventListener('click', () => select(type));
    tab.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      select(tabs[(i + step + tabs.length) % tabs.length].id.replace('st-tab-', ''), true);
    });
  });
  return block.querySelector('#st-panel-League');
}

export default function decorate(block) {
  let key = window.location.pathname.includes('14u') ? '14u' : '10u';
  if (isTournament()) key = 'mid-atlantic';
  const url = `${FEED_BASE}/standings-${key}.json`;

  // League standings render into the first tab on team pages.
  const target = isTournament() ? block : buildTabs(block, key);
  target.innerHTML = '<div class="loading-box"><div class="spinner"></div><p>Loading standings&hellip;</p></div>';

  // League pages also get the season points race, from the division's
  // completed games; fetch it alongside the standings.
  const gamesFeed = isTournament() ? null : fetch(`${FEED_BASE}/games-${key}.json`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  // Don't hold the section (and the page title, usually the LCP element)
  // until the feeds arrive; the loading box reserves the space meanwhile.
  (async () => {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`feed ${resp.status}`);
      const data = await resp.json();
      if (!data.teams || !data.teams.length) throw new Error('empty');
      renderStandings(target, data);
      if (!gamesFeed) return;
      // The chart's legend and plot space render right away (from the
      // standings) so the table doesn't shift down when the games arrive.
      // Optional: the table stands on its own if the games feed fails.
      const wrap = document.createElement('div');
      wrap.className = 'points-race';
      target.querySelector('.st-table-wrap')?.before(wrap);
      try {
        renderPointsRace(wrap, buildRace([], data.teams, tidyTeam));
        const games = await gamesFeed;
        const race = buildRace(games?.games || [], data.teams, tidyTeam);
        if (!race.some((t) => t.series.length > 1)) throw new Error('no games');
        renderPointsRace(wrap, race);
      } catch {
        wrap.remove();
      }
    } catch {
      target.innerHTML = '<div class="err-box"><p>Standings are temporarily unavailable. '
        + '<a href="https://gamesheetstats.com" target="_blank" rel="noopener">View on GameSheet &rarr;</a></p></div>';
    }
  })();
}
