/**
 * Ask Edge Delivery's image service for an authored image (./media_*.png etc.)
 * at the size it is actually shown, as WebP. Blocks that rebuild their markup
 * from an authored <img> otherwise reuse its default 750px rendition, even for
 * a 60px logo. Other URLs (repo files, third-party CDNs) are returned as-is.
 * @param {string} src image URL, absolute or relative
 * @param {number} width rendition width in CSS pixels x ~2 for high-DPI screens
 */
// eslint-disable-next-line import/prefer-default-export
export function optimizedMediaUrl(src, width) {
  if (!src) return src;
  try {
    const url = new URL(src, window.location.href);
    if (url.origin !== window.location.origin || !/\/media_[0-9a-f]+\.\w+$/.test(url.pathname)) return src;
    url.search = '';
    url.searchParams.set('width', width);
    url.searchParams.set('format', 'webply');
    url.searchParams.set('optimize', 'medium');
    return url.href;
  } catch {
    return src;
  }
}
