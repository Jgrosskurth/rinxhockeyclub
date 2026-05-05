export default function decorate(block) {
  const row = block.children[0];
  const cell = row?.children[0];
  if (!cell) return;

  const img = cell.querySelector('img');
  const paragraphs = [...cell.querySelectorAll('p')];

  block.innerHTML = `
    <h2 class="section-title">About Our Team</h2>
    <div class="about-card">
      ${img ? `<img src="${img.src}" alt="${img.alt || ''}" class="about-img" onerror="this.style.display='none'">` : ''}
      <div class="about-body">
        ${paragraphs.map((p) => `<p>${p.innerHTML}</p>`).join('')}
      </div>
    </div>
  `;
}
