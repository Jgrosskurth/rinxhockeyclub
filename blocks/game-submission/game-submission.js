import {
  TEAMS, loadTeamGames, loadClubRows, loadSubmittedRows, mergeSheetRows, sheetGames,
} from '../../scripts/team-feeds.js';

// Families send in exhibition games: an upcoming game, or the score of one.
// The form posts to the Cloudflare relay at /api/submit-game
// (tools/game-submissions/worker.js), which adds the game to the DA sheet
// /game-submissions and publishes it; the schedule, standings and homepage
// read that sheet (scripts/team-feeds.js).
//
// Authoring: optional row "Submit to" | <another relay URL>.

const ENDPOINT = '/api/submit-game';
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
        ${field('rink', 'Rink <span class="gs-req" aria-hidden="true">*</span>', `<input type="text" id="gs-rink" name="rink" list="gs-rinks" maxlength="80" autocomplete="off" ${describe('rink', true)}><datalist id="gs-rinks"></datalist>`, 'Use “The Rinx” for home games.')}
        ${field('logo', 'Opponent logo link <span class="gs-opt">(optional)</span>', `<input type="url" id="gs-logo" name="logo" inputmode="url" maxlength="300" placeholder="https://" ${describe('logo', true)}>`, 'A link to an image of their logo.')}
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

      <fieldset class="gs-set gs-you">
        <legend>About you</legend>
        <div class="gs-row">
          ${field('name', 'Your name <span class="gs-req" aria-hidden="true">*</span>', `<input type="text" id="gs-name" name="name" maxlength="80" autocomplete="name" ${describe('name')}>`)}
          ${field('contact', 'Email or phone <span class="gs-req" aria-hidden="true">*</span>', `<input type="text" id="gs-contact" name="contact" maxlength="120" autocomplete="email" ${describe('contact', true)}>`, 'Only the club sees this, in case we have a question.')}
        </div>
        <div class="gs-code" hidden>
          ${field('code', 'Team code <span class="gs-req" aria-hidden="true">*</span>', `<input type="text" id="gs-code" name="code" maxlength="40" autocomplete="off" ${describe('code', true)}>`, 'Ask your team manager.')}
        </div>
        ${field('notes', 'Notes <span class="gs-opt">(optional)</span>', `<textarea id="gs-notes" name="notes" rows="3" maxlength="500" ${describe('notes')}></textarea>`)}
      </fieldset>

      <div class="gs-hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>

      <button type="submit" class="gs-submit">Submit game</button>
      <p class="gs-status" role="status"></p>
    </form>
    <div class="gs-done" tabindex="-1" hidden></div>`;
}

export default async function decorate(block) {
  const config = readConfig(block);
  const endpoint = config['submit to'] || ENDPOINT;
  block.innerHTML = formHtml();
  const form = block.querySelector('.gs-form');
  const $ = (sel) => form.querySelector(sel);
  const status = $('.gs-status');
  const submit = $('.gs-submit');

  // The relay says whether it is set up and whether a team code is needed.
  let ready = false;
  fetch(endpoint, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then((info) => {
      ready = !!info.ready;
      $('.gs-code').hidden = !info.codeRequired;
      if (!ready) {
        status.textContent = 'Game submissions aren’t switched on yet. Please check back soon.';
        submit.disabled = true;
      }
    });

  // Fresh submissions (so a game sent a minute ago can get its score).
  const live = loadSubmittedRows({ fresh: true });

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
      logo: picked ? '' : v('logo'),
      rinxGoals: v('rinxGoals'),
      oppGoals: v('oppGoals'),
      name: v('name'),
      contact: v('contact'),
      code: v('code'),
      notes: v('notes'),
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
      if (data.logo && !/^https:\/\/[^\s"'<>]+$/.test(data.logo)) errors.logo = 'The link must start with https://';
    }
    if (score) {
      const ok = (n) => /^\d{1,2}$/.test(n) && +n <= 40;
      if (!ok(data.rinxGoals) || !ok(data.oppGoals)) errors.score = 'Enter both teams’ goals.';
    }
    if (!data.name) errors.name = 'Enter your name.';
    if (!data.contact) errors.contact = 'Enter an email or phone number.';
    else if (!/@.+\./.test(data.contact) && (data.contact.match(/\d/g) || []).length < 7) {
      errors.contact = 'Enter a valid email or phone number.';
    }
    if (!$('.gs-code').hidden && !data.code) errors.code = 'Enter the team code.';
    return { data, errors, picked };
  }

  function showErrors(errors) {
    ['team', 'game', 'date', 'time', 'opponent', 'rink', 'logo', 'score', 'name', 'contact', 'code']
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
      <h2>Thanks, ${esc(data.name.split(' ')[0])}!</h2>
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
      const keep = { name: data.name, contact: data.contact, code: data.code };
      form.reset();
      Object.entries(keep).forEach(([k, val]) => {
        if (form.elements[k]) form.elements[k].value = val;
      });
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
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await resp.json();
      if (!body.ok) {
        const list = body.errors || ['Something went wrong.'];
        showErrors(Object.fromEntries(list.map((m, i) => [`server${i}`, m])));
        status.textContent = '';
      } else {
        status.textContent = '';
        done(data, picked);
      }
    } catch (err) {
      status.textContent = 'Could not send. Check your connection and try again.';
    } finally {
      submit.disabled = false;
    }
  });

  showFields();
}
