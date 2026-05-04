import { RINX, GAMES } from '../../scripts/scripts.js';

export default function decorate(block) {
  const { record } = RINX;
  const gp = record.w + record.l + record.t;

  const recentGames = GAMES.slice(-5).reverse();

  const news = [
    { tag: 'Roster', title: '2026\u20132027 Roster Finalized', body: "Congratulations to all players who made this year\u2019s Rinx Hockey Club 10U Squirts travel team! Roster signing night was held March 5, 2026 at The Rinx.", date: 'March 5, 2026' },
    { tag: 'Gear', title: 'Spring 2026 Gear Store Is Live', body: 'The official 2026 team gear store is now open. Order jerseys, shells, and team apparel before the deadline closes.', date: 'April 1, 2026' },
    { tag: 'Season', title: '2026\u20132027 Season Begins This Fall', body: 'The upcoming season schedule is being finalized. Stay tuned for game dates, tournament registrations, and practice times.', date: 'May 1, 2026' },
    { tag: 'Coaching', title: 'Coaching Staff Confirmed', body: "Head Coach Dan O\u2019Donoghue and Assistant Coach Joe Capozzoli return to lead the 10U Squirts for another exciting season.", date: 'April 15, 2026' },
    { tag: 'Sponsors', title: 'Seeking 2026\u20132027 Sponsors', body: 'We are now accepting sponsorship applications. Multiple tiers are available starting at $250. Contact us to learn more today.', date: 'April 20, 2026' },
  ];

  block.closest('.section').classList.add('hero-section');

  block.innerHTML = `
    <div class="hero">
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
    </div>

    <div class="home-news section">
      <h2 class="section-title">Latest News</h2>
      <div class="slider-outer">
        <div class="slider-track" id="hp-slider-track">
          ${news.map((n) => `
            <div class="slide-card">
              <div class="slide-card-body">
                <div class="news-tag">${n.tag}</div>
                <h3>${n.title}</h3>
                <p>${n.body}</p>
                <div class="news-date">${n.date}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
      <div class="slider-nav">
        <button class="snav-btn" id="hp-prev">&#8592;</button>
        <div class="sdots" id="hp-dots"></div>
        <button class="snav-btn" id="hp-next">&#8594;</button>
      </div>
    </div>

    <div class="home-results" style="background:var(--color-ice);padding:60px 0;">
      <div class="section" style="padding-top:0;padding-bottom:0;">
        <h2 class="section-title">Recent Results</h2>
        <div class="results-list">
          ${recentGames.map((g) => `
            <div class="sg-row" data-result="${g.result}">
              <div class="sg-date">${g.date}</div>
              <div class="sg-opp">
                <div class="sg-logo-fb" style="background:${g.color}">${g.opp.split(' ').slice(0,2).map((w)=>w[0]).join('').toUpperCase()}</div>
                <div><div class="sg-name">${g.opp}</div><div class="sg-loc">${g.loc}</div></div>
              </div>
              <div class="sg-score">${g.score}</div>
              <div class="sg-result"><span class="badge badge-${g.result==='W'?'win':g.result==='L'?'loss':'tie'}">${g.result}</span></div>
            </div>`).join('')}
        </div>
        <p style="margin-top:16px;"><a href="/schedule" style="color:var(--color-red);font-weight:700;">View Full Schedule &rarr;</a></p>
      </div>
    </div>

    <div class="home-about section">
      <h2 class="section-title">About Our Team</h2>
      <div class="bio-grid">
        <div class="bio-card full">
          <img src="https://static.wixstatic.com/media/4d0004_9c4b74e112a042159df552c350dad98d~mv2.png/v1/crop/x_0,y_4,w_1280,h_355/fill/w_980,h_272,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/League%20Header.png"
               alt="2026-2027 Rinx Hockey Club" style="width:100%;border-radius:6px;margin-bottom:24px;object-fit:cover;" onerror="this.style.display='none'">
          <h3>2026&ndash;2027 Rinx Hockey Club &bull; 10U Squirts</h3>
          <p>The Rinx 10U Squirts travel hockey team represents the best young talent from the Long Island area, competing at the Tier III/A level. Based out of The Rinx in Hauppauge, New York, our program is dedicated to developing elite young players both on and off the ice.</p>
          <p style="margin-top:12px;">This season, our roster features dedicated players, led by an experienced coaching staff committed to skill development, teamwork, and competitive excellence. From the first whistle to the final buzzer, our Squirts play with heart, hustle, and Rinx pride.</p>
        </div>
        <div class="bio-card">
          <h3>Coaching Staff</h3>
          <div class="coach-card" style="margin-bottom:12px;">
            <div class="coach-av">DO</div>
            <div class="coach-info"><h4>Dan O&apos;Donoghue</h4><p>Head Coach &bull; 10U Squirts</p></div>
          </div>
          <div class="coach-card">
            <div class="coach-av">JC</div>
            <div class="coach-info"><h4>Joe Capozzoli</h4><p>Assistant Coach &bull; 10U Squirts</p></div>
          </div>
        </div>
        <div class="bio-card">
          <h3>Our Facility</h3>
          <img src="https://github.com/Jgrosskurth/rinxhockeyclub/blob/main/icons/877c6298be0986da90566f459a2a2874.webp?raw=true"
               alt="The Rinx" style="width:100%;border-radius:6px;margin-bottom:16px;object-fit:cover;max-height:220px;" onerror="this.style.display='none'">
          <p>Located at 660 Terry Road, Hauppauge, The Rinx features two full-size indoor NHL rinks, a pro shop, skate sharpening, and year-round programming on 97 acres of Hidden Pond Park.</p>
          <p style="margin-top:8px;"><strong>Phone:</strong> (631) 232-3222</p>
        </div>
      </div>
    </div>

    <div class="home-shop shop-sec">
      <h2>Get Your Gear</h2>
      <p>Official 2026 Rinx 10U team jerseys, hoodies, and more are now available.</p>
      <a class="btn-shop" href="${RINX.shopUrl}" target="_blank">Shop the Official Store</a>
      <div class="shop-items">
        <div class="shop-item"><span>🏒</span>Jerseys</div>
        <div class="shop-item"><span>👕</span>T-Shirts</div>
        <div class="shop-item"><span>🧢</span>Hats</div>
        <div class="shop-item"><span>🧥</span>Hoodies</div>
      </div>
    </div>
  `;

  // News slider logic
  let idx = 0;
  const track = block.querySelector('#hp-slider-track');
  const dots = block.querySelector('#hp-dots');
  const cards = [...block.querySelectorAll('.slide-card')];
  const visible = () => window.innerWidth < 900 ? 1 : 3;
  const maxIdx = () => Math.max(0, cards.length - visible());

  const buildDots = () => {
    dots.innerHTML = '';
    for (let i = 0; i <= maxIdx(); i += 1) {
      const d = document.createElement('button');
      d.className = `sdot${i === 0 ? ' on' : ''}`;
      d.addEventListener('click', () => goTo(i));
      dots.appendChild(d);
    }
  };

  const goTo = (i) => {
    idx = Math.max(0, Math.min(i, maxIdx()));
    const w = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${idx * w}px)`;
    dots.querySelectorAll('.sdot').forEach((d, j) => d.classList.toggle('on', j === idx));
  };

  block.querySelector('#hp-prev').addEventListener('click', () => goTo(idx - 1));
  block.querySelector('#hp-next').addEventListener('click', () => goTo(idx + 1));
  buildDots();
  setInterval(() => goTo(idx + 1 > maxIdx() ? 0 : idx + 1), 5000);
}
