---
name: Rinx Hockey Club (current state)
description: Navy-and-red pro-hockey register. Condensed all-caps display, white cards on off-white.
colors:
  navy: "#041E42"
  navy-light: "#0A2D5E"
  red: "#C8102E"
  red-dark: "#A00D24"
  ice: "#E8F0F9"
  off-white: "#F5F6F8"
  white: "#FFFFFF"
  gray: "#6B7280"
  gray-light: "#E5E7EB"
  win-green: "#16A34A"
  gold-unused: "#FFD700"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.02em"
  h2:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "2.2rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.03em"
  h3:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.02em"
  body:
    fontFamily: "Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  round: "50%"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  tab-active:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "7px 18px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "32px"
---

# Design System: Rinx Hockey Club (current state)

_Descriptive. This records what the live homepage is, not what it should become._

## Overview

The site borrows a pro-hockey broadcast look: a navy header and hero, Rinx red accents, heavy condensed uppercase headlines, and a rink diagram drawn behind the hero. The content stacks as white cards on an off-white page, plus one ice-blue band for Recent Results. The layout is centered with a 1200px max width.

## Colors

### Primary
- **Navy `#041E42`**: header, hero, footer, all headings, staff bars. The dominant brand color.

### Secondary
- **Rinx red `#C8102E`**: Shop Gear pill, season badge, "HOCKEY" in the wordmark, 4px card top rules, section-title rules, the header subtitle.

### Neutral
- Off-white `#F5F6F8` (page), white (cards), ice `#E8F0F9` (results band), gray `#6B7280` (body copy, dates).
- Win green `#16A34A` appears only on result cards. Gold `#FFD700` is a defined token that is never used.

## Typography

- **Display:** Barlow Condensed, always uppercase. The H1 is 72px/900. H2s are 35px/900. H3s are 20–22px at 800/900. H4s are 16.8px/800.
- **Body:** Barlow 400 at 14–17.6px with line-height 1.6–1.7, in gray.
- The scale is ad-hoc (72 → 35.2 → 22.4 → 20.8 → 16.8). Weight 800 is requested but not loaded.

## Layout

A centered 1200px container with 40px section padding. Order: header → full-width 560px hero → news carousel (3-up) → Recent Results band (3 cards, left-aligned) → About card (3-photo strip + 2 paragraphs) → two columns (Coaching Staff | Our Facility) → Instagram embed → footer.

## Elevation & Depth

All cards share one soft shadow, `0 2px 12px rgb(4 30 66 / 8%)`, which deepens on hover. The hero logo has a heavier drop shadow.

## Shapes

Radii are 8px on cards, 4px on buttons and tabs, 10px on result cards, and 50% on avatars and dots. The vocabulary is mixed (2/4/6/8/10px).

## Components

- **Header:** navy bar with the crest, the RINX HOCKEY CLUB wordmark and a red subtitle. Nav items are uppercase with dropdowns, and Shop Gear is a red pill.
- **Hero (signature):** a rink SVG under an 88% navy overlay, the round badge logo, a red season pill, a 2-line wordmark with "HOCKEY" in red, a one-line lede and a red-white-red stripe. No CTA.
- **News card:** 4px red top rule, a "GAME UPDATE" pill, an uppercase headline, a gray summary and a date. Runs in a carousel with arrow buttons and dots.
- **Result card:** 4px green top rule, date, opponent logo and name, location, a large score and a green W badge. Has 10U/14U tabs.
- **Staff bar:** navy bar with a 64px round headshot, name and role.

## Do's and Don'ts

_Descriptive only. Prescriptive rules come from `direct`._
