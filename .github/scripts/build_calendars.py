"""Build subscribable team calendars from the GameSheet schedule feeds.

Writes data/calendar-10u.ics and data/calendar-14u.ics, which families add to
their phone calendars once ("Subscribe" on the schedule pages); calendar apps
re-check them, so new games, time changes and final scores show up on their
own. Each game keeps its GameSheet id as its UID, so a change updates the
existing event instead of adding a duplicate. Run after the schedule pulls in
.github/workflows/pull-schedule.yml.
"""

import json
import re
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
    home = game.get('venue') == 'Home' and not tournament
    prefix = 'at' if game.get('venue') != 'Home' and not tournament else 'vs'
    opp = tidy_team(game.get('opponent', ''))
    summary = f"{team['short']} {prefix} {opp}"
    if game.get('result') and game.get('score'):
        summary += f" ({game['result']} {game['score']})"
    details = [division(game.get('opponent', ''), tournament)]
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


def build(key, team):
    events = []
    for feed, tournament in team['feeds']:
        path = DATA / feed
        if not path.exists():
            continue
        for game in json.loads(path.read_text()).get('games', []):
            try:
                events.append((parse_when(game['date'], game.get('time', ''))[0], event(game, team, tournament)))
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
    for k, t in TEAMS.items():
        build(k, t)
