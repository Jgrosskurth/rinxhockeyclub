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
  { date: '09/06/24', opp: 'New York Aviators', loc: 'The Rinx at Hauppauge', score: '8-6', result: 'W', color: '#1a3a8f', logoId: '001dfe' },
  { date: '09/07/24', opp: 'Long Island Kings', loc: 'Superior Ice Rink', score: '4-9', result: 'L', color: '#006400', logoId: '001ba2' },
  { date: '09/13/24', opp: 'North Park', loc: 'City Ice Pavilion', score: '5-4', result: 'W', color: '#1a1a5e', logoId: '002ee8' },
  { date: '09/20/24', opp: 'Great Neck Bruins', loc: 'Away', score: '2-0', result: 'W', color: '#f5a800', logoId: '001934' },
  { date: '09/21/24', opp: 'Long Island Arrows', loc: 'The Rinx at Hauppauge', score: '16-2', result: 'W', color: '#8b0000', logoId: '0013c6' },
  { date: '09/27/24', opp: 'Nassau County Lions', loc: 'UBS Arena', score: '3-3', result: 'T', color: '#c8102e', logoId: '00017d' },
  { date: '10/04/24', opp: 'Long Beach Lightning', loc: 'Away', score: '8-3', result: 'W', color: '#004488', logoId: '0004c5' },
  { date: '10/11/24', opp: 'Long Island Sharks', loc: 'The Rinx at Hauppauge', score: '13-1', result: 'W', color: '#004488', logoId: '000bd3' },
  { date: '10/12/24', opp: 'Long Island Arrows', loc: 'Away', score: '16-6', result: 'W', color: '#8b0000', logoId: '0013c6' },
  { date: '10/18/24', opp: 'Long Island Edge', loc: 'The Rinx at Hauppauge', score: '11-2', result: 'W', color: '#006633', logoId: '000723' },
  { date: '10/25/24', opp: 'Dix Hills Hawks', loc: 'The Rinx at Hauppauge', score: '1-2', result: 'L', color: '#c8102e', logoId: '000f90' },
  { date: '11/01/24', opp: 'New York City Cyclones', loc: 'The Rinx at Hauppauge', score: '3-11', result: 'L', color: '#1a1a6e', logoId: '001589' },
  { date: '11/02/24', opp: 'Long Island Edge', loc: 'Away', score: '5-5', result: 'T', color: '#006633', logoId: '000723' },
  { date: '11/08/24', opp: 'Dix Hills Hawks', loc: 'Away', score: '2-5', result: 'L', color: '#c8102e', logoId: '000f90' },
  { date: '11/09/24', opp: 'Mamaroneck Tigers', loc: 'The Rinx at Hauppauge', score: '4-3', result: 'W', color: '#ff6600', logoId: '00075f' },
  { date: '11/15/24', opp: 'New York Aviators', loc: 'Away', score: '6-4', result: 'W', color: '#1a3a8f', logoId: '001dfe' },
  { date: '11/16/24', opp: 'North Park', loc: 'The Rinx at Hauppauge', score: '1-4', result: 'L', color: '#1a1a5e', logoId: '002ee8' },
  { date: '11/22/24', opp: 'Westchester Express', loc: 'Away', score: '8-0', result: 'W', color: '#2ecc40', logoId: '001f15' },
  { date: '11/23/24', opp: 'Long Island Kings', loc: 'The Rinx at Hauppauge', score: '2-11', result: 'L', color: '#006400', logoId: '001ba2' },
  { date: '12/06/24', opp: 'Mamaroneck Tigers', loc: 'Gerald LaGrange Field House', score: '0-6', result: 'L', color: '#ff6600', logoId: '00075f' },
  { date: '12/07/24', opp: 'Great Neck Bruins', loc: 'Away', score: '1-3', result: 'L', color: '#f5a800', logoId: '001934' },
  { date: '12/13/24', opp: 'Peconic Wildcats', loc: 'Away', score: '1-5', result: 'L', color: '#0066cc', logoId: '00153e' },
  { date: '12/20/24', opp: 'Long Beach Lightning', loc: 'Away', score: '7-3', result: 'W', color: '#004488', logoId: '0004c5' },
  { date: '01/03/25', opp: 'Peconic Wildcats', loc: 'Away', score: '1-2', result: 'L', color: '#0066cc', logoId: '00153e' },
  { date: '01/10/25', opp: 'Westchester Express', loc: 'Away', score: '4-3', result: 'W', color: '#2ecc40', logoId: '001f15' },
  { date: '01/24/25', opp: 'Westchester Vipers', loc: 'The Rinx at Hauppauge', score: '7-2', result: 'W', color: '#6600cc', logoId: '00000b' },
  { date: '01/31/25', opp: 'Long Island Sharks', loc: 'Away', score: '12-2', result: 'W', color: '#004488', logoId: '000bd3' },
  { date: '02/01/25', opp: 'New York City Cyclones', loc: 'Chelsea Piers Sky Rink', score: '2-5', result: 'L', color: '#1a1a6e', logoId: '001589' },
  { date: '02/14/25', opp: 'South Hills Panthers', loc: 'Away (Tournament)', score: '1-1', result: 'T', color: '#004488', logoId: '001d53' },
  { date: '02/15/25', opp: 'Pittsburgh Predators', loc: 'Away (Tournament)', score: '2-3', result: 'L', color: '#ffcc00', logoId: '00133e' },
  { date: '02/15/25', opp: 'Montclair Blues', loc: 'Away (Tournament)', score: '2-8', result: 'L', color: '#003580', logoId: '00018b' },
  { date: '02/16/25', opp: 'Montgomery Ice Devils', loc: 'Away (Tournament)', score: '5-3', result: 'W', color: '#cc0000', logoId: '0014fd' },
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
