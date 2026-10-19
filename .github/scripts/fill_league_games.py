"""Fill in league games GameSheet doesn't list, from LIHockey.com box scores.

GameSheet sometimes drops a played league game from a team's schedule (it
stopped listing 14U's Sep 13 game vs Great Neck on 2026-10-15). pull_lihockey.py
keeps every game LI Hockey has a box score for in data/stats-lihockey-<team>.json;
this adds the ones GameSheet doesn't have to data/schedule-<team>.json, tagged
"source": "lihockey", so the site, the team calendars and the records all treat
them as league games. GameSheet wins whenever it lists the game itself.

Runs in pull-schedule.yml after both pulls. Safe to rerun: earlier fills are
dropped before matching again.
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_calendars import DATA, MONTHS, same_game  # noqa: E402

TEAMS = ('10u', '14u')
SCORE = re.compile(r'^\d+-\d+$')
TIME = re.compile(r'\b\d{1,2}:\d{2}\s*[AP]M\b', re.I)


def read(path):
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return None


def to_game(g, division):
    """A stats-lihockey game in GameSheet's schedule shape, or None if it
    lacks a date or a final score."""
    d = g.get('detail') or {}
    when = datetime.strptime(d['isoDate'], '%Y-%m-%d')
    score = str(g.get('score') or '').replace(' ', '')
    if not SCORE.match(score) or g.get('result') not in ('W', 'L', 'T') or not g.get('opponent'):
        return None
    time = TIME.search(' '.join(str(x) for x in d.get('info') or []))
    return {
        'date': f'{MONTHS[when.month - 1]} {when.day}, {when.year}',
        'opponent': g['opponent'],
        'venue': 'Home' if g.get('home') else 'Away',
        'location': d.get('venue') or '',
        'time': time[0].upper() if time else '',
        'score': score,
        'result': g['result'],
        'gameId': f"lih-{g['id']}",
        'division': division,
        'source': 'lihockey',
        'url': g.get('url') or '',
    }


def covers(listed, game):
    """GameSheet's game is this one: same day, same opponent, and no
    conflicting score (two teams can share a name word on a doubleheader)."""
    if not same_game(listed, game):
        return False
    score = str(listed.get('score') or '').replace(' ', '')
    return not SCORE.match(score) or score == game['score']


def fill(key):
    path = DATA / f'schedule-{key}.json'
    schedule = read(path)
    lihockey = read(DATA / f'stats-lihockey-{key}.json')
    if not isinstance(schedule, dict) or not isinstance(lihockey, dict):
        print(f'[{key}] skipped: schedule or LI Hockey feed missing', file=sys.stderr)
        return
    listed = [g for g in schedule.get('games') or [] if g.get('source') != 'lihockey']
    division = (read(DATA / f'standings-{key}.json') or {}).get('division') or ''
    added = []
    for g in lihockey.get('games') or []:
        try:
            game = to_game(g, division)
        except (KeyError, TypeError, ValueError, AttributeError) as err:
            print(f"[{key}] skipped LI Hockey game {g.get('id')}: {err!r}", file=sys.stderr)
            continue
        if not game:
            continue
        match = next((s for s in listed if covers(s, game)), None)
        if match is None:
            added.append(game)
        elif not match.get('time') and game['time']:
            # GameSheet drops the start time once a game is final; LI Hockey keeps it.
            match['time'] = game['time']
    schedule['games'] = listed + added
    path.write_text(json.dumps(schedule, indent=2))
    for game in added:
        print(f"[{key}] added {game['date']} vs {game['opponent']} ({game['score']} {game['result']})")
    if not added:
        print(f'[{key}] GameSheet lists every LI Hockey game')


if __name__ == '__main__':
    for team in TEAMS:
        fill(team)
