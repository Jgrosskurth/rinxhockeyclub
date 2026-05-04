// delayed.js — homepage content, no imports needed
(function() {
  function buildHomepage() {
    var path = window.location.pathname;
    if (path !== '/' && path !== '/index') return;
    if (document.getElementById('hp-content')) return;
    var main = document.querySelector('main');
    if (!main) return;
    var RINX = window.RINX_DATA;
    var GAMES = window.GAMES_DATA;
    if (!RINX || !GAMES) return;

    var news = [
      { tag: 'Roster', title: '2026-2027 Roster Finalized', body: 'Congratulations to all players who made this years Rinx Hockey Club 10U Squirts travel team! Roster signing night was held March 5, 2026 at The Rinx.', date: 'March 5, 2026' },
      { tag: 'Gear', title: 'Spring 2026 Gear Store Is Live', body: 'The official 2026 team gear store is now open. Order jerseys, shells, and team apparel before the deadline closes.', date: 'April 1, 2026' },
      { tag: 'Season', title: '2026-2027 Season Begins This Fall', body: 'The upcoming season schedule is being finalized. Stay tuned for game dates, tournament registrations, and practice times.', date: 'May 1, 2026' },
      { tag: 'Coaching', title: 'Coaching Staff Confirmed', body: 'Head Coach Dan ODonoghue and Assistant Coach Joe Capozzoli return to lead the 10U Squirts for another exciting season.', date: 'April 15, 2026' },
      { tag: 'Sponsors', title: 'Seeking 2026-2027 Sponsors', body: 'We are now accepting sponsorship applications. Multiple tiers available starting at $250. Contact us to learn more.', date: 'April 20, 2026' },
    ];

    var recent = GAMES.slice(-5).reverse();

    function newsCard(n) {
      return '<div class="slide-card"><div class="slide-card-body"><div class="news-tag">' + n.tag + '</div><h3>' + n.title + '</h3><p>' + n.body + '</p><div class="news-date">' + n.date + '</div></div></div>';
    }

    function resultRow(g) {
      var ini = g.opp.split(' ').slice(0, 2).map(function(w) { return w[0]; }).join('').toUpperCase();
      var badge = g.result === 'W' ? 'win' : g.result === 'L' ? 'loss' : 'tie';
      return '<div class="sg-row"><div class="sg-date">' + g.date + '</div>'
        + '<div class="sg-opp"><div class="sg-logo-fb" style="background:' + g.color + '">' + ini + '</div>'
        + '<div><div class="sg-name">' + g.opp + '</div><div class="sg-loc">' + g.loc + '</div></div></div>'
        + '<div class="sg-score">' + g.score + '</div>'
        + '<div class="sg-result"><span class="badge badge-' + badge + '">' + g.result + '</span></div></div>';
    }

    var hp = document.createElement('div');
    hp.id = 'hp-content';
    hp.innerHTML =
      '<div class="hp-news"><div class="hp-inner"><h2 class="section-title">Latest News</h2>'
      + '<div class="slider-outer"><div class="slider-track" id="hp-track">' + news.map(newsCard).join('') + '</div></div>'
      + '<div class="slider-nav"><button class="snav-btn" id="hp-prev">&#8592;</button><div class="sdots" id="hp-dots"></div><button class="snav-btn" id="hp-next">&#8594;</button></div>'
      + '</div></div>'
      + '<div class="hp-results"><div class="hp-inner"><h2 class="section-title">Recent Results</h2>'
      + '<div class="results-list">' + recent.map(resultRow).join('') + '</div>'
      + '<p style="margin-top:16px"><a href="/schedule" style="color:var(--color-red);font-weight:700">View Full Schedule &rarr;</a></p>'
      + '</div></div>'
      + '<div class="hp-about"><div class="hp-inner"><h2 class="section-title">About Our Team</h2>'
      + '<div class="bio-grid">'
      + '<div class="bio-card bio-full"><img src="https://static.wixstatic.com/media/4d0004_9c4b74e112a042159df552c350dad98d~mv2.png/v1/crop/x_0,y_4,w_1280,h_355/fill/w_980,h_272,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/League%20Header.png" alt="Rinx Hockey Club" style="width:100%;border-radius:6px;margin-bottom:24px;display:block" onerror="this.style.display='none'"><h3>2026-2027 Rinx Hockey Club - 10U Squirts</h3><p>The Rinx 10U Squirts travel hockey team represents the best young talent from the Long Island area, competing at the Tier III/A level. Based out of The Rinx in Hauppauge, New York, our program is dedicated to developing elite young players both on and off the ice.</p><p style="margin-top:12px">This season, our roster features dedicated players, led by an experienced coaching staff committed to skill development, teamwork, and competitive excellence.</p></div>'
      + '<div class="bio-card"><h3>Coaching Staff</h3><div class="coach-card" style="margin-bottom:12px"><div class="coach-av">DO</div><div class="coach-info"><h4>Dan O'Donoghue</h4><p>Head Coach &bull; 10U Squirts</p></div></div><div class="coach-card"><div class="coach-av">JC</div><div class="coach-info"><h4>Joe Capozzoli</h4><p>Assistant Coach &bull; 10U Squirts</p></div></div></div>'
      + '<div class="bio-card"><h3>Our Facility</h3><img src="https://github.com/Jgrosskurth/rinxhockeyclub/blob/main/icons/877c6298be0986da90566f459a2a2874.webp?raw=true" alt="The Rinx" style="width:100%;border-radius:6px;margin-bottom:16px;display:block;max-height:220px;object-fit:cover" onerror="this.style.display='none'"><p>Located at 660 Terry Road, Hauppauge, The Rinx features two full-size indoor NHL rinks, a pro shop, skate sharpening, and year-round programming on 97 acres of Hidden Pond Park.</p><p style="margin-top:8px"><strong>Phone:</strong> (631) 232-3222</p></div>'
      + '</div></div></div>'
      + '<div class="hp-shop"><h2>Get Your Gear</h2><p>Official 2026 Rinx 10U team jerseys, hoodies, and more are now available.</p>'
      + '<a class="btn-shop" href="' + RINX.shopUrl + '" target="_blank">Shop the Official Store</a>'
      + '<div class="shop-items"><div class="shop-item"><span>&#127944;</span>Jerseys</div><div class="shop-item"><span>&#128085;</span>T-Shirts</div><div class="shop-item"><span>&#129346;</span>Hats</div><div class="shop-item"><span>&#129399;</span>Hoodies</div></div>'
      + '</div>';

    main.insertAdjacentElement('afterend', hp);

    var idx = 0;
    var track = hp.querySelector('#hp-track');
    var dots = hp.querySelector('#hp-dots');
    var cards = Array.from(hp.querySelectorAll('.slide-card'));
    function vis() { return window.innerWidth < 900 ? 1 : 3; }
    function maxIdx() { return Math.max(0, cards.length - vis()); }
    function buildDots() {
      dots.innerHTML = '';
      for (var i = 0; i <= maxIdx(); i++) {
        var d = document.createElement('button');
        d.className = 'sdot' + (i === 0 ? ' on' : '');
        d.addEventListener('click', (function(i2) { return function() { go(i2); }; })(i));
        dots.appendChild(d);
      }
    }
    function go(i) {
      idx = Math.max(0, Math.min(i, maxIdx()));
      track.style.transform = 'translateX(-' + (idx * (cards[0].offsetWidth + 24)) + 'px)';
      dots.querySelectorAll('.sdot').forEach(function(d, j) { d.classList.toggle('on', j === idx); });
    }
    hp.querySelector('#hp-prev').addEventListener('click', function() { go(idx - 1); });
    hp.querySelector('#hp-next').addEventListener('click', function() { go(idx + 1); });
    buildDots();
    setInterval(function() { go(idx + 1 > maxIdx() ? 0 : idx + 1); }, 5000);
  }

  buildHomepage();
})();
