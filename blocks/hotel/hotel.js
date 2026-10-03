/*
 * Hotel Block
 * Team hotel card for tournament pages. Authored as two-column label/value
 * rows (any order, all optional except Name):
 *   Image | (picture)
 *   Name | Hampton Inn Philadelphia/Willow Grove
 *   Address | 1500 Easton Rd, Willow Grove, PA 19090
 *   Phone | (215) 659-3535
 *   Website | (link)
 *   Check-in | 3:00 PM
 *   Check-out | 11:00 AM
 *   Amenities | Free hot breakfast, Free Wi-Fi, ...
 *   Rink | Hatfield Ice Arena, 350 County Line Rd, Colmar, PA 18915
 *   Drive | About 25 min (11.6 mi)
 *   Notes | Right off the Willow Grove exit of the PA Turnpike
 */

const AMENITY_ICONS = [
  { match: 'breakfast', icon: '🍳' },
  { match: 'wi-fi', icon: '📶' },
  { match: 'wifi', icon: '📶' },
  { match: 'parking', icon: '🅿️' },
  { match: 'fitness', icon: '🏋️' },
  { match: 'pool', icon: '🏊' },
  { match: 'pet', icon: '🐾' },
  { match: 'smok', icon: '🚭' },
];

function amenityIcon(text) {
  const lower = text.toLowerCase();
  return AMENITY_ICONS.find((a) => lower.includes(a.match))?.icon || '✔️';
}

function readConfig(block) {
  const cfg = {};
  [...block.children].forEach((row) => {
    const [label, value] = row.children;
    if (!label || !value) return;
    const key = label.textContent.trim().toLowerCase().replace(/[^a-z]/g, '');
    cfg[key] = {
      text: value.textContent.trim(),
      link: value.querySelector('a')?.href || '',
      picture: value.querySelector('picture'),
    };
  });
  return cfg;
}

const mapsDirections = (dest, origin) => `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}&destination=${encodeURIComponent(dest)}`;

export default function decorate(block) {
  const cfg = readConfig(block);
  const name = cfg.name?.text || 'Team Hotel';
  const address = cfg.address?.text || '';
  const phone = cfg.phone?.text || '';
  const website = cfg.website?.link || '';
  const rink = cfg.rink?.text || '';
  const place = [name, address].filter(Boolean).join(', ');
  const amenities = (cfg.amenities?.text || '').split(/[,;]/).map((a) => a.trim()).filter(Boolean);

  const facts = [
    cfg.checkin && { label: 'Check-in', value: cfg.checkin.text },
    cfg.checkout && { label: 'Check-out', value: cfg.checkout.text },
    cfg.drive && { label: 'To the Rink', value: cfg.drive.text },
  ].filter(Boolean);

  block.innerHTML = `
    <div class="hotel-card">
      <div class="hotel-hero">
        <div class="hotel-media"></div>
        <div class="hotel-hero-text">
          <span class="hotel-eyebrow">Team Hotel</span>
          <h3 class="hotel-name">${name}</h3>
          ${address ? `<p class="hotel-address">📍 ${address}</p>` : ''}
          <div class="hotel-actions">
            ${address ? `<a class="hotel-btn hotel-btn-primary" href="${mapsDirections(place)}" target="_blank" rel="noopener">Get Directions</a>` : ''}
            ${phone ? `<a class="hotel-btn" href="tel:${phone.replace(/[^\d+]/g, '')}">Call ${phone}</a>` : ''}
            ${website ? `<a class="hotel-btn" href="${website}" target="_blank" rel="noopener">Hotel Website</a>` : ''}
          </div>
        </div>
      </div>

      ${facts.length ? `<div class="hotel-facts">${facts.map((f) => `
        <div class="hotel-fact"><span class="hotel-fact-val">${f.value}</span><span class="hotel-fact-lbl">${f.label}</span></div>`).join('')}
      </div>` : ''}

      <div class="hotel-details">
        ${amenities.length ? `<div class="hotel-panel">
          <h4>Amenities</h4>
          <ul class="hotel-amenities">${amenities.map((a) => `<li><span aria-hidden="true">${amenityIcon(a)}</span>${a}</li>`).join('')}</ul>
        </div>` : ''}
        ${rink ? `<div class="hotel-panel">
          <h4>Getting to the Rink</h4>
          <p class="hotel-rink">${rink}</p>
          ${cfg.notes ? `<p class="hotel-notes">${cfg.notes.text}</p>` : ''}
          <a class="hotel-btn hotel-btn-primary" href="${mapsDirections(rink, address || place)}" target="_blank" rel="noopener">Directions: Hotel &rarr; Rink</a>
        </div>` : ''}
      </div>

    </div>
  `;

  // Hero media: the authored photo, else the map (else a hotel icon).
  const media = block.querySelector('.hotel-media');
  const map = address ? `<div class="hotel-map">
      <iframe title="Map of ${name}" src="https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>` : '';
  if (cfg.image?.picture) {
    media.append(cfg.image.picture);
    block.querySelector('.hotel-card').insertAdjacentHTML('beforeend', map);
  } else if (map) {
    media.innerHTML = map;
  } else {
    media.innerHTML = '<span class="hotel-media-icon" aria-hidden="true">🏨</span>';
  }
}
