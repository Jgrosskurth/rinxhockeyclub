// "Submit a game" (/submit-game): a button that opens the club's Google Form.
// Its answers reach the schedule, standings and homepage through
// data/form-games.json (.github/workflows/form-games.yml).
//
// Authoring: one row, "Form" | <link to the Google Form>.

function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [k, v] = row.children;
    if (!k) return;
    config[k.textContent.trim().toLowerCase()] = v?.querySelector('a')?.href || v?.textContent.trim() || '';
  });
  return config;
}

const FORM = /^https:\/\/(?:docs\.google\.com\/forms\/|forms\.gle\/)[^\s"'<>]+$/;

export default function decorate(block) {
  const config = readConfig(block);
  const link = [config.form, config['form link'], config['submit to']].find((v) => FORM.test(v || '')) || '';
  block.innerHTML = `
    <div class="gs-card">
      <ol class="gs-steps">
        <li><strong>Upcoming game:</strong> team, date, start time, opponent and rink.</li>
        <li><strong>Score report:</strong> the same details, plus the Rinx and opponent goals.</li>
      </ol>
      ${link
    ? `<a class="gs-btn" href="${link}" target="_blank" rel="noopener">Open the game form</a>
         <p class="gs-note">Opens in a new tab. Games show on the team schedule within about half an hour.</p>`
    : '<p class="gs-note">The game form isn’t linked yet. Please check back soon.</p>'}
    </div>`;
}
