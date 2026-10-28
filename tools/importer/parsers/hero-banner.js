/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner (Hero convention).
 * Source: header.page-hero (service.nsw.gov.au)
 * Block table: 1 column
 *   row 1: block name (added by createBlock)
 *   row 2: background image (optional)
 *   row 3: title (H1) + subheading paragraph(s) (optional)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Background image from the hero wrapper (src used as-is, may be absolute)
  const heroImg = element.querySelector('.page-hero__hero img');
  if (heroImg && heroImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = heroImg.getAttribute('src');
    img.alt = heroImg.getAttribute('alt') || '';
    cells.push([img]);
  }

  // Title + subheading(s), excluding the print logo
  const titleWrap = element.querySelector('.page-hero__title') || element;
  const textContent = [];

  const heading = titleWrap.querySelector('#page-title, h1');
  if (heading && heading.textContent.trim()) {
    const h1 = document.createElement('h1');
    h1.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    textContent.push(h1);
  }

  Array.from(titleWrap.querySelectorAll('p')).forEach((p) => {
    if (p.closest('.print-logo')) return;
    if (!p.textContent.trim()) return;
    textContent.push(p);
  });

  if (textContent.length) {
    cells.push([textContent]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
