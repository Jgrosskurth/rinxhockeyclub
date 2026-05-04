import { RINX } from '../../scripts/scripts.js';

export default function decorate(block) {
  block.innerHTML = `
    <div class="header-inner">
      <div class="header-logo" onclick="window.location.href='/'">
        <img src="${RINX.logoUrl}" alt="Rinx Hockey Club" width="64" height="64"
             onerror="this.style.display='none'">
        <div class="header-text">
          <span class="header-title">Rinx Hockey Club</span>
          <span class="header-subtitle">10U Squirts &bull; Travel Hockey</span>
        </div>
      </div>

      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>

      <nav class="header-nav" id="header-nav">
        <a href="/">Home</a>
        <a href="/roster">Roster</a>
        <a href="/schedule">Schedule</a>
        <a href="/stats">Stats</a>
        <a href="/tournaments">Tournaments</a>
        <a href="/sponsors">Sponsors</a>
        <a href="/clinics">Clinics</a>
        <a href="/contact">Contact</a>
        <a href="${RINX.shopUrl}" target="_blank" class="nav-shop">🛒 Shop Gear</a>
      </nav>
    </div>
  `;

  // Mobile menu
  const hamburger = block.querySelector('#hamburger');
  const nav = block.querySelector('#header-nav');
  hamburger.addEventListener('click', () => nav.classList.toggle('open'));

  // Active link
  const path = window.location.pathname;
  block.querySelectorAll('nav a').forEach((a) => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}
