"""Build subscribable team calendars from the GameSheet schedule feeds.

Writes data/calendar-10u.ics and data/calendar-14u.ics, which families add to
their phone calendars once ("Subscribe" on the schedule pages); calendar apps
re-check them, so new games, time changes and final scores show up on their
own. Each game keeps its GameSheet id as its UID, so a change updates the
existing event instead of adding a duplicate. Exhibition and other games come
from the published DA sheet /other-games (GameSheet wins when a game is in
both, as on the site; see scripts/team-feeds.js). Run after the schedule pulls
in .github/workflows/pull-schedule.yml.
"""

import json
import re
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data'
SITE = 'https://www.rinxhockeyclub.com'
GAME_MINUTES = 90

TEAMS = {
    '10u': {
        'name': 'Rinx 10U Squirts', 'short': 'Rinx 10U', 'page': '/schedule',
        'feeds': [('schedule-10u.json', None), ('schedule-mid-atlantic.json', 'Mid-Atlantic Fall Showcase')],
    },
    '14u': {
        'name': 'Rinx 14U Bantam', 'short': 'Rinx 14U', 'page': '/schedule-14u',
        'feeds': [('schedule-14u.json', None)],
    },
}

# Full addresses so calendar apps map the right building (same list as
# scripts/team-feeds.js). Unknown rinks use the feed's name.
RINKS = {
    'the rinx': 'The Rinx, 660 Terry Road, Hauppauge, NY 11788',
    'hatfield ice arena': 'Hatfield Ice Arena, 350 County Line Rd, Colmar, PA 18915',
    'peconic ice rink': 'Peconic Ice Rink, Riverhead, NY',
    'long beach arena': 'Long Beach Ice Arena, Long Beach, NY',
    'iceland': 'Iceland, New Hyde Park, NY',
    'port washington skating center': 'Port Washington Skating Center, Port Washington, NY',
    'northwell twin rinks': 'Northwell Twin Rinks, East Meadow, NY',
    'parkwood ice rink': 'Parkwood Ice Rink, Great Neck, NY',
    'aviator sports center': 'Aviator Sports and Events Center, Brooklyn, NY',
    'dix hills ice rink': 'Dix Hills Ice Rink, Dix Hills, NY',
    'city ice pavilion': 'City Ice Pavilion, Long Island City, NY',
}

TIMEZONE = """BEGIN:VTIMEZONE
TZID:America/New_York
BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE"""


OTHER_GAMES_URL = f'{SITE}/other-games.json'
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def load_other_rows():
    """Rows of the published DA sheet, or [] if it can't be read."""
    try:
        req = urllib.request.Request(OTHER_GAMES_URL, headers={'User-Agent': 'rinx-calendars'})
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode()).get('data', [])
    except Exception as err:  # the calendars still build from GameSheet
        print(f'other-games sheet unavailable: {err}')
        return []


def sheet_date(text):
    """'Oct 25, 2026' / '10/25/2026' / '2026-10-25' -> 'Oct 25, 2026' ('' if unreadable)."""
    t = (text or '').strip()
    m = re.match(r'^(\d{4})-(\d{1,2})-(\d{1,2})', t)
    if m:
        return f'{MONTHS[int(m[2]) - 1]} {int(m[3])}, {m[1]}'
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{2,4})', t)
    if m:
        year = m[3] if len(m[3]) == 4 else f'20{m[3]}'
        return f'{MONTHS[int(m[1]) - 1]} {int(m[2])}, {year}'
    m = re.search(r'([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})', t)
    if m and m[1].title() in MONTHS:
        return f'{m[1].title()} {int(m[2])}, {m[3]}'
    return ''


def game_type(text):
    t = (text or '').lower()
    if 'tourn' in t:
        return 'Tournament'
    if re.search(r'exhib|scrimmage|friendly', t):
        return 'Exhibition'
    if 'league' in t:
        return 'League'
    return 'Other'


def other_games(key, rows):
    """A team's sheet rows in GameSheet's feed shape, plus a 'type'."""
    games = []
    for r in rows:
        team = r.get('Team') or ''
        hits = [k for k in TEAMS if re.search(rf'\b{k}\b', team, re.I)]
        if hits != [key] or re.search('example', team, re.I):
            continue
        date, opp = sheet_date(r.get('Date')), (r.get('Opponent') or '').strip()
        if not date or not opp:
            continue
        rink = (r.get('Rink') or '').strip()
        sm = re.search(r'(\d+)\s*[-–]\s*(\d+)', r.get('Score') or '')
        rm = re.match(r'[WLT]', (r.get('Result') or '').strip(), re.I)
        result = rm[0].upper() if rm and sm else ''
        day = datetime.strptime(date, '%b %d, %Y').strftime('%Y%m%d')
        games.append({
            'date': date, 'time': (r.get('Time') or '').strip(), 'opponent': opp,
            'venue': 'Home' if re.search(r'\brinx\b', rink, re.I) else 'Away',
            'location': rink, 'score': f'{sm[1]}-{sm[2]}' if result else '', 'result': result,
            'gameId': f"sheet-{key}-{day}-{re.sub(r'[^a-z0-9]+', '-', opp.lower())}",
            'type': game_type(r.get('Type')),
        })
    return games


def same_game(a, b):
    """Same day and (loosely) the same opponent."""
    def norm(x):
        return re.sub(r'[^a-z0-9 ]', '', tidy_team(x).lower()).strip()

    def word(z):
        return next((w for w in z.split() if len(w) > 3), z)
    if sheet_date(a['date']) != sheet_date(b['date']):
        return False
    x, y = norm(a['opponent']), norm(b['opponent'])
    return bool(x and y) and (x == y or x in y or y in x or word(x) == word(y))


def tidy_team(name):
    """'NYH4033-002-North Park-10U Mauro' -> 'North Park' (as team-feeds.js)."""
    s = (name or '').strip()
    s = re.sub(r'^TB\s+', '', s, flags=re.I)
    s = re.sub(r'^NYH?\d+(?:[-\s]\d+)?[-\s]*', '', s, flags=re.I)
    s = re.sub(r'[-\s]*\b\d{1,2}(?:U|AAA|AA|A|B)\b.*$', '', s, flags=re.I)
    s = re.sub(r'\s+', ' ', s.strip(' -–')).strip()
    if s and s == s.upper():
        s = s.title()
    return s or name


def division(opponent, tournament):
    if tournament:
        m = re.search(r'\b(\d{1,2}(?:U|AAA|AA|A|B))\s*$', opponent, re.I)
        return ' · '.join(x for x in (tournament, m and m.group(1)) if x)
    m = re.search(r'(\d{1,2}\s*-\s*\d{1,2}U\s+[A-Z]+)\s*$', opponent, re.I)
    div = re.sub(r'\b([A-Z])([A-Z]{2,})\b', lambda x: x.group(1) + x.group(2).lower(), m.group(1)) if m else ''
    return ' · '.join(x for x in ('LIAHL', div) if x)


def rink(game, home):
    name = 'The Rinx' if home else (game.get('location') or '')
    key = re.sub(r'\s*\([^)]*\)\s*$', '', name).strip().lower()
    return RINKS.get(key, name)


def esc(text):
    return (text or '').replace('\\', '\\\\').replace(';', '\\;').replace(',', '\\,').replace('\n', '\\n')


def fold(line):
    """Fold to 75-octet lines (RFC 5545)."""
    out, cur = [], ''
    for ch in line:
        if len((cur + ch).encode()) > 75:
            out.append(cur)
            cur = ' ' + ch
        else:
            cur += ch
    out.append(cur)
    return '\r\n'.join(out)


def parse_when(date, time):
    day = datetime.strptime(date.strip(), '%b %d, %Y')
    if time and re.match(r'\d{1,2}:\d{2}\s*[AP]M', time.strip(), re.I):
        t = datetime.strptime(time.strip().upper(), '%I:%M %p')
        return day.replace(hour=t.hour, minute=t.minute), True
    return day, False


def event(game, team, tournament):
    when, timed = parse_when(game['date'], game.get('time', ''))
    sheet_type = game.get('type')
    home = game.get('venue') == 'Home' and not tournament
    prefix = 'at' if game.get('venue') != 'Home' and not tournament else 'vs'
    opp = tidy_team(game.get('opponent', ''))
    summary = f"{team['short']} {prefix} {opp}"
    if sheet_type and sheet_type != 'League':
        summary += f' · {sheet_type}'
    if game.get('result') and game.get('score'):
        summary += f" ({game['result']} {game['score']})"
    details = [sheet_type or division(game.get('opponent', ''), tournament)]
    if game.get('result'):
        details.append(f"Final: {game['result']} {game.get('score', '')}".strip())
    details.append(f"Schedule: {SITE}{team['page']}")
    stamp = when.strftime('%Y%m%dT%H%M%S')
    lines = [
        'BEGIN:VEVENT',
        f"UID:gamesheet-{game.get('gameId') or stamp + slug(opp)}@rinxhockeyclub.com",
        # Deterministic, so an unchanged schedule writes an unchanged file.
        f'DTSTAMP:{stamp}Z',
    ]
    if timed:
        end = when + timedelta(minutes=GAME_MINUTES)
        lines += [f'DTSTART;TZID=America/New_York:{stamp}',
                  f"DTEND;TZID=America/New_York:{end.strftime('%Y%m%dT%H%M%S')}"]
    else:
        lines += [f"DTSTART;VALUE=DATE:{when.strftime('%Y%m%d')}",
                  f"DTEND;VALUE=DATE:{(when + timedelta(days=1)).strftime('%Y%m%d')}"]
    lines += [
        f'SUMMARY:{esc(summary)}',
        f'LOCATION:{esc(rink(game, home))}',
        f"DESCRIPTION:{esc(chr(10).join(d for d in details if d))}",
        f"URL:{SITE}{team['page']}",
        'END:VEVENT',
    ]
    return lines


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def build(key, team, sheet_rows):
    events = []
    gamesheet = []
    for feed, tournament in team['feeds']:
        path = DATA / feed
        if not path.exists():
            continue
        for game in json.loads(path.read_text()).get('games', []):
            try:
                events.append((parse_when(game['date'], game.get('time', ''))[0], event(game, team, tournament)))
                gamesheet.append(game)
            except (KeyError, ValueError):
                continue
    for game in other_games(key, sheet_rows):
        if any(same_game(game, g) for g in gamesheet):
            continue  # GameSheet already has it
        try:
            events.append((parse_when(game['date'], game.get('time', ''))[0], event(game, team, None)))
        except (KeyError, ValueError):
            continue
    events.sort(key=lambda e: e[0])
    lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rinx Hockey Club//Team schedule//EN',
        'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        f"X-WR-CALNAME:{team['name']}", 'X-WR-TIMEZONE:America/New_York',
        f"X-WR-CALDESC:{team['name']} games from GameSheet\\, kept up to date by rinxhockeyclub.com",
        'REFRESH-INTERVAL;VALUE=DURATION:PT2H', 'X-PUBLISHED-TTL:PT2H',
        *TIMEZONE.split('\n'),
    ]
    for _, ev in events:
        lines += ev
    lines.append('END:VCALENDAR')
    out = DATA / f'calendar-{key}.ics'
    out.write_text('\r\n'.join(fold(line) for line in lines) + '\r\n', newline='')
    print(f'{out.relative_to(ROOT)}: {len(events)} games')


if __name__ == '__main__':
    rows = load_other_rows()
    for k, t in TEAMS.items():
        build(k, t, rows)
