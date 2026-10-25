import {
  gameSheetLogo, findLogoId, findLocalLogo, MHR_CDN,
} from '../../scripts/team-logos.js';
import {
  rinkAddress, extraGames, tidyTeam, sameGame, directionsUrl,
} from '../../scripts/team-feeds.js';

const PIN = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor"/></svg>';
const CAL_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 2v3M16 2v3M3.5 9h17M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6A1.5 1.5 0 0 1 5 4.5ZM12 12.5v5M9.5 15h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const attr = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
// Small label for a game's type (League, Tournament, Exhibition, Other).
const typeTag = (type) => `<span class="sg-type sg-type-${(type || 'League').toLowerCase()}">${type || 'League'}</span>`;
const pinLink = (location, cls = 'sg-map') => (location
  ? `<a class="${cls}" href="${attr(directionsUrl({ location }))}" target="_blank" rel="noopener" title="Directions" aria-label="Directions to ${attr(location)} (opens Google Maps)">${PIN}</a>`
  : '');

// "Rink [pin] · 2:05 PM"; the pin opens Google Maps directions to the rink.
function locLine(g) {
  const pin = pinLink(g.location);
  // Phones show the time under the date instead (.sg-dtime).
  const time = g.time ? `<span class="sg-loc-time">${g.location ? ' · ' : ''}${g.time}</span>` : '';
  return `${g.location ? `<span class="sg-rink">${g.location}</span>${pin}` : ''}${time}`;
}

// Which feed (data/schedule-{key}.json) a page shows, matched by URL path.
// Tournament feeds come from their own GameSheet season (see pull-schedule.yml).
const FEEDS = [
  {
    match: 'mid-atlantic',
    key: 'mid-atlantic',
    label: 'Rinx 10U Squirts',
    title: 'Mid-Atlantic Fall Classic',
    season: '2026 Mid-Atlantic Fall Classic',
    note: 'Tournament games at Hatfield Ice Arena, Colmar, PA',
    // Out-of-area opponents: mascot-name logo matching would pick wrong
    // logos, so only GameSheet's own team logos are used (scripts/team-logos.js).
    logos: false,
  },
  {
    match: '14u',
    key: '14u',
    label: 'Rinx 14U Bantam',
    title: '2026&ndash;2027',
    season: '2026&ndash;2027 season',
    note: 'Home games at The Rinx at Hauppauge',
  },
  {
    match: '',
    key: '10u',
    label: 'Rinx 10U Squirts',
    title: '2026&ndash;2027',
    season: '2026&ndash;2027 season',
    note: 'Home games at The Rinx at Hauppauge',
  },
];

function feedConfig() {
  const path = window.location.pathname;
  return FEEDS.find((f) => path.includes(f.match));
}

// Subscribable team calendars (data/calendar-*.ics, rebuilt with the feeds by
// .github/scripts/build_calendars.py). The tournament page offers 10U's,
// which includes its tournament games.
function subscribeBar() {
  const key = feedConfig().key === '14u' ? '14u' : '10u';
  const team = key === '14u' ? '14U Bantam' : '10U Squirts';
  const url = `${window.location.origin}/data/calendar-${key}.ics`;
  const webcal = url.replace(/^https?:/, 'webcal:');
  const google = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`;
  return `<div class="sub-bar">
      <button type="button" class="sub-toggle" aria-expanded="false">${CAL_ICON}<span>Subscribe to calendar</span></button>
      <p class="sub-text"><strong>Never miss a game.</strong> Subscribe to the ${team} calendar and every game, time change and final score updates on your phone automatically.</p>
      <div class="sub-actions">
        <a class="sub-btn" href="${webcal}">Apple / iPhone</a>
        <a class="sub-btn" href="${google}" target="_blank" rel="noopener">Google Calendar</a>
        <button type="button" class="sub-btn sub-copy" data-url="${url}">Copy link</button>
      </div>
    </div>`;
}

function wireSubscribe(block) {
  // Phones fold the subscribe options behind one button.
  const toggle = block.querySelector('.sub-toggle');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.closest('.sub-bar').classList.toggle('is-open', open);
  });
  const copy = block.querySelector('.sub-copy');
  copy?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copy.dataset.url);
      copy.textContent = 'Link copied';
    } catch {
      window.prompt('Copy this calendar link:', copy.dataset.url); // eslint-disable-line no-alert
    }
  });
}

// The rink's last word and its map pin never part across a line break.
function keepWithPin(text, pin) {
  const m = text.match(/^(.*\s)?(\S+)$/);
  return m ? `${m[1] || ''}<span class="sg-nowrap">${m[2]}${pin}</span>` : `${text}${pin}`;
}

// "North Park (Mauro)" -> team + the coach in a lighter span.
function nameHtml(opp) {
  const m = (opp || '').match(/^(.*?)\s*(\([^)]*\))$/);
  return m ? `${m[1]} <span class="sg-coach">${m[2]}</span>` : opp;
}

// Phones: "TYPE · time · rink [pin]" under the name (the type and time
// columns are hidden there). Upcoming games show their time on the right.
function phoneMeta(g) {
  const final = ['W', 'L', 'T'].includes(g.result);
  return `<div class="sg-mmeta">${typeTag(g.type)}${final && g.time ? `<span class="sg-mtime">${g.time}</span>` : ''}${g.location ? `<span class="sg-mrink">${keepWithPin(g.location, pinLink(g.location, 'sg-map sg-mpin'))}</span>` : ''}</div>`;
}

function oppCell(g) {
  const ini = g.opp.split(' ').slice(0, 2).map((w) => w[0])
    .join('')
    .toUpperCase();
  const gsLogo = g.logo || gameSheetLogo(g.opp);
  const useLogos = feedConfig().logos !== false;
  const localLogo = useLogos ? findLocalLogo(g.opp) : '';
  const logoId = (localLogo || !useLogos) ? '' : findLogoId(g.opp);
  const logoSrc = gsLogo || localLogo || (logoId ? `${MHR_CDN}${logoId}_a.png` : '') || g.logoFallback || '';
  const logoImg = logoSrc
    ? `<img class="sg-logo" src="${logoSrc}" alt="${g.opp}" width="36" height="36" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  return `
      <div class="sg-opp">
        ${logoImg}
        <div class="sg-logo-fb"${logoSrc ? ' style="display:none"' : ''}>${ini}</div>
        <div class="sg-text">
          <div class="sg-name">${nameHtml(g.opp)}</div>
          <div class="sg-loc">${locLine(g)}</div>
          ${phoneMeta(g)}
        </div>
      </div>`;
}

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// Parse "Sep 20, 2026" + "11:40 AM" into local Y/M/D/H/M parts, or null.
function parseGameDateTime(dateStr, timeStr) {
  const dm = (dateStr || '').match(/([A-Za-z]{3})\w*\s+(\d{1,2}),?\s+(\d{4})/);
  if (!dm) return null;
  const month = MONTHS[dm[1].toLowerCase().slice(0, 3)];
  if (month === undefined) return null;
  const day = parseInt(dm[2], 10);
  const year = parseInt(dm[3], 10);
  let hour = 0;
  let min = 0;
  const tm = (timeStr || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (tm) {
    hour = parseInt(tm[1], 10) % 12;
    if (/pm/i.test(tm[3])) hour += 12;
    min = parseInt(tm[2], 10);
  }
  return {
    year, month, day, hour, min, hasTime: !!tm,
  };
}

// US Eastern offset (EDT -4 / EST -5) for the given local date, so the .ics
// UTC timestamps land on the right wall-clock time. DST: 2nd Sun Mar–1st Sun Nov.
function easternOffsetHours(year, month, day) {
  const marchSecondSunday = 14 - (((new Date(Date.UTC(year, 2, 1)).getUTCDay() + 6) % 7));
  const novFirstSunday = 7 - (((new Date(Date.UTC(year, 10, 1)).getUTCDay() + 6) % 7));
  const afterStart = month > 2 || (month === 2 && day >= marchSecondSunday);
  const beforeEnd = month < 10 || (month === 10 && day < novFirstSunday);
  return (afterStart && beforeEnd) ? 4 : 5;
}

function icsStamp(p) {
  // Convert local Eastern parts to a UTC ICS timestamp (YYYYMMDDTHHMMSSZ).
  const offset = easternOffsetHours(p.year, p.month, p.day);
  const utc = new Date(Date.UTC(p.year, p.month, p.day, p.hour + offset, p.min, 0));
  const z = (n) => String(n).padStart(2, '0');
  return `${utc.getUTCFullYear()}${z(utc.getUTCMonth() + 1)}${z(utc.getUTCDate())}`
    + `T${z(utc.getUTCHours())}${z(utc.getUTCMinutes())}00Z`;
}

// Calendar event fields for one game (90-minute default), or null if no time.
function calEvent(g, label) {
  const p = parseGameDateTime(g.rawDate, g.time);
  if (!p || !p.hasTime) return null;
  const start = icsStamp(p);
  const end = icsStamp({ ...p, hour: p.hour + 1, min: p.min + 30 });
  return {
    start,
    end,
    title: `${label} vs ${g.opp}`,
    location: g.location || '',
    details: `${label} ${g.venue || ''} game vs ${g.opp}`.replace(/\s+/g, ' ').trim(),
  };
}

// Google Calendar "add event" URL — reliable on mobile (opens the app/site).
function googleCalUrl(ev) {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${ev.start}/${ev.end}`,
    location: ev.location,
    details: ev.details,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

// A Blob-based .ics object URL (more reliable than a data: URL for download).
function icsObjectUrl(ev) {
  const esc = (s) => (s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rinx Hockey Club//Schedule//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:rinx-${ev.start}-${ev.title.replace(/\W+/g, '')}@rinxhockeyclub`,
    `DTSTART:${ev.start}`, `DTEND:${ev.end}`,
    `SUMMARY:${esc(ev.title)}`,
    ev.location ? `LOCATION:${esc(ev.location)}` : '',
    `DESCRIPTION:${esc(ev.details)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
}

function teamLabel() {
  return feedConfig().label;
}

// Link to a game's GameSheet box score, if we have its id (or to LI Hockey's
// game page, for league games GameSheet doesn't list).
function boxScoreUrl(g) {
  if (g.source === 'lihockey') return g.url || '';
  if (!g.gameId || g.sheet) return '';
  return `https://gamesheetstats.com/seasons/${g.season || '15381'}/games/${g.gameId}`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

// "Sep 12, 2026" -> "Sep 12" + ", 2026", plus the phones' "SAT" over "12".
function dateHtml(date) {
  const m = (date || '').match(/^(.*?)(,\s*\d{4})$/);
  const p = parseGameDateTime(date, '');
  const phone = p
    ? `<span class="sg-dow">${WEEKDAYS[new Date(p.year, p.month, p.day).getDay()]}</span><span class="sg-dnum">${p.day}</span>`
    : '';
  return (m ? `<span class="sg-day">${m[1]}</span><span class="sg-year">${m[2]}</span>` : date) + phone;
}

const isFinal = (g) => ['W', 'L', 'T'].includes(g.result);
const monthKey = (g) => {
  const p = parseGameDateTime(g.rawDate || g.date, '');
  return p ? `${p.year}-${String(p.month + 1).padStart(2, '0')}` : '';
};

// The next game: the first one without a result, today or later.
function nextGame(games) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return games.find((g) => {
    const p = parseGameDateTime(g.rawDate || g.date, g.time);
    return !isFinal(g) && p && new Date(p.year, p.month, p.day) >= today;
  });
}

function renderRows(games, next) {
  const label = teamLabel();
  return games.map((g) => {
    const hasResult = ['W', 'L', 'T'].includes(g.result);
    let badge = 'tie';
    if (g.result === 'W') badge = 'win';
    else if (g.result === 'L') badge = 'loss';
    const resultCell = hasResult ? `<span class="badge badge-${badge}">${g.result}</span>` : '';
    // Our own box score page, when LI Hockey has posted this game's box score.
    const boxLinkOwn = g.boxScore
      ? `<a class="sg-box" href="${g.boxScore}" aria-label="Box score: ${label} vs ${g.opp}">Box Score</a>`
      : '';
    const ev = hasResult ? null : calEvent(g, label);
    // Upcoming games get a calendar button with a Google / Apple(.ics) menu.
    const evAttr = ev ? ` data-event="${encodeURIComponent(JSON.stringify(ev))}"` : '';
    const cal = ev
      ? `<div class="sg-cal-wrap"${evAttr}>
          <button type="button" class="sg-cal" aria-haspopup="true" aria-expanded="false" aria-label="Add ${g.opp} game to calendar" title="Add to calendar">${CAL_ICON}</button>
          <div class="sg-cal-menu" hidden>
            <a href="${googleCalUrl(ev)}" target="_blank" rel="noopener" data-cal="google">Google Calendar</a>
            <a href="#" data-cal="ics" data-file="${label.replace(/\s+/g, '-')}-vs-${(g.opp || 'game').replace(/\s+/g, '-')}.ics">Apple / Outlook</a>
          </div>
        </div>`
      : '';
    const box = boxScoreUrl(g);
    // A real anchor (stretched over the row) so taps work on mobile too; the
    // calendar button sits above it via z-index and stays independently clickable.
    const boxLink = box
      ? `<a class="sg-rowlink" href="${box}" target="_blank" rel="noopener" aria-label="View box score: ${label} vs ${g.opp}"></a>`
      : '';
    return `
    <div class="sg-row${box ? ' sg-clickable' : ''}${g === next ? ' sg-next' : ''}${g.boxScore ? ' sg-has-box' : ''}" data-result="${g.result}" data-state="${hasResult ? 'final' : 'upcoming'}" data-month="${monthKey(g)}">
      ${boxLink}
      <div class="sg-typecell">${typeTag(g.type)}</div>
      <div class="sg-date">${dateHtml(g.date)}${g.time ? `<span class="sg-dtime">${g.time}</span>` : ''}</div>
      ${oppCell(g)}
      <div class="sg-score">${g.score || (g.time ? `<span class="sg-mbig">${g.time}</span>` : '')}</div>
      <div class="sg-result">${resultCell}</div>
      <div class="sg-actions">${boxLinkOwn}</div>
      ${cal}
    </div>`;
  }).join('');
}

// Wire calendar buttons: toggle the menu, and build the .ics Blob on demand.
function wireCalendars(block) {
  const closeAll = (except) => block.querySelectorAll('.sg-cal-menu').forEach((m) => {
    if (m !== except) { m.hidden = true; m.previousElementSibling?.setAttribute('aria-expanded', 'false'); }
  });

  block.querySelectorAll('.sg-cal').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = btn.nextElementSibling;
      const willOpen = menu.hidden;
      closeAll(menu);
      menu.hidden = !willOpen;
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  block.querySelectorAll('.sg-cal-menu a[data-cal="ics"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const ev = JSON.parse(decodeURIComponent(a.closest('.sg-cal-wrap').dataset.event));
      const url = icsObjectUrl(ev);
      const tmp = document.createElement('a');
      tmp.href = url;
      tmp.download = a.dataset.file;
      document.body.append(tmp);
      tmp.click();
      tmp.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      a.closest('.sg-cal-menu').hidden = true;
    });
  });

  // Close menus when clicking elsewhere.
  document.addEventListener('click', () => closeAll(null));
}

// GitHub-hosted JSON feed produced by the pull-schedule workflow.
const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

// Map a feed game to the block's internal shape.
function fromFeed(g, season) {
  const opp = tidyTeam(g.opponent);
  return {
    date: g.date || '',
    opp,
    score: g.score || '',
    result: g.result || '',
    // Raw fields kept for the "add to calendar" (.ics) feature.
    rawDate: g.date || '',
    time: g.time || '',
    location: g.location || '',
    venue: g.venue || '',
    gameId: g.gameId || '',
    // "lihockey" for a league game filled in from LI Hockey (fill_league_games.py).
    source: g.source || '',
    url: g.url || '',
    // Logo from the DA sheet, if the club added one.
    logo: g.logo || '',
    logoFallback: g.logoFallback || '',
    season,
  };
}

// Upcoming games as schema.org SportsEvents, so search engines can list them.
function addEventData(games) {
  const cfg = feedConfig();
  const tournament = cfg.key === 'mid-atlantic';
  const rinx = { '@type': 'SportsTeam', name: cfg.label, sport: 'Ice Hockey' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const z = (n) => String(n).padStart(2, '0');
  const events = games.filter((g) => !g.result).map((g) => {
    const p = parseGameDateTime(g.rawDate, g.time);
    if (!p || !p.hasTime || new Date(p.year, p.month, p.day) < today) return null;
    const home = g.venue === 'Home' && !tournament;
    const place = home ? 'The Rinx' : (g.location || 'The Rinx');
    const opp = { '@type': 'SportsTeam', name: g.opp, sport: 'Ice Hockey' };
    return {
      '@type': 'SportsEvent',
      name: `${cfg.label} ${!home && !tournament ? 'at' : 'vs'} ${g.opp}`,
      sport: 'Ice Hockey',
      startDate: `${p.year}-${z(p.month + 1)}-${z(p.day)}T${z(p.hour)}:${z(p.min)}:00-0${easternOffsetHours(p.year, p.month, p.day)}:00`,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: place, address: rinkAddress(place) || place },
      homeTeam: home || tournament ? rinx : opp,
      awayTeam: home || tournament ? opp : rinx,
      organizer: { '@type': 'SportsOrganization', name: 'Rinx Hockey Club', url: 'https://www.rinxhockeyclub.com/' },
      url: `${window.location.origin}${window.location.pathname}`,
    };
  }).filter(Boolean);
  document.head.querySelector('script[data-schedule-events]')?.remove();
  if (!events.length) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.scheduleEvents = '';
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': events });
  document.head.append(script);
}

// A team page shows its league feed, its tournament feeds and its rows in the
// DA sheet /other-games (GameSheet wins when a game is in both). A
// tournament's own page shows just that tournament.
const TEAM_TOURNAMENTS = { '10u': ['mid-atlantic'] };

async function fetchFeed(key) {
  const resp = await fetch(`${FEED_BASE}/schedule-${key}.json`);
  if (!resp.ok) throw new Error(`feed ${resp.status}`);
  return resp.json();
}

function gameOrder(g) {
  const p = parseGameDateTime(g.rawDate, g.time);
  return p ? Date.UTC(p.year, p.month, p.day, p.hour, p.min) : 0;
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// League games LI Hockey has a box score for get a link to /box-score
// (data/stats-lihockey-<team>.json, matched by day and opponent).
async function addBoxScores(key, games) {
  const feed = await fetch(`${FEED_BASE}/stats-lihockey-${key}.json`)
    .then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const posted = (feed?.games || [])
    .filter((x) => x.detail?.isoDate && x.detail.teams?.length === 2)
    .map((x) => {
      const [y, m, d] = x.detail.isoDate.split('-');
      return { id: x.id, date: `${MONTH_ABBR[+m - 1]} ${+d}, ${y}`, opponent: x.opponent };
    });
  games.forEach((g) => {
    if ((g.type || 'League') !== 'League' || !g.result) return;
    const hit = posted.find((x) => sameGame({ date: g.rawDate, opponent: g.opp }, x));
    if (hit) g.boxScore = `/box-score?team=${key}&game=${hit.id}`;
  });
}

// Tournament games GameSheet has a box score for (data/boxscores-<event>.json,
// matched by game id) get a link to /box-score too.
const TOURNAMENT_BOX_SCORES = { 'mid-atlantic': 'boxscores-mid-atlantic' };

async function addTournamentBoxScores(games) {
  const events = Object.entries(TOURNAMENT_BOX_SCORES);
  const feeds = await Promise.all(events.map(([, feed]) => fetch(`${FEED_BASE}/${feed}.json`)
    .then((r) => (r.ok ? r.json() : null)).catch(() => null)));
  events.forEach(([event], i) => {
    const posted = new Set((feeds[i]?.games || [])
      .filter((x) => x.detail?.teams?.length === 2).map((x) => String(x.id)));
    games.forEach((g) => {
      if (g.type === 'Tournament' && g.gameId && posted.has(String(g.gameId))) {
        g.boxScore = `/box-score?event=${event}&game=${g.gameId}`;
      }
    });
  });
}

// Exhibition games with a team-reported box score (data/boxscores-exhibition-<team>.json,
// matched by day and opponent) get a link to /box-score too.
const EXHIBITION_BOX_SCORES = { '10u': 'boxscores-exhibition-10u' };

async function addExhibitionBoxScores(key, games) {
  const feed = EXHIBITION_BOX_SCORES[key];
  if (!feed) return;
  const data = await fetch(`${FEED_BASE}/${feed}.json`)
    .then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const posted = (data?.games || []).filter((x) => x.detail?.teams?.length === 2);
  games.forEach((g) => {
    if (g.type === 'League' || g.type === 'Tournament' || !g.result) return;
    const hit = posted.find((x) => sameGame({ date: g.rawDate, opponent: g.opp }, x));
    if (hit) g.boxScore = `/box-score?event=exhibition-${key}&game=${hit.id}`;
  });
}

async function loadFeedGames() {
  const cfg = feedConfig();
  const tournamentPage = cfg.key === 'mid-atlantic';
  const sources = [{ key: cfg.key, type: tournamentPage ? 'Tournament' : 'League' },
    ...(TEAM_TOURNAMENTS[cfg.key] || []).map((key) => ({ key, type: 'Tournament' }))];
  const results = await Promise.allSettled(sources.map((src) => fetchFeed(src.key)));
  if (results[0].status === 'rejected') throw results[0].reason;
  const raw = [];
  const games = [];
  results.forEach((r, i) => {
    if (r.status !== 'fulfilled') return;
    (r.value.games || []).forEach((g) => {
      raw.push(g);
      games.push({ ...fromFeed(g, r.value.season), type: sources[i].type });
    });
  });
  if (!tournamentPage) {
    const extra = await extraGames(cfg.key, raw);
    extra.forEach((g) => games.push({ ...fromFeed(g, ''), type: g.type, sheet: true }));
    await Promise.all([
      addBoxScores(cfg.key, games),
      addTournamentBoxScores(games),
      addExhibitionBoxScores(cfg.key, games),
    ]);
  } else {
    await addTournamentBoxScores(games);
  }
  return games.filter((g) => g.opp).sort((a, b) => gameOrder(a) - gameOrder(b));
}

// Wire the Print Schedule button to the browser's print dialog. A print
// stylesheet (schedule.css) hides site chrome so only the schedule prints.
function wirePrint(block) {
  const btn = block.querySelector('.print-btn');
  if (btn) btn.addEventListener('click', () => window.print());
}

// A print-only header (hidden on screen) so the printed sheet is identifiable.
function printHeader() {
  const { label, title } = feedConfig();
  return `<div class="sg-print-head">
    <h2>${label} &mdash; ${title} Schedule</h2>
    <p>Rinx Hockey Club &bull; The Rinx at Hauppauge, NY</p>
  </div>`;
}

const RESULT_OPTIONS = [['all', 'All Results'], ['W', 'Wins'], ['L', 'Losses'], ['T', 'Ties']];

// One controls row: game-type buttons (team pages), the Game Result
// dropdown (once there are results), and Print.
function controlsRow(typeButtons, hasResults) {
  return `
    <div class="schedule-controls">
      ${typeButtons}
      <div class="schedule-actions">
        ${hasResults ? `<label class="result-filter"><span>Game Result</span>
          <select class="result-select">${RESULT_OPTIONS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
        </label>` : ''}
        <button type="button" class="print-btn">🖨 Print</button>
      </div>
    </div>`;
}

// "GameSheet", "GameSheet, LI Hockey and the club", ... for the rows shown.
function sourceCredit(games) {
  const names = ['<a href="https://gamesheetstats.com" target="_blank" rel="noopener">GameSheet</a>'];
  if (games.some((g) => g.source === 'lihockey')) names.push('<a href="https://lihockey.com" target="_blank" rel="noopener">LI Hockey</a>');
  if (games.some((g) => g.sheet)) names.push('the club');
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
}

// W-L-T of a set of finals ("4-0-0"), or '' when none were played.
function record(games) {
  const finals = games.filter(isFinal);
  if (!finals.length) return '';
  const n = (r) => finals.filter((g) => g.result === r).length;
  return `${n('W')}-${n('L')}-${n('T')}`;
}

// Rows grouped by month. Phones show each month's heading (sticky) with its
// record; wider screens ignore the groups (display: contents).
function monthGroups(games, next) {
  const firstYear = parseGameDateTime(games[0]?.rawDate || games[0]?.date, '')?.year;
  const groups = [];
  games.forEach((g) => {
    const key = monthKey(g);
    if (!groups.length || groups[groups.length - 1].key !== key) groups.push({ key, games: [] });
    groups[groups.length - 1].games.push(g);
  });
  return groups.map(({ key, games: list }) => {
    const [y, m] = key.split('-').map(Number);
    const name = key ? `${MONTH_NAMES[m - 1]}${y !== firstYear ? ` <span class="sg-m-year">${y}</span>` : ''}` : 'Date to be set';
    const rec = record(list);
    return `<section class="sg-month" data-month="${key}" aria-label="${key ? `${MONTH_NAMES[m - 1]} ${y}` : 'Date to be set'}">
        <div class="sg-month-head"><h2>${name}<span class="sg-m-rec"${rec ? '' : ' hidden'}> · ${rec}</span></h2><span class="sg-m-count">${list.length} ${list.length === 1 ? 'game' : 'games'}</span></div>
        ${renderRows(list, next)}
      </section>`;
  }).join('');
}

function scheduleBody(games, type, typeButtons, next) {
  const label = type === 'All' ? 'games' : `${type.toLowerCase()} games`;
  if (!games.length) {
    return `${controlsRow(typeButtons, false)}
    <p class="schedule-empty">No ${label} ${type === 'All' ? 'posted' : 'on the schedule'} yet.</p>`;
  }
  const hasResults = games.some((g) => ['W', 'L', 'T'].includes(g.result));
  const table = `
    <div class="schedule-table">
      <div class="sg-header">
        <span>Type</span>
        <span>Date</span>
        <span>Opponent</span>
        <span>Score</span>
        <span>Result</span>
        <span class="sg-h-actions"><span class="sr-only">Box score</span></span>
      </div>
      <div class="sg-rows">${monthGroups(games, next)}</div>
    </div>`;
  // Upcoming only: the same table, without the win/loss summary.
  if (!hasResults) {
    return `${controlsRow(typeButtons, false)}
    <p class="schedule-note">${games.length} ${label} &bull; scores posted after each game</p>
    ${table}
    <p class="schedule-src">${feedConfig().note} &bull; times and locations subject to change &bull; 🗓️ = add game to your calendar</p>`;
  }
  const w = games.filter((g) => g.result === 'W').length;
  const l = games.filter((g) => g.result === 'L').length;
  const t = games.filter((g) => g.result === 'T').length;
  const gf = games.reduce((n, g) => n + (parseInt(g.score?.split(/[-–]/)[0], 10) || 0), 0);
  const ga = games.reduce((n, g) => n + (parseInt(g.score?.split(/[-–]/)[1], 10) || 0), 0);
  return `${controlsRow(typeButtons, true)}
    <div class="schedule-summary">
      <div class="sum-tile navy"><span class="sum-num">${w}</span><span class="sum-lbl">Wins</span></div>
      <div class="sum-tile navy"><span class="sum-num">${l}</span><span class="sum-lbl">Losses</span></div>
      <div class="sum-tile navy"><span class="sum-num">${t}</span><span class="sum-lbl">Ties</span></div>
      <div class="sum-tile red"><span class="sum-num">${gf}</span><span class="sum-lbl">Goals For</span></div>
      <div class="sum-tile navy-light"><span class="sum-num">${ga}</span><span class="sum-lbl">Goals Against</span></div>
    </div>
    ${table}
    <p class="schedule-src">${feedConfig().season} &bull; Source: ${sourceCredit(games)}</p>`;
}

// After any filter: hide months left empty, refresh their counts and records,
// and the phones' Results / Upcoming jump counts.
function refreshGroups(block) {
  block.querySelectorAll('.sg-month').forEach((month) => {
    const rows = [...month.querySelectorAll('.sg-row:not(.sg-hide)')];
    month.hidden = !rows.length;
    const count = month.querySelector('.sg-m-count');
    if (count) count.textContent = `${rows.length} ${rows.length === 1 ? 'game' : 'games'}`;
    const rec = month.querySelector('.sg-m-rec');
    const finals = rows.filter((r) => r.dataset.state === 'final');
    if (rec) {
      const n = (x) => finals.filter((r) => r.dataset.result === x).length;
      rec.hidden = !finals.length;
      rec.textContent = ` · ${n('W')}-${n('L')}-${n('T')}`;
    }
  });
  block.querySelectorAll('.sg-jump').forEach((btn) => {
    const n = block.querySelectorAll(`.sg-row[data-state="${btn.dataset.jump}"]:not(.sg-hide)`).length;
    btn.querySelector('.sg-jump-count').textContent = n;
    btn.disabled = !n;
  });
}

function wireResultFilter(block) {
  const select = block.querySelector('.result-select');
  select?.addEventListener('change', () => {
    const f = select.value;
    block.querySelectorAll('.sg-row').forEach((row) => {
      row.classList.toggle('sg-hide', !(f === 'all' || row.dataset.result === f));
    });
    refreshGroups(block.closest('.schedule') || block);
  });
}

// Phones: the next game at full size, then one-tap jumps to the latest result
// and to the next game. Hidden on wider screens.
function spotlight(g) {
  if (!g) return '';
  const p = parseGameDateTime(g.rawDate, g.time);
  const day = p ? `${WEEKDAYS[new Date(p.year, p.month, p.day).getDay()]} ${MONTH_ABBR[p.month]} ${p.day}` : g.date;
  const ev = calEvent(g, teamLabel());
  return `<div class="sg-nextup">
      <div class="sg-np-head"><h2>Next up</h2>${typeTag(g.type)}</div>
      <p class="sg-np-when"><span class="sg-np-date">${day}</span>${g.time ? `<span class="sg-np-time">${g.time}</span>` : ''}</p>
      <div class="sg-np-match">${oppCell(g)}</div>
      ${g.location ? `<p class="sg-np-where"><span>${g.location}</span>${pinLink(g.location, 'sg-np-pin')}</p>` : ''}
      ${ev ? `<div class="sg-cal-wrap sg-np-cal" data-event="${encodeURIComponent(JSON.stringify(ev))}">
          <button type="button" class="sg-cal" aria-haspopup="true" aria-expanded="false">${CAL_ICON}<span>Add to calendar</span></button>
          <div class="sg-cal-menu" hidden>
            <a href="${googleCalUrl(ev)}" target="_blank" rel="noopener" data-cal="google">Google Calendar</a>
            <a href="#" data-cal="ics" data-file="${teamLabel().replace(/\s+/g, '-')}-vs-${(g.opp || 'game').replace(/\s+/g, '-')}.ics">Apple / Outlook</a>
          </div>
        </div>` : ''}
    </div>`;
}

const jumpPair = () => `<div class="sg-jumps">
    <button type="button" class="sg-jump" data-jump="final">Results <span class="sg-jump-count"></span></button>
    <button type="button" class="sg-jump" data-jump="upcoming">Upcoming <span class="sg-jump-count"></span></button>
  </div>`;

function wireJumps(block) {
  block.querySelectorAll('.sg-jump').forEach((btn) => btn.addEventListener('click', () => {
    const rows = [...block.querySelectorAll(`.sg-row[data-state="${btn.dataset.jump}"]:not(.sg-hide)`)];
    const target = btn.dataset.jump === 'final' ? rows[rows.length - 1] : rows[0];
    if (!target) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));
}

function renderSchedule(block, games) {
  const tournamentPage = feedConfig().key === 'mid-atlantic';
  // Team pages filter by game type: League, Tournament, Exhibition, All Games
  // (the default; "Other" games show only there).
  const types = tournamentPage ? [] : ['League', 'Tournament', 'Exhibition', 'All'];
  const count = (type) => (type === 'All' ? games.length : games.filter((g) => (g.type || 'League') === type).length);
  const typeButtons = (current) => (types.length ? `<div class="type-filter" role="group" aria-label="Game type">
      ${types.map((type) => `<button type="button" class="type-btn" data-type="${type}" aria-pressed="${type === current}">${type === 'All' ? 'All Games' : type}<span class="type-count">${count(type)}</span></button>`).join('')}
    </div>` : '');
  const next = nextGame(games);
  block.innerHTML = `
    ${printHeader()}
    <div class="sg-top">${spotlight(next)}${jumpPair()}</div>
    ${subscribeBar()}
    <div class="schedule-body"></div>`;
  wireSubscribe(block);
  wireJumps(block);
  wireCalendars(block.querySelector('.sg-top'));
  const body = block.querySelector('.schedule-body');
  const show = (type, focus) => {
    const list = tournamentPage || type === 'All' ? games : games.filter((g) => (g.type || 'League') === type);
    body.innerHTML = scheduleBody(list, tournamentPage ? 'All' : type, typeButtons(type), next);
    block.classList.toggle('schedule-upcoming', !list.some((g) => ['W', 'L', 'T'].includes(g.result)));
    body.querySelectorAll('.type-btn').forEach((b) => b.addEventListener('click', () => show(b.dataset.type, true)));
    if (focus) body.querySelector(`.type-btn[data-type="${type}"]`)?.focus();
    wireResultFilter(body);
    wirePrint(body);
    wireCalendars(body);
    refreshGroups(block);
  };
  show('All');
}

export default function decorate(block) {
  // Any authored rows act as a fallback if the live feed is unavailable.
  // Two-cell rows (e.g. "src | url", "team | Rinx") are settings, not games.
  const authored = [...block.children].filter((row) => row.children.length > 2).map((row) => {
    const cells = [...row.children];
    return {
      date: cells[0]?.textContent?.trim() || '',
      opp: cells[1]?.textContent?.trim() || '',
      loc: cells[2]?.textContent?.trim() || '',
      score: cells[3]?.textContent?.trim() || '',
      result: cells[4]?.textContent?.trim() || '',
    };
  }).filter((g) => g.opp);

  block.innerHTML = '<div class="loading-box"><div class="spinner"></div><p>Loading schedule&hellip;</p></div>';

  // Don't hold the section (and the page title, usually the LCP element)
  // until the feed arrives; the loading box reserves the space meanwhile.
  loadFeedGames()
    .then((games) => {
      if (!games.length) throw new Error('empty feed');
      renderSchedule(block, games);
      addEventData(games);
    })
    .catch(() => {
      if (authored.length) {
        renderSchedule(block, authored);
      } else {
        block.innerHTML = '<div class="err-box"><p>Schedule is temporarily unavailable. '
          + '<a href="https://gamesheetstats.com" target="_blank" rel="noopener">View on GameSheet &rarr;</a></p></div>';
      }
    });
}
