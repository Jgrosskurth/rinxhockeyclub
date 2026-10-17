// Read a GameSheet game page's Box Score tab (gamesheetstats.com/seasons/{s}/games/{id}?tab=box-score)
// into a plain object. Used by pull_gamesheet.py --type boxscores (evaluated in the page);
// kept as its own file so it can be tested against a saved copy of the page.
// Reads textContent (innerText follows the page's CSS uppercase).
() => {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const leaves = (root) => [...root.querySelectorAll('*')]
    .filter((e) => !e.children.length && norm(e.textContent))
    .map((e) => norm(e.textContent));
  const heading = (t) => [...document.querySelectorAll('span')]
    .find((e) => !e.children.length && norm(e.textContent).toUpperCase() === t);
  const section = (t) => heading(t)?.parentElement?.nextElementSibling || null;

  // Team lines (goals or shots by period). Row order is visitor, home.
  const lines = (t) => {
    const tb = section(t)?.querySelector('table');
    if (!tb) return null;
    const heads = [...tb.querySelectorAll('thead th')].map((th) => norm(th.textContent));
    return {
      periods: heads.slice(1, -1),
      rows: [...tb.querySelectorAll('tbody tr')].map((r) => {
        const c = [...r.querySelectorAll('td')].map((td) => norm(td.textContent));
        return { team: c[0], logo: r.querySelector('img')?.src || '', periods: c.slice(1, -1), total: c[c.length - 1] };
      }),
    };
  };

  // "#18 SEAN FOX (2)" -> number, name, season count
  const person = (p) => {
    const t = norm(p.textContent);
    const m = t.match(/^#(\S+)\s+(.*?)(?:\s*\((\d+)\))?$/);
    const name = norm(p.querySelector('a')?.textContent) || (m ? m[2] : t);
    return { number: m ? m[1] : '', name, count: m && m[3] ? m[3] : '' };
  };

  // Goals / penalties, grouped by period headers
  const events = (t) => {
    const sec = section(t);
    if (!sec) return [];
    const out = [];
    const groups = sec.querySelector('.space-y-4')?.children || sec.children;
    [...groups].forEach((g) => {
      const period = norm(g.querySelector('span')?.textContent);
      // event rows start with the fixed-width time column
      [...g.querySelectorAll('div')].filter((d) => (d.firstElementChild?.getAttribute('class') || '').includes('w-[40px]')).forEach((row) => {
        const timeBox = row.firstElementChild;
        const flags = [...timeBox.querySelectorAll('span')].map((s) => norm(s.textContent));
        const body = row.querySelector('.min-w-0') || row.lastElementChild;
        const people = [...body.querySelectorAll('p')].filter((p) => /^#/.test(norm(p.textContent))).map(person);
        const own = [...body.children].filter((e) => e.tagName === 'SPAN').map((e) => norm(e.textContent));
        const texts = leaves(body).filter((x) => !/^#/.test(x) && !people.some((pp) => pp.name === x) && !/^\(\d+\)$/.test(x));
        out.push({
          period,
          time: flags[0] || '',
          tags: flags.slice(1),
          people,
          team: own[own.length - 1] || '',
          logo: row.querySelector('img')?.src || '',
          detail: texts.filter((x) => x !== own[own.length - 1]).join(' · '),
        });
      });
    });
    return out;
  };

  // Goalies: the summary table has one row per goalie, each with its team logo
  const goalies = [];
  [...document.querySelectorAll('table')].forEach((tb) => {
    const heads = [...tb.querySelectorAll('thead th')].map((th) => norm(th.textContent).toUpperCase());
    if (heads[0] !== 'GOALIE') return;
    tb.querySelectorAll('tbody tr').forEach((r) => {
      const c = [...r.querySelectorAll('td')].map((td) => norm(td.textContent));
      const m = (c[0] || '').match(/^#(\S+)\s+(.*?)(?:\s*\(([WLTO]{1,3})\))?$/i);
      let logo = r.querySelector('img')?.src || '';
      if (!logo) logo = tb.parentElement?.closest('div')?.parentElement?.querySelector('img')?.src || '';
      const g = {
        number: m ? m[1] : '', name: m ? m[2] : c[0], decision: m && m[3] ? m[3].toUpperCase() : '',
        min: c[1] || '', on: c[2] || '', off: c[3] || '', logo,
      };
      const prev = goalies.find((x) => x.name === g.name && x.number === g.number);
      if (prev) { Object.keys(g).forEach((k) => { if (!prev[k] && g[k]) prev[k] = g[k]; }); } else goalies.push(g);
    });
  });

  // Header: "Game #6", "Tournament", "Oct 9, 2026, 5:05 PM", "Hatfield Ice Arena (Blue)"
  const back = [...document.querySelectorAll('a')].find((e) => /^back to games$/i.test(norm(e.textContent)));
  const info = back ? leaves(back.parentElement).filter((x) => !/^back to games$/i.test(x)).slice(0, 4) : [];
  const status = [...document.querySelectorAll('span, p, div')]
    .map((e) => (!e.children.length ? norm(e.textContent).toUpperCase() : ''))
    .find((x) => /^(FINAL|FINAL\/OT|FINAL\/SO|FINAL OT|FINAL SO)$/.test(x)) || '';

  return {
    info,
    status,
    scoring: lines('SCORING'),
    shots: lines('SHOTS'),
    goalies,
    goals: events('GOALS BY PERIOD'),
    penalties: events('PENALTIES BY PERIOD'),
  };
}
