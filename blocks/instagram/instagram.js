// Instagram feed: a carousel of the clubs' six newest posts, each a card with
// the photo, account, date and caption, linking to the post on Instagram.
// Built like the homepage's Latest Updates slider: swipe on phones, arrow
// buttons on wider screens.
//
// The posts come from ig/feed.json, which .github/workflows/update-instagram.yml
// refreshes twice a day (fetch-instagram.mjs, via Apify) together with a small
// thumbnail per post in ig/ (Instagram's own image links expire and can't be
// shown on other sites). Without the feed, the block still shows the follow
// buttons for both accounts.

const FEED = '/ig/feed.json';
const ACCOUNTS = ['rinx10usquirts', 'rinx14usouth'];
const SHOW = 6;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PLAY = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
const STACK = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 3h11a3 3 0 0 1 3 3v11h-2V6a1 1 0 0 0-1-1H7z" fill="currentColor"/><rect x="3" y="7" width="14" height="14" rx="2" fill="currentColor"/></svg>';
const ARROW = (d) => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};

function externalLink(href, cls, text, label) {
  const a = el('a', cls, text);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener';
  if (label) a.setAttribute('aria-label', `${label} (opens in a new tab)`);
  return a;
}

function followButtons() {
  const wrap = el('p', 'instagram-follow-links');
  ACCOUNTS.forEach((h) => wrap.append(externalLink(`https://www.instagram.com/${h}/`, 'btn btn-navy', `@${h}`, `Follow @${h} on Instagram`)));
  return wrap;
}

function shortDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear() !== new Date().getFullYear() ? `, ${d.getFullYear()}` : '';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}${year}`;
}

function card(post) {
  const li = el('li', 'instagram-card');
  const kind = post.video ? 'video' : 'post';
  const firstLine = (post.caption || '').split('\n')[0].trim();

  const media = externalLink(post.permalink, 'instagram-media', '', `Instagram ${kind} from @${post.account}${firstLine ? `: ${firstLine}` : ''}`);
  const img = el('img');
  img.src = `/ig/${post.image}`;
  img.alt = '';
  img.width = 480;
  img.height = 480;
  img.loading = 'lazy';
  img.decoding = 'async';
  // A thumbnail that fails to load hides its card.
  img.addEventListener('error', () => li.remove());
  media.append(img);
  if (post.video || post.carousel) {
    const badge = el('span', 'instagram-badge');
    badge.innerHTML = post.video ? PLAY : STACK;
    media.append(badge);
  }

  const body = el('div', 'instagram-body');
  const meta = el('p', 'instagram-meta');
  meta.append(externalLink(`https://www.instagram.com/${post.account}/`, 'instagram-account', `@${post.account}`, `@${post.account} on Instagram`));
  const date = shortDate(post.timestamp);
  if (date) {
    const time = el('time', 'instagram-date', date);
    time.dateTime = post.timestamp;
    meta.append(time);
  }
  body.append(meta);
  if (post.caption) body.append(el('p', 'instagram-caption', post.caption.replace(/\s*\n+\s*/g, ' ')));
  body.append(externalLink(post.permalink, 'instagram-more', 'View on Instagram', `View this ${kind} on Instagram`));

  li.append(media, body);
  return li;
}

async function loadPosts() {
  try {
    const resp = await fetch(FEED);
    if (!resp.ok) return [];
    const { posts = [] } = await resp.json();
    return posts.filter((p) => p.permalink && p.image && ACCOUNTS.includes(p.account));
  } catch {
    return [];
  }
}

// Arrow buttons page one card and disable at either end.
function wireArrows(rail, prev, next) {
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
  window.addEventListener('resize', sync);
  sync();
}

/**
 * loads and decorates the instagram feed block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const heading = block.querySelector('h1, h2, h3')?.textContent?.trim();
  block.textContent = '';

  const head = el('div', 'instagram-head');
  const title = el('h2', 'section-title instagram-title', heading || 'Follow Us on Instagram');
  title.id = 'instagram-title';
  const ctrl = el('div', 'instagram-ctrl');
  const prev = el('button', 'instagram-btn');
  const next = el('button', 'instagram-btn');
  [[prev, -1, 'Previous posts', 'M15 5l-7 7 7 7'], [next, 1, 'Next posts', 'M9 5l7 7-7 7']].forEach(([btn, dir, label, d]) => {
    btn.type = 'button';
    btn.dataset.dir = dir;
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-controls', 'instagram-rail');
    btn.innerHTML = ARROW(d);
  });
  ctrl.append(prev, next);
  head.append(title, ctrl);

  const rail = el('ul', 'instagram-rail');
  rail.id = 'instagram-rail';
  rail.setAttribute('aria-labelledby', 'instagram-title');
  rail.tabIndex = 0;

  block.append(head, rail, el('p', 'instagram-note', 'Game-day photos, highlights and team news.'), followButtons());

  loadPosts().then((posts) => {
    if (!posts.length) {
      rail.remove();
      ctrl.remove();
      return;
    }
    posts.slice(0, SHOW).forEach((p) => rail.append(card(p)));
    wireArrows(rail, prev, next);
  });
}
