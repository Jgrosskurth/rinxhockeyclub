import { RINX } from '../../scripts/scripts.js';

export default function decorate(block) {
  block.innerHTML = `
    <div class="footer-inner">
      <img src="${RINX.logoUrl}" alt="Rinx Hockey Club" width="64" height="64"
           class="footer-logo-img" onerror="this.style.display='none'">
      <p class="footer-name">Rinx Hockey Club &bull; 10U Squirts</p>
      <nav class="footer-nav">
        <a href="/">Home</a>
        <a href="/roster">Roster</a>
        <a href="/schedule">Schedule</a>
        <a href="/stats">Stats</a>
        <a href="/tournaments">Tournaments</a>
        <a href="/sponsors">Sponsors</a>
        <a href="/clinics">Clinics</a>
        <a href="${RINX.shopUrl}" target="_blank">Shop Gear</a>
        <a href="/contact">Contact</a>
      </nav>
      <p class="footer-address">The Rinx &bull; 660 Terry Road, Hauppauge, NY 11788 &bull; (631) 232-3222</p>
      <p class="footer-copy">&copy; 2026 Rinx Hockey Club &bull; 10U Squirts. All rights reserved.</p>
    </div>
  `;
}
