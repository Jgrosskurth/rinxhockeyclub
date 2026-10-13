<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-10-07T12:31:01Z
  page:             index
  pageUrl:          https://www.rinxhockeyclub.com/
  variant:          B
  againstDirection: stardust/direction.md (Resolution 2026-10-07T12:31:01Z)
  consumedBy:       impeccable:craft
  readArtifacts:    [stardust/current/pages/index.json, stardust/current/_brand-extraction.json, DESIGN-B.md, DESIGN-B.json, stardust/direction.md, stardust/prototypes/index-improvements.md, data/*.json]
  stardustVersion:  0.10.0
-->
---
slug: index
url: https://www.rinxhockeyclub.com/
register: brand
variant: B
surprise: medium
dominantDimension: ia-priority (live data leads)
handsOff: true   # uplift runs without a brief-confirmation gate; the brief is its own record
---

# Page shape: home — Variant B (What if game day was the hero?)

This variant amplifies **live GameSheet data** (captured: liveData.feeds; T-hero-static) in service of PRODUCT.md principle 1 "Lead with game day". Improvements 1–7 honoured as a floor. Anchor: nycfc.com next-match hero + fixture rail.

## Sections (in render order)
1. **header** — as A (team-first nav, Shop Gear).
2. **matchday-hero** — split, 5/7: **left** compact identity over the rink diagram (crest, pill "2026–2027 Season", H1 "Rinx Hockey Club" at display scale, line "Travel Hockey • Long Island, New York"); **right** a **Next up** scoreboard panel with a 10U Squirts / 14U Bantam segmented toggle: event/competition label, big date + time numerals, "Rinx vs/at Opponent" with both crests, rink, an "Add to calendar" + "Full schedule" pair, and a one-line "Last result: W 10-2 vs Long Beach Lightning". 14U pane rendered (hidden) for the toggle.
3. **fixture-rail** — full-width navy-light band directly under the hero: chronological chips for both teams — last 3 finals (W badge, score) and next 3 games (date, time, rink), each tagged 10U/14U. Horizontal scroll-snap on mobile.
4. **standings** — "Standings" snapshot: two compact tables side by side (10U division 04 - 10U SILVER, 14U division 12- 14U SILVER), top 5 rows each with Rinx row highlighted, columns # · Team · GP · W-L-T · PTS; link "Full standings".
5. **news** — Game Update cards, contained 3-up (as A).
6. **club-band** — one band telling the club story compactly: goalie photo + H2 "About Our Team" + first paragraph; coaches as a row of 4 avatars with names/roles; facility line with address, phone and Get Directions.
7. **instagram** — link band (as A).
8. **footer** — as A.

## Layout strategy
Hero split 5/7 at ≥ 900px, stacks (identity first, then Next up) below. Standings tables 2-up ≥ 900px, stacked below. Section padding 64/48/32.

## Key states
Next-up toggle default 10U (the next puck drop overall). Empty state (no upcoming game) would read "Season schedule coming soon" — not rendered.

## Interaction model
Toggle = two buttons with aria-pressed swapping `hidden` on panes (tiny inline script permitted? NO — use CSS :has() with radio inputs, no JS). Rail native scroll-snap.

## Data attributes
- `section[data-section="matchday-hero"][data-intent="drive action"][data-layout="split-media"][data-interactive="tabs"]`
- `section[data-section="fixture-rail"][data-intent="live results"][data-layout="edge-to-edge"][data-items="12"]`
- `section[data-section="standings"][data-intent="live results"][data-layout="grid"][data-items="2"]`
- others as A (news, club-band split-media, instagram, footer)

## Unsourced content (placeholder list)
- Instagram handle (as A).
- Opponent records for upcoming games are not in the feeds → omitted (not placeholdered; not demanded).

## Open questions for craft
- Countdown: show "in N days" computed from the snapshot date? → NO (would go stale); show the date big instead.
## Live data snapshot (feeds as of 2026-10-07T12:31:01Z; source for all scores, dates, records)
- 10U Squirts — standings `data/standings-10u.json`: 1st, 04 - 10U SILVER, 3-0-0, 6 PTS.
  Last result `data/schedule-10u.json`: Sep 27, 2026 · W 10-2 vs Long Beach Lightning · The Rinx (home).
  Earlier: Sep 20 W 13-0 vs North Park (The Rinx); Sep 13 W 8-2 at Peconic Wildcats (Peconic Ice Rink).
  Next `data/schedule-mid-atlantic.json`: Oct 9, 2026 · 5:05 PM · vs Delco Phantoms · Hatfield Ice Arena (Blue) · Mid-Atlantic Fall Showcase.
  Then `data/schedule-10u.json`: Oct 17 · 8:30 AM · at Long Beach Lightning · Long Beach Arena.
- 14U Bantam — standings `data/standings-14u.json`: 1st, 12- 14U SILVER, 4-0-0, 8 PTS.
  Last result `data/schedule-14u.json`: Oct 3, 2026 · W 7-1 vs Peconic Wildcats · The Rinx (home).
  Earlier: Sep 26 W 5-1 vs North Park; Sep 13 W 7-0 vs Great Neck Bruins.
  Next: Oct 18, 2026 · 11:40 AM · vs Long Island Sharks · The Rinx (home). Then Oct 24 · 6:30 PM · at Great Neck Bruins · Parkwood Ice Rink.
Opponent logos: as on the live site (MHR CDN / GameSheet CDN / /images/*), see scripts/team-logos.js.
## Captured content (verbatim from stardust/current/pages/index.json)
- Brand: "Rinx Hockey Club" · strap "Tier III/A • Travel Hockey • LIAHL" · hero line "Travel Hockey • Long Island, New York" · pill "2026–2027 Season".
- Nav: Home · Roster (10U Squirts, 14U Bantam) · Schedule (10U, 14U) · Stats (10U, 14U) · Standings (10U, 14U) · Tournaments · Sponsors · Clinics · Contact · Shop Gear (https://rinxspring2026.itemorder.com/shop/home/).
- News cards (tag "Game Update"): "14U Remains Undefeated" — "14U powers through Peconic, winning 7-1 at the Rinx" (October 3, 2026); "10U Pours on the Goals" — "10U overwhelmed Long Beach flooding the back of the net in a 10-2 victory" (September 27, 2026); "14U Keep Rolling" — "14U takes the early lead and holds off North Park 5-1" (September 26, 2026); "10U Landslide Victory" — "10U dominates North Park 56 SOG to 2, winning 13-0" (September 21, 2026); "Comeback Tie" — "14U come back from behind in the 3rd to tie" (September 21, 2026); "Clean Sweep" — "10U and 14U sweep the weekend with 4 total wins" (September 13, 2026).
- Recent Results (10U): Sep 27 Long Beach Lightning 10-2 W (The Rinx); Sep 20 North Park 13-0 W (The Rinx); Sep 13 Peconic Wildcats 8-2 W (@ Peconic Ice Rink). CTA "View Full Schedule →" (/schedule).
- About: H2 "About Our Team", H3 "2026–2027 Rinx Hockey Club", paragraphs: "The Rinx 10U Squirts travel hockey team represents the best young talent from the Long Island area, competing at the Tier III/A level. Based out of The Rinx in Hauppauge, New York, our program is dedicated to developing elite young players both on and off the ice." / "This season, our roster features dedicated players, led by an experienced coaching staff committed to skill development, teamwork, and competitive excellence. From the first whistle to the final buzzer, our Squirts play with heart, hustle, and Rinx pride."
- Photos: /images/r1-720.webp (goalie in action), /images/4D0F41DF-57C2-45F0-A459-86825254D41B-720.webp (B&W team huddle), /images/14u-720.webp (14U team photo with trophy).
- Coaching Staff: Dan O'Donoghue — Head Coach • 10U Squirts; Greg Skillman — Head Coach • 14U Bantam; Joe Capozzoli — Assistant Coach • 10U, 14U; Jon Mazzarone — Assistant Coach • 14U Bantam (headshots /images/headshots/{coachdan,coachskillman,joecap,coachmazz}.webp).
- Our Facility: "Located at 660 Terry Road, Hauppauge, The Rinx features two full-size indoor NHL rinks, a pro shop, skate sharpening, and year-round programming on 97 acres of Hidden Pond Park." · Phone (631) 232-3222 · "Get Directions — Open in Maps →" · facility panorama image (live media_1a149b94….webp).
- Instagram: H2 "Follow Us on Instagram".
- Footer: "Rinx Hockey Club • Long Island, NY" · Home · Roster · Schedule · Stats · Tournaments · Sponsors · Clinics · Shop Gear · Contact · "The Rinx • 660 Terry Road, Hauppauge, NY 11788 • (631) 232-3222" · "© 2026 Rinx Hockey Club. All rights reserved."

## _provenance
```yaml
capturedSourceLineage:
  - { section: header, from: "_brand-extraction.json#systemComponents[kind=header]" }
  - { section: matchday-hero, from: "pages/index.json hero (identity) + direction-authorized new 'Next up' panel (direction.md Variant B) fed by data/schedule-*.json" }
  - { section: fixture-rail, from: "direction-authorized new (Variant B composition) — consolidates captured Recent Results + schedule feeds" }
  - { section: standings, from: "direction-authorized new (Variant B) — data/standings-*.json (site already renders these on /standings)" }
  - { section: news, from: "pages/index.json news-slider" }
  - { section: club-band, from: "pages/index.json about + columns (consolidated)" }
  - { section: instagram, from: "pages/index.json instagram H2" }
  - { section: footer, from: "_brand-extraction.json#systemComponents[kind=footer]" }
antiTemplatePass:
  - { pattern: hero, defaultReflex: "hero-then-bands silhouette", alternatives: ["centered wordmark + strip (A)", "full-bleed scoreboard", "split identity | next-up panel"], picked: "split identity | next-up panel", rationale: "live data is the captured underused trait", reference: "https://www.nycfc.com/ next-match hero" }
  - { pattern: results cards, defaultReflex: "3-up card grid", alternatives: ["fixture rail chips", "results table"], picked: "fixture rail", reference: "https://www.nhl.com/islanders scoreboard rail" }
  - { pattern: about/coaches/facility, defaultReflex: "three stacked cards", alternatives: ["one condensed club band", "tabs"], picked: "condensed club band", rationale: "demotes club story below game day per IA priority" }
nonTemplateMove: "substrate-promotion — navy-light fixture rail becomes a structural band (medium budget: one cliché replaced)"
substrateTransitions: { default: "boards off-white", exceptions: ["hero + fixture rail navy (one continuous dark block)", "standings ice band"] }
voiceClassification:
  - { section: matchday-hero, classification: captured-verbatim, note: "'Next up', 'Last result', 'Add to calendar', 'Full schedule' = direction-authorized rewrite; values = live feeds" }
  - { section: fixture-rail, classification: captured-verbatim, note: "values from feeds" }
  - { section: standings, classification: captured-verbatim, note: "values from feeds; 'Standings', 'Full standings' labels direction-authorized" }
  - { section: news, classification: captured-verbatim }
  - { section: club-band, classification: captured-verbatim }
  - { section: instagram, classification: captured-verbatim }
  - { section: header, classification: captured-verbatim }
  - { section: footer, classification: captured-verbatim }
signatureElements:
  - { kind: motif, capturedSource: "inline rink SVG", mechanism: "kept behind the identity half of the split hero", fallback: "n/a" }
compositionDelta_vs_A: ["hero-layout: centered wordmark → split identity | next-up panel", "section-presence: + fixture rail, + standings snapshot", "section-order: club story condensed and moved after news"]
compositionDelta_vs_C: ["hero-layout: split panel vs full-bleed kinetic rink", "section-presence: fixture rail + standings vs results ribbon", "ia-priority: live data leads vs club identity leads"]
```
