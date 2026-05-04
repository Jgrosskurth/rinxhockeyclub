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

loadPage();
