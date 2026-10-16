# Exhibition game submissions (Google Form)

Families send games on the **Submit a game** page (/submit-game). The page's
form sends each answer to the club's Google Form (its link is in the **Form**
row of the block in Document Authoring), so they land in the form's responses
sheet. The site's form uses the Google Form's question IDs; if you add, delete
or recreate a question in the Google Form, the IDs in
`blocks/game-submission/game-submission.js` (ENTRY) need updating too. Renaming
a question or editing its help text is fine, but keep the choice wording
(10U / 14U, Upcoming Game / Score Report) exactly as it is.

In the Google Form's **Settings → Responses**, keep **Collect email addresses**
and **Restrict to users in your organization** off, or submissions from the
site are rejected.

- The form's responses sheet is published to the web as CSV.
- The schedule, standings and homepage read that published sheet directly
  (`scripts/team-feeds.js`), so a game shows within a minute or two of being
  sent. If Google doesn't answer within 4 seconds they use
  `data/form-games.json` instead.
- `.github/workflows/form-games.yml` runs `.github/scripts/pull_form_games.py`,
  which saves the responses to `data/form-games.json` (the fallback copy), then
  rebuilds the team calendars (`data/calendar-*.ics`). It runs right away when
  the responses sheet pings GitHub (see **Instant sync** below), and also on a
  15-minute schedule as a backup. GitHub delays busy scheduled jobs, in practice
  to every 4-5 hours, so without the ping a game can take hours to reach the
  calendars. **Run workflow** in the Actions tab also works.

## Instant sync (one-time setup)

`notify-github.gs` makes the responses sheet tell GitHub to sync the moment a
game is submitted or the sheet is edited (a typo fixed, **Hide** typed, a row
deleted).

1. Make a GitHub token: GitHub → Settings → Developer settings → Fine-grained
   tokens → **Generate new token**. Set Repository access to **Only select
   repositories** → `Jgrosskurth/rinxhockeyclub`, and under Repository
   permissions set **Contents: Read and write**. Copy the token.
2. Open the form's responses sheet → **Extensions → Apps Script**. Paste the
   contents of `notify-github.gs` into `Code.gs` and save.
3. **Project Settings** (gear icon) → **Script properties** → **Add script
   property**: name `GITHUB_TOKEN`, value the token. Save.
4. Back in the editor, pick **setup** in the function menu and click **Run**.
   Approve the permissions Google asks for (it's your own script). The run
   sends a first ping. Within a minute, the Actions tab shows a **Google Form
   games** run triggered by `repository_dispatch`.

When the token expires, make a new one and replace the `GITHUB_TOKEN` value
(step 3). Until then, games still sync on the backup schedule. The script's
**Executions** page shows "GitHub dispatch failed (401)" when the token has
expired.
- Your
  **other-games** sheet in Document Authoring always wins: a form score only fills
  in a game that has no score there yet.

## Form questions

Team (10U / 14U) · Upcoming game or Score report · Date · Start Time · Opponent ·
Ice Rink · Rinx Score · Opponent Score.

Renaming a question slightly is fine. Don't ask for names, emails or phone
numbers: the published responses sheet is public.

## Day to day

- **Fix a typo:** edit the cell in the responses sheet.
- **Take a game off the site:** add a **Status** column to the responses sheet and
  type **Hide** in that game's row.
- **Changing the form link:** edit the **Form** row of the block on the
  submit-game page in Document Authoring, then publish the page.
- **If you un-publish the sheet or change the published CSV link:** update
  `CSV_URL` in `.github/scripts/pull_form_games.py`.
