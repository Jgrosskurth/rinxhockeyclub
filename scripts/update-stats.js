/**
 * Scrapes Ayrabo roster/stats page and updates the rinxstats.csv
 * in the GitHub repo.
 *
 * Ayrabo URL: https://ayrabo.com/sports/1/teams/572/roster/
 * Stats CSV: rinxstats.csv (in repo root)
 */

const AYRABO_URL = 'https://ayrabo.com/sports/1/teams/572/roster/';

async function fetchAyrabo() {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(AYRABO_URL)}`;
  const resp = await fetch(proxyUrl);
  if (!resp.ok) throw new Error(`Proxy failed: ${resp.status}`);
  const json = await resp.json();
  return json.contents;
}

function parseStats(html) {
  const players = [];

  // Ayrabo uses table rows with player stats
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = html.match(rowRegex) || [];

  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length < 5) continue;

    const stripTags = (s) => s.replace(/<[^>]+>/g, '').trim();
    const values = cells.map(stripTags);

    // Look for rows that have numeric stats (GP, G, A, etc.)
    const hasNumbers = values.slice(1).some((v) => /^\d+$/.test(v));
    if (!hasNumbers) continue;

    // Try to identify the column structure
    // Common: #, Name, Pos, GP, G, A, PTS, +/-, PIM
    // or: Name, Pos, GP, G, A, PTS, PIM
    const nameIdx = values.findIndex((v) => /[a-z]/i.test(v) && v.length > 2);
    if (nameIdx === -1) continue;

    players.push({
      name: values[nameIdx] || '',
      num: nameIdx > 0 ? values[0] : '',
      pos: values[nameIdx + 1] || '',
      gp: values[nameIdx + 2] || '',
      g: values[nameIdx + 3] || '',
      a: values[nameIdx + 4] || '',
      pts: values[nameIdx + 5] || '',
      pm: values[nameIdx + 6] || '',
      pim: values[nameIdx + 7] || '',
    });
  }

  return players;
}

function buildCSV(players) {
  const header = '#,Name,Pos,GP,G,A,PTS,+/-,PIM';
  const rows = players.map((p) =>
    `${p.num},${p.name},${p.pos},${p.gp},${p.g},${p.a},${p.pts},${p.pm},${p.pim}`
  );
  return [header, ...rows].join('\n');
}

async function main() {
  try {
    console.log('Fetching Ayrabo page...');
    const html = await fetchAyrabo();
    console.log(`Got ${html.length} chars from Ayrabo`);

    const players = parseStats(html);
    console.log(`Parsed ${players.length} players`);

    if (players.length === 0) {
      console.log('No players found — Ayrabo page structure may have changed. Skipping update.');
      return;
    }

    const csv = buildCSV(players);
    const fs = await import('fs');
    fs.writeFileSync('rinxstats.csv', csv);
    console.log('rinxstats.csv updated');
    console.log(`Stats: ${players.length} players`);
  } catch (e) {
    console.error('Stats update failed:', e.message);
    process.exit(1);
  }
}

main();
