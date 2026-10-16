import {
  TEAMS, DEFAULT_TEAM, loadTeamGames, loadRecords, calendarUrl, directionsUrl,
  selectTeam, onTeamChange,
} from '../../scripts/team-feeds.js';
import { RINX_LOGO } from '../../scripts/team-logos.js';

// Rink diagram under an 88% navy wash: boards, centre red line, blue lines,
// face-off circles and goal creases.
const RINK = `
  <svg class="hero-rink" viewBox="0 0 1200 560" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="1200" height="560" fill="#dbe8f5"/>
    <rect x="6" y="6" width="1188" height="548" fill="none" stroke="#041E42" stroke-width="12" rx="120"/>
    <line x1="600" y1="0" x2="600" y2="560" stroke="#C8102E" stroke-width="8"/>
    <line x1="380" y1="0" x2="380" y2="560" stroke="#041E42" stroke-width="6" opacity="0.7"/>
    <line x1="820" y1="0" x2="820" y2="560" stroke="#041E42" stroke-width="6" opacity="0.7"/>
    <circle cx="600" cy="280" r="120" fill="none" stroke="#C8102E" stroke-width="5" opacity="0.5"/>
    <circle cx="280" cy="180" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
    <circle cx="280" cy="380" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
    <circle cx="920" cy="180" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
    <circle cx="920" cy="380" r="70" fill="none" stroke="#C8102E" stroke-width="3" opacity="0.35"/>
    <path d="M60 230 Q130 230 130 280 Q130 330 60 330" fill="none" stroke="#C8102E" stroke-width="4" opacity="0.35"/>
    <path d="M1140 230 Q1070 230 1070 280 Q1070 330 1140 330" fill="none" stroke="#C8102E" stroke-width="4" opacity="0.35"/>
    <rect width="1200" height="560" fill="#041E42" opacity="0.88"/>
  </svg>`;

// The record line is always present (empty if unknown) so the card height
// doesn't depend on whether the standings feed answered.
const side = (logo, name, record, away) => `
  <p class="np-side${away ? ' np-away' : ''}">
    ${logo ? `<img src="${logo}" alt="" width="56" height="56" loading="lazy" onerror="this.style.visibility='hidden'">` : '<span class="np-logo-gap"></span>'}
    <span class="np-team"><span class="np-name">${name}</span><span class="np-rec"${record ? ` aria-label="Record ${record} (wins, losses, ties)"` : ''}>${record || ''}</span></span>
  </p>`;

const PIN = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor"/></svg>';

function renderNext(panel, key, { upcoming }, records = {}) {
  const next = upcoming[0];
  if (!next) {
    panel.innerHTML = `
      <div class="np-head"><h2>Next up</h2></div>
      <p class="np-empty">No upcoming ${TEAMS[key].label} games are posted yet.</p>`;
    return;
  }
  const cal = calendarUrl(next, key);
  panel.innerHTML = `
    <div class="np-head"><h2>Next up</h2><p class="np-comp">${next.competition}</p></div>
    <p class="np-when"><span class="np-date">${next.dayLabel}</span>${next.time ? `<span class="np-time">${next.time}</span>` : ''}</p>
    <div class="np-match">
      ${side(RINX_LOGO, 'Rinx', records.us)}
      <p class="np-vs">vs</p>
      ${side(next.oppLogo, next.opp, records.them, true)}
    </div>
    <p class="np-where">
      <a class="np-pin" href="${directionsUrl(next)}" target="_blank" rel="noopener" aria-label="Directions to ${next.home ? 'The Rinx' : next.location} (opens Google Maps)">${PIN}</a>
      <span>${next.home ? 'The Rinx · Home' : next.location}</span>
    </p>
    ${cal ? `<p class="np-actions"><a class="np-cal" href="${cal}" target="_blank" rel="noopener">Add to calendar</a></p>` : ''}`;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
// Background videos (images/hero/, made from images/hero-video.mp4 and
// images/video-hero-10u.mp4): a landscape strip for wide screens, portrait
// below 900px. Each visit shows the next one in turn. It is added after the
// page has loaded so it never delays the first paint; the rink diagram shows
// until it plays. Skipped for reduced motion and data saver.
const VIDEOS = [
  { wide: '/images/hero/hero-wide.mp4', tall: '/images/hero/hero-portrait.mp4' },
  { wide: '/images/hero/hero-10u-wide.mp4', tall: '/images/hero/hero-10u-portrait.mp4' },
];

// The video after the one shown last time (random if storage is blocked).
function pickVideo() {
  try {
    const last = parseInt(localStorage.getItem('rinx-hero-video'), 10);
    const next = last >= 0 ? (last + 1) % VIDEOS.length : 0;
    localStorage.setItem('rinx-hero-video', String(next));
    return VIDEOS[next];
  } catch {
    return VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
  }
}
const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';

function addVideo(block) {
  const conn = navigator.connection;
  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    || conn?.saveData || /2g$/.test(conn?.effectiveType || '')) return;

  const wide = window.matchMedia('(min-width: 900px)');
  const VIDEO = pickVideo();
  const media = document.createElement('div');
  media.className = 'hero-media';
  media.setAttribute('aria-hidden', 'true');
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.disablePictureInPicture = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.preload = 'auto';
  video.src = wide.matches ? VIDEO.wide : VIDEO.tall;
  media.append(video);
  block.querySelector('.hero-rink').after(media);

  // Chrome counts a visible video as the page's largest paint (LCP), which
  // would make the page look slow because the video arrives after load. There
  // the video stays invisible and its frames are drawn onto a canvas (not an
  // LCP candidate). Other browsers (iOS won't play hidden video) show it.
  if (navigator.userAgentData && 'requestVideoFrameCallback' in HTMLVideoElement.prototype) {
    const canvas = document.createElement('canvas');
    media.append(canvas);
    media.classList.add('hero-media-canvas');
    const ctx = canvas.getContext('2d');
    const draw = () => {
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      video.requestVideoFrameCallback(draw);
    };
    video.requestVideoFrameCallback(draw);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'hero-video-toggle';
  block.querySelector('.hero-inner').append(toggle);
  let paused = false;
  const label = () => {
    toggle.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
    toggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
  };
  label();
  const play = () => { if (!paused) video.play().catch(() => {}); };
  toggle.addEventListener('click', () => {
    paused = !paused;
    if (paused) video.pause();
    else play();
    label();
  });

  video.addEventListener('playing', () => block.classList.add('hero-video-on'), { once: true });
  // Only play while the banner is on screen.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) play();
    else video.pause();
  }).observe(block);
  wide.addEventListener('change', () => {
    video.src = wide.matches ? VIDEO.wide : VIDEO.tall;
    play();
  });
}

export default function decorate(block) {
  const season = block.querySelector('p')?.textContent.trim() || '2026–2027 Season';

  block.innerHTML = `
    <div class="hero-inner">
      ${RINK}
      <div class="hero-grid">
        <div class="hero-ident">
          <img src="${RINX_LOGO}" alt="Rinx Hockey Club crest" class="hero-logo" width="140" height="140" fetchpriority="high">
          <h1>Rinx <span>Hockey</span><br>Club</h1>
          <p class="hero-badge">${season}</p>
          <p class="hero-tagline">Travel Hockey &bull; Long Island, New York</p>
          <p class="hero-actions"><a href="/contact">Contact</a></p>
        </div>
        <div class="nextup">
          <div class="team-toggle" role="group" aria-label="Team">
            ${Object.values(TEAMS).map((t) => `<button type="button" data-team="${t.key}" aria-pressed="${t.key === DEFAULT_TEAM}">${t.label}</button>`).join('')}
          </div>
          <div class="np" aria-live="polite"><p class="np-loading">Loading the next game…</p></div>
        </div>
      </div>
    </div>`;

  const panel = block.querySelector('.np');
  const buttons = [...block.querySelectorAll('.team-toggle button')];
  let shown = null;

  const show = async (key) => {
    shown = key;
    buttons.forEach((b) => b.setAttribute('aria-pressed', b.dataset.team === key));
    try {
      const games = await loadTeamGames(key);
      // Fetch records before the first paint of the card, so it renders once.
      const records = games.upcoming[0] ? await loadRecords(games.upcoming[0]) : {};
      if (shown === key) renderNext(panel, key, games, records);
    } catch {
      if (shown !== key) return;
      panel.innerHTML = `
        <div class="np-head"><h2>Next up</h2></div>
        <p class="np-empty">The schedule is unavailable right now.</p>
        <p class="np-actions"><a class="np-cal" href="${TEAMS[key].schedulePath}">${TEAMS[key].label} schedule</a></p>`;
    }
  };

  buttons.forEach((b) => b.addEventListener('click', () => {
    selectTeam(b.dataset.team);
    if (shown !== b.dataset.team) show(b.dataset.team);
  }));
  onTeamChange((key) => { if (shown !== key) show(key); });
  show(DEFAULT_TEAM);

  const later = () => setTimeout(() => addVideo(block), 300);
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
}
