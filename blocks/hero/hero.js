export default function decorate(block) {
  const row = block.children[0];
  const cell = row?.children[0];
  const paragraphs = [...(cell?.querySelectorAll('p') || [])];
  const subtitle = paragraphs[0]?.textContent || '';
  const season = paragraphs[1]?.textContent || '';
  const record = paragraphs[2]?.textContent || '';

  // Parse record like "16–13–3 | GF 163 – GA 127 | MHR Rating 77.2"
  const parts = record.split('|').map((s) => s.trim()).filter(Boolean);
  const wlt = parts[0] || '';
  const gfga = parts[1] || '';
  const rating = parts[2] || '';

  // Extract numbers
  const wltNums = wlt.match(/(\d+)/g) || [];
  const gp = wltNums.length === 3
    ? parseInt(wltNums[0], 10) + parseInt(wltNums[1], 10) + parseInt(wltNums[2], 10)
    : '';

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
        <img src="/icons/rinxlogo.png" alt="Rinx Hockey Club" class="hero-logo" onerror="this.style.display='none'">
        <span class="hero-badge">${season}</span>
        <h1>Rinx <span>Hockey</span><br>Club &bull; 10U</h1>
        <p>${subtitle}</p>
        <div class="hero-record-strip">
          <div class="hero-stat">
            <span class="hero-stat-num red">${wlt}</span>
            <span class="hero-stat-lbl">W&ndash;L&ndash;T</span>
          </div>
          <div class="hero-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-num">${gfga}</span>
            <span class="hero-stat-lbl">GF&ndash;GA</span>
          </div>
          <div class="hero-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-num red">${rating.replace(/[^0-9.]/g, '')}</span>
            <span class="hero-stat-lbl">MHR Rating</span>
          </div>
          <div class="hero-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-num">${gp}</span>
            <span class="hero-stat-lbl">Games Played</span>
          </div>
        </div>
        <p class="hero-src">Live rankings: <a href="https://myhockeyrankings.com/team-info?t=19306&y=2025" target="_blank">MyHockeyRankings.com</a></p>
      </div>
      <div class="hero-stripe"></div>
    </div>
  `;
}
