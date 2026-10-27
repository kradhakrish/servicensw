/* eslint-disable */
/* global WebImporter */

import cardsImageTileParser from './parsers/cards-image-tile.js';
import cardsLinkTileParser from './parsers/cards-link-tile.js';
import embedVideoParser from './parsers/embed-video.js';
import accordionTranscriptParser from './parsers/accordion-transcript.js';
import columnsTextMediaParser from './parsers/columns-text-media.js';
import tableParser from './parsers/table.js';
import cleanupTransformer from './transformers/servicensw-cleanup.js';
import sectionsTransformer from './transformers/servicensw-sections.js';

const PAGE_TEMPLATE = {
  "name": "services",
  "urls": [
    "https://www.service.nsw.gov.au/business",
    "https://www.service.nsw.gov.au/business/business-profile",
    "https://www.service.nsw.gov.au/business/getting-started",
    "https://www.service.nsw.gov.au/business/manage-and-grow",
    "https://www.service.nsw.gov.au/business/small-business-advisory-program",
    "https://www.service.nsw.gov.au/contact-us",
    "https://www.service.nsw.gov.au/guide",
    "https://www.service.nsw.gov.au/guide/buying-a-vehicle",
    "https://www.service.nsw.gov.au/guide/ndis-worker-check",
    "https://www.service.nsw.gov.au/guide/replacing-lost-identification-licences-and-personal-documents",
    "https://www.service.nsw.gov.au/referral/check-fuel-prices",
    "https://www.service.nsw.gov.au/service-centre",
    "https://www.service.nsw.gov.au/services",
    "https://www.service.nsw.gov.au/services/births-relationships-and-deaths",
    "https://www.service.nsw.gov.au/services/boating-fishing-and-outdoors",
    "https://www.service.nsw.gov.au/services/concessions-rebates-and-assistance",
    "https://www.service.nsw.gov.au/services/disability-assistance",
    "https://www.service.nsw.gov.au/services/disaster-and-emergency-support-for-business",
    "https://www.service.nsw.gov.au/services/driving-and-transport",
    "https://www.service.nsw.gov.au/services/education-and-training",
    "https://www.service.nsw.gov.au/services/emergencies-and-natural-disasters",
    "https://www.service.nsw.gov.au/services/employment-and-industries",
    "https://www.service.nsw.gov.au/services/energy-and-utilities",
    "https://www.service.nsw.gov.au/services/environment-parks-and-wildlife",
    "https://www.service.nsw.gov.au/services/financial-assistance-after-a-natural-disaster",
    "https://www.service.nsw.gov.au/services/health-and-care",
    "https://www.service.nsw.gov.au/services/housing-and-property",
    "https://www.service.nsw.gov.au/services/legal-and-police-services",
    "https://www.service.nsw.gov.au/services/myservicensw-account",
    "https://www.service.nsw.gov.au/services/recreational-fishing",
    "https://www.service.nsw.gov.au/services/savings-finder",
    "https://www.service.nsw.gov.au/services/seniors-carers-pensioners",
    "https://www.service.nsw.gov.au/services/view-all-topics",
    "https://www.service.nsw.gov.au/services/working-with-children",
    "https://www.service.nsw.gov.au/transaction/apply-for-a-nsw-photo-card",
    "https://www.service.nsw.gov.au/transaction/apply-for-a-nsw-seniors-card-or-nsw-senior-savers-card",
    "https://www.service.nsw.gov.au/transaction/apply-nsw-seniors-card-or-nsw-senior-savers-card",
    "https://www.service.nsw.gov.au/transaction/book-a-driver-or-rider-licence-test",
    "https://www.service.nsw.gov.au/transaction/change-address-with-nsw-government",
    "https://www.service.nsw.gov.au/transaction/check-a-vehicle-registration",
    "https://www.service.nsw.gov.au/transaction/check-your-demerit-points",
    "https://www.service.nsw.gov.au/transaction/claim-the-toll-relief-cap",
    "https://www.service.nsw.gov.au/transaction/driver-knowledge-test-online",
    "https://www.service.nsw.gov.au/transaction/renew-a-vehicle-registration",
    "https://www.service.nsw.gov.au/transaction/renew-or-upgrade-a-nsw-driver-licence",
    "https://www.service.nsw.gov.au/transaction/request-a-review-for-a-fine",
    "https://www.service.nsw.gov.au/transaction/settle-in-nsw",
    "https://www.service.nsw.gov.au/transaction/submit-a-notice-of-disposal-for-a-vehicle",
    "https://www.service.nsw.gov.au/transaction/transfer-a-vehicle-registration",
    "https://www.service.nsw.gov.au/verifying-your-identity"
  ],
  "representativeUrl": "https://www.service.nsw.gov.au/business",
  "description": "Service NSW content pages sharing one shell (grey page header, notices, article body): landing pages (article.landing-page, e.g. /business), category/topic pages (article.page-wrapper.category), transaction pages (article.page-wrapper.transaction, with a client-rendered transaction-cta button), guide, content and referral pages (article.page-wrapper.guide|content|referral). Body content is mostly default content (h2/h3, paragraphs, lists) inside section.page-section, plus tile grids, embedded Vimeo videos with transcripts, 6/6 split grids and data tables.",
  "blocks": [
    {
      "name": "cards-image-tile",
      "instances": [
        ".tile-grid:has(a.tile--image)"
      ]
    },
    {
      "name": "cards-link-tile",
      "instances": [
        ".tile-grid:has(a.tile--menu-box)",
        ".tile-grid:has(a.tile--ghost-box)"
      ]
    },
    {
      "name": "embed-video",
      "instances": [
        ".embedded-entity iframe.media-oembed-content"
      ]
    },
    {
      "name": "accordion-transcript",
      "instances": [
        "section.accordion--transcript",
        "section.accordion"
      ]
    },
    {
      "name": "columns-text-media",
      "instances": [
        "div.grid:has(> .grid--6-col):not(:has(iframe.media-oembed-content))"
      ]
    },
    {
      "name": "table",
      "instances": [
        "div.table__wrapper > table",
        "#block-content table"
      ]
    }
  ],
  "urlPattern": "/*",
  "sections": [
    {
      "id": "rc2",
      "name": "Page header",
      "selector": [
        "header.page-header",
        "header.page-hero"
      ],
      "style": "light-grey",
      "blocks": [],
      "defaultContent": [
        "#page-title",
        "header.page-header .container > p"
      ]
    },
    {
      "id": "rc3",
      "name": "Page notice",
      "selector": [
        "div.page-notices"
      ],
      "style": "notice",
      "blocks": [],
      "defaultContent": [
        "#notices-container .notice h2",
        "#notices-container .notice p"
      ]
    },
    {
      "id": "rc5",
      "name": "Business support",
      "selector": [
        "article.landing-page > section.landing-page__section:nth-of-type(1)"
      ],
      "style": "light-blue",
      "blocks": [
        "cards-image-tile"
      ],
      "defaultContent": [
        "h2",
        ".region:not(.tile-grid) p",
        ".region:not(.tile-grid) a.button"
      ]
    },
    {
      "id": "rc6",
      "name": "Help at every stage",
      "selector": [
        "article.landing-page > section.landing-page__section:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "cards-link-tile"
      ],
      "defaultContent": [
        "h2"
      ]
    },
    {
      "id": "rc7",
      "name": "Guidance video",
      "selector": [
        "article.landing-page > section.landing-page__section:nth-of-type(3)"
      ],
      "style": "light-blue, split",
      "blocks": [
        "embed-video",
        "accordion-transcript"
      ],
      "defaultContent": [
        ".grid__col:first-child h2",
        ".grid__col:first-child p"
      ]
    },
    {
      "id": "rc8",
      "name": "Featured help",
      "selector": [
        "article.landing-page > section.landing-page__section:nth-of-type(4)"
      ],
      "style": null,
      "blocks": [
        "cards-image-tile"
      ],
      "defaultContent": [
        "h2"
      ]
    },
    {
      "id": "rc9",
      "name": "Resources",
      "selector": [
        "article.landing-page > section.landing-page__section:nth-of-type(5)"
      ],
      "style": null,
      "blocks": [
        "cards-link-tile"
      ],
      "defaultContent": [
        "h2"
      ]
    },
    {
      "id": "rc10",
      "name": "Business Profile",
      "selector": [
        "article.landing-page > section.landing-page__section:nth-of-type(6)"
      ],
      "style": null,
      "blocks": [
        "columns-text-media"
      ],
      "defaultContent": [
        "h2"
      ]
    },
    {
      "id": "rc11",
      "name": "Download the app",
      "selector": [
        "article.landing-page > section.landing-page__section:nth-of-type(7)"
      ],
      "style": "light-blue",
      "blocks": [
        "columns-text-media"
      ],
      "defaultContent": [
        "h2"
      ]
    },
    {
      "id": "rc12",
      "name": "Accessibility and translation support",
      "selector": [
        "article.landing-page > section.landing-page__section:nth-of-type(8)"
      ],
      "style": "narrow",
      "blocks": [],
      "defaultContent": [
        "h2",
        "p"
      ]
    },
    {
      "id": "rc13",
      "name": "Connect with us",
      "selector": [
        "article.landing-page > section.landing-page__section:nth-of-type(9)"
      ],
      "style": "narrow",
      "blocks": [],
      "defaultContent": [
        "h2",
        "p",
        "ul"
      ]
    }
  ],
  "coverageGaps": [
    {
      "url": "https://www.service.nsw.gov.au/services/driving-and-transport",
      "sections": [
        {
          "nodeMapId": "rc1c2c4c2",
          "sectionSignature": "category toc-container: page-section h2 + tile-grid of tile--menu-box (cards-link-tile)"
        }
      ]
    },
    {
      "url": "https://www.service.nsw.gov.au/transaction/renew-a-vehicle-registration",
      "sections": [
        {
          "nodeMapId": "rc1c2c4c2",
          "sectionSignature": "transaction-cta: client-rendered primary button link (default content)"
        }
      ]
    },
    {
      "url": "https://www.service.nsw.gov.au/transaction/claim-the-toll-relief-cap",
      "sections": [
        {
          "nodeMapId": "rc2c4c1c2c1",
          "sectionSignature": "div.table__wrapper > table (table)"
        },
        {
          "nodeMapId": "rc2c4c1c2c2",
          "sectionSignature": "embedded-entity notice--info inside body (default content)"
        }
      ]
    },
    {
      "url": "https://www.service.nsw.gov.au/business/getting-started",
      "sections": [
        {
          "nodeMapId": "rc2c4c1c1c6",
          "sectionSignature": "category__ghost-links: h2, p, tile-grid of tile--ghost-box (cards-link-tile)"
        },
        {
          "nodeMapId": "rc2c4c1c1c4c2",
          "sectionSignature": "tile-grid--4x of tile--image (cards-image-tile)"
        }
      ]
    }
  ]
};

const parsers = {
  'cards-image-tile': cardsImageTileParser,
  'cards-link-tile': cardsLinkTileParser,
  'embed-video': embedVideoParser,
  'accordion-transcript': accordionTranscriptParser,
  'columns-text-media': columnsTextMediaParser,
  'table': tableParser,
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
