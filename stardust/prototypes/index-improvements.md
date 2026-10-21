---
_provenance:
  writtenBy: stardust:uplift
  writtenAt: 2026-10-07T03:45:00Z
  againstInput: https://www.rinxhockeyclub.com/
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/pages/index.json
    - stardust/current/pages/index.html
    - stardust/current/brand-review.html
    - stardust/.work/probe.json
    - blocks/hero/hero.js
    - head.html
  referencesUsed:
    - tier: "webfetch (partial)"
      ref: "https://www.nhl.com/bluejackets/ (fetched 2026-10-07)"
      note: "A pro club homepage puts a game recap in its 2nd module, directly under the hero. Supports item 2's claim that results belong near the top."
    - tier: "webfetch (failed)"
      ref: "https://www.arsenal.com/"
      note: "JS-rendered; only nav returned. Not used as evidence."
  referenceResearchNote: "No Refero MCP and no WebSearch in this runtime. The WebFetch ladder returned one usable observation. Dated-pattern claims rest on captured evidence first."
---

# Improvements — https://www.rinxhockeyclub.com/

1. **[ia-clutter]** The 560px hero has no action. Tension T-hero-no-action: the first viewport has the roundel, season pill, wordmark and lede, but `pages/index.json#ctas` has no hero link. The first content CTA ("View Full Schedule →") is about 1,300px down the page. · Pattern at fault: a poster-only hero. · Fix: add a primary "Schedule" CTA and a secondary "Roster" CTA in the hero, plus a compact next-game line that uses real data (10U vs Delco Phantoms, Fri Oct 9, 5:05p, Mid Atlantic Fall Classic).

2. **[dated-pattern]** The hero is the centered logo-stack sports template. Screenshot index.png shows the roundel, then the red pill, then a 72px two-line wordmark, then a lede, all centered on a dark field. That is the 2010s club-site hero. The current pro pattern goes straight from the hero to the latest game (nhl.com/bluejackets: a game recap is module 2). · Pattern at fault: a symmetric emblem stack with results pushed below the news carousel. · Fix: left-aligned wordmark and lede, with a results/next-game rail docked to the hero's bottom edge, and Recent Results directly under it.

3. **[missed-opportunity]** The rink diagram, the site's most distinctive asset, is painted over. Tension T-signature-buried: `blocks/hero/hero.js` draws the full rink (red center line, two blue lines, five faceoff circles, creases), then lays `rect fill=#041E42 opacity=0.88` over it. · Pattern at fault: a signature motif used as faint texture. · Fix: draw the rink lines directly on navy as crisp ice-blue/red strokes at a readable 35–60% opacity, and reuse the center-line and faceoff-circle geometry as section dividers.

4. **[contrast-or-density]** Four measured text pairs fail WCAG AA (tension T-contrast): red `#C8102E` on navy in the header subtitle (11px) is 2.81:1; white on win-green `#16A34A` in the W badges is 3.30:1; gray `#6B7280` on the ice result band is 4.20:1; gray on off-white body is 4.47:1. · Pattern at fault: brand colors stacked without contrast checks. · Fix: render the header subtitle in ice `#E8F0F9`. Win badges become navy on white or white on a darker green. Darken body gray to about `#4B5563` (7.5:1 on white). Result locations use navy at 70%.

5. **[missed-opportunity]** The Instagram section is 644px of empty tiles (tension T-embed-empty). The Elfsight widget renders gray placeholders plus a "Free Instagram Feed Widget" badge, about 18% of the page height. · Pattern at fault: a third-party embed trusted to fill a section. · Fix: replace it with a captured-photo strip (the 3 team photos and the facility photo) and one "Follow on Instagram" link to the club's real account (`instagram.com/rinx10usquirts`, found in the repo). If a live feed is wanted later, give it a sized, labeled fallback.

6. **[contrast-or-density]** The type hierarchy is flat because weight 800 never loads (tension T-weight-unloaded). `head.html` loads Barlow Condensed 700 and 900 only, so H3 and H4 (`font-weight: 800`) render in the 900 face, the same weight as the H2s. The scale is also ad-hoc: 72 → 35.2 → 22.4 → 20.8 → 16.8 (T-scale). · Pattern at fault: the weight ladder and size ladder were never reconciled. · Fix: use 900 for display and H2, 700 for H3/H4, and a 1.333 (perfect-fourth) size ladder: 72 / 54 / 40 / 30 / 22.5 / 17.

7. **[ia-clutter]** One club shows two marks and speaks for one team (tensions T-logo-variants and T-copy-scope). The header uses the shield crest, while the hero and footer use the round "The Rinx" badge. The About copy reads "The Rinx 10U Squirts travel hockey team…" under "2026–2027 Rinx Hockey Club", although the nav, news and results cover 10U and 14U. · Pattern at fault: identity and copy left over from the one-team era. · Fix: use the shield crest as the single primary mark, with the roundel kept as a secondary facility seal. Rewrite the About heading area so 10U Squirts and 14U Bantam appear side by side, using only facts already on the page.

8. **[ia-clutter]** Recent Results leaves half the band empty. Screenshot: 3 result cards (about 339px each) sit left-aligned in a 1200px band, and the right ~45% is empty ice blue. Only 10U shows by default, and 14U is behind a tab. · Pattern at fault: fixed-width cards in a full-width band, with one team hidden. · Fix: show both teams at once as two scoreline columns (10U | 14U), each with its last results, so the band is full and neither team is hidden.
