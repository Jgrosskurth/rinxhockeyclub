export default function decorate(block) {
  block.innerHTML = `
    <div class="header-inner">
      <div class="header-logo" onclick="window.location.href='/'">
        <img src="/images/A9FBB1FE-F41E-4CE4-8E6D-C9099AD82806.JPG" alt="Rinx Hockey Club" width="68" height="68"
             onerror="this.style.display='none'">
        <div class="header-text">
          <span class="header-title">Rinx Hockey Club</span>
          <span class="header-subtitle">Travel Hockey &bull; Hauppauge, NY</span>
        </div>
      </div>

      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>

      <nav class="header-nav" id="header-nav">
        <a href="/">Home</a>
        <div class="nav-dropdown">
          <a href="/roster" class="nav-dropdown-toggle">Roster</a>
          <div class="nav-dropdown-menu">
            <a href="/roster">10U Squirts</a>
            <a href="/roster-14u">14U Bantam</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <a href="/schedule" class="nav-dropdown-toggle">Schedule</a>
          <div class="nav-dropdown-menu">
            <a href="/schedule">10U Squirts</a>
            <a href="/schedule-14u">14U Bantam</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <a href="/stats" class="nav-dropdown-toggle">Stats</a>
          <div class="nav-dropdown-menu">
            <a href="/stats">10U Squirts</a>
            <a href="/stats-14u">14U Bantam</a>
          </div>
        </div>
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

  // Mobile dropdown toggles
  block.querySelectorAll('.nav-dropdown-toggle').forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        toggle.closest('.nav-dropdown').classList.toggle('open');
      }
    });
  });
}
