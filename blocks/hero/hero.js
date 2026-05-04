import { RINX } from '../../scripts/scripts.js';

export default function decorate(block) {
  const { record } = RINX;
  const gp = record.w + record.l + record.t;

  block.innerHTML = `
    <div class="hero-bg-overlay"></div>
    <svg class="hero-bg-img" viewBox="0 0 1200 560" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="rinkGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#e8f4fc"/>
          <stop offset="100%" stop-color="#bcd6f0"/>
        </radialGradient>
        <radialGradient id="lightGrad" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="560" fill="url(#rinkGrad)"/>
      <rect width="1200" height="560" fill="url(#lightGrad)"/>
      <rect x="0" y="0" width="1200" height="560" fill="none" stroke="#041E42" stroke-width="12" rx="120"/>
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
      <line x1="0" y1="56" x2="1200" y2="56" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <line x1="0" y1="112" x2="1200" y2="112" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <line x1="0" y1="168" x2="1200" y2="168" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <line x1="0" y1="224" x2="1200" y2="224" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <line x1="0" y1="280" x2="1200" y2="280" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <line x1="0" y1="336" x2="1200" y2="336" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <line x1="0" y1="392" x2="1200" y2="392" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <line x1="0" y1="448" x2="1200" y2="448" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <line x1="0" y1="504" x2="1200" y2="504" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    </svg>
    <div class="hero-content">
      <img src="${RINX.logoUrl}" class="hero-team-logo" alt="Rinx Hockey Club" onerror="this.style.display='none'">
      <div class="hero-badge">2026&ndash;2027 Season</div>
      <h2>Rinx <span>Hockey</span><br>Club &bull; 10U</h2>
      <p>Tier III/A Travel Hockey &bull; Hauppauge, New York</p>
      <div class="hero-record-strip">
        <div class="rec-block"><div class="rec-num red">${record.w}&ndash;${record.l}&ndash;${record.t}</div><div class="rec-lbl">W&ndash;L&ndash;T Record</div></div>
        <div class="rec-divider"></div>
        <div class="rec-block"><div class="rec-num">${record.gf}&ndash;${record.ga}</div><div class="rec-lbl">GF&ndash;GA</div></div>
        <div class="rec-divider"></div>
        <div class="rec-block"><div class="rec-num red">${record.rating}</div><div class="rec-lbl">MHR Rating</div></div>
        <div class="rec-divider"></div>
        <div class="rec-block"><div class="rec-num">${gp}</div><div class="rec-lbl">Games Played</div></div>
      </div>
      <div class="rec-src">Live rankings: <a href="${RINX.mhrUrl}" target="_blank">MyHockeyRankings.com</a></div>
    </div>
    <div class="hero-ice"></div>
  `;
}
