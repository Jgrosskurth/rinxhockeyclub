const FALLBACK_SPONSORS = [
  { name: 'Sponsor', img: '/images/C5C5C820-D330-47DF-9084-222C832B51BC.png', link: '' },
  { name: 'Sponsor', img: '/images/IMG_4278.jpg', link: '' },
  { name: 'Sponsor', img: '/images/IMG_4390.jpg', link: '' },
  { name: 'Sponsor', img: '/images/wiz.png', link: '' },
];

export default function decorate(block) {
  const rows = [...block.children];
  let sponsors = rows.map((r) => {
    const cells = [...r.children];
    const imgEl = cells[1]?.querySelector('img');
    let imgSrc = imgEl?.src || cells[1]?.textContent?.trim() || '';
    if (imgSrc.includes('about:error') || imgSrc.includes('about:blank')) imgSrc = '';
    return {
      name: cells[0]?.textContent?.trim() || '',
      img: imgSrc,
      link: cells[2]?.querySelector('a')?.href || cells[2]?.textContent?.trim() || '',
    };
  }).filter((s) => s.img);

  if (!sponsors.length) sponsors = FALLBACK_SPONSORS;

  const card = (s) => {
    const img = `<img src="${s.img}" alt="${s.name}" onerror="this.closest('.sp-card').style.display='none'">`;
    return s.link
      ? `<a class="sp-card" href="${s.link}" target="_blank" rel="noopener">${img}${s.name ? `<span class="sp-card-name">${s.name}</span>` : ''}</a>`
      : `<div class="sp-card">${img}${s.name ? `<span class="sp-card-name">${s.name}</span>` : ''}</div>`;
  };

  block.innerHTML = `
    <div class="sp-logos">
      ${sponsors.map(card).join('')}
    </div>

    <div class="sp-form-section">
      <h2 class="sp-form-title">Interested in Sponsoring?</h2>
      <p class="sp-form-desc">Join our growing family of sponsors and support youth hockey on Long Island. Contact us below and we'll be in touch with sponsorship details.</p>
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
        <p class="sp-success" id="sp-success" style="display:none">&#10003; Thanks! We'll be in touch soon.</p>
      </form>
    </div>
  `;

  block.querySelector('#sp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    e.target.style.display = 'none';
    block.querySelector('#sp-success').style.display = 'block';
  });
}
