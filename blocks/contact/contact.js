export default function decorate(block) {
  const info = {};

  // Handle both block table format (rows with cells) and flat paragraph format from DA
  const rows = [...block.children];
  const firstRow = rows[0];
  const hasCells = firstRow && firstRow.children.length >= 2
    && firstRow.tagName === 'DIV' && firstRow.children[0].tagName === 'DIV';

  if (hasCells) {
    rows.forEach((row) => {
      const cells = [...row.children];
      const key = cells[0]?.textContent?.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      const val = cells[1]?.textContent?.trim() || '';
      if (key && val) info[key] = val;
    });
  } else {
    // Flat paragraph format: alternating label/value <p> tags
    const paragraphs = [...block.querySelectorAll('p')];
    const pairs = paragraphs.filter((p) => {
      const text = p.textContent.trim().toLowerCase();
      return text !== 'get in touch with rinx hockey club';
    });
    for (let i = 0; i < pairs.length - 1; i += 2) {
      const key = pairs[i].textContent.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const val = pairs[i + 1].textContent.trim();
      if (key && val) info[key] = val;
    }
  }

  // Extract heading and subtitle if present
  const h1 = block.querySelector('h1');
  const heading = h1 ? h1.textContent.trim() : 'Contact Us';
  const subtitleEl = block.querySelector('p');
  const subtitle = subtitleEl ? subtitleEl.textContent.trim() : '';

  const loc = info.location || 'The Rinx, 660 Terry Road, Hauppauge, NY 11788';
  const phone = info.phone || '(631) 232-3222';
  const email = info.email || 'info@therinx.com';
  const hockeyEmail = info.hockeyemail || '';
  const headCoach = info.headcoach || '';
  const assistantCoach = info.assistantcoach || '';

  // Build contact items
  let contactItems = `
    <div class="c-item"><div class="c-icon">📍</div><div><h4>Location</h4><p>${loc}</p></div></div>
    <div class="c-item"><div class="c-icon">📞</div><div><h4>Phone</h4><p>${phone}</p></div></div>
    <div class="c-item"><div class="c-icon">✉️</div><div><h4>Email</h4><p>${email}</p></div></div>
  `;
  if (hockeyEmail) {
    contactItems += `<div class="c-item"><div class="c-icon">🏒</div><div><h4>Hockey Email</h4><p>${hockeyEmail}</p></div></div>`;
  }
  if (headCoach) {
    contactItems += `<div class="c-item"><div class="c-icon">👤</div><div><h4>Head Coach</h4><p>${headCoach}</p></div></div>`;
  }
  if (assistantCoach) {
    contactItems += `<div class="c-item"><div class="c-icon">👤</div><div><h4>Assistant Coach</h4><p>${assistantCoach}</p></div></div>`;
  }

  block.innerHTML = `
    <div class="contact-header">
      <h1>${heading}</h1>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>
    <div class="contact-grid">
      <div class="contact-info">
        <h3>Get In Touch</h3>
        ${contactItems}
      </div>

      <div class="contact-form">
        <h3>Send Us a Message</h3>
        <div class="form-row">
          <div class="form-group"><label>First Name *</label><input type="text" id="c-first" placeholder="First name"></div>
          <div class="form-group"><label>Last Name *</label><input type="text" id="c-last" placeholder="Last name"></div>
        </div>
        <div class="form-group"><label>Email *</label><input type="email" id="c-email" placeholder="your@email.com"></div>
        <div class="form-group">
          <label>Subject</label>
          <select id="c-subject">
            <option>General Inquiry</option><option>Schedule Question</option>
            <option>Roster / Tryout Info</option><option>Sponsorship</option>
            <option>Gear / Shop</option><option>Other</option>
          </select>
        </div>
        <div class="form-group"><label>Message *</label><textarea id="c-msg" placeholder="How can we help you?"></textarea></div>
        <button class="btn btn-primary" id="c-submit">Send Message</button>
        <div class="form-success" id="c-ok">Message sent! We'll get back to you as soon as possible.</div>
      </div>
    </div>
  `;

  block.querySelector('#c-submit').addEventListener('click', () => {
    const first = block.querySelector('#c-first').value.trim();
    const last = block.querySelector('#c-last').value.trim();
    const cemail = block.querySelector('#c-email').value.trim();
    const subj = block.querySelector('#c-subject').value;
    const msg = block.querySelector('#c-msg').value.trim();
    if (!first || !last || !cemail || !msg) {
      // eslint-disable-next-line no-alert
      alert('Please fill in all required fields.');
      return;
    }
    const subject = `${subj} - ${first} ${last}`;
    const body = `From: ${first} ${last}\nEmail: ${cemail}\nSubject: ${subj}\n\n${msg}`;
    window.open(`mailto:info@therinx.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
    block.querySelector('#c-ok').style.display = 'block';
    ['#c-first', '#c-last', '#c-email', '#c-msg'].forEach((id) => { block.querySelector(id).value = ''; });
  });
}
