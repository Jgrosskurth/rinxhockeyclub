// Fetches latest public posts for both accounts via Apify's Instagram scraper,
// downloads thumbnails (Instagram image URLs expire), merges, sorts, writes ig/feed.json.
// Run: APIFY_TOKEN=... node fetch-instagram.mjs
import { mkdir, writeFile } from "node:fs/promises";

const TOKEN = process.env.APIFY_TOKEN;
const ACCOUNTS = ["rinx14usouth", "rinx10usquirts"];
const PER_ACCOUNT = 12;
const TOTAL = 12;
const OUT = "ig";
const ACTOR = "apify~instagram-scraper";

if (!TOKEN) { console.error("APIFY_TOKEN not set"); process.exit(1); }
await mkdir(OUT, { recursive: true });

// Only download images from Instagram's CDN hosts.
const okImageHost = (u) => {
  try {
    const { protocol, hostname } = new URL(u);
    return protocol === "https:" && /(^|\.)(cdninstagram\.com|fbcdn\.net)$/.test(hostname);
  } catch { return false; }
};

const res = await fetch(
  `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({
      directUrls: ACCOUNTS.map((a) => `https://www.instagram.com/${a}/`),
      resultsType: "posts",
      resultsLimit: PER_ACCOUNT,
      addParentData: false,
    }),
  }
);
if (!res.ok) { console.error(`Apify error ${res.status}`); process.exit(1); }
const items = await res.json();

const posts = [];
for (const m of items) {
  const handle = m.ownerUsername;
  if (!ACCOUNTS.includes(handle)) continue;
  if (!/^https:\/\/www\.instagram\.com\/(p|reel)\/[\w-]+\/?/.test(m.url || "")) continue;
  if (!okImageHost(m.displayUrl)) continue;
  try {
    const img = await fetch(m.displayUrl);
    if (!img.ok) continue;
    const file = `${handle}-${m.shortCode}.jpg`;
    await writeFile(`${OUT}/${file}`, Buffer.from(await img.arrayBuffer()));
    posts.push({
      account: handle,
      permalink: m.url,
      image: file,
      caption: (m.caption || "").slice(0, 160),
      timestamp: m.timestamp,
      video: m.type === "Video",
    });
  } catch (e) {
    console.error(`Skipped ${m.shortCode}: ${e.message}`);
  }
}

if (posts.length === 0) { console.error("No posts fetched, keeping previous feed.json"); process.exit(1); }
posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
await writeFile(`${OUT}/feed.json`, JSON.stringify({ updated: new Date().toISOString(), posts: posts.slice(0, TOTAL) }, null, 2));
console.log(`Wrote ${Math.min(posts.length, TOTAL)} posts`);
