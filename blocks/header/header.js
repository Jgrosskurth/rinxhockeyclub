export default function decorate(block) {
  block.innerHTML = `
    <div class="header-inner">
      <div class="header-logo" onclick="window.location.href='/'">
        <img src="/images/A9FBB1FE-F41E-4CE4-8E6D-C9099AD82806.JPG" alt="Rinx Hockey Club" width="68" height="68" loading="eager" fetchpriority="high"
             onerror="this.style.display='none'">
        <div class="header-text">
          <span class="header-title">Rinx Hockey Club</span>
          <span class="header-subtitle">Tier III/A &bull; Travel Hockey</span>
        </div>
      </div>

      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>

      <nav class="header-nav" id="header-nav">
        <a href="/">Home</a>
        <div class="nav-dropdown">
          <button class="nav-dropdown-toggle">Roster <span class="nav-plus">+</span></button>
          <div class="nav-dropdown-menu">
            <a href="/roster">10U Squirts</a>
            <a href="/roster-14u">14U Bantam</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <button class="nav-dropdown-toggle">Schedule <span class="nav-plus">+</span></button>
          <div class="nav-dropdown-menu">
            <a href="/schedule">10U Squirts</a>
            <a href="/schedule-14u">14U Bantam</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <button class="nav-dropdown-toggle">Stats <span class="nav-plus">+</span></button>
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

  // Dropdown toggles
  block.querySelectorAll('.nav-dropdown-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const dropdown = toggle.closest('.nav-dropdown');
      const wasOpen = dropdown.classList.contains('open');
      // Close all other dropdowns
      block.querySelectorAll('.nav-dropdown').forEach((d) => d.classList.remove('open'));
      if (!wasOpen) dropdown.classList.add('open');
    });
  });
}
