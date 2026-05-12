export default function decorate(block) {
  block.innerHTML = `
    <div class="footer-inner">
      <img src="/icons/rinxlogo.png" alt="Rinx Hockey Club" width="64" height="64"
           class="footer-logo-img" onerror="this.style.display='none'">
      <p class="footer-name">Rinx Hockey Club &bull; Long Island Tier III/A Travel Hockey</p>
      <nav class="footer-nav">
        <a href="/">Home</a>
        <a href="/roster">Roster</a>
        <a href="/schedule">Schedule</a>
        <a href="/stats">Stats</a>
        <a href="/tournaments">Tournaments</a>
        <a href="/sponsors">Sponsors</a>
        <a href="/clinics">Clinics</a>
        <a href="https://rinxspring2026.itemorder.com/shop/home/" target="_blank">Shop Gear</a>
        <a href="/contact">Contact</a>
      </nav>
      <p class="footer-address">The Rinx &bull; 660 Terry Road, Hauppauge, NY 11788 &bull; (631) 232-3222</p>
      <p class="footer-copy">&copy; 2026 Rinx Hockey Club. All rights reserved.</p>
    </div>
  `;
}
