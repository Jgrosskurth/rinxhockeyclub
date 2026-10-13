---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-10-07T12:22:22Z
  againstInput: https://www.rinxhockeyclub.com/
  readArtifacts: [stardust/uplift-improvements.md, stardust/uplift-questions.md, stardust/current/PRODUCT.md, stardust/current/_brand-extraction.json]
  userFocus: "visual design refresh, homepage experience, navigation & mobile UX; keep navy #041E42, red #C8102E, Barlow / Barlow Condensed"
  registerPick: { register: kinetic-display, rationale: "Brand Personality = proud/energetic + display-typography signature (stacked condensed caps wordmark) + numeric scores; live-systems also fits the data, but its 'no animated headings' refusal conflicts with the captured display-caps signature → tie-break to kinetic-display", registerSource: auto }
  referencesUsed:
    - { site: "https://www.nycfc.com/", serves: "B composition anchor — next-match hero + fixture rail" }
    - { site: "https://www.nhl.com/islanders", serves: "C register check — score strips and display numerals are the vertical's native motion surface (scoreboard flips, tickers)" }
---

# Direction — uplift presales redesign (three variants)

Mode A (brand-faithful): palette = navy #041E42 / navy-light #0a2d5e / red #C8102E / red-dark #a00d24 / ice #e8f0f9 / off-white #F5F6F8 / white / gray #6b7280 / gray-light #e5e7eb / win-green #16a34a. Type = Barlow Condensed (display, uppercase, 800–900) + Barlow (body). No new colors or fonts. Gold #FFD700 stays unused.

## Variant A — Faithful + improvements

Role: risk-averse green-light. "Yes, that's us, with the obvious fixes."
Composition: same as captured — hero (rink diagram, crest, wordmark) → news → recent results → about → coaches + facility → Instagram → footer.
Motion: static (no cinematic layer).
Improvements applied: 1 (compact game-day strip under the wordmark), 2 (team-first nav + grouped mobile drawer), 3 (contained grid, equal results row / mobile rail), 4 (compact Instagram band, empty section removed), 5 (photo-led About), 6 (1.25 modular scale, 12px label floor), 7 (descriptive alts).

## Variant B — What if game day was the hero?

Role: design-team motivator. The brand's underused capability — live GameSheet data — foregrounded.
What if: "What if the first thing a Rinx family saw was the next puck drop and the last score — for both teams?"
Captured trait amplified: Live-data promotion (#3)
Evidence: liveData.feeds (schedule/standings/games JSON); T-hero-static; Recent Results + Game Update cards 600–900px down.
Composition: split hero — left: crest + wordmark (compact) over the rink diagram; right: a "Next up" scoreboard panel with a 10U / 14U toggle (opponent logos, date/time, rink, countdown-style day count, Add to calendar), and a full-width fixture rail beneath (last 3 finals + next 3 games, both teams). Below: standings snapshot (rank, W-L-T, PTS for both teams) then news, then a condensed club band (about photo + coaches + facility). Anchor: nycfc.com next-match hero + rail.
Motion: static (no cinematic layer).

## Variant C — What if motion was part of the identity?

Role: visionary pitch. The brand's third dimension — kinetic.
What if: "What if the rink itself drew the page — lines sweeping in, scores flipping like the scoreboard, results ticking past like the arena ribbon board?"
Cinematic register: kinetic-display (auto-picked from PRODUCT.md Brand Personality)
Captured trait amplified: Signature-gesture extension (#4) — the rink diagram becomes the system: red centre-line and blue-line rules as section dividers, face-off-circle frames for the crest and coach photos, line-draw reveals.
Evidence: motifs.patterns "rink-diagram hero" (inline SVG, hero only); voice.notes.
Composition: identical IA to A; the bet is motion, not layout.
Motion: cinematic, register kinetic-display — hero wordmark unmasks line-by-line, rink lines draw in (stroke-dashoffset), score numerals flip/count up, a single-row results ribbon marquee, section heads wipe in; all neutralised under prefers-reduced-motion.


---

## Resolution (stardust:direct, 2026-10-07T12:25:58Z)

Phrase: "uplift rinxhockeyclub.com" + focus "visual design refresh, homepage experience, navigation & mobile UX" (user selections).

### Movements
- mode: A brand-faithful (signal-strong: 9 palette roles, Barlow Condensed + Barlow named)
- expressive: committed (type ratio 1.25)
- distinctiveness: familiar → distinctive (matchday register)
- density: balanced (uplift no-stop default — multi-section floor fired: 7 sections) → section padding 64/48/32
- ia-fidelity: reimagined (default — user asked for homepage experience + navigation changes)
- motion: static for A/B; kinetic-display for C only (DESIGN-C.json)

### Divergence
  decade         reasoned  → 2025-now (nhl.com / nycfc.com matchday-first)
  craft          reasoned  → arena signage / scoreboard
  register       reasoned  → matchday sports-desk
  ground-family  inherited → boards off-white (brand-faithful override)
  font deck      inherited → Barlow Condensed + Barlow
  palette        inherited → captured set (gold retired)

### Differentiation (≥ 2 structural changes per pair)
- A vs B: hero layout (stacked wordmark + strip → split wordmark | next-up panel); section presence (+ fixture rail, + standings snapshot); section sequence (club story condensed and moved after news).
- A vs C: section presence (+ results ribbon band); layout strategy (recent results as scoreboard rows; rink lines as section dividers) — plus the cinematic layer.
- B vs C: hero layout (split panel vs full-bleed rink); section presence (fixture rail + standings vs ribbon); IA priority (live data leads vs club identity leads).

### Assumptions
- Instagram feed kept as a link band (third-party widget not reproduced in static prototypes).
- No new copy invented; any missing datum renders as [data-placeholder].
