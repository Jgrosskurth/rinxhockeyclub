export default function decorate(block) {
  // Prevent duplicate about blocks on the page
  const allAbouts = document.querySelectorAll('.about');
  if (allAbouts.length > 1 && block !== allAbouts[0]) {
    const section = block.closest('.section');
    if (section) section.remove();
    else block.remove();
    return;
  }

  const img = block.querySelector('img');
  const h3 = block.querySelector('h3');
  // Only get direct paragraph text, not nested
  const cell = block.querySelector(':scope > div > div') || block;
  const paragraphs = [...cell.querySelectorAll(':scope p, :scope > div p')];
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
      ${img ? `<img src="${img.src}" alt="${img.alt || ''}" class="about-img" onerror="this.style.display='none'">` : ''}
      ${h3 ? `<h3 class="about-heading">${h3.innerHTML}</h3>` : ''}
      <div class="about-body">
        ${dedupedParagraphs.map((p) => `<p>${p.innerHTML}</p>`).join('')}
      </div>
    </div>
  `;
}
