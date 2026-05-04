export default function decorate(block) {
  block.innerHTML = `
    <div class="contact-grid">
      <div class="contact-info">
        <h3>Get In Touch</h3>
        <div class="c-item"><div class="c-icon">📍</div><div><h4>Location</h4><p>The Rinx<br>660 Terry Road<br>Hauppauge, NY 11788</p></div></div>
        <div class="c-item"><div class="c-icon">📞</div><div><h4>Phone</h4><p>(631) 232-3222</p></div></div>
        <div class="c-item"><div class="c-icon">✉️</div><div><h4>Email</h4><p>info@therinx.com<br>Hockey: AlisonC@therinx.com</p></div></div>
        <div class="c-item"><div class="c-icon">🏒</div><div><h4>Head Coach</h4><p>Dan O&apos;Donoghue</p></div></div>
        <div class="c-item"><div class="c-icon">🏒</div><div><h4>Assistant Coach</h4><p>Joe Capozzoli</p></div></div>
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
        <div class="form-success" id="c-ok">✅ Message sent! We&apos;ll get back to you as soon as possible.</div>
      </div>
    </div>
  `;

  block.querySelector('#c-submit').addEventListener('click', () => {
    const first = block.querySelector('#c-first').value.trim();
    const last = block.querySelector('#c-last').value.trim();
    const email = block.querySelector('#c-email').value.trim();
    const msg = block.querySelector('#c-msg').value.trim();
    if (!first || !last || !email || !msg) { alert('Please fill in all required fields.'); return; }
    block.querySelector('#c-ok').style.display = 'block';
    ['#c-first', '#c-last', '#c-email', '#c-msg'].forEach((id) => { block.querySelector(id).value = ''; });
  });
}
