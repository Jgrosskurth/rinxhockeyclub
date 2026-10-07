import { headshotAttrs, HEADSHOT_ONERROR } from '../../scripts/media.js';

const ICONS = {
  phone: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1Z" fill="currentColor"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor"/></svg>',
};

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }

      // Detect coaching staff column (paragraphs with pipe-delimited coach data)
      const h3 = col.querySelector('h3');
      const paragraphs = [...col.querySelectorAll('p')];
      const isCoachCol = h3
        && h3.textContent.toLowerCase().includes('coaching')
        && paragraphs.some((p) => p.textContent.includes('|'));

      if (isCoachCol) {
        col.classList.add('col-coaches');
        const coaches = paragraphs
          .filter((p) => p.textContent.includes('|'))
          .map((p) => {
            const parts = p.textContent.split('|');
            return {
              name: parts[0]?.trim(),
              initials: parts[1]?.trim(),
              role: parts[2]?.trim(),
              img: parts[3]?.trim() || '',
            };
          });

        col.innerHTML = `
          <h3>${h3.innerHTML}</h3>
          <ul class="coach-cards">
            ${coaches.map((c) => `
              <li class="coach-card">
                ${c.img
    ? `<img ${headshotAttrs(c.img)} alt="" class="coach-av coach-photo" width="72" height="72" loading="lazy" onerror="${HEADSHOT_ONERROR}">`
    : ''}
                <span class="coach-av" aria-hidden="true"${c.img ? ' style="display:none"' : ''}>${c.initials}</span>
                <h4>${c.name}</h4>
                <p>${c.role}</p>
              </li>
            `).join('')}
          </ul>
        `;
      }

      // Detect facility column
      const isFacilityCol = h3
        && h3.textContent.toLowerCase().includes('facility');
      if (isFacilityCol) {
        col.classList.add('col-facility');
      }
    });
  });

  // Facility: the authored "Phone: ..." line becomes a call button that sits
  // beside a directions button, in one action row under the description.
  const facilityCol = block.querySelector('.col-facility');
  if (facilityCol) {
    const actions = document.createElement('p');
    actions.className = 'facility-actions';
    facilityCol.querySelectorAll('p').forEach((p) => {
      const m = p.textContent.match(/\(\d{3}\)\s*\d{3}-\d{4}/);
      if (!m) return;
      const digits = m[0].replace(/\D/g, '');
      actions.insertAdjacentHTML('beforeend', `<a class="facility-btn facility-call" href="tel:+1${digits}" aria-label="Call The Rinx at ${m[0]}">${ICONS.phone}<span>${m[0]}</span></a>`);
      p.remove();
    });
    actions.insertAdjacentHTML('beforeend', `<a class="facility-btn facility-directions" href="https://www.google.com/maps/dir/?api=1&amp;destination=The%20Rinx%2C%20660%20Terry%20Rd%2C%20Hauppauge%2C%20NY%2011788" target="_blank" rel="noopener">${ICONS.pin}<span>Get Directions</span></a>`);
    facilityCol.append(actions);

    // Homepage: the facility sits under the club intro in the About block,
    // and the coaching staff runs as its own full-width row.
    const aboutCopy = document.querySelector('.about .about-copy');
    if (aboutCopy && block.querySelector('.col-coaches')) {
      aboutCopy.append(facilityCol);
      block.classList.add('columns-coaches-row');
    }
  }
}
