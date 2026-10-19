// "Game Update" news cards for the homepage's news-slider block, one per
// completed game. The cards are written by .github/scripts/build_news.py
// (run by the pull-schedule workflow) into data/game-news.json: league games
// from LI Hockey's recap, tournament games from the GameSheet box score, in
// order of when they were played.

const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

/**
 * Parse "Sep 27, 2026" / "September 27, 2026" into a local Date, or null.
 * @param {string} str
 */
export function parseNewsDate(str) {
  const m = (str || '').match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (!m) return null;
  const month = MONTHS.findIndex((name) => name.slice(0, 3).toLowerCase() === m[1].toLowerCase());
  return month < 0 ? null : new Date(+m[3], month, +m[2]);
}

/**
 * Game Update cards, newest game first. `time` is the game's start (local),
 * so same-day games keep their real order. Empty if the feed can't load.
 */
export async function loadGameUpdates() {
  try {
    const resp = await fetch(`${FEED_BASE}/game-news.json`);
    if (!resp.ok) return [];
    const { cards = [] } = await resp.json();
    return cards.map((c) => {
      const [y, m, d] = c.iso.split('-').map(Number);
      const [hh, mm] = (c.time || '00:00').split(':').map(Number);
      return {
        tag: 'Game Update',
        title: c.title,
        body: c.body,
        date: c.date,
        time: new Date(y, m - 1, d, hh, mm).getTime(),
        age: c.age,
        link: c.link || '',
        auto: true,
      };
    });
  } catch {
    return [];
  }
}
