export default function decorate(block) {
  const rows = [...block.querySelectorAll('tr')].slice(1);

  // Build info map from DA table
  const info = {};
  rows.forEach(row => {
    const key = row.cells[0]?.innerText?.trim().toLowerCase().replace(/[^a-z0-9]/g,'') || '';
    const val = row.cells[1]?.innerText?.trim() || '';
    if (key && val) info[key] = val;
  });

  const rink = info.rink || 'The Rinx';
  const address = info.address || '660 Terry Road, Hauppauge, NY 11788';
  const phone = info.phone || '(631) 232-3222';
  const headCoach = info.headcoach || "Dan O'Donoghue";
  const assistantCoach = info.assistantcoach || 'Joe Capozzoli';
  const email = info.email || '';

  block.innerHTML = `
    <div class="page-banner"><h2>Contact Us</h2><p>Get in touch with the Rinx 10U Squirts</p></div>
    <div class="contact-grid">
      <div class="contact-info">
        <div class="contact-card">
          <h3>&#127968; Our Rink</h3>
          <p><strong>${rink}</strong></p>
          <p>${address}</p>
          <p>&#128222; <a href="tel:${phone.replace(/[^0-9]/g,'')}">${phone}</a></p>
          ${email ? `<p>&#128231; <a href="mailto:${email}">${email}</a></p>` : ''}
        </div>
        <div class="contact-card">
          <h3>&#127944; Coaching Staff</h3>
          <div class="coach-card" style="margin-bottom:12px">
            <div class="coach-av">DO</div>
            <div class="coach-info"><h4>${headCoach}</h4><p>Head Coach &bull; 10U Squirts</p></div>
          </div>
          <div class="coach-card">
            <div class="coach-av">JC</div>
            <div class="coach-info"><h4>${assistantCoach}</h4><p>Assistant Coach &bull; 10U Squirts</p></div>
          </div>
        </div>
      </div>
      <div class="contact-form-wrap">
        <h3>Send Us a Message</h3>
        <div class="form-row">
          <div class="form-group"><label>Name *</label><input type="text" id="cf-name" placeholder="Your name"></div>
          <div class="form-group"><label>Email *</label><input type="email" id="cf-email" placeholder="email@example.com"></div>
        </div>
        <div class="form-group"><label>Phone</label><input type="tel" id="cf-phone" placeholder="(631) 000-0000"></div>
        <div class="form-group"><label>Subject *</label>
          <select id="cf-subject">
            <option value="">Select...</option>
            <option>General Inquiry</option>
            <option>Sponsorship</option>
            <option>Clinics / Private Sessions</option>
            <option>Roster / Tryouts</option>
            <option>Other</option>
          </select>
        </div>
        <div class="form-group"><label>Message *</label><textarea id="cf-msg" placeholder="Your message..."></textarea></div>
        <button class="btn btn-primary" id="cf-submit">Send Message</button>
        <div class="form-success" id="cf-ok" style="display:none">&#x2705; Message sent! We&apos;ll get back to you within 48 hours.</div>
      </div>
    </div>
  `;

  block.querySelector('#cf-submit').addEventListener('click', () => {
    const name = block.querySelector('#cf-name').value.trim();
    const email = block.querySelector('#cf-email').value.trim();
    const subject = block.querySelector('#cf-subject').value;
    const msg = block.querySelector('#cf-msg').value.trim();
    if (!name || !email || !subject || !msg) { alert('Please fill in all required fields.'); return; }
    block.querySelector('#cf-ok').style.display = 'block';
    ['#cf-name','#cf-email','#cf-phone','#cf-msg'].forEach(id => { block.querySelector(id).value = ''; });
    block.querySelector('#cf-subject').selectedIndex = 0;
  });
}
