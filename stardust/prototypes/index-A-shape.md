<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-10-07T12:31:01Z
  page:             index
  pageUrl:          https://www.rinxhockeyclub.com/
  variant:          A
  againstDirection: stardust/direction.md (Resolution 2026-10-07T12:31:01Z)
  consumedBy:       impeccable:craft
  readArtifacts:    [stardust/current/pages/index.json, stardust/current/_brand-extraction.json, DESIGN-A.md, DESIGN-A.json, stardust/direction.md, stardust/prototypes/index-improvements.md, data/*.json]
  stardustVersion:  0.10.0
-->
---
slug: index
url: https://www.rinxhockeyclub.com/
register: brand
variant: A
surprise: low
dominantDimension: fidelity (faithful + improvements)
handsOff: true   # uplift runs without a brief-confirmation gate; the brief is its own record
---

# Page shape: home — Variant A (Faithful + improvements)

Applies improvements 1–7 from `index-improvements.md`, nothing more. Signature kept: rink-diagram hero.

## Sections (in render order)
1. **header** (role `header`) — sticky navy bar: crest (logo tile) + "RINX HOCKEY CLUB" + red strap; **team-first nav** (improvement 2): `10U Squirts ▾` (Schedule · Roster · Stats · Standings), `14U Bantam ▾` (same), Tournaments, `Club ▾` (Clinics · Sponsors · Contact), red **Shop Gear** button. Mobile ≤ 900px: hamburger → full-height drawer with the two team groups as accordions.
2. **hero** — captured composition kept: full-bleed navy over the inline-SVG rink diagram (centre red line, blue lines, face-off circles); crest, "2026–2027 Season" pill, H1 "Rinx **Hockey** Club" (Hockey in red), line "Travel Hockey • Long Island, New York". **New (improvement 1):** a compact two-up **game-day strip** pinned to the hero's bottom edge — per team: label, next game (date · time · opponent · rink) and last result (W score). Links: "Full schedule" per team.
3. **news** — "Game Update" cards (captured), now inside the 1200px container (improvement 3): 3-up row on desktop, scroll-snap rail with peek on mobile; prev/next buttons + dots kept.
4. **recent-results** — ice band, H2 "Recent Results", 10U/14U toggle (captured), 3 equal-width result cards filling the row (improvement 3); mobile rail with peek. CTA "View Full Schedule →".
5. **about** — photo-led band (improvement 5): goalie photo large (≈ 55% of the row) + the two captured paragraphs; the huddle and trophy photos as a 2-up beneath. Descriptive alts (improvement 7).
6. **coaches-facility** — two columns: Coaching Staff (4 compact tiles, 2×2 on desktop) and Our Facility card (panorama, copy, phone, Get Directions).
7. **instagram** — compact band (improvement 4): H2 "Follow Us on Instagram", a short line linking to the club's Instagram, no vendor badge, no empty section after it.
8. **footer** (role `footer`) — captured content; navy; crest; link row; address line.

## Layout strategy
1200px container below the hero; 12-col grid, 24px gutter; section padding 64/48/32. Hero min-height 520px desktop / auto mobile with the strip stacking to 1 column ≤ 600px.

## Key states
Default only (static prototype). Team toggle shows 10U by default; 14U results available via the toggle (both rendered, one hidden with `hidden`).

## Interaction model
Header dropdowns: `<details>`-free CSS hover/focus-within on desktop; drawer on mobile via the stock hamburger (≤10-line script). News/results rails: native horizontal scroll with scroll-snap; buttons scroll by one card.

## Data attributes
- `header[data-section="header"][data-intent="navigate"][data-layout="full-width"]`
- `section[data-section="hero"][data-intent="emotional hook"][data-layout="full-bleed"][data-media="animation"]` (SVG art)
- `section[data-section="news"][data-intent="latest news"][data-layout="grid"][data-items="6"][data-interactive="carousel"]`
- `section[data-section="recent-results"][data-intent="live results"][data-layout="grid"][data-items="3"][data-interactive="tabs"]`
- `section[data-section="about"][data-intent="build trust"][data-layout="split-media"][data-media="image"]`
- `section[data-section="coaches-facility"][data-intent="build trust"][data-layout="grid"][data-items="5"]`
- `section[data-section="instagram"][data-intent="cross-link"][data-layout="contained"]`
- `footer[data-section="footer"][data-intent="navigate"][data-layout="contained"]`

## Unsourced content (placeholder list)
- `section[data-section="instagram"] .ig-handle` — the club's Instagram handle/URL is not in the captured page (the embed hid it) → placeholder type `other`.

## Open questions for craft
- Game-day strip on navy: use ice text on a navy-light plate with a red "Next" marker.
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
  - { section: hero, from: "pages/index.json hero (crest, pill, H1, line) + inline rink SVG; strip = direction-authorized new (improvement 1) fed by data/schedule-*.json" }
  - { section: news, from: "pages/index.json news-slider cards" }
  - { section: recent-results, from: "pages/index.json recent-results" }
  - { section: about, from: "pages/index.json about (H2, H3, 2 paragraphs, 3 photos)" }
  - { section: coaches-facility, from: "pages/index.json columns (Coaching Staff, Our Facility)" }
  - { section: instagram, from: "pages/index.json instagram H2" }
  - { section: footer, from: "_brand-extraction.json#systemComponents[kind=footer]" }
antiTemplatePass:
  - { pattern: hero, defaultReflex: "centered-stack hero + two-button CTA", alternatives: ["split wordmark | data panel", "type-led full-bleed rink"], picked: "captured centered crest + wordmark over rink, NO CTA pair, + data strip", rationale: "brand-faithful signature; strip replaces the CTA-pair reflex with real information" }
  - { pattern: news cards, defaultReflex: "3-up card grid", alternatives: ["indexed headline list", "rail with peek"], picked: "contained 3-up + mobile rail", rationale: "captured card motif kept; fixes T-bleed" }
  - { pattern: about, defaultReflex: "text card with thumbnail strip", alternatives: ["photo-led split", "full-bleed photo band"], picked: "photo-led split", rationale: "improvement 5" }
substrateTransitions: { default: "boards off-white", exceptions: ["hero navy (captured)", "recent-results ice band (captured)"] }
voiceClassification:
  - { section: header, classification: captured-verbatim, note: "nav labels regrouped by team (improvement 2); 'Club' group label = direction-authorized rewrite" }
  - { section: hero, classification: captured-verbatim, note: "strip labels 'Next game' / 'Last result' / 'Full schedule' = direction-authorized rewrite; values = live feed" }
  - { section: news, classification: captured-verbatim }
  - { section: recent-results, classification: captured-verbatim }
  - { section: about, classification: captured-verbatim, note: "alts = direction-authorized rewrite (improvement 7)" }
  - { section: coaches-facility, classification: captured-verbatim }
  - { section: instagram, classification: captured-verbatim, note: "handle = placeholder" }
  - { section: footer, classification: captured-verbatim }
signatureElements:
  - { kind: motif, capturedSource: "inline rink SVG in hero", mechanism: "inline SVG reproduced", fallback: "n/a (static)" }
compositionDelta_vs_B: ["hero-layout: centered wordmark + strip → split wordmark | next-up panel", "section-presence: B adds fixture rail + standings snapshot", "section-order: B condenses about/coaches/facility into one club band after news"]
compositionDelta_vs_C: ["section-presence: C adds a results ribbon band", "layout: C renders recent results as scoreboard rows, A as cards", "layout: C uses rink lines as section dividers"]
```
