import { headshotAttrs, HEADSHOT_ONERROR } from '../../scripts/media.js';

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

  // Facility: tap-to-call phone number and a directions button
  const facilityCol = block.querySelector('.col-facility');
  if (facilityCol) {
    facilityCol.querySelectorAll('p').forEach((p) => {
      const m = p.textContent.match(/\(\d{3}\)\s*\d{3}-\d{4}/);
      if (!m || p.querySelector('a')) return;
      const digits = m[0].replace(/\D/g, '');
      p.classList.add('facility-phone');
      p.innerHTML = p.innerHTML.replace(m[0], `<a href="tel:+1${digits}">${m[0]}</a>`);
    });
    const directions = document.createElement('p');
    directions.className = 'facility-actions';
    directions.innerHTML = '<a class="facility-directions" href="https://www.google.com/maps/search/?api=1&amp;query=The%20Rinx%2C%20660%20Terry%20Rd%2C%20Hauppauge%2C%20NY%2011788" target="_blank" rel="noopener">Get Directions</a>';
    facilityCol.append(directions);

    // Homepage: the facility sits under the club intro in the About block,
    // and the coaching staff runs as its own full-width row.
    const aboutCopy = document.querySelector('.about .about-copy');
    if (aboutCopy && block.querySelector('.col-coaches')) {
      aboutCopy.append(facilityCol);
      block.classList.add('columns-coaches-row');
    }
  }
}
