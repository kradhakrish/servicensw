/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-link-tile.
 * Source: .tile-grid of a.tile.tile--menu-box (tile__heading + optional tile__desc)
 * or a.tile.tile--ghost-box (text only, no heading element).
 * Row per card (single cell): [h3 title, description?, link]
 */
export default function parse(element, { document }) {
  const cells = [];
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  const cards = [...element.querySelectorAll('a.tile--menu-box, a.tile--ghost-box')];
  cards.forEach((card) => {
    const href = card.getAttribute('href') || '';
    const srcHeading = card.querySelector('.tile__heading, h1, h2, h3, h4, h5, h6');
    const descEl = card.querySelector('.tile__desc');

    let title = '';
    let desc = '';
    if (srcHeading) {
      title = clean(srcHeading.textContent);
      if (descEl) {
        desc = clean(descEl.textContent);
      } else {
        const parts = [];
        let n = srcHeading.nextElementSibling;
        while (n) {
          const t = clean(n.textContent);
          if (t) parts.push(t);
          n = n.nextElementSibling;
        }
        desc = parts.join(' ');
      }
    } else {
      // ghost-box: text only; optional desc element splits title/description
      if (descEl) {
        desc = clean(descEl.textContent);
        const clone = card.cloneNode(true);
        const d = clone.querySelector('.tile__desc');
        if (d) d.remove();
        title = clean(clone.textContent);
      } else {
        title = clean(card.textContent);
      }
    }

    if (!title && !desc) return;

    // The title heading carries the card link, so the title text is not repeated.
    const contentCell = [];
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
      contentCell.push(h3);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      contentCell.push(p);
    }
    if (href && !title) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      p.append(a);
      contentCell.push(p);
    }
    cells.push([contentCell]);
  });

  // Outlined "related information" tiles (tile--ghost-box) get the `ghost` option.
  const variants = element.querySelector('a.tile--ghost-box') ? ['ghost'] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-link-tile', variants, cells });
  element.replaceWith(block);
}
