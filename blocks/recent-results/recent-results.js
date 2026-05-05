const MHR_CDN = 'https://ranktech-cdn.s3.us-east-2.amazonaws.com/myhockey_prod/logos/';

const TEAM_LOGOS = {
  aviators: '001dfe',
  kings: '001ba2',
  'north park': '002ee8',
  'great neck': '001934',
  arrows: '0013c6',
  lions: '00017d',
  lightning: '0004c5',
  sharks: '000bd3',
  edge: '000723',
  hawks: '000f90',
  cyclones: '001589',
  tigers: '00075f',
  express: '001f15',
  wildcats: '00153e',
  vipers: '00000b',
  panthers: '001d53',
  predators: '00133e',
  blues: '00018b',
  'ice devils': '0014fd',
  royals: '001dfe',
  skyliners: '001589',
};

function findLogoId(oppName) {
  const lower = oppName.toLowerCase();
  const keys = Object.keys(TEAM_LOGOS);
  for (let i = 0; i < keys.length; i += 1) {
    if (lower.includes(keys[i])) return TEAM_LOGOS[keys[i]];
  }
  return '';
}

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
    const logoId = findLogoId(g.opp);
    const logoImg = logoId
      ? `<img class="rr-logo-img" src="${MHR_CDN}${logoId}_a.png" alt="${g.opp}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    return `
            <div class="rr-card" data-result="${g.result}">
              <div class="rr-date">${g.date}</div>
              <div class="rr-team">
                ${logoImg}
                <div class="rr-logo"${logoId ? ' style="display:none"' : ''}>${ini}</div>
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
