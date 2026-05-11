export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const cells = [...row.children];
    return {
      tag: cells[0]?.textContent.trim(),
      title: cells[1]?.textContent.trim(),
      body: cells[2]?.textContent.trim(),
      date: cells[3]?.textContent.trim(),
    };
  });

  block.innerHTML = `
    <div class="news-list-grid">
      ${items.map((item) => `
        <div class="news-list-card">
          <div class="news-list-meta">
            <span class="news-tag">${item.tag || 'News'}</span>
            <span class="news-list-date">${item.date}</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </div>`).join('')}
    </div>
  `;
}
