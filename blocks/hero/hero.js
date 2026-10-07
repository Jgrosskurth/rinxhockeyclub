import {
  TEAMS, DEFAULT_TEAM, loadTeamGames, calendarUrl, selectTeam, onTeamChange,
} from '../../scripts/team-feeds.js';
import { RINX_LOGO } from '../../scripts/team-logos.js';

// Rink diagram under an 88% navy wash: boards, centre red line, blue lines,
// face-off circles and goal creases.
const RINK = `
  <svg class="hero-rink" viewBox="0 0 1200 560" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="1200" height="560" fill="#dbe8f5"/>
    <rect x="6" y="6" width="1188" height="548" fill="none" stroke="#041E42" stroke-width="12" rx="120"/>
    <line x1="600" y1="0" x2="600" y2="560" stroke="#C8102E" stroke-width="8"/>
    <line x1="380" y1="0" x2="380" y2="560" stroke="#041E42" stroke-width="6" opacity="0.7"/>
    <line x1="820" y1="0" x2="820" y2="560" stroke="#041E42" stroke-width="6" opacity="0.7"/>
    <circle cx="600" cy="280" r="120" fill="none" stroke="#C8102E" stroke-width="5" opacity="0.5"/>
    <circle cx="280" cy="180" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
    <circle cx="280" cy="380" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
    <circle cx="920" cy="180" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
    <circle cx="920" cy="380" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
    <path d="M60 230 Q130 230 130 280 Q130 330 60 330" fill="none" stroke="#C8102E" stroke-width="4" opacity="0.35"/>
    <path d="M1140 230 Q1070 230 1070 280 Q1070 330 1140 330" fill="none" stroke="#C8102E" stroke-width="4" opacity="0.35"/>
    <rect width="1200" height="560" fill="#041E42" opacity="0.88"/>
  </svg>`;

const side = (logo, name, away) => `
  <p class="np-side${away ? ' np-away' : ''}">
    ${logo ? `<img src="${logo}" alt="" width="56" height="56" loading="lazy" onerror="this.style.visibility='hidden'">` : '<span class="np-logo-gap"></span>'}
    <span>${name}</span>
  </p>`;

function renderNext(panel, key, { upcoming }) {
  const next = upcoming[0];
  if (!next) {
    panel.innerHTML = `
      <div class="np-head"><h2>Next up</h2></div>
      <p class="np-empty">No upcoming ${TEAMS[key].label} games are posted yet.</p>`;
    return;
  }
  const cal = calendarUrl(next, key);
  panel.innerHTML = `
    <div class="np-head"><h2>Next up</h2><p class="np-comp">${next.competition}</p></div>
    <p class="np-when"><span class="np-date">${next.dayLabel}</span>${next.time ? `<span class="np-time">${next.time}</span>` : ''}</p>
    <div class="np-match">
      ${side(RINX_LOGO, 'Rinx')}
      <p class="np-vs">vs</p>
      ${side(next.oppLogo, next.opp, true)}
    </div>
    <p class="np-where">${next.home ? 'The Rinx · Home' : next.location}</p>
    ${cal ? `<p class="np-actions"><a class="np-cal" href="${cal}" target="_blank" rel="noopener">Add to calendar</a></p>` : ''}`;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const season = block.querySelector('p')?.textContent.trim() || '2026–2027 Season';

  block.innerHTML = `
    <div class="hero-inner">
      ${RINK}
      <div class="hero-grid">
        <div class="hero-ident">
          <img src="${RINX_LOGO}" alt="Rinx Hockey Club crest" class="hero-logo" width="140" height="140" fetchpriority="high">
          <h1>Rinx <span>Hockey</span><br>Club</h1>
          <p class="hero-badge">${season}</p>
          <p class="hero-tagline">Travel Hockey &bull; Long Island, New York</p>
          <p class="hero-actions"><a href="/contact">Contact</a></p>
        </div>
        <div class="nextup">
          <div class="team-toggle" role="group" aria-label="Team">
            ${Object.values(TEAMS).map((t) => `<button type="button" data-team="${t.key}" aria-pressed="${t.key === DEFAULT_TEAM}">${t.label}</button>`).join('')}
          </div>
          <div class="np" aria-live="polite"><p class="np-loading">Loading the next game…</p></div>
        </div>
      </div>
    </div>`;

  const panel = block.querySelector('.np');
  const buttons = [...block.querySelectorAll('.team-toggle button')];
  let shown = null;

  const show = async (key) => {
    shown = key;
    buttons.forEach((b) => b.setAttribute('aria-pressed', b.dataset.team === key));
    try {
      const games = await loadTeamGames(key);
      if (shown === key) renderNext(panel, key, games);
    } catch {
      if (shown !== key) return;
      panel.innerHTML = `
        <div class="np-head"><h2>Next up</h2></div>
        <p class="np-empty">The schedule is unavailable right now.</p>
        <p class="np-actions"><a class="np-cal" href="${TEAMS[key].schedulePath}">${TEAMS[key].label} schedule</a></p>`;
    }
  };

  buttons.forEach((b) => b.addEventListener('click', () => {
    selectTeam(b.dataset.team);
    if (shown !== b.dataset.team) show(b.dataset.team);
  }));
  onTeamChange((key) => { if (shown !== key) show(key); });
  show(DEFAULT_TEAM);
}
