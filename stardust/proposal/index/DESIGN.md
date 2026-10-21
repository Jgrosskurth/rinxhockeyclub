---
name: Rinx Hockey Club (shared target system; variant A baseline)
description: The navy-and-red pro-hockey club page with its fixes applied. AA contrast, a real weight ladder, and a rink that reads.
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
  subtitle:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.03em"
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
  xs: "4px"
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
  button-primary-hover:
    backgroundColor: "{colors.rinx-red-deep}"
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
  badge:
    backgroundColor: "{colors.rinx-red}"
    textColor: "{colors.boards-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  badge-win:
    backgroundColor: "{colors.win-green}"
    textColor: "{colors.boards-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  link:
    textColor: "{colors.rinx-red-deep}"
    typography: "{typography.label}"
---

# Design System: Rinx Hockey Club, Variant A

## Overview

**North star: "Home Ice."** This is the club the families already know, fixed. Navy boards, red lines and white ice, set in heavy condensed capitals. Variant A changes no identity: it applies the eight measured improvements (`stardust/uplift-improvements.md`) and nothing else. The seed register (tabloid sports page) shows only in the headline voice the club already uses.

## Colors

### Primary
- **Rink Navy `#041E42`**: header, hero, footer and all headings. Raised navy `#0A2D5E` for bars inside navy fields.

### Secondary
- **Rinx Red `#C8102E`**: primary CTAs, badges, card top rules, the center line, and the "HOCKEY" wordmark accent. Never small text on navy, which measures 2.81:1. Red on navy is for strokes and fills only. Deep red `#A00D24` for hover and links on white (8.1:1).

### Neutral
- Arena gray `#F5F6F8` is the page. Boards white `#FFFFFF` is for cards. Ice `#E8F0F9` is the zone band. Line gray `#E5E7EB` is for borders.
- **Slate text `#4B5563`** replaces the captured `#6B7280` (refinement: 7.56:1 on white, 6.57:1 on ice).
- **Win green `#15803D`** replaces `#16A34A` for the W badge (refinement: white text 5.02:1).

### Named Rules
- **Ice-on-navy rule:** small text on navy is ice `#E8F0F9` (14.4:1), never red.

## Typography

Barlow Condensed is pinned for display, with 900 for display and headline and 700 for title, subtitle and label. Weight 800 is retired because it was never loaded. Barlow 400 is pinned for body. The scale is perfect-fourth (1.333): 72 / 54 / 40 / 30 / 22 / 17px. Every display line is uppercase, as captured.

### Hierarchy
- Display: hero wordmark only.
- Headline: section titles (RECENT RESULTS, ABOUT THE CLUB).
- Title: card and column heads. Subtitle: names and teams. Label: badges, buttons, eyebrows, dates.

## Layout

1200px container, 24px gutters, section padding 64 / 48 / 32px (balanced, multi-audience floor). Order: header → hero (with docked next-game rail) → results (both teams) → game updates rail → about → coaching | facility → social band (4-up photo strip + follow) → footer. Results move directly under the hero per improvement #2; every captured section is kept. Mobile first, with 600, 900 and 1200px breakpoints.

## Elevation & Depth

One card shadow, `0 2px 12px rgb(4 30 66 / 8%)`, and a hover lift to `0 8px 24px rgb(4 30 66 / 15%)`. Navy fields are flat.

## Shapes

Radii collapse to 4px (controls, badges, photos) and 8px (cards, staff bars). 50% for avatars and the roundel seal only. The captured 2/6/10px values are retired. Section heads end in a rink divider: an open faceoff circle (red stroke, center dot) starting a 3px red line that fades out.

## Components

- **Hero:** rink lines drawn directly on navy (boards 38%, blue lines 45%, red line 70%), with no 88% overlay. `xMaxYMid slice` so portrait screens show the end zone. Left-aligned season badge, wordmark and lede; the crest stays in the header. Primary "Schedule" and secondary "Roster" CTAs. A docked next-game rail across the bottom edge.
- **News card:** 4px red top band (clipped `::before`, square under 8px corners), label badge, title, slate summary and date. Scroll-snap rail with a peek, ≥44px arrows.
- **Results board:** 10U and 14U side by side, each with its last results as scorelines. Win badges are white on win-green.
- **Staff bars:** navy bars with 64px round headshots, white names and ice roles (as captured).
- **Facility card:** the round "The Rinx" seal (72px) sits in the panel head as the secondary mark; photo, address copy, tel link, navy Get Directions button.
- **Social band:** navy, 4-up strip of the captured photos, the @rinx10usquirts handle and a red follow button.
- **Footer:** as captured, with the crest.

## Do's and Don'ts

### Do:
- Use real club data only. Missing data shows as a visible placeholder.
- Keep the red-white-red stripe as the hero's base edge.
- Give 10U and 14U equal billing.

### Don't:
- Put red text on navy.
- Introduce colors or fonts outside this sheet.
- Add stat bars of numbers the club hasn't published.
