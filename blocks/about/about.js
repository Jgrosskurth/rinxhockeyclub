export default function decorate(block) {
  // Prevent duplicate about blocks on the page
  const allAbouts = document.querySelectorAll('.about');
  if (allAbouts.length > 1 && block !== allAbouts[0]) {
    const section = block.closest('.section');
    if (section) section.remove();
    else block.remove();
    return;
  }

  const imgs = [...block.querySelectorAll('img')];
  const h3 = block.querySelector('h3');
  const cell = block.querySelector(':scope > div > div') || block;
  const paragraphs = [...cell.querySelectorAll(':scope p, :scope > div p')];
  const uniqueTexts = new Set();
  const dedupedParagraphs = paragraphs.filter((p) => {
    const text = p.textContent.trim();
    if (uniqueTexts.has(text) || !text) return false;
    uniqueTexts.add(text);
    return true;
  });

  let imageRow = '';
  if (imgs.length > 1) {
    imageRow = `<div class="about-photos">${imgs.map((img) => `<img src="${img.src}" alt="${img.alt || ''}" class="about-photo" onerror="this.style.display='none'">`).join('')}</div>`;
  } else if (imgs.length === 1) {
    imageRow = `<img src="${imgs[0].src}" alt="${imgs[0].alt || ''}" class="about-img" onerror="this.style.display='none'">`;
  }

  block.innerHTML = `
    <h2 class="section-title">About Our Team</h2>
    <div class="about-card">
      ${imageRow}
      ${h3 ? `<h3 class="about-heading">${h3.innerHTML}</h3>` : ''}
      <div class="about-body">
        ${dedupedParagraphs.map((p) => `<p>${p.innerHTML}</p>`).join('')}
      </div>
    </div>
  `;
}
