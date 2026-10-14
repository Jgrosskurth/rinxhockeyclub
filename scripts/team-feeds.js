// Shared loaders for the GameSheet feeds written by the pull-schedule workflow,
// plus the DA sheet /other-games for exhibition and other non-GameSheet games.
// Used by the homepage hero ("Next up"), the results rail, the standings
// summary and the schedule/standings pages. Each source is fetched once per
// page view and shared between blocks.
import { teamLogo, RINX_LOGO } from './team-logos.js';

const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

// Tournament feeds: the name shown on the "Next up" card and the feed with
// that tournament's standings.
const TOURNAMENTS = {
  'schedule-mid-atlantic.json': { name: 'Mid-Atlantic Fall Showcase', standings: 'standings-mid-atlantic.json' },
};

export const TEAMS = {
  '10u': {
    key: '10u',
    label: '10U Squirts',
    feeds: ['schedule-10u.json', 'schedule-mid-atlantic.json'],
    standings: 'standings-10u.json',
    schedulePath: '/schedule',
    standingsPath: '/standings',
  },
  '14u': {
    key: '14u',
    label: '14U Bantam',
    feeds: ['schedule-14u.json'],
    standings: 'standings-14u.json',
    schedulePath: '/schedule-14u',
    standingsPath: '/standings-14u',
  },
};

export const DEFAULT_TEAM = '10u';

// The hero and the results rail share one team choice.
const TEAM_EVENT = 'rinx:team';
let currentTeam = DEFAULT_TEAM;

export function selectTeam(key) {
  if (!TEAMS[key] || key === currentTeam) return;
  currentTeam = key;
  document.dispatchEvent(new CustomEvent(TEAM_EVENT, { detail: key }));
}

export function onTeamChange(fn) {
  document.addEventListener(TEAM_EVENT, (e) => fn(e.detail));
}

export const getTeam = () => currentTeam;

const cache = {};

function loadFeed(name) {
  if (!cache[name]) {
    cache[name] = fetch(`${FEED_BASE}/${name}`).then((resp) => {
      if (!resp.ok) throw new Error(`${name}: ${resp.status}`);
      return resp.json();
    });
    cache[name].catch(() => { delete cache[name]; });
  }
  return cache[name];
}

// ALL CAPS -> Title Case ("MCCARTHY" -> "McCarthy"); mixed case is kept.
function titleCase(text) {
  if (!text || text !== text.toUpperCase()) return text;
  return text.toLowerCase()
    .replace(/\b([a-z])/g, (m, c) => c.toUpperCase())
    .replace(/\bMc([a-z])/g, (m, c) => `Mc${c.toUpperCase()}`);
}

/**
 * Clean up GameSheet's coded team names, keeping the coach's last name so two
 * teams from one club stay apart: "NYH4033-002-North Park-10U Mauro 04 - 10U
 * SILVER" -> "North Park (Mauro)", "PECONIC WILDCATS-10U-MCCARTHY" ->
 * "Peconic Wildcats (McCarthy)". Tournament names ("Delco Phantoms 10A") have
 * no coach. Used everywhere team names are shown.
 * @param {string} name
 */
export function tidyTeam(name) {
  let s = (name || '').trim();
  s = s.replace(/^TB\s+/i, '');
  s = s.replace(/^NYH?\d+(?:[-\s]\d+)?[-\s]*/i, '');
  let coach = '';
  const age = s.match(/[-\s]*\b\d{1,2}(?:U|AAA|AA|A|B)\b(.*)$/i);
  if (age) {
    // After the age group: the coach, then (in schedules) the division.
    coach = age[1].replace(/\s*\d{1,2}\s*-\s*\d{1,2}U\b.*$/i, '')
      .replace(/^[-–\s]+|[-–\s]+$/g, '')
      // A level ("14U A", "14U AA", "Tier II") is not a coach.
      .replace(/^(?:AAA|AA|A|BB|B|Tier\s+[IV\d]+)(?=\s|$)/i, '')
      .trim()
      .replace(/\s+/g, ' ');
    s = s.slice(0, age.index);
  }
  s = titleCase(s.replace(/^[-–\s]+|[-–\s]+$/g, '').replace(/\s+/g, ' ').trim());
  if (!s) return name;
  return coach ? `${s} (${titleCase(coach)})` : s;
}

// Game types, in the order the schedule and standings filters show them.
// League and Tournament come from GameSheet; Exhibition and Other (and any
// tournament GameSheet doesn't cover) come from the DA sheet.
export const GAME_TYPES = ['League', 'Tournament', 'Exhibition', 'Other'];

/**
 * Game type for a sheet's Type cell ("Exhibition", "tournament", ...).
 * @param {string} text
 */
export function gameType(text) {
  if (/tourn/i.test(text || '')) return 'Tournament';
  if (/exhib|scrimmage|friendly/i.test(text || '')) return 'Exhibition';
  if (/league/i.test(text || '')) return 'League';
  return 'Other';
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Sheet dates as typed ("Oct 25, 2026", "October 25 2026", "10/25/2026",
// "2026-10-25") -> GameSheet's "Oct 25, 2026"; '' if unreadable.
function sheetDate(text) {
  const t = (text || '').trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${MONTH_NAMES[+m[2] - 1]} ${+m[3]}, ${m[1]}`;
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) return `${MONTH_NAMES[+m[1] - 1]} ${+m[2]}, ${m[3].length === 2 ? `20${m[3]}` : m[3]}`;
  m = t.match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (m && MONTH_NAMES.some((n) => n.toLowerCase() === m[1].toLowerCase())) {
    return `${m[1][0].toUpperCase()}${m[1].slice(1, 3).toLowerCase()} ${+m[2]}, ${m[3]}`;
  }
  return '';
}

// "Oct 9, 2026" -> "2026-10-09", for matching games across sources.
function dayKey(date) {
  const m = (date || '').match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (!m) return '';
  const month = MONTH_NAMES.findIndex((n) => n.toLowerCase() === m[1].toLowerCase()) + 1;
  return `${m[3]}-${String(month).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

function sameOpponent(a, b) {
  const norm = (x) => tidyTeam(x).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const [x, y] = [norm(a), norm(b)];
  if (!x || !y) return false;
  if (x === y || x.includes(y) || y.includes(x)) return true;
  const word = (z) => z.split(' ').find((w) => w.length > 3) || z;
  return word(x) === word(y);
}

/**
 * True when two feed-shaped games are the same game (same day, same opponent).
 * @param {object} a { date, opponent }
 * @param {object} b { date, opponent }
 */
export function sameGame(a, b) {
  return dayKey(a.date) === dayKey(b.date) && sameOpponent(a.opponent, b.opponent);
}

// Sheet times as typed ("9:00am", "4:50 pm") -> GameSheet's "9:00 AM".
function sheetTime(text) {
  const m = (text || '').trim().match(/^(\d{1,2}):(\d{2})\s*([AP])\.?M\.?$/i);
  return m ? `${+m[1]}:${m[2]} ${m[3].toUpperCase()}M` : (text || '').trim();
}

// A sheet's Logo cell: our own GitHub images are served from the site
// ("/images/darien.png"); other https URLs are used as they are.
function sheetLogo(text) {
  const url = (text || '').trim();
  const own = url.match(/^https:\/\/raw\.githubusercontent\.com\/Jgrosskurth\/rinxhockeyclub\/(?:refs\/heads\/)?main\/(images\/[^?#]+)$/i);
  if (own) return `/${own[1]}`;
  return /^(?:https:\/\/|\/)[^\s"'<>]+$/.test(url) ? url : '';
}

function fetchRows(url) {
  return fetch(url)
    .then((resp) => (resp.ok ? resp.json() : { data: [] }))
    .then((json) => json.data || [])
    .catch(() => []);
}

let clubRows;
/** Rows of the club's DA sheet /other-games (raw, cached). */
export function loadClubRows() {
  if (!clubRows) clubRows = fetchRows('/other-games.json');
  return clubRows;
}

// The one team a sheet row is for ('10u' / '14u'), or '' (none, both, EXAMPLE).
function rowTeam(r) {
  const teams = Object.keys(TEAMS).filter((k) => new RegExp(`\\b${k}\\b`, 'i').test(r.Team || ''));
  return teams.length === 1 && !/example/i.test(r.Team || '') ? teams[0] : '';
}

/**
 * The club's sheet rows plus games sent in through /submit-game (same
 * columns). The club's rows win: a submission for the same team, day and
 * opponent only fills cells the club left empty (a reported score for a
 * listed game, say). A later submission updates an earlier one.
 * @param {object[]} club rows of /other-games
 * @param {object[]} submitted rows of data/submitted-games.json, oldest first
 */
export function mergeSheetRows(club, submitted) {
  const rows = club.map((r) => ({ ...r, fromClub: true }));
  const asGame = (r) => ({ date: sheetDate(r.Date), opponent: r.Opponent || '' });
  const same = (a, b) => rowTeam(a) && rowTeam(a) === rowTeam(b) && sameGame(asGame(a), asGame(b));
  submitted.forEach((s) => {
    const hit = rows.find((r) => same(r, s));
    if (!hit) {
      rows.push({ ...s });
      return;
    }
    const fill = (k) => s[k] && (!hit.fromClub || !hit[k]);
    ['Time', 'Rink', 'Logo'].forEach((k) => { if (fill(k)) hit[k] = s[k]; });
    // Score and result travel together.
    if (fill('Score') && (!hit.fromClub || !hit.Result)) {
      hit.Score = s.Score;
      hit.Result = s.Result;
    }
  });
  return rows;
}

let otherSheet;
function loadOtherSheet() {
  if (!otherSheet) {
    otherSheet = Promise.all([loadClubRows(), fetchRows(`${FEED_BASE}/submitted-games.json`)])
      .then(([club, submitted]) => mergeSheetRows(club, submitted));
  }
  return otherSheet;
}

/**
 * A team's sheet rows in GameSheet's feed shape ({ date, time, opponent,
 * venue, location, score, result, gameId }) plus a `type` and the opponent's
 * `logo`. Example rows and rows without a date or opponent are skipped.
 * @param {object[]} rows sheet rows (see mergeSheetRows)
 * @param {string} key '10u' | '14u'
 */
export function sheetGames(rows, key) {
  return rows.map((r) => {
    if (rowTeam(r) !== key) return null;
    const date = sheetDate(r.Date);
    const opponent = (r.Opponent || '').trim();
    if (!date || !opponent) return null;
    const rink = (r.Rink || '').trim();
    const score = ((r.Score || '').match(/(\d+)\s*[-–]\s*(\d+)/) || []).slice(1, 3).join('-');
    const result = ((r.Result || '').trim().match(/^[WLT]/i) || [''])[0].toUpperCase();
    return {
      date,
      time: sheetTime(r.Time),
      opponent,
      venue: /\brinx\b/i.test(rink) ? 'Home' : 'Away',
      location: rink,
      score: result ? score : '',
      result: score ? result : '',
      gameId: `sheet-${key}-${dayKey(date)}-${opponent.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      type: gameType(r.Type),
      logo: sheetLogo(r.Logo),
    };
  }).filter(Boolean);
}

/**
 * A team's games from the club's sheet and /submit-game (see sheetGames).
 * @param {string} key '10u' | '14u'
 */
export async function loadOtherGames(key) {
  return sheetGames(await loadOtherSheet(), key);
}

/**
 * Sheet games for a team that GameSheet doesn't already have (GameSheet wins).
 * @param {string} key '10u' | '14u'
 * @param {object[]} gamesheet feed-shaped GameSheet games
 */
export async function extraGames(key, gamesheet) {
  const other = await loadOtherGames(key);
  return other.filter((o) => !gamesheet.some((g) => sameGame(g, o)));
}

// "04 - 10U SILVER" -> "04 - 10U Silver"
const tidyDivision = (div) => (div || '').trim()
  .replace(/\b([A-Z])([A-Z]{2,})\b/g, (m, a, b) => a + b.toLowerCase());

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "Oct 9, 2026" + "5:05 PM" -> wall-clock parts (Eastern time, as published).
function parseWhen(date, time) {
  const d = (date || '').match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (!d) return null;
  const month = MONTHS.findIndex((m) => m.toLowerCase() === d[1].toLowerCase());
  if (month < 0) return null;
  const t = (time || '').match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
  let hour = t ? +t[1] % 12 : 0;
  if (t && t[3].toUpperCase() === 'PM') hour += 12;
  return {
    year: +d[3], month, day: +d[2], hour, minute: t ? +t[2] : 0, timed: !!t,
  };
}

function normalizeGame(g, feed, team) {
  const when = parseWhen(g.date, g.time);
  if (!when) return null;
  const event = TOURNAMENTS[feed];
  const tournament = event?.name || null;
  // Games from the DA sheet carry their own type and no standings.
  const sheet = !!g.type;
  const type = g.type || (tournament ? 'Tournament' : 'League');
  const opponent = g.opponent || '';
  // League opponents end "04 - 10U SILVER"; tournament ones "10A".
  const division = tournament
    ? (opponent.match(/\b(\d{1,2}(?:U|AAA|AA|A|B))\s*$/i) || [])[1]
    : (opponent.match(/(\d{1,2}\s*-\s*\d{1,2}U\s+[A-Z]+)\s*$/i) || [])[1];
  const opp = tidyTeam(opponent);
  const home = g.venue === 'Home';
  const local = new Date(when.year, when.month, when.day);
  let standingsFeed = null;
  let competition = type;
  if (!sheet) {
    standingsFeed = event ? event.standings : team.standings;
    competition = tournament
      ? [tournament, division].filter(Boolean).join(' · ')
      : ['LIAHL', tidyDivision(division)].filter(Boolean).join(' · ');
  }
  return {
    when,
    day: local,
    dayLabel: `${DAYS[local.getDay()]} ${MONTHS[when.month]} ${when.day}`,
    shortDate: `${MONTHS[when.month]} ${when.day}`,
    time: when.timed ? g.time.trim().toUpperCase() : '',
    opp,
    oppLogo: g.logo || teamLogo(opp),
    // Tournament "Home"/"Away" is a bench designation, not a rink.
    prefix: !tournament && !home ? 'at' : 'vs',
    type,
    gameId: g.gameId || '',
    location: g.location || '',
    home: home && !tournament,
    score: g.score || '',
    result: g.result || '',
    tournament,
    // Records on the "Next up" card come from the game's own competition.
    standingsFeed,
    competition,
  };
}

/**
 * A team's games across its league and tournament feeds, oldest first.
 * Feeds that fail are skipped; rejects only if every feed fails.
 * @param {string} key '10u' | '14u'
 * @returns {Promise<{finals: object[], upcoming: object[]}>}
 */
export async function loadTeamGames(key) {
  const team = TEAMS[key];
  const results = await Promise.allSettled(team.feeds.map(loadFeed));
  if (results.every((r) => r.status === 'rejected')) throw new Error('feeds unavailable');
  const raw = results.flatMap((r) => (r.status === 'fulfilled' ? r.value.games || [] : []));
  const extra = await extraGames(key, raw);
  const games = [
    ...results.flatMap((r, i) => (r.status === 'fulfilled'
      ? (r.value.games || []).map((g) => normalizeGame(g, team.feeds[i], team)).filter(Boolean)
      : [])),
    ...extra.map((g) => normalizeGame(g, null, team)).filter(Boolean),
  ];
  const order = (g) => Date.UTC(g.when.year, g.when.month, g.when.day, g.when.hour, g.when.minute);
  games.sort((a, b) => order(a) - order(b));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    finals: games.filter((g) => g.result),
    upcoming: games.filter((g) => !g.result && g.day >= today),
  };
}

/**
 * Standings rows for a team's league division, ranked as published.
 * @param {string} key '10u' | '14u'
 */
export async function loadStandings(key) {
  const data = await loadFeed(TEAMS[key].standings);
  return {
    division: tidyDivision(data.division),
    rows: (data.teams || []).map((t) => {
      const name = t.ours ? 'Rinx' : tidyTeam(t.team);
      return {
        rank: t.rank,
        name,
        logo: t.ours ? RINX_LOGO : teamLogo(name),
        gp: t.gp,
        record: `${t.w}-${t.l}-${t.t}`,
        pts: t.pts,
        ours: !!t.ours,
      };
    }),
  };
}

/**
 * W-L-T records for both sides of a game, from its competition's standings.
 * Resolves to {} when the standings feed is unavailable.
 * @param {object} game from loadTeamGames
 * @returns {Promise<{us?: string, them?: string}>}
 */
export async function loadRecords(game) {
  if (!game.standingsFeed) return {};
  try {
    const data = await loadFeed(game.standingsFeed);
    const rec = (t) => `${t.w}-${t.l}-${t.t}`;
    const teams = data.teams || [];
    const ours = teams.find((t) => t.ours);
    const opp = game.opp.toLowerCase();
    const theirs = teams.find((t) => !t.ours && tidyTeam(t.team).toLowerCase() === opp);
    return { us: ours && rec(ours), them: theirs && rec(theirs) };
  } catch {
    return {};
  }
}

// Rinks the teams play at, keyed by the feed's location name (lowercased,
// without a "(Blue)"-style sheet suffix), so map searches land on the right
// building. Unknown rinks fall back to a name search.
const RINKS = {
  'the rinx': 'The Rinx, 660 Terry Road, Hauppauge, NY 11788',
  'hatfield ice arena': 'Hatfield Ice Arena, 350 County Line Rd, Colmar, PA 18915',
  'peconic ice rink': 'Peconic Ice Rink, Riverhead, NY',
  'long beach arena': 'Long Beach Ice Arena, Long Beach, NY',
  iceland: 'Iceland, New Hyde Park, NY',
  'port washington skating center': 'Port Washington Skating Center, Port Washington, NY',
  'northwell twin rinks': 'Northwell Twin Rinks, East Meadow, NY',
  'parkwood ice rink': 'Parkwood Ice Rink, Great Neck, NY',
  'aviator sports center': 'Aviator Sports and Events Center, Brooklyn, NY',
  'dix hills ice rink': 'Dix Hills Ice Rink, Dix Hills, NY',
  'city ice pavilion': 'City Ice Pavilion, Long Island City, NY',
};

/**
 * Full address for a rink named in the feeds ("Hatfield Ice Arena (Blue)"),
 * or '' if it isn't in the list.
 * @param {string} name
 */
export function rinkAddress(name) {
  const key = (name || '').replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
  return RINKS[key] || '';
}

/**
 * Google Maps directions link to a game's rink.
 * @param {object} game from loadTeamGames
 */
export function directionsUrl(game) {
  const name = game.home ? 'The Rinx' : game.location;
  const dest = rinkAddress(name) || (/rink|arena|ice|center|pavilion/i.test(name) ? name : `${name} ice rink`);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

// Eastern wall-clock time -> UTC Date (handles daylight saving).
function easternToUtc({
  year, month, day, hour, minute,
}) {
  const guess = Date.UTC(year, month, day, hour, minute);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(new Date(guess)).map((p) => [p.type, p.value]));
  const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess + (guess - shown));
}

const RINX_ADDRESS = 'The Rinx, 660 Terry Road, Hauppauge, NY 11788';

/**
 * Google Calendar "add event" link for a timed game (90-minute slot), or ''.
 * @param {object} game from loadTeamGames
 * @param {string} key '10u' | '14u'
 */
export function calendarUrl(game, key) {
  if (!game.time) return '';
  const start = easternToUtc(game.when);
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Rinx ${TEAMS[key].label} ${game.prefix} ${game.opp}`,
    dates: `${stamp(start)}/${stamp(end)}`,
    location: game.home ? RINX_ADDRESS : game.location,
    details: game.tournament || 'LIAHL',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/**
 * Small result badge (W / L / T) markup.
 * @param {string} result
 */
export function resultBadge(result) {
  const names = { W: 'Win', L: 'Loss', T: 'Tie' };
  if (!names[result]) return '';
  return `<span class="result-badge result-${result.toLowerCase()}" aria-label="${names[result]}">${result}</span>`;
}
