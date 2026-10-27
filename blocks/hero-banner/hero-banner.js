import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero banner: a full-width background photo with a heading and subtitle.
 * Authored as two rows (image, then text), but authors may omit either row,
 * swap their order, or put both in one cell, so content is located by type
 * rather than by position.
 * @param {Element} block The hero-banner block element
 */
export default function decorate(block) {
  const img = block.querySelector('picture img') || block.querySelector('img');

  // Collect all non-image content in authored order.
  const textNodes = [];
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('picture, img')) return;
          // paragraph that only wrapped the picture
          if (node.querySelector('picture, img') && !node.textContent.trim()) return;
        }
        textNodes.push(node);
      });
    });
  });

  const media = document.createElement('div');
  media.className = 'hero-banner-media';
  if (img) {
    // Hero sits above the fold: load eagerly to protect LCP.
    media.append(createOptimizedPicture(
      img.src,
      img.getAttribute('alt') || '',
      true,
      [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }],
    ));
  }

  const content = document.createElement('div');
  content.className = 'hero-banner-content';
  const inner = document.createElement('div');
  inner.className = 'hero-banner-text';
  textNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const p = document.createElement('p');
      p.textContent = node.textContent.trim();
      inner.append(p);
    } else {
      inner.append(node);
    }
  });
  content.append(inner);

  block.replaceChildren();
  if (img) block.append(media);
  else block.classList.add('no-image');
  if (inner.children.length) block.append(content);
  else block.classList.add('no-text');
}
