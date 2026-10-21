<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-10-07T05:20:00Z
  page:             index
  variant:          B
  pageUrl:          https://www.rinxhockeyclub.com/
  againstDirection: stardust/direction.md (Active 2026-10-07T03:55:00Z)
  consumedBy:       impeccable:craft
  inheritsCanonFrom: stardust/prototypes/index-A-proposed.html (tokens, header, footer, placeholder signature, rink SVG geometry, faceoff divider)
  readArtifacts: [stardust/current/pages/index.json, stardust/current/pages/index.html, DESIGN-B.md, DESIGN-B.json, stardust/direction.md, stardust/uplift-questions.md]
  stardustVersion:  0.10.0
  _provenance:
    capturedSourceLineage:
      - { section: header, origin: "canon from A (system-component header)" }
      - { section: hero, origin: "pages/index.json h1 + body[0] + rink SVG (left); scoreboard panel = direction-authorized new (B trait: live season data), data from recent-results, news-slider, GameSheet season 16150" }
      - { section: game-log, origin: "consolidates pages/index.html .recent-results (10U scorelines) + .news-slider (6 Game Update items) into one dated log" }
      - { section: club, origin: "pages/index.json 'About Our Team' (h3 + body[8..9] + 3 photos) + 'Coaching Staff' (4 h4 + roles)" }
      - { section: facility, origin: "pages/index.json 'Our Facility' + body[14..15] + facility photo + roundel; 'Follow Us on Instagram' folded in as a link (instagram.com/rinx10usquirts)" }
      - { section: footer, origin: "canon from A" }
    antiTemplatePass:
      - pattern: hero composition
        defaultReflex: "centered emblem stack (captured) / A's left stack + docked rail"
        alternatives: ["7/5 split: wordmark | lit scoreboard panel", "full-width scoreboard with wordmark above", "ticker-led hero"]
        picked: "7/5 split: wordmark | lit scoreboard panel"
        rationale: "the trait is the club's real game data; a board object beside the wordmark puts next game + last result in the first viewport without demoting the brand"
      - pattern: news + results
        defaultReflex: "news card carousel + separate 3-card results band (captured)"
        alternatives: ["one dated game log fusing each scoreline with its Game Update headline", "two parallel team columns (A)", "tabbed board"]
        picked: "one dated game log fusing each scoreline with its Game Update headline"
        rationale: "every Game Update item reports a game in the results set; one log removes the duplicate and keeps both teams in one chronology"
      - pattern: staff list
        defaultReflex: "four stacked navy bars (captured)"
        alternatives: ["4-up lineup tiles", "inline list in about copy", "bars kept"]
        picked: "4-up lineup tiles"
        rationale: "a lineup card is the hockey-native form for people; it pairs with the club copy"
    substrateTransitions:
      default: "arena-gray #F5F6F8"
      exceptions:
        - { section: game-log, substrate: "ice #E8F0F9", purpose: "the results zone band (captured ice band)" }
    voiceClassification:
      - { section: header, classification: captured-verbatim }
      - { section: hero, classification: captured-verbatim, copy: "2026–2027 Season · Rinx Hockey Club · Travel Hockey • Long Island, New York" }
      - { section: hero-ctas, classification: direction-authorized rewrite, copy: "Schedule · Roster" }
      - { section: scoreboard, classification: direction-authorized rewrite, copy: "Next game / Last result labels; values captured or GameSheet", source: "direction.md Variant B" }
      - { section: game-log, classification: captured-verbatim, source: "recent-results + news-slider; 'Reported <date>' prefix where only the news date is known" }
      - { section: club, classification: captured-verbatim }
      - { section: facility, classification: captured-verbatim }
      - { section: footer, classification: captured-verbatim }
    signatureElements:
      - { kind: site-wide-motif, capturedSource: "hero.js rink SVG", mechanism: "rink drawn on navy behind the split hero (canon geometry from A)", fallback: "static" }
      - { kind: site-wide-motif, capturedSource: "red-white-red stripe", mechanism: "8px stripe at hero base", fallback: "static" }
    compositionDelta_vs_A:
      - "hero-layout: A left stack + docked rail → B 7/5 split with lit scoreboard panel"
      - "section-presence: A news carousel + separate results → B single fused game log (no carousel)"
      - "section-order: A results → news → about → staff|facility → social → B game log → club (about + lineup) → facility (+follow)"
    compositionDelta_vs_C:
      - "hero-layout: C = A's left stack + rail (animated) vs B split scoreboard"
      - "section-presence: C keeps carousel + results + ticker band vs B fused log, no ticker"
-->
---
slug: index
url: https://www.rinxhockeyclub.com/
variant: B
register: brand
surprise: medium
dominantDimension: ia-priority/scoreboard-front-door
fidelity: refined
---

# Page shape: index · Variant B (the scoreboard front door)

This variant amplifies the club's real game data in service of "season first" and the tabloid-sports-page personality. One cliché is replaced by one move from the bank: the poster hero becomes a **scoreboard object** (substrate promotion of the results band into the first viewport).

## Sections (in render order)

1. **header**: canon from A, unchanged.
2. **hero**: navy with the rink drawn behind it (canon geometry). It is a 7/5 split.
   - **Left:** the season badge, the H1 "RINX HOCKEY CLUB" over two lines with "HOCKEY" in red, the lede "Travel Hockey • Long Island, New York", and CTAs **Schedule** (`/schedule`, red) and **Roster** (`/roster`, ice outline).
   - **Right:** the **scoreboard panel**, in raised navy with a 1px ice hairline frame and a 4px red top band. Header row reads "Rinx Hockey Club · 2026–2027" in caption type. It holds two team blocks.
     - **10U Squirts.**
       - NEXT GAME: vs Delco Phantoms · Fri, Oct 9 · 5:05 PM · Hatfield Ice Arena · link "Mid Atlantic Fall Classic schedule →" (`/mid-atlantic-fall-classic-schedule`).
       - LAST RESULT: Long Beach Lightning, scoreline **10–2** in scoreline type, a W badge, and "Sep 27, 2026".
     - **14U Bantam.**
       - NEXT GAME: placeholder.
       - LAST RESULT: Peconic, **7–1**, W, "Reported Oct 3, 2026".
   - Then the red-white-red stripe.
3. **game-log**: ice band. H2 "RECENT RESULTS" (captured heading kept) with the faceoff divider; the log fuses results and Game Updates. It is one chronological list, newest first. Each row has a date column (label type), a team chip (10U / 14U, navy fill, ice text), an opponent logo, the opponent and venue, the score and badge, then the Game Update headline (title type) and summary (body-sm).
   - Oct 3 · 14U · Peconic · The Rinx · 7–1 W · "14U Remains Undefeated" / "14U powers through Peconic, winning 7-1 at the Rinx" (reported date).
   - Sep 27 · 10U · Long Beach Lightning · The Rinx · 10–2 W · "10U Pours on the Goals" / "10U overwhelmed Long Beach flooding the back of the net in a 10-2 victory".
   - Sep 26 · 14U · North Park · 5–1 W · "14U Keep Rolling" / "14U takes the early lead and holds off North Park 5-1" (reported date).
   - Sep 21 · 14U · opponent **placeholder** · score **placeholder** · T · "Comeback Tie" / "14U come back from behind in the 3rd to tie" (reported date).
   - Sep 20 · 10U · North Park · The Rinx · 13–0 W · "10U Landslide Victory" / "10U dominates North Park 56 SOG to 2, winning 13-0" (news reported Sep 21).
   - Sep 13 · 10U · Peconic Wildcats · @ Peconic Ice Rink · 8–2 W · plus a weekend note row "Clean Sweep" / "10U and 14U sweep the weekend with 4 total wins".
   - Footer links: "10U full schedule →" (`/schedule`) and "14U full schedule →" (`/schedule-14u`).
4. **club**: H2 "ABOUT OUR TEAM". A two-column block: the 3 captured photos as a mosaic (one tall, two stacked) on the left, and on the right the H3 "2026–2027 RINX HOCKEY CLUB" with both captured paragraphs. Below it sits the **lineup**, H3 "COACHING STAFF", as 4 tiles: a 96px round headshot, the name, and the role on navy. Tiles are 4-up desktop, 2-up mobile.
5. **facility**: a split, with the photo on the left and on the right the H2 "OUR FACILITY" with the roundel seal, the captured paragraph, the phone, the Get Directions button, and a secondary row "Follow Us on Instagram · @rinx10usquirts →" (`https://www.instagram.com/rinx10usquirts`).
6. **footer**: canon from A.

## Layout strategy

- Section padding is 56px desktop (DESIGN-B), 40px tablet and 32px mobile.
- The hero split is `grid-template-columns: 7fr 5fr` at ≥900px. Below that, the scoreboard stacks under the CTAs.
- The game log is a `<ol>` of `<article>` rows. On desktop each row is `grid-template-columns: 110px 64px 1fr auto`. On mobile it stacks into date + chip, then opponent + score, then headline and summary.

## Interaction model

- No carousel. Every log row is static. Opponent logos are 36px with width and height attributes set.

## Data attributes

- `header[data-section="header"][data-intent="navigate"][data-layout="full-width-dark"]`
- `section[data-section="hero"][data-intent="next game + last result"][data-layout="split-media"][data-items="2"]`
- `section[data-section="game-log"][data-intent="prove form"][data-layout="stack"][data-items="6"]`
- `section[data-section="club"][data-intent="build trust"][data-layout="split-media"][data-media="image"][data-items="4"]`
- `section[data-section="facility"][data-intent="people and place"][data-layout="split-media"][data-media="image"]`
- `footer[data-section="footer"][data-intent="navigate"][data-layout="stack"]`

## Unsourced content (placeholder list)

- `[data-section=hero] .board-team[data-team=14u] .next [data-placeholder]`: 14U next game.
- `[data-section=game-log] .log-row[data-game=2026-09-21-14u] .opp [data-placeholder]`: Sep 21 opponent.
- `[data-section=game-log] .log-row[data-game=2026-09-21-14u] .score [data-placeholder]`: Sep 21 tie score.
