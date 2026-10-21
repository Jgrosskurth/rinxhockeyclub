---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-10-16T19:45:00Z
  againstInput: https://www.rinxhockeyclub.com/roster
  page: roster
  readArtifacts:
    - stardust/uplift-improvements.md
    - stardust/uplift-questions.md
    - stardust/.work/roster-data.json
    - stardust/proposal/index/PRODUCT.md
  phrase: "uplift presales redesign — three variants per stardust/direction.md (roster)"
  mode: "A (brand-faithful: palette + typography pinned)"
  handsOff: true
  previousDirection: "homepage uplift (2026-10-07) archived at stardust/proposal/index/direction.md"
---

# Direction — Rinx Hockey Club roster page uplift

**Mode A, brand-faithful.** The palette and type are the same pinned set as the homepage uplift: navy #041E42, Rinx red #C8102E, ice #E8F0F9, arena gray #F5F6F8, white, and the AA refinements slate #4B5563 and win-green #15803D. Barlow Condensed 700/900 is uppercase display; Barlow 400 is body.

**Content rules.**
- Every name, number, position, photo and coach comes from the captured page.
- Stats come only from `data/stats-lihockey-10u.json` (league) and `data/stats-mid-atlantic.json` (tournament), joined by name in `stardust/.work/roster-data.json`. Players without a line show "No games logged yet", never zeros.
- The league feed records 0 assists for everyone, which is a source gap, so league lines show GP · G · PTS only.
- **Authorized rewrites:** the position group headings read "Forwards", "Defense", "Goalies" and "Reserves" (the captured label "Offense" is the club's word for forwards; the card keeps "Offense"). Players are sorted by jersey number within each group.

**IA priorities to preserve:** (1) every player findable by name and number, (2) the coaching staff, (3) the season/team subtitle, (4) the global header with Shop Gear.

**Density:** balanced (64/48/32px section padding).

**ia-fidelity:** reimagined ("what if" variants).

## Variant A — Faithful + improvements

Role: risk-averse green-light. "Yes, that's our roster, fixed."
Composition: same page order (title → players → coaching staff). Players are grouped by position and sorted by number (#3). Cards show a 3:4 portrait photo (#7), a big jersey number (#2) and the name, with AA position labels (#4). The grid is 2 columns on phones, 3 on tablets and 5 on desktop (#1). Coaches use compact cards in the same family (#6). A "Season stats →" link in the header (#5).
Motion: static.

## Variant B — What if the roster were a set of hockey cards?

Role: design-team motivator.
What if: "What if each player's card carried their real season line, and the page opened with the team leaders?"
Captured trait amplified: real player stats (league + Mid-Atlantic tournament).
Evidence: improvement #5. 17 of 20 players have a stat line; both goalies have tournament GAA/SV%.
Composition: the title row gets a League / Mid-Atlantic toggle (CSS-only radio). A **Team leaders** strip comes first (top points in the selected set, goalie record), then position-grouped trading cards: portrait, number, name, a stat line (GP · G · PTS, or tournament GP · G · A · PTS; goalies W-L · GAA · SV%). Coaches follow as a staff row. Cards show both stat sets via the toggle.
Motion: static.

## Variant C — What if motion was part of the identity?

Role: visionary pitch.
What if: "What if every jersey number flipped into place like an arena scoreboard as the lineup came on the ice?"
Cinematic register: kinetic-display (same personality mapping as the homepage: display-typography-signature).
Captured trait amplified: display-typography amplification, the jersey number (candidate #1). Its 11.2px size makes the number the most underused display element on the page.
Composition: identical IA to A.
Motion: cinematic, kinetic-display. Each position group's head wipes in like a sign. Its numbers split-flap to their real values as the group enters. Cards reveal with one-shot hard clip-path wipes (no opacity fades). Everything is neutralized under reduced motion and without JS.
