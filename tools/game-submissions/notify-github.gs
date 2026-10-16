/**
 * Tells GitHub to sync the site as soon as the game-submissions responses
 * sheet changes, instead of waiting for the scheduled run (GitHub delays busy
 * scheduled jobs, in practice to every 4-5 hours).
 *
 * Each new form response, and each edit to the sheet (fixing a typo, typing
 * Hide in the Status column, deleting a row), sends a repository_dispatch
 * "form-games" event. That runs .github/workflows/form-games.yml, which saves
 * data/form-games.json and rebuilds the team calendars.
 *
 * Paste this into the responses sheet (Extensions > Apps Script) and follow
 * the setup steps in README.md. The GitHub token lives in Script properties,
 * never in this code: the sheet itself is published to the web.
 */

const REPO = 'Jgrosskurth/rinxhockeyclub';
const EVENT = 'form-games';
// Several quick edits (or a submission plus its edit) send one ping.
const QUIET_SECONDS = 20;

/** Run once from the editor: installs the triggers (safe to run again). */
function setup() {
  const ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers()
    .filter((t) => ['onResponse', 'onSheetChange'].includes(t.getHandlerFunction()))
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onResponse').forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger('onSheetChange').forSpreadsheet(ss).onChange().create();
  notifyGitHub_('setup');
}

function onResponse() {
  notifyGitHub_('form submission');
}

function onSheetChange(e) {
  // Formatting-only changes don't affect the site.
  if (e && e.changeType === 'FORMAT') return;
  notifyGitHub_(`sheet change (${e ? e.changeType : 'unknown'})`);
}

/** Sends the dispatch event, at most once per QUIET_SECONDS. */
function notifyGitHub_(reason) {
  const cache = CacheService.getScriptCache();
  if (cache.get('pinged')) return;
  cache.put('pinged', '1', QUIET_SECONDS);

  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) {
    console.warn('GITHUB_TOKEN script property is not set; the site will catch up on the scheduled run.');
    return;
  }
  const resp = UrlFetchApp.fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({ event_type: EVENT, client_payload: { reason } }),
    muteHttpExceptions: true,
  });
  const code = resp.getResponseCode();
  // 204 = accepted. 401/403/404 usually mean the token expired or lacks
  // Contents: Read and write on the repository.
  if (code !== 204) console.error(`GitHub dispatch failed (${code}): ${resp.getContentText()}`);
  else console.log(`Asked GitHub to sync (${reason}).`);
}
