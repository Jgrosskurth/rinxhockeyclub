// Instagram feed: the clubs' newest posts as a grid of thumbnails, each linking
// to the post on Instagram. Replaces the Elfsight widget.
//
// The posts come from ig/feed.json, which .github/workflows/update-instagram.yml
// refreshes twice a day (fetch-instagram.mjs, via Apify) together with a small
// thumbnail per post in ig/ (Instagram's own image links expire and can't be
// shown on other sites). Without the feed, the block still shows the follow
// buttons for both accounts.

const FEED = '/ig/feed.json';
const ACCOUNTS = ['rinx10usquirts', 'rinx14usouth'];
const SHOW = 6;

const PLAY = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
const STACK = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 3h11a3 3 0 0 1 3 3v11h-2V6a1 1 0 0 0-1-1H7z" fill="currentColor"/><rect x="3" y="7" width="14" height="14" rx="2" fill="currentColor"/></svg>';

function followButtons() {
  const wrap = document.createElement('p');
  wrap.className = 'instagram-follow-links';
  ACCOUNTS.forEach((h) => {
    const a = document.createElement('a');
    a.className = 'btn btn-navy';
    a.href = `https://www.instagram.com/${h}/`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = `@${h}`;
    a.setAttribute('aria-label', `Follow @${h} on Instagram (opens in a new tab)`);
    wrap.append(a);
  });
  return wrap;
}

// First line of the caption, without trailing hashtags, for the link label.
function shortCaption(text) {
  const line = (text || '').split('\n')[0].replace(/(\s+#\S+)+\s*$/, '').trim();
  return line.length > 90 ? `${line.slice(0, 87).trimEnd()}…` : line;
}

function tile(post) {
  const li = document.createElement('li');
  li.className = 'instagram-post';
  const a = document.createElement('a');
  a.href = post.permalink;
  a.target = '_blank';
  a.rel = 'noopener';
  const caption = shortCaption(post.caption);
  const kind = post.video ? 'video' : 'post';
  a.setAttribute('aria-label', `Instagram ${kind} from @${post.account}${caption ? `: ${caption}` : ''} (opens in a new tab)`);

  const img = document.createElement('img');
  img.src = `/ig/${post.image}`;
  img.alt = '';
  img.width = 480;
  img.height = 480;
  img.loading = 'lazy';
  img.decoding = 'async';
  // A thumbnail that fails to load just hides its tile.
  img.addEventListener('error', () => li.remove());
  a.append(img);

  if (post.video || post.carousel) {
    const badge = document.createElement('span');
    badge.className = 'instagram-badge';
    badge.innerHTML = post.video ? PLAY : STACK;
    a.append(badge);
  }
  const who = document.createElement('span');
  who.className = 'instagram-account';
  who.textContent = `@${post.account}`;
  a.append(who);
  li.append(a);
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

/**
 * loads and decorates the instagram feed block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const heading = block.querySelector('h1, h2, h3')?.textContent?.trim();
  block.textContent = '';

  const title = document.createElement('h2');
  title.className = 'instagram-title';
  title.id = 'instagram-title';
  title.textContent = heading || 'Follow Us on Instagram';
  const note = document.createElement('p');
  note.className = 'instagram-note';
  note.textContent = 'Game-day photos, highlights and team news.';
  block.append(title, note, followButtons());

  const grid = document.createElement('ul');
  grid.className = 'instagram-grid';
  grid.setAttribute('aria-labelledby', 'instagram-title');
  block.append(grid);

  loadPosts().then((posts) => {
    if (!posts.length) {
      grid.remove();
      return;
    }
    posts.slice(0, SHOW).forEach((p) => grid.append(tile(p)));
  });
}
