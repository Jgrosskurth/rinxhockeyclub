<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-10-07T06:05:00Z
  page:             index
  variant:          C
  pageUrl:          https://www.rinxhockeyclub.com/
  againstDirection: stardust/direction.md (Active 2026-10-07T03:55:00Z)
  consumedBy:       impeccable:craft
  inheritsCanonFrom: stardust/prototypes/index-A-proposed.html (identical IA, tokens, chrome, copy)
  readArtifacts: [stardust/prototypes/index-A-proposed.html, DESIGN-C.md, DESIGN-C.json, stardust/direction.md, stardust/uplift-questions.md, skills/prototype/reference/motion-registers.md, motion-runtime.md, motion-validation.md]
  stardustVersion:  0.10.0
  _provenance:
    capturedSourceLineage:
      - { section: "header, hero, results, news, about, staff-facility, social, footer", origin: "identical to variant A (see index-A-shape.md lineage)" }
      - { section: ticker, origin: "direction-authorized new (C motion bet: single-row results marquee); items are the captured scorelines from A's results section" }
      - { section: spine, origin: "direction-authorized new (C motion bet: the rink's red center line as scroll-progress spine); decorative, aria-hidden" }
    antiTemplatePass:
      - pattern: "hero entrance"
        defaultReflex: "fade-up of the hero text block"
        alternatives: ["rink strokes draw on (stroke-dashoffset) + wordmark lines unmask (clip-path) staggered 120ms", "letter-by-letter blur reveal of the wordmark", "parallax rink"]
        picked: "rink strokes draw on + wordmark lines unmask"
        rationale: "kinetic-display's hard-reveal vocabulary applied to the captured rink signature; parallax refused (no photo hero; vestibular budget)"
      - pattern: "section heads"
        defaultReflex: "fade-in of the heading"
        alternatives: ["left-to-right clip-path word wipe (dasher-board sign)", "split-flap letters", "static"]
        picked: "left-to-right clip-path word wipe"
        rationale: "register signature move; the faceoff-circle divider is the sign's mount point"
      - pattern: "scorelines"
        defaultReflex: "static numerals"
        alternatives: ["count-up from 0 on enter", "split-flap digits", "static"]
        picked: "count-up from 0 on enter"
        rationale: "register move 'big numerals count up'; values are the real scores, final state equals captured value"
    substrateTransitions:
      default: "arena-gray #F5F6F8"
      exceptions:
        - { section: results, substrate: "ice #E8F0F9", purpose: "as A" }
        - { section: ticker, substrate: "rink-navy", purpose: "ribbon-board strip continuing the hero's navy above the stripe" }
    voiceClassification:
      - { section: "all A sections", classification: captured-verbatim, source: "identical to index-A-proposed.html" }
      - { section: ticker, classification: captured-verbatim, copy: "10U 10–2 W Long Beach Lightning · 10U 13–0 W North Park · 10U 8–2 W Peconic Wildcats · 14U 7–1 W Peconic · 14U 5–1 W North Park" }
    signatureElements:
      - { kind: site-wide-motif, capturedSource: "hero.js rink SVG", mechanism: "SVG strokes with pathLength=1 drawn via stroke-dashoffset keyframes on load", fallback: "strokes fully drawn (no-JS, reduced-motion, static file)" }
      - { kind: site-wide-motif, capturedSource: "red-white-red stripe", mechanism: "static", fallback: "static" }
    motion:
      register: kinetic-display
      choreographies:
        - { name: rink-draw, target: ".hero-rink [pathLength]", trigger: load, duration: "1400ms expo, 90ms stagger", reducedMotion: "drawn" }
        - { name: wordmark-unmask, target: ".hero h1 .ln, .season, .hero-lede, .hero-ctas", trigger: load, duration: "800ms, 120ms stagger", reducedMotion: "visible" }
        - { name: sign-wipe, target: ".display-head .word", trigger: "scroll progress (runtime)", reducedMotion: "visible" }
        - { name: score-countup, target: "[data-countup]", trigger: IO, reducedMotion: "final value" }
        - { name: ribbon-ticker, target: ".marquee__track", trigger: always (single row), reducedMotion: "paused" }
        - { name: center-spine, target: ".spine", trigger: "scroll-driven (animation-timeline: scroll(root))", reducedMotion: "hidden" }
        - { name: band-entrance, target: "[data-anim]", trigger: "scroll progress (runtime)", reducedMotion: "visible" }
    compositionDelta_vs_A:
      - "section-presence: + ribbon ticker band between hero and results"
      - "section-presence: + fixed center-line scroll spine"
    compositionDelta_vs_B:
      - "hero-layout: left stack + docked rail (C) vs split scoreboard (B)"
      - "section-presence: carousel + results columns + ticker (C) vs fused game log (B)"
-->
---
slug: index
url: https://www.rinxhockeyclub.com/
variant: C
register: brand
surprise: high
dominantDimension: motion/kinetic-display-rink
fidelity: refined
---

# Page shape: index · Variant C (the rink, drawn live)

This variant amplifies the rink diagram's signature gesture through the kinetic-display register. Its IA is identical to A. Two clichés are replaced: the fade-up hero becomes a drawn rink plus a wordmark unmask, and fade-in headings become sign wipes. The document-shape substitution is the page reading as an arena ribbon board: a ticker strip and a center-line spine.

## Sections (in render order)

1. **header**: as A.
2. **hero**: as A. In the cinematic file, the rink strokes draw on and the wordmark lines unmask.
3. **ticker** (new, motion-only): a navy strip, 48px tall, as its own section directly after the hero (below the stripe). It is a single row of real scorelines separated by faceoff dots. The CSS marquee runs at 30s per loop, with a duplicated track marked `aria-hidden`. The static file shows the row still, clipped with a fade mask. A visually hidden heading reads "Recent scores".
4. **results**, **news**, **about**, **staff-facility**, **social**, **footer**: as A. In the cinematic file:
   - H2s wipe in as signs.
   - Scores count up.
   - Cards and rows enter with `[data-anim]` (translateY 48px), at most 6 per section.
5. **spine** (new, motion-only): a fixed 3px red center line on the left edge, scaled by scroll progress. It is decorative and `aria-hidden`.

## Data attributes

The A attributes are unchanged, plus:

- `section[data-section="ticker"][data-intent="ambient scores"][data-layout="full-bleed"][data-interactive="none"]`

## Unsourced content (placeholder list)

These are the same as A: the 14U next game, plus the Sep 21 opponent and score.
