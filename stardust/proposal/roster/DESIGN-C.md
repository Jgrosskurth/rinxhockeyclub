---
name: Rinx Hockey Club roster, Variant C
description: What if the lineup came on the ice? Group signs wipe in, jersey numbers split-flap to their real values, and cards reveal with hard wipes.
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

# Design System: Rinx Hockey Club roster, Variant C

## Overview
**North star: "Line Change."** The lineup comes on the ice: each position group's sign wipes in, the jersey numbers split-flap to their real values, and the cards are revealed with hard wipes. This amplifies the jersey number (the most underused display element) through the kinetic-display register. IA, tokens and copy match A.

## Typography
As A, except the jersey numeral: 54px/900 in a fixed 1.1em slot beside the photo (navy forwards and reserves, red defense, green goalies). It is the motion's subject, rendered as `[data-flip]`.

## Layout
Same groups and order as A, with **row cards**: a smaller 4:5 photo (96px, 104px from 1200px) on the left, then the numeral, name and position label. 1 column on phones, 2 at 600px, 3 at 900px, 4 at 1200px; Goalies and Reserves share a row from 1200px. About 40% shorter than A on desktop.

## Components
As A, plus the kinetic-display layer (DESIGN-C.json `extensions.motion`):
- **Sign wipe:** the H1 and each group H2 wipe in word by word, left to right (clip-path), then the ring rule draws and the count chip pops in and flips to its count.
- **Number flip:** each digit flaps on its own, and the digits lock left to right on the real number (about 0.5s). The flip starts from the card's reveal, 250ms after it plus the card's stagger.
- **Card reveal:** each card is observed on its own (never clipped itself, so the observer fires and its shadow survives). Its contents wipe top-down as it reaches the screen; cards arriving together stagger 60ms (max 6).
- **Safety:** the hide-for-reveal class is removed at load if the motion script never reports ready; a 2.5s safety net shows anything on screen; print shows everything.
- **Reduced motion and no-JS:** final state immediately, native scrolling, no flips and no animation loops. Numbers are always real in the static HTML.

## Do's and Don'ts
### Do:
- Keep the real number in the markup. The flip is decoration on top.
### Don't:
- Use opacity fades, parallax or a marquee on the roster.
