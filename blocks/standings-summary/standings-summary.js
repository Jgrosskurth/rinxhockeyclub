/*
 * Standings Summary Block
 * Homepage snapshot of both league divisions: the top five teams (plus Rinx if
 * it sits lower), with team logos, from the GameSheet standings feeds.
 */
import { TEAMS, loadStandings } from '../../scripts/team-feeds.js';

const TOP = 5;

function rowsFor(rows) {
  const top = rows.slice(0, TOP);
  const ours = rows.find((r) => r.ours);
  if (ours && !top.includes(ours)) top.push(ours);
  return top;
}

function table(rows) {
  return `<table class="ss-table">
    <thead><tr><th scope="col">#</th><th scope="col">Team</th><th scope="col">GP</th><th scope="col">W-L-T</th><th scope="col">PTS</th></tr></thead>
    <tbody>${rowsFor(rows).map((r, i) => `
      <tr${r.ours ? ' class="ss-ours"' : ''} style="--i: ${i}">
        <td>${r.rank}</td>
        <td><span class="ss-team">${r.logo ? `<img src="${r.logo}" alt="" width="28" height="28" loading="lazy" onerror="this.style.visibility='hidden'">` : '<span class="ss-logo-gap"></span>'}${r.name}</span></td>
        <td>${r.gp}</td>
        <td>${r.record}</td>
        <td>${r.pts}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

async function fill(card, team) {
  const body = card.querySelector('.ss-body');
  try {
    const { division, rows } = await loadStandings(team.key);
    card.querySelector('.ss-div').textContent = division;
    body.innerHTML = rows.length ? table(rows) : '<p class="ss-note">Standings will appear after the first league games.</p>';
  } catch {
    body.innerHTML = '<p class="ss-note">Standings are unavailable right now.</p>';
  }
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.innerHTML = `
    <div class="ss-inner">
      <h2 class="section-title">Standings</h2>
      <div class="ss-grid">
        ${Object.values(TEAMS).map((t) => `
          <article class="ss-card" data-team="${t.key}">
            <h3>${t.label}</h3>
            <p class="ss-div"></p>
            <div class="ss-body"></div>
            <a class="ss-more" href="${t.standingsPath}">Full ${t.key.toUpperCase()} standings →</a>
          </article>`).join('')}
      </div>
    </div>`;

  const cards = [...block.querySelectorAll('.ss-card')];
  cards.forEach((c) => fill(c, TEAMS[c.dataset.team]));

  // Rows settle into place the first time each table is seen.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  block.classList.add('ss-motion');
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('ss-in');
    io.unobserve(e.target);
  }), { threshold: 0.25 });
  cards.forEach((c) => io.observe(c));
}
