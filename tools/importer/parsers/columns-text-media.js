/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-text-media.
 * Source: div.grid with two .grid__col.grid--6-col children; one row, one cell per column in source order.
 */
export default function parse(element, { document }) {
  const cells = [];

  let cols = [...element.children].filter((c) => c.classList.contains('grid__col') || c.classList.contains('grid--6-col'));
  if (!cols.length) cols = [...element.children];

  const row = cols.map((col) => {
    const inner = col.querySelector(':scope > .block') || col;
    // unwrap Drupal embedded-entity wrappers so images (incl. linked badges) stay inline
    [...inner.querySelectorAll('.embedded-entity')].forEach((wrap) => {
      wrap.replaceWith(...wrap.childNodes);
    });
    return [...inner.childNodes].filter((n) => n.nodeType !== 3 || n.textContent.trim());
  });

  if (row.length) cells.push(row);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-text-media', cells });
  element.replaceWith(block);
}
