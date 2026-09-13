const MHR_CDN = 'https://ranktech-cdn.s3.us-east-2.amazonaws.com/myhockey_prod/logos/';

const TEAM_LOGOS = {
  // 10U confirmed
  aviator: '001dfe',
  kings: '001ba2',
  'north park': '002ee8',
  'great neck': '001934',
  arrows: '0013c6',
  lions: '00017d',
  lightning: '0004c5',
  sharks: '000bd3',
  edge: '000723',
  hawks: '000f90',
  cyclones: '001589',
  tigers: '00075f',
  express: '001f15',
  wildcats: '00153e',
  vipers: '00000b',
  panthers: '001d53',
  predators: '00133e',
  blues: '00018b',
  'ice devils': '0014fd',
  'red wings': '001dfe',
  // 14U confirmed
  rebels: '001506',
  wolfpack: '001570',
  phantoms: '00123e',
  piedmont: '001729',
  'sound tigers': '001888',
  mustangs: '0010b0',
  wizards: '000032',
  bears: '000f91',
  storm: '000cb9',
  admirals: '002d89',
  advantage: '00246a',
  outlaws: '000114',
  capitals: '000bc7',
  whalers: '00230f',
  ramparts: '001f58',
  wolves: '000f98',
  flames: '000f8c',
  // Opponents matched by club/city name that differ from the mascot key
  peconic: '00153e', // Peconic Wildcats
  brewster: '001f15', // Westchester Express (Brewster)
  'long beach': '0004c5', // Long Beach Lightning
};

// Logos for teams not on the ranking CDN, uploaded to the site media library.
const LOCAL_LOGOS = {
  'dix hills selects': '/images/dh.png',
  'beaver dam': '/images/beaverdam.png',
  'white plains': '/images/whiteplains.png',
  'isles elite': '/images/soundtigers.jpeg',
  'iceworks islanders': '/images/iceworks-islanders.webp',
};

function findLogoId(oppName) {
  const lower = oppName.toLowerCase();
  const keys = Object.keys(TEAM_LOGOS);
  for (let i = 0; i < keys.length; i += 1) {
    if (lower.includes(keys[i])) return TEAM_LOGOS[keys[i]];
  }
  return '';
}

function findLocalLogo(oppName) {
  const lower = oppName.toLowerCase();
  const keys = Object.keys(LOCAL_LOGOS);
  for (let i = 0; i < keys.length; i += 1) {
    if (lower.includes(keys[i])) return LOCAL_LOGOS[keys[i]];
  }
  return '';
}

function oppCell(g) {
  const ini = g.opp.split(' ').slice(0, 2).map((w) => w[0])
    .join('')
    .toUpperCase();
  const localLogo = findLocalLogo(g.opp);
  const logoId = localLogo ? '' : findLogoId(g.opp);
  const logoSrc = localLogo || (logoId ? `${MHR_CDN}${logoId}_a.png` : '');
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

// Build an .ics data-URL for one game (default 90-minute event).
function icsHref(g, label) {
  const p = parseGameDateTime(g.rawDate, g.time);
  if (!p || !p.hasTime) return '';
  const start = icsStamp(p);
  const endParts = { ...p, hour: p.hour + 1, min: p.min + 30 };
  const end = icsStamp(endParts);
  const esc = (s) => (s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const summary = `${label} vs ${g.opp}`;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rinx Hockey Club//Schedule//EN',
    'BEGIN:VEVENT',
    `UID:rinx-${start}-${(g.opp || '').replace(/\W+/g, '')}@rinxhockeyclub`,
    `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${esc(summary)}`,
    g.location ? `LOCATION:${esc(g.location)}` : '',
    `DESCRIPTION:${esc(`${label} ${g.venue || ''} game vs ${g.opp}`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean);
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}

function teamLabel() {
  return window.location.pathname.includes('14u') ? 'Rinx 14U Bantam' : 'Rinx 10U Squirts';
}

function renderRows(games) {
  const label = teamLabel();
  return games.map((g) => {
    const hasResult = ['W', 'L', 'T'].includes(g.result);
    let badge = 'tie';
    if (g.result === 'W') badge = 'win';
    else if (g.result === 'L') badge = 'loss';
    const resultCell = hasResult ? `<span class="badge badge-${badge}">${g.result}</span>` : '';
    const ics = hasResult ? '' : icsHref(g, label);
    const cal = ics
      ? `<a class="sg-cal" href="${ics}" download="${label.replace(/\s+/g, '-')}-vs-${(g.opp || 'game').replace(/\s+/g, '-')}.ics" title="Add to calendar" aria-label="Add ${g.opp} game to calendar">🗓️</a>`
      : '';
    return `
    <div class="sg-row" data-result="${g.result}">
      <div class="sg-date">${g.date}${cal}</div>
      ${oppCell(g)}
      <div class="sg-score">${g.score}</div>
      <div class="sg-result">${resultCell}</div>
    </div>`;
  }).join('');
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
  // Cut everything from the age group onward ("10U ... coach", "14U-Pala").
  s = s.replace(/[-\s]*\b\d{1,2}U\b.*$/i, '');
  s = s.replace(/^[-–\s]+|[-–\s]+$/g, ''); // stray leading/trailing dashes
  s = s.replace(/\s+/g, ' ').trim();
  // GameSheet often stores names in ALL CAPS — make them Title Case.
  if (s && s === s.toUpperCase()) {
    s = s.toLowerCase().replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
  }
  return s || name;
}

// Map a feed game to the block's internal shape.
function fromFeed(g) {
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
  };
}

async function loadFeedGames() {
  const is14u = window.location.pathname.includes('14u');
  const url = `${FEED_BASE}/schedule-${is14u ? '14u' : '10u'}.json`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`feed ${resp.status}`);
  const data = await resp.json();
  return (data.games || []).map(fromFeed).filter((g) => g.opp);
}

// Wire the Print Schedule button to the browser's print dialog. A print
// stylesheet (schedule.css) hides site chrome so only the schedule prints.
function wirePrint(block) {
  const btn = block.querySelector('.print-btn');
  if (btn) btn.addEventListener('click', () => window.print());
}

function renderSchedule(block, games) {
  // Upcoming schedule — no games have results yet. Keep the same table
  // layout (Date | Opponent | Score | Result) but drop the win/loss summary
  // and filters, and leave the score/result columns blank.
  const hasResults = games.some((g) => ['W', 'L', 'T'].includes(g.result));
  if (!hasResults) {
    block.classList.add('schedule-upcoming');
    block.innerHTML = `
    <div class="schedule-controls">
      <p class="schedule-note">${games.length} games &bull; scores posted after each game</p>
      <button type="button" class="print-btn">🖨 Print Schedule</button>
    </div>

    <div class="schedule-table">
      <div class="sg-header">
        <span>Date</span>
        <span>Opponent</span>
        <span>Score</span>
        <span>Result</span>
      </div>
      <div class="sg-rows">${renderRows(games)}</div>
    </div>

    <p class="schedule-src">Home games at The Rinx at Hauppauge &bull; times and locations subject to change &bull; 🗓️ = add game to your calendar</p>
  `;
    wirePrint(block);
    return;
  }

  const w = games.filter((g) => g.result === 'W').length;
  const l = games.filter((g) => g.result === 'L').length;
  const t = games.filter((g) => g.result === 'T').length;
  const gf = games.reduce((s, g) => s + (parseInt(g.score?.split(/[-–]/)[0], 10) || 0), 0);
  const ga = games.reduce((s, g) => s + (parseInt(g.score?.split(/[-–]/)[1], 10) || 0), 0);

  block.innerHTML = `
    <div class="schedule-summary">
      <div class="sum-tile navy"><span class="sum-num">${w}</span><span class="sum-lbl">Wins</span></div>
      <div class="sum-tile navy"><span class="sum-num">${l}</span><span class="sum-lbl">Losses</span></div>
      <div class="sum-tile navy"><span class="sum-num">${t}</span><span class="sum-lbl">Ties</span></div>
      <div class="sum-tile red"><span class="sum-num">${gf}</span><span class="sum-lbl">Goals For</span></div>
      <div class="sum-tile navy-light"><span class="sum-num">${ga}</span><span class="sum-lbl">Goals Against</span></div>
    </div>

    <div class="schedule-controls">
      <div class="filter-buttons">
        <button class="filter-btn active" data-filter="all">All Games</button>
        <button class="filter-btn" data-filter="W">Wins</button>
        <button class="filter-btn" data-filter="L">Losses</button>
        <button class="filter-btn" data-filter="T">Ties</button>
      </div>
      <button type="button" class="print-btn">🖨 Print Schedule</button>
    </div>

    <div class="schedule-table">
      <div class="sg-header">
        <span>Date</span>
        <span>Opponent</span>
        <span>Score</span>
        <span>Result</span>
      </div>
      <div class="sg-rows">${renderRows(games)}</div>
    </div>

    <p class="schedule-src">2026&ndash;2027 season &bull; Source: <a href="https://gamesheetstats.com" target="_blank" rel="noopener">GameSheet</a></p>
  `;

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

  wirePrint(block);
}

export default async function decorate(block) {
  // Any authored rows act as a fallback if the live feed is unavailable.
  const authored = [...block.children].map((row) => {
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

  try {
    const games = await loadFeedGames();
    if (games.length) {
      renderSchedule(block, games);
      return;
    }
    throw new Error('empty feed');
  } catch {
    if (authored.length) {
      renderSchedule(block, authored);
    } else {
      block.innerHTML = '<div class="err-box"><p>Schedule is temporarily unavailable. '
        + '<a href="https://gamesheetstats.com" target="_blank" rel="noopener">View on GameSheet &rarr;</a></p></div>';
    }
  }
}
