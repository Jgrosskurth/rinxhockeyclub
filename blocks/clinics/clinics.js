const CLINICS = [
  {
    day: 'Monday',
    title: 'Skills Clinic',
    time: '5:00 PM – 6:30 PM',
    location: 'The Rinx, Hauppauge, NY',
    instructor: 'Rinx Staff',
    frequency: 'Every Monday (9/14/26 – June 2027)',
    badge: 'Open',
  },
  {
    day: 'Friday',
    title: 'Skills & Drills',
    time: '5:00 PM – 6:00 PM',
    location: 'The Rinx, Hauppauge, NY',
    instructor: 'Rinx Staff',
    frequency: 'Every Friday',
    badge: 'Open',
  },
  {
    day: 'Saturday',
    title: 'Morning Power Skate & Shoot',
    time: '7:20 AM – 8:20 AM',
    location: 'The Rinx, Hauppauge, NY',
    instructor: "Dan O'Donoghue",
    frequency: 'Every Saturday',
    badge: 'Invite Only',
  },
];

export default function decorate(block) {
  block.innerHTML = `
    <div class="clinics-grid">
      ${CLINICS.map((s) => {
    const badgeLower = s.badge.toLowerCase();
    let badgeClass = '';
    if (badgeLower.includes('open')) badgeClass = 'clinic-badge-open';
    else if (badgeLower.includes('invite')) badgeClass = 'clinic-badge-invite';
    return `
        <div class="clinic-card">
          ${s.badge ? `<div class="clinic-badge ${badgeClass}">${s.badge}</div>` : ''}
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
        </div>`;
  }).join('')}
    </div>

    <div class="private-section">
      <h2 class="section-title">Private Sessions</h2>
      <div class="private-grid">
        <div class="private-info">
          <span class="private-badge">By Appointment</span>
          <h3>Private Sessions Available</h3>
          <p>One-on-one or small-group sessions tailored to your child's skill level. Pricing confirmed upon request.</p>
          <ul class="private-list">
            <li>Skating fundamentals &amp; edge work</li>
            <li>Shooting &amp; stick handling</li>
            <li>Goalie-specific training</li>
          </ul>
          <p class="private-detail"><strong>Location:</strong> The Rinx &bull; Hauppauge, NY</p>
          <p class="private-detail"><strong>Pricing:</strong> Confirmed upon request</p>
        </div>

        <div class="private-form">
          <h3>Request a Private Session</h3>
          <p>Complete the form below and we'll follow up within 48 hours.</p>
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
              <label class="skill-tile"><input type="radio" name="ps-skill" value="Skating"><span>Skating</span></label>
              <label class="skill-tile"><input type="radio" name="ps-skill" value="Shooting"><span>Shooting &amp; Stickhandling</span></label>
              <label class="skill-tile"><input type="radio" name="ps-skill" value="Goalie"><span>Goalie</span></label>
            </div>
          </div>
          <div class="form-group"><label>Additional Notes</label><textarea id="ps-notes" placeholder="Availability preferences, goals, questions..."></textarea></div>
          <button class="btn btn-primary" id="ps-submit">Request Private Session</button>
          <div class="form-success" id="ps-ok">Request submitted! We'll confirm availability and pricing within 48 hours.</div>
        </div>
      </div>
    </div>
  `;

  // Remove DA default content that duplicates what's in the block
  const section = block.closest('.section');
  if (section) {
    section.querySelectorAll(':scope > h2, :scope > p, :scope > ul').forEach((el) => el.remove());
  }

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
