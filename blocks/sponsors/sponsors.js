export default function decorate(block) {
  // Read tiers from DA table rows, fall back to defaults
  const daRows = [...block.querySelectorAll('tr')].slice(1).filter(r => r.cells[0]?.innerText?.trim());
  const tiers = daRows.length
    ? daRows.map(r => ({
        label:    r.cells[0]?.innerText?.trim() || '',
        price:    r.cells[1]?.innerText?.trim() || '',
        cls:      (r.cells[0]?.innerText?.trim() || '').toLowerCase().split(' ')[0],
        benefits: [...r.cells].slice(2).map(c => c.innerText.trim()).filter(Boolean),
      })).filter(t => t.label)
    : [
        { label: 'Gold Sponsor',   price: '$1,000+', cls: 'gold',   benefits: ['Large logo on team jerseys', 'Banner at all home games', 'Website logo placement', 'Social media shoutouts'] },
        { label: 'Silver Sponsor', price: '$500',    cls: 'silver', benefits: ['Logo on warm-up jerseys', 'Website listing', 'Social media mentions'] },
        { label: 'Bronze Sponsor', price: '$250',    cls: 'bronze', benefits: ['Website listing', 'Social media mention'] },
      ];

  block.innerHTML = `
    <div class="sponsor-tiers">
      ${tiers.map(t => `
        <div class="sp-tier ${t.cls}">
          <div class="sp-tier-label">${t.label}</div>
          <div class="sp-price">${t.price}</div>
          <ul class="sp-benefits">
            ${t.benefits.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
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
          ${tiers.map(t => `<option>${t.label} (${t.price})</option>`).join('')}
          <option>Custom Amount</option>
        </select>
      </div>
      <div class="form-group"><label>Comments</label><textarea id="s-notes" placeholder="Tell us about your business..."></textarea></div>
      <button class="btn btn-primary" id="sp-submit">Submit Sponsorship Request</button>
      <div class="form-success" id="sp-ok">✅ Thank you! Your sponsorship request has been submitted. We&apos;ll be in touch within 48 hours.</div>
    </div>
  `;

  block.querySelector('#sp-submit').addEventListener('click', () => {
    const biz     = block.querySelector('#s-biz').value.trim();
    const contact = block.querySelector('#s-contact').value.trim();
    const email   = block.querySelector('#s-email').value.trim();
    const tier    = block.querySelector('#s-tier').value;
    if (!biz || !contact || !email || !tier) { alert('Please fill in all required fields.'); return; }
    block.querySelector('#sp-ok').style.display = 'block';
    ['#s-biz','#s-contact','#s-email','#s-phone','#s-notes'].forEach(id => { block.querySelector(id).value = ''; });
    block.querySelector('#s-tier').selectedIndex = 0;
  });
}
