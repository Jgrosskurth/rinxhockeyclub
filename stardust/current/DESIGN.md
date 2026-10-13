---
name: Rinx Hockey Club
description: Tier III/A travel hockey • Long Island, New York (current state, descriptive)
colors:
  navy: "#041E42"
  navy-light: "#0a2d5e"
  red: "#C8102E"
  red-dark: "#a00d24"
  ice: "#e8f0f9"
  off-white: "#F5F6F8"
  white: "#FFFFFF"
  gray: "#6b7280"
  gray-light: "#e5e7eb"
  win-green: "#16a34a"
  gold-unused: "#FFD700"
typography:
  display:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.02em"
  h2:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "2.2rem"
    fontWeight: 900
    lineHeight: 1
  card-title:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "'Barlow', -apple-system, blinkmacsystemfont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Barlow', sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    letterSpacing: "0.15em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "10px"
  pill: "20px"
  circle: "50%"
spacing:
  section: "40px"
  section-mobile: "24px"
  max-width: "1200px"
  nav-height: "79px"
components:
  button-shop:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    rounded: "{rounded.xs}"
  tag-pill:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
  news-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.sm}"
  coach-tile:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
---

# Design System: Rinx Hockey Club (current state)

## Overview
Arena navy and goal-light red on cool off-white. A full-bleed navy hero carries an inline-SVG ice-rink diagram (center/blue lines, faceoff circles) under an 88% navy wash, with the crest, a red season pill and a stacked condensed wordmark ("RINX **HOCKEY** CLUB", "Hockey" in red). Below: a full-bleed news slider, an ice-blue Recent Results band, a white About card with three photo thumbnails, navy coach tiles, a facility card, and an Instagram embed.

## Colors
### Primary
Navy `#041E42` — header, hero, coach tiles, footer, all headings.
### Secondary
Red `#C8102E` — Shop Gear button, pills/tags, 4px card top borders, section-title rules, the red word in the hero wordmark.
### Neutral
Off-white `#F5F6F8` page, white cards, ice `#e8f0f9` band, gray `#6b7280` body text, `#e5e7eb` borders. Win green `#16a34a` for W badges. Gold `#FFD700` is defined but never used.

## Typography
Barlow Condensed 700–900, uppercase, for every heading and nav label; Barlow 400–700 for body. Scale is ad-hoc (11.2 → 12 → 13.6 → 14.4 → 15.2 → 16 → 16.8 → 20 → 22.4 → 35.2 → 72px).

## Layout
1200px max width; sections 40px padding (24px mobile). The homepage hero and all blocks after it share one full-bleed section, so the news slider runs edge-to-edge and clips cards at the viewport edges. Recent results: up to 3 cards in a 6-up grid (half the row empty on desktop; overflow on mobile).

## Elevation & Depth
One card shadow `0 2px 12px rgba(4,30,66,.08)`, hover `0 4px 16px rgba(4,30,66,.15)`, header `0 2px 20px rgba(0,0,0,.4)`.

## Shapes
8px cards, 4px buttons, 10–20px pills, circular headshots/crest. 4px colored top borders on cards.

## Components
Sticky navy header (crest, wordmark + red strapline, 9 nav items with 4 identical 10U/14U dropdowns, red Shop Gear); news slider with arrow + dot nav, 5s autoplay; Recent Results with 10U/14U toggle; About card; Coaching Staff navy tiles; Facility card with Get Directions; Elfsight Instagram widget; navy footer.

## Do's and Don'ts
_Descriptive snapshot — prescriptive rules are authored by `stardust:direct`._
