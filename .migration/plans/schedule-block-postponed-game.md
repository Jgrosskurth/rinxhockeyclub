# DA Content Update — Mark Apr 25 Game as Postponed

## Summary
The schedule block code is already deployed with postponed game support. The only remaining step is updating the DA content to change the Apr 25 game result from "—" to "PPD". The IMS token expired during the last session so the DA upload failed.

## Current State
- **Code**: Deployed and live — schedule block handles PPD result with strikethrough date, red badge, faded card
- **DA Content**: Still shows "—" for Apr 25 game — needs to be changed to "PPD"

## What's Needed
A fresh IMS token to upload the updated DA content, OR the user can make the change manually in the DA editor.

## Checklist
- [x] Add postponed detection logic to schedule block JS
- [x] Add postponed CSS (strikethrough, red PPD badge, faded card)
- [x] Commit and push code changes
- [x] Publish code to live
- [ ] Upload updated DA content with "PPD" for Apr 25 game (requires fresh IMS token or manual DA edit)
- [ ] Preview/publish updated content from DA

## How to Complete Manually (if token unavailable)
1. Go to **da.live** → open **index** page
2. Find the Schedule table → **Apr 25** row
3. Change the last cell from **—** to **PPD**
4. Click **Preview**

## Implementation Note
Execution requires **Execute mode** and a valid IMS token. Alternatively, the user can complete the single DA edit manually in under 30 seconds.
