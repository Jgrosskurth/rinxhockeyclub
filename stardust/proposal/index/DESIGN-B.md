---
name: Rinx Hockey Club, Variant B (scoreboard front door)
description: What if the homepage opened like a scoreboard? Next game and last results for both teams lead the page.
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
  scoreline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3.375rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.02em"
  title:
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
  section: "56px"
components:
  button-primary:
    backgroundColor: "{colors.rinx-red}"
    textColor: "{colors.boards-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
  button-secondary:
    backgroundColor: "{colors.rink-navy-raised}"
    textColor: "{colors.ice}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "12px 22px"
  scoreboard-panel:
    backgroundColor: "{colors.rink-navy-raised}"
    textColor: "{colors.ice}"
    rounded: "{rounded.md}"
    padding: "24px"
  log-row:
    backgroundColor: "{colors.boards-white}"
    rounded: "{rounded.sm}"
    padding: "16px 20px"
  badge-win:
    backgroundColor: "{colors.win-green}"
    textColor: "{colors.boards-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
---

# Design System: Rinx Hockey Club, Variant B

## Overview

**North star: "The Jumbotron."** This variant amplifies the club's real game data (captured trait: scorelines, opponents, dates and venues that live below the fold today). It serves the **season first** principle and the tabloid-sports-page personality. The page opens like the arena scoreboard. The palette and type are identical to A; the IA and composition change.

## Colors

Same pinned sheet and refinements as Variant A. Ice-on-navy rule in force. The scoreboard panel uses raised navy `#0A2D5E` inside the navy hero, so the board reads as a lit object.

## Typography

Same families and weights as A. Adds a **scoreline** role (54px/900) for real scores on the board; the next-game date sits at 40px/900 above the opponent. Game-log rows lead with the tabloid Game Update headline (30px/900) over a 17px opponent line. Numerals carry the hierarchy, not decoration.

## Layout

Hero is a 7/5 split: season badge, wordmark, lede and CTAs on the left (the crest stays in the header; the roundel is the facility seal), and the lit **scoreboard panel** (NEXT GAME + LAST RESULT per team) on the right, over a left-to-right navy scrim so rink lines never cross the wordmark. Below the hero, one **game log** fuses every scoreline with its Game Update headline (newest first, team chips, a separate two-team weekend note row). Then **About Our Team** (portrait-led photo mosaic + captured copy) with the **coaching lineup** (4-up tiles), then the facility (with the Instagram follow row) and the footer. Section padding is 56px desktop, within the 40–64 floor.

## Elevation & Depth

Flat navy fields. White log rows sit on arena gray with a line-gray bottom rule instead of shadows: list, not cards.

## Shapes

4px controls and log rows, 8px panels. No pills.

## Components

- **Scoreboard panel:** label "NEXT GAME", date/time (40px/900), opponent, venue + tournament link; then a "LAST RESULT" row per team, with a scoreline and a W/T badge. Missing data shows as a dashed placeholder.
- **Game log:** dated rows: date ("Reported" when only the news date is known), team chip, logo, opponent + venue, score + badge, then the headline and summary. Weekend recaps get their own row with a red 10U + 14U chip.
- **Lineup:** 4 coach tiles (headshot, name, role).

## Do's and Don'ts

### Do:
- Show only scores and games the club has published. The 14U next game is a placeholder.
- Keep both teams visible at once.

### Don't:
- Turn real per-game scores into a "trust bar" of aggregate stats.
- Bring back the carousel. The log is the news.
