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

function render(block, slides, state) {
  clearInterval(state.timer);
  if (!slides.length) {
    block.closest('.news-slider-wrapper')?.setAttribute('hidden', '');
    return;
  }
  block.closest('.news-slider-wrapper')?.removeAttribute('hidden');

  block.innerHTML = `
    <div class="slider-outer">
      <div class="slider-track" id="slider-track">
        ${slides.map((s) => `
          <div class="slide-card">
            <div class="slide-body">
              <span class="news-tag">${s.tag || 'News'}</span>
              <h3>${s.title}</h3>
              <p>${s.body}</p>
              <span class="news-date">${s.date}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>
    <div class="slider-nav">
      <button class="snav-btn" id="prev" aria-label="Previous">&#8592;</button>
      <div class="sdots" id="sdots"></div>
      <button class="snav-btn" id="next" aria-label="Next">&#8594;</button>
    </div>
  `;

  let idx = 0;
  const track = block.querySelector('#slider-track');
  const dots = block.querySelector('#sdots');
  const visible = () => (window.innerWidth < 900 ? 1 : 3);
  const max = () => Math.max(0, slides.length - visible());

  const goTo = (i) => {
    idx = Math.max(0, Math.min(i, max()));
    const w = block.querySelector('.slide-card').offsetWidth + 24;
    track.style.transform = `translateX(-${idx * w}px)`;
    dots.querySelectorAll('.sdot').forEach((d, j) => d.classList.toggle('on', j === idx));
  };

  const buildDots = () => {
    dots.innerHTML = '';
    for (let i = 0; i <= max(); i += 1) {
      const d = document.createElement('button');
      d.className = `sdot${i === 0 ? ' on' : ''}`;
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dots.appendChild(d);
    }
  };

  block.querySelector('#prev').addEventListener('click', () => goTo(idx - 1));
  block.querySelector('#next').addEventListener('click', () => goTo(idx + 1));
  buildDots();
  state.timer = setInterval(() => goTo(idx + 1 > max() ? 0 : idx + 1), 5000);
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

  const state = { timer: null };
  const recentAuthored = authored.filter(isRecent).sort(newestFirst);

  // Show authored cards right away (this block sits near the top of the
  // homepage), then merge in the auto-generated Game Update cards.
  render(block, recentAuthored, state);
  loadGameUpdates().then((updates) => {
    const fresh = updates.filter((u) => isRecent(u) && !coveredByAuthored(u, authored));
    if (fresh.length) render(block, [...recentAuthored, ...fresh].sort(newestFirst), state);
  });
}
