// Service Worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// PWA Install Banner
(function pwaInstallBanner() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone;
  if (isStandalone) {
    document.body.classList.add('pwa-standalone');
    return;
  }
  if (localStorage.getItem('pwa-banner-dismissed')) return;

  const banner = document.createElement('div');
  banner.className = 'pwa-install-banner';
  banner.innerHTML = `
    <img src="/images/A9FBB1FE-F41E-4CE4-8E6D-C9099AD82806.JPG" alt="Rinx HC" width="36" height="36">
    <div class="pwa-install-banner-text">
      <strong>Rinx Hockey Club</strong>
      Add to your home screen for quick access
    </div>
    <button class="pwa-install-btn" id="pwa-install-btn">Install</button>
    <button class="pwa-install-close" id="pwa-close-btn" aria-label="Close">&times;</button>
  `;
  document.body.prepend(banner);

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  banner.querySelector('#pwa-install-btn').addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        banner.remove();
        localStorage.setItem('pwa-banner-dismissed', '1');
      });
    } else {
      alert('Tap the Share button in your browser, then "Add to Home Screen".');
      banner.remove();
      localStorage.setItem('pwa-banner-dismissed', '1');
    }
  });

  banner.querySelector('#pwa-close-btn').addEventListener('click', () => {
    banner.remove();
    localStorage.setItem('pwa-banner-dismissed', '1');
  });
}());

// delayed.js — homepage content builder
(function () {
  function build() {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index') return;
    if (document.getElementById('hp-content')) return;
    const main = document.querySelector('main');
    if (!main) return;

    const RINX = window.RINX_DATA;
    const GAMES = window.GAMES_DATA;
    if (!RINX || !GAMES) { setTimeout(build, 200); return; }

    const news = [
      {
        tag: 'Roster', title: '2026-2027 Roster Finalized', body: 'Congratulations to all players who made this years Rinx Hockey Club 10U Squirts travel team! Roster signing night was held March 5, 2026 at The Rinx.', date: 'March 5, 2026',
      },
      {
        tag: 'Gear', title: 'Spring 2026 Gear Store Is Live', body: 'The official 2026 team gear store is now open. Order jerseys, shells, and team apparel before the deadline closes.', date: 'April 1, 2026',
      },
      {
        tag: 'Season', title: '2026-2027 Season Begins This Fall', body: 'The upcoming season schedule is being finalized. Stay tuned for game dates, tournament registrations, and practice times.', date: 'May 1, 2026',
      },
      {
        tag: 'Coaching', title: 'Coaching Staff Confirmed', body: 'Head Coach Dan ODonoghue and Assistant Coach Joe Capozzoli return to lead the 10U Squirts for another season.', date: 'April 15, 2026',
      },
      {
        tag: 'Sponsors', title: 'Seeking 2026-2027 Sponsors', body: 'Sponsorship applications now open. Multiple tiers starting at $250. Contact us to learn more.', date: 'April 20, 2026',
      },
    ];

    const recent = GAMES.slice(-5).reverse();
    const MHR = 'https://ranktech-cdn.s3.us-east-2.amazonaws.com/myhockey_prod/logos/';

    function nc(n) {
      return `<div class="slide-card"><div class="slide-card-body"><div class="news-tag">${n.tag}</div><h3>${n.title}</h3><p>${n.body}</p><div class="news-date">${n.date}</div></div></div>`;
    }

    function rc(g) {
      const ini = g.opp.split(' ').slice(0, 2).map((w) => w[0]).join('')
        .toUpperCase();
      let b = 'tie';
      if (g.result === 'W') b = 'win';
      else if (g.result === 'L') b = 'loss';
      const logo = g.logoId
        ? `<img src="${MHR}${g.logoId}_a.png" style="width:34px;height:34px;border-radius:50%;object-fit:contain;background:#fff;flex-shrink:0" onerror="this.style.display='none'">`
        : `<div class="sg-logo-fb" style="background:${g.color}">${ini}</div>`;
      return `<div class="sg-row"><div class="sg-date">${g.date}</div>`
        + `<div class="sg-opp">${logo}<div><div class="sg-name">${g.opp}</div><div class="sg-loc">${g.loc}</div></div></div>`
        + `<div class="sg-score">${g.score}</div>`
        + `<div class="sg-result"><span class="badge badge-${b}">${g.result}</span></div></div>`;
    }

    const hp = document.createElement('div');
    hp.id = 'hp-content';
    hp.innerHTML = '<div class="hp-news"><div class="hp-inner"><h2 class="section-title">Latest News</h2>'
      + `<div class="slider-outer"><div class="slider-track" id="hpt">${news.map(nc).join('')}</div></div>`
      + '<div class="slider-nav"><button class="snav-btn" id="hpv">&#8592;</button><div class="sdots" id="hpd"></div><button class="snav-btn" id="hpn">&#8594;</button></div>'
      + '</div></div>'
      + '<div class="hp-results"><div class="hp-inner"><h2 class="section-title">Recent Results</h2>'
      + `<div class="results-list">${recent.map(rc).join('')}</div>`
      + '<p style="margin-top:16px"><a href="/schedule" style="color:#C8102E;font-weight:700">View Full Schedule &rarr;</a></p>'
      + '</div></div>'
      + '<div class="hp-about"><div class="hp-inner"><h2 class="section-title">About Our Team</h2>'
      + '<div class="bio-grid">'
      + '<div class="bio-card bio-full">'
      + '<img src="https://static.wixstatic.com/media/4d0004_9c4b74e112a042159df552c350dad98d~mv2.png/v1/crop/x_0,y_4,w_1280,h_355/fill/w_980,h_272,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/League%20Header.png" alt="" style="width:100%;border-radius:6px;margin-bottom:24px;display:block" onerror="this.style.display=\'none\'">'
      + '<h3>2026-2027 Rinx Hockey Club - 10U Squirts</h3>'
      + '<p>The Rinx 10U Squirts travel hockey team represents the best young talent from the Long Island area, competing at the Tier III/A level out of Hauppauge, New York.</p>'
      + '</div>'
      + '<div class="bio-card"><h3>Coaching Staff</h3>'
      + '<div class="coach-card" style="margin-bottom:12px"><img src="https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/icons/dan.jpg" alt="Dan" class="coach-av coach-photo" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="coach-av" style="display:none">DO</div><div class="coach-info"><h4>Dan O\'Donoghue</h4><p>Head Coach &bull; 10U Squirts</p></div></div>'
      + '<div class="coach-card"><img src="https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/icons/cap.png" alt="Joe" class="coach-av coach-photo" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="coach-av" style="display:none">JC</div><div class="coach-info"><h4>Joe Capozzoli</h4><p>Assistant Coach &bull; 10U Squirts</p></div></div>'
      + '</div>'
      + '<div class="bio-card"><h3>Our Facility</h3><p>Located at 660 Terry Road, Hauppauge, The Rinx features two full-size indoor NHL rinks, a pro shop, and year-round programming on 97 acres of Hidden Pond Park.</p><p style="margin-top:8px"><strong>Phone:</strong> (631) 232-3222</p></div>'
      + '</div></div></div>'
      + '<div class="hp-shop"><h2>&#129506; Get Your Gear</h2>'
      + '<p>Official 2026 Rinx 10U team jerseys, hoodies, and more are now available.</p>'
      + `<a class="btn-shop" href="${RINX.shopUrl}" target="_blank">Shop the Official Store</a>`
      + '</div>';

    main.insertAdjacentElement('afterend', hp);

    let idx = 0;
    const track = hp.querySelector('#hpt');
    const dots = hp.querySelector('#hpd');
    const cards = Array.from(hp.querySelectorAll('.slide-card'));
    function vis() { return window.innerWidth < 900 ? 1 : 3; }
    function mx() { return Math.max(0, cards.length - vis()); }
    function bld() {
      dots.innerHTML = '';
      for (let i = 0; i <= mx(); i += 1) {
        const d = document.createElement('button');
        d.className = `sdot${i === 0 ? ' on' : ''}`;
        // go() is a hoisted function declaration defined below
        // eslint-disable-next-line no-use-before-define
        d.addEventListener('click', () => go(i));
        dots.appendChild(d);
      }
    }
    function go(i) {
      idx = Math.max(0, Math.min(i, mx()));
      track.style.transform = `translateX(-${idx * (cards[0].offsetWidth + 24)}px)`;
      dots.querySelectorAll('.sdot').forEach((d, j) => { d.classList.toggle('on', j === idx); });
    }
    hp.querySelector('#hpv').addEventListener('click', () => { go(idx - 1); });
    hp.querySelector('#hpn').addEventListener('click', () => { go(idx + 1); });
    bld();
    setInterval(() => { go(idx + 1 > mx() ? 0 : idx + 1); }, 5000);
  }

  // Run after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
}());
