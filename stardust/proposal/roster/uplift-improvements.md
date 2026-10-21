---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-10-16T19:30:00Z
  againstInput: https://www.rinxhockeyclub.com/roster
  readArtifacts:
    - stardust/current/pages/roster.json
    - stardust/current/pages/roster.html
    - stardust/current/assets/screenshots/roster.png
    - stardust/current/assets/screenshots/roster-mobile.png
    - stardust/.work/roster-probe.json
    - stardust/current/_brand-extraction.json
    - blocks/roster/roster.js (origin/main)
    - data/stats-lihockey-10u.json, data/stats-mid-atlantic.json (origin/main)
  referenceResearchNote: "No Refero MCP or WebSearch in this runtime; improvements rest on captured evidence (same as the homepage run)."
---

# Improvements — https://www.rinxhockeyclub.com/roster

1. **[ia-clutter]** On phones the roster is a 20-screen scroll. At 390px the grid collapses to 1 column: 20 full-width cards about 210px each, a 5,147px page, with only 3 players per viewport (roster-mobile.png). · Pattern at fault: desktop card grid stacked unchanged on phones. · fix: a compact 2-column grid on phones (photo, number, name, position), so the whole team fits in about 4 screens.

2. **[missed-opportunity]** Jersey numbers, the team's on-ice identity, are the smallest type on the card: `.player-num` "#4" is 11.2px/900 in gray (#6B7280) under a 16px name (probe). · Pattern at fault: number treated as metadata. · fix: set the number as a large Barlow Condensed 900 numeral on the card (≥ 40px), with the name beneath.

3. **[ia-clutter]** The roster has no order a coach or parent would use. It's alphabetical by last name except the two Reserves at the end, so 10 Offense, 6 Defense and 2 Goalies are interleaved (probe order). · Pattern at fault: unsorted flat list. · fix: group by position, Forwards then Defense then Goalies, with Reserves flagged, and sort by jersey number inside each group with a count per group.

4. **[contrast-or-density]** Position pills are unreadable at 9.6px, and the Goalie pill fails contrast: white on #16A34A is 3.30:1. The subtitle "2026–2027 Season • …" is #6B7280 on #F5F6F8 at 4.47:1, below AA (probe). · Pattern at fault: tiny colored pills. · fix: position labels at ≥ 12px with AA pairs (goalie green #15803D at 5.02:1, as on the homepage proposal) and the subtitle in slate #4B5563 (6.99:1).

5. **[missed-opportunity]** Real player stats exist but the roster ignores them. `data/stats-lihockey-10u.json` has league GP/G/A/PTS for 14 players, and `data/stats-mid-atlantic.json` has tournament stats for 16 players and 2 goalies. The roster links to neither, and the Stats page is a separate nav item. · Pattern at fault: roster and stats as unrelated pages. · fix (A): a "Season stats →" link in the roster header. (B goes further.)

6. **[contrast-or-density]** The Coaching Staff block is two 548px-wide navy bars, each about 70% empty (screenshot). · Pattern at fault: full-width bars for two short items. · fix: compact coach cards matching the player cards (photo, name, role), sized to content.

7. **[missed-opportunity]** Headshots are cropped to 70px circles from 199×241 portrait sources (probe imgNatural vs rendered), so faces are about a third of the available pixels. · Pattern at fault: avatar-sized photos on a page whose purpose is the people. · fix: portrait photos at about 3:4 on the card, using the full height of the source.
