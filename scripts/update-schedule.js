/**
 * Scrapes MyHockeyRankings team page for game results
 * and pushes updated schedule content to DA.
 *
 * Requires DA_TOKEN environment variable.
 * MHR URL: https://myhockeyrankings.com/team-info?t=19306&y=2026
 */

const MHR_URL = 'https://myhockeyrankings.com/team-info?t=19306&y=2026';
const DA_ORG = 'jgrosskurth';
const DA_REPO = 'rinxhockeyclub';

async function fetchMHR() {
  // Use allorigins proxy to bypass CORS
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(MHR_URL)}`;
  const resp = await fetch(proxyUrl);
  if (!resp.ok) throw new Error(`Proxy failed: ${resp.status}`);
  const json = await resp.json();
  return json.contents;
}

function parseGames(html) {
  const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const rows = html.match(rowRegex) || [];
  const stripTags = (s) => s.replace(/<[^>]+>/g, '').trim();

  return rows.map((row) => {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length < 4) return null;

    const dateText = stripTags(cells[0] || '');
    const oppText = stripTags(cells[1] || '');
    const scoreText = stripTags(cells[2] || '');
    const resultText = stripTags(cells[3] || '');

    if (!dateText || !oppText || !/\d/.test(dateText)) return null;
    if (!/(W|L|T|OTL|SOL)/i.test(resultText) && !/(W|L|T)/i.test(scoreText)) return null;

    let result = '';
    if (/^W/i.test(resultText)) result = 'W';
    else if (/^L/i.test(resultText) || /OTL|SOL/i.test(resultText)) result = 'L';
    else if (/^T/i.test(resultText)) result = 'T';

    if (!result) return null;

    const scoreMatch = (`${scoreText} ${resultText}`).match(/(\d+)\s*[-–]\s*(\d+)/);
    const score = scoreMatch ? `${scoreMatch[1]}–${scoreMatch[2]}` : '';

    if (!score) return null;

    return {
      date: dateText,
      opp: oppText.replace(/\s+/g, ' ').trim(),
      loc: '',
      score,
      result,
    };
  }).filter(Boolean);
}

function buildScheduleHTML(games) {
  const rows = games.map((g) => `    <div>\n      <div>${g.date}</div>\n      <div>${g.opp}</div>\n      <div>${g.loc}</div>\n      <div>${g.score}</div>\n      <div>${g.result}</div>\n    </div>`).join('\n');

  return `
<div>
  <h1>Game Schedule</h1>
  <p>2024–2025 Season Results</p>
  <div class="schedule">
${rows}
  </div>
</div>
`;
}

function buildDABody(scheduleContent) {
  return `<body>
  <header></header>
  <main>
    <div>
      <h1>Game Schedule</h1>
      <p>2024–2025 Season Results</p>
      <table>
        <tr><th colspan="5">schedule</th></tr>
${scheduleContent}
      </table>
    </div>
  </main>
  <footer></footer>
</body>`;
}

function gamesToDARows(games) {
  return games.map((g) => `        <tr><td>${g.date}</td><td>${g.opp}</td><td>${g.loc}</td><td>${g.score}</td><td>${g.result}</td></tr>`).join('\n');
}

async function pushToDA(html) {
  const token = process.env.DA_TOKEN;
  if (!token) {
    console.log('No DA_TOKEN set — skipping DA push');
    return;
  }

  const resp = await fetch(`https://admin.da.live/source/${DA_ORG}/${DA_REPO}/schedule.html`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/html',
    },
    body: html,
  });

  if (!resp.ok) {
    console.error(`DA push failed: ${resp.status}`);
    return;
  }

  console.log('Schedule pushed to DA successfully');

  // Re-save to trigger publish
  const content = await (await fetch(`https://admin.da.live/source/${DA_ORG}/${DA_REPO}/schedule.html`, {
    headers: { Authorization: `Bearer ${token}` },
  })).text();

  await fetch(`https://admin.da.live/source/${DA_ORG}/${DA_REPO}/schedule.html`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/html',
    },
    body: content,
  });

  console.log('Schedule republished');
}

async function main() {
  try {
    console.log('Fetching MHR page...');
    const html = await fetchMHR();
    console.log(`Got ${html.length} chars from MHR`);

    const games = parseGames(html);
    console.log(`Parsed ${games.length} games`);

    if (games.length === 0) {
      console.log('No games found — MHR page structure may have changed. Skipping update.');
      return;
    }

    const daRows = gamesToDARows(games);
    const daBody = buildDABody(daRows);

    await pushToDA(daBody);

    // Also update local content file
    const localContent = buildScheduleHTML(games);
    const fs = await import('fs');
    fs.writeFileSync('content/schedule.plain.html', localContent);
    console.log('Local content/schedule.plain.html updated');
  } catch (e) {
    console.error('Schedule update failed:', e.message);
    process.exit(1);
  }
}

main();
