---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-10-07T12:22:22Z
  againstInput: https://www.rinxhockeyclub.com/
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/pages/index.json
    - stardust/current/brand-review.html
    - stardust/current/assets/screenshots/index.png
    - stardust/current/assets/screenshots/index-mobile.png
  referenceTier: "2 (WebSearch/WebFetch-equivalent: live Playwright study of named sites; Refero MCP unavailable)"
  referencesUsed:
    - { site: "https://www.nhl.com/islanders", observed: "top-of-page horizontal schedule strip — recent finals + next games with times, records and broadcast, above the nav", serves: "item 1 dated-pattern counter-example" }
    - { site: "https://www.nhl.com/kraken", observed: "same scoreboard rail pattern across the NHL club template", serves: "item 1 corroboration" }
    - { site: "https://www.nycfc.com/", observed: "next-match hero: opponent + countdown (days/hours/minutes) + Buy Tickets + fixture rail", serves: "variant B composition anchor" }
---

# Improvements — https://www.rinxhockeyclub.com/

1. **[dated-pattern]** The hero is a brochure wordmark with no game information — first viewport = crest + "2026–2027 SEASON" pill + stacked wordmark + one line; results start ≈900px down (T-hero-static) · a static club-crest hero is the pattern pro clubs moved past: nhl.com/islanders and nhl.com/kraken open on a scoreboard rail of finals and upcoming games · fix: add a **game-day strip** to the hero — per team (10U / 14U): next game (opponent, date, time, rink) and last result, fed by the existing schedule JSON.
2. **[ia-clutter]** Navigation is organized by page-type while the club is organized by team — 9 top-level items, and Roster / Schedule / Stats / Standings each open the identical "10U Squirts | 14U Bantam" pair (8 duplicate children; T-nav-dup) · per-page-type mega-duplication · fix: **team-first nav** — "10U Squirts" and "14U Bantam" menus (Schedule · Roster · Stats · Standings), then Tournaments, Club (Clinics · Sponsors · Contact) and a single Shop CTA; mobile drawer grouped the same way.
3. **[contrast-or-density]** Layout bleeds and leaves holes — the hero and all following blocks share one full-bleed section, so the news slider clips its cards at the viewport edges ("…EMAINS UNDEFEATED", T-bleed); 3 result cards fill half of a 6-up grid on desktop and overflow the viewport on mobile (T-results-grid) · uncontained full-bleed below the hero · fix: return everything below the hero to the 1200px container; results become an equal-width row (desktop) / scroll-snap rail with peek (mobile).
4. **[dated-pattern]** A free third-party Instagram widget dominates the bottom of the page — "Free Instagram Feed Widget" badge, ≈580px reserved, blank on mobile at capture, followed by an 80px empty section (T-dead-space) · embed-as-content with vendor branding · fix: a compact "Follow @ on Instagram" band with a fixed-aspect 4-up strip that degrades to a link; remove the empty section.
5. **[missed-opportunity]** Authentic team photography is shown as 340×220 thumbnails inside a text card — goalie action, B&W huddle, 14U trophy photo (sources 640–1000px wide) are the most human assets on the page · thumbnail-strip-in-card · fix: a photo-led "About" band with one large image (≥ 50% of the row) and the copy beside it.
6. **[contrast-or-density]** Type scale is ad-hoc and small-skewed — 11 sizes (11.2 → 72px), several labels at 11.2–12px (T-scale) in a rinkside, phone-first context · no modular scale · fix: a 1.25 modular scale with 12px minimum for labels and 15–16px body; heading weights 800/900 only.
7. **[contrast-or-density]** Distinct images share one alt text — 3 team photos and 3 logos all labelled "Rinx Hockey Club" (T-alt-dup) · generic site-name alts · fix: descriptive alts per photo (e.g. "Rinx goalie making a save at Northwell Twin Rinks").
