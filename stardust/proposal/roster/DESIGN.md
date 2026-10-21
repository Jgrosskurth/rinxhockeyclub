---
name: Rinx Hockey Club roster (shared target system; variant A baseline)
description: The 10U roster, made findable: grouped by position, sorted by number, each card led by a 4:5 portrait and a big jersey number. AA labels, 2-column phones.
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

# Design System: Rinx Hockey Club roster, Variant A

## Overview
**North star: "The Lineup Card."** The roster families already know, made findable and fixed. Same page order. Players grouped Forwards → Defense → Goalies → Reserves and sorted by number. Each card leads with the photo and the jersey number. Brand chrome is unchanged.

## Colors
Pinned set: navy, Rinx red, ice, arena gray, white. Slate #4B5563 for secondary text (7.56:1 on white). Position labels: Offense on navy (16.5:1), Defense on Rinx red (5.88:1), Goalie on win-green #15803D (5.02:1), Reserve on ice with navy text (14.4:1).

## Typography
Barlow Condensed 900 for display (H1 54px on phones, 72px from 600px) and jersey numerals (40px on cards at every width, in a fixed 2-digit-wide tab). 700 for names (17px) and labels (12px, tracked caps). Barlow 400 for body.

## Layout
Mobile-first grid: 2 columns under 600px, 3 at 600px, 4 at 900px, 5 at 1200px. A position group head (title + count) above each group. From 900px Goalies and Reserves (2 players each) share one row, 2 + 2 cards, so neither group leaves a mostly empty row. 64/48/32px section padding. The header switches to the menu button below 1200px because the 11 live nav items need the full desktop width.

## Shapes
4px controls and labels, 8px cards. Photos at 4:5 (matches the 199×241 source ratio) inside the card top.

## Components
- **Player card:** white, 8px radius, card shadow. A 4:5 portrait photo with the jersey number set over its lower-left corner on a navy tab (aria-hidden; the number is read with the name in the H3: "Number 4, Ryan Bachert"). Name below, and the position label (captured wording).
- **Group head:** H2 with a count chip ("Forwards 10", with visually hidden "players").
- **Champions banner:** the live promo banner; "Champions" as a red badge (the live yellow is outside the pinned palette).
- **Coach card:** same family as the player card, sized to content (photo, name, role).
- **Season stats link:** red text link in the header row to /stats.

## Do's and Don'ts
### Do:
- Keep every player findable by number and name.
- Keep the captured position wording on the card.
### Don't:
- Shrink the number below 32px.
- Use 9.6px labels.
