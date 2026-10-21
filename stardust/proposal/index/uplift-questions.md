---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-10-07T03:50:00Z
  againstInput: https://www.rinxhockeyclub.com/
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/pages/index.json
    - stardust/current/pages/index.html
    - stardust/current/brand-review.html
    - stardust/current/PRODUCT.md
---

# "What if…" candidates — https://www.rinxhockeyclub.com/

## Picked

### Variant C · Signature-gesture extension (rink diagram)
Source: catalog (#4)
What if: "What if the rink were drawn live: center line, blue lines and faceoff circles sketching themselves in as you skate down the page?"
Cinematic register: kinetic-display (auto-picked; see direction.md § Variant C)
Evidence: `blocks/hero/hero.js` draws a complete rink (red center line x=600, blue lines x=380/820, 5 faceoff circles, 2 creases) then buries it under `rect fill=#041E42 opacity=0.88` (tension T-signature-buried). The rink appears only in the hero (`_brand-extraction.json#motifs.patterns[rink-diagram-hero]`), and the red-white-red stripe appears once (`motifs.gradients[0]`).
Motion bet: the rink strokes draw on load (stroke-dashoffset), the section heads wipe in left to right like the dasher-board sign, the scoreline numerals count up to their real values, and the center red line becomes a scroll-progress spine. The IA is identical to A.

### Variant B · Live-data promotion (the scoreboard as the front door)
Source: catalog (#3)
What if: "What if the homepage opened like a scoreboard (next game, last results, both teams) instead of a poster?"
Captured trait amplified: real game data, meaning per-game scores, dates, opponents and venues (scoreline cards plus six "Game Update" news items) that currently live below the fold.
Evidence: `pages/index.html` recent-results has Sep 27 Long Beach Lightning 10–2 W, Sep 20 North Park 13–0 W, and Sep 13 Peconic Wildcats 8–2 W (10U). The news slider has 14U 7–1 over Peconic (Oct 3) and 5–1 over North Park (Sep 26). The next 10U game is real (GameSheet season 16150: Fri Oct 9, 5:05p vs Delco Phantoms, Hatfield Ice Arena). Tension T-hero-no-action shows none of this in the first viewport.
Composition bet: a split hero with the wordmark on the left and a scoreboard panel on the right (next game + last 3 per team). Below it, a two-team results board replaces the 10U/14U tab, and news becomes a dated "game log" list instead of a carousel. The IA reorders around the season; the content set stays the same.

## Disqualified

- **Display-typography amplification (#1)**: disqualified because the trigger doesn't fire. Barlow Condensed is not reserved for small uses; it already carries every heading, nav label, button and badge (100% of headings are uppercase display, `voiceTable.toneMetrics`). There's no underused scope to promote.
- **Photography re-foregrounding (#2)**: disqualified because the captured photos are real team photos at only 720px wide (`r1-720`, `14u-720`, `4D0F41DF-…-720`) and a 680px facility shot. Running them at editorial scale (≥1200px) would expose softness and upscaling. Promoting them modestly is part of A's Instagram fix instead.
- **Audience-routing reframe (#7)**: disqualified because the above-the-fold region has zero CTA verbs in the hero; the compression is in the nav (10 items), not in competing hero intents. The fix is adding one path (A, item 1), not untangling several.

## Considered but not picked

- **Color-ladder re-weighting (#6)**: red `#C8102E` covers about 198 occurrences against navy's 2,095 (under 10%), so the trigger fires. Not picked because a red-ground B would read as a pure colorway change without addressing a tension. B's live-data bet tackles T-hero-no-action directly.
- **Motif vocabulary swap (#8)**: cards dominate while the staff list uses an indexed-bar primitive once. B partly absorbs this (news becomes a dated list). As a standalone bet it is weaker than live data.
- **Voice-register pivot (#5)**: the voice has two tones, competitive scorelines and development/community ("heart, hustle, and Rinx pride"). The community tone appears only in the About paragraph. That is a weak contrast with too little copy to foreground without inventing new text.
