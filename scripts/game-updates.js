// Builds "Game Update" news cards from the GameSheet schedule feeds produced
// by the pull-schedule workflow, so each completed game gets a short write-up
// without anyone having to author it. Used by the news-slider block.

const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

const TEAMS = [
  { feed: 'schedule-10u.json', age: '10U', label: '10U Squirts' },
  { feed: 'schedule-14u.json', age: '14U', label: '14U Bantams' },
  {
    feed: 'schedule-mid-atlantic.json', age: '10U', label: '10U Squirts', event: 'the Mid-Atlantic Fall Showcase',
  },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

/**
 * Parse "Sep 27, 2026" / "September 27, 2026" into a local Date, or null.
 * @param {string} str
 */
export function parseNewsDate(str) {
  const m = (str || '').match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (!m) return null;
  const month = MONTHS.findIndex((name) => name.slice(0, 3).toLowerCase() === m[1].toLowerCase());
  return month < 0 ? null : new Date(+m[3], month, +m[2]);
}

const formatDate = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

// Same clean-up as the schedule block: "NYH4033-002-North Park-10U Mauro"
// -> "North Park", ALL CAPS -> Title Case.
function tidyTeamName(name) {
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

// Copy variants per outcome, rotated by the team's game number so back-to-back
// results don't read the same (and a game's card stays the same on reload).
const COPY = {
  rout: [
    { title: '{age} Pours It On vs {opp}', body: 'The {label} were firing on all cylinders {where}, rolling past {opp} {score}.' },
    { title: '{age} Routs {opp}', body: 'The {label} took control early {where} and never let up in a {score} win over {opp}.' },
    { title: '{age} Cruises Past {opp}', body: 'A dominant effort from the {label} {where}, beating {opp} {score}.' },
  ],
  solid: [
    { title: '{age} Takes Care of {opp}', body: 'The {label} pulled away from {opp} {where} for a {score} win.' },
    { title: '{age} Handles {opp}', body: 'Strong team play carried the {label} to a {score} victory over {opp} {where}.' },
  ],
  close: [
    { title: '{age} Edges {opp}', body: 'In a tight one {where}, the {label} held on to beat {opp} {score}.' },
    { title: '{age} Holds Off {opp}', body: 'The {label} battled to the final buzzer {where} and came away with a {score} win over {opp}.' },
  ],
  tie: [
    { title: '{age} Battles {opp} to a Draw', body: 'The {label} and {opp} could not be separated {where}, skating to a {score} tie.' },
  ],
  closeLoss: [
    { title: '{age} Falls Just Short vs {opp}', body: 'The {label} pushed to the end {where} but dropped a {score} decision to {opp}.' },
  ],
  loss: [
    { title: '{age} Drops One to {opp}', body: '{opp} got the better of the {label} {where}, {score}. On to the next one.' },
  ],
};

function outcome(result, us, them) {
  const margin = us - them;
  if (result === 'T') return 'tie';
  if (result === 'L') return margin >= -2 ? 'closeLoss' : 'loss';
  if (margin >= 5) return 'rout';
  return margin >= 3 ? 'solid' : 'close';
}

function where(game, team) {
  if (team.event) return `at ${team.event}`;
  const loc = game.location || '';
  if (game.venue === 'Home') return /rinx/i.test(loc) ? 'at home at The Rinx' : `at home at ${loc}`;
  return loc ? `on the road at ${loc}` : 'on the road';
}

function buildCard(game, team, n) {
  const date = parseNewsDate(game.date);
  const m = (game.score || '').match(/(\d+)\s*-\s*(\d+)/);
  if (!date || !m || !['W', 'L', 'T'].includes(game.result)) return null;
  const us = +m[1];
  const them = +m[2];
  const kind = outcome(game.result, us, them);
  const variants = COPY[kind];
  const copy = variants[n % variants.length];
  // Score reads winner-first: "beat X 7-1", "lost to X 4-2".
  const score = game.result === 'L' ? `${them}-${us}` : `${us}-${them}`;
  const fill = (s, html) => s
    .replace(/\{age\}/g, team.age)
    .replace(/\{label\}/g, team.label)
    .replace(/\{opp\}/g, tidyTeamName(game.opponent))
    .replace(/\{where\}/g, where(game, team))
    .replace(/\{score\}/g, html ? `<span class="news-score">${score}</span>` : score);
  let body = fill(copy.body, true);
  if (game.result === 'W' && them === 0) body += ' A shutout for the defense and goaltending!';
  body = body.charAt(0).toUpperCase() + body.slice(1);
  return {
    tag: 'Game Update',
    title: fill(copy.title),
    body,
    date: formatDate(date),
    time: date.getTime(),
    age: team.age,
    auto: true,
  };
}

/**
 * Game Update cards for every completed game in the 10U/14U feeds.
 * Feeds that fail to load are skipped.
 */
export async function loadGameUpdates() {
  const results = await Promise.all(TEAMS.map(async (team) => {
    try {
      const resp = await fetch(`${FEED_BASE}/${team.feed}`);
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.games || []).filter((g) => g.result)
        .map((g, n) => buildCard(g, team, n)).filter(Boolean);
    } catch {
      return [];
    }
  }));
  return results.flat();
}
