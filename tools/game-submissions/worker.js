/**
 * Rinx Hockey Club: game submissions relay (Cloudflare Worker).
 *
 * Route: www.rinxhockeyclub.com/api/submit-game
 *
 * The /submit-game form posts here. Each submission is checked, then added as
 * a row to the Document Authoring sheet /game-submissions (same columns as
 * /other-games, which the site reads), and that sheet is published. The
 * family's name, contact and notes go to /game-submissions-contacts instead,
 * a sheet that is never published.
 *
 * To take a game off the website, type "Hide" in its Status cell in the
 * game-submissions sheet and publish the sheet.
 *
 * Settings (Worker → Settings → Variables and Secrets):
 *   ADOBE_CLIENT_ID      secret  OAuth Server-to-Server credential (Adobe Developer Console)
 *   ADOBE_CLIENT_SECRET  secret  "
 *   ADOBE_SCOPES         text    the credential's scopes, comma separated, as listed in the console
 *   TEAM_CODE            secret  optional; families must enter it to submit
 *
 * Setup steps: tools/game-submissions/README.md
 */

const ORG = 'jgrosskurth';
const SITE = 'rinxhockeyclub';
const SHEET = 'game-submissions';
const CONTACTS = 'game-submissions-contacts';
const DA = `https://admin.da.live/source/${ORG}/${SITE}`;
const ADMIN = 'https://admin.hlx.page';
const IMS = 'https://ims-na1.adobelogin.com/ims/token/v3';

const PUBLIC = ['Id', 'Submitted', 'Action', 'Team', 'Type', 'Date', 'Time', 'Opponent', 'Logo',
  'Rink', 'Score', 'Result', 'Status'];
const PRIVATE = ['Id', 'Submitted', 'Team', 'Date', 'Opponent', 'Name', 'Contact', 'Notes'];
const PER_IP_PER_HOUR = 10;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

const clean = (v, max) => String(v ?? '')
  .replace(/[\p{Cc}<>]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, max);

// "2026-10-25" -> "Oct 25, 2026"
function sheetDate(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m || +m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31) return '';
  return `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}`;
}

// "16:50" -> "4:50 PM"
function sheetTime(hhmm) {
  const m = String(hhmm || '').match(/^(\d{2}):(\d{2})$/);
  if (!m || +m[1] > 23 || +m[2] > 59) return '';
  const h = +m[1];
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`;
}

function eastern() {
  // "2026-10-14 18:05:09", New York time
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/New_York' });
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
      if (us > them) result = 'W';
      else result = us < them ? 'L' : 'T';
    }
  }
  const name = clean(p.name, 80);
  const contact = clean(p.contact, 120);
  if (!name) errors.push('Enter your name.');
  if (!contact) errors.push('Enter an email or phone number.');
  const row = {
    Id: crypto.randomUUID().slice(0, 8),
    Submitted: eastern(),
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
    Status: '',
    Name: name,
    Contact: contact,
    Notes: clean(p.notes, 500),
  };
  return { errors, row };
}

// At most PER_IP_PER_HOUR submissions per IP address an hour (per Cloudflare location).
async function overLimit(request) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const key = new Request(`https://rate-limit.invalid/submit-game/${ip}`);
  const cache = caches.default;
  const hit = await cache.match(key);
  const count = hit ? Number(await hit.text()) : 0;
  if (count >= PER_IP_PER_HOUR) return true;
  await cache.put(key, new Response(String(count + 1), { headers: { 'cache-control': 'max-age=3600' } }));
  return false;
}

let token = { value: '', expires: 0 };
async function accessToken(env) {
  if (token.value && Date.now() < token.expires - 60000) return token.value;
  const resp = await fetch(IMS, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.ADOBE_CLIENT_ID,
      client_secret: env.ADOBE_CLIENT_SECRET,
      scope: env.ADOBE_SCOPES || 'openid,AdobeID',
    }),
  });
  if (!resp.ok) throw new Error(`Adobe sign-in failed (${resp.status})`);
  const body = await resp.json();
  token = { value: body.access_token, expires: Date.now() + (body.expires_in || 3600) * 1000 };
  return token.value;
}

async function readSheet(name, auth) {
  const resp = await fetch(`${DA}/${name}.json`, { headers: { authorization: `Bearer ${auth}` } });
  if (resp.status === 404) return { data: [] };
  if (!resp.ok) throw new Error(`Reading ${name} failed (${resp.status})`);
  return resp.json();
}

async function writeSheet(name, sheet, columns, auth) {
  const data = sheet.data.map((r) => Object.fromEntries(columns.map((c) => [c, r[c] ?? ''])));
  const widths = sheet[':colWidths'];
  const body = {
    ...sheet,
    total: data.length,
    limit: data.length,
    offset: 0,
    data,
    ':colWidths': Array.isArray(widths) && widths.length === columns.length ? widths : columns.map(() => 140),
    ':type': 'sheet',
  };
  const form = new FormData();
  form.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }));
  const resp = await fetch(`${DA}/${name}.json`, {
    method: 'POST', headers: { authorization: `Bearer ${auth}` }, body: form,
  });
  if (!resp.ok) throw new Error(`Saving ${name} failed (${resp.status})`);
}

async function publishStep(step, name, auth) {
  const resp = await fetch(`${ADMIN}/${step}/${ORG}/${SITE}/main/${name}.json`, {
    method: 'POST', headers: { authorization: `Bearer ${auth}` },
  });
  if (!resp.ok) throw new Error(`Publishing ${name} failed at ${step} (${resp.status})`);
}

// Preview, then publish (live), as the Publish button in DA does.
async function publish(name, auth) {
  await publishStep('preview', name, auth);
  await publishStep('live', name, auth);
}

// Append a row, then re-read to make sure a submission sent at the same
// moment didn't overwrite it.
async function append(name, row, columns, auth) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const sheet = await readSheet(name, auth);
    sheet.data = [...(sheet.data || []), row];
    // eslint-disable-next-line no-await-in-loop
    await writeSheet(name, sheet, columns, auth);
    // eslint-disable-next-line no-await-in-loop
    const check = await readSheet(name, auth);
    if ((check.data || []).some((r) => r.Id === row.Id)) return;
  }
  throw new Error(`Saving ${name} kept colliding`);
}

export default {
  async fetch(request, env) {
    const ready = !!(env.ADOBE_CLIENT_ID && env.ADOBE_CLIENT_SECRET);
    if (request.method === 'GET') {
      return json({ ok: true, ready, codeRequired: !!env.TEAM_CODE });
    }
    if (request.method !== 'POST') return json({ ok: false, errors: ['Not allowed.'] }, 405);
    if (!ready) return json({ ok: false, errors: ['Game submissions aren’t switched on yet.'] }, 503);

    let p;
    try {
      p = await request.json();
    } catch {
      return json({ ok: false, errors: ['Could not read the form.'] }, 400);
    }
    // Bots fill the hidden "website" field; pretend it worked.
    if (p.website) return json({ ok: true });

    const code = (env.TEAM_CODE || '').trim();
    if (code && String(p.code || '').trim().toLowerCase() !== code.toLowerCase()) {
      return json({ ok: false, errors: ['That team code is not right. Ask your team manager for it.'] }, 403);
    }
    const { errors, row } = validate(p);
    if (errors.length) return json({ ok: false, errors }, 400);
    if (await overLimit(request)) {
      return json({ ok: false, errors: ['Too many submissions from here. Please try again in an hour.'] }, 429);
    }

    try {
      const auth = await accessToken(env);
      await append(SHEET, row, PUBLIC, auth);
      await append(CONTACTS, row, PRIVATE, auth);
      await publish(SHEET, auth);
    } catch (err) {
      console.error(err);
      return json({ ok: false, errors: ['The game could not be saved right now. Please try again, or send it to the club.'] }, 502);
    }
    return json({ ok: true });
  },
};
