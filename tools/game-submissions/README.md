# Exhibition game submissions: setup

The form at **/submit-game** sends each game to a small relay on Cloudflare
(`worker.js` in this folder). The relay adds it as a row to the Document
Authoring sheet **game-submissions** and publishes that sheet, so the game shows
on the schedule, standings and homepage within a few minutes. The family's name,
contact and notes go to **game-submissions-contacts**, which is never published.

Until steps 1–3 are done, the form says "Game submissions aren't switched on
yet."

## 1. Adobe service account (Adobe Developer Console)

1. Go to <https://developer.adobe.com/console> and sign in with the Adobe ID you
   use for Document Authoring.
2. **Create new project** → **Add API** → **Edge Delivery Services** → choose
   **OAuth Server-to-Server** → **Save configured API**.
3. Open the new credential. Note down:
   - **Client ID**
   - **Client secret** (click *Retrieve client secret*)
   - **Scopes** (the list shown on the credential page)
   - **Technical account email** (ends in `@techacct.adobe.com`)

Keep the client secret private: it goes only into Cloudflare in step 3, never
into the website, an email, or a chat.

## 2. Let the service account edit the two sheets

Send the **technical account email** (not the secret) to whoever manages the
site and they can add it, or add it yourself in
<https://da.live/config#/jgrosskurth/> on the **permissions** sheet:

| path | groups | actions |
|---|---|---|
| /game-submissions | *technical account email* | write |
| /game-submissions-contacts | *technical account email* | write |

## 3. Cloudflare Worker

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker**.
   Name it `rinx-game-submissions` → **Deploy**.
2. **Edit code**, replace everything with the contents of `worker.js`, **Deploy**.
3. **Settings → Variables and Secrets** → add:

   | Name | Type | Value |
   |---|---|---|
   | `ADOBE_CLIENT_ID` | Secret | Client ID from step 1 |
   | `ADOBE_CLIENT_SECRET` | Secret | Client secret from step 1 |
   | `ADOBE_SCOPES` | Text | Scopes from step 1, comma separated |
   | `TEAM_CODE` | Secret | Optional: a code families must type in, e.g. `rinx26` |

4. **Settings → Domains & Routes → Add → Route**: zone `rinxhockeyclub.com`,
   route `www.rinxhockeyclub.com/api/submit-game`.

## 4. Check it

- Open <https://www.rinxhockeyclub.com/api/submit-game>. It should show
  `"ready":true`.
- Submit a test game on /submit-game. It appears as a row in the
  **game-submissions** sheet in DA, and on the team schedule within a few minutes.
- Remove the test: type **Hide** in its **Status** cell and **Publish** the sheet.

## Day to day

- Your **other-games** sheet always wins. A submitted score only fills in a game
  that has no score yet in other-games.
- To fix a typo, edit the cell in **game-submissions** and **Publish** the sheet.
  To take a game off the site, type **Hide** in its Status cell and Publish.
- Avoid editing game-submissions at the exact moment a family submits; the
  later save wins.
- Names and contact details are in **game-submissions-contacts**. Don't publish
  that sheet.
