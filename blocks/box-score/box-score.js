import { TEAMS, tidyTeam, playerName } from '../../scripts/team-feeds.js';
import { teamLogo, RINX_LOGO } from '../../scripts/team-logos.js';

// Box Score page (/box-score?team=10u&game=5731): one league game's box score,
// laid out like LIHockey.com's game page. The data is LI Hockey's, saved by
// .github/scripts/pull_lihockey.py in data/stats-lihockey-<team>.json.
// Without ?game, lists every box score for both teams.

const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const isRinx = (name) => /\brinx\b/i.test(name || '');
const who = (name) => (name || '').toLowerCase().replace(/[^a-z]/g, '');

function teamName(name, key) {
  return isRinx(name) ? `Rinx ${TEAMS[key].label}` : tidyTeam(name);
}

function logo(name, size, cls = '') {
  const src = isRinx(name) ? RINX_LOGO : teamLogo(tidyTeam(name));
  const ini = tidyTeam(name).split(' ').slice(0, 2).map((w) => w[0])
    .join('')
    .toUpperCase();
  // Initials stand in when there's no logo or it fails to load.
  const fb = `<span class="bx-logo bx-logo-fb ${cls}" aria-hidden="true"${src ? ' hidden' : ''}>${esc(ini)}</span>`;
  return src
    ? `<img class="bx-logo ${cls}" src="${esc(src)}" alt="" width="${size}" height="${size}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">${fb}`
    : fb;
}

// LI Hockey sometimes lists a player twice (two player records): show once.
function once(rows) {
  const seen = new Map();
  rows.forEach((r) => {
    const k = who(r.name);
    if (!seen.has(k) || (!seen.get(k).number && r.number)) seen.set(k, r);
  });
  return [...seen.values()];
}

function hero(d, game, key) {
  const [away, home] = d.teams;
  const awayWon = +away.total > +home.total;
  const homeWon = +home.total > +away.total;
  const side = (t, label, won) => `
    <div class="bx-side-team${won ? ' bx-won' : ''}">
      ${logo(t.name, 96, 'bx-logo-lg')}
      <span class="bx-ha">${label}</span>
      <span class="bx-tname">${esc(teamName(t.name, key))}</span>
      ${t.record ? `<span class="bx-trec">${esc(t.record)}</span>` : ''}
    </div>`;
  const periods = d.periodLabels.length ? `
    <table class="bx-lines" aria-label="Goals by period">
      <thead><tr><th scope="col"><span class="sr-only">Team</span></th>${d.periodLabels.map((p) => `<th scope="col">${esc(p)}</th>`).join('')}<th scope="col">T</th></tr></thead>
      <tbody>${d.teams.map((t) => `
        <tr class="${+t.total >= +d.teams.find((o) => o !== t).total ? 'bx-lead' : ''}">
          <th scope="row">${logo(t.name, 20)}<span>${esc(t.abbr || teamName(t.name, key))}</span></th>
          ${t.periods.map((g) => `<td>${esc(g)}</td>`).join('')}<td class="bx-t">${esc(t.total)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : '';
  const time = (d.info.find((l) => /\d:\d\d\s*[AP]M/i.test(l)) || '').split('·').pop().trim();
  return `
    <header class="bx-hero">
      <p class="bx-meta">${esc(d.league)}${d.info[1] ? ` &middot; ${esc(d.info[1])}` : ''}</p>
      <h1 class="sr-only">${esc(teamName(away.name, key))} at ${esc(teamName(home.name, key))}, ${esc(away.total)}-${esc(home.total)} ${esc(d.status)}</h1>
      <div class="bx-board">
        ${side(away, 'Away', awayWon)}
        <div class="bx-center">
          <p class="bx-score" aria-hidden="true"><span class="${awayWon ? 'bx-win' : ''}">${esc(away.total)}</span><span class="bx-dash">&ndash;</span><span class="${homeWon ? 'bx-win' : ''}">${esc(home.total)}</span></p>
          <p class="bx-status">${esc(d.status)}</p>
          ${periods}
        </div>
        ${side(home, 'Home', homeWon)}
      </div>
      <p class="bx-foot">${esc(d.dateLong)}${time ? ` &middot; ${esc(time)}` : ''}${d.venue ? ` &middot; ${esc(d.venue)}` : ''}</p>
      <p class="bx-actions">
        ${d.recap ? `<a class="bx-btn" href="${esc(d.recap.url)}" target="_blank" rel="noopener">Read the recap</a>` : ''}
        <a class="bx-btn" href="${esc(game.url)}" target="_blank" rel="noopener">View on LI Hockey</a>
        <a class="bx-btn bx-btn-solid" href="${esc(TEAMS[key].schedulePath)}">${esc(TEAMS[key].label)} schedule</a>
      </p>
    </header>`;
}

function stars(d, key) {
  if (!d.stars.length) return '';
  return `
    <section class="bx-stars" aria-labelledby="bx-stars-h">
      <h2 id="bx-stars-h" class="bx-kicker">Three Stars</h2>
      <ol class="bx-star-list">${d.stars.map((s) => `
        <li class="bx-star">
          <span class="bx-rank bx-rank-${esc(s.rank)}" aria-label="Star ${esc(s.rank)}">${esc(s.rank)}</span>
          ${logo(s.team, 32)}
          <span class="bx-star-info"><span class="bx-star-name">${esc(playerName(s.name))}</span><span class="bx-star-team">${esc(teamName(s.team, key))}</span></span>
          <span class="bx-star-line">${esc(s.line)}</span>
        </li>`).join('')}
      </ol>
    </section>`;
}

function leaders(d) {
  if (!d.leaders.length) return '';
  return `
    <section class="bx-section" aria-labelledby="bx-lead-h">
      <h2 id="bx-lead-h" class="bx-h2">Game Leaders</h2>
      <dl class="bx-leaders">${d.leaders.map((l) => `
        <div class="bx-leader"><dt>${esc(l.cat)}</dt><dd><span>${esc(playerName(l.name))}</span><strong>${esc(l.val)}</strong></dd></div>`).join('')}
      </dl>
    </section>`;
}

function teamCard(t, key) {
  const skaters = once(t.skaters);
  const goalies = once(t.goalies);
  const num = (v) => (v === '' || v == null ? '&mdash;' : esc(v));
  return `
    <div class="bx-card${isRinx(t.name) ? ' bx-card-rinx' : ''}">
      <h3 class="bx-card-hdr">${logo(t.name, 28)}<span class="bx-card-name">${esc(teamName(t.name, key))}</span>${t.record ? `<span class="bx-card-rec">${esc(t.record)}</span>` : ''}</h3>
      <div class="bx-scroll" tabindex="0" role="region" aria-label="${esc(teamName(t.name, key))} skaters">
        <table class="bx-table">
          <thead><tr><th scope="col" class="bx-num">#</th><th scope="col" class="bx-player">Player</th><th scope="col">G</th><th scope="col">A</th><th scope="col">PTS</th><th scope="col">PIM</th><th scope="col">+/&minus;</th><th scope="col">SOG</th></tr></thead>
          <tbody>${skaters.length ? skaters.map((p) => `
            <tr class="${+p.pts > 0 ? 'bx-scorer' : ''}">
              <td class="bx-num">${esc(p.number)}</td>
              <th scope="row" class="bx-player">${esc(playerName(p.name))}${p.badge ? ` <span class="bx-badge">${esc(p.badge)}</span>` : ''}</th>
              <td>${num(p.g)}</td><td>${num(p.a)}</td><td class="bx-pts">${num(p.pts)}</td><td>${num(p.pim)}</td><td>${num(p.plusminus)}</td><td>${num(p.sog)}</td>
            </tr>`).join('') : '<tr><td colspan="8" class="bx-none">No skater stats recorded.</td></tr>'}
          </tbody>
          ${t.totals && t.totals.g !== undefined ? `<tfoot><tr><td></td><th scope="row" class="bx-player">Team totals</th><td>${num(t.totals.g)}</td><td>${num(t.totals.a)}</td><td>${num(t.totals.pts)}</td><td>${num(t.totals.pim)}</td><td>&mdash;</td><td>&mdash;</td></tr></tfoot>` : ''}
        </table>
      </div>
      ${goalies.length ? `
      <div class="bx-scroll" tabindex="0" role="region" aria-label="${esc(teamName(t.name, key))} goalies">
        <table class="bx-table bx-goalies">
          <thead><tr><th scope="col" class="bx-num">#</th><th scope="col" class="bx-player">Goalie</th><th scope="col">MIN</th><th scope="col">SA</th><th scope="col">GA</th><th scope="col">SV</th><th scope="col">SV%</th><th scope="col">W/L</th></tr></thead>
          <tbody>${goalies.map((g) => `
            <tr>
              <td class="bx-num">${esc(g.number)}</td>
              <th scope="row" class="bx-player">${esc(playerName(g.name))}</th>
              <td>${num(g.min)}</td><td>${num(g.sa)}</td><td>${num(g.ga)}</td><td>${num(g.sv)}</td><td class="bx-pts">${num(g.svpct)}</td><td>${num(g.wl)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}
    </div>`;
}

function sidebar(d, game) {
  return `
    <aside class="bx-aside">
      ${d.recap ? `
      <div class="bx-widget">
        <h2 class="bx-widget-h">Game Recap</h2>
        <p class="bx-recap-title">${esc(d.recap.title || 'Read the game recap')}</p>
        <a class="bx-btn bx-btn-red" href="${esc(d.recap.url)}" target="_blank" rel="noopener">Read on LI Hockey</a>
      </div>` : ''}
      <div class="bx-widget">
        <h2 class="bx-widget-h">Game Info</h2>
        <p class="bx-info"><strong>${esc(d.info[0] || d.league)}</strong>${d.info[1] ? `<br>${esc(d.info[1])}` : ''}</p>
        <p class="bx-info"><strong>${esc(d.info[2] || d.dateLong)}</strong>${d.venue ? `<br>${esc(d.venue)}` : ''}</p>
      </div>
      <p class="bx-source">Box score from <a href="${esc(game.url)}" target="_blank" rel="noopener">LIHockey.com</a>. Assists and players without a stat aren’t recorded there yet.</p>
    </aside>`;
}

function gameHtml(game, key) {
  const d = game.detail;
  return `
    ${hero(d, game, key)}
    ${stars(d, key)}
    <div class="bx-layout">
      <div class="bx-main">
        ${leaders(d)}
        <section class="bx-section" aria-labelledby="bx-box-h">
          <h2 id="bx-box-h" class="bx-h2">Box Score</h2>
          ${d.teams.map((t) => teamCard(t, key)).join('')}
        </section>
      </div>
      ${sidebar(d, game)}
    </div>`;
}

function indexHtml(feeds) {
  const lists = Object.keys(TEAMS).map((key) => {
    const games = (feeds[key]?.games || []).filter((g) => g.detail?.teams?.length === 2);
    const items = games.map((g) => {
      const [away, home] = g.detail.teams;
      const opp = isRinx(away.name) ? home : away;
      const us = isRinx(away.name) ? away : home;
      let res = 'T';
      if (+us.total !== +opp.total) res = +us.total > +opp.total ? 'W' : 'L';
      return `<li><a href="/box-score?team=${key}&amp;game=${esc(g.id)}">
          <span class="bx-i-date">${esc(g.date)}</span>
          ${logo(opp.name, 28)}
          <span class="bx-i-opp">${isRinx(home.name) ? 'vs' : 'at'} ${esc(teamName(opp.name, key))}</span>
          <span class="bx-i-res bx-res-${res.toLowerCase()}">${res}</span>
          <span class="bx-i-score">${esc(us.total)}-${esc(opp.total)}</span>
        </a></li>`;
    }).join('');
    return `<section class="bx-section"><h2 class="bx-h2">${esc(TEAMS[key].label)}</h2>${items ? `<ul class="bx-index">${items}</ul>` : '<p class="bx-none">No box scores posted yet.</p>'}</section>`;
  }).join('');
  return `<header class="bx-hero bx-hero-index"><h1 class="bx-index-h1">Box Scores</h1><p class="bx-foot">LIAHL games, from LIHockey.com</p></header><div class="bx-layout bx-layout-index"><div class="bx-main">${lists}</div></div>`;
}

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const key = (params.get('team') || '').toLowerCase();
  const id = params.get('game') || '';
  block.innerHTML = '<div class="bx-loading"><div class="spinner"></div><p>Loading box score&hellip;</p></div>';

  const load = (k) => fetch(`${FEED_BASE}/stats-lihockey-${k}.json`)
    .then((r) => (r.ok ? r.json() : null)).catch(() => null);

  if (!TEAMS[key] || !id) {
    const keys = Object.keys(TEAMS);
    const data = await Promise.all(keys.map(load));
    block.innerHTML = indexHtml(Object.fromEntries(keys.map((k, i) => [k, data[i]])));
    return;
  }
  const feed = await load(key);
  const game = (feed?.games || []).find((g) => g.id === id);
  if (!game?.detail?.teams?.length) {
    block.innerHTML = `<div class="bx-missing"><h1>Box score not available</h1><p>This game’s box score hasn’t been posted yet. Box scores usually appear on LIHockey.com a few days after the game.</p><p><a class="bx-btn bx-btn-solid" href="${esc(TEAMS[key]?.schedulePath || '/schedule')}">Back to the schedule</a> <a class="bx-btn" href="/box-score">All box scores</a></p></div>`;
    return;
  }
  block.innerHTML = gameHtml(game, key);
  const [away, home] = game.detail.teams;
  document.title = `${teamName(away.name, key)} ${away.total}, ${teamName(home.name, key)} ${home.total} | Box Score | Rinx Hockey Club`;
}
