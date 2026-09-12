/**
 * Embed Block
 * Renders an external page in a responsive iframe.
 * Authors provide the URL as a link (or plain text) in the block.
 */

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // The URL can be authored as a link or as plain text.
  const link = block.querySelector('a');
  const url = (link?.getAttribute('href') || block.textContent).trim();

  // Preserve an authored title/caption if the author added a heading.
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const title = heading?.textContent?.trim();

  block.textContent = '';

  if (!url) return;

  const frame = document.createElement('iframe');
  frame.title = title || 'Embedded content';
  frame.loading = 'lazy';
  frame.setAttribute('allowfullscreen', '');
  frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');

  // Reserve the height inline (matching embed.css) so the space is claimed
  // during eager decoration, before the lazy block CSS loads — prevents CLS.
  frame.style.display = 'block';
  frame.style.width = '100%';
  frame.style.height = '80vh';
  frame.style.minHeight = '600px';

  // Defer loading the third-party document until the iframe scrolls into
  // view so it stays off the critical path and doesn't hurt page LCP.
  const load = () => { if (!frame.src) frame.src = url; };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        load();
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(frame);
  } else {
    load();
  }

  // On schedule pages, clip GameSheet's team header (logo, record, tabs) so
  // the game list starts at the top. The header can't be removed via a URL or
  // config param, so we offset the iframe up inside an overflow-hidden wrapper.
  // The offset is a fixed estimate (responsive in CSS) since we can't measure
  // inside the cross-origin frame.
  const isSchedule = window.location.pathname.includes('schedule');
  if (isSchedule) {
    const clip = document.createElement('div');
    clip.className = 'embed-clip';
    clip.append(frame);
    block.append(clip);
  } else {
    block.append(frame);
  }

  // On schedule pages, offer a "Print / Save as PDF" action. The browser
  // itself renders the live GameSheet iframe into the printout, so the export
  // always reflects the current schedule (our code never reads the frame).
  if (window.location.pathname.includes('schedule')) {
    const bar = document.createElement('div');
    bar.className = 'embed-actions';

    const printBtn = document.createElement('button');
    printBtn.type = 'button';
    printBtn.className = 'embed-print-btn';
    printBtn.textContent = '🖨 Print / Save as PDF';
    printBtn.addEventListener('click', () => {
      // Make sure the frame is loaded, then expand it so more of the schedule
      // lays out for the printout, print, and restore the on-screen height.
      load();
      const prev = frame.style.height;
      frame.style.height = '2400px';
      const restore = () => {
        frame.style.height = prev;
        window.removeEventListener('afterprint', restore);
      };
      window.addEventListener('afterprint', restore);
      // Give the layout a moment to reflow before opening the print dialog.
      setTimeout(() => window.print(), 300);
    });

    bar.append(printBtn);
    block.prepend(bar);
  }
}
