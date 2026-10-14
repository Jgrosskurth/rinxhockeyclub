"""Player stats for games the club lists in the DA sheet /other-games.

A row's "GameSheet" cell may hold a link to a Rinx team page on GameSheet
(https://gamesheetstats.com/seasons/<season>/teams/<team>/...: schedule,
team-stats, roster). For each team page, this pulls the team-stats page with
pull_gamesheet.py and lists it in data/stats-sources.json, which the Stats
pages read for the Tournament / Exhibition / All Stats tabs.

Game (box score) links can't be used: GameSheet's bot check blocks automated
reads of game pages, and a game link doesn't say which team is Rinx. They are
listed under "skipped" so the club can swap in the team page link.

If a pull comes back empty, the previous file for that team page is kept.
"""

import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data'
SHEET_URL = 'https://www.rinxhockeyclub.com/other-games.json'
TEAM_LINK = re.compile(r'gamesheetstats\.com/seasons/(\d+)/teams/(\d+)', re.I)
# Pulled by pull-schedule.yml already (stats-mid-atlantic.json).
BUILT_IN = {('16150', '573565')}
TEAMS = ('10u', '14u')


def game_type(text):
    if re.search('tourn', text or '', re.I):
        return 'Tournament'
    if re.search('exhib|scrimmage|friendly', text or '', re.I):
        return 'Exhibition'
    if re.search('league', text or '', re.I):
        return 'League'
    return 'Other'


def row_team(team):
    hits = [k for k in TEAMS if re.search(rf'\b{k}\b', team or '', re.I)]
    return hits[0] if len(hits) == 1 and not re.search('example', team or '', re.I) else ''


def link_of(row):
    for key, value in row.items():
        if re.sub(r'[^a-z]', '', key.lower()) in ('gamesheet', 'gamesheetlink', 'gamesheeturl'):
            return (value or '').strip()
    return ''


def event_name(title):
    """'Rinx - Team Stats | 2026 Mid-Atlantic Fall Showcase » USAH - ...' -> the event."""
    m = re.search(r'\|\s*(.+?)\s*(?:»|$)', title or '')
    return m[1].strip() if m else ''


def main():
    try:
        req = urllib.request.Request(SHEET_URL, headers={'User-Agent': 'rinx-stats'})
        with urllib.request.urlopen(req, timeout=20) as resp:
            rows = json.loads(resp.read().decode()).get('data', [])
    except Exception as err:
        print(f'other-games sheet unavailable, keeping current stats sources: {err}')
        return 0

    wanted, skipped = {}, []
    for r in rows:
        link, team = link_of(r), row_team(r.get('Team'))
        if not link or not team:
            continue
        m = TEAM_LINK.search(link)
        if not m:
            skipped.append({'team': team, 'date': r.get('Date', ''), 'opponent': r.get('Opponent', ''),
                            'link': link, 'why': 'not a Rinx team page link'})
            continue
        season, team_id = m[1], m[2]
        if (season, team_id) in BUILT_IN:
            continue
        wanted.setdefault((team, season, team_id), game_type(r.get('Type')))

    manifest_path = DATA / 'stats-sources.json'
    try:
        previous = {(s['season'], s['teamId']): s for s in json.loads(manifest_path.read_text()).get('sources', [])}
    except (OSError, ValueError):
        previous = {}

    sources = []
    for (team, season, team_id), kind in sorted(wanted.items()):
        out = DATA / f'stats-gs-{season}-{team_id}.json'
        tmp = DATA / f'.tmp-stats-{season}-{team_id}.json'
        subprocess.run([sys.executable, str(ROOT / 'pull_gamesheet.py'), '--type', 'stats',
                        '--season', season, '--team', team_id, '--out', str(tmp)], check=False)
        try:
            pulled = json.loads(tmp.read_text())
        except (OSError, ValueError):
            pulled = {}
        tmp.unlink(missing_ok=True)
        if pulled.get('players'):
            out.write_text(json.dumps(pulled, indent=2) + '\n')
        elif not out.exists():
            print(f'{season}/{team_id}: no player stats yet')
        name = event_name(pulled.get('last_page_title')) or previous.get((season, team_id), {}).get('name', '')
        players = len(json.loads(out.read_text()).get('players', [])) if out.exists() else 0
        sources.append({'team': team, 'type': kind, 'season': season, 'teamId': team_id,
                        'name': name, 'file': out.name if out.exists() else '', 'players': players})

    manifest_path.write_text(json.dumps({'sources': sources, 'skipped': skipped}, indent=1) + '\n')
    print(f'stats-sources.json: {len(sources)} team pages, {len(skipped)} links skipped')
    return 0


if __name__ == '__main__':
    sys.exit(main())
