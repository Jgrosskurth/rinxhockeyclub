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
  rebels: '000723',
  'red wings': '001589',
  wolfpack: '000f90',
  phantoms: '001ba2',
  mustangs: '00075f',
  bears: '000f90',
  wizards: '00153e',
  wolves: '000bd3',
  flames: '001589',
  outlaws: '001d53',
  whalers: '001ba2',
  capitals: '001dfe',
  ramparts: '00133e',
  storm: '0004c5',
  admirals: '00018b',
  advantage: '001f15',
  'sound tigers': '001ba2',
};

function findLogoId(oppName) {
  const lower = oppName.toLowerCase();
  const keys = Object.keys(TEAM_LOGOS);
  for (let i = 0; i < keys.length; i += 1) {
    if (lower.includes(keys[i])) return TEAM_LOGOS[keys[i]];
  }
  return '';
}

function renderRows(games) {
  return games.map((g) => {
    const ini = g.opp.split(' ').slice(0, 2).map((w) => w[0])
      .join('')
      .toUpperCase();
    let badge = 'tie';
    if (g.result === 'W') badge = 'win';
    else if (g.result === 'L') badge = 'loss';
    const logoId = findLogoId(g.opp);
    const logoImg = logoId
      ? `<img class="sg-logo" src="${MHR_CDN}${logoId}_a.png" alt="${g.opp}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    return `
    <div class="sg-row" data-result="${g.result}">
      <div class="sg-date">${g.date}</div>
      <div class="sg-opp">
        ${logoImg}
        <div class="sg-logo-fb"${logoId ? ' style="display:none"' : ''}>${ini}</div>
        <div>
          <div class="sg-name">${g.opp}</div>
          <div class="sg-loc">${g.loc}</div>
        </div>
      </div>
      <div class="sg-score">${g.score}</div>
      <div class="sg-result"><span class="badge badge-${badge}">${g.result}</span></div>
    </div>`;
  }).join('');
}

export default function decorate(block) {
  const rows = [...block.children];
  const games = rows.map((row) => {
    const cells = [...row.children];
    return {
      date: cells[0]?.textContent?.trim() || '',
      opp: cells[1]?.textContent?.trim() || '',
      loc: cells[2]?.textContent?.trim() || '',
      score: cells[3]?.textContent?.trim() || '',
      result: cells[4]?.textContent?.trim() || '',
    };
  }).filter((g) => g.opp);

  const w = games.filter((g) => g.result === 'W').length;
  const l = games.filter((g) => g.result === 'L').length;
  const t = games.filter((g) => g.result === 'T').length;
  const gf = games.reduce((s, g) => s + (parseInt(g.score?.split(/[-–]/)[0], 10) || 0), 0);
  const ga = games.reduce((s, g) => s + (parseInt(g.score?.split(/[-–]/)[1], 10) || 0), 0);

  block.innerHTML = `
    <div class="schedule-summary">
      <div class="sum-tile navy"><span class="sum-num">${w}</span><span class="sum-lbl">Wins</span></div>
      <div class="sum-tile navy"><span class="sum-num">${l}</span><span class="sum-lbl">Losses</span></div>
      <div class="sum-tile navy"><span class="sum-num">${t}</span><span class="sum-lbl">Ties</span></div>
      <div class="sum-tile red"><span class="sum-num">${gf}</span><span class="sum-lbl">Goals For</span></div>
      <div class="sum-tile navy-light"><span class="sum-num">${ga}</span><span class="sum-lbl">Goals Against</span></div>
    </div>

    <div class="schedule-controls">
      <div class="filter-buttons">
        <button class="filter-btn active" data-filter="all">All Games</button>
        <button class="filter-btn" data-filter="W">Wins</button>
        <button class="filter-btn" data-filter="L">Losses</button>
        <button class="filter-btn" data-filter="T">Ties</button>
      </div>
      <a href="https://myhockeyrankings.com/team-info?t=19306&y=2025" target="_blank" class="mhr-link">
        MyHockeyRankings.com &rarr;
      </a>
    </div>

    <div class="schedule-table">
      <div class="sg-header">
        <span>Date</span>
        <span>Opponent</span>
        <span>Score</span>
        <span>Result</span>
      </div>
      <div class="sg-rows">${renderRows(games)}</div>
    </div>

    <p class="schedule-src">2024&ndash;2025 season results &bull; Source: <a href="https://myhockeyrankings.com/team-info?t=19306&y=2025" target="_blank">MyHockeyRankings.com</a></p>
  `;

  block.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      block.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      block.querySelectorAll('.sg-row').forEach((row) => {
        row.style.display = (f === 'all' || row.dataset.result === f) ? 'grid' : 'none';
      });
    });
  });
}
