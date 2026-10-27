/*
 * Table Block
 * Recreates a data table from the authored block rows.
 * Based on https://www.aem.live/developer/block-collection/table
 *
 * Each block row is a table row; each cell is a table cell.
 * The first row is the header row (th in thead) unless the block has
 * the `no-header` class. Inline formatting and links are preserved.
 */

/**
 * Moves the authored cell content into a new table cell element.
 * @param {Element} cell The authored cell
 * @param {string} tag 'th' or 'td'
 * @returns {HTMLTableCellElement}
 */
function buildCell(cell, tag) {
  const el = document.createElement(tag);
  if (cell) {
    el.append(...cell.childNodes);
    // unwrap a lone paragraph so cells do not carry block margins
    if (el.children.length === 1 && el.firstElementChild.tagName === 'P'
      && el.childNodes.length === 1) {
      el.replaceChildren(...el.firstElementChild.childNodes);
    }
  }
  return el;
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;

  const header = !block.classList.contains('no-header');
  const columnCount = Math.max(...rows.map((row) => row.children.length));

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rows.forEach((row, i) => {
    const isHeader = header && i === 0;
    const tr = document.createElement('tr');
    const cells = [...row.children];

    cells.forEach((cell) => {
      const el = buildCell(cell, isHeader ? 'th' : 'td');
      if (isHeader) el.setAttribute('scope', 'col');
      tr.append(el);
    });

    // rows with fewer cells than the widest row: stretch the last cell
    const missing = columnCount - cells.length;
    if (missing > 0 && tr.lastElementChild) {
      tr.lastElementChild.colSpan = missing + 1;
    }

    (isHeader ? thead : tbody).append(tr);
  });

  if (thead.children.length) table.append(thead);
  table.append(tbody);

  const scroller = document.createElement('div');
  scroller.className = 'table-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Scrollable table');
  scroller.append(table);

  block.replaceChildren(scroller);
}
