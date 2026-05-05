export default function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('div');
  grid.className = 'cards-grid';

  rows.forEach((row, i) => {
    const card = document.createElement('div');
    card.className = 'cards-card';
    if (i === 0 && rows.length > 2) card.classList.add('cards-card-full');

    const cell = row.children[0];
    if (cell) card.innerHTML = cell.innerHTML;
    grid.appendChild(card);
  });

  block.replaceChildren(grid);
}
