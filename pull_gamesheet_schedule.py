#!/usr/bin/env python3
"""
Pull a team's schedule/results from GameSheet into JSON using a real browser.

GameSheet renders its schedule widget with JavaScript and puts it behind a
Cloudflare challenge, so a plain HTTP fetch won't work — we drive Chromium via
Playwright, wait for Cloudflare to clear, and read the rows from the DOM.

NOTE: This is expected to work from a residential IP but may be BLOCKED on
cloud/CI runners (GitHub Actions' datacenter IPs), which Cloudflare challenges
harder. This workflow exists specifically to test whether a GitHub runner can
get through. Always verify the output has real rows before trusting it.

Setup:
    pip install playwright
    playwright install --with-deps chromium

Usage:
    python pull_gamesheet_schedule.py --season 15381 --team 555061 \
        --division 83000 --out data/schedule.json
"""

import argparse
import json
import os
import sys
import time

from playwright.sync_api import sync_playwright

# GameSheet uses ARIA roles on <div>s (role="row"/"cell"), not <table>, so we
# select by role. `ourTeam` (the widget's <h2> heading) decides home/away and
# flips the score to our team's perspective.
EXTRACT_JS = r"""
(ourTeam) => {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const OUR = norm(ourTeam).toLowerCase();
  const isOurs = (name) => norm(name).toLowerCase().includes(OUR);
  const rows = [...document.querySelectorAll('[role="row"]')];
  const games = [];
  rows.forEach((r) => {
    const cells = [...r.querySelectorAll('[role="cell"]')];
    if (cells.length < 5) return;
    const date = norm(cells[0].innerText);
    if (!/\d{4}/.test(date)) return;
    const visitor = norm(cells[1].innerText);
    const mid = norm(cells[2].innerText);
    const home = norm(cells[3].innerText);
    const location = norm(cells[4].innerText);
    const gameNumber = cells[5] ? norm(cells[5].innerText) : '';
    const weAreHome = isOurs(home);
    const oppRaw = weAreHome ? visitor : home;
    const opponent = oppRaw.replace(/\b\d{1,2}U\s+[A-Z]+\b\s*$/i, '').trim();
    let result = '', score = '', gtime = '';
    const m = mid.match(/([WLT])\s*(\d+)\s*-\s*(\d+)/i);
    if (m) {
      const vis = parseInt(m[2], 10), hom = parseInt(m[3], 10);
      const ourScore = weAreHome ? hom : vis;
      const oppScore = weAreHome ? vis : hom;
      score = ourScore + '-' + oppScore;
      result = ourScore > oppScore ? 'W' : (ourScore < oppScore ? 'L' : 'T');
    } else {
      gtime = mid;
    }
    games.push({
      date, opponent, venue: weAreHome ? 'Home' : 'Away',
      location, time: gtime, score, result, game_number: gameNumber,
    });
  });
  return games;
}
"""


def build_url(season, team, division, status):
    base = f"https://gamesheetstats.com/seasons/{season}/teams/{team}/schedule"
    params = [
        "configuration%5Binfinite-scroll%5D=false",
        "configuration%5Blogo%5D=false",
        f"filter%5Bdivision%5D={division}",
    ]
    if status and status != "all":
        params.append(f"filter%5Bstatus%5D={status}")
    return base + "?" + "&".join(params)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", required=True)
    ap.add_argument("--team", required=True)
    ap.add_argument("--division", required=True)
    ap.add_argument("--status", default="all", choices=["all", "completed", "scheduled"])
    ap.add_argument("--out", default="data/schedule.json")
    ap.add_argument("--timeout", type=int, default=60)
    args = ap.parse_args()

    url = build_url(args.season, args.team, args.division, args.status)
    print(f"Opening: {url}", file=sys.stderr)

    ourteam, games = "", []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"),
            viewport={"width": 1366, "height": 900},
            locale="en-US",
        )
        page = ctx.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=60000)

        deadline = time.time() + args.timeout
        last_title = ""
        while time.time() < deadline:
            page.wait_for_timeout(2000)
            last_title = page.title()
            if "Just a moment" in last_title:
                continue
            try:
                ourteam = page.locator("h2").first.inner_text(timeout=1000).strip()
            except Exception:
                ourteam = ""
            if ourteam:
                games = page.evaluate(EXTRACT_JS, ourteam)
                if games:
                    break
        browser.close()

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    payload = {
        "team": ourteam,
        "count": len(games),
        "blocked_by_cloudflare": ("Just a moment" in last_title) or (not games),
        "last_page_title": last_title,
        "games": games,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    played = sum(1 for g in games if g.get("result"))
    print(f"Wrote {args.out}: {len(games)} games ({played} played), "
          f"team='{ourteam}', blocked={payload['blocked_by_cloudflare']}", file=sys.stderr)
    # Exit 0 either way so the workflow can commit the result for inspection.


if __name__ == "__main__":
    main()
