import {
  gameSheetLogo, findLogoId, findLocalLogo, MHR_CDN,
} from '../../scripts/team-logos.js';
import { rinkAddress, extraGames } from '../../scripts/team-feeds.js';

// Which feed (data/schedule-{key}.json) a page shows, matched by URL path.
// Tournament feeds come from their own GameSheet season (see pull-schedule.yml).
const FEEDS = [
  {
    match: 'mid-atlantic',
    key: 'mid-atlantic',
    label: 'Rinx 10U Squirts',
    title: 'Mid-Atlantic Fall Showcase',
    season: '2026 Mid-Atlantic Fall Showcase',
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
      <p class="sub-text"><strong>Never miss a game.</strong> Subscribe to the ${team} calendar and every game, time change and final score updates on your phone automatically.</p>
      <div class="sub-actions">
        <a class="sub-btn" href="${webcal}">Apple / iPhone</a>
        <a class="sub-btn" href="${google}" target="_blank" rel="noopener">Google Calendar</a>
        <button type="button" class="sub-btn sub-copy" data-url="${url}">Copy link</button>
      </div>
    </div>`;
}

function wireSubscribe(block) {
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

function oppCell(g) {
  const ini = g.opp.split(' ').slice(0, 2).map((w) => w[0])
    .join('')
    .toUpperCase();
  const gsLogo = gameSheetLogo(g.opp);
  const useLogos = feedConfig().logos !== false;
  const localLogo = useLogos ? findLocalLogo(g.opp) : '';
  const logoId = (localLogo || !useLogos) ? '' : findLogoId(g.opp);
  const logoSrc = gsLogo || localLogo || (logoId ? `${MHR_CDN}${logoId}_a.png` : '');
  const logoImg = logoSrc
    ? `<img class="sg-logo" src="${logoSrc}" alt="${g.opp}" width="36" height="36" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  return `
      <div class="sg-opp">
        ${logoImg}
        <div class="sg-logo-fb"${logoSrc ? ' style="display:none"' : ''}>${ini}</div>
        <div>
          <div class="sg-name">${g.opp}</div>
          <div class="sg-loc">${g.loc}</div>
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

// Link to a game's GameSheet box score, if we have its id.
function boxScoreUrl(g) {
  if (!g.gameId || g.sheet) return '';
  return `https://gamesheetstats.com/seasons/${g.season || '15381'}/games/${g.gameId}`;
}

// Small label for a game's type (League, Tournament, Exhibition, Other).
const typeTag = (type) => `<span class="sg-type sg-type-${(type || 'League').toLowerCase()}">${type || 'League'}</span>`;

function renderRows(games) {
  const label = teamLabel();
  return games.map((g) => {
    const hasResult = ['W', 'L', 'T'].includes(g.result);
    let badge = 'tie';
    if (g.result === 'W') badge = 'win';
    else if (g.result === 'L') badge = 'loss';
    const resultCell = hasResult ? `<span class="badge badge-${badge}">${g.result}</span>` : '';
    const ev = hasResult ? null : calEvent(g, label);
    // Upcoming games get a calendar button with a Google / Apple(.ics) menu.
    const evAttr = ev ? ` data-event="${encodeURIComponent(JSON.stringify(ev))}"` : '';
    const cal = ev
      ? `<div class="sg-cal-wrap"${evAttr}>
          <button type="button" class="sg-cal" aria-haspopup="true" aria-expanded="false" aria-label="Add ${g.opp} game to calendar" title="Add to calendar">📅</button>
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
    <div class="sg-row${box ? ' sg-clickable' : ''}" data-result="${g.result}">
      ${boxLink}
      <div class="sg-date">${g.date}${typeTag(g.type)}</div>
      ${oppCell(g)}
      <div class="sg-score">${g.score}</div>
      <div class="sg-result">${resultCell}</div>
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

// Clean up GameSheet's verbose team names for display, e.g.
// "NYH4033-002-North Park-10U Mauro" -> "North Park"
// "TB NYH0041-005 Great Neck Bruins 14U Bowden" -> "Great Neck Bruins".
function tidyOpponent(name) {
  let s = (name || '').trim();
  s = s.replace(/^TB\s+/i, ''); // drop "TB " (to be determined) prefix
  // Drop the registration code block, e.g. "NYH4033-002-" or "NYH0041-005 ".
  s = s.replace(/^NYH?\d+(?:[-\s]\d+)?[-\s]*/i, '');
  // Cut everything from the age group / tournament division onward
  // ("10U ... coach", "14U-Pala", "Delco Phantoms 10A").
  s = s.replace(/[-\s]*\b\d{1,2}(?:U|AAA|AA|A|B)\b.*$/i, '');
  s = s.replace(/^[-–\s]+|[-–\s]+$/g, ''); // stray leading/trailing dashes
  s = s.replace(/\s+/g, ' ').trim();
  // GameSheet often stores names in ALL CAPS — make them Title Case.
  if (s && s === s.toUpperCase()) {
    s = s.toLowerCase().replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
  }
  return s || name;
}

// Map a feed game to the block's internal shape.
function fromFeed(g, season) {
  const opp = tidyOpponent(g.opponent);
  const parts = [g.location, g.time].filter(Boolean);
  return {
    date: g.date || '',
    opp,
    loc: parts.join(' · '),
    score: g.score || '',
    result: g.result || '',
    // Raw fields kept for the "add to calendar" (.ics) feature.
    rawDate: g.date || '',
    time: g.time || '',
    location: g.location || '',
    venue: g.venue || '',
    gameId: g.gameId || '',
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

function scheduleBody(games, type) {
  const label = type === 'All' ? 'games' : `${type.toLowerCase()} games`;
  if (!games.length) {
    return `<p class="schedule-empty">No ${label} ${type === 'All' ? 'posted' : 'on the schedule'} yet.</p>`;
  }
  const hasResults = games.some((g) => ['W', 'L', 'T'].includes(g.result));
  const table = `
    <div class="schedule-table">
      <div class="sg-header">
        <span>Date</span>
        <span>Opponent</span>
        <span>Score</span>
        <span>Result</span>
      </div>
      <div class="sg-rows">${renderRows(games)}</div>
    </div>`;
  // Upcoming only: the same table, without the win/loss summary and filters.
  if (!hasResults) {
    return `
    <div class="schedule-controls">
      <p class="schedule-note">${games.length} ${label} &bull; scores posted after each game</p>
      <button type="button" class="print-btn">🖨 Print Schedule</button>
    </div>
    ${table}
    <p class="schedule-src">${feedConfig().note} &bull; times and locations subject to change &bull; 🗓️ = add game to your calendar</p>`;
  }
  const w = games.filter((g) => g.result === 'W').length;
  const l = games.filter((g) => g.result === 'L').length;
  const t = games.filter((g) => g.result === 'T').length;
  const gf = games.reduce((n, g) => n + (parseInt(g.score?.split(/[-–]/)[0], 10) || 0), 0);
  const ga = games.reduce((n, g) => n + (parseInt(g.score?.split(/[-–]/)[1], 10) || 0), 0);
  return `
    <div class="schedule-summary">
      <div class="sum-tile navy"><span class="sum-num">${w}</span><span class="sum-lbl">Wins</span></div>
      <div class="sum-tile navy"><span class="sum-num">${l}</span><span class="sum-lbl">Losses</span></div>
      <div class="sum-tile navy"><span class="sum-num">${t}</span><span class="sum-lbl">Ties</span></div>
      <div class="sum-tile red"><span class="sum-num">${gf}</span><span class="sum-lbl">Goals For</span></div>
      <div class="sum-tile navy-light"><span class="sum-num">${ga}</span><span class="sum-lbl">Goals Against</span></div>
    </div>

    <div class="schedule-controls">
      <div class="filter-buttons" role="group" aria-label="Results">
        <button class="filter-btn active" data-filter="all">All Results</button>
        <button class="filter-btn" data-filter="W">Wins</button>
        <button class="filter-btn" data-filter="L">Losses</button>
        <button class="filter-btn" data-filter="T">Ties</button>
      </div>
      <button type="button" class="print-btn">🖨 Print Schedule</button>
    </div>
    ${table}
    <p class="schedule-src">${feedConfig().season} &bull; Source: <a href="https://gamesheetstats.com" target="_blank" rel="noopener">GameSheet</a>${games.some((g) => g.sheet) ? ' and the club' : ''}</p>`;
}

function wireResultFilter(block) {
  block.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      block.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      block.querySelectorAll('.sg-row').forEach((row) => {
        row.style.display = (f === 'all' || row.dataset.result === f) ? 'grid' : 'none';
      });
    });
  });
}

function renderSchedule(block, games) {
  const tournamentPage = feedConfig().key === 'mid-atlantic';
  // Team pages filter by game type: League (default), Tournament, Exhibition,
  // All Games ("Other" games show under All Games).
  const types = tournamentPage ? [] : ['League', 'Tournament', 'Exhibition', 'All'];
  const count = (type) => (type === 'All' ? games.length : games.filter((g) => (g.type || 'League') === type).length);
  block.innerHTML = `
    ${printHeader()}
    ${subscribeBar()}
    ${types.length ? `<div class="type-filter" role="group" aria-label="Game type">
      ${types.map((type) => `<button type="button" class="type-btn" data-type="${type}" aria-pressed="${type === 'League'}">${type === 'All' ? 'All Games' : type}<span class="type-count">${count(type)}</span></button>`).join('')}
    </div>` : ''}
    <div class="schedule-body"></div>`;
  wireSubscribe(block);
  const body = block.querySelector('.schedule-body');
  const show = (type) => {
    const list = tournamentPage || type === 'All' ? games : games.filter((g) => (g.type || 'League') === type);
    body.innerHTML = scheduleBody(list, tournamentPage ? 'All' : type);
    block.classList.toggle('schedule-upcoming', !list.some((g) => ['W', 'L', 'T'].includes(g.result)));
    block.querySelectorAll('.type-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === type)));
    wireResultFilter(body);
    wirePrint(body);
    wireCalendars(body);
  };
  block.querySelectorAll('.type-btn').forEach((b) => b.addEventListener('click', () => show(b.dataset.type)));
  show(tournamentPage ? 'All' : 'League');
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
