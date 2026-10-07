// Shared loaders for the GameSheet feeds written by the pull-schedule workflow.
// Used by the homepage hero ("Next up"), the results rail and the standings
// summary. Each feed is fetched once per page view and shared between blocks.
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

/**
 * Clean up GameSheet's coded team names: "NYH4033-002-North Park-10U Mauro"
 * -> "North Park", ALL CAPS -> Title Case.
 * @param {string} name
 */
export function tidyTeam(name) {
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
  const opponent = g.opponent || '';
  // League opponents end "04 - 10U SILVER"; tournament ones "10A".
  const division = tournament
    ? (opponent.match(/\b(\d{1,2}(?:U|AAA|AA|A|B))\s*$/i) || [])[1]
    : (opponent.match(/(\d{1,2}\s*-\s*\d{1,2}U\s+[A-Z]+)\s*$/i) || [])[1];
  const opp = tidyTeam(opponent);
  const home = g.venue === 'Home';
  const local = new Date(when.year, when.month, when.day);
  return {
    when,
    day: local,
    dayLabel: `${DAYS[local.getDay()]} ${MONTHS[when.month]} ${when.day}`,
    shortDate: `${MONTHS[when.month]} ${when.day}`,
    time: when.timed ? g.time.trim().toUpperCase() : '',
    opp,
    oppLogo: teamLogo(opp),
    // Tournament "Home"/"Away" is a bench designation, not a rink.
    prefix: !tournament && !home ? 'at' : 'vs',
    location: g.location || '',
    home: home && !tournament,
    score: g.score || '',
    result: g.result || '',
    tournament,
    // Records on the "Next up" card come from the game's own competition.
    standingsFeed: event ? event.standings : team.standings,
    competition: tournament
      ? [tournament, division].filter(Boolean).join(' · ')
      : ['LIAHL', tidyDivision(division)].filter(Boolean).join(' · '),
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
  const games = results.flatMap((r, i) => (r.status === 'fulfilled'
    ? (r.value.games || []).map((g) => normalizeGame(g, team.feeds[i], team)).filter(Boolean)
    : []));
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
 * Google Maps directions link to a game's rink.
 * @param {object} game from loadTeamGames
 */
export function directionsUrl(game) {
  const name = game.home ? 'The Rinx' : game.location;
  const key = name.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
  const dest = RINKS[key] || (/rink|arena|ice|center|pavilion/i.test(name) ? name : `${name} ice rink`);
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
