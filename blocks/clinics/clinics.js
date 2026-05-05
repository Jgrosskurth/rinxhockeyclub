export default function decorate(block) {
  const rows = [...block.querySelectorAll('tr')].slice(1);

  let sessions;
  if (rows.length > 1) {
    sessions = rows.map(row => ({
      name:  row.cells[0]?.innerText?.trim() || '',
      day:   row.cells[1]?.innerText?.trim() || '',
      time:  row.cells[2]?.innerText?.trim() || '',
      ages:  row.cells[3]?.innerText?.trim() || '',
      price: row.cells[4]?.innerText?.trim() || '',
      spots: row.cells[5]?.innerText?.trim() || '',
    })).filter(s => s.name);
  } else {
    sessions = [
      { name: 'Power Skating Clinic', day: 'Saturdays', time: '8:00 AM – 9:00 AM', ages: '8–10U', price: '$25 / session', spots: '12 spots' },
      { name: 'Shooting & Stickhandling', day: 'Sundays', time: '9:00 AM – 10:00 AM', ages: '8–10U', price: '$25 / session', spots: '12 spots' },
      { name: 'Goalie Development', day: 'Saturdays', time: '9:00 AM – 10:00 AM', ages: 'All Ages', price: '$30 / session', spots: '4 spots' },
      { name: 'Full Skills Camp', day: 'Weekdays', time: '10:00 AM – 12:00 PM', ages: '8–12U', price: '$199 / week', spots: '16 spots' },
    ];
  }

  block.innerHTML = `
    <div class="page-banner"><h2>Player Development Clinics</h2><p>Open sessions at The Rinx &bull; 660 Terry Road, Hauppauge, NY</p></div>
    <div class="clinics-intro">
      <p>Our clinics are open to all skill levels and are designed to complement your regular team practices. Led by experienced coaches focused on individual skill development.</p>
    </div>
    <div class="clinics-grid">
      ${sessions.map(s => `<div class="clinic-card">
        <div class="clinic-icon">&#127944;</div>
        <h3>${s.name}</h3>
        <div class="clinic-details">
          <div class="cd-row"><span class="cd-lbl">Day</span><span class="cd-val">${s.day}</span></div>
          <div class="cd-row"><span class="cd-lbl">Time</span><span class="cd-val">${s.time}</span></div>
          <div class="cd-row"><span class="cd-lbl">Ages</span><span class="cd-val">${s.ages}</span></div>
          <div class="cd-row"><span class="cd-lbl">Price</span><span class="cd-val">${s.price}</span></div>
          ${s.spots ? `<div class="cd-row"><span class="cd-lbl">Availability</span><span class="cd-val">${s.spots}</span></div>` : ''}
        </div>
      </div>`).join('')}
    </div>
    <div class="private-form">
      <h3>Request a Private Session</h3>
      <p>Complete the form below and we&apos;ll follow up within 48 hours.</p>
      <div class="form-row">
        <div class="form-group"><label>Your Name *</label><input type="text" id="ps-name" placeholder="Parent / guardian name"></div>
        <div class="form-group"><label>Child&apos;s Name *</label><input type="text" id="ps-child" placeholder="Player&apos;s full name"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Email Address *</label><input type="email" id="ps-email" placeholder="email@example.com"></div>
        <div class="form-group"><label>Contact Phone *</label><input type="tel" id="ps-phone" placeholder="(631) 000-0000"></div>
      </div>
      <div class="form-group">
        <label>Skill Focus *</label>
        <div class="skill-tiles">
          <label class="skill-tile" id="st-skating"><input type="radio" name="ps-skill" value="Skating"><span>&#9968;</span>Skating</label>
          <label class="skill-tile" id="st-shooting"><input type="radio" name="ps-skill" value="Shooting"><span>&#127944;</span>Shooting &amp; Stickhandling</label>
          <label class="skill-tile" id="st-goalie"><input type="radio" name="ps-skill" value="Goalie"><span>&#127949;</span>Goalie</label>
        </div>
      </div>
      <div class="form-group"><label>Additional Notes</label><textarea id="ps-notes" placeholder="Availability preferences, goals, questions..."></textarea></div>
      <button class="btn btn-primary" id="ps-submit">Request Private Session</button>
      <div class="form-success" id="ps-ok" style="display:none">&#x2705; Request submitted! We&apos;ll confirm availability and pricing within 48 hours.</div>
    </div>
  `;

  block.querySelectorAll('.skill-tile').forEach(label => {
    label.addEventListener('click', () => {
      block.querySelectorAll('.skill-tile').forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
    });
  });

  block.querySelector('#ps-submit').addEventListener('click', () => {
    const name = block.querySelector('#ps-name').value.trim();
    const child = block.querySelector('#ps-child').value.trim();
    const email = block.querySelector('#ps-email').value.trim();
    const phone = block.querySelector('#ps-phone').value.trim();
    const skill = block.querySelector('input[name="ps-skill"]:checked');
    if (!name || !child || !email || !phone || !skill) { alert('Please fill in all required fields and select a skill focus.'); return; }
    block.querySelector('#ps-ok').style.display = 'block';
    ['#ps-name','#ps-child','#ps-email','#ps-phone','#ps-notes'].forEach(id => { block.querySelector(id).value = ''; });
    block.querySelectorAll('input[name="ps-skill"]').forEach(r => { r.checked = false; });
    block.querySelectorAll('.skill-tile').forEach(l => l.classList.remove('selected'));
  });
}
