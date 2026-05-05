import { RINX } from '../../scripts/scripts.js';

export default function decorate(block) {
  const { record } = RINX;
  const gp = record.w + record.l + record.t;

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
        <rect width="1200" height="560" fill="#041E42" opacity="0.88"/>
      </svg>
    </div>

    <div class="hero-content">
      <img src="${RINX.logoUrl}" alt="Rinx Hockey Club" class="hero-logo"
           onerror="this.style.display='none'">
      <span class="hero-badge">2026&ndash;2027 Season</span>
      <h1>Rinx <span>Hockey</span><br>Club &bull; 10U</h1>
      <p>Tier III/A Travel Hockey &bull; Hauppauge, New York</p>

      <div class="hero-record-strip" style="display:inline-flex;flex-direction:row;flex-wrap:nowrap;align-items:stretch;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;overflow:hidden;width:auto;">
        <div class="hero-stat" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 24px;flex:0 0 auto;">
          <span class="hero-stat-num red" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;color:#C8102E;line-height:1;white-space:nowrap;display:block;">${record.w}&ndash;${record.l}&ndash;${record.t}</span>
          <span class="hero-stat-lbl" style="font-size:0.62rem;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;white-space:nowrap;display:block;">W&ndash;L&ndash;T</span>
        </div>
        <div class="hero-divider" style="width:1px;background:rgba(255,255,255,0.2);align-self:stretch;flex-shrink:0;"></div>
        <div class="hero-stat" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 24px;flex:0 0 auto;">
          <span class="hero-stat-num" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;color:#ffffff;line-height:1;white-space:nowrap;display:block;">${record.gf}&ndash;${record.ga}</span>
          <span class="hero-stat-lbl" style="font-size:0.62rem;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;white-space:nowrap;display:block;">GF&ndash;GA</span>
        </div>
        <div class="hero-divider" style="width:1px;background:rgba(255,255,255,0.2);align-self:stretch;flex-shrink:0;"></div>
        <div class="hero-stat" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 24px;flex:0 0 auto;">
          <span class="hero-stat-num red" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;color:#C8102E;line-height:1;white-space:nowrap;display:block;">${record.rating}</span>
          <span class="hero-stat-lbl" style="font-size:0.62rem;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;white-space:nowrap;display:block;">MHR Rating</span>
        </div>
        <div class="hero-divider" style="width:1px;background:rgba(255,255,255,0.2);align-self:stretch;flex-shrink:0;"></div>
        <div class="hero-stat" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 24px;flex:0 0 auto;">
          <span class="hero-stat-num" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;color:#ffffff;line-height:1;white-space:nowrap;display:block;">${gp}</span>
          <span class="hero-stat-lbl" style="font-size:0.62rem;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;white-space:nowrap;display:block;">Games Played</span>
        </div>
      </div>
      <p class="hero-src"><a href="${RINX.mhrUrl}" target="_blank">MyHockeyRankings.com</a></p>
    </div>

    <div class="hero-stripe"></div>
  `;
}
