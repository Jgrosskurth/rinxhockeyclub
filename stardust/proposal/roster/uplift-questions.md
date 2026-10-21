---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-10-16T19:35:00Z
  againstInput: https://www.rinxhockeyclub.com/roster
  readArtifacts:
    - stardust/current/pages/roster.json
    - stardust/.work/roster-probe.json
    - stardust/current/_brand-extraction.json
    - stardust/proposal/index/PRODUCT.md
    - data/stats-lihockey-10u.json, data/stats-mid-atlantic.json (origin/main)
---

# "What if…" candidates — https://www.rinxhockeyclub.com/roster

## Picked

### Variant C · Display-typography amplification (the jersey number)
Source: catalog (#1)
What if: "What if every player's jersey number were the card, a big Barlow Condensed numeral that flips into place like an arena scoreboard?"
Cinematic register: kinetic-display (same brand personality as the homepage run: display-typography-signature)
Evidence: on this page the display family is used at 11.2px for the one element it was made for. `.player-num` "#4" is 11.2px/900 gray under a 16px name (probe), while the H1 sets the same family at 72px/900. The trigger fires: display type reserved for a tiny use.
Motion bet: numbers split-flap (`[data-flip]`) to their real values as each position group enters, group heads wipe in like signs, and the photo cards reveal with hard wipes. IA identical to A.

### Variant B · Live-data promotion (the roster as trading cards)
Source: catalog (#3)
What if: "What if the roster read like a set of hockey cards, each player's card carrying their real season line?"
Captured trait amplified: the club's real player stats, which the roster never shows.
Evidence: `data/stats-lihockey-10u.json` has league GP/G/A/PTS for 14 players (e.g. Matthew Grosskurth 3 GP, 7 G, 7 PTS). `data/stats-mid-atlantic.json` has tournament lines for 16 players plus 2 goalies (Rinx won the 10A division 4-0). Improvement #5.
Composition bet: a team leaders strip (top scorers from the league feed), then position-grouped cards with portrait photo, big number and a stat line (GP · G · A · PTS) with a League / Mid-Atlantic toggle, coaches as a staff row. The IA changes (leaders strip added, stats on cards); the content set does not.

## Disqualified

- **Photography re-foregrounding (#2)**: disqualified as a bet. The headshots are real, but they're 199×241 sources, below editorial scale. Showing them larger as 3:4 portraits is already improvement #7 (A).
- **Signature-gesture extension (#4)**: the rink diagram is the homepage hero's signature and doesn't appear on the roster page. Amplifying it here would import a motif the page lacks, not extend one it has.
- **Audience-routing reframe (#7)**: one audience (families and players looking themselves up). Nothing to untangle.

## Considered but not picked

- **Motif vocabulary swap (#8)**: card grid → lineup board (lines L1/L2/D-pairs). Strong hockey move, but line assignments aren't published anywhere captured, so it would invent data. Folded into B as position grouping only.
- **Color-ladder re-weighting (#6)**: navy cards on navy ground. A colorway change without a tension behind it.
- **Voice-register pivot (#5)**: the roster has almost no copy; nothing to pivot.
