import { GAMES } from '../../scripts/scripts.js';

const MHR_CDN = 'https://ranktech-cdn.s3.us-east-2.amazonaws.com/myhockey_prod/logos/';

function logoTag(game, idx) {
  if (game.logoId) {
    return `<img class="sg-logo" id="slogo-${idx}" src="${MHR_CDN}${game.logoId}_a.png" alt="${game.opp}"
      onerror="this.style.display='none';document.getElementById('sfb-${idx}').style.display='flex';">`;
  }
  return '';
}

function renderRows(games) {
  return games.map((g, idx) => `
    <div class="sg-row" data-result="${g.result}">
      <div class="sg-date">${g.date}</div>
      <div class="sg-opp">
        ${logoTag(g, idx)}
        <div class="sg-logo-fb" id="sfb-${idx}" style="background:${g.color};display:${g.logoId ? 'none' : 'flex'}">
          ${g.opp.split(' ').slice(0,2).map((w)=>w[0]).join('').toUpperCase()}
        </div>
        <div>
          <div class="sg-name">${g.opp}</div>
          <div class="sg-loc">${g.loc}</div>
        </div>
      </div>
      <div class="sg-score">${g.score}</div>
      <div class="sg-result"><span class="badge badge-${g.result === 'W' ? 'win' : g.result === 'L' ? 'loss' : 'tie'}">${g.result}</span></div>
    </div>
  `).join('');
}

export default function decorate(block) {
  const { w, l, t, gf, ga } = { w: 16, l: 13, t: 3, gf: 163, ga: 127 };

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
        🔗 MyHockeyRankings.com &rarr;
      </a>
    </div>

    <div class="schedule-table">
      <div class="sg-header">
        <span>Date</span>
        <span>Opponent</span>
        <span>Score</span>
        <span>Result</span>
      </div>
      <div class="sg-rows">${renderRows(GAMES)}</div>
    </div>

    <p class="schedule-src">2024&ndash;2025 season results &bull; Source: <a href="https://myhockeyrankings.com/team-info?t=19306&y=2025" target="_blank">MyHockeyRankings.com</a></p>
  `;

  // Filter buttons
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
