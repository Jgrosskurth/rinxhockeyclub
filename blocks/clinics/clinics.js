export default function decorate(block) {
  const rows = [...block.children];
  const sessions = rows.map((row) => {
    const cells = [...row.children];
    return {
      day: cells[0]?.textContent?.trim() || '',
      title: cells[1]?.textContent?.trim() || '',
      time: cells[2]?.textContent?.trim() || '',
      location: cells[3]?.textContent?.trim() || 'The Rinx, Hauppauge, NY',
      instructor: cells[4]?.textContent?.trim() || 'Rinx Staff',
      frequency: cells[5]?.textContent?.trim() || '',
    };
  }).filter((s) => s.title);

  // Read page intro and private session content from sibling default content
  const section = block.closest('.section');
  const sectionH2 = section?.querySelector(':scope > h2');
  const sectionPs = [...(section?.querySelectorAll(':scope > p') || [])];
  const sectionUl = section?.querySelector(':scope > ul');

  // Private session content (below clinics block)
  const privateTitle = sectionH2?.textContent || 'Private Sessions';
  const privateDesc = sectionPs[0]?.textContent || 'One-on-one or small-group sessions tailored to your child\'s skill level.';
  const privateItems = sectionUl
    ? [...sectionUl.querySelectorAll('li')].map((li) => li.textContent)
    : ['Skating fundamentals & edge work', 'Shooting & stick handling', 'Goalie-specific training'];
  const privateLocation = sectionPs[1]?.textContent || 'The Rinx • Hauppauge, NY';
  const privatePricing = sectionPs[2]?.textContent || 'Confirmed upon request';
  const privateFormNote = sectionPs[3]?.textContent || 'Complete the form below and we\'ll follow up within 48 hours.';

  // Remove the default content since we'll render it styled
  if (sectionH2) sectionH2.remove();
  sectionPs.forEach((p) => p.remove());
  if (sectionUl) sectionUl.remove();

  block.innerHTML = `
    <div class="clinics-grid">
      ${sessions.map((s) => `
        <div class="clinic-card">
          <div class="clinic-header navy">
            <span class="clinic-day">${s.day}</span>
            <h3>${s.title}</h3>
            <span class="clinic-time">${s.time}</span>
          </div>
          <div class="clinic-body">
            <div class="clinic-detail"><span class="cd-lbl">Location</span><span class="cd-val">${s.location}</span></div>
            <div class="clinic-detail"><span class="cd-lbl">Instructor</span><span class="cd-val">${s.instructor}</span></div>
            ${s.frequency ? `<div class="clinic-detail"><span class="cd-lbl">Frequency</span><span class="cd-val">${s.frequency}</span></div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="private-section">
      <h2 class="section-title">${privateTitle}</h2>
      <div class="private-grid">
        <div class="private-info">
          <span class="private-badge">By Appointment</span>
          <h3>${privateTitle} Available</h3>
          <p>${privateDesc}</p>
          <ul class="private-list">
            ${privateItems.map((item) => `<li>${item}</li>`).join('')}
          </ul>
          <p class="private-detail">${privateLocation}</p>
          <p class="private-detail">${privatePricing}</p>
        </div>

        <div class="private-form">
          <h3>Request a Private Session</h3>
          <p>${privateFormNote}</p>
          <div class="form-row">
            <div class="form-group"><label>Your Name *</label><input type="text" id="ps-name" placeholder="Parent / guardian name"></div>
            <div class="form-group"><label>Child's Name *</label><input type="text" id="ps-child" placeholder="Player's full name"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Email Address *</label><input type="email" id="ps-email" placeholder="email@example.com"></div>
            <div class="form-group"><label>Contact Phone *</label><input type="tel" id="ps-phone" placeholder="(631) 000-0000"></div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Child's Age *</label>
              <select id="ps-age">
                <option value="">Select age...</option>
                <option>6</option><option>7</option><option>8</option><option>9</option>
                <option>10</option><option>11</option><option>12</option><option>13+</option>
              </select>
            </div>
            <div class="form-group">
              <label>Hockey Level *</label>
              <select id="ps-level">
                <option value="">Select level...</option>
                <option>Beginner (Learn to Skate)</option>
                <option>Mite / Squirt (8U&ndash;10U)</option>
                <option>Pee Wee (12U)</option>
                <option>Bantam (14U)</option>
                <option>Midget / High School</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Skill Focus *</label>
            <div class="skill-tiles">
              ${privateItems.map((item) => `<label class="skill-tile"><input type="radio" name="ps-skill" value="${item}"><span>${item}</span></label>`).join('')}
            </div>
          </div>
          <div class="form-group"><label>Additional Notes</label><textarea id="ps-notes" placeholder="Availability preferences, goals, questions..."></textarea></div>
          <button class="btn btn-primary" id="ps-submit">Request Private Session</button>
          <div class="form-success" id="ps-ok">Request submitted! We'll confirm availability and pricing within 48 hours.</div>
        </div>
      </div>
    </div>
  `;

  block.querySelectorAll('.skill-tile input').forEach((radio) => {
    radio.addEventListener('change', () => {
      block.querySelectorAll('.skill-tile').forEach((t) => t.classList.remove('selected'));
      radio.closest('.skill-tile').classList.add('selected');
    });
  });

  block.querySelector('#ps-submit').addEventListener('click', () => {
    const name = block.querySelector('#ps-name').value.trim();
    const child = block.querySelector('#ps-child').value.trim();
    const email = block.querySelector('#ps-email').value.trim();
    const phone = block.querySelector('#ps-phone').value.trim();
    const age = block.querySelector('#ps-age').value;
    const level = block.querySelector('#ps-level').value;
    const skill = block.querySelector('input[name="ps-skill"]:checked');
    if (!name || !child || !email || !phone || !age || !level || !skill) {
      // eslint-disable-next-line no-alert
      alert('Please fill in all required fields.');
      return;
    }
    const subject = `Private Session Request - ${child}`;
    const body = `Parent: ${name}\nChild: ${child}\nEmail: ${email}\nPhone: ${phone}\nAge: ${age}\nLevel: ${level}\nSkill Focus: ${skill.value}\nNotes: ${block.querySelector('#ps-notes').value}`;
    window.open(`mailto:info@therinx.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
    block.querySelector('#ps-ok').style.display = 'block';
    ['#ps-name', '#ps-child', '#ps-email', '#ps-phone', '#ps-notes'].forEach((id) => { block.querySelector(id).value = ''; });
    ['#ps-age', '#ps-level'].forEach((id) => { block.querySelector(id).selectedIndex = 0; });
    block.querySelectorAll('input[name="ps-skill"]').forEach((r) => { r.checked = false; });
    block.querySelectorAll('.skill-tile').forEach((t) => t.classList.remove('selected'));
  });
}
