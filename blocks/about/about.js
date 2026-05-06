const TEAM_PHOTOS = [
  '/images/r1.JPG',
  '/images/4D0F41DF-57C2-45F0-A459-86825254D41B.JPG',
  '/images/14u.jpg',
];

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

  block.innerHTML = `
    <h2 class="section-title">About Our Team</h2>
    <div class="about-card">
      <div class="about-photos">
        ${TEAM_PHOTOS.map((src) => `<img src="${src}" alt="Rinx Hockey Club" class="about-photo" onerror="this.style.display='none'">`).join('')}
      </div>
      ${h3 ? `<h3 class="about-heading">${h3.innerHTML}</h3>` : ''}
      <div class="about-body">
        ${dedupedParagraphs.map((p) => `<p>${p.innerHTML}</p>`).join('')}
      </div>
    </div>
  `;
}
