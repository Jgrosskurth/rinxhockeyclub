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
  const hasMore = slides.length > maxSlides;
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
      <div class="sdots" id="sdots"></div>
      <button class="snav-btn" id="next">&#8594;</button>
    </div>
    ${hasMore ? '<p class="news-view-all"><a href="/news">View All News &rarr;</a></p>' : ''}
  `;

  let idx = 0;
  const track = block.querySelector('#slider-track');
  const dots = block.querySelector('#sdots');
  const visible = () => (window.innerWidth < 900 ? 1 : 3);
  const max = () => Math.max(0, slides.length - visible());

  const goTo = (i) => {
    idx = Math.max(0, Math.min(i, max()));
    const w = block.querySelector('.slide-card').offsetWidth + 24;
    track.style.transform = `translateX(-${idx * w}px)`;
    dots.querySelectorAll('.sdot').forEach((d, j) => d.classList.toggle('on', j === idx));
  };

  const buildDots = () => {
    dots.innerHTML = '';
    for (let i = 0; i <= max(); i += 1) {
      const d = document.createElement('button');
      d.className = `sdot${i === 0 ? ' on' : ''}`;
      d.addEventListener('click', () => goTo(i));
      dots.appendChild(d);
    }
  };

  block.querySelector('#prev').addEventListener('click', () => goTo(idx - 1));
  block.querySelector('#next').addEventListener('click', () => goTo(idx + 1));
  buildDots();
  setInterval(() => goTo(idx + 1 > max() ? 0 : idx + 1), 5000);
}
