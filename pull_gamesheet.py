#!/usr/bin/env python3
"""
Pull a team's schedule, stats, or standings from GameSheet into JSON.

GameSheet renders its widgets with JavaScript, behind a Cloudflare challenge,
using ARIA roles on <div>s (role="table"/"row"/"cell") rather than real HTML
tables. So we drive Chromium via Playwright, wait for Cloudflare to clear, then
read the role-tables from the DOM.

Verified to work from GitHub Actions runners (they clear Cloudflare). Run:
    pip install playwright
    playwright install --with-deps chromium

    python pull_gamesheet.py --type schedule  --season 15381 --team 555061 --division 83000 --out data/schedule-10u.json
    python pull_gamesheet.py --type stats      --season 15381 --team 555061 --division 83000 --out data/stats-10u.json
    python pull_gamesheet.py --type standings  --season 15381 --team 555061 --division 83000 --out data/standings-10u.json
"""

import argparse
import json
import os
import sys
import time

from playwright.sync_api import sync_playwright

# ---- Extraction JS, one per page type. Each returns a plain object/array. ----

SCHEDULE_JS = r"""
(ourTeam) => {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const OUR = norm(ourTeam).toLowerCase();
  const isOurs = (n) => norm(n).toLowerCase().includes(OUR);
  const games = [];
  document.querySelectorAll('[role="row"]').forEach((r) => {
    const c = [...r.querySelectorAll('[role="cell"]')];
    if (c.length < 5) return;
    const date = norm(c[0].innerText);
    if (!/\d{4}/.test(date)) return;
    const visitor = norm(c[1].innerText);
    const mid = norm(c[2].innerText);
    const home = norm(c[3].innerText);
    const location = norm(c[4].innerText);
    const weAreHome = isOurs(home);
    const opponent = weAreHome ? visitor : home;
    let result = '', score = '', gtime = '';
    // GameSheet writes the score cell from the VIEWED team's perspective
    // ("W 7 - 0" = our team won 7-0), with a W/L/T badge that is our result.
    // So use the badge and the numbers as-is — do NOT flip on home/away.
    const m = mid.match(/([WLT])\s*(\d+)\s*-\s*(\d+)/i);
    if (m) {
      const us = +m[2], them = +m[3];
      score = us + '-' + them;
      result = m[1].toUpperCase();
    } else { gtime = mid; }
    games.push({ date, opponent, venue: weAreHome ? 'Home' : 'Away',
      location, time: gtime, score, result });
  });
  return games;
}
"""

# Player stats: read the first role-table (Player Stats). Columns (by header):
# RK NAME # FLAGS POS GP G A PTS +/- ... PIM ...
STATS_JS = r"""
() => {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const tables = [...document.querySelectorAll('[role="table"], table')];
  const readTable = (t) => {
    const heads = [...t.querySelectorAll('[role="columnheader"], th')].map((h) => norm(h.innerText).toUpperCase());
    const rows = [];
    t.querySelectorAll('[role="row"], tr').forEach((r) => {
      const cells = [...r.querySelectorAll('[role="cell"], td')];
      if (!cells.length) return;
      const vals = cells.map((c) => norm(c.innerText));
      rows.push(vals);
    });
    return { heads, rows };
  };
  const pick = (heads, vals, name) => {
    const i = heads.indexOf(name);
    return i >= 0 ? (vals[i] || '') : '';
  };
  const out = { players: [], goalies: [] };
  tables.forEach((t) => {
    const { heads, rows } = readTable(t);
    if (heads.includes('PTS') && heads.includes('NAME') && !heads.includes('GAA')) {
      rows.forEach((v) => {
        const name = pick(heads, v, 'NAME');
        if (!name) return;
        out.players.push({
          rank: pick(heads, v, 'RK'), name, number: pick(heads, v, '#'),
          pos: pick(heads, v, 'POS'), gp: pick(heads, v, 'GP'),
          g: pick(heads, v, 'G'), a: pick(heads, v, 'A'),
          pts: pick(heads, v, 'PTS'), plusminus: pick(heads, v, '+/-'),
          pim: pick(heads, v, 'PIM'),
        });
      });
    } else if (heads.includes('GAA') && heads.includes('NAME')) {
      rows.forEach((v) => {
        const name = pick(heads, v, 'NAME');
        if (!name) return;
        out.goalies.push({
          rank: pick(heads, v, 'RK'), name, number: pick(heads, v, '#'),
          gp: pick(heads, v, 'GP'), ga: pick(heads, v, 'GA'),
          gaa: pick(heads, v, 'GAA'), sv: pick(heads, v, 'SV'),
          svpct: pick(heads, v, 'SV%'), w: pick(heads, v, 'W'),
          l: pick(heads, v, 'L'), so: pick(heads, v, 'SO'),
        });
      });
    }
  });
  return out;
}
"""

STANDINGS_JS = r"""
(ourTeam) => {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const OUR = norm(ourTeam).toLowerCase();
  const t = document.querySelector('[role="table"], table');
  if (!t) return { division: '', teams: [] };
  const heads = [...t.querySelectorAll('[role="columnheader"], th')].map((h) => norm(h.innerText).toUpperCase());
  const idx = (name) => heads.indexOf(name);
  const pick = (vals, name) => { const i = idx(name); return i >= 0 ? (vals[i] || '') : ''; };
  const teams = [];
  t.querySelectorAll('[role="row"], tr').forEach((r) => {
    const cells = [...r.querySelectorAll('[role="cell"], td')];
    if (cells.length < 5) return;
    const vals = cells.map((c) => norm(c.innerText));
    const team = pick(vals, 'TEAM');
    if (!team) return;
    teams.push({
      rank: pick(vals, 'RK'), team,
      gp: pick(vals, 'GP'), w: pick(vals, 'W'), l: pick(vals, 'L'), t: pick(vals, 'T'),
      otl: pick(vals, 'OTL'), pts: pick(vals, 'PTS'),
      gf: pick(vals, 'GF'), ga: pick(vals, 'GA'), diff: pick(vals, 'DIFF'),
      streak: pick(vals, 'STK'),
      ours: norm(team).toLowerCase().includes(OUR),
    });
  });
  const divEl = document.querySelector('h4');
  return { division: divEl ? norm(divEl.innerText) : '', teams };
}
"""


def build_url(page_type, season, team, division):
    kind = {"schedule": "schedule", "stats": "team-stats", "standings": "standings"}[page_type]
    base = f"https://gamesheetstats.com/seasons/{season}/teams/{team}/{kind}"
    params = [
        "configuration%5Binfinite-scroll%5D=false",
        "configuration%5Blogo%5D=false",
        f"filter%5Bdivision%5D={division}",
    ]
    if page_type in ("schedule", "standings"):
        params.append("filter%5Bstatus%5D=completed")
    return base + "?" + "&".join(params)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--type", required=True, choices=["schedule", "stats", "standings"])
    ap.add_argument("--season", required=True)
    ap.add_argument("--team", required=True)
    ap.add_argument("--division", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--timeout", type=int, default=60)
    args = ap.parse_args()

    url = build_url(args.type, args.season, args.team, args.division)
    print(f"[{args.type}] Opening: {url}", file=sys.stderr)

    ourteam, payload_data, last_title = "", None, ""
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
        while time.time() < deadline:
            page.wait_for_timeout(2000)
            last_title = page.title()
            if "Just a moment" in last_title:
                continue
            try:
                ourteam = page.locator("h2").first.inner_text(timeout=1000).strip()
            except Exception:
                ourteam = ""
            if not ourteam:
                continue
            if args.type == "schedule":
                data = page.evaluate(SCHEDULE_JS, ourteam)
                if data:
                    payload_data = {"games": data}
                    break
            elif args.type == "stats":
                data = page.evaluate(STATS_JS)
                if data and (data.get("players") or data.get("goalies")):
                    payload_data = data
                    break
            elif args.type == "standings":
                data = page.evaluate(STANDINGS_JS, ourteam)
                if data and data.get("teams"):
                    payload_data = data
                    break
        browser.close()

    blocked = payload_data is None
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    payload = {
        "type": args.type,
        "team": ourteam,
        "blocked_by_cloudflare": blocked,
        "last_page_title": last_title,
    }
    if payload_data:
        payload.update(payload_data)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    if blocked:
        print(f"[{args.type}] BLOCKED / no data. title={last_title!r}", file=sys.stderr)
    else:
        n = (len(payload_data.get("games", []))
             or len(payload_data.get("players", []))
             or len(payload_data.get("teams", [])))
        print(f"[{args.type}] OK: {n} rows for '{ourteam}' -> {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
