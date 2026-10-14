# Exhibition game submissions: Google Sheet setup

The form at **/submit-game** sends each game to a Google Sheet you own. The
website then picks the games up automatically (every 15 minutes, or within a
couple of minutes with step 6).

## 1. Create the sheet

1. Go to [sheets.new](https://sheets.new) and name it **Rinx exhibition submissions**.
2. **Extensions → Apps Script.**
3. Delete what is in `Code.gs`, paste the whole of [`Code.gs`](./Code.gs) from this
   folder, and click **Save**.
4. Pick **setup** in the function menu at the top and click **Run**. Approve the
   permissions Google asks for. A **Submissions** tab with the column headings
   appears in the sheet.

## 2. Settings (optional)

In Apps Script, **Project Settings (gear) → Script properties → Add script property**:

| Property | Value |
|---|---|
| `TEAM_CODE` | A code families must type in to submit, e.g. `rinx26`. Leave it out to allow anyone with the link. |
| `NOTIFY_EMAIL` | Who gets an email for each submission, e.g. `info@therinx.com` (comma-separate several). |

## 3. Publish the script

1. **Deploy → New deployment.** Click the gear next to "Select type", choose **Web app**.
2. Description: `Game submissions`. **Execute as: Me.** **Who has access: Anyone.**
3. Click **Deploy**, then copy the **Web app URL** (it ends in `/exec`).

## 4. Connect the website

1. Open the **submit-game** page in Document Authoring.
2. In the **Game Submission** block, paste the Web app URL next to **Submit to**.
3. Preview and publish the page.

## 5. Day to day

- Every submission is a new row: upcoming games, and score reports (Action `Score`).
- Fix a typo by editing the cell. To take a row off the website, type **Hide** in
  its **Status** cell.
- Your **other-games** sheet always wins. A submitted score only fills in a game
  that has no score yet in other-games.
- If you change `Code.gs` later: **Deploy → Manage deployments → Edit → Version:
  New version → Deploy**. The URL stays the same.

## 6. Faster updates (optional)

Without this, games appear within about 15 minutes. To make it about 2 minutes:

1. On GitHub: **Settings → Developer settings → Fine-grained tokens → Generate new
   token**. Repository access: only **Jgrosskurth/rinxhockeyclub**. Permissions:
   **Contents: Read and write**. Copy the token.
2. Add it in Apps Script as a script property named `GITHUB_TOKEN`.

Keep the token only in the script properties. Don't put it on the website or
send it to anyone.
