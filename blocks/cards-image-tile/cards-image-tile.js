import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Makes the whole card clickable through a single primary link.
 * The heading carries the link (stretched over the card by CSS); a
 * standalone link paragraph that only repeats the target is removed.
 * @param {Element} body The card body element
 */
function linkCard(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  const links = [...body.querySelectorAll('a[href]')];
  if (!links.length) return;

  const headingLink = heading ? heading.querySelector('a[href]') : null;
  const primary = headingLink || links[links.length - 1];

  if (heading && !headingLink) {
    const a = document.createElement('a');
    a.href = primary.href;
    a.append(...heading.childNodes);
    heading.append(a);
    // drop the paragraph that only held the (now redundant) link
    const p = primary.closest('p');
    if (p && p.textContent.trim() === primary.textContent.trim()) p.remove();
    a.classList.add('cards-image-tile-link');
  } else {
    primary.classList.add('cards-image-tile-link');
    primary.classList.remove('button', 'primary', 'secondary', 'accent');
    const wrapper = primary.closest('.button-wrapper');
    if (wrapper) wrapper.classList.remove('button-wrapper');
  }

  const arrow = document.createElement('span');
  arrow.className = 'cards-image-tile-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  body.append(arrow);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-image-tile-card-image';
      } else {
        div.className = 'cards-image-tile-card-body';
      }
    });

    const body = li.querySelector('.cards-image-tile-card-body');
    if (body) {
      // an optional paragraph before the heading is the eyebrow
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const prev = heading.previousElementSibling;
        if (prev && prev.tagName === 'P' && !prev.querySelector('a, picture')) {
          prev.classList.add('cards-image-tile-eyebrow');
        }
      }
      linkCard(body);
    }

    if (li.children.length) ul.append(li);
  });

  // only media-bus (same-origin) images can be resized; external URLs keep their query
  ul.querySelectorAll('picture > img').forEach((img) => {
    if (new URL(img.src, window.location.href).origin !== window.location.origin) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  // source uses a 4-up grid (tile-grid--4x) for sets of 4 or 8 tiles
  const count = ul.children.length;
  if (!block.classList.contains('cols-3') && count >= 4 && count % 4 === 0) {
    block.classList.add('cols-4');
  }
  block.replaceChildren(ul);
}
