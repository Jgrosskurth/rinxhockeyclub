export default function decorate(block) {
  const row = block.children[0];
  const cell = row?.children[0];
  const paragraphs = [...(cell?.querySelectorAll('p') || [])];
  const season = paragraphs[0]?.textContent || '2026–2027 Season';

  block.innerHTML = `
    <div class="hero-inner">
      <svg class="hero-rink" viewBox="0 0 1200 560" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="rinkG" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#e8f4fc"/>
            <stop offset="100%" stop-color="#bcd6f0"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="560" fill="url(#rinkG)"/>
        <rect width="1200" height="560" fill="none" stroke="#041E42" stroke-width="12" rx="120"/>
        <line x1="600" y1="0" x2="600" y2="560" stroke="#C8102E" stroke-width="8"/>
        <line x1="380" y1="0" x2="380" y2="560" stroke="#041E42" stroke-width="6" opacity="0.7"/>
        <line x1="820" y1="0" x2="820" y2="560" stroke="#041E42" stroke-width="6" opacity="0.7"/>
        <circle cx="600" cy="280" r="120" fill="none" stroke="#C8102E" stroke-width="5" opacity="0.5"/>
        <circle cx="600" cy="280" r="8" fill="#C8102E" opacity="0.5"/>
        <circle cx="280" cy="180" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
        <circle cx="280" cy="380" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
        <circle cx="920" cy="180" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
        <circle cx="920" cy="380" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
        <path d="M60 230 Q130 230 130 280 Q130 330 60 330" fill="none" stroke="#C8102E" stroke-width="4" opacity="0.35"/>
        <path d="M1140 230 Q1070 230 1070 280 Q1070 330 1140 330" fill="none" stroke="#C8102E" stroke-width="4" opacity="0.35"/>
        <rect width="1200" height="560" fill="#041E42" opacity="0.88"/>
      </svg>
      <div class="hero-content">
        <picture>
          <source srcset="/icons/rinxlogo-140.webp" type="image/webp">
          <img src="/icons/rinxlogo.png" alt="Rinx Hockey Club" class="hero-logo" width="140" height="140" fetchpriority="high" onerror="this.style.display='none'">
        </picture>
        <span class="hero-badge">${season}</span>
        <h1>Rinx <span>Hockey</span><br>Club</h1>
        <p>Tier III/A Travel Hockey &bull; Long Island, New York</p>
      </div>
      <div class="hero-stripe"></div>
    </div>
  `;
}
