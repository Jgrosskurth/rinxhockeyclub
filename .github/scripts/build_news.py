"""Homepage "Game Update" cards, one per completed game: data/game-news.json.

Each card says something specific about its game:
- League games: LI Hockey's recap headline and the recap's opening lines,
  shortened, with LI Hockey's long team names cut down ("Rinx Hockey 10U
  Silver – O'Donoghue" -> "Rinx 10U", "LI Sharks 10U Silver – Davis" -> "LI Sharks").
- Tournament games: written from the GameSheet box score (who scored, the
  winning goalie, where the game fell in the tournament).
- Anything else (no recap yet, exhibitions): a short line from the score,
  with wording rotated so neighbouring cards differ.

Every game appears once, even when GameSheet and LI Hockey both list it, and
cards carry the game's date and start time so the homepage can order them by
when they were played. Runs in pull-schedule.yml after the pulls.
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_calendars import DATA, same_game, tidy_team  # noqa: E402

TEAMS = {
    '10u': {'age': '10U', 'label': '10U Squirts', 'coach': "O['’]Donoghue",
            'events': [('mid-atlantic', 'the Mid-Atlantic Fall Classic', 'Mid-Atlantic')]},
    '14u': {'age': '14U', 'label': '14U Bantams', 'coach': 'Skillman', 'events': []},
}
# LI Hockey's names for players who go by another name on the roster.
NAMES = {'Donald Pierre Canel': 'DJ Pierre Canel', 'Stephen Kull': 'Stevie Kull',
         'Konstantinos Krokidis': 'Kosta Krokidis', 'Joseph Azar': 'Joe Azar'}
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
          'September', 'October', 'November', 'December']
SCORE = re.compile(r'^(\d+)-(\d+)$')
TIME = re.compile(r'(\d{1,2}):(\d{2})\s*([AP])M', re.I)


def read(name):
    try:
        return json.loads((DATA / name).read_text())
    except (OSError, ValueError):
        return {}


def clock(text):
    """'8:15 AM' -> '08:15' (24h), or '' when there's no time."""
    m = TIME.search(text or '')
    if not m:
        return ''
    h = int(m[1]) % 12 + (12 if m[3].upper() == 'P' else 0)
    return f'{h:02d}:{m[2]}'


def sheet_iso(date):
    """'Oct 18, 2026' -> '2026-10-18'."""
    try:
        return datetime.strptime(date.strip(), '%b %d, %Y').strftime('%Y-%m-%d')
    except ValueError:
        return ''


def long_date(iso):
    d = datetime.strptime(iso, '%Y-%m-%d')
    return f'{MONTHS[d.month - 1]} {d.day}, {d.year}'


def tidy_text(s, team):
    """LI Hockey copy -> homepage copy: short team names, roster first names."""
    age, coach = team['age'], team['coach']
    s = s.replace('–', '-').replace('—', '-')
    s = re.sub(rf"Rinx Hockey(?:'s)?\s+{age}\s+Silver\s*-\s*{coach}", f'Rinx {age}', s, flags=re.I)
    s = re.sub(rf"Rinx Hockey\s+{coach}\b", f'Rinx {age}', s)
    s = re.sub(rf"Rinx\s+{coach}\b", f'Rinx {age}', s)
    s = re.sub(r'\bRinx Hockey\b', 'Rinx', s)
    s = re.sub(rf"(?<![A-Z][a-z]{{2}} )(?<!Bradley )\b{coach}\b(?= (?:improved|stayed|moved|remained|kept|fell|is|was))", 'Rinx', s)
    # opponents: "LI Sharks 10U Silver - Davis" -> "LI Sharks"
    s = re.sub(r"\s+\d{1,2}U\s+Silver\s*-\s*[A-Z][\w'’.-]+(?:\s+(?:Jr|Sr)\.?)?", '', s)
    for wrong, right in NAMES.items():
        s = s.replace(wrong, right)
    return re.sub(r'\s+', ' ', s).strip()


def shorten(lead, team, avoid=()):
    """First sentence of the recap's opening paragraph, plus the second when
    both are short. Sentences naming a player in `avoid` (a corrected stat
    line) are dropped."""
    sentences = [x for x in re.split(r'(?<=[.!?])\s+(?=[A-Z“"])', tidy_text(lead, team)) if x]
    sentences = [x for x in sentences if not any(a.split()[-1] in x for a in avoid)]
    if not sentences:
        return ''
    out = sentences[0]
    if len(sentences) > 1 and len(out) < 150 and len(out) + len(sentences[1]) < 270:
        out = f'{out} {sentences[1]}'
    return out


def title_with_age(title, team):
    """Make sure the headline says which team: 'as Rinx Blanks' -> 'as Rinx 10U Blanks'."""
    if team['age'] in title:
        return title
    return re.sub(r'\bRinx\b', f"Rinx {team['age']}", title, count=1)


# ---------- fallback copy (no recap, no box score) ----------
FALLBACK = {
    'win': [('{age} Beats {opp}', 'The {label} beat {opp} {score} {where}.'),
            ('{age} Gets Past {opp}', '{opp} fell to the {label} {score} {where}.'),
            ('{age} Wins {score} Over {opp}', 'A {score} win for the {label} over {opp} {where}.')],
    'tie': [('{age} Ties {opp}', 'The {label} and {opp} skated to a {score} tie {where}.')],
    'loss': [('{age} Falls to {opp}', '{opp} beat the {label} {score} {where}.'),
             ('{age} Drops a Game to {opp}', 'The {label} came up short against {opp}, {score}, {where}.')],
}


def where(game):
    loc = (game.get('location') or '').strip()
    if re.search(r'\brinx\b', loc, re.I):
        return 'at The Rinx'
    return f'at {loc}' if loc else ('at home' if game.get('venue') == 'Home' else 'on the road')


def fallback_card(game, team, n):
    m = SCORE.match(str(game.get('score') or '').replace(' ', ''))
    us, them = int(m[1]), int(m[2])
    kind = {'W': 'win', 'T': 'tie'}.get(game['result'], 'loss')
    title, body = FALLBACK[kind][n % len(FALLBACK[kind])]
    score = f'{max(us, them)}-{min(us, them)}'
    fill = {'age': team['age'], 'label': team['label'], 'opp': tidy_team(game['opponent']),
            'score': score, 'where': where(game)}
    body = body.format(**fill)
    return title.format(**fill), body[0].upper() + body[1:]


# ---------- tournament copy, from the GameSheet box score ----------
GOALS = {2: 'twice', 3: 'a hat trick', 4: 'four goals', 5: 'five goals'}


def last(name):
    return name.split()[-1]


def tournament_card(detail, team, event_name, short_event, record, first):
    rinx = next(t for t in detail['teams'] if 'rinx' in t['name'].lower())
    opp = next(t for t in detail['teams'] if t is not rinx)
    us, them = int(rinx['total']), int(opp['total'])
    opp_name = tidy_team(opp['name'])
    score = f'{max(us, them)}-{min(us, them)}'
    multi = sorted((p for p in rinx['skaters'] if int(p['g'] or 0) >= 2), key=lambda p: -int(p['g']))
    scorers = [p for p in rinx['skaters'] if int(p['g'] or 0) > 0]
    if multi:
        groups = {}
        for p in multi:
            groups.setdefault(int(p['g']), []).append(p['name'])
        parts = []
        for g, names in sorted(groups.items(), reverse=True):
            who = ' and '.join(names) if len(names) <= 2 else ', '.join(names[:-1]) + f' and {names[-1]}'
            verb = 'had' if g == 3 else 'scored'
            parts.append(f"{who} {'each ' if len(names) > 1 else ''}{verb} {GOALS.get(g, f'{g} goals')}")
        lead = ' and '.join(parts)
    elif scorers:
        lead = f'{len(scorers)} different players scored' if len(scorers) > 2 else f"{' and '.join(p['name'] for p in scorers)} scored"
    else:
        lead = ''
    winner = next((g for g in rinx['goalies'] if g.get('wl') == 'W'), None)
    if winner and them == 0:
        goalie = f"{winner['name']} posted the shutout"
    elif winner and winner.get('sv'):
        goalie = f"{winner['name']} made {winner['sv']} saves"
    else:
        goalie = ''
    w, l, t = record
    if first:
        context = f'to open {event_name}'
    else:
        context = f"to improve to {w}-{l}{f'-{t}' if t else ''} at {event_name}"
    verb = {True: 'beat', False: 'lost to'}[us > them] if us != them else 'tied'
    clause = ' and '.join(x for x in (lead, goalie) if x)
    body = f"{clause[0].upper() + clause[1:]} as the {team['label']} {verb} {opp_name} {score} {context}." if clause \
        else f"The {team['label']} {verb} {opp_name} {score} {context}."
    hat = next((p for p in multi if int(p['g']) >= 3), None)
    age = team['age']
    if us <= them:
        title = f'{age} {"Ties" if us == them else "Falls to"} {opp_name} at {short_event}'
    elif hat:
        feat = 'Hat Trick' if int(hat['g']) == 3 else f"{GOALS.get(int(hat['g']), '').split()[0].title()}-Goal Game"
        title = f"{last(hat['name'])}'s {feat} Leads {age} Past {opp_name}"
    elif first:
        title = f'{age} Opens {short_event} With {score} Win Over {opp_name}'
    elif winner and them == 0:
        title = f"{last(winner['name'])} Blanks {opp_name} as {age} Wins {score}"
    elif len(multi) >= 2:
        title = f"{last(multi[0]['name'])}, {last(multi[1]['name'])} Lead {age} Past {opp_name}"
    elif multi:
        title = f"{last(multi[0]['name'])} Scores Twice as {age} Beats {opp_name}"
    else:
        title = f'{age} Beats {opp_name} {score} at {short_event}'
    return title, body


def card(team, iso, time, title, body, link, source):
    return {'age': team['age'], 'iso': iso, 'time': time, 'date': long_date(iso),
            'title': title, 'body': body, 'link': link, 'source': source}


def build():
    corrections = read('lihockey-corrections.json')
    cards = []
    for key, team in TEAMS.items():
        seen = []  # (iso, score) of games already carded for this team

        def taken(iso, score):
            return (iso, score) in seen

        # League games with LI Hockey recaps / box scores
        fixes = corrections.get(key, {})
        for g in read(f'stats-lihockey-{key}.json').get('games', []):
            d = g.get('detail') or {}
            iso = d.get('isoDate')
            if not iso or g.get('result') not in ('W', 'L', 'T'):
                continue
            recap = d.get('recap') or {}
            avoid = list((fixes.get(str(g['id'])) or {}).get('skaters', {}))
            body = shorten(recap.get('lead') or '', team, avoid)
            title = title_with_age(tidy_text(recap.get('title') or '', team), team) if body else ''
            if not body:
                title, body = fallback_card({'opponent': g.get('opponent', ''), 'score': g.get('score', ''),
                                             'result': g['result'], 'location': d.get('venue', ''),
                                             'venue': 'Home' if g.get('home') else 'Away'}, team, len(cards))
            cards.append(card(team, iso, clock(' '.join(d.get('info') or [])), title, body,
                              f"/box-score?team={key}&game={g['id']}", 'lihockey'))
            seen.append((iso, g.get('score')))

        # Tournament games with GameSheet box scores
        for event_key, event_name, short_event in team['events']:
            games = sorted((g for g in read(f'boxscores-{event_key}.json').get('games', []) if (g.get('detail') or {}).get('isoDate')),
                           key=lambda g: (g['detail']['isoDate'], clock(g['detail'].get('time', ''))))
            w = l = t = 0
            for i, g in enumerate(games):
                d = g['detail']
                rinx = next(x for x in d['teams'] if 'rinx' in x['name'].lower())
                opp = next(x for x in d['teams'] if x is not rinx)
                us, them = int(rinx['total']), int(opp['total'])
                w, l, t = w + (us > them), l + (us < them), t + (us == them)
                title, body = tournament_card(d, team, event_name, short_event, (w, l, t), i == 0)
                cards.append(card(team, d['isoDate'], clock(d.get('time', '')), title, body,
                                  f"/box-score?event={event_key}&game={g['id']}", 'gamesheet'))
                seen.append((d['isoDate'], f'{us}-{them}'))

        # Everything else in the schedule feeds (once per game)
        feeds = [f'schedule-{key}.json'] + [f'schedule-{e[0]}.json' for e in team['events']]
        for feed in feeds:
            for g in read(feed).get('games', []):
                iso = sheet_iso(g.get('date', ''))
                score = str(g.get('score') or '').replace(' ', '')
                if not iso or g.get('result') not in ('W', 'L', 'T') or not SCORE.match(score) or taken(iso, score):
                    continue
                if any(c['iso'] == iso and c['age'] == team['age'] and same_game(g, {'date': g['date'], 'opponent': g['opponent']})
                       and c['source'] != 'fallback' and score in c['title'] + c['body'] for c in cards):
                    continue
                title, body = fallback_card(g, team, len(cards))
                cards.append(card(team, iso, clock(g.get('time', '')), title, body, '', 'fallback'))
                seen.append((iso, score))

    cards.sort(key=lambda c: (c['iso'], c['time'] or '00:00'), reverse=True)
    return cards


def main():
    cards = build()
    out = DATA / 'game-news.json'
    body = {'type': 'game-news', 'cards': cards}
    old = read('game-news.json')
    if old == body:
        print(f'game news: no changes ({len(cards)} cards)')
        return
    out.write_text(json.dumps(body, indent=1, ensure_ascii=False) + '\n')
    print(f'game news: {len(cards)} cards')


if __name__ == '__main__':
    main()
