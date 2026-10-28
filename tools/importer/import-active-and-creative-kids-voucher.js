/* eslint-disable */
/* global WebImporter */

import heroBannerParser from './parsers/hero-banner.js';
import cardsImageTileParser from './parsers/cards-image-tile.js';
import cleanupTransformer from './transformers/servicensw-cleanup.js';
import sectionsTransformer from './transformers/servicensw-sections.js';

const PAGE_TEMPLATE = {
  "name": "active-and-creative-kids-voucher",
  "urls": [
    "https://www.service.nsw.gov.au/active-and-creative-kids-voucher"
  ],
  "representativeUrl": "https://www.service.nsw.gov.au/active-and-creative-kids-voucher",
  "description": "Program landing page with a photo hero (header.page-hero) and a sticky \"On this page\" nav; body is article.landing-page sections (#stickyNavContainer > section.landing-page__section) holding a notice, default content and image tile grids.",
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        "header.page-hero"
      ]
    },
    {
      "name": "cards-image-tile",
      "instances": [
        ".tile-grid:has(a.tile--image)"
      ]
    }
  ],
  "urlPattern": "/*",
  "sections": [
    {
      "id": "rc2",
      "name": "Page hero",
      "selector": [
        "header.page-hero"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "rc2c4c2c1",
      "name": "Voucher notice",
      "selector": [
        "#stickyNavContainer > section.landing-page__section:nth-of-type(1)",
        "article.landing-page section.landing-page__section:nth-of-type(1)"
      ],
      "style": "notice",
      "blocks": [],
      "defaultContent": [
        ".notice h2",
        ".notice p"
      ]
    },
    {
      "id": "rc2c4c2c2",
      "name": "Parents, guardians and carers",
      "selector": [
        "#stickyNavContainer > section.landing-page__section:nth-of-type(2)",
        "article.landing-page section.landing-page__section:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "cards-image-tile"
      ],
      "defaultContent": [
        "h2",
        "h3",
        "p",
        "ul"
      ]
    },
    {
      "id": "rc2c4c2c3",
      "name": "Providers",
      "selector": [
        "#stickyNavContainer > section.landing-page__section:nth-of-type(3)",
        "article.landing-page section.landing-page__section:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [
        "cards-image-tile"
      ],
      "defaultContent": [
        "h2",
        "h3",
        "p",
        "ul"
      ]
    }
  ]
};

const parsers = {
  'hero-banner': heroBannerParser,
  'cards-image-tile': cardsImageTileParser,
};

const transformers = [cleanupTransformer, sectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    // Same as WebImporter.rules.createMetadata, plus the "Last published" date
    // captured by the cleanup transformer.
    const meta = WebImporter.Blocks.getMetadata(document);
    const lastPublished = document.querySelector('head meta[name="last-published"]');
    if (lastPublished && lastPublished.content) meta['Last Published'] = lastPublished.content;
    if (Object.keys(meta).length > 0) {
      main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    }
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
