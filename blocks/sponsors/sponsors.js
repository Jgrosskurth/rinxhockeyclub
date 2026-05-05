export default function decorate(block) {
  // Read sponsor rows from DA table (AEM renders as div rows)
  // Row 0 = block name, Row 1 = column headers, Row 2+ = sponsor data
  const rows = [...block.children];
  const dataRows = rows.slice(2).filter((r) => r.children[1]?.innerText?.trim());

  // Fall back to hardcoded sponsors if DA table has no rows yet
  const BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/images/';
  const fallback = [
    { name: 'Sponsor', img: BASE + 'C5C5C820-D330-47DF-9084-222C832B51BC.png', link: '' },
    { name: 'Sponsor', img: BASE + 'IMG_4278.jpg', link: '' },
    { name: 'Sponsor', img: BASE + 'IMG_4390.jpg', link: '' },
    { name: 'Sponsor', img: BASE + 'wiz.png', link: '' },
  ];

  const sponsors = dataRows.length
    ? dataRows.map((r) => ({
        name: r.children[0]?.innerText?.trim() || '',
        img:  r.children[1]?.innerText?.trim() || '',
        link: r.children[2]?.innerText?.trim() || '',
      }))
    : fallback;

  // Any content after the table (extra DA blocks/paragraphs) — capture and re-append later
  const extra = block.parentElement
    ? [...block.parentElement.querySelectorAll(':scope > *:not(.sponsors-wrapper)')]
    : [];

  const card = (s) => {
    const img = `<img src="${s.img}" alt="${s.name}" onerror="this.closest('.sp-card').style.display='none'">`;
    return s.link
      ? `<a class="sp-card" href="${s.link}" target="_blank" rel="noopener">${img}${s.name ? `<span class="sp-card-name">${s.name}</span>` : ''}</a>`
      : `<div class="sp-card">${img}${s.name ? `<span class="sp-card-name">${s.name}</span>` : ''}</div>`;
  };

  block.innerHTML = `
    <div class="sp-header">
      <h1 class="sp-title">Our Sponsors</h1>
      <p class="sp-subtitle">Thank you to our proud 2026&ndash;2027 season sponsors for supporting Rinx Hockey Club 10U Squirts.</p>
    </div>

    <div class="sp-logos">
      ${sponsors.map(card).join('')}
    </div>

    <div class="sp-form-section">
      <h2 class="sp-form-title">Interested in Sponsoring?</h2>
      <p class="sp-form-desc">Join our growing family of sponsors and support youth hockey on Long Island. Contact us below and we&apos;ll be in touch with sponsorship details.</p>
      <form class="sp-form" id="sp-form">
        <div class="sp-form-row">
          <div class="sp-field"><label>Name</label><input type="text" name="name" placeholder="Your name" required></div>
          <div class="sp-field"><label>Company</label><input type="text" name="company" placeholder="Company name"></div>
        </div>
        <div class="sp-form-row">
          <div class="sp-field"><label>Email</label><input type="email" name="email" placeholder="your@email.com" required></div>
          <div class="sp-field"><label>Phone</label><input type="tel" name="phone" placeholder="(555) 000-0000"></div>
        </div>
        <div class="sp-field"><label>Message</label><textarea name="message" rows="4" placeholder="Tell us about your sponsorship interest..."></textarea></div>
        <button type="submit" class="sp-submit">Send Inquiry</button>
        <p class="sp-success" id="sp-success" style="display:none">&#10003; Thanks! We&apos;ll be in touch soon.</p>
      </form>
    </div>
  `;

  block.querySelector('#sp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.style.display = 'none';
    block.querySelector('#sp-success').style.display = 'block';
  });
}
