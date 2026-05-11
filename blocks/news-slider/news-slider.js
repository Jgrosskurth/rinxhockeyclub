export default async function decorate(block) {
  const sourceRow = block.querySelector(':scope > div > div a[href]');
  let slides;

  if (sourceRow) {
    const href = sourceRow.getAttribute('href').replace(/\/$/, '');
    try {
      const resp = await fetch(`${href}.plain.html`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newsBlock = doc.querySelector('.news-slider');
      const rows = newsBlock ? [...newsBlock.children] : [];
      slides = rows.map((row) => {
        const cells = [...row.children];
        return {
          tag: cells[0]?.textContent.trim(),
          title: cells[1]?.textContent.trim(),
          body: cells[2]?.textContent.trim(),
          date: cells[3]?.textContent.trim(),
        };
      });
    } catch {
      slides = [];
    }
  } else {
    slides = [...block.children].map((row) => {
      const cells = [...row.children];
      return {
        tag: cells[0]?.textContent.trim(),
        title: cells[1]?.textContent.trim(),
        body: cells[2]?.textContent.trim(),
        date: cells[3]?.textContent.trim(),
      };
    });
  }

  const maxSlides = 5;
  const displaySlides = slides.slice(0, maxSlides);

  block.innerHTML = `
    <div class="slider-outer">
      <div class="slider-track" id="slider-track">
        ${displaySlides.map((s) => `
          <div class="slide-card">
            <div class="slide-body">
              <span class="news-tag">${s.tag || 'News'}</span>
              <h3>${s.title}</h3>
              <p>${s.body}</p>
              <span class="news-date">${s.date}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>
    <div class="slider-nav">
      <button class="snav-btn" id="prev">&#8592;</button>
      <button class="snav-btn" id="next">&#8594;</button>
    </div>
  `;

  let idx = 0;
  const track = block.querySelector('#slider-track');
  const visible = () => (window.innerWidth < 900 ? 1 : 3);
  const max = () => Math.max(0, displaySlides.length - visible());

  const goTo = (i) => {
    idx = i > max() ? 0 : i < 0 ? max() : i;
    const w = block.querySelector('.slide-card').offsetWidth + 24;
    track.style.transform = `translateX(-${idx * w}px)`;
  };

  block.querySelector('#prev').addEventListener('click', () => goTo(idx - 1));
  block.querySelector('#next').addEventListener('click', () => goTo(idx + 1));
  setInterval(() => goTo(idx + 1), 5000);
}
