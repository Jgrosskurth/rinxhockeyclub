---
name: Rinx Hockey Club roster, Variant B
description: What if the roster were a set of hockey cards? Every card carries the real season line (League or Mid-Atlantic), under a team leaders strip.
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
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.rinx-red}"
    textColor: "{colors.boards-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
  stats-toggle:
    backgroundColor: "{colors.boards-white}"
    textColor: "{colors.rink-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "4px"
  trading-card:
    backgroundColor: "{colors.boards-white}"
    rounded: "{rounded.md}"
    padding: "12px"
  number-tab:
    backgroundColor: "{colors.rinx-red}"
    textColor: "{colors.boards-white}"
    typography: "{typography.headline}"
    padding: "6px 10px 4px"
  stat-panel:
    backgroundColor: "{colors.ice}"
    textColor: "{colors.rink-navy}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "10px"
  leader-row:
    backgroundColor: "{colors.rink-navy}"
    textColor: "{colors.boards-white}"
    rounded: "{rounded.md}"
    padding: "12px"
  leader-row-first:
    backgroundColor: "{colors.rinx-red}"
    textColor: "{colors.boards-white}"
    rounded: "{rounded.md}"
    padding: "12px"
---

# Design System: Rinx Hockey Club roster, Variant B

## Overview
**North star: "The Card Set."** This variant amplifies the club's real player stats (league from LIHockey.com, Mid-Atlantic tournament from GameSheet). It serves the "season first" principle and the tabloid sports-page voice. The roster reads like a set of hockey cards with a team leaders strip on top. Palette and type match A.

## Colors
As A. The stat panel on each card is ice #E8F0F9 with navy numerals (14.4:1).

## Typography
As A. Adds a stat-numeral role: Barlow Condensed 900, 22px, tabular figures. Stat labels use the 12px caption.

## Layout
Title row with the Season stats link. A sticky League / Mid-Atlantic toggle bar that stays at the top of the screen all the way down the page. A team leaders strip (League: the 3 top scorers; Mid-Atlantic: the 3 top scorers plus the goalie record), then position groups of trading cards (2/3/4/5 columns and the Goalies + Reserves shared row as A), then a staff row and a source line.

## Components
- **Toggle:** a fieldset (legend "Stats shown") with two radio buttons styled as a segmented control. CSS (:has) swaps which stat set every card and the leaders strip show; it works without JS.
- **Trading card:** the 4:5 portrait photo with the 40px jersey number on a red corner tab. Name and position, then an ice stat panel with 22px numerals (17px on phones; goalie lines 14px on phones so 1.000 fits). League shows GP · G · PTS (the league feed records no assists). Mid-Atlantic shows GP · G · A · PTS. Goalies show W-L · GAA · SV% (league: GP only, with a note that the feed lists no goalie stats). Players with no line show "No league games logged yet" / "No Mid-Atlantic games logged".
- **Leaders strip:** navy rows, the leader in red. Rank, a 72×90 photo, name (22px), number and points (40px; 54px from 900px, where the strip lays out as one row of equal columns).

## Do's and Don'ts
### Do:
- Show only stats that are in the feeds.
### Don't:
- Show 0 for players without a line, or show assists for league stats.
