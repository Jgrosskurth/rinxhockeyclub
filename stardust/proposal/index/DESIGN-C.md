---
name: Rinx Hockey Club, Variant C (the rink, drawn live)
description: What if motion was part of the identity? The rink diagram sketches itself in, and section heads wipe in like dasher-board signage.
colors:
  rink-navy: "#041E42"
  rink-navy-raised: "#0A2D5E"
  rinx-red: "#C8102E"
  rinx-red-deep: "#A00D24"
  ice: "#E8F0F9"
  boards-white: "#FFFFFF"
  arena-gray: "#F5F6F8"
  slate-text: "#4B5563"
  line-gray: "#E5E7EB"
  win-green: "#15803D"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3.375rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.02em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.02em"
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
  body:
    fontFamily: "Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body-sm:
    fontFamily: "Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  caption:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  sm: "4px"
  md: "8px"
  round: "50%"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.rinx-red}"
    textColor: "{colors.boards-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
  button-secondary:
    backgroundColor: "{colors.rink-navy}"
    textColor: "{colors.ice}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "12px 22px"
  card:
    backgroundColor: "{colors.boards-white}"
    rounded: "{rounded.md}"
    padding: "24px"
  badge-win:
    backgroundColor: "{colors.win-green}"
    textColor: "{colors.boards-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
---

# Design System: Rinx Hockey Club, Variant C

## Overview

**North star: "Fresh Sheet."** The ice before warm-ups, when the lines go down. This variant amplifies the club's **signature gesture**, the rink diagram (captured in `blocks/hero/hero.js` but buried under an 88% overlay), through the **kinetic-display** motion register. It serves the "the rink is the brand" principle and the display-typography-signature personality. IA, tokens and copy are identical to A. Only motion and the rink-geometry layer are added.

## Colors

Same pinned sheet as A. Rink strokes: red center line `#C8102E`, ice `#E8F0F9` blue-line strokes at 40–60%, faceoff circles in red at 50%.

## Typography

Same as A. Section heads are split into word spans for the left-to-right sign wipe. Real scoreline numerals count up from 0.

## Layout

Identical to A. Two motion-only additions: (1) a **single-row results ticker** between the hero and the news, built from real scores, and (2) a fixed **center-line progress spine**, a 3px red line at the left edge that fills with scroll progress.

## Elevation & Depth

As A. Motion supplies depth, not shadows.

## Shapes

As A, plus rink geometry (lines, faceoff circles, crease arcs) reused as section dividers. A blue-line stroke under each section head draws in as it enters.

## Components

As A, plus the kinetic-display motion layer (DESIGN-C.json `extensions.motion`):

- **Rink draw-on:** SVG strokes with `pathLength=1` draw via stroke-dashoffset in narrative order: boards 0s, goal lines .12s, blue lines .24s, red line .36s, center circle .48s, faceoff circles and creases .6s. Faceoff dots pop at .95s.
- **Wordmark unmask:** each H1 line unmasks bottom-up (clip-path, 800ms expo, 120ms stagger) while the rink draws. The season badge wipes left to right; the next-game rail cells wipe in like signs.
- **Sign heads:** H2 words wipe left to right (clip-path only, 110ms per word). The faceoff-circle rule then draws on after .45s.
- **Hard reveals:** result rows wipe left to right and cards, panels and the photo strip unmask from the top. These are one-shot reveals, observed on their unclipped parent and staggered 90ms per sibling (max 5). Opacity is never animated.
- **Scores:** each pair counts up from 0 to the real value once its row is revealed. "10–2" stays one tight unit.
- **Ribbon board:** a single-row marquee of real scorelines (30s loop), paused on hover or with the Pause button.
- **Spine:** a fixed 3px red center line grows with scroll (CSS scroll timeline, only where supported).
- **Reduced motion and no-JS:** every element renders in its final state and the ribbon is static.

## Do's and Don'ts

### Do:
- Draw the rink strokes on load (stroke-dashoffset), crisp and sign-like.
- Neutralize every motion under `prefers-reduced-motion: reduce` so the static frame is complete.

### Don't:
- Use soft long fades (refused by kinetic-display).
- Add a second marquee row.
- Animate body copy.
