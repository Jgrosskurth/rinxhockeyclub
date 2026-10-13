---
name: Rinx Hockey Club
description: "Variant C — What if motion was part of the identity?"
colors:
  rink-navy: "#041E42"
  rink-navy-light: "#0a2d5e"
  goal-red: "#C8102E"
  goal-red-deep: "#a00d24"
  ice: "#e8f0f9"
  boards: "#F5F6F8"
  sheet-white: "#FDFDFE"
  slate: "#5b6472"
  line: "#e5e7eb"
  win-green: "#16a34a"
typography:
  display:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 4.75rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "0.01em"
  h2:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.44rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.02em"
  h3:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "1.563rem"
    fontWeight: 800
    lineHeight: 1.05
  h4:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.15
  body:
    fontFamily: "'Barlow', -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "'Barlow', -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "'Barlow', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.12em"
  numeral:
    fontFamily: "'Barlow Condensed', sans-serif"
    fontSize: "2.44rem"
    fontWeight: 900
    lineHeight: 1
    fontFeature: "tabular-nums"
rounded:
  sm: "4px"
  md: "8px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section-desktop: "64px"
  section-tablet: "48px"
  section-mobile: "32px"
  container: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.goal-red}"
    textColor: "{colors.sheet-white}"
    rounded: "{rounded.sm}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.goal-red-deep}"
  button-secondary:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.rink-navy}"
    rounded: "{rounded.sm}"
    padding: "12px 22px"
  card:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.rink-navy}"
    rounded: "{rounded.md}"
    padding: "20px"
  badge:
    backgroundColor: "{colors.goal-red}"
    textColor: "{colors.sheet-white}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  link:
    textColor: "{colors.goal-red}"
---

# Design System: Rinx Hockey Club — Variant C (What if motion was part of the identity?)

_Role: visionary pitch — the rink diagram becomes a kinetic system._ Captured trait amplified: Signature-gesture extension (#4) — rink diagram.

## Overview
A's IA, with the rink diagram promoted from hero backdrop to structural system (centre red line and blue lines as section dividers, face-off-circle frames) and a single-row results ribbon band; motion register kinetic-display. Arena navy and goal red on cool "boards" off-white; the ice-rink diagram is the signature graphic. Section order: header (team-first nav) → hero: full-bleed rink, lines draw in, wordmark unmasks, game-day strip with flipping numerals → results ribbon (single-row marquee of finals) → news (contained) → recent results as scoreboard rows → about (photo-led, face-off-circle frame) → coaches + facility → instagram band → footer.

## Colors
### Primary
**Rink navy** `#041E42` (oklch(24.0% 0.076 257.2)) — header, hero, footer, headings, scoreboard panels.
### Secondary
**Goal red** `#C8102E` (oklch(53.0% 0.207 22.3)) — the one action colour (Shop, primary buttons, live/next markers, pills, the centre-line rule). Deep red `#a00d24` for hover.
### Red on navy
The wordmark word "Hockey" keeps goal red `#C8102E` on navy as a logotype (exempt, as on the live site). Small text on navy never uses red: ice / sheet-white text, or a goal-red pill with sheet-white text.
### Neutral
**Boards** `#F5F6F8` page ground, **sheet white** `#FDFDFE` cards, **ice** `#e8f0f9` banded surfaces, **slate** `#5b6472` secondary text (≥ 5.5:1 on boards), **line** `#e5e7eb` hairlines. **Win green** `#16a34a` only on W result badges (with the letter, never colour alone).
### Named Rules
- **One Red Rule** — red marks the single most important action or live state in a viewport; never decorative fills.
- **No Gold** — the unused gold token is retired.

## Typography
Barlow Condensed 800/900 uppercase for display, headings, nav and numerals; Barlow 400–700 for body. Modular scale 1.25 from 16px: 12 (label floor) → 14 → 16 → 20 → 25 → 31 → 39 → clamp(44–76) display.
### Hierarchy
Display wordmark → H2 section heads with the red rule → H3/H4 card titles → body 16px / 1.6 → labels 12px / 700 / 0.12em tracking. Scores and counts use tabular Condensed 900 numerals.

## Layout
Everything below the hero sits in a 1200px container (24px gutters mobile). Section padding 64 / 48 / 32px (balanced; multi-section floor). Results and news use equal-width rows on desktop and scroll-snap rails with a visible peek on mobile — never clipped at the viewport edge.

## Elevation & Depth
Flat by default. One card shadow `0 2px 12px rgb(4 30 66 / 8%)`; hover lifts to `0 6px 20px rgb(4 30 66 / 14%)`. Sticky header shadow only once scrolled.

## Shapes
4px buttons and inputs, 8px cards, pill badges, circular crest and headshots. Captured 4px coloured top edge on news (red) and result (W green / L navy) cards.

## Components
Team-first header: crest + wordmark + strap; menus **10U Squirts** and **14U Bantam** (Schedule · Roster · Stats · Standings), Tournaments, Club (Clinics · Sponsors · Contact), red **Shop Gear**. Mobile: full-height drawer with the two team groups as accordions. Game-day strip/panel, news cards, result cards, coach tiles, facility card, Instagram band, footer.

### Motion
Cinematic, register **kinetic-display** — hero wordmark unmask (clip-path inset, 120ms stagger); rink lines draw (stroke-dashoffset); score numerals flip/count-up on IO; single-row results ribbon marquee; section heads wipe in (clip-path). Reduced motion: all moves neutralised; marquee becomes a static wrapped row.

## Do's and Don'ts
- **Do** show the next game and last result for both teams before any club copy.
- **Do** reuse captured photos at their semantic positions, larger than before.
- **Don't** invent scores, dates, quotes or stats — use [data-placeholder] for anything the feeds don't provide.
- **Don't** let a rail or slider clip content at the viewport edge.
- **Don't** add colours or fonts outside the captured surface.
