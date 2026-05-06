const CLINICS = [
  {
    day: 'Monday',
    title: 'Evening Skills Clinic',
    time: '6:00 PM – 7:00 PM',
    location: 'The Rinx, Hauppauge, NY',
    instructor: 'Rinx Staff',
    frequency: 'Every Monday',
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

  `;
}
