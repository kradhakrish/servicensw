/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-image-tile.
 * Source: .tile-grid (div or ul > li.tile-grid__item) of a.tile.tile--image cards.
 * Row per card (2 cells): [image | eyebrow?, h3 title, description, link to card href]
 */
export default function parse(element, { document }) {
  const cells = [];
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  const cards = [...element.querySelectorAll('a.tile--image')];
  cards.forEach((card) => {
    const href = card.getAttribute('href') || '';

    // image cell
    const imageCell = [];
    const srcImg = card.querySelector('.tile__image img, picture img, img');
    if (srcImg) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src') || srcImg.src || '';
      img.alt = srcImg.getAttribute('alt') || '';
      imageCell.push(img);
    }

    // text cell
    const textCell = [];
    const contents = card.querySelector('.tile__contents') || card;
    const srcHeading = contents.querySelector('.tile__heading, h1, h2, h3, h4, h5, h6');
    const title = srcHeading ? clean(srcHeading.textContent) : '';

    // eyebrow: a paragraph (or .tile__eyebrow) before the heading
    let eyebrowText = '';
    const eyebrowEl = contents.querySelector('.tile__eyebrow');
    if (eyebrowEl) {
      eyebrowText = clean(eyebrowEl.textContent);
    } else if (srcHeading) {
      const prev = srcHeading.previousElementSibling;
      if (prev && prev.tagName === 'P') eyebrowText = clean(prev.textContent);
    }
    if (eyebrowText) {
      const p = document.createElement('p');
      p.textContent = eyebrowText;
      textCell.push(p);
    }

    // The title heading carries the card link, so the title text is not repeated.
    if (title) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      textCell.push(h3);
    }

    // description: .tile__desc or paragraphs after the heading
    const descEl = contents.querySelector('.tile__desc');
    const descParts = [];
    if (descEl) {
      const t = clean(descEl.textContent);
      if (t) descParts.push(t);
    } else if (srcHeading) {
      let n = srcHeading.nextElementSibling;
      while (n) {
        const t = clean(n.textContent);
        if (t) descParts.push(t);
        n = n.nextElementSibling;
      }
    }
    descParts.forEach((t) => {
      const p = document.createElement('p');
      p.textContent = t;
      textCell.push(p);
    });

    if (href && !title) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      p.append(a);
      textCell.push(p);
    }

    if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-image-tile', cells });
  element.replaceWith(block);
}
