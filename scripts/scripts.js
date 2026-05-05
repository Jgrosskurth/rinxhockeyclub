import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

// ── Rinx Hockey Club shared data ─────────────────────────────────────────────

export const RINX = {
  logoUrl: 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/refs/heads/main/icons/rinxlogo.png',
  mhrUrl: 'https://myhockeyrankings.com/team-info?t=19306&y=2025',
  shopUrl: 'https://rinxspring2026.itemorder.com/shop/home/',
  statsUrl: 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/refs/heads/main/rinxstats.csv',
  season: '2024-2025',
  record: { w: 16, l: 13, t: 3, gf: 163, ga: 127, rating: 77.2 },
};

export const PLAYERS = [
  { name: 'Ryan Bachert', pp: false },
  { name: 'Aiden Brown', pp: false },
  { name: 'DJ Pierre Canel', pp: false },
  { name: 'Nicholas Capozzoli', pp: false },
  { name: 'Ryan Christman', pp: false },
  { name: 'Connor Daly', pp: false },
  { name: 'Sean Fox', pp: false },
  { name: 'Matthew Grosskurth', pp: false },
  { name: 'Connor Hassett', pp: false },
  { name: 'Mack Kuhar', pp: false },
  { name: 'Stephen Kull', pp: false },
  { name: 'Jorge Leonardo', pp: false },
  { name: 'Ryan Lupia', pp: false },
  { name: 'Ari Mazzarone', pp: false },
  { name: 'Declan Nimmo', pp: false },
  { name: 'Tristen Pajak', pp: false },
  { name: 'Conor Wilkins', pp: false },
  { name: 'Evan Martin', pp: true },
  { name: 'Luca Nucera', pp: true },
  { name: 'Edward Carbone', pp: true },
];

export const GAMES = [
  { date: 'Sep 22, 2024', opp: 'Long Island Royals 10U',    loc: 'The Rinx, Hauppauge',      score: '8–3', result: 'W', color: '#1a3a8f' },
  { date: 'Sep 29, 2024', opp: 'Dix Hills Hawks 10U',       loc: 'Dix Hills Ice Rink',        score: '4–5', result: 'L', color: '#c8102e' },
  { date: 'Oct 6, 2024',  opp: 'Long Island Edge 10U',      loc: 'The Rinx, Hauppauge',       score: '6–2', result: 'W', color: '#006633' },
  { date: 'Oct 13, 2024', opp: 'Great Neck Bruins 10U',     loc: 'Great Neck Ice Rink',       score: '3–3', result: 'T', color: '#f5a800' },
  { date: 'Oct 20, 2024', opp: 'Long Island Sharks 10U',    loc: 'The Rinx, Hauppauge',       score: '7–4', result: 'W', color: '#004488' },
  { date: 'Oct 27, 2024', opp: 'NYC Cyclones 10U',          loc: 'Flushing Meadows Rink',     score: '2–5', result: 'L', color: '#1a1a6e' },
  { date: 'Nov 3, 2024',  opp: 'Long Island Royals 10U',    loc: 'Northwell Health Ice Ctr',  score: '5–2', result: 'W', color: '#1a3a8f' },
  { date: 'Nov 10, 2024', opp: 'NYC Skyliners 10U',         loc: 'The Rinx, Hauppauge',       score: '9–1', result: 'W', color: '#880000' },
  { date: 'Nov 16, 2024', opp: 'North Park 10U A1',         loc: 'The Rinx, Hauppauge',       score: '4–1', result: 'W', color: '#1a1a5e', logoId: '002ee8' },
  { date: 'Nov 17, 2024', opp: 'Long Island Edge 10U',      loc: 'The Rinx, Hauppauge',       score: '3–5', result: 'L', color: '#006633' },
  { date: 'Nov 24, 2024', opp: 'Dix Hills Hawks 10U',       loc: 'The Rinx, Hauppauge',       score: '6–3', result: 'W', color: '#c8102e' },
  { date: 'Dec 1, 2024',  opp: 'Great Neck Bruins 10U',     loc: 'The Rinx, Hauppauge',       score: '4–4', result: 'T', color: '#f5a800' },
  { date: 'Dec 8, 2024',  opp: 'Long Island Sharks 10U',    loc: 'Long Island Skating Acad.', score: '3–6', result: 'L', color: '#004488' },
  { date: 'Dec 15, 2024', opp: 'NYC Cyclones 10U',          loc: 'The Rinx, Hauppauge',       score: '8–2', result: 'W', color: '#1a1a6e' },
  { date: 'Dec 22, 2024', opp: 'NYC Skyliners 10U',         loc: 'Chelsea Piers Ice Rink',    score: '2–4', result: 'L', color: '#880000' },
  { date: 'Jan 5, 2025',  opp: 'Long Island Royals 10U',    loc: 'The Rinx, Hauppauge',       score: '7–3', result: 'W', color: '#1a3a8f' },
  { date: 'Jan 12, 2025', opp: 'North Park 10U A1',         loc: 'John Wright Arena, NYC',    score: '1–3', result: 'L', color: '#1a1a5e', logoId: '002ee8' },
  { date: 'Jan 19, 2025', opp: 'Dix Hills Hawks 10U',       loc: 'Dix Hills Ice Rink',        score: '5–5', result: 'T', color: '#c8102e' },
  { date: 'Jan 26, 2025', opp: 'Long Island Edge 10U',      loc: 'The Rinx, Hauppauge',       score: '6–1', result: 'W', color: '#006633' },
  { date: 'Feb 2, 2025',  opp: 'Great Neck Bruins 10U',     loc: 'Great Neck Ice Rink',       score: '2–4', result: 'L', color: '#f5a800' },
  { date: 'Feb 9, 2025',  opp: 'Long Island Sharks 10U',    loc: 'The Rinx, Hauppauge',       score: '5–3', result: 'W', color: '#004488' },
  { date: 'Feb 16, 2025', opp: 'NYC Cyclones 10U',          loc: 'The Rinx, Hauppauge',       score: '4–2', result: 'W', color: '#1a1a6e' },
  { date: 'Feb 23, 2025', opp: 'NYC Skyliners 10U',         loc: 'The Rinx, Hauppauge',       score: '3–5', result: 'L', color: '#880000' },
  { date: 'Mar 2, 2025',  opp: 'North Park 10U A1',         loc: 'The Rinx, Hauppauge',       score: '6–2', result: 'W', color: '#1a1a5e', logoId: '002ee8' },
  { date: 'Mar 9, 2025',  opp: 'Long Island Royals 10U',    loc: 'Northwell Health Ice Ctr',  score: '2–4', result: 'L', color: '#1a3a8f' },
  { date: 'Mar 16, 2025', opp: 'Dix Hills Hawks 10U',       loc: 'The Rinx, Hauppauge',       score: '7–1', result: 'W', color: '#c8102e' },
  { date: 'Mar 23, 2025', opp: 'Long Island Edge 10U',      loc: 'Long Island Skating Acad.', score: '1–3', result: 'L', color: '#006633' },
  { date: 'Mar 30, 2025', opp: 'Great Neck Bruins 10U',     loc: 'The Rinx, Hauppauge',       score: '5–2', result: 'W', color: '#f5a800' },
  { date: 'Apr 6, 2025',  opp: 'Long Island Sharks 10U',    loc: 'The Rinx, Hauppauge',       score: '2–3', result: 'L', color: '#004488' },
  { date: 'Apr 13, 2025', opp: 'NYC Cyclones 10U',          loc: 'Flushing Meadows Rink',     score: '3–6', result: 'L', color: '#1a1a6e' },
  { date: 'Apr 27, 2025', opp: 'NYC Skyliners 10U',         loc: 'The Rinx, Hauppauge',       score: '6–3', result: 'W', color: '#880000' },
  { date: 'May 4, 2025',  opp: 'North Park 10U A1',         loc: 'City Ice Pavilion, NYC',    score: '2–4', result: 'L', color: '#1a1a5e', logoId: '002ee8' },
];

export function initials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export async function proxyGet(url) {
  const resp = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}&ts=${Date.now()}`);
  if (!resp.ok) throw new Error(`proxy ${resp.status}`);
  const json = await resp.json();
  return json.contents;
}

export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

export function findKey(obj, ...candidates) {
  const keys = Object.keys(obj);
  for (const c of candidates) {
    const found = keys.find((k) => k.trim().toLowerCase() === c.toLowerCase());
    if (found !== undefined) return obj[found];
  }
  return '';
}

// ── Standard AEM page decoration ─────────────────────────────────────────────

async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
}

export function decorateMain(main) {
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
}

async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }
}

async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));
  const main = doc.querySelector('main');
  await loadSections(main);
  loadFooter(doc.querySelector('footer'));
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

function loadDelayed() {
  window.setTimeout(() => import('./delayed.js').catch(() => {}), 3000);
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

// Expose globals
window.RINX_DATA = RINX;
window.GAMES_DATA = GAMES;

// Homepage builder
function buildHomepage() {
  if (window.location.pathname !== '/' && window.location.pathname !== '/index') return;
  if (document.getElementById('hp-content')) return;
  var main = document.querySelector('main');
  if (!main) return;

  var news = [
    { tag: 'Roster', title: '2026-2027 Roster Finalized', body: 'Congratulations to all players who made this years Rinx Hockey Club 10U Squirts travel team! Roster signing night was held March 5, 2026 at The Rinx.', date: 'March 5, 2026' },
    { tag: 'Gear', title: 'Spring 2026 Gear Store Is Live', body: 'The official 2026 team gear store is now open. Order jerseys, shells, and team apparel before the deadline closes.', date: 'April 1, 2026' },
    { tag: 'Season', title: '2026-2027 Season Begins This Fall', body: 'The upcoming season schedule is being finalized. Stay tuned for game dates, tournament registrations, and practice times.', date: 'May 1, 2026' },
    { tag: 'Coaching', title: 'Coaching Staff Confirmed', body: 'Head Coach Dan ODonoghue and Assistant Coach Joe Capozzoli return to lead the 10U Squirts for another season.', date: 'April 15, 2026' },
    { tag: 'Sponsors', title: 'Seeking 2026-2027 Sponsors', body: 'Sponsorship applications now open. Multiple tiers starting at $250. Contact us to learn more.', date: 'April 20, 2026' },
  ];

  var recent = GAMES.slice(-5).reverse();
  var MHR = 'https://ranktech-cdn.s3.us-east-2.amazonaws.com/myhockey_prod/logos/';

  function nc(n) {
    return '<div class="slide-card"><div class="slide-card-body"><div class="news-tag">' + n.tag + '</div><h3>' + n.title + '</h3><p>' + n.body + '</p><div class="news-date">' + n.date + '</div></div></div>';
  }

  function rc(g) {
    var ini = g.opp.split(' ').slice(0,2).map(function(w) { return w[0]; }).join('').toUpperCase();
    var b = g.result === 'W' ? 'win' : g.result === 'L' ? 'loss' : 'tie';
    var logo = g.logoId
      ? '<img src="' + MHR + g.logoId + '_a.png" style="width:34px;height:34px;border-radius:50%;object-fit:contain;background:#fff;flex-shrink:0" onerror="this.style.display=\'none\'">'
      : '<div class="sg-logo-fb" style="background:' + g.color + '">' + ini + '</div>';
    return '<div class="sg-row"><div class="sg-date">' + g.date + '</div>'
      + '<div class="sg-opp">' + logo + '<div><div class="sg-name">' + g.opp + '</div><div class="sg-loc">' + g.loc + '</div></div></div>'
      + '<div class="sg-score">' + g.score + '</div>'
      + '<div class="sg-result"><span class="badge badge-' + b + '">' + g.result + '</span></div></div>';
  }

  var hp = document.createElement('div');
  hp.id = 'hp-content';
  hp.innerHTML =
    '<div class="hp-news"><div class="hp-inner"><h2 class="section-title">Latest News</h2>'
    + '<div class="slider-outer"><div class="slider-track" id="hpt">' + news.map(nc).join('') + '</div></div>'
    + '<div class="slider-nav"><button class="snav-btn" id="hpv">&#8592;</button><div class="sdots" id="hpd"></div><button class="snav-btn" id="hpn">&#8594;</button></div>'
    + '</div></div>'
    + '<div class="hp-results"><div class="hp-inner"><h2 class="section-title">Recent Results</h2>'
    + '<div class="results-list">' + recent.map(rc).join('') + '</div>'
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
    + '<div class="coach-card" style="margin-bottom:12px"><img src="https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/icons/dan.jpg" alt="Dan" class="coach-av coach-photo" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="coach-av" style="display:none">DO</div><div class="coach-info"><h4>Dan O'Donoghue</h4><p>Head Coach &bull; 10U Squirts</p></div></div>'
    + '<div class="coach-card"><img src="https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/icons/cap.png" alt="Joe" class="coach-av coach-photo" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="coach-av" style="display:none">JC</div><div class="coach-info"><h4>Joe Capozzoli</h4><p>Assistant Coach &bull; 10U Squirts</p></div></div>'
    + '</div>'
    + '<div class="bio-card"><h3>Our Facility</h3><p>Located at 660 Terry Road, Hauppauge, The Rinx features two full-size indoor NHL rinks, a pro shop, and year-round programming on 97 acres of Hidden Pond Park.</p><p style="margin-top:8px"><strong>Phone:</strong> (631) 232-3222</p></div>'
    + '</div></div></div>'
    + '<div class="hp-shop"><h2>&#129506; Get Your Gear</h2>'
    + '<p>Official 2026 Rinx 10U team jerseys, hoodies, and more are now available.</p>'
    + '<a class="btn-shop" href="' + RINX.shopUrl + '" target="_blank">Shop the Official Store</a>'
    + '</div>';

  main.insertAdjacentElement('afterend', hp);

  var idx = 0;
  var track = hp.querySelector('#hpt');
  var dots = hp.querySelector('#hpd');
  var cards = Array.from(hp.querySelectorAll('.slide-card'));
  function vis() { return window.innerWidth < 900 ? 1 : 3; }
  function mx() { return Math.max(0, cards.length - vis()); }
  function bld() {
    dots.innerHTML = '';
    for (var i = 0; i <= mx(); i++) {
      var d = document.createElement('button');
      d.className = 'sdot' + (i === 0 ? ' on' : '');
      d.addEventListener('click', (function(x) { return function() { go(x); }; })(i));
      dots.appendChild(d);
    }
  }
  function go(i) {
    idx = Math.max(0, Math.min(i, mx()));
    track.style.transform = 'translateX(-' + (idx * (cards[0].offsetWidth + 24)) + 'px)';
    dots.querySelectorAll('.sdot').forEach(function(d, j) { d.classList.toggle('on', j === idx); });
  }
  hp.querySelector('#hpv').addEventListener('click', function() { go(idx - 1); });
  hp.querySelector('#hpn').addEventListener('click', function() { go(idx + 1); });
  bld();
  setInterval(function() { go(idx + 1 > mx() ? 0 : idx + 1); }, 5000);
}

loadPage().then(buildHomepage);
