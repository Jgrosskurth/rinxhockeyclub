#!/usr/bin/env python3
"""
Pull GameSheet box scores for a team's completed games into one JSON feed,
for the site's /box-score page (blocks/box-score).

Each game page on gamesheetstats.com has a Box Score tab (goals and shots by
period, goalies, every goal with its assists, every penalty) and a Lineups
tab (every player's G / A / PTS / PIM and each goalie's saves). Game pages sit
behind a stricter Cloudflare challenge than the team pages: headless Chromium
never clears it, real Google Chrome under a virtual display does. So in
GitHub Actions run this as:

    REAL_CHROME=1 xvfb-run -a python .github/scripts/pull_gamesheet_boxscores.py \
        --season 16150 --schedule data/schedule-mid-atlantic.json \
        --out data/boxscores-mid-atlantic.json

Game ids come from the schedule feed pull_gamesheet.py already writes. Final
games already in --out are kept as they are, so once every game is saved a
run doesn't open a browser at all. A game that can't be read keeps its
previous entry (or is left out) and the run carries on.
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36")


def page_js(name):
    """The extractor function in gamesheet/<name>.js, minus its comment header."""
    src = (HERE / "gamesheet" / f"{name}.js").read_text(encoding="utf-8")
    return "\n".join(l for l in src.splitlines() if not l.lstrip().startswith("//")).strip()


def title_case(name):
    """GameSheet shouts names: "SEAN FOX" -> "Sean Fox", "DOLAWAY-MUIR" -> "Dolaway-Muir"."""
    def word(w):
        return "-".join(p[:1].upper() + p[1:].lower() for p in w.split("-"))
    return " ".join(word(w) for w in (name or "").split())


def period_label(p):
    return {"1ST": "1st", "2ND": "2nd", "3RD": "3rd"}.get(p.upper(), p.upper())


def num(v):
    v = (v or "").strip()
    return v if re.fullmatch(r"-?\d+", v) else ""


def build_detail(box, lineups, game):
    """Shape a game the way blocks/box-score renders it (same keys as the LI Hockey feed)."""
    rows = (box.get("scoring") or {}).get("rows") or []
    shot_rows = (box.get("shots") or {}).get("rows") or []
    if len(rows) != 2:
        raise ValueError("no scoring table")
    periods = [period_label(p) for p in box["scoring"]["periods"]]
    teams = []
    for i, r in enumerate(rows):
        shots = shot_rows[i] if i < len(shot_rows) else {}
        teams.append({
            "name": r["team"], "logo": r.get("logo", ""),
            "total": r["total"], "periods": r["periods"],
            "shots": shots.get("total", ""), "shotsByPeriod": shots.get("periods", []),
            "skaters": [], "goalies": [],
        })
    by_logo = {t["logo"]: t for t in teams if t["logo"]}
    by_name = {t["name"].lower(): t for t in teams}

    def team_of(name, logo=""):
        return by_name.get((name or "").lower()) or by_logo.get(logo)

    # Lineups: player tables then goalie tables, visitor first. Confirm each
    # player table's team from the goal scorers listed under the box score.
    scorers = {}
    for g in box.get("goals", []):
        for p in g.get("people", []):
            scorers.setdefault(p["name"].lower(), (g.get("team") or "").lower())
    player_tables = [t for t in lineups.get("tables", []) if t["kind"] == "players"][:2]
    goalie_tables = [t for t in lineups.get("tables", []) if t["kind"] == "goalies"][:2]
    order = [0, 1]
    if len(player_tables) == 2:
        def votes(t, team):
            return sum(1 for row in t["rows"] if scorers.get((row[1] if len(row) > 1 else "").lower()) == team["name"].lower())
        straight = votes(player_tables[0], teams[0]) + votes(player_tables[1], teams[1])
        crossed = votes(player_tables[0], teams[1]) + votes(player_tables[1], teams[0])
        if crossed > straight:
            order = [1, 0]

    def col(t, row, name):
        return row[t["heads"].index(name)] if name in t["heads"] and t["heads"].index(name) < len(row) else ""

    for ti, t in enumerate(player_tables):
        team = teams[order[ti]]
        for row in t["rows"]:
            pos = col(t, row, "POS.").strip("_ ")
            team["skaters"].append({
                "number": col(t, row, "#"), "name": title_case(col(t, row, "PLAYER")), "pos": pos,
                "g": num(col(t, row, "G")), "a": num(col(t, row, "A")),
                "pts": num(col(t, row, "PTS")), "pim": num(col(t, row, "PIM")),
            })
    played = {(g["name"].lower(), g["number"]): g for g in box.get("goalies", [])}
    for ti, t in enumerate(goalie_tables):
        team = teams[order[ti]]
        for row in t["rows"]:
            name, number = col(t, row, "GOALIE"), col(t, row, "#")
            b = played.get((name.lower(), number))
            sa = num(col(t, row, "SA"))
            if not b and not int(sa or 0):
                continue  # dressed but didn't play
            svpct = col(t, row, "SV%")
            team["goalies"].append({
                "number": number, "name": title_case(name),
                "min": (b or {}).get("min", ""), "sa": sa, "ga": num(col(t, row, "GA")),
                "sv": num(col(t, row, "SV")), "svpct": "" if svpct in ("—", "-") else svpct,
                "wl": (b or {}).get("decision", ""),
            })
    # No lineups (tab didn't load): fall back to the box score's goalies.
    if not goalie_tables:
        for g in box.get("goalies", []):
            team = team_of("", g.get("logo"))
            if team:
                team["goalies"].append({"number": g["number"], "name": title_case(g["name"]), "min": g.get("min", ""),
                                        "sa": "", "ga": "", "sv": "", "svpct": "", "wl": g.get("decision", "")})
    for team in teams:
        sk = team["skaters"]
        if sk:
            team["totals"] = {k: str(sum(int(p[k] or 0) for p in sk)) for k in ("g", "a", "pts", "pim")}

    goals = []
    for g in box.get("goals", []):
        people = g.get("people", [])
        if not people:
            continue
        goals.append({
            "period": period_label(g.get("period", "")), "time": g.get("time", ""),
            "tags": g.get("tags", []), "team": g.get("team", ""),
            "scorer": {**people[0], "name": title_case(people[0]["name"])},
            "assists": [{**p, "name": title_case(p["name"])} for p in people[1:]],
        })
    penalties = []
    for p in box.get("penalties", []):
        who = (p.get("people") or [{}])[0]
        penalties.append({
            "period": period_label(p.get("period", "")), "time": p.get("time", ""),
            "team": p.get("team", ""), "number": who.get("number", ""),
            "name": title_case(who.get("name", "")), "infraction": p.get("detail", ""),
        })

    # Game leaders across both teams (from the lineups).
    everyone = [(p, t) for t in teams for p in t["skaters"]]
    leaders = []
    for cat, key in (("Goals", "g"), ("Assists", "a"), ("Points", "pts")):
        best = max((int(p[key] or 0) for p, _ in everyone), default=0)
        if best:
            top = [p for p, _ in everyone if int(p[key] or 0) == best]
            leaders.append({"cat": cat, "name": ", ".join(p["name"] for p in top[:2]) + (f" +{len(top) - 2}" if len(top) > 2 else ""), "val": str(best)})
    saves = [(int(g["sv"] or 0), g) for t in teams for g in t["goalies"] if g["sv"]]
    if saves:
        sv, g = max(saves, key=lambda x: x[0])
        leaders.append({"cat": "Saves", "name": g["name"], "val": str(sv)})

    info = box.get("info") or []
    when = info[2] if len(info) > 2 else ""
    date_long, time_str, iso = game.get("date", ""), "", ""
    m = re.match(r"([A-Za-z]{3} \d{1,2}, \d{4})(?:,\s*(\d{1,2}:\d\d\s*[AP]M))?", when)
    if m:
        d = datetime.strptime(m.group(1), "%b %d, %Y")
        date_long, iso = d.strftime("%A, %B %-d, %Y"), d.strftime("%Y-%m-%d")
        time_str = m.group(2) or ""
    status = (box.get("status") or "FINAL").title().replace("/Ot", "/OT").replace("/So", "/SO")
    return {
        "league": game.get("event", ""), "info": info, "status": status,
        "dateLong": date_long, "isoDate": iso, "time": time_str,
        "venue": info[3] if len(info) > 3 else game.get("location", ""),
        "periodLabels": periods, "teams": teams, "goals": goals, "penalties": penalties,
        "leaders": leaders, "stars": [],
    }


def complete(entry):
    d = (entry or {}).get("detail") or {}
    return d.get("status", "").lower().startswith("final") and all(t.get("skaters") for t in d.get("teams", []))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", required=True)
    ap.add_argument("--schedule", required=True, help="schedule feed from pull_gamesheet.py (game ids)")
    ap.add_argument("--out", required=True)
    ap.add_argument("--event", default="", help="label shown above the score (default: schedule page title)")
    ap.add_argument("--refresh", action="store_true", help="re-read games already saved")
    args = ap.parse_args()

    sched = json.loads(Path(args.schedule).read_text(encoding="utf-8"))
    event = args.event or (sched.get("last_page_title", "").split("|")[-1].split("»")[0].strip())
    wanted = [g for g in sched.get("games", []) if g.get("gameId") and g.get("result")]
    old = {}
    if Path(args.out).exists():
        old = {g["id"]: g for g in json.loads(Path(args.out).read_text(encoding="utf-8")).get("games", [])}
    todo = [g for g in wanted if args.refresh or not complete(old.get(g["gameId"]))]
    print(f"[boxscores] {len(wanted)} final games, {len(todo)} to read", file=sys.stderr)

    fresh = {}
    if todo:
        from playwright.sync_api import sync_playwright
        box_js, lineups_js = page_js("boxscore"), page_js("lineups")
        with sync_playwright() as p:
            if os.environ.get("REAL_CHROME") == "1":
                browser = p.chromium.launch(channel="chrome", headless=False,
                                            args=["--disable-blink-features=AutomationControlled", "--no-first-run"])
                ctx = browser.new_context(viewport={"width": 1366, "height": 900}, locale="en-US")
                ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', { get: () => undefined })")
            else:
                browser = p.chromium.launch(headless=True)
                ctx = browser.new_context(user_agent=UA, viewport={"width": 1366, "height": 900}, locale="en-US")
            page = ctx.new_page()
            for g in todo:
                gid = g["gameId"]
                url = f"https://gamesheetstats.com/seasons/{args.season}/games/{gid}"
                try:
                    page.goto(f"{url}?tab=box-score", wait_until="domcontentloaded", timeout=90000)
                    page.wait_for_function(
                        "() => [...document.querySelectorAll('span')].some((e) => e.textContent.trim().toUpperCase() === 'GOALS BY PERIOD')",
                        timeout=150000, polling=2000)
                    page.wait_for_timeout(1500)
                    box = page.evaluate(box_js)
                    lineups = {"tables": []}
                    try:
                        page.get_by_role("button", name="Lineups", exact=True).first.click()
                        page.wait_for_function(
                            "() => [...document.querySelectorAll('th')].some((h) => h.textContent.trim().toUpperCase() === 'PLAYER')",
                            timeout=30000, polling=1000)
                        page.wait_for_timeout(1000)
                        lineups = page.evaluate(lineups_js)
                    except Exception as e:  # box score still useful without the lineups
                        print(f"[boxscores] {gid}: lineups not read ({e.__class__.__name__})", file=sys.stderr)
                    detail = build_detail(box, lineups, {**g, "event": event})
                    fresh[gid] = {"id": gid, "url": url, "date": g.get("date", ""), "opponent": g.get("opponent", ""), "detail": detail}
                    print(f"[boxscores] {gid}: {detail['teams'][0]['name']} {detail['teams'][0]['total']}-"
                          f"{detail['teams'][1]['total']} {detail['teams'][1]['name']}, {len(detail['goals'])} goals, "
                          f"{sum(len(t['skaters']) for t in detail['teams'])} players", file=sys.stderr)
                except Exception as e:
                    print(f"[boxscores] {gid}: not read ({e.__class__.__name__}: {str(e)[:120]}); title={page.title()!r}",
                          file=sys.stderr)
            browser.close()

    games = []
    for g in wanted:
        entry = fresh.get(g["gameId"]) or old.get(g["gameId"])
        if entry:
            games.append(entry)
    payload = {"type": "boxscores", "season": args.season, "team": sched.get("team", ""), "event": event, "games": games}
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    Path(args.out).write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"[boxscores] wrote {len(games)} box scores -> {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
