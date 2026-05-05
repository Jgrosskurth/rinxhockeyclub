export default function decorate(block) {
  const imgs = block.querySelectorAll('img');
  const h3 = block.querySelector('h3');
  const paragraphs = [...block.querySelectorAll('p')];

  // Use only the first image found
  const img = imgs[0];
  const imgSrc = img?.src || '';
  const imgAlt = img?.alt || '';
  const heading = h3?.innerHTML || '';

  block.innerHTML = `
    <h2 class="section-title">About Our Team</h2>
    <div class="about-card">
      ${imgSrc ? `<img src="${imgSrc}" alt="${imgAlt}" class="about-img" onerror="this.style.display='none'">` : ''}
      ${heading ? `<h3 class="about-heading">${heading}</h3>` : ''}
      <div class="about-body">
        ${paragraphs.map((p) => `<p>${p.innerHTML}</p>`).join('')}
      </div>
    </div>
  `;
}
