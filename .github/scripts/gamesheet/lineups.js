// Read a GameSheet game page's Lineups tab (?tab=lineups): every player and goalie
// table, in page order (visitor first). Evaluated in the page
// by .github/scripts/pull_gamesheet_boxscores.py. The page renders desktop and
// mobile copies of each table, so identical tables are kept once.
() => {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const seen = new Set();
  const tables = [];
  document.querySelectorAll('table, [role="table"]').forEach((t) => {
    const heads = [...t.querySelectorAll('thead th, [role="columnheader"]')]
      .map((h) => norm(h.textContent).replace(/[↑↓]/g, '').trim().toUpperCase());
    const rows = [...t.querySelectorAll('tbody tr, [role="row"]')]
      .map((r) => [...r.querySelectorAll('td, [role="cell"]')].map((c) => norm(c.textContent)))
      .filter((c) => c.length > 2);
    let kind = '';
    if (heads.includes('GOALIE')) kind = 'goalies';
    else if (heads.includes('PLAYER')) kind = 'players';
    const sig = JSON.stringify(rows);
    if (!kind || seen.has(sig)) return;
    seen.add(sig);
    tables.push({ kind, heads, rows });
  });
  return { tables };
}
