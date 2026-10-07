import { loadGameUpdates, parseNewsDate } from '../../scripts/game-updates.js';

// Cards older than this are hidden (authored ones stay in the document but
// don't render; auto-generated ones simply stop being produced).
const MAX_AGE_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

function isRecent(slide) {
  if (slide.time == null) return true; // undated authored cards always show
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return slide.time >= today.getTime() - MAX_AGE_DAYS * DAY;
}

// An authored card already covers a game if it's dated within a day of it and
// mentions the same age group (e.g. "Clean Sweep: 10U and 14U ..." covers both).
function coveredByAuthored(card, authored) {
  const age = card.age.toLowerCase();
  return authored.some((a) => a.time != null
    && Math.abs(a.time - card.time) <= DAY
    && `${a.tag} ${a.title} ${a.body}`.toLowerCase().includes(age));
}

const ARROW = (d) => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// One-row carousel: native horizontal scroll with snap points, plus arrow
// buttons (wider screens) that page one card and disable at either end.
function render(block, slides) {
  if (!slides.length) {
    block.closest('.news-slider-wrapper')?.setAttribute('hidden', '');
    return;
  }
  block.closest('.news-slider-wrapper')?.removeAttribute('hidden');

  block.innerHTML = `
    <div class="ns-inner">
      <div class="ns-head">
        <h2 class="section-title" id="latest-updates">Latest Updates</h2>
        <div class="ns-ctrl">
          <button type="button" class="ns-btn" data-dir="-1" aria-controls="ns-rail" aria-label="Previous updates">${ARROW('M15 5l-7 7 7 7')}</button>
          <button type="button" class="ns-btn" data-dir="1" aria-controls="ns-rail" aria-label="Next updates">${ARROW('M9 5l7 7-7 7')}</button>
        </div>
      </div>
      <div class="ns-rail" id="ns-rail" role="region" aria-labelledby="latest-updates" tabindex="0">
        ${slides.map((s) => `
          <article class="ns-card">
            <h3>${s.title}</h3>
            <p>${s.body}</p>
            <p class="ns-meta"><span class="news-tag">${s.tag || 'News'}</span><span class="news-date">${s.date}</span></p>
          </article>`).join('')}
      </div>
      <p class="ns-hint">${slides.length} updates · swipe for more</p>
    </div>`;

  const rail = block.querySelector('.ns-rail');
  const [prev, next] = block.querySelectorAll('.ns-btn');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sync = () => {
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
  };
  [prev, next].forEach((btn) => btn.addEventListener('click', () => {
    const step = rail.firstElementChild.getBoundingClientRect().width
      + parseFloat(getComputedStyle(rail).columnGap || 0);
    rail.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
  }));
  rail.addEventListener('scroll', sync, { passive: true });
  // render() runs twice (authored cards, then with Game Updates merged in).
  window.removeEventListener('resize', block.nsSync);
  block.nsSync = sync;
  window.addEventListener('resize', sync);
  sync();
}

const newestFirst = (a, b) => (b.time ?? Infinity) - (a.time ?? Infinity);

export default function decorate(block) {
  const authored = [...block.children].map((row) => {
    const cells = [...row.children];
    const date = cells[3]?.textContent.trim() || '';
    return {
      tag: cells[0]?.textContent.trim(),
      title: cells[1]?.textContent.trim(),
      body: cells[2]?.textContent.trim(),
      date,
      time: parseNewsDate(date)?.getTime() ?? null,
    };
  }).filter((s) => s.title);

  const recentAuthored = authored.filter(isRecent).sort(newestFirst);

  // Show authored cards right away (this block sits near the top of the
  // homepage), then merge in the auto-generated Game Update cards.
  render(block, recentAuthored);
  loadGameUpdates().then((updates) => {
    const fresh = updates.filter((u) => isRecent(u) && !coveredByAuthored(u, authored));
    if (fresh.length) render(block, [...recentAuthored, ...fresh].sort(newestFirst));
  });
}
