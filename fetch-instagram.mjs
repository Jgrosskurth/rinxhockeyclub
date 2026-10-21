// Fetches latest public posts for both accounts via Apify's Instagram scraper,
// saves a small thumbnail per post (Instagram's image URLs expire and can't be
// shown on other sites), merges, sorts, writes ig/feed.json. The homepage
// Instagram block (blocks/instagram) shows the thumbnails, each linking to the
// post on Instagram.
// Run: APIFY_TOKEN=... node fetch-instagram.mjs   (needs ImageMagick's `convert`,
// preinstalled on GitHub's ubuntu runners)
import {
  mkdir, writeFile, readFile, readdir, rm, access,
} from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const TOKEN = process.env.APIFY_TOKEN;
const ACCOUNTS = ['rinx14usouth', 'rinx10usquirts'];
const PER_ACCOUNT = 12;
const TOTAL = 12;
const OUT = 'ig';
const ACTOR = 'apify~instagram-scraper';
const THUMB = 480; // square, shown at up to ~360px wide

if (!TOKEN) { console.error('APIFY_TOKEN not set'); process.exit(1); }
await mkdir(OUT, { recursive: true });

// Only download images from Instagram's CDN hosts.
const okImageHost = (u) => {
  try {
    const { protocol, hostname } = new URL(u);
    return protocol === 'https:' && /(^|\.)(cdninstagram\.com|fbcdn\.net)$/.test(hostname);
  } catch { return false; }
};
const exists = (f) => access(f).then(() => true, () => false);
// Captions for the homepage cards: up to ~300 characters, cut at a word.
const CAPTION_MAX = 300;
const clip = (text = '') => {
  const t = text.trim();
  if (t.length <= CAPTION_MAX) return t;
  const cut = t.slice(0, CAPTION_MAX);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), CAPTION_MAX - 40)).trimEnd()}…`;
};

const res = await fetch(
  `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({
      directUrls: ACCOUNTS.map((a) => `https://www.instagram.com/${a}/`),
      resultsType: 'posts',
      resultsLimit: PER_ACCOUNT,
      addParentData: false,
    }),
  },
);
if (!res.ok) { console.error(`Apify error ${res.status}`); process.exit(1); }
const items = await res.json();

// Newest posts first, then thumbnails for just the ones we keep.
const candidates = items
  .filter((m) => ACCOUNTS.includes(m.ownerUsername))
  .filter((m) => /^https:\/\/www\.instagram\.com\/(p|reel)\/[\w-]+\/?/.test(m.url || ''))
  .filter((m) => okImageHost(m.displayUrl))
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

const posts = [];
for (const m of candidates) {
  if (posts.length >= TOTAL) break;
  const handle = m.ownerUsername;
  const file = `${handle}-${m.shortCode}.webp`;
  try {
    // A post's photo doesn't change: keep the thumbnail we already have.
    if (!await exists(`${OUT}/${file}`)) {
      const img = await fetch(m.displayUrl);
      if (!img.ok) continue;
      const tmp = `${OUT}/.download-${m.shortCode}`;
      await writeFile(tmp, Buffer.from(await img.arrayBuffer()));
      await run('convert', [tmp, '-auto-orient', '-resize', `${THUMB}x${THUMB}^`, '-gravity', 'center',
        '-extent', `${THUMB}x${THUMB}`, '-strip', '-quality', '78', `${OUT}/${file}`]);
      await rm(tmp, { force: true });
    }
    posts.push({
      account: handle,
      permalink: m.url,
      image: file,
      caption: clip(m.caption || ''),
      timestamp: m.timestamp,
      video: m.type === 'Video',
      carousel: m.type === 'Sidecar',
    });
  } catch (e) {
    console.error(`Skipped ${m.shortCode}: ${e.message}`);
  }
}

if (posts.length === 0) { console.error('No posts fetched, keeping previous feed.json'); process.exit(1); }

// Only rewrite feed.json (and its "updated" time) when the posts changed.
const previous = await readFile(`${OUT}/feed.json`, 'utf8').then(JSON.parse, () => ({}));
if (JSON.stringify(previous.posts) !== JSON.stringify(posts)) {
  await writeFile(`${OUT}/feed.json`, `${JSON.stringify({ updated: new Date().toISOString(), posts }, null, 2)}\n`);
  console.log(`Wrote ${posts.length} posts`);
} else {
  console.log(`No new posts (${posts.length})`);
}

// Remove thumbnails no longer in the feed (including older full-size .jpg copies).
const keep = new Set(['feed.json', ...posts.map((p) => p.image)]);
for (const f of await readdir(OUT)) {
  if (!keep.has(f)) await rm(`${OUT}/${f}`, { force: true });
}
