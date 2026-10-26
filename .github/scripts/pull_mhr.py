"""MyHockeyRankings game results for 10U and 14U: data/mhr-<team>.json.

A check on our other sources (GameSheet, LI Hockey, the club's other-games
sheet and the game form): a finished game MyHockeyRankings lists that none of
them has is added to the site, the same way sheet games are (see loadMhrRows
in scripts/team-feeds.js and load_mhr_rows in build_calendars.py). Every other
source wins over it.

MyHockeyRankings is behind Cloudflare, so its pages are read through the
club's Apify account (APIFY_TOKEN, the Website Content Crawler actor, which
respects robots.txt). Each team's main page lists its games: date, start time,
opponent (with MyHockeyRankings' * league / ** tournament marker), rink,
result and score. A team whose page can't be read keeps its saved file.

Run by .github/workflows/pull-mhr.yml. --dump saves the raw pages to
mhr-raw.json for debugging.
"""

import html
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data'
ACTOR = 'apify~website-content-crawler'
SEASON = 2026  # MyHockeyRankings' "y": the 2026-27 season
TEAMS = {
    '10u': f'https://myhockeyrankings.com/team-info/19306/{SEASON}',
    '14u': f'https://myhockeyrankings.com/team-info/34340/{SEASON}',
}
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
TYPES = {'*': 'League', '**': 'Tournament'}  # no marker: an exhibition


def crawl(urls):
    """{url: {'status', 'title', 'html'}} for each page, via the Apify actor."""
    token = os.environ.get('APIFY_TOKEN')
    if not token:
        sys.exit('APIFY_TOKEN not set')
    body = {
        'startUrls': [{'url': u} for u in urls],
        'crawlerType': 'playwright:adaptive',
        'maxCrawlDepth': 0,
        'maxCrawlPages': len(urls),
        'proxyConfiguration': {'useApifyProxy': True},
        'respectRobotsTxtFile': True,
        'saveHtml': True,
        'saveMarkdown': False,
        'htmlTransformer': 'none',
        'removeElementsCssSelector': 'script, style, noscript, svg',
        'removeCookieWarnings': True,
        'blockMedia': True,
    }
    req = urllib.request.Request(
        f'https://api.apify.com/v2/acts/{ACTOR}/run-sync-get-dataset-items?timeout=280&clean=1',
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'},
        method='POST')
    with urllib.request.urlopen(req, timeout=300) as resp:
        items = json.loads(resp.read())
    pages = {}
    for it in items:
        crawl_info = it.get('crawl') or {}
        url = (crawl_info.get('loadedUrl') or it.get('url') or '').rstrip('/')
        pages[url] = {
            'status': crawl_info.get('httpStatusCode'),
            'title': (it.get('metadata') or {}).get('title') or '',
            'html': it.get('html') or '',
        }
    return pages


def full_date(day):
    """'Sep 19' -> 'Sep 19, 2026' (Aug-Dec is the season's first year)."""
    m = re.match(r'([A-Za-z]{3})\s+(\d{1,2})$', day.strip())
    if not m or m[1].title() not in MONTHS:
        return ''
    month = MONTHS.index(m[1].title()) + 1
    return f'{m[1].title()} {int(m[2])}, {SEASON if month >= 8 else SEASON + 1}'


def tidy_name(name):
    """'Great Neck Bruins 14U A1' -> 'Great Neck Bruins 14U' (the level isn't
    part of the name; the site's tidyTeam drops the age group)."""
    name = re.sub(r'\s+', ' ', html.unescape(name)).strip()
    return re.sub(r'(\b\d{1,2}U)\s+(?:AAA|AA|A|BB|B)\d?$', r'\1', name)


def games(page):
    """Finished games on a team page, oldest first."""
    out = []
    # One grid row per game.
    for row in page['html'].split('grid-cols-7')[1:]:
        day = re.search(r'whitespace-nowrap">\s*([A-Z][a-z]{2} \d{1,2})\s*<', row)
        opp = re.search(r'href="/team-info\?y=\d+&amp;t=(\d+)">([^<]+)</a>(\**)', row)
        result = re.search(r'<strong[^>]*>\s*([WLT])\s*</strong>', row)
        score = re.search(r'game_preview\.php\?y=\d+&amp;g=(\d+)">\s*(\d+)\s*-\s*(\d+)', row)
        date = full_date(day[1]) if day else ''
        if not (date and opp and result and score):
            continue  # not a game row, or not played yet
        time = re.search(r'(\d{1,2}):(\d{2})\s*([ap])m', row)
        rink = re.search(r'href="/rink-info\?r=\d+">([^<]+)</a>', row)
        out.append({
            'date': date,
            'time': f'{int(time[1])}:{time[2]} {time[3].upper()}M' if time else '',
            'opponent': tidy_name(opp[2]),
            'type': TYPES.get(opp[3], 'Exhibition'),
            'rink': html.unescape(rink[1]).strip() if rink else '',
            'result': result[1],
            'score': f'{int(score[2])}-{int(score[3])}',
            'mhrGame': score[1],
            'mhrTeam': opp[1],
        })
    return out


def main():
    pages = crawl(list(TEAMS.values()))
    if '--dump' in sys.argv:
        (ROOT / 'mhr-raw.json').write_text(json.dumps(pages, indent=1))
    for key, url in TEAMS.items():
        page = pages.get(url)
        found = games(page) if page else []
        if not found:
            print(f'[mhr] {key}: no games read (status {page and page["status"]}), keeping the saved file')
            continue
        out = DATA / f'mhr-{key}.json'
        old = json.loads(out.read_text()) if out.exists() else {}
        body = {'type': 'mhr', 'team': key, 'url': url,
                'title': page['title'].split(' - ')[0], 'games': found}
        if {k: v for k, v in old.items() if k != 'updated'} == body:
            print(f'[mhr] {key}: no changes ({len(found)} games)')
            continue
        body['updated'] = datetime.now(timezone.utc).isoformat(timespec='seconds')
        out.write_text(json.dumps(body, indent=1, ensure_ascii=False) + '\n')
        print(f'[mhr] {key}: {len(found)} games -> {out.name}')


if __name__ == '__main__':
    main()
