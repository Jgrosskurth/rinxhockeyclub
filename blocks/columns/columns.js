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
          <div class="coach-cards">
            ${coaches.map((c) => `
              <div class="coach-card">
                ${c.img
    ? `<img src="${c.img}" alt="${c.name}" class="coach-av coach-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : ''}
                <div class="coach-av"${c.img ? ' style="display:none"' : ''}>${c.initials}</div>
                <div class="coach-info">
                  <h4>${c.name}</h4>
                  <p>${c.role}</p>
                </div>
              </div>
            `).join('')}
          </div>
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

  // Add map banner inside the facility column
  const facilityCol = block.querySelector('.col-facility');
  if (facilityCol) {
    const mapBanner = document.createElement('div');
    mapBanner.className = 'columns-map-banner';
    mapBanner.innerHTML = `
      <a href="https://www.google.com/maps/search/The%20Rinx,%20660%20Terry%20Rd,%20Hauppauge,%20NY%2011788" target="_blank" class="map-link">
        <div class="map-icon">📍</div>
        <div class="map-text">
          <span class="map-title">Get Directions</span>
          <span class="map-cta">Open in Maps &rarr;</span>
        </div>
      </a>
    `;
    facilityCol.appendChild(mapBanner);
  }
}
