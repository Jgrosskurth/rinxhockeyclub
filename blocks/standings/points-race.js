/*
 * Season Points Race
 * Cumulative standings points after each game, one line per division team,
 * built from the division's completed games (data/games-{10u|14u}.json).
 * Focus + context: Rinx is the red line with a light area wash, every other
 * team is a muted gray line, and a team's logo marks the end of its line.
 * Hover/focus a legend item (or a logo) to bring that team forward; the
 * crosshair tooltip lists every team's points at the hovered game. The
 * standings table below is the table view.
 */
import { teamLogo, RINX_LOGO } from '../../scripts/team-logos.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MARKER_R = 13;
let instance = 0;

function parseDate(str) {
  const m = (str || '').match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (!m) return 0;
  return new Date(+m[3], MONTHS.indexOf(m[1].toLowerCase()), +m[2]).getTime();
}

function svg(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

const initials = (name) => name.split(' ').slice(0, 2).map((w) => w[0]).join('')
  .toUpperCase();

/**
 * Per-team cumulative points, using GameSheet's standings rules
 * (W 2, T 1, OT/SO loss 1). Games against teams outside the standings
 * (e.g. exhibitions vs another division) still count for the division team,
 * as they do in GameSheet's own standings.
 * @param {Array} games division games feed
 * @param {Array} teams standings feed teams
 * @param {Function} tidy team-name clean-up shared with the table
 */
export function buildRace(games, teams, tidy) {
  const byName = new Map(teams.map((t) => {
    const name = tidy(t.team);
    return [name, {
      name,
      ours: !!t.ours,
      rank: +t.rank || 99,
      pts: +t.pts || 0,
      logo: t.ours ? RINX_LOGO : teamLogo(name),
      series: [0],
    }];
  }));
  const award = (team, us, them, ot) => {
    if (!team) return;
    let p = 0;
    if (us > them) p = 2;
    else if (us === them || ot) p = 1;
    team.series.push(team.series[team.series.length - 1] + p);
  };
  games
    .map((g, i) => ({ ...g, t: parseDate(g.date), i }))
    .sort((a, b) => a.t - b.t || a.i - b.i)
    .forEach((g) => {
      award(byName.get(tidy(g.visitor)), g.visitorScore, g.homeScore, g.ot);
      award(byName.get(tidy(g.home)), g.homeScore, g.visitorScore, g.ot);
    });
  const race = [...byName.values()].sort((a, b) => a.rank - b.rank);
  race.forEach((t) => {
    const last = t.series[t.series.length - 1];
    // eslint-disable-next-line no-console
    if (last !== t.pts) console.warn(`points race: ${t.name} computed ${last}, standings ${t.pts}`);
  });
  return race;
}

/**
 * Render the points race into a container.
 * @param {Element} root empty container
 * @param {Array} race output of buildRace
 */
export function renderPointsRace(root, race) {
  instance += 1;
  const uid = `pr${instance}`;
  const ours = race.find((t) => t.ours);

  root.textContent = '';
  const head = el('div', 'pr-head');
  head.append(el('h3', 'pr-title', 'Season Points Race'));
  head.append(el('p', 'pr-sub', 'Standings points after each game played (win 2, tie 1)'));

  const legend = el('ul', 'pr-legend');
  const plot = el('div', 'pr-plot');
  plot.tabIndex = 0;
  plot.setAttribute('role', 'img');
  const leader = race[0];
  plot.setAttribute('aria-label', `Season points race. ${ours ? `${ours.name}: ${ours.pts} points. ` : ''}Leader: ${leader.name}, ${leader.pts} points. Full numbers in the standings table below.`);
  const tip = el('div', 'pr-tip');
  tip.hidden = true;
  root.append(head, legend, plot);

  let active = null; // index of the highlighted team
  let lines = [];
  let ends = [];

  const setActive = (i) => {
    active = i;
    root.classList.toggle('has-active', i != null);
    lines.forEach((ln, j) => ln.classList.toggle('is-active', j === i));
    ends.forEach((g, j) => g.classList.toggle('is-active', j === i));
    legend.querySelectorAll('.pr-key').forEach((b, j) => b.classList.toggle('is-active', j === i));
  };

  race.forEach((t, i) => {
    const li = el('li');
    const btn = el('button', `pr-key${t.ours ? ' is-ours' : ''}`);
    btn.type = 'button';
    btn.append(el('span', 'pr-key-line'));
    btn.append(el('span', 'pr-key-name', t.name));
    btn.append(el('span', 'pr-key-pts', `${t.pts}`));
    btn.setAttribute('aria-label', `${t.name}, ${t.pts} points`);
    ['pointerenter', 'focus'].forEach((ev) => btn.addEventListener(ev, () => setActive(i)));
    ['pointerleave', 'blur'].forEach((ev) => btn.addEventListener(ev, () => setActive(null)));
    li.append(btn);
    legend.append(li);
  });

  const draw = () => {
    const w = Math.max(300, plot.clientWidth);
    const h = w < 600 ? 260 : 320;
    // Margins leave room for end-of-line logos sitting on the axes.
    const m = {
      l: 46, r: 30, t: 22, b: 52,
    };
    const maxGP = Math.max(1, ...race.map((t) => t.series.length - 1));
    const maxPts = Math.max(...race.map((t) => t.series[t.series.length - 1]));
    const step = maxPts <= 10 ? 2 : Math.ceil(maxPts / 5 / 2) * 2;
    const yMax = Math.max(4, Math.ceil(maxPts / step) * step);
    const x = (i) => m.l + (i / maxGP) * (w - m.l - m.r);
    const y = (p) => m.t + (1 - p / yMax) * (h - m.t - m.b);

    const chart = svg('svg', {
      width: w, height: h, viewBox: `0 0 ${w} ${h}`, 'aria-hidden': 'true', focusable: 'false',
    });
    const defs = svg('defs');
    chart.append(defs);

    // Recessive grid + axes
    const grid = svg('g', { class: 'pr-grid' });
    for (let p = 0; p <= yMax; p += step) {
      grid.append(svg('line', {
        x1: m.l, x2: w - m.r, y1: y(p), y2: y(p), class: p === 0 ? 'pr-base' : '',
      }));
      const lbl = svg('text', {
        x: m.l - 18, y: y(p), 'text-anchor': 'end', 'dominant-baseline': 'middle', class: 'pr-tick',
      });
      lbl.textContent = p;
      grid.append(lbl);
    }
    const every = maxGP > 12 ? 2 : 1;
    for (let i = 1; i <= maxGP; i += every) {
      const lbl = svg('text', {
        x: x(i), y: h - m.b + 26, 'text-anchor': 'middle', class: 'pr-tick',
      });
      lbl.textContent = i;
      grid.append(lbl);
    }
    const xTitle = svg('text', {
      x: m.l + (w - m.l - m.r) / 2, y: h - 4, 'text-anchor': 'middle', class: 'pr-axis-title',
    });
    xTitle.textContent = 'Games played';
    grid.append(xTitle);
    const yTitle = svg('text', {
      x: m.l - 18, y: m.t - 10, 'text-anchor': 'end', class: 'pr-axis-title',
    });
    yTitle.textContent = 'PTS';
    grid.append(yTitle);
    chart.append(grid);

    const pts = (t) => t.series.map((p, i) => `${x(i)},${y(p)}`).join(' ');

    // Our area wash sits under every line.
    if (ours && ours.series.length > 1) {
      const last = ours.series.length - 1;
      chart.append(svg('polygon', {
        class: 'pr-area',
        points: `${pts(ours)} ${x(last)},${y(0)} ${x(0)},${y(0)}`,
      }));
    }

    const lineLayer = svg('g');
    chart.append(lineLayer);
    lines = race.map((t) => svg('polyline', {
      class: `pr-line${t.ours ? ' is-ours' : ''}`, points: pts(t),
    }));
    // Draw others first, ours on top.
    lines.forEach((ln, i) => { if (!race[i].ours) lineLayer.append(ln); });
    lines.forEach((ln, i) => { if (race[i].ours) lineLayer.append(ln); });

    // Crosshair layer (below markers so logos stay clickable).
    const cross = svg('line', {
      class: 'pr-cross', y1: m.t, y2: h - m.b, visibility: 'hidden',
    });
    chart.append(cross);

    // End markers: logo discs; teams sharing an end point fan out sideways.
    const groups = new Map();
    race.forEach((t, i) => {
      const last = t.series.length - 1;
      const key = `${last}:${t.series[last]}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(i);
    });
    const endLayer = svg('g');
    ends = new Array(race.length);
    groups.forEach((idxs) => {
      const t0 = race[idxs[0]];
      const last = t0.series.length - 1;
      const px = x(last);
      const py = y(t0.series[last]);
      const gap = MARKER_R * 2 + 4;
      const span = (idxs.length - 1) * gap;
      // Centre the fan on the point, kept inside the plot.
      const start = Math.min(Math.max(px - span / 2, m.l), w - MARKER_R - 2 - span);
      idxs.forEach((ti, k) => {
        const t = race[ti];
        const cx = idxs.length > 1 ? start + k * gap : px;
        const g = svg('g', { class: `pr-end${t.ours ? ' is-ours' : ''}`, tabindex: '-1' });
        if (Math.abs(cx - px) > 1) {
          g.append(svg('line', {
            class: 'pr-leader', x1: px, y1: py, x2: cx, y2: py,
          }));
        }
        g.append(svg('circle', {
          class: 'pr-disc', cx, cy: py, r: MARKER_R,
        }));
        if (t.logo) {
          const clipId = `${uid}-c${ti}`;
          const clip = svg('clipPath', { id: clipId });
          clip.append(svg('circle', { cx, cy: py, r: MARKER_R - 2 }));
          defs.append(clip);
          const img = svg('image', {
            href: t.logo,
            x: cx - (MARKER_R - 2),
            y: py - (MARKER_R - 2),
            width: (MARKER_R - 2) * 2,
            height: (MARKER_R - 2) * 2,
            'clip-path': `url(#${clipId})`,
            preserveAspectRatio: 'xMidYMid meet',
          });
          g.append(img);
        } else {
          const txt = svg('text', {
            x: cx, y: py, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'pr-ini',
          });
          txt.textContent = initials(t.name);
          g.append(txt);
        }
        const title = svg('title');
        title.textContent = `${t.name}: ${t.pts} pts`;
        g.append(title);
        g.addEventListener('pointerenter', () => setActive(ti));
        g.addEventListener('pointerleave', () => setActive(null));
        ends[ti] = g;
        endLayer.append(g);
      });
    });
    // Ours drawn last so it sits on top of any overlap.
    ends.forEach((g, i) => { if (race[i].ours) endLayer.append(g); });
    chart.append(endLayer);

    // Crosshair + tooltip: snaps to the nearest game number.
    const showAt = (i) => {
      cross.setAttribute('x1', x(i));
      cross.setAttribute('x2', x(i));
      cross.setAttribute('visibility', 'visible');
      const rows = race
        .filter((t) => t.series.length > i)
        .map((t) => ({ t, p: t.series[i] }))
        .sort((a, b) => b.p - a.p || a.t.rank - b.t.rank);
      tip.textContent = '';
      tip.append(el('div', 'pr-tip-head', i === 0 ? 'Season start' : `After game ${i}`));
      rows.forEach(({ t, p }) => {
        const row = el('div', `pr-tip-row${t.ours ? ' is-ours' : ''}`);
        row.append(el('span', 'pr-key-line'));
        row.append(el('strong', 'pr-tip-val', `${p}`));
        row.append(el('span', 'pr-tip-name', t.name));
        tip.append(row);
      });
      tip.hidden = false;
      const tipW = tip.offsetWidth;
      const left = x(i) + 14 + tipW > w ? x(i) - 14 - tipW : x(i) + 14;
      tip.style.left = `${Math.max(0, left)}px`;
      tip.style.top = `${m.t}px`;
      plot.dataset.game = i;
    };
    const hide = () => {
      cross.setAttribute('visibility', 'hidden');
      tip.hidden = true;
      delete plot.dataset.game;
    };
    const nearest = (clientX) => {
      const rect = chart.getBoundingClientRect();
      const i = Math.round(((clientX - rect.left - m.l) / (w - m.l - m.r)) * maxGP);
      return Math.max(0, Math.min(maxGP, i));
    };
    chart.addEventListener('pointermove', (e) => showAt(nearest(e.clientX)));
    chart.addEventListener('pointerleave', hide);
    plot.onkeydown = (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const cur = plot.dataset.game != null ? +plot.dataset.game : maxGP + 1;
      showAt(Math.max(0, Math.min(maxGP, cur + (e.key === 'ArrowLeft' ? -1 : 1))));
    };
    plot.onblur = hide;

    plot.textContent = '';
    plot.append(chart, tip);
    if (active != null) setActive(active);
  };

  draw();
  let lastW = plot.clientWidth;
  new ResizeObserver(() => {
    if (Math.abs(plot.clientWidth - lastW) < 8) return;
    lastW = plot.clientWidth;
    draw();
  }).observe(plot);
}
