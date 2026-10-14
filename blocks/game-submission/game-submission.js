import {
  TEAMS, loadTeamGames, loadClubRows, loadSubmittedRows, mergeSheetRows, sheetGames,
} from '../../scripts/team-feeds.js';

// Families send in exhibition games: an upcoming game, or the score of one.
// Answers go to the club's Google Form; its responses reach the schedule,
// standings and homepage through data/form-games.json (form-games.yml).
//
// Authoring: one row, "Form" | <the Google Form's viewform link>.

// The Google Form's questions. If a question is added, removed or recreated
// in the form, update its entry id here (they're in the form page's source,
// FB_PUBLIC_LOAD_DATA_). Choice values must match the form's options exactly.
const ENTRY = {
  team: 'entry.526430984', // 10U / 14U
  action: 'entry.1815039211', // Upcoming Game / Score Report
  date: 'entry.1334930567', // date question: _year, _month, _day
  time: 'entry.1847086982', // time question: _hour, _minute (24h)
  opponent: 'entry.540094697',
  rink: 'entry.36291720',
  rinxGoals: 'entry.693898124',
  oppGoals: 'entry.1292415246',
  // Paragraph question "Opponent Logo": the picked image, shrunk to a small
  // data: image. Empty = no logo field on the page.
  logo: '',
};
const ACTION_VALUE = { upcoming: 'Upcoming Game', score: 'Score Report' };
const FORM_LINK = /^https:\/\/docs\.google\.com\/forms\/d\/e\/([A-Za-z0-9_-]+)\//;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [k, v] = row.children;
    if (!k) return;
    const key = k.textContent.trim().toLowerCase();
    config[key] = v?.querySelector('a')?.href || v?.textContent.trim() || '';
  });
  return config;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "Oct 11, 2026" -> "2026-10-11"
function isoDate(date) {
  const m = (date || '').match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/);
  const month = m ? MONTHS.findIndex((n) => n.toLowerCase() === m[1].toLowerCase()) : -1;
  return month < 0 ? '' : `${m[3]}-${pad(month + 1)}-${pad(m[2])}`;
}

// "2:00 PM" -> "14:00"
function isoTime(time) {
  const m = (time || '').match(/(\d{1,2}):(\d{2})\s*([AP])/i);
  if (!m) return '';
  return `${pad((+m[1] % 12) + (m[3].toUpperCase() === 'P' ? 12 : 0))}:${m[2]}`;
}

function field(id, label, input, hint = '') {
  return `<div class="gs-field" data-field="${id}">
      <label for="gs-${id}">${label}</label>
      ${input}
      ${hint ? `<p class="gs-hint" id="gs-${id}-hint">${hint}</p>` : ''}
      <p class="gs-error" id="gs-${id}-error" hidden></p>
    </div>`;
}

// The form answers as the Google Form expects them.
function formFields(data) {
  const body = new URLSearchParams();
  body.set(ENTRY.team, data.team.toUpperCase());
  body.set(ENTRY.action, ACTION_VALUE[data.action]);
  const [year, month, day] = data.date.split('-');
  body.set(`${ENTRY.date}_year`, year);
  body.set(`${ENTRY.date}_month`, String(+month));
  body.set(`${ENTRY.date}_day`, String(+day));
  if (data.time) {
    const [hour, minute] = data.time.split(':');
    body.set(`${ENTRY.time}_hour`, hour);
    body.set(`${ENTRY.time}_minute`, minute);
  }
  body.set(ENTRY.opponent, data.opponent);
  if (ENTRY.logo && data.logo) body.set(ENTRY.logo, data.logo);
  body.set(ENTRY.rink, data.rink || '');
  if (data.action === 'score') {
    body.set(ENTRY.rinxGoals, String(+data.rinxGoals));
    body.set(ENTRY.oppGoals, String(+data.oppGoals));
  }
  return body;
}

const describe = (id, hint) => `aria-describedby="${hint ? `gs-${id}-hint ` : ''}gs-${id}-error"`;

function formHtml() {
  const teams = Object.values(TEAMS).map((t, i) => `
        <label class="gs-choice"><input type="radio" name="team" value="${t.key}"${i ? '' : ' required'}><span>${t.label}</span></label>`).join('');
  return `
    <form class="gs-form" novalidate>
      <div class="gs-summary" role="alert" tabindex="-1" hidden></div>
      <fieldset class="gs-set gs-mode">
        <legend>What are you sending?</legend>
        <div class="gs-choices">
          <label class="gs-choice"><input type="radio" name="action" value="upcoming" checked><span>Upcoming game</span></label>
          <label class="gs-choice"><input type="radio" name="action" value="score"><span>Report a score</span></label>
        </div>
      </fieldset>

      <fieldset class="gs-set" data-field="team" aria-describedby="gs-team-error">
        <legend>Team <span class="gs-req" aria-hidden="true">*</span></legend>
        <div class="gs-choices">${teams}</div>
        <p class="gs-error" id="gs-team-error" hidden></p>
      </fieldset>

      <div class="gs-only-score" hidden>
        ${field('game', 'Game <span class="gs-req" aria-hidden="true">*</span>', `<select id="gs-game" name="game" ${describe('game', true)} disabled><option value="">Choose a team first</option></select>`, 'Exhibition games that don’t have a score yet.')}
      </div>

      <div class="gs-details">
        <div class="gs-row">
          ${field('date', 'Date <span class="gs-req" aria-hidden="true">*</span>', `<input type="date" id="gs-date" name="date" ${describe('date')}>`)}
          ${field('time', 'Start time <span class="gs-req gs-time-req" aria-hidden="true">*</span>', `<input type="time" id="gs-time" name="time" step="300" ${describe('time')}>`)}
        </div>
        ${field('opponent', 'Opponent <span class="gs-req" aria-hidden="true">*</span>', `<input type="text" id="gs-opponent" name="opponent" list="gs-opponents" maxlength="80" autocomplete="off" ${describe('opponent', true)}><datalist id="gs-opponents"></datalist>`, 'Their full team name, e.g. Darien Youth 14U A.')}
        ${ENTRY.logo ? field('logo', 'Opponent logo <span class="gs-opt">(optional)</span>', `<input type="file" id="gs-logo" name="logoFile" accept="image/png,image/jpeg,image/webp,image/gif" ${describe('logo', true)}>
          <div class="gs-logo-preview" hidden><img alt="" width="64" height="64"><button type="button" class="gs-logo-remove">Remove</button></div>`, 'Only needed if their logo isn’t on our site yet.') : ''}
        ${field('rink', 'Rink <span class="gs-req" aria-hidden="true">*</span>', `<input type="text" id="gs-rink" name="rink" list="gs-rinks" maxlength="80" autocomplete="off" ${describe('rink', true)}><datalist id="gs-rinks"></datalist>`, 'Use “The Rinx” for home games.')}
      </div>

      <div class="gs-only-score" hidden>
        <fieldset class="gs-set gs-score" data-field="score" aria-describedby="gs-score-error">
          <legend>Final score <span class="gs-req" aria-hidden="true">*</span></legend>
          <div class="gs-row gs-goals">
            <div class="gs-field"><label for="gs-us">Rinx</label><input type="number" id="gs-us" name="rinxGoals" min="0" max="40" inputmode="numeric"></div>
            <span class="gs-dash" aria-hidden="true">–</span>
            <div class="gs-field"><label for="gs-them" class="gs-them-label">Opponent</label><input type="number" id="gs-them" name="oppGoals" min="0" max="40" inputmode="numeric"></div>
          </div>
          <p class="gs-result" aria-live="polite"></p>
          <p class="gs-error" id="gs-score-error" hidden></p>
        </fieldset>
      </div>

      <div class="gs-hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>

      <button type="submit" class="gs-submit">Submit game</button>
      <p class="gs-status" role="status"></p>
    </form>
    <div class="gs-done" tabindex="-1" hidden></div>`;
}

export default async function decorate(block) {
  const config = readConfig(block);
  const formId = ((config.form || config['submit to'] || '').match(FORM_LINK) || [])[1];
  const action = formId ? `https://docs.google.com/forms/d/e/${formId}/formResponse` : '';
  block.innerHTML = formHtml();
  const form = block.querySelector('.gs-form');
  const $ = (sel) => form.querySelector(sel);
  const status = $('.gs-status');
  const submit = $('.gs-submit');

  const ready = !!action;
  if (!ready) {
    status.textContent = 'Game submissions aren’t switched on yet. Please check back soon.';
    submit.disabled = true;
  }

  // Games already sent in, so a score can be reported for one.
  const live = loadSubmittedRows();

  const mode = () => form.elements.action.value;
  const team = () => form.elements.team.value;
  let games = [];

  const details = $('.gs-details');
  function showFields() {
    const score = mode() === 'score';
    const unlisted = $('#gs-game').value === 'other';
    form.querySelectorAll('.gs-only-score').forEach((el) => { el.hidden = !score; });
    details.hidden = score && !unlisted;
    $('.gs-time-req').hidden = score;
    $('#gs-date').max = score ? todayIso() : '';
    $('#gs-date').min = score ? '' : todayIso();
    submit.textContent = score ? 'Submit score' : 'Submit game';
  }

  function renderGames() {
    const select = $('#gs-game');
    const options = games.map((g, i) => `<option value="${i}">${esc(g.date)} · ${g.venue === 'Home' ? 'vs' : 'at'} ${esc(g.opponent)}</option>`);
    select.innerHTML = `<option value="">${games.length ? 'Choose a game' : 'No games waiting for a score'}</option>${options.join('')}<option value="other">My game isn’t listed</option>`;
    select.disabled = false;
    showFields();
  }

  async function loadTeam(key) {
    const select = $('#gs-game');
    select.disabled = true;
    select.innerHTML = '<option value="">Loading games…</option>';
    const [club, body, feeds] = await Promise.all([
      loadClubRows(), live, loadTeamGames(key).catch(() => ({ finals: [], upcoming: [] })),
    ]);
    const all = sheetGames(mergeSheetRows(club, body), key);
    const today = todayIso();
    games = all.filter((g) => g.type === 'Exhibition' && !g.result && isoDate(g.date) <= today)
      .sort((a, b) => isoDate(b.date).localeCompare(isoDate(a.date)));
    renderGames();
    // Suggestions keep names consistent, so a later score matches its game.
    const known = [...all, ...feeds.finals, ...feeds.upcoming];
    const uniq = (list) => [...new Set(list.filter(Boolean))].sort();
    $('#gs-opponents').innerHTML = uniq(known.map((g) => g.opponent || g.opp))
      .map((o) => `<option value="${esc(o)}"></option>`).join('');
    $('#gs-rinks').innerHTML = uniq(['The Rinx', ...known.map((g) => g.location)])
      .map((r) => `<option value="${esc(r)}"></option>`).join('');
  }

  function scoreLine() {
    const [us, them] = [$('#gs-us').value, $('#gs-them').value];
    const out = $('.gs-result');
    if (us === '' || them === '') { out.textContent = ''; return; }
    let word = 'Tie';
    if (+us !== +them) word = +us > +them ? 'Win' : 'Loss';
    out.textContent = `Result: ${word}, ${us}-${them}`;
    out.dataset.result = word.toLowerCase();
  }

  function setError(name, message) {
    const wrap = form.querySelector(`[data-field="${name}"]`);
    const err = wrap?.querySelector('.gs-error');
    if (!err) return;
    err.textContent = message || '';
    err.hidden = !message;
    wrap.classList.toggle('gs-invalid', !!message);
    wrap.querySelectorAll('input, select, textarea').forEach((el) => {
      if (message) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
    });
  }

  // Opponent logo: shrunk to fit 128px (keeping transparency) and sent as a
  // small data: image; the form-games workflow saves it to the site.
  let logoData = '';
  const logoInput = $('#gs-logo');
  const preview = $('.gs-logo-preview');
  function clearLogo() {
    logoData = '';
    if (logoInput) logoInput.value = '';
    if (preview) preview.hidden = true;
    setError('logo', '');
  }
  async function shrink(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 128 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    // WebP where the browser can make it, else PNG.
    const webp = canvas.toDataURL('image/webp', 0.85);
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png');
  }
  logoInput?.addEventListener('change', async () => {
    const file = logoInput.files[0];
    if (!file) { clearLogo(); return; }
    try {
      if (file.size > 15 * 1024 * 1024) throw new Error('too big');
      const data = await shrink(file);
      if (data.length > 60000) throw new Error('too big');
      logoData = data;
      preview.querySelector('img').src = data;
      preview.hidden = false;
      setError('logo', '');
    } catch {
      clearLogo();
      setError('logo', 'That image couldn’t be used. Try a PNG or JPG of the logo.');
    }
  });
  preview?.querySelector('.gs-logo-remove').addEventListener('click', clearLogo);

  function collect() {
    const v = (name) => (form.elements[name]?.value || '').trim();
    const score = mode() === 'score';
    const picked = score && /^\d+$/.test(v('game')) ? games[+v('game')] : null;
    const data = {
      action: mode(),
      team: team(),
      date: picked ? isoDate(picked.date) : v('date'),
      time: picked ? isoTime(picked.time) : v('time'),
      opponent: picked ? picked.opponent : v('opponent'),
      rink: picked ? picked.location : v('rink'),
      logo: picked ? '' : logoData,
      rinxGoals: v('rinxGoals'),
      oppGoals: v('oppGoals'),
      website: v('website'),
    };
    const errors = {};
    if (!data.team) errors.team = 'Choose 10U or 14U.';
    if (score && !v('game')) errors.game = 'Choose the game, or “My game isn’t listed”.';
    if (!picked && (!score || v('game') === 'other')) {
      const today = todayIso();
      if (!data.date) errors.date = 'Enter the game date.';
      else if (!score && data.date < today) errors.date = 'That date has passed. To send the score, choose “Report a score”.';
      else if (score && data.date > today) errors.date = 'Scores can only be sent once the game has been played.';
      if (!score && !data.time) errors.time = 'Enter the start time.';
      if (!data.opponent) errors.opponent = 'Enter the opponent’s team name.';
      if (!data.rink) errors.rink = 'Enter the rink.';
    }
    if (score) {
      const ok = (n) => /^\d{1,2}$/.test(n) && +n <= 40;
      if (!ok(data.rinxGoals) || !ok(data.oppGoals)) errors.score = 'Enter both teams’ goals.';
    }
    return { data, errors, picked };
  }

  function showErrors(errors) {
    ['team', 'game', 'date', 'time', 'opponent', 'rink', 'logo', 'score']
      .forEach((name) => setError(name, errors[name]));
    const list = Object.values(errors);
    const summary = $('.gs-summary');
    summary.hidden = !list.length;
    if (list.length) {
      summary.innerHTML = `<p>Please fix ${list.length === 1 ? 'this' : `these ${list.length} things`}:</p><ul>${list.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>`;
      summary.focus();
    }
  }

  function done(data, picked) {
    const t = TEAMS[data.team];
    const what = data.action === 'score'
      ? `Rinx ${data.rinxGoals}, ${esc(data.opponent)} ${data.oppGoals}`
      : `${esc(data.opponent)} on ${esc(new Date(`${data.date}T12:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))}`;
    const box = block.querySelector('.gs-done');
    box.innerHTML = `
      <h2>Thanks!</h2>
      <p class="gs-done-what">${what}</p>
      <p>It will show on the ${esc(t.label)} schedule${data.action === 'score' ? ' and standings' : ''} within a few minutes.${picked || data.action === 'upcoming' ? '' : ' If it duplicates a listed game, the club will tidy it up.'}</p>
      <div class="gs-done-actions">
        <a class="gs-btn gs-btn-navy" href="${t.schedulePath}">View the schedule</a>
        <button type="button" class="gs-btn gs-btn-outline gs-again">Send another</button>
      </div>`;
    form.hidden = true;
    box.hidden = false;
    box.focus();
    box.querySelector('.gs-again').addEventListener('click', () => {
      form.reset();
      clearLogo();
      form.querySelector(`input[name="team"][value="${data.team}"]`).checked = true;
      box.hidden = true;
      form.hidden = false;
      scoreLine();
      loadTeam(data.team);
      form.querySelector('input[name="action"]:checked').focus();
    });
  }

  form.addEventListener('change', (e) => {
    if (e.target.name === 'team') loadTeam(team());
    if (e.target.name === 'action' || e.target.name === 'game') showFields();
    if (e.target.name === 'game') setError('game', '');
    if (e.target.name === 'team') setError('team', '');
  });
  form.addEventListener('input', (e) => {
    if (['rinxGoals', 'oppGoals'].includes(e.target.name)) scoreLine();
    if (e.target.name === 'opponent') $('.gs-them-label').textContent = e.target.value.trim() || 'Opponent';
  });
  $('#gs-game').addEventListener('change', (e) => {
    const g = games[+e.target.value];
    $('.gs-them-label').textContent = g ? g.opponent : 'Opponent';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!ready || submit.disabled) return;
    const { data, errors, picked } = collect();
    showErrors(errors);
    if (Object.keys(errors).length) return;
    submit.disabled = true;
    status.textContent = 'Sending…';
    try {
      // Bots fill the hidden "website" field; pretend it worked.
      if (!data.website) {
        // Google doesn't let other sites read its reply ("no-cors"), so a
        // network error is the only failure we can see.
        await fetch(action, { method: 'POST', mode: 'no-cors', body: formFields(data) });
      }
      status.textContent = '';
      done(data, picked);
    } catch (err) {
      status.textContent = 'Could not send. Check your connection and try again.';
    } finally {
      submit.disabled = false;
    }
  });

  showFields();
}
