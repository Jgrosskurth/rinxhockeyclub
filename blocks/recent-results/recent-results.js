// Live results now live in GameSheet, which we can't read across origins.
// Instead of stale native cards, point each team to its live GameSheet page.
const GAMESHEET_BASE = 'https://gamesheetstats.com/seasons/15381/teams';
const CONFIG = '&configuration%5Blogo%5D=false&configuration%5Bnavigation%5D=false&configuration%5Bfilters%5D=false&configuration%5Blinks%5D=false&configuration%5Bprimary-colour%5D=041E42&configuration%5Bsecondary-colour%5D=C8102E';

const TEAMS = {
  '10u': {
    label: '10U Squirts',
    schedulePath: '/schedule',
    gamesheet: `${GAMESHEET_BASE}/555061/schedule?filter%5Bdivision%5D=83000${CONFIG}`,
  },
  '14u': {
    label: '14U Bantam',
    schedulePath: '/schedule-14u',
    gamesheet: `${GAMESHEET_BASE}/555117/schedule?filter%5Bdivision%5D=83002${CONFIG}`,
  },
};

function renderCTA(block, teamKey) {
  const team = TEAMS[teamKey];
  const grid = block.querySelector('.rr-grid');
  grid.innerHTML = `
    <div class="rr-cta">
      <p class="rr-cta-text">See the latest ${team.label} scores and results, updated live as games are played.</p>
      <a class="rr-cta-btn" href="${team.gamesheet}" target="_blank" rel="noopener">View Live Results &rarr;</a>
    </div>`;

  const link = block.querySelector('.rr-link a');
  if (link) link.href = team.schedulePath;
}

export default function decorate(block) {
  block.innerHTML = `
    <h2 class="section-title">Recent Results</h2>
    <div class="rr-picker">
      <button class="rr-pick active" data-team="10u">10U Squirts</button>
      <button class="rr-pick" data-team="14u">14U Bantam</button>
    </div>
    <div class="rr-grid"></div>
    <p class="rr-link"><a href="/schedule">View Full Schedule &rarr;</a></p>
  `;

  renderCTA(block, '10u');

  block.querySelectorAll('.rr-pick').forEach((btn) => {
    btn.addEventListener('click', () => {
      block.querySelectorAll('.rr-pick').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderCTA(block, btn.dataset.team);
    });
  });
}
