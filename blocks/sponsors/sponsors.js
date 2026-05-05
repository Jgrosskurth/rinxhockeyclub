export default function decorate(block) {
  const BASE = 'https://raw.githubusercontent.com/Jgrosskurth/rinxhockeyclub/main/images/';
  const sponsors = [
    'C5C5C820-D330-47DF-9084-222C832B51BC.png',
    'IMG_4278.jpg',
    'IMG_4390.jpg',
    'wiz.png',
  ];

  block.innerHTML = `
    <div class="sp-header">
      <h1 class="sp-title">Our Sponsors</h1>
      <p class="sp-subtitle">Thank you to our proud 2026&ndash;2027 season sponsors for supporting Rinx Hockey Club 10U Squirts.</p>
    </div>

    <div class="sp-logos">
      ${sponsors.map((img) => `
        <div class="sp-card">
          <img src="${BASE}${img}" alt="Sponsor" onerror="this.closest('.sp-card').style.display='none'">
        </div>
      `).join('')}
    </div>

    <div class="sp-form-section">
      <h2 class="sp-form-title">Interested in Sponsoring?</h2>
      <p class="sp-form-desc">Join our growing family of sponsors and support youth hockey on Long Island. Contact us below and we'll be in touch with sponsorship details.</p>
      <form class="sp-form" id="sp-form">
        <div class="sp-form-row">
          <div class="sp-field">
            <label>Name</label>
            <input type="text" name="name" placeholder="Your name" required>
          </div>
          <div class="sp-field">
            <label>Company</label>
            <input type="text" name="company" placeholder="Company name">
          </div>
        </div>
        <div class="sp-form-row">
          <div class="sp-field">
            <label>Email</label>
            <input type="email" name="email" placeholder="your@email.com" required>
          </div>
          <div class="sp-field">
            <label>Phone</label>
            <input type="tel" name="phone" placeholder="(555) 000-0000">
          </div>
        </div>
        <div class="sp-field">
          <label>Message</label>
          <textarea name="message" rows="4" placeholder="Tell us about your sponsorship interest..."></textarea>
        </div>
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
