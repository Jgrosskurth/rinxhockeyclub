# Exhibition game submissions (Google Form)

Families send games through the club's Google Form. The **Submit a game** page
(/submit-game) links to it.

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
