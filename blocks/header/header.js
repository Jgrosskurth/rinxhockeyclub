export default function decorate(block) {
  block.innerHTML = `
    <div class="header-inner">
      <div class="header-logo" onclick="window.location.href='/'">
        <img src="/icons/rinxlogo.png" alt="Rinx Hockey Club" width="68" height="68"
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
        <a href="https://rinxspring2026.itemorder.com/shop/home/" target="_blank" class="nav-shop">Shop Gear</a>
      </nav>
    </div>
  `;

  const hamburger = block.querySelector('#hamburger');
  const nav = block.querySelector('#header-nav');
  hamburger.addEventListener('click', () => nav.classList.toggle('open'));

  const path = window.location.pathname.replace(/\/$/, '') || '/';
  block.querySelectorAll('nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === '/')) a.classList.add('active');
  });
}
