<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-10-07T12:31:01Z
  page:             index
  pageUrl:          https://www.rinxhockeyclub.com/
  variant:          C
  againstDirection: stardust/direction.md (Resolution 2026-10-07T12:31:01Z)
  consumedBy:       impeccable:craft
  readArtifacts:    [stardust/current/pages/index.json, stardust/current/_brand-extraction.json, DESIGN-C.md, DESIGN-C.json, stardust/direction.md, stardust/prototypes/index-improvements.md, data/*.json]
  stardustVersion:  0.10.0
-->
---
slug: index
url: https://www.rinxhockeyclub.com/
register: brand
variant: C
surprise: high
dominantDimension: motion (rink gesture as kinetic system)
handsOff: true   # uplift runs without a brief-confirmation gate; the brief is its own record
---

# Page shape: home — Variant C (What if motion was part of the identity?)

This variant amplifies the **rink diagram** (captured signature motif, hero-only today) into the page's structural system, in service of PRODUCT.md personality "proud, energetic". Same IA as A plus a results ribbon; the bet is motion (register kinetic-display, DESIGN-C.json).

## Sections (in render order)
1. **header** — as A.
2. **hero** — full-bleed rink: the SVG lines **draw in** (stroke-dashoffset) — boards outline, red centre line, blue lines, face-off circles; crest scales in inside the centre face-off circle; H1 "Rinx Hockey Club" **unmasks line-by-line** ([data-split]); pill + line fade up. Game-day strip (as A) with numerals that **flip** into place ([data-flip]).
3. **results-ribbon** — single-row ribbon (arena ribbon-board): "FINAL · 10U W 10-2 vs Long Beach Lightning · FINAL · 14U W 7-1 vs Peconic Wildcats · …" scrolling (marquee); static wrapped row under reduced motion.
4. **news** — contained 3-up (as A); section head wipes in; separated from the hero by a **red centre-line rule** divider.
5. **recent-results** — rendered as **scoreboard rows** (date · opponent crest · name · big score numeral that counts up · W badge); 10U/14U toggle; blue-line rule divider above.
6. **about** — photo-led (as A) with the goalie photo framed by a **face-off circle** ring motif.
7. **coaches-facility** — as A; coach headshots in face-off-circle rings.
8. **instagram** — link band (as A).
9. **footer** — as A, with a faint centre-ice circle mark.

## Layout strategy
As A. Dividers: thin full-width SVG rink lines (red 4px centre line, blue 3px blue line — blue = `rink-navy-light`, no new colour) between major sections.

## Key states
Reduced motion: every element at its end state; ribbon static; numerals final. No-JS: `<noscript>` resets hidden states.

## Interaction model
As A. Motion triggered by IntersectionObserver; Lenis smooth scroll (cinematic file only).

## Data attributes
As A, plus `section[data-section="results-ribbon"][data-intent="live results"][data-layout="edge-to-edge"][data-interactive="carousel"]`; motion attributes `[data-anim]`, `[data-split]`, `[data-flip]`, `[data-countup]`, `.marquee__track`.

## Unsourced content (placeholder list)
- Instagram handle (as A).

## Open questions for craft
- Rink "blue lines" use navy-light rather than a new blue (Mode A: no new colours).
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
  - { section: hero, from: "pages/index.json hero + inline rink SVG (signature) + strip (as A)" }
  - { section: results-ribbon, from: "direction-authorized new (Variant C: arena ribbon board) — values from captured Recent Results + feeds" }
  - { section: news, from: "pages/index.json news-slider" }
  - { section: recent-results, from: "pages/index.json recent-results (re-laid out as scoreboard rows)" }
  - { section: about, from: "pages/index.json about" }
  - { section: coaches-facility, from: "pages/index.json columns" }
  - { section: instagram, from: "pages/index.json instagram H2" }
  - { section: header, from: "systemComponents[kind=header]" }
  - { section: footer, from: "systemComponents[kind=footer]" }
antiTemplatePass:
  - { pattern: section dividers, defaultReflex: "whitespace / hairline", alternatives: ["red→transparent title rule (captured)", "rink-line dividers"], picked: "rink-line dividers", rationale: "signature-gesture extension" }
  - { pattern: results cards, defaultReflex: "3-up card grid", alternatives: ["scoreboard rows", "fixture chips"], picked: "scoreboard rows" }
  - { pattern: photo frames, defaultReflex: "rounded rectangles", alternatives: ["face-off circle rings", "square crop with red corner tick"], picked: "face-off rings on avatars + goalie photo" }
nonTemplateMoves: ["document-shape: arena scoreboard/ribbon-board vocabulary", "signature motif promoted to structure (dividers, frames)"]
substrateTransitions: { default: "boards off-white", exceptions: ["hero navy (captured)", "results-ribbon navy (direction-authorized: ribbon board)"] }
voiceClassification:
  - { section: hero, classification: captured-verbatim }
  - { section: results-ribbon, classification: captured-verbatim, note: "'FINAL' label = direction-authorized chrome; values from feeds" }
  - { section: news, classification: captured-verbatim }
  - { section: recent-results, classification: captured-verbatim }
  - { section: about, classification: captured-verbatim }
  - { section: coaches-facility, classification: captured-verbatim }
  - { section: instagram, classification: captured-verbatim }
  - { section: header, classification: captured-verbatim }
  - { section: footer, classification: captured-verbatim }
signatureElements:
  - { kind: motif, capturedSource: "inline rink SVG in hero", mechanism: "SVG line-draw + promoted to dividers/frames", fallback: "static end state under reduced motion / no-JS" }
compositionDelta_vs_A: ["section-presence: + results ribbon band", "layout: recent results as scoreboard rows (A: cards)", "layout: rink-line dividers + face-off frames (structural motif)"]
compositionDelta_vs_B: ["hero-layout: full-bleed kinetic rink vs split identity | next-up panel", "section-presence: ribbon vs fixture rail + standings", "ia-priority: club identity leads vs live data leads"]
```
