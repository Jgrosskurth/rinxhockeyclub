---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-10-07T03:55:00Z
  againstInput: https://www.rinxhockeyclub.com/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/_brand-extraction.json
    - stardust/current/brand-review.html
    - stardust/uplift-improvements.md
    - stardust/uplift-questions.md
  phrase: "uplift presales redesign — three variants per stardust/direction.md"
  mode: "A (brand-faithful: palette + typography pinned)"
  handsOff: true
---

# Direction — Rinx Hockey Club homepage uplift

**Mode A, brand-faithful.** The palette is pinned to the captured navy `#041E42`, Rinx red `#C8102E`, ice `#E8F0F9`, off-white `#F5F6F8`, white and win-green `#16A34A`, plus contrast-corrected neutrals derived from the captured gray. Type is pinned to Barlow Condensed (display, uppercase) and Barlow (body), both already loaded from Google Fonts. No invented colors, fonts or content.

**Content rules.** Only facts in `stardust/current/pages/index.*` or GameSheet season 16150 are used (the real next 10U game). The 14U next game, season records and registration dates are absent, so they render as `[data-placeholder]`.

**IA priorities to preserve:** (1) season news and results, (2) coaching staff, (3) the facility with address, phone and directions, (4) Shop Gear in the header.

## Variant A — Faithful + improvements

Role: risk-averse green-light. "Yes, that's us, with the obvious fixes."
Composition: same as captured. Hero → news → Recent Results → About → Coaching | Facility → social → footer.
Motion: static (no cinematic layer).
Improvements applied (all 8 from uplift-improvements.md):
1. Hero gains Schedule and Roster CTAs plus a real next-game line.
2. Hero copy left-aligned, with a results/next-game rail docked to the hero's bottom edge.
3. Rink lines drawn crisply on navy instead of under an 88% overlay.
4. AA contrast fixes (ice header subtitle, legible W badges, darker body gray, navy-70 locations).
5. Instagram void replaced by a real photo strip and a link to instagram.com/rinx10usquirts.
6. Weight ladder 900/700 with a perfect-fourth size scale.
7. Shield crest as the single primary mark, and About copy covering 10U and 14U.
8. Both teams' results shown side by side, no tab.

## Variant B — What if we amplified the club's real game data?

Role: design-team motivator. The brand's underused capability foregrounded.
What if: "What if the homepage opened like a scoreboard (next game, last results, both teams) instead of a poster?"
Captured trait amplified: live season data (scores, opponents, dates, venues).
Evidence: recent-results scorelines (10U: 10–2, 13–0, 8–2 W). Six Game Update news items with scores (14U 7–1, 5–1). Real next game from GameSheet (Fri Oct 9, 5:05p vs Delco Phantoms, Hatfield Ice Arena). Tension T-hero-no-action.
Composition: split hero, with the wordmark, lede and CTAs on the left and a navy scoreboard panel on the right (NEXT GAME + LAST RESULTS for 10U and 14U). Below it, one dated game log fuses results and the Game Update news (no carousel, no separate results board), then About Our Team with the coaching lineup grid, then the facility.
  _(amended 2026-10-07 at prototype finish review: the separate results board was merged into the log)_
Motion: static (no cinematic layer).

## Variant C — What if motion was part of the identity?

Role: visionary pitch. The brand's third dimension, kinetic.
What if: "What if the rink were drawn live: center line, blue lines and faceoff circles sketching themselves in as you skate down the page?"
Cinematic register: kinetic-display. Auto-picked from the PRODUCT.md Brand Personality: a display-typography signature, where all-caps Barlow Condensed is the structural language (wordmark, scorelines, 10U/14U codes, "TIER III/A"), matches the `display-typography-signature` row. A tie with `arrival` (brand register) was broken toward kinetic-display because the captured surface has a defining mark, the rink diagram and wordmark.
Captured trait amplified: the rink diagram signature gesture (#4), naturally amplified through motion by kinetic-display.
Evidence: blocks/hero/hero.js rink SVG under an 88% overlay (T-signature-buried), and the single red-white-red stripe.
Composition: identical IA to A. The bet is motion, not layout.
Motion: cinematic, register kinetic-display. Rink strokes draw on (stroke-dashoffset), section heads wipe left to right (clip-path), scoreline numerals count up to their real values, a single-row results marquee runs between bands, and the red center line acts as a scroll-progress spine. Everything is neutralized under prefers-reduced-motion.

---

# Direct: resolution trace (stardust:direct, hands-off, 2026-10-07)

**Phrase:** "uplift presales redesign — three variants per stardust/direction.md"
**Signal:** signal-strong (8 palette colors after clustering, 2 named families).
**Mode:** Brand-faithful mode active. Palette and type are pinned to the captured brand surface. Mode A+ applies 2 single-role recolors (improvements #4).

## Movements (hands-off assumptions)
- density: balanced (hands-off default; multi-audience floor fired: 7 sections, 3 audience tracks). sectionPadding is 64/48/32 (B uses 56 desktop).
- ia-fidelity: reimagined (auto-pinned by the "what if" phrasing in the uplift variant declarations).
- register: brand (inherited from current/PRODUCT.md).
- expressive: committed (type ratio 1.333 perfect-fourth).
- No clarifying questions asked (hands-off). Every answer was derived from the capture.

## Divergence
```
decade           ✓ rolled    → 1990s (restrained: hockey-card / broadcast numerals)
craft            ✓ rolled    → Tailor's pattern paper (rink as measured technical line drawing)
register         ✓ rolled    → Tabloid (sports-page heads, matches captured voice)
ground-family    inherited   → #F5F6F8 brand-native (Mode C override: brand-faithful; seed informs ice alt band)
font deck        inherited   → Barlow Condensed + Barlow
palette          inherited   → 8-color captured set + 2 A+ refinements
```
Anti-toolbox: A has 1 hit (uppercase condensed display, a captured pin). B has 2 (+ scoreline numerals as real data). C has 2 (+ a single-row results ticker as the arena ribbon board). All hits are justified in DESIGN-*.json.

## IA priorities (shared, mutability movable)
season-results · Shop Gear (header) · both teams equal · facility wayfinding.

## Differentiation
- A↔B: hero layout strategy (left stack vs 7/5 scoreboard split), section sequence (results above news), section presence (carousel → game log).
- A↔C: section presence (results ticker band), section presence (center-line progress spine), plus the motion register.
- B↔C: hero layout, section sequence, news presentation.

Next: stardust:prototype index (A first, then B and C).
