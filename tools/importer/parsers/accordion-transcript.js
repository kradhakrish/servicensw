/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-transcript.
 * Source: section.accordion with .accordion__title (button or span text) and .accordion__body.
 * Row per item (2 cells): [title | body content]
 */
export default function parse(element, { document }) {
  const cells = [];
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  const titles = [...element.querySelectorAll('.accordion__title')];
  const bodies = [...element.querySelectorAll('.accordion__body')];
  const count = Math.max(titles.length, bodies.length);

  for (let i = 0; i < count; i += 1) {
    const titleEl = titles[i];
    const bodyEl = bodies[i];
    let titleText = '';
    if (titleEl) {
      const inner = titleEl.querySelector('button, span');
      titleText = clean((inner && clean(inner.textContent)) ? inner.textContent : titleEl.textContent);
    }
    if (!titleText) titleText = 'Transcript';

    const bodyCell = [];
    if (bodyEl) {
      [...bodyEl.childNodes].forEach((n) => {
        if (n.nodeType === 3 && !n.textContent.trim()) return;
        if (n.nodeType === 3) {
          const p = document.createElement('p');
          p.textContent = n.textContent.trim();
          bodyCell.push(p);
        } else {
          bodyCell.push(n);
        }
      });
    }
    if (!bodyCell.length && !titleEl) continue;
    cells.push([titleText, bodyCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-transcript', cells });
  element.replaceWith(block);
}
