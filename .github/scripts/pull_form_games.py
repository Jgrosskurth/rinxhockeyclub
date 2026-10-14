"""Copy games sent in through the club's Google Form into data/form-games.json.

The form's responses sheet is published to the web as CSV (File > Share >
Publish to web). This reads it and writes the games in the other-games
sheet's shape (Team, Type, Date, Time, Opponent, Rink, Score, Result, plus
Action and Submitted), oldest first, for scripts/team-feeds.js and
build_calendars.py. Run by .github/workflows/form-games.yml.

To take a game off the website, add a "Status" column to the responses
sheet and type "Hide" in that game's row.

Opponent logos uploaded on /submit-game arrive as small data: images in the
form's "Opponent Logo" answer. Each one is checked, re-encoded as a 128px
WebP and saved to images/opponents/ (served by the site), and the game points
to that file.

If the sheet can't be read, the current file is kept.
"""

import base64
import csv
import hashlib
import io
import json
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

CSV_URL = ('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ1L6GS5p1DQ3Yay33qav5OwHrNXRk9Po8W39i1PoT'
           'Bi_f9UnSp44HoVvqHzq76UOr8TNFxuGz7pTEB/pub?gid=382502038&single=true&output=csv')
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'data' / 'form-games.json'
LOGOS = ROOT / 'images' / 'opponents'
DATA_LOGO = re.compile(r'^data:image/(png|webp|jpeg);base64,([A-Za-z0-9+/]+=*)$')
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def clean(value, size=80):
    return re.sub(r'\s+', ' ', re.sub(r'[\x00-\x1f<>]', ' ', str(value or ''))).strip()[:size]


def column(row, *names):
    """A cell by (loose) header name, so renaming a question slightly still works.
    Names are tried in order; each matches a header that contains it."""
    keys = {re.sub(r'[^a-z]', '', (key or '').lower()): value for key, value in row.items()}
    for name in names:
        for k, value in keys.items():
            if name in k:
                return value or ''
    return ''


def form_date(text):
    """'10/18/2026' or '2026-10-18' -> 'Oct 18, 2026'; '' if unreadable."""
    t = (text or '').strip()
    for fmt in ('%m/%d/%Y', '%Y-%m-%d', '%m/%d/%y'):
        try:
            d = datetime.strptime(t, fmt)
            return f'{MONTHS[d.month - 1]} {d.day}, {d.year}'
        except ValueError:
            pass
    return ''


def form_time(text):
    """'4:00:00 PM' / '16:00' -> '4:00 PM'; '' if none."""
    t = (text or '').strip().upper()
    m = re.match(r'(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP])?\.?M?', t)
    if not m:
        return ''
    hour, minute = int(m[1]), m[2]
    if m[3]:
        hour = hour % 12 + (12 if m[3] == 'P' else 0)
    if hour > 23:
        return ''
    return f'{hour % 12 or 12}:{minute} {"AM" if hour < 12 else "PM"}'


def submitted(text):
    """Form timestamp '10/14/2026 18:30:05' -> '2026-10-14 18:30:05' (sorts)."""
    try:
        return datetime.strptime((text or '').strip(), '%m/%d/%Y %H:%M:%S').strftime('%Y-%m-%d %H:%M:%S')
    except ValueError:
        return clean(text)


def save_logo(text, opponent):
    """An uploaded logo (data: image) -> '/images/opponents/<name>-<hash>.webp',
    or '' if it isn't a real, small image."""
    m = DATA_LOGO.match((text or '').strip())
    if not m or len(text) > 80000:
        return ''
    raw = base64.b64decode(m[2])
    try:
        from PIL import Image  # installed by form-games.yml
    except ImportError:
        print('Pillow missing; logo not saved')
        return ''
    try:
        with Image.open(io.BytesIO(raw)) as im:
            if im.format not in ('PNG', 'WEBP', 'JPEG') or max(im.size) > 1024:
                return ''
            im = im.convert('RGBA')
            im.thumbnail((128, 128))
            out = io.BytesIO()
            im.save(out, 'WEBP', quality=85, method=6)
    except Exception as err:
        print(f'Unreadable logo for {opponent}: {err}')
        return ''
    data = out.getvalue()
    name = re.sub(r'[^a-z0-9]+', '-', opponent.lower()).strip('-')[:40] or 'opponent'
    path = LOGOS / f'{name}-{hashlib.sha1(data).hexdigest()[:8]}.webp'
    if not path.exists():
        LOGOS.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        print(f'saved {path.relative_to(ROOT)}')
    return '/' + path.relative_to(ROOT).as_posix()


def to_game(row):
    team = column(row, 'team')
    hit = re.search(r'\b(10|14)\s*u\b', team, re.I)
    date = form_date(column(row, 'date'))
    opponent = clean(column(row, 'opponent'))
    # "Opponent Score" also contains "opponent": take the question that doesn't say score.
    for key, value in row.items():
        k = (key or '').lower()
        if 'opponent' in k and not re.search('score|goal|logo', k):
            opponent = clean(value)
    if not hit or not date or not opponent:
        return None
    report = re.search('score', column(row, 'upcoming', 'scorereport', 'type'), re.I)
    us = re.sub(r'\D', '', column(row, 'rinxscore', 'rinxgoals'))[:2]
    them = ''
    for key, value in row.items():
        k = (key or '').lower()
        if 'opponent' in k and ('score' in k or 'goal' in k):
            them = re.sub(r'\D', '', value or '')[:2]
    score, result = '', ''
    if us != '' and them != '':
        score = f'{int(us)}-{int(them)}'
        result = 'W' if int(us) > int(them) else ('L' if int(us) < int(them) else 'T')
    return {
        'Submitted': submitted(column(row, 'timestamp')),
        'Action': 'Score' if report or score else 'Upcoming',
        'Team': f'{hit[1]}U',
        'Type': 'Exhibition',
        'Date': date,
        'Time': form_time(column(row, 'starttime', 'gametime') or row.get('Time', '')),
        'Opponent': opponent,
        'Logo': save_logo(column(row, 'logo'), opponent),
        'Rink': clean(column(row, 'rink')),
        'Score': score,
        'Result': result,
        'Status': clean(column(row, 'status'), 20),
    }


def main():
    try:
        req = urllib.request.Request(CSV_URL, headers={'User-Agent': 'rinx-form-games'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            text = resp.read().decode('utf-8-sig')
    except Exception as err:
        print(f'Form responses unavailable, keeping the current file: {err}')
        return 0
    if not text.lower().startswith('timestamp'):
        print('Unexpected reply (is the sheet still published as CSV?), keeping the current file.')
        return 0
    games = [g for g in (to_game(r) for r in csv.DictReader(io.StringIO(text))) if g]
    games.sort(key=lambda g: g['Submitted'])
    body = json.dumps({'data': games}, indent=1, ensure_ascii=False) + '\n'
    if OUT.exists() and OUT.read_text() == body:
        print(f'No new form games ({len(games)} total).')
        return 0
    OUT.write_text(body)
    print(f'{OUT.name}: {len(games)} games')
    return 0


if __name__ == '__main__':
    sys.exit(main())
