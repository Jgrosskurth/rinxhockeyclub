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
- Every 15 minutes, `.github/workflows/form-games.yml` runs
  `.github/scripts/pull_form_games.py`, which turns the responses into
  `data/form-games.json`.
- The schedule, standings, homepage and team calendars read that file. Your
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
