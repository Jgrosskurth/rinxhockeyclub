const FALLBACK_SPONSORS = [
  {
    name: 'Sponsor', img: '/images/C5C5C820-D330-47DF-9084-222C832B51BC.png', phone: '', link: '',
  },
  {
    name: 'Sponsor', img: '/images/IMG_4278.jpg', phone: '', link: '',
  },
  {
    name: 'Sponsor', img: '/images/IMG_4390.jpg', phone: '', link: '',
  },
  {
    name: 'Sponsor', img: '/images/wiz.png', phone: '', link: '',
  },
];

export default function decorate(block) {
  const rows = [...block.children];
  let sponsors = rows.map((r) => {
    const cells = [...r.children];
    const imgEl = cells[0]?.querySelector('img');
    let imgSrc = imgEl?.src || cells[0]?.textContent?.trim() || '';
    if (imgSrc.includes('about:error') || imgSrc.includes('about:blank')) imgSrc = '';
    return {
      img: imgSrc,
      name: cells[1]?.textContent?.trim() || '',
      phone: cells[2]?.textContent?.trim() || '',
      link: cells[3]?.querySelector('a')?.href || cells[3]?.textContent?.trim() || '',
    };
  }).filter((s) => s.name || s.img);

  if (!sponsors.length) sponsors = FALLBACK_SPONSORS;

  block.innerHTML = `
    <div class="sp-grid">
      ${sponsors.map((s) => `
        <div class="sp-card">
          <div class="sp-badge">Sponsor</div>
          ${s.img ? `<div class="sp-card-logo"><img src="${s.img}" alt="${s.name}" onerror="this.style.display='none'"></div>` : ''}
          <div class="sp-card-info">
            ${s.name ? `<h3 class="sp-card-name">${s.name}</h3>` : ''}
            ${s.phone ? `<p class="sp-card-phone">${s.phone}</p>` : ''}
            ${s.link ? `<a href="${s.link}" target="_blank" class="sp-card-cta">Visit Site &rarr;</a>` : ''}
          </div>
        </div>
      `).join('')}
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
    const formData = new FormData(e.target);
    const subject = `Sponsorship Inquiry from ${formData.get('name') || 'Website'}`;
    const body = `Name: ${formData.get('name')}\nCompany: ${formData.get('company')}\nEmail: ${formData.get('email')}\nPhone: ${formData.get('phone')}\nMessage: ${formData.get('message')}`;
    window.open(`mailto:info@therinx.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
    e.target.style.display = 'none';
    block.querySelector('#sp-success').style.display = 'block';
  });
}
