/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table.
 * Source: div.table__wrapper > table (or a bare table). First row = header row (thead th).
 * Keeps inline formatting and links; strips data-label attributes; pads short rows.
 */
export default function parse(element, { document }) {
  const cells = [];
  const table = element.tagName === 'TABLE' ? element : element.querySelector('table');
  if (!table) return;

  table.querySelectorAll('[data-label]').forEach((el) => el.removeAttribute('data-label'));

  const cellContent = (c) => {
    const nodes = [...c.childNodes].filter((n) => n.nodeType !== 3 || n.textContent.trim());
    return nodes.length ? nodes : '';
  };

  const rows = [];
  const thead = table.querySelector(':scope > thead');
  if (thead) rows.push(...thead.querySelectorAll(':scope > tr'));
  table.querySelectorAll(':scope > tbody > tr, :scope > tr').forEach((tr) => rows.push(tr));
  const tfoot = table.querySelector(':scope > tfoot');
  if (tfoot) rows.push(...tfoot.querySelectorAll(':scope > tr'));

  const width = Math.max(0, ...rows.map((tr) => tr.querySelectorAll(':scope > th, :scope > td').length));
  rows.forEach((tr) => {
    const row = [...tr.querySelectorAll(':scope > th, :scope > td')].map(cellContent);
    if (!row.length) return;
    while (row.length < width) row.push('');
    cells.push(row);
  });

  const variants = [];
  if (!thead && !table.querySelector('th')) variants.push('no-header');
  if (table.classList.contains('table--striped')) variants.push('striped');

  const block = WebImporter.Blocks.createBlock(document, { name: 'table', variants, cells });
  element.replaceWith(block);
}
