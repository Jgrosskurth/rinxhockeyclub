/**
 * Rinx Hockey Club: exhibition game submissions.
 *
 * Google Apps Script bound to a Google Sheet. The website's /submit-game form
 * posts here; each submission becomes a row on the "Submissions" tab using the
 * same columns as the other-games sheet, plus who sent it. A GitHub workflow
 * (exhibition-submissions.yml) reads the public columns back (doGet) and the
 * games appear on the schedule, standings and homepage automatically.
 *
 * To take a row off the website, type "Hide" in its Status cell.
 *
 * Optional Script properties (Project Settings > Script properties):
 *   TEAM_CODE      a code families must enter to submit (leave unset for none)
 *   NOTIFY_EMAIL   comma-separated addresses emailed on each submission
 *   GITHUB_TOKEN   fine-grained token (this repo, Contents: read and write) so
 *                  games appear within a couple of minutes instead of ~15
 *
 * Setup steps: tools/game-submissions/README.md
 */

const SHEET_NAME = 'Submissions';
const COLUMNS = ['Submitted', 'Action', 'Team', 'Type', 'Date', 'Time', 'Opponent', 'Logo', 'Rink',
  'Score', 'Result', 'Name', 'Contact', 'Notes', 'Status'];
// Only these columns are ever returned to the website.
const PUBLIC = ['Submitted', 'Action', 'Team', 'Type', 'Date', 'Time', 'Opponent', 'Logo', 'Rink',
  'Score', 'Result'];
const REPO = 'Jgrosskurth/rinxhockeyclub';
const MAX_PER_HOUR = 30;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Run once from the editor: creates the tab and header row. */
function setup() {
  const sheet = getSheet();
  Logger.log(`Ready: "${sheet.getName()}" with ${COLUMNS.length} columns.`);
}

function getSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    // Plain text, so Sheets doesn't turn "Oct 25, 2026" or "9:00 AM" into dates.
    sheet.getRange(1, 1, sheet.getMaxRows(), COLUMNS.length).setNumberFormat('@');
  }
  return sheet;
}

function json(body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function prop(name) {
  return (PropertiesService.getScriptProperties().getProperty(name) || '').trim();
}

/** Public list of submitted games (no names or contact details). */
function doGet() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getDisplayValues();
  const head = values.shift() || [];
  const col = (name) => head.indexOf(name);
  const data = values
    .filter((row) => !/hide|reject|delete|spam/i.test(row[col('Status')] || ''))
    .map((row) => Object.fromEntries(PUBLIC.map((name) => [name, row[col(name)] || ''])))
    .filter((row) => row.Team && row.Date && row.Opponent);
  return json({ ok: true, codeRequired: !!prop('TEAM_CODE'), data });
}

const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, ' ')
  .replace(/\s+/g, ' ').trim().slice(0, max);

/** "2026-10-25" -> "Oct 25, 2026" */
function sheetDate(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m || +m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31) return '';
  return `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}`;
}

/** "16:50" -> "4:50 PM" */
function sheetTime(hhmm) {
  const m = String(hhmm || '').match(/^(\d{2}):(\d{2})$/);
  if (!m || +m[1] > 23 || +m[2] > 59) return '';
  const h = +m[1];
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`;
}

function validate(p) {
  const action = p.action === 'score' ? 'Score' : 'Upcoming';
  const team = { '10u': '10U', '14u': '14U' }[String(p.team || '').toLowerCase()];
  const date = sheetDate(p.date);
  const time = sheetTime(p.time);
  const opponent = clean(p.opponent, 80);
  const rink = clean(p.rink, 80);
  const logo = clean(p.logo, 300);
  const errors = [];
  if (!team) errors.push('Choose 10U or 14U.');
  if (!date) errors.push('Enter the game date.');
  if (!opponent) errors.push('Enter the opponent.');
  if (action === 'Upcoming' && !time) errors.push('Enter the start time.');
  if (action === 'Upcoming' && !rink) errors.push('Enter the rink.');
  if (logo && !/^https:\/\/[^\s"'<>]+$/.test(logo)) errors.push('The logo link must start with https://');
  let score = '';
  let result = '';
  if (action === 'Score') {
    const us = Number(p.rinxGoals);
    const them = Number(p.oppGoals);
    const ok = (n) => Number.isInteger(n) && n >= 0 && n <= 40;
    if (!ok(us) || !ok(them)) {
      errors.push('Enter both scores.');
    } else {
      score = `${us}-${them}`;
      result = us > them ? 'W' : (us < them ? 'L' : 'T');
    }
  }
  const name = clean(p.name, 80);
  const contact = clean(p.contact, 120);
  if (!name) errors.push('Enter your name.');
  if (!contact) errors.push('Enter an email or phone number.');
  return {
    errors,
    row: {
      Submitted: Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm:ss'),
      Action: action,
      Team: team || '',
      Type: 'Exhibition',
      Date: date,
      Time: time,
      Opponent: opponent,
      Logo: logo,
      Rink: rink,
      Score: score,
      Result: result,
      Name: name,
      Contact: contact,
      Notes: clean(p.notes, 500),
      Status: '',
    },
  };
}

function doPost(e) {
  let p;
  try {
    p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json({ ok: false, errors: ['Could not read the form.'] });
  }
  // Bots fill the hidden "website" field; pretend it worked.
  if (p.website) return json({ ok: true });

  const code = prop('TEAM_CODE');
  if (code && String(p.code || '').trim().toLowerCase() !== code.toLowerCase()) {
    return json({ ok: false, errors: ['That team code is not right. Ask your team manager for it.'] });
  }

  const { errors, row } = validate(p);
  if (errors.length) return json({ ok: false, errors });

  const cache = CacheService.getScriptCache();
  const count = Number(cache.get('hour-count') || 0);
  if (count >= MAX_PER_HOUR) {
    return json({ ok: false, errors: ['Too many submissions right now. Please try again in an hour.'] });
  }
  cache.put('hour-count', String(count + 1), 3600);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    const at = sheet.getLastRow() + 1;
    sheet.getRange(at, 1, 1, COLUMNS.length).setNumberFormat('@')
      .setValues([COLUMNS.map((name) => row[name])]);
  } finally {
    lock.releaseLock();
  }

  notify(row);
  triggerSite();
  return json({ ok: true });
}

function notify(row) {
  const to = prop('NOTIFY_EMAIL');
  if (!to) return;
  const what = row.Action === 'Score'
    ? `Score: Rinx ${row.Team} ${row.Score} (${row.Result}) vs ${row.Opponent}`
    : `Upcoming: Rinx ${row.Team} vs ${row.Opponent}, ${row.Date} ${row.Time}`;
  const body = COLUMNS.filter((name) => row[name]).map((name) => `${name}: ${row[name]}`).join('\n');
  try {
    MailApp.sendEmail(to, `Exhibition game submitted. ${what}`,
      `${body}\n\nIt is on the website automatically. To take it off, type "Hide" in its Status cell:\n${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`);
  } catch (err) {
    console.warn(`Email not sent: ${err}`);
  }
}

// Starts the website update right away (otherwise it runs every ~15 minutes).
function triggerSite() {
  const token = prop('GITHUB_TOKEN');
  if (!token) return;
  try {
    UrlFetchApp.fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
      payload: JSON.stringify({ event_type: 'game-submitted' }),
      muteHttpExceptions: true,
    });
  } catch (err) {
    console.warn(`GitHub trigger failed: ${err}`);
  }
}
