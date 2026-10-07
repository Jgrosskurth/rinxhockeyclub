// 720px WebP copies of the team photos: the lead photo sits beside the copy,
// the other two below it.
const TEAM_PHOTOS = [
  { src: '/images/r1-720.webp', alt: 'Rinx goalie in full gear stepping onto the ice' },
  { src: '/images/4D0F41DF-57C2-45F0-A459-86825254D41B-720.webp', alt: 'Rinx players gathered together on the ice' },
  { src: '/images/14u-720.webp', alt: 'Rinx team photo on the ice' },
];

const photo = ({ src, alt }, cls) => `<figure class="${cls}"><img src="${src}" alt="${alt}" width="720" height="480" loading="lazy" onerror="this.closest('figure').remove()"></figure>`;

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Prevent duplicate about blocks on the page
  const allAbouts = document.querySelectorAll('.about');
  if (allAbouts.length > 1 && block !== allAbouts[0]) {
    const section = block.closest('.section');
    if (section) section.remove();
    else block.remove();
    return;
  }

  const h3 = block.querySelector('h3');
  const paragraphs = [...block.querySelectorAll('p')];
  const uniqueTexts = new Set();
  const dedupedParagraphs = paragraphs.filter((p) => {
    const text = p.textContent.trim();
    if (uniqueTexts.has(text) || !text) return false;
    uniqueTexts.add(text);
    return true;
  });

  const [lead, ...rest] = TEAM_PHOTOS;
  block.innerHTML = `
    <div class="about-inner">
      <h2 class="section-title">About Our Team</h2>
      <div class="about-grid">
        <div class="about-media">
          ${photo(lead, 'about-lead')}
          <div class="about-more">${rest.map((p) => photo(p, 'about-thumb')).join('')}</div>
        </div>
        <div class="about-copy">
          ${h3 ? `<h3>${h3.innerHTML}</h3>` : ''}
          ${dedupedParagraphs.map((p) => `<p>${p.innerHTML}</p>`).join('')}
        </div>
      </div>
    </div>`;
}
