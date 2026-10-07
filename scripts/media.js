/**
 * Ask Edge Delivery's image service for an authored image (./media_*.png etc.)
 * at the size it is actually shown, as WebP. Blocks that rebuild their markup
 * from an authored <img> otherwise reuse its default 750px rendition, even for
 * a 60px logo. Other URLs (repo files, third-party CDNs) are returned as-is.
 * @param {string} src image URL, absolute or relative
 * @param {number} width rendition width in CSS pixels x ~2 for high-DPI screens
 */
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

/**
 * Repo headshots in /images/headshots have 160px WebP copies (shown at
 * 64-72px). Returns the WebP path plus a data-orig attribute so
 * HEADSHOT_ONERROR can fall back to the original, then to initials.
 * @param {string} src e.g. "/images/headshots/joecap.png"
 */
export function headshotAttrs(src) {
  if (!/^\/images\/headshots\/[^/]+\.(png|jpe?g)$/i.test(src || '')) return `src="${src}"`;
  return `src="${src.replace(/\.(png|jpe?g)$/i, '.webp')}" data-orig="${src}"`;
}

export const HEADSHOT_ONERROR = "if(this.dataset.orig){this.src=this.dataset.orig;this.removeAttribute('data-orig')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}";
