export default async function decorate(block) {
  block.innerHTML = '<div class="rr-loading"><div class="spinner"></div></div>';

  try {
    const resp = await fetch('/schedule.plain.html');
    if (!resp.ok) throw new Error('fetch failed');
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const schedBlock = doc.querySelector('.schedule');
    if (!schedBlock) throw new Error('no schedule block');

    const rows = [...schedBlock.children];
    const games = rows.map((row) => {
      const cells = [...row.children];
      return {
        date: cells[0]?.textContent?.trim() || '',
        opp: cells[1]?.textContent?.trim() || '',
        loc: cells[2]?.textContent?.trim() || '',
        score: cells[3]?.textContent?.trim() || '',
        result: cells[4]?.textContent?.trim() || '',
      };
    }).filter((g) => g.opp && g.result);

    const recent = games.slice(-5).reverse();

    block.innerHTML = `
      <h2 class="section-title">Recent Results</h2>
      <div class="rr-grid">
        ${recent.map((g) => {
    const ini = g.opp.split(' ').slice(0, 2).map((w) => w[0])
      .join('')
      .toUpperCase();
    let badge = 'rr-tie';
    if (g.result === 'W') badge = 'rr-win';
    else if (g.result === 'L') badge = 'rr-loss';
    return `
            <div class="rr-card" data-result="${g.result}">
              <div class="rr-date">${g.date}</div>
              <div class="rr-team">
                <div class="rr-logo">${ini}</div>
                <div class="rr-info">
                  <div class="rr-opp">${g.opp}</div>
                  <div class="rr-loc">${g.loc}</div>
                </div>
              </div>
              <div class="rr-bottom">
                <div class="rr-score">${g.score}</div>
                <div class="rr-badge ${badge}">${g.result}</div>
              </div>
            </div>`;
  }).join('')}
      </div>
      <p class="rr-link"><a href="/schedule">View Full Schedule &rarr;</a></p>
    `;
  } catch {
    block.innerHTML = `
      <h2 class="section-title">Recent Results</h2>
      <p>Unable to load recent results. <a href="/schedule">View full schedule &rarr;</a></p>
    `;
  }
}
