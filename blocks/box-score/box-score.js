import { TEAMS, tidyTeam, playerName } from '../../scripts/team-feeds.js';
import { teamLogo, RINX_LOGO } from '../../scripts/team-logos.js';

// Box Score page.
// - League games (/box-score?team=10u&game=5731), laid out like LIHockey.com's
//   game page. The data is LI Hockey's, saved by .github/scripts/pull_lihockey.py
//   in data/stats-lihockey-<team>.json.
// - Tournament games (/box-score?event=mid-atlantic&game=3060517), from the game's
//   GameSheet page (Box Score + Lineups tabs), saved by
//   .github/scripts/pull_gamesheet_boxscores.py in data/boxscores-<event>.json.
//   Same layout, plus the scoring summary and penalties GameSheet records.
// Without ?game, lists every box score.

const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

// Tournaments with GameSheet box scores: feed, team, and where "back" goes.
const EVENTS = {
  'mid-atlantic': {
    label: 'Mid-Atlantic Fall Showcase',
    team: '10u',
    feed: 'boxscores-mid-atlantic',
    schedulePath: '/mid-atlantic-fall-classic-schedule',
  },
};

// Where a game came from: drives the hero line, links and source note.
function sourceOf(key, eventKey) {
  const ev = EVENTS[eventKey];
  if (ev) {
    return {
      site: 'GameSheet',
      backPath: ev.schedulePath,
      backLabel: 'Tournament schedule',
      noteLink: 'GameSheet',
      note: ', the tournament’s official scoresheet.',
    };
  }
  return {
    site: 'LI Hockey',
    backPath: TEAMS[key].schedulePath,
    backLabel: `${TEAMS[key].label} schedule`,
    noteLink: 'LIHockey.com',
    note: '. Assists and players without a stat aren’t recorded there yet.',
  };
}
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const isRinx = (name) => /\brinx\b/i.test(name || '');
const who = (name) => (name || '').toLowerCase().replace(/[^a-z]/g, '');

function teamName(name, key) {
  return isRinx(name) ? `Rinx ${TEAMS[key].label}` : tidyTeam(name);
}

// url: the team's logo from the feed (GameSheet), used when we have none of our own.
function logo(name, size, cls = '', url = '') {
  const src = isRinx(name) ? RINX_LOGO : (teamLogo(tidyTeam(name)) || url);
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

function hero(d, game, key, src) {
  const [away, home] = d.teams;
  const awayWon = +away.total > +home.total;
  const homeWon = +home.total > +away.total;
  const side = (t, label, won) => `
    <div class="bx-side-team${won ? ' bx-won' : ''}">
      ${logo(t.name, 96, 'bx-logo-lg', t.logo)}
      <span class="bx-ha">${label}</span>
      <span class="bx-tname">${esc(teamName(t.name, key))}</span>
      ${t.record ? `<span class="bx-trec">${esc(t.record)}</span>` : ''}
      ${t.shots ? `<span class="bx-trec">${esc(t.shots)} shots</span>` : ''}
    </div>`;
  const periods = d.periodLabels.length ? `
    <table class="bx-lines" aria-label="Goals by period">
      <thead><tr><th scope="col"><span class="sr-only">Team</span></th>${d.periodLabels.map((p) => `<th scope="col">${esc(p)}</th>`).join('')}<th scope="col">T</th></tr></thead>
      <tbody>${d.teams.map((t) => `
        <tr class="${+t.total >= +d.teams.find((o) => o !== t).total ? 'bx-lead' : ''}">
          <th scope="row">${logo(t.name, 20, '', t.logo)}<span>${esc(t.abbr || teamName(t.name, key))}</span></th>
          ${t.periods.map((g) => `<td>${esc(g)}</td>`).join('')}<td class="bx-t">${esc(t.total)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : '';
  // GameSheet: "Game #6"; LI Hockey: the division line
  const meta = src.site === 'GameSheet' ? d.info[0] : d.info[1];
  const time = d.time || (d.info.find((l) => /\d:\d\d\s*[AP]M/i.test(l)) || '').split('·').pop().trim();
  return `
    <header class="bx-hero">
      <p class="bx-meta">${esc(d.league)}${meta ? ` &middot; ${esc(meta)}` : ''}</p>
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
        <a class="bx-btn" href="${esc(game.url)}" target="_blank" rel="noopener">View on ${esc(src.site)}</a>
        <a class="bx-btn bx-btn-solid" href="${esc(src.backPath)}">${esc(src.backLabel)}</a>
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
  // +/- and shots are LI Hockey columns; GameSheet's lineups don't record them.
  const extra = skaters.some((p) => 'plusminus' in p || 'sog' in p);
  return `
    <div class="bx-card${isRinx(t.name) ? ' bx-card-rinx' : ''}">
      <h3 class="bx-card-hdr">${logo(t.name, 28, '', t.logo)}<span class="bx-card-name">${esc(teamName(t.name, key))}</span>${t.record ? `<span class="bx-card-rec">${esc(t.record)}</span>` : ''}</h3>
      <div class="bx-scroll" tabindex="0" role="region" aria-label="${esc(teamName(t.name, key))} skaters">
        <table class="bx-table">
          <thead><tr><th scope="col" class="bx-num">#</th><th scope="col" class="bx-player">Player</th><th scope="col">G</th><th scope="col">A</th><th scope="col">PTS</th><th scope="col">PIM</th>${extra ? '<th scope="col">+/&minus;</th><th scope="col">SOG</th>' : ''}</tr></thead>
          <tbody>${skaters.length ? skaters.map((p) => `
            <tr class="${+p.pts > 0 ? 'bx-scorer' : ''}">
              <td class="bx-num">${esc(p.number)}</td>
              <th scope="row" class="bx-player">${esc(playerName(p.name))}${p.badge ? ` <span class="bx-badge">${esc(p.badge)}</span>` : ''}</th>
              <td>${num(p.g)}</td><td>${num(p.a)}</td><td class="bx-pts">${num(p.pts)}</td><td>${num(p.pim)}</td>${extra ? `<td>${num(p.plusminus)}</td><td>${num(p.sog)}</td>` : ''}
            </tr>`).join('') : `<tr><td colspan="${extra ? 8 : 6}" class="bx-none">No skater stats recorded.</td></tr>`}
          </tbody>
          ${t.totals && t.totals.g !== undefined ? `<tfoot><tr><td></td><th scope="row" class="bx-player">Team totals</th><td>${num(t.totals.g)}</td><td>${num(t.totals.a)}</td><td>${num(t.totals.pts)}</td><td>${num(t.totals.pim)}</td>${extra ? '<td>&mdash;</td><td>&mdash;</td>' : ''}</tr></tfoot>` : ''}
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

// "#18 Sean Fox (2)": jersey, name, and the player's tally for the tournament
function who2(p) {
  return `${p.number ? `<span class="bx-ev-num">#${esc(p.number)}</span> ` : ''}${esc(playerName(p.name))}${p.count ? ` <span class="bx-ev-count">(${esc(p.count)})</span>` : ''}`;
}

// Goals by period (GameSheet): time, scorer, assists, team.
function scoringSummary(d, key) {
  if (!d.goals?.length) return '';
  // every period gets a heading (OT only when there was an OT goal)
  const byPeriod = [...new Set([...d.periodLabels, ...d.goals.map((g) => g.period)])]
    .map((p) => [p, d.goals.filter((g) => g.period === p)]);
  const feedLogo = (name) => d.teams.find((t) => t.name === name)?.logo || '';
  return `
    <section class="bx-section" aria-labelledby="bx-goals-h">
      <h2 id="bx-goals-h" class="bx-h2">Scoring Summary</h2>
      ${byPeriod.map(([p, goals]) => `
        <h3 class="bx-period">${esc(p)} period</h3>
        ${goals.length ? `<ol class="bx-events">${goals.map((g) => `
          <li class="bx-event${isRinx(g.team) ? ' bx-event-rinx' : ''}">
            <span class="bx-ev-time">${esc(g.time)}</span>
            ${logo(g.team, 28, '', feedLogo(g.team))}
            <span class="bx-ev-body">
              <span class="bx-ev-main">${who2(g.scorer)}${(g.tags || []).map((tag) => ` <span class="bx-badge">${esc(tag)}</span>`).join('')}</span>
              <span class="bx-ev-sub">${g.assists?.length ? `Assists: ${g.assists.map(who2).join(', ')}` : 'Unassisted'} &middot; ${esc(teamName(g.team, key))}</span>
            </span>
          </li>`).join('')}
        </ol>` : '<p class="bx-none">No scoring</p>'}`).join('')}
    </section>`;
}

// Penalties by period (GameSheet): time, player, infraction, team.
function penaltyList(d, key) {
  if (!d.penalties) return '';
  const periods = [...new Set([...d.periodLabels, ...d.penalties.map((p) => p.period)])];
  const feedLogo = (name) => d.teams.find((t) => t.name === name)?.logo || '';
  return `
    <section class="bx-section" aria-labelledby="bx-pen-h">
      <h2 id="bx-pen-h" class="bx-h2">Penalties</h2>
      ${d.penalties.length ? periods.map((per) => {
    const list = d.penalties.filter((p) => p.period === per);
    if (!list.length) return '';
    return `
        <h3 class="bx-period">${esc(per)} period</h3>
        <ol class="bx-events">${list.map((p) => `
          <li class="bx-event${isRinx(p.team) ? ' bx-event-rinx' : ''}">
            <span class="bx-ev-time">${esc(p.time)}</span>
            ${logo(p.team, 28, '', feedLogo(p.team))}
            <span class="bx-ev-body">
              <span class="bx-ev-main">${who2(p)}</span>
              <span class="bx-ev-sub">${esc(p.infraction)} &middot; ${esc(teamName(p.team, key))}</span>
            </span>
          </li>`).join('')}
        </ol>`;
  }).join('') : '<p class="bx-none">No penalties</p>'}
    </section>`;
}

function sidebar(d, game, src) {
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
      <p class="bx-source">Box score from <a href="${esc(game.url)}" target="_blank" rel="noopener">${esc(src.noteLink)}</a>${esc(src.note)}</p>
      ${d.correction ? `<p class="bx-source"><strong>Note:</strong> ${esc(d.correction)}</p>` : ''}
    </aside>`;
}

function gameHtml(game, key, src) {
  const d = game.detail;
  return `
    ${hero(d, game, key, src)}
    ${stars(d, key)}
    <div class="bx-layout">
      <div class="bx-main">
        ${leaders(d)}
        ${scoringSummary(d, key)}
        <section class="bx-section" aria-labelledby="bx-box-h">
          <h2 id="bx-box-h" class="bx-h2">Box Score</h2>
          ${d.teams.map((t) => teamCard(t, key)).join('')}
        </section>
        ${penaltyList(d, key)}
      </div>
      ${sidebar(d, game, src)}
    </div>`;
}

// One list of games (for a team's league games or a tournament's games).
function indexList(games, key, href) {
  return games.filter((g) => g.detail?.teams?.length === 2).map((g) => {
    const [away, home] = g.detail.teams;
    const opp = isRinx(away.name) ? home : away;
    const us = isRinx(away.name) ? away : home;
    let res = 'T';
    if (+us.total !== +opp.total) res = +us.total > +opp.total ? 'W' : 'L';
    return `<li><a href="${href(g)}">
          <span class="bx-i-date">${esc(g.date)}</span>
          ${logo(opp.name, 28, '', opp.logo)}
          <span class="bx-i-opp">${isRinx(home.name) ? 'vs' : 'at'} ${esc(teamName(opp.name, key))}</span>
          <span class="bx-i-res bx-res-${res.toLowerCase()}">${res}</span>
          <span class="bx-i-score">${esc(us.total)}-${esc(opp.total)}</span>
        </a></li>`;
  }).join('');
}

function indexHtml(feeds, events) {
  const section = (title, items) => `<section class="bx-section"><h2 class="bx-h2">${esc(title)}</h2>${items ? `<ul class="bx-index">${items}</ul>` : '<p class="bx-none">No box scores posted yet.</p>'}</section>`;
  const lists = Object.keys(TEAMS).map((key) => {
    const items = indexList(feeds[key]?.games || [], key, (g) => `/box-score?team=${key}&amp;game=${esc(g.id)}`);
    const tournaments = Object.entries(EVENTS)
      .filter(([, ev]) => ev.team === key && events[ev.feed]?.games?.length)
      .map(([ek, ev]) => section(
        `${TEAMS[key].label} · ${ev.label}`,
        indexList(events[ev.feed].games, key, (g) => `/box-score?event=${ek}&amp;game=${esc(g.id)}`),
      ))
      .join('');
    return section(TEAMS[key].label, items) + tournaments;
  }).join('');
  return `<header class="bx-hero bx-hero-index"><h1 class="bx-index-h1">Box Scores</h1><p class="bx-foot">League games from LIHockey.com &middot; tournament games from GameSheet</p></header><div class="bx-layout bx-layout-index"><div class="bx-main">${lists}</div></div>`;
}

const getJson = (name) => fetch(`${FEED_BASE}/${name}.json`)
  .then((r) => (r.ok ? r.json() : null)).catch(() => null);

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const eventKey = (params.get('event') || '').toLowerCase();
  const event = EVENTS[eventKey];
  const key = event ? event.team : (params.get('team') || '').toLowerCase();
  const id = params.get('game') || '';
  block.innerHTML = '<div class="bx-loading"><div class="spinner"></div><p>Loading box score&hellip;</p></div>';

  if (!TEAMS[key] || !id) {
    const keys = Object.keys(TEAMS);
    const feeds = Object.values(EVENTS).map((ev) => ev.feed);
    const [data, events] = await Promise.all([
      Promise.all(keys.map((k) => getJson(`stats-lihockey-${k}`))),
      Promise.all(feeds.map(getJson)),
    ]);
    block.innerHTML = indexHtml(
      Object.fromEntries(keys.map((k, i) => [k, data[i]])),
      Object.fromEntries(feeds.map((f, i) => [f, events[i]])),
    );
    return;
  }
  const src = sourceOf(key, eventKey);
  const feed = await getJson(event ? event.feed : `stats-lihockey-${key}`);
  const game = (feed?.games || []).find((g) => String(g.id) === id);
  if (!game?.detail?.teams?.length) {
    const when = event ? 'Tournament box scores are saved from GameSheet within a day of the game.' : 'Box scores usually appear on LIHockey.com a few days after the game.';
    block.innerHTML = `<div class="bx-missing"><h1>Box score not available</h1><p>This game’s box score hasn’t been posted yet. ${when}</p><p><a class="bx-btn bx-btn-solid" href="${esc(src.backPath || '/schedule')}">Back to the schedule</a> <a class="bx-btn" href="/box-score">All box scores</a></p></div>`;
    return;
  }
  block.innerHTML = gameHtml(game, key, src);
  const [away, home] = game.detail.teams;
  document.title = `${teamName(away.name, key)} ${away.total}, ${teamName(home.name, key)} ${home.total} | Box Score | Rinx Hockey Club`;
}
