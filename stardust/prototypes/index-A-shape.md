<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-10-07T04:20:00Z
  page:             index
  variant:          A
  pageUrl:          https://www.rinxhockeyclub.com/
  againstDirection: stardust/direction.md (Active 2026-10-07T03:55:00Z)
  consumedBy:       impeccable:craft
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/current/pages/index.html
    - stardust/current/_brand-extraction.json
    - DESIGN-A.md
    - DESIGN-A.json
    - stardust/direction.md
    - stardust/uplift-improvements.md
  stardustVersion:  0.10.0
  _provenance:
    capturedSourceLineage:
      - { section: header, origin: "site-wide system-component (_brand-extraction.json#systemComponents[kind=header])" }
      - { section: hero, origin: "pages/index.json heading h1 + body[0] + blocks/hero/hero.js rink SVG; next-game rail is direction-authorized new (improvements #1/#2), data from GameSheet season 16150" }
      - { section: news, origin: "pages/index.html .news-slider (6 Game Update cards)" }
      - { section: results, origin: "pages/index.html .recent-results (10U 3 scorelines) + news-slider 14U items (improvements #8)" }
      - { section: about, origin: "pages/index.json h2 'About Our Team' + h3 + body[8..9] + 3 team photos; team strip from coaching roles (improvements #7)" }
      - { section: staff-facility, origin: "pages/index.json h3 'Coaching Staff' (4 h4 + roles) + h3 'Our Facility' + body[14..15] + facility photo" }
      - { section: social, origin: "pages/index.json h2 'Follow Us on Instagram' + instagram.com/rinx10usquirts (repo); replaces empty Elfsight embed (improvements #5)" }
      - { section: footer, origin: "site-wide system-component (_brand-extraction.json#systemComponents[kind=footer])" }
    antiTemplatePass:
      - pattern: hero composition
        defaultReflex: "centered-stack hero (emblem → pill → wordmark → lede), the captured shape"
        alternatives: ["left-aligned wordmark over full rink diagram + docked next-game rail", "split 7/5 wordmark | scoreboard (reserved for B)", "type-only hero on flat navy"]
        picked: "left-aligned wordmark over full rink diagram + docked next-game rail"
        rationale: "improvements #2 and #3: the rink is the captured signature; the docked rail answers T-hero-no-action without B's split"
      - pattern: news carousel
        defaultReflex: "3-up card carousel with dots (captured)"
        alternatives: ["CSS scroll-snap rail with peek + arrow buttons", "dated list (reserved for B)", "2-up featured + list"]
        picked: "CSS scroll-snap rail with peek + arrow buttons"
        rationale: "A keeps captured IA and the carousel; scroll-snap with peek makes slide 4–6 discoverable and fixes keyboard reach"
      - pattern: results cards
        defaultReflex: "3 fixed-width cards left-aligned in a full band, 14U behind a tab (captured)"
        alternatives: ["two-column 10U | 14U scoreline lists", "single merged list sorted by date", "tabs kept, cards stretched"]
        picked: "two-column 10U | 14U scoreline lists"
        rationale: "improvements #8: both teams visible, band filled"
      - pattern: social band
        defaultReflex: "4×1 feed tile grid (captured empty Elfsight)"
        alternatives: ["slim navy follow band with handle + link", "re-used team photos as faux feed", "drop section"]
        picked: "slim navy follow band with handle + link"
        rationale: "improvements #5: no fake tiles; re-using About photos would duplicate; dropping loses the captured social link"
    substrateTransitions:
      default: "arena-gray #F5F6F8"
      exceptions:
        - { section: results, substrate: "ice #E8F0F9", purpose: "captured zone band for results (kept from source)" }
        - { section: social, substrate: "rink-navy", purpose: "compact follow band; reads as a dasher-board sign between content and footer" }
    voiceClassification:
      - { section: header, classification: captured-verbatim, source: "nav labels + 'RINX HOCKEY CLUB' + 'TIER III/A • TRAVEL HOCKEY • LIAHL'" }
      - { section: hero, classification: captured-verbatim, copy: "2026–2027 Season · Rinx Hockey Club · Travel Hockey • Long Island, New York" }
      - { section: hero-ctas, classification: direction-authorized rewrite, copy: "Schedule · Roster", source: "nav labels reused as CTA labels (improvements #1)" }
      - { section: hero-rail, classification: direction-authorized rewrite, copy: "Next game · 10U Squirts · vs Delco Phantoms · Fri, Oct 9 · 5:05 PM · Hatfield Ice Arena · Mid Atlantic Fall Classic", source: "GameSheet season 16150 team 573565 + tournaments page" }
      - { section: news, classification: captured-verbatim }
      - { section: results, classification: captured-verbatim, source: "recent-results + news-slider scores" }
      - { section: about, classification: captured-verbatim }
      - { section: staff-facility, classification: captured-verbatim }
      - { section: social, classification: captured-verbatim, copy: "Follow Us on Instagram · @rinx10usquirts" }
      - { section: footer, classification: captured-verbatim }
    signatureElements:
      - { kind: site-wide-motif, capturedSource: "blocks/hero/hero.js rink SVG", mechanism: "inline SVG rink drawn on navy at readable stroke opacity (no 88% overlay)", fallback: "static by nature" }
      - { kind: site-wide-motif, capturedSource: "_brand-extraction.json#motifs.gradients[0] red-white-red stripe", mechanism: "8px stripe at hero base", fallback: "static" }
    compositionDelta_vs_B:
      - "hero-layout: left-stacked wordmark over rink + docked rail (A) vs 7/5 split wordmark | scoreboard panel (B)"
      - "section-order: news → results (A) vs results board → game log (B)"
      - "section-presence: news carousel (A) vs dated game-log list, no carousel (B)"
    compositionDelta_vs_C:
      - "section-presence: no results ticker band (A) vs single-row results ticker between hero and news (C)"
      - "section-presence: no center-line progress spine (A) vs fixed red center-line scroll spine (C)"
-->
---
slug: index
url: https://www.rinxhockeyclub.com/
variant: A
register: brand
surprise: low
dominantDimension: improvements/faithful-fixes
fidelity: refined
---

# Page shape: index · Variant A (faithful + improvements)

Role: "yes, that's us, with the obvious fixes." Same IA as the live homepage, with all 8 items in `stardust/uplift-improvements.md` applied, and nothing else.

## Sections (in render order)

1. **header** (system role `header`). Navy bar with a 4px red bottom rule. Left: the shield crest (`https://www.rinxhockeyclub.com/icons/rinx-header-128.webp`, 52px), "RINX HOCKEY CLUB" (display 700), and below it "TIER III/A • TRAVEL HOCKEY • LIAHL" in **ice**, not red (improvements #4). Right: nav Home · Roster ▾ (10U Squirts `/roster`, 14U Bantam `/roster-14u`) · Schedule ▾ (`/schedule`, `/schedule-14u`) · Stats ▾ (`/stats`, `/stats-14u`) · Standings ▾ (`/standings`, `/standings-14u`) · Tournaments · Sponsors · Clinics · Contact, then **Shop Gear** as a red button (`https://rinxspring2026.itemorder.com/shop/home/`). Dropdowns use `<details>`. Mobile collapses to a hamburger.
2. **hero** — full-bleed navy, min-height ~560px desktop. Background: the captured rink diagram redrawn **directly on navy** (improvements #3): rounded boards outline in ice at 30%, red center line at 60%, two blue lines in ice at 45%, the center faceoff circle plus 4 end-zone circles in red at 45%, creases. No overlay rectangle. Content is **left-aligned** in the container (improvements #2): the red season badge "2026–2027 Season", the H1 "RINX **HOCKEY** CLUB" ("HOCKEY" in red, display 900, clamp 48–72px), the lede "Travel Hockey • Long Island, New York" in ice, then CTAs: primary red **Schedule** (`/schedule`) and secondary ice-outline **Roster** (`/roster`) (improvements #1). The round "The Rinx" seal is **dropped from the hero** (improvements #7: crest is the primary mark). **Docked next-game rail** across the hero's bottom edge, above the stripe: a raised-navy bar with two cells.
   - 10U Squirts: label "NEXT GAME", then "vs Delco Phantoms", "Fri, Oct 9 · 5:05 PM", "Hatfield Ice Arena · Mid Atlantic Fall Classic", and a link "Game schedule →" (`/mid-atlantic-fall-classic-schedule`).
   - 14U Bantam: label "NEXT GAME", then a **placeholder** (type `other`, "e.g. vs Opponent · Sat, Oct 10 · 4:00 PM").
   - Then the 8px red-white-red stripe.
3. **news** — "Game Update" cards, all 6 from the capture, in captured order (14U Remains Undefeated · 10U Pours on the Goals · 14U Keep Rolling · 10U Landslide Victory · Comeback Tie · Clean Sweep), each with its summary and date verbatim. Laid out as a CSS scroll-snap rail: 3 visible at desktop with a peek of the 4th, 1.15 visible on mobile. Previous/next buttons are ≥44px and labeled. Cards: white, 8px radius, 4px red top rule, red "GAME UPDATE" badge, title type, slate summary, label-type date.
4. **results** — ice band. H2 "RECENT RESULTS" with the red rule. **Two columns** (improvements #8):
   - **10U Squirts**: Sep 27, 2026 Long Beach Lightning, The Rinx, 10–2 W · Sep 20, 2026 North Park, The Rinx, 13–0 W · Sep 13, 2026 Peconic Wildcats, @ Peconic Ice Rink, 8–2 W. Logos are MHR CDN `0004c5`, `002ee8`, `00153e` (`https://ranktech-cdn.s3.us-east-2.amazonaws.com/myhockey_prod/logos/<id>_a.png`).
   - **14U Bantam** (from the captured news): Oct 3, 2026 Peconic, at the Rinx, 7–1 W · Sep 26, 2026 North Park, 5–1 W · Sep 21, 2026 Comeback tie, "T" badge with the score as a **placeholder** (type `other`, "e.g. 3–3") and the opponent as a **placeholder**.
   - Each row: date (label), logo 36px with width/height set, opponent (subtitle type), venue (navy 70%), score (headline numerals, tabular), and a badge (W = white on win-green `#15803D`; T = navy on ice).
   - Under each column: "View Full Schedule →" (`/schedule` and `/schedule-14u`).
5. **about** — white card. H2 "ABOUT OUR TEAM". A 3-up strip of the captured team photos (`/images/r1-720.webp`, `/images/4D0F41DF-57C2-45F0-A459-86825254D41B-720.webp`, `/images/14u-720.webp`) at 3:2, alt "Rinx Hockey Club team" (captured alt). H3 "2026–2027 RINX HOCKEY CLUB" and both captured paragraphs verbatim. Above the paragraphs, a **two-team strip** (improvements #7): "10U SQUIRTS · Head Coach Dan O'Donoghue" | "14U BANTAM · Head Coach Greg Skillman" (captured roles).
6. **staff-facility** — two columns.
   - Left, "COACHING STAFF": 4 rows (64px round headshot, name in subtitle type, role in slate): Dan O'Donoghue, Head Coach • 10U Squirts · Greg Skillman, Head Coach • 14U Bantam · Joe Capozzoli, Assistant Coach • 10U, 14U · Jon Mazzarone, Assistant Coach • 14U Bantam. Rows are white with a navy left avatar ring, replacing the four heavy navy bars.
   - Right, "OUR FACILITY": the facility photo (`media_1a149b94…webp`, alt "The Rinx — Hauppauge, NY" per capture), the captured paragraph, "Phone: (631) 232-3222" as a `tel:` link, and a "Get Directions" navy button linking to the captured Google Maps URL.
7. **social** — slim navy band (improvements #5). H2 "FOLLOW US ON INSTAGRAM", the handle "@rinx10usquirts", and a red button "Follow on Instagram" (`https://www.instagram.com/rinx10usquirts`). No feed tiles.
8. **footer** (system role `footer`). Navy with the red top rule. The crest, then "RINX HOCKEY CLUB • LONG ISLAND, NY". Links: Home · Roster · Schedule · Stats · Tournaments · Sponsors · Clinics · Shop Gear · Contact. Then "The Rinx • 660 Terry Road, Hauppauge, NY 11788 • (631) 232-3222" and "© 2026 Rinx Hockey Club. All rights reserved."

## Layout strategy

- Container 1200px with 24px gutters. Section padding is 64 / 48 / 32px (balanced).
- Breakpoints are mobile-first at 600 / 900 / 1200px. The results columns stack below 900px. Staff and facility stack below 900px. The hero rail stacks its two cells below 600px.
- Type follows the perfect-fourth ladder from DESIGN-A (72 / 54 / 40 / 30 / 22 / 17). Weights are 900 and 700 only.

## Key states

- No next game known for a team: the cell shows the placeholder (prototype). In production the team cell hides.
- Logo 404: falls back to a 2-letter initials disc.

## Interaction model

- Nav dropdowns use `<details>`/`<summary>`. Hamburger below 900px per `mobile-nav-collapse.md`.
- News rail: native horizontal scroll-snap. The buttons scroll by one card (≤10-line script, the a11y exception), and the rail stays scrollable without JS.
- Skip link to `#main`. Visible 3px ice/red focus rings.

## Data attributes

- `header[data-section="header"][data-intent="navigate"][data-layout="full-width-dark"]`
- `section[data-section="hero"][data-intent="emotional hook + next action"][data-layout="full-bleed"][data-media="animation"]` (static SVG; set `data-media="image"`)
- `section[data-section="news"][data-intent="season momentum"][data-layout="edge-to-edge"][data-items="6"][data-interactive="carousel"]`
- `section[data-section="results"][data-intent="prove form"][data-layout="grid"][data-items="2"]`
- `section[data-section="about"][data-intent="build trust"][data-layout="contained"][data-media="image"]`
- `section[data-section="staff-facility"][data-intent="people and place"][data-layout="split-media"][data-items="2"]`
- `section[data-section="social"][data-intent="follow"][data-layout="contained"]`
- `footer[data-section="footer"][data-intent="navigate"][data-layout="stack"]`

## Unsourced content (placeholder list)

- `section[data-section="hero"] .rail-cell[data-team="14u"]`: the 14U next game is not published anywhere captured. Placeholder.
- `section[data-section="results"] [data-team="14u"] .result:nth-child(3) .score`: the Sep 21 comeback-tie score is not in the capture. Placeholder.
- `section[data-section="results"] [data-team="14u"] .result:nth-child(3) .opp`: the Sep 21 opponent is not in the capture. Placeholder.

## Open questions for craft

- Rail cell order on mobile: 10U first (real data) is the default.
