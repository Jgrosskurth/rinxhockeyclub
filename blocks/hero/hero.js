import { RINX } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Read config from DA table
  const daRows = [...block.querySelectorAll('tr')].slice(1).filter(r => r.cells[0]?.innerText?.trim());
  const cfg = {};
  daRows.forEach(r => {
    const key = r.cells[0]?.innerText?.trim().toLowerCase().replace(/[^a-z0-9]/g,'') || '';
    const val = r.cells[1]?.innerText?.trim() || '';
    if (key && val) cfg[key] = val;
  });

  // Parse record — support "16-13-3" or separate W/L/T fields
  let w = RINX.record.w, l = RINX.record.l, t = RINX.record.t;
  let gf = RINX.record.gf, ga = RINX.record.ga, rating = RINX.record.rating;
  if (cfg.record) {
    const parts = cfg.record.split(/[-–]/);
    if (parts.length >= 3) { w = parts[0]; l = parts[1]; t = parts[2]; }
  }
  if (cfg.gf) gf = cfg.gf;
  if (cfg.ga) ga = cfg.ga;
  if (cfg.mhrrating || cfg.rating) rating = cfg.mhrrating || cfg.rating;
  const season  = cfg.season   || '2026\u20132027 Season';
  const subtitle= cfg.subtitle || 'Tier III/A Travel Hockey \u2022 Hauppauge, New York';
  const gp = parseInt(w)||0 + parseInt(l)||0 + parseInt(t)||0 || (RINX.record.w + RINX.record.l + RINX.record.t);

  block.innerHTML = `
    <div class="hero-bg">
      <svg class="hero-rink" viewBox="0 0 1200 560" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="rinkG" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#e8f4fc"/>
            <stop offset="100%" stop-color="#bcd6f0"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="560" fill="url(#rinkG)"/>
        <rect width="1200" height="560" fill="#041E42" opacity="0.82"/>
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
      </svg>
    </div>

    <div class="hero-content">
      <img src="${RINX.logoUrl}" alt="Rinx Hockey Club" class="hero-logo"
           onerror="this.style.display='none'">
      <span class="hero-badge">${season}</span>
      <h1>Rinx <span>Hockey</span><br>Club &bull; 10U</h1>
      <p>${subtitle}</p>

      <div class="hero-record-strip">
        <div class="hero-stat">
          <span class="hero-stat-num red">${w}&ndash;${l}&ndash;${t}</span>
          <span class="hero-stat-lbl">W&ndash;L&ndash;T</span>
        </div>
        <div class="hero-divider"></div>
        <div class="hero-stat">
          <span class="hero-stat-num">${gf}&ndash;${ga}</span>
          <span class="hero-stat-lbl">GF&ndash;GA</span>
        </div>
        <div class="hero-divider"></div>
        <div class="hero-stat">
          <span class="hero-stat-num red">${rating}</span>
          <span class="hero-stat-lbl">MHR Rating</span>
        </div>
        <div class="hero-divider"></div>
        <div class="hero-stat">
          <span class="hero-stat-num">${gp}</span>
          <span class="hero-stat-lbl">Games Played</span>
        </div>
      </div>
      <p class="hero-src"><a href="${RINX.mhrUrl}" target="_blank">MyHockeyRankings.com</a></p>
    </div>

    <div class="hero-stripe"></div>
  `;
}
