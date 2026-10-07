const ELFSIGHT_SRC = 'https://elfsightcdn.com/platform.js';

// Load the Elfsight platform script once, on demand.
function loadElfsightPlatform() {
  if (document.querySelector(`script[src="${ELFSIGHT_SRC}"]`)) return;
  const script = document.createElement('script');
  script.src = ELFSIGHT_SRC;
  script.async = true;
  document.head.append(script);
}

// The feed renders inside its own shadow root and pins its "Free Instagram
// Feed Widget" link visible with inline !important styles, so remove the link
// instead, and keep removing it if the widget redraws it.
const BADGE = 'a[href*="elfsight.com"]';

function hideBadge(app) {
  let tries = 0;
  const watch = () => {
    const root = app.querySelector('.es-embed-root')?.shadowRoot;
    if (!root) {
      tries += 1;
      if (tries < 40) setTimeout(watch, 250);
      return;
    }
    const strip = () => root.querySelectorAll(BADGE).forEach((a) => a.remove());
    strip();
    new MutationObserver(strip).observe(root, { childList: true, subtree: true });
  };
  new MutationObserver((list, obs) => {
    if (!app.querySelector('.es-embed-root')) return;
    obs.disconnect();
    watch();
  }).observe(app, { childList: true, subtree: true });
}

/**
 * loads and decorates the instagram feed block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // The Elfsight app id can be authored anywhere in the block — as the full
  // "elfsight-app-<uuid>" class or just the uuid.
  const match = block.textContent.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  const appId = match ? match[0] : '';

  // Preserve an authored heading and handle link if present.
  const heading = block.querySelector('h1, h2, h3');
  const handleLink = [...block.querySelectorAll('a')]
    .find((a) => /instagram\.com/i.test(a.getAttribute('href') || ''));

  block.textContent = '';

  const title = document.createElement('h2');
  title.className = 'instagram-title';
  title.textContent = heading?.textContent?.trim() || 'Follow Us on Instagram';
  block.append(title);

  if (handleLink) {
    const handle = document.createElement('p');
    handle.className = 'instagram-handle';
    handleLink.target = '_blank';
    handleLink.rel = 'noopener';
    handle.append(handleLink);
    block.append(handle);
  }

  if (!appId) return;

  const app = document.createElement('div');
  app.className = `elfsight-app-${appId}`;
  app.setAttribute('data-elfsight-app-lazy', '');
  block.append(app);
  hideBadge(app);

  // Defer loading the third-party script until the feed scrolls into view,
  // keeping it off the critical path for LCP/PageSpeed.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        loadElfsightPlatform();
        obs.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(block);
  } else {
    loadElfsightPlatform();
  }
}
