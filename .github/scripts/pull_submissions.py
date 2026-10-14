"""Copy exhibition games sent in through /submit-game into data/submitted-games.json.

The form posts to a Google Apps Script web app (tools/game-submissions/Code.gs)
that stores each submission in the club's Google Sheet. This script reads the
public columns back and writes them in the other-games sheet's shape, which
scripts/team-feeds.js and build_calendars.py merge with the DA sheet.

The web app URL is read from the "Submit to" row of the form on the
/submit-game page (or the SUBMISSIONS_URL environment variable). If the URL is
missing or the sheet can't be read, the current file is left as it is.
"""

import json
import os
import re
import sys
import urllib.request
from pathlib import Path

SITE = 'https://www.rinxhockeyclub.com'
OUT = Path(__file__).resolve().parents[2] / 'data' / 'submitted-games.json'
COLUMNS = ['Submitted', 'Action', 'Team', 'Type', 'Date', 'Time', 'Opponent', 'Logo', 'Rink',
           'Score', 'Result']
ENDPOINT = re.compile(r"https://script\.google\.com/(?:a/[^/\s\"<>]+/)?macros/s/[A-Za-z0-9_-]+/exec")


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'rinx-submissions'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode()


def endpoint():
    url = (os.environ.get('SUBMISSIONS_URL') or '').strip()
    if url:
        return url
    try:
        found = ENDPOINT.search(fetch(f'{SITE}/submit-game.plain.html'))
    except Exception as err:
        print(f'/submit-game unavailable: {err}')
        return ''
    return found[0] if found else ''


def clean(value, size):
    return re.sub(r'\s+', ' ', re.sub(r'[\x00-\x1f<>]', ' ', str(value or ''))).strip()[:size]


def main():
    url = endpoint()
    if not url:
        print('No submissions web app set on /submit-game yet; nothing to do.')
        return 0
    try:
        body = json.loads(fetch(url))
    except Exception as err:
        print(f'Submissions sheet unavailable, keeping the current file: {err}')
        return 0
    if not body.get('ok') or not isinstance(body.get('data'), list):
        print('Unexpected reply from the submissions sheet, keeping the current file.')
        return 0

    rows = []
    for r in body['data']:
        if not isinstance(r, dict):
            continue
        row = {k: clean(r.get(k), 300 if k == 'Logo' else 80) for k in COLUMNS}
        if row['Logo'] and not re.match(r'^https://[^\s"\'<>]+$', row['Logo']):
            row['Logo'] = ''
        if re.match(r'^(10|14)U$', row['Team'], re.I) and row['Date'] and row['Opponent']:
            rows.append(row)
    rows.sort(key=lambda r: r['Submitted'])

    text = json.dumps({'data': rows}, indent=1, ensure_ascii=False) + '\n'
    if OUT.exists() and OUT.read_text() == text:
        print(f'No new submissions ({len(rows)} total).')
        return 0
    OUT.write_text(text)
    print(f'{OUT.name}: {len(rows)} submitted games')
    return 0


if __name__ == '__main__':
    sys.exit(main())
