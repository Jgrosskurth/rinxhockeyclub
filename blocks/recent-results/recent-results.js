/*
 * Recent Results Block
 * One team at a time (10U by default): its last three finals, then its next
 * five games, as a scrolling rail. The team tabs stay in step with the hero's
 * "Next up" card. Data comes from the GameSheet feeds (see team-feeds.js).
 */
import {
  TEAMS, DEFAULT_TEAM, loadTeamGames, resultBadge, selectTeam, onTeamChange,
} from '../../scripts/team-feeds.js';

const FINALS = 3;
const UPCOMING = 5;

function card(g, isNext) {
  let top = g.dayLabel;
  let cls = 'fx';
  if (g.result) {
    top = `Final · ${g.dayLabel}`;
    cls += ' fx-final';
  } else if (isNext) {
    top = `Next · ${g.dayLabel}`;
    cls += ' fx-next';
  }
  const logo = g.oppLogo
    ? `<img src="${g.oppLogo}" alt="" width="26" height="26" loading="lazy" onerror="this.style.visibility='hidden'">`
    : '<span class="fx-logo-gap"></span>';
  const res = g.result
    ? `<p class="fx-res">${resultBadge(g.result)}<span>${g.score}</span></p>`
    : `<p class="fx-res"><span>${g.time || 'TBA'}</span></p>`;
  return `<li class="${cls}">
    <p class="fx-top">${top}</p>
    <p class="fx-opp">${logo}<span>${g.prefix} ${g.opp}</span></p>
    ${res}
    <p class="fx-meta">${g.home ? 'The Rinx' : g.location}</p>
  </li>`;
}

// Open on the next game when it would start off-screen (phones). The section
// may still be hidden while it loads, so wait until the rail has a width.
function openOnNext(rail) {
  const position = () => {
    const next = rail.querySelector('.fx-next');
    rail.scrollLeft = 0;
    if (next && next.offsetLeft + next.offsetWidth > rail.clientWidth) {
      rail.scrollLeft = next.offsetLeft - rail.firstElementChild.offsetLeft;
    }
  };
  if (rail.clientWidth) {
    position();
    return;
  }
  const ro = new ResizeObserver(() => {
    if (!rail.clientWidth) return;
    ro.disconnect();
    position();
  });
  ro.observe(rail);
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.innerHTML = `
    <div class="rr-inner">
      <h2 class="rr-title">Results &amp; upcoming games</h2>
      <div class="team-toggle" role="group" aria-label="Team">
        ${Object.values(TEAMS).map((t) => `<button type="button" data-team="${t.key}" aria-pressed="${t.key === DEFAULT_TEAM}">${t.label}</button>`).join('')}
      </div>
      <ul class="fx-rail" tabindex="0"></ul>
    </div>`;

  const rail = block.querySelector('.fx-rail');
  const buttons = [...block.querySelectorAll('.team-toggle button')];
  let shown = null;

  const show = async (key) => {
    shown = key;
    const team = TEAMS[key];
    buttons.forEach((b) => b.setAttribute('aria-pressed', b.dataset.team === key));
    rail.setAttribute('aria-label', `${team.label} results and upcoming games, scroll for more`);
    try {
      const { finals, upcoming } = await loadTeamGames(key);
      if (shown !== key) return;
      const games = [...finals.slice(-FINALS), ...upcoming.slice(0, UPCOMING)];
      if (!games.length) {
        rail.innerHTML = `<li class="fx fx-note">No ${team.label} games are posted yet.</li>`;
        return;
      }
      const nextIndex = Math.min(finals.slice(-FINALS).length, games.length - 1);
      rail.innerHTML = games.map((g, i) => card(g, i === nextIndex && !g.result)).join('');
      openOnNext(rail);
    } catch {
      if (shown !== key) return;
      rail.innerHTML = `<li class="fx fx-note">Results are unavailable right now. <a href="${team.schedulePath}">${team.label} schedule</a></li>`;
    }
  };

  buttons.forEach((b) => b.addEventListener('click', () => {
    selectTeam(b.dataset.team);
    if (shown !== b.dataset.team) show(b.dataset.team);
  }));
  onTeamChange((key) => { if (shown !== key) show(key); });
  show(DEFAULT_TEAM);
}
