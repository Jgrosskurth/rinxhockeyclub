/*
 * Recent Results Block
 * Shows each team's most recent completed games as cards, from the GameSheet
 * JSON feeds produced by the pull-gamesheet workflow. A 10U/14U toggle switches
 * teams. Falls back to a live-results link if a feed is unavailable.
 */

const FEED_BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/data';
const MHR_CDN = 'https://ranktech-cdn.s3.us-east-2.amazonaws.com/myhockey_prod/logos/';

const TEAMS = {
  '10u': { label: '10U Squirts', feed: 'schedule-10u.json', schedulePath: '/schedule' },
  '14u': { label: '14U Bantam', feed: 'schedule-14u.json', schedulePath: '/schedule-14u' },
};

// Opponents whose crest is uploaded to the site (keyed by lowercased name).
const LOCAL_LOGOS = {
  'dix hills selects': '/images/dh.png',
  'beaver dam': '/images/beaverdam.png',
  'white plains': '/images/whiteplains.png',
  'iceworks islanders': '/images/iceworks-islanders.webp',
};

// Opponents on the MyHockeyRankings logo CDN (keyed by a substring of the name).
const TEAM_LOGOS = {
  aviator: '001dfe',
  'north park': '002ee8',
  'great neck': '001934',
  lightning: '0004c5',
  sharks: '000bd3',
  wildcats: '00153e',
  peconic: '00153e',
  'long beach': '0004c5',
};

function logoFor(opp) {
  const lower = opp.toLowerCase();
  const local = Object.keys(LOCAL_LOGOS).find((k) => lower.includes(k));
  if (local) return LOCAL_LOGOS[local];
  const id = Object.keys(TEAM_LOGOS).find((k) => lower.includes(k));
  return id ? `${MHR_CDN}${TEAM_LOGOS[id]}_a.png` : '';
}

function renderCards(block, games, team) {
  const grid = block.querySelector('.rr-grid');
  // Most recent completed games first.
  const recent = games.filter((g) => g.result).slice(-5).reverse();

  if (!recent.length) {
    grid.innerHTML = `<div class="rr-cta">
      <p class="rr-cta-text">No ${team.label} results yet — check back after the first game.</p>
    </div>`;
    return;
  }

  grid.innerHTML = recent.map((g) => {
    const ini = g.opp.split(' ').slice(0, 2).map((w) => w[0])
      .join('')
      .toUpperCase();
    let badge = 'rr-tie';
    if (g.result === 'W') badge = 'rr-win';
    else if (g.result === 'L') badge = 'rr-loss';
    const src = logoFor(g.opp);
    const logoImg = src
      ? `<img class="rr-logo-img" src="${src}" alt="${g.opp}" width="36" height="36" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    return `
      <div class="rr-card" data-result="${g.result}">
        <div class="rr-date">${g.date}</div>
        <div class="rr-team">
          ${logoImg}
          <div class="rr-logo"${src ? ' style="display:none"' : ''}>${ini}</div>
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
  }).join('');
}

// Clean up GameSheet's verbose ALL-CAPS / coded team names for display.
function tidy(name) {
  let s = (name || '').trim();
  s = s.replace(/^TB\s+/i, '').replace(/^NYH?\d+(?:[-\s]\d+)?[-\s]*/i, '');
  s = s.replace(/[-\s]*\b\d{1,2}U\b.*$/i, '').replace(/^[-–\s]+|[-–\s]+$/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  if (s && s === s.toUpperCase()) s = s.toLowerCase().replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
  return s || name;
}

async function loadTeam(team) {
  const resp = await fetch(`${FEED_BASE}/${team.feed}`);
  if (!resp.ok) throw new Error(`feed ${resp.status}`);
  const data = await resp.json();
  return (data.games || []).map((g) => ({
    date: g.date,
    opp: tidy(g.opponent),
    loc: g.venue === 'Home' ? g.location : `@ ${g.location}`,
    score: g.score,
    result: g.result,
  }));
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

  const cache = {};
  const grid = block.querySelector('.rr-grid');

  const show = async (key) => {
    const team = TEAMS[key];
    const link = block.querySelector('.rr-link a');
    if (link) link.href = team.schedulePath;
    grid.innerHTML = '<div class="rr-loading"><div class="spinner"></div></div>';
    try {
      if (!cache[key]) cache[key] = await loadTeam(team);
      renderCards(block, cache[key], team);
    } catch {
      grid.innerHTML = `<div class="rr-cta">
        <p class="rr-cta-text">Results are temporarily unavailable.</p>
        <a class="rr-cta-btn" href="${team.schedulePath}">View Full Schedule &rarr;</a>
      </div>`;
    }
  };

  block.querySelectorAll('.rr-pick').forEach((btn) => {
    btn.addEventListener('click', () => {
      block.querySelectorAll('.rr-pick').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      show(btn.dataset.team);
    });
  });

  show('10u');
}
