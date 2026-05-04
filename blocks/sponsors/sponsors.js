export default function decorate(block) {
  block.innerHTML = `
    <div class="sponsor-tiers">
      <div class="sp-tier gold">
        <div class="sp-tier-label">Gold Sponsor</div>
        <div class="sp-price">$1,000+</div>
        <ul class="sp-benefits">
          <li>Large logo on team jerseys</li><li>Banner at all home games</li>
          <li>Website logo placement</li><li>Social media shoutouts</li><li>4 season passes</li>
        </ul>
      </div>
      <div class="sp-tier silver">
        <div class="sp-tier-label">Silver Sponsor</div>
        <div class="sp-price">$500</div>
        <ul class="sp-benefits">
          <li>Logo on warm-up jerseys</li><li>Website listing</li>
          <li>Social media mentions</li><li>2 season passes</li>
        </ul>
      </div>
      <div class="sp-tier bronze">
        <div class="sp-tier-label">Bronze Sponsor</div>
        <div class="sp-price">$250</div>
        <ul class="sp-benefits">
          <li>Name in game programs</li><li>Website listing</li><li>Social media mention</li>
        </ul>
      </div>
    </div>

    <div class="sponsor-form-wrap">
      <h3>Become a Sponsor</h3>
      <p>Fill out the form below and we&apos;ll reach out within 48 hours.</p>
      <div class="form-row">
        <div class="form-group"><label>Business Name *</label><input type="text" id="s-biz" placeholder="Your company name"></div>
        <div class="form-group"><label>Contact Name *</label><input type="text" id="s-contact" placeholder="Your name"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Email *</label><input type="email" id="s-email" placeholder="email@example.com"></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="s-phone" placeholder="(631) 000-0000"></div>
      </div>
      <div class="form-group">
        <label>Sponsorship Level *</label>
        <select id="s-tier">
          <option value="">Select a tier...</option>
          <option>Gold Sponsor ($1,000+)</option>
          <option>Silver Sponsor ($500)</option>
          <option>Bronze Sponsor ($250)</option>
          <option>Custom Amount</option>
        </select>
      </div>
      <div class="form-group"><label>Comments</label><textarea id="s-notes" placeholder="Tell us about your business..."></textarea></div>
      <button class="btn btn-primary" id="sp-submit">Submit Sponsorship Request</button>
      <div class="form-success" id="sp-ok">✅ Thank you! Your sponsorship request has been submitted. We&apos;ll be in touch within 48 hours.</div>
    </div>
  `;

  block.querySelector('#sp-submit').addEventListener('click', () => {
    const biz = block.querySelector('#s-biz').value.trim();
    const contact = block.querySelector('#s-contact').value.trim();
    const email = block.querySelector('#s-email').value.trim();
    const tier = block.querySelector('#s-tier').value;
    if (!biz || !contact || !email || !tier) { alert('Please fill in all required fields.'); return; }
    block.querySelector('#sp-ok').style.display = 'block';
    ['#s-biz', '#s-contact', '#s-email', '#s-phone', '#s-notes'].forEach((id) => { block.querySelector(id).value = ''; });
    block.querySelector('#s-tier').selectedIndex = 0;
  });
}
