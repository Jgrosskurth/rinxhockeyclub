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
  frame.src = url;
  frame.title = title || 'Embedded content';
  frame.loading = 'lazy';
  frame.setAttribute('allowfullscreen', '');
  frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');

  block.append(frame);
}
