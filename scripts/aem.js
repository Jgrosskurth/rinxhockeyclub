/*
 * AEM Edge Delivery – Core Library (minimal)
 * Full version: https://github.com/adobe/aem-boilerplate/blob/main/scripts/aem.js
 */

/**
 * log RUM if part of the sample.
 */
function sampleRUM() {}

/**
 * Loads a CSS file.
 */
export async function loadCSS(href) {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`head > link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.append(link);
    } else {
      resolve();
    }
  });
}

/**
 * Loads a non-module JS file.
 */
export async function loadScript(src, attrs = {}) {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`head > script[src="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      Object.entries(attrs).forEach(([key, val]) => script.setAttribute(key, val));
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    } else {
      resolve();
    }
  });
}

/**
 * Decorates a block — adds classes for column count.
 */
export function decorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (shortBlockName) {
    block.classList.add('block');
    const rows = [...block.children];
    rows.forEach((row) => {
      row.classList.add('row');
      [...row.children].forEach((col) => col.classList.add('col'));
    });
    const colCount = rows[0]?.children.length || 1;
    block.classList.add(`columns-${colCount}`);
  }
}

/**
 * Loads a block's JS and CSS.
 */
export async function loadBlock(block) {
  const status = block.dataset.blockStatus;
  if (status !== 'loading' && status !== 'loaded') {
    block.dataset.blockStatus = 'loading';
    const blockName = block.classList[0];
    const cssLoaded = loadCSS(`/blocks/${blockName}/${blockName}.css`).catch(() => {});
    const decorated = import(`/blocks/${blockName}/${blockName}.js`)
      .then((mod) => mod.default && mod.default(block))
      .catch((err) => console.error(`Failed to load block: ${blockName}`, err));
    await Promise.all([cssLoaded, decorated]);
    block.dataset.blockStatus = 'loaded';
  }
}

/**
 * Returns a picture element with webp + fallback.
 */
export function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }]) {
  const url = new URL(src, window.location.href);
  const picture = document.createElement('picture');
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  breakpoints.forEach((bp) => {
    const source = document.createElement('source');
    if (bp.media) source.setAttribute('media', bp.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${pathname}?width=${bp.width}&format=webp&optimize=medium`);
    picture.append(source);
  });

  breakpoints.forEach((bp, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (bp.media) source.setAttribute('media', bp.media);
      source.setAttribute('srcset', `${pathname}?width=${bp.width}&format=${ext}&optimize=medium`);
      picture.append(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      img.src = `${pathname}?width=${bp.width}&format=${ext}&optimize=medium`;
      picture.append(img);
    }
  });

  return picture;
}

export { sampleRUM };
