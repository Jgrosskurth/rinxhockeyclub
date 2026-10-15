"""League player stats from LIHockey.com box scores.

GameSheet isn't recording LIAHL player stats right now, but lihockey.com
posts a box score for each game. For each team page (10U, 14U) this reads the
Results list, opens each game's page, takes the Rinx skater and goalie rows
from its box score, and adds them up per player into
data/stats-lihockey-<team>.json, which the Stats pages use for League Stats
(and All Stats). Run by pull-schedule.yml after the GameSheet pulls.

A box score lists only players who recorded something (a goal, assist or
penalty), so "GP" counts the games a player shows up in.

Games whose page can't be read keep their previous box score, and a team page
that can't be read leaves its file as it is.
"""

import html
import json
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

DATA = Path(__file__).resolve().parents[2] / 'data'
SITE = 'https://lihockey.com'
TEAMS = {'10u': 1162, '14u': 1182}
UA = 'Mozilla/5.0 (compatible; RinxHockeyClub-stats/1.0; +https://www.rinxhockeyclub.com)'


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode('utf-8', 'replace')


def text(fragment):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', fragment))).strip()


def num(value):
    try:
        return float(value) if '.' in value else int(value)
    except (TypeError, ValueError):
        return 0


def results(page):
    """[{id, date, home, opponent, result, score}] from a team page's Results list."""
    start = page.find('>Results<')
    if start < 0:
        return []
    games = []
    for m in re.finditer(r'href="https://lihockey\.com/games/(\d+)/"[^>]*class="team-result-card[^"]*"\s*>(.*?)</a>',
                         page[start:], re.S):
        t = text(m[2])
        # "Sep 27 vs Long Beach Lightning 10U Silver - Ponte W 10-2 R"
        g = re.match(r'([A-Z][a-z]{2} \d{1,2}) (vs|@) (.+?) ([WLT]|OTL|SOL) (\d+)-(\d+)', t)
        if g:
            games.append({'id': m[1], 'date': g[1], 'home': g[2] == 'vs', 'opponent': g[3],
                          'result': g[4], 'score': f'{g[5]}-{g[6]}'})
    return games


def box_score(page):
    """Rinx skaters and goalies from a game page, or None if there's no box score."""
    for card in page.split('<div class="gp-team-card">')[1:]:
        team = re.search(r'class="tline">([^<]*)', card)
        if not team or 'rinx' not in html.unescape(team[1]).lower():
            continue
        skaters, goalies = [], []
        for table in re.findall(r'<table class="stat-table[^"]*">(.*?)</table>', card, re.S):
            heads = [text(h).upper() for h in re.findall(r'<th[^>]*>(.*?)</th>', table, re.S)]
            for tr in re.findall(r'<tr[^>]*>(.*?)</tr>', table, re.S):
                cells = re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)
                if len(cells) != len(heads):
                    continue
                link = re.search(r'<a [^>]*href="https://lihockey\.com/players/(\d+)/"[^>]*>(.*?)</a>', cells[1], re.S)
                if not link:  # "Team Totals"
                    continue
                row = {h: text(c) for h, c in zip(heads, cells)}
                person = {'id': link[1], 'name': text(link[2]), 'number': row.get('#', '')}
                if 'GOALIE' in heads:
                    person.update({k.lower().replace('%', 'pct').replace('/', ''): row.get(k, '')
                                   for k in ('MIN', 'SA', 'GA', 'SV', 'SV%', 'W/L')})
                    goalies.append(person)
                else:
                    person.update({'g': num(row.get('G')), 'a': num(row.get('A')), 'pts': num(row.get('PTS')),
                                   'pim': num(row.get('PIM')), 'plusminus': num(row.get('+/-')),
                                   'sog': num(row.get('SOG'))})
                    skaters.append(person)
        return {'skaters': skaters, 'goalies': goalies}
    return None


def who(name):
    # One player can have two LI Hockey player records: add up by name.
    return re.sub(r'[^a-z]', '', name.lower())


def totals(games):
    players, goalies = {}, {}
    for game in games:
        box = game.get('box') or {}
        # LI Hockey sometimes lists a player twice in one game (two player
        # records, same stats): count each player once per game.
        seen = {}
        for s in box.get('skaters', []):
            if who(s['name']) not in seen or (not seen[who(s['name'])]['number'] and s['number']):
                seen[who(s['name'])] = s
        for s in seen.values():
            p = players.setdefault(who(s['name']), {'name': s['name'], 'number': s['number'], 'pos': '',
                                             'gp': 0, 'g': 0, 'a': 0, 'pts': 0, 'plusminus': 0, 'pim': 0})
            p['number'] = p['number'] or s['number']
            p['gp'] += 1
            for k in ('g', 'a', 'pts', 'plusminus', 'pim'):
                p[k] += s[k]
        once = {}
        for s in box.get('goalies', []):
            once.setdefault(who(s['name']), s)
        for s in once.values():
            g = goalies.setdefault(who(s['name']), {'name': s['name'], 'number': s['number'], 'gp': 0,
                                             'sa': 0, 'ga': 0, 'sv': 0, 'w': 0, 'l': 0})
            g['gp'] += 1
            for k in ('sa', 'ga', 'sv'):
                g[k] += num(s.get(k))
            g['w'] += s.get('wl') == 'W'
            g['l'] += s.get('wl') == 'L'
    for g in goalies.values():
        g['svpct'] = f"{g['sv'] / g['sa']:.3f}" if g['sa'] else ''
        # Goalies who never show up as skaters still get a row in the player table.
        if who(g['name']) not in players:
            players[who(g['name'])] = {'name': g['name'], 'number': g['number'], 'pos': 'G', 'gp': g['gp'],
                                        'g': 0, 'a': 0, 'pts': 0, 'plusminus': 0, 'pim': 0}
    rows = sorted(players.values(), key=lambda p: (-p['pts'], -p['g'], p['name']))
    return ([{k: str(v) for k, v in p.items()} for p in rows],
            sorted(goalies.values(), key=lambda g: -g['gp']))


def pull(key, team_id):
    out = DATA / f'stats-lihockey-{key}.json'
    try:
        previous = {g['id']: g for g in json.loads(out.read_text()).get('games', [])}
    except (OSError, ValueError):
        previous = {}
    try:
        page = fetch(f'{SITE}/teams/{team_id}/')
    except Exception as err:
        print(f'{key}: team page unavailable, keeping the current file: {err}')
        return
    games = results(page)
    if not games:
        print(f'{key}: no results found on the team page, keeping the current file')
        return
    for game in games:
        time.sleep(0.5)  # be gentle with the site
        try:
            box = box_score(fetch(f"{SITE}/games/{game['id']}/"))
        except Exception as err:
            print(f"{key}: game {game['id']} unavailable: {err}")
            box = None
        game['box'] = box if box is not None else (previous.get(game['id']) or {}).get('box')
    players, goalies = totals(games)
    body = {
        'type': 'stats', 'source': 'lihockey.com', 'team': key,
        'teamPage': f'{SITE}/teams/{team_id}/',
        'updated': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'players': players, 'goalies': goalies, 'games': games,
    }
    old = json.loads(out.read_text()) if out.exists() else {}
    if {k: v for k, v in old.items() if k != 'updated'} == {k: v for k, v in body.items() if k != 'updated'}:
        print(f'{key}: no changes ({len(games)} games, {len(players)} players)')
        return
    out.write_text(json.dumps(body, indent=1, ensure_ascii=False) + '\n')
    with_box = sum(1 for g in games if g.get('box'))
    print(f'{key}: {len(games)} games ({with_box} with box scores), {len(players)} players')


def main():
    for key, team_id in TEAMS.items():
        pull(key, team_id)
    return 0


if __name__ == '__main__':
    sys.exit(main())
