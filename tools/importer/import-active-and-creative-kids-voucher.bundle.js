/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-active-and-creative-kids-voucher.js
  var import_active_and_creative_kids_voucher_exports = {};
  __export(import_active_and_creative_kids_voucher_exports, {
    default: () => import_active_and_creative_kids_voucher_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const cells = [];
    const heroImg = element.querySelector(".page-hero__hero img");
    if (heroImg && heroImg.getAttribute("src")) {
      const img = document.createElement("img");
      img.src = heroImg.getAttribute("src");
      img.alt = heroImg.getAttribute("alt") || "";
      cells.push([img]);
    }
    const titleWrap = element.querySelector(".page-hero__title") || element;
    const textContent = [];
    const heading = titleWrap.querySelector("#page-title, h1");
    if (heading && heading.textContent.trim()) {
      const h1 = document.createElement("h1");
      h1.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      textContent.push(h1);
    }
    Array.from(titleWrap.querySelectorAll("p")).forEach((p) => {
      if (p.closest(".print-logo")) return;
      if (!p.textContent.trim()) return;
      textContent.push(p);
    });
    if (textContent.length) {
      cells.push([textContent]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-image-tile.js
  function parse2(element, { document }) {
    const cells = [];
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const cards = [...element.querySelectorAll("a.tile--image")];
    cards.forEach((card) => {
      const href = card.getAttribute("href") || "";
      const imageCell = [];
      const srcImg = card.querySelector(".tile__image img, picture img, img");
      if (srcImg) {
        const img = document.createElement("img");
        img.src = srcImg.getAttribute("src") || srcImg.src || "";
        img.alt = srcImg.getAttribute("alt") || "";
        imageCell.push(img);
      }
      const textCell = [];
      const contents = card.querySelector(".tile__contents") || card;
      const srcHeading = contents.querySelector(".tile__heading, h1, h2, h3, h4, h5, h6");
      const title = srcHeading ? clean(srcHeading.textContent) : "";
      let eyebrowText = "";
      const eyebrowEl = contents.querySelector(".tile__eyebrow");
      if (eyebrowEl) {
        eyebrowText = clean(eyebrowEl.textContent);
      } else if (srcHeading) {
        const prev = srcHeading.previousElementSibling;
        if (prev && prev.tagName === "P") eyebrowText = clean(prev.textContent);
      }
      if (eyebrowText) {
        const p = document.createElement("p");
        p.textContent = eyebrowText;
        textCell.push(p);
      }
      if (title) {
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        textCell.push(h3);
      }
      const descEl = contents.querySelector(".tile__desc");
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
        const p = document.createElement("p");
        p.textContent = t;
        textCell.push(p);
      });
      if (href && !title) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        p.append(a);
        textCell.push(p);
      }
      if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-image-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/servicensw-cleanup.js
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      root.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }
  function hasContent(el) {
    if (!el) return false;
    if (el.textContent.replace(/ /g, " ").trim()) return true;
    return !!el.querySelector("img, picture, video, iframe");
  }
  function transform(hookName, element, payload) {
    const document = element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      const lastUpdated = element.querySelector(".last-updated");
      if (lastUpdated) {
        const match = lastUpdated.textContent.match(/Last published:\s*(.+)/i);
        const date = match ? match[1].trim() : "";
        if (date && document.head && !document.head.querySelector('meta[name="last-published"]')) {
          const meta = document.createElement("meta");
          meta.setAttribute("name", "last-published");
          meta.setAttribute("content", date);
          document.head.append(meta);
        }
      }
      element.querySelectorAll(".page-control").forEach((pc) => {
        const wrapper = pc.parentElement;
        if (wrapper && wrapper.matches("div.container") && wrapper.parentElement && wrapper.parentElement.matches("main")) {
          wrapper.remove();
        } else {
          pc.remove();
        }
      });
      element.querySelectorAll(".transaction-cta").forEach((cta) => {
        const btn = cta.querySelector("a.button--primary");
        if (!btn) {
          cta.remove();
          return;
        }
        const p = document.createElement("p");
        p.append(btn);
        cta.replaceChildren(p);
      });
      const isButton = (a) => a.matches("a.button--primary, a.button--secondary");
      element.querySelectorAll("p").forEach((p) => {
        const links = [...p.querySelectorAll("a")];
        if (links.length < 2 || !links.every(isButton)) return;
        if (p.textContent.replace(/\s+/g, "") !== links.map((a) => a.textContent.replace(/\s+/g, "")).join("")) return;
        links.forEach((a) => {
          const np = document.createElement("p");
          np.append(a);
          p.before(np);
        });
        p.remove();
      });
      element.querySelectorAll("a.button--primary, a.button--secondary").forEach((a) => {
        if (a.closest("strong, em")) return;
        const wrap = document.createElement(a.classList.contains("button--primary") ? "strong" : "em");
        a.replaceWith(wrap);
        wrap.append(a);
      });
      element.querySelectorAll("iframe").forEach((iframe) => {
        const src = iframe.getAttribute("src") || "";
        if (iframe.classList.contains("media-oembed-content") || /vimeo\.com|youtube\.com|youtu\.be|\/media\/oembed/i.test(src)) return;
        iframe.remove();
      });
      removeAll(element, [
        // Global chrome
        "#block-sitewidenotice",
        "#global-header",
        'a[class*="SkipToContent"]',
        'header[class*="GlobalHeader"]',
        "#global-footer",
        'footer[class*="GlobalFooter"]',
        "#drupal-live-announce",
        // Page utilities
        "nav.breadcrumb",
        ".print-logo",
        "#block-openreadspeakerblock",
        "#block-fontresizeblock",
        "nav.toc",
        "#toc",
        "#block-content > div.sticky-nav",
        ".sticky-nav",
        "nav#stickyNav",
        ".back-to-top",
        "#back-to-top",
        ".last-updated",
        "#socialSharing",
        "#block-snswcustomersatisfactionform",
        // Chat widget
        "#coai-webchat",
        '[id^="coai-"]',
        // Tracking pixels
        'img[width="1"][height="1"]',
        // Non-authorable
        "script",
        "style",
        "noscript",
        "link"
      ]);
      element.querySelectorAll("#notices-container").forEach((nc) => {
        if (!hasContent(nc)) nc.remove();
      });
      element.querySelectorAll("div.page-notices").forEach((pn) => {
        if (!hasContent(pn)) pn.remove();
      });
      element.querySelectorAll("div.page-notices div.hidden").forEach((h) => {
        if (!hasContent(h)) h.remove();
      });
      element.querySelectorAll("article.page-wrapper > div.container").forEach((c) => {
        if (!hasContent(c)) c.remove();
      });
    }
    if (hookName === "afterTransform") {
      removeAll(element, ["script", "style", "noscript", "link"]);
      element.querySelectorAll("[data-rsevent-id], [onclick]").forEach((el) => {
        el.removeAttribute("data-rsevent-id");
        el.removeAttribute("onclick");
      });
      if (element.hasAttribute && element.hasAttribute("data-rsevent-id")) {
        element.removeAttribute("data-rsevent-id");
      }
      element.querySelectorAll('[style*="background-image"]').forEach((el) => {
        if (/url\(\s*["']?data:/i.test(el.getAttribute("style") || "")) {
          el.style.removeProperty("background-image");
        }
      });
      element.querySelectorAll('img[src^="data:"]').forEach((img) => {
        const wrapper = img.closest("picture") || img;
        const p = wrapper.parentElement;
        wrapper.remove();
        if (p && p.tagName === "P" && !p.textContent.trim() && !p.children.length) p.remove();
      });
    }
  }

  // tools/importer/transformers/servicensw-sections.js
  var MARK = "data-excat-section-id";
  var EL_MARK = "data-excat-section-el";
  function hasContent2(el) {
    if (!el) return false;
    if (el.textContent.replace(/ /g, " ").trim()) return true;
    return !!el.querySelector("img, picture, video, iframe");
  }
  function firstMatch(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (let i = 0; i < list.length; i += 1) {
      try {
        const el = root.querySelector(list[i]);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function safeMatches(el, sel) {
    try {
      return el.matches(sel);
    } catch (e) {
      return false;
    }
  }
  function templateSectionFor(el, templateSections) {
    return templateSections.find((s) => (s.selector || []).some((sel) => safeMatches(el, sel)));
  }
  function landingStyle(el, tplSection) {
    const isHighlight = el.classList.contains("landing-page--highlight");
    if (tplSection) {
      const tplStyle = tplSection.style || null;
      const tplBlue = !!(tplStyle && /light-blue/.test(tplStyle));
      if (tplBlue === isHighlight) {
        if (tplStyle && /split/.test(tplStyle) && !el.querySelector(".grid")) return "light-blue";
        return tplStyle;
      }
    }
    return isHighlight ? "light-blue" : null;
  }
  function resolveSections(root, template) {
    const tplSections = template && template.sections || [];
    const byId = (id) => tplSections.find((s) => s.id === id);
    const result = [];
    const headerTpl = byId("rc2");
    const header = firstMatch(root, headerTpl && headerTpl.selector || ["header.page-header", "header.page-hero"]);
    if (hasContent2(header)) {
      let headerStyle = headerTpl && headerTpl.style ? headerTpl.style : null;
      if (!headerStyle && !(headerTpl && headerTpl.style === null) && safeMatches(header, "header.page-header")) {
        headerStyle = "light-grey";
      }
      result.push({ id: headerTpl && headerTpl.id || "page-header", style: headerStyle, el: header });
    }
    const noticeTpl = byId("rc3");
    const notices = firstMatch(root, noticeTpl && noticeTpl.selector || ["div.page-notices"]);
    if (hasContent2(notices)) {
      result.push({ id: noticeTpl && noticeTpl.id || "page-notices", style: noticeTpl && noticeTpl.style || "notice", el: notices });
    }
    const landing = root.querySelector("article.landing-page");
    if (landing) {
      const sections = [...landing.querySelectorAll(":scope > section.landing-page__section")];
      sections.forEach((sec, i) => {
        if (!hasContent2(sec)) return;
        const tpl = templateSectionFor(sec, tplSections);
        result.push({ id: tpl && tpl.id || `landing-${i + 1}`, style: landingStyle(sec, tpl), el: sec });
      });
      return result;
    }
    const article = root.querySelector("#block-content > article.page-wrapper") || root.querySelector("article.page-wrapper") || root.querySelector("#block-content");
    if (article) {
      const cta = article.querySelector(".transaction-cta");
      if (cta) {
        if (hasContent2(cta)) {
          article.after(cta);
        } else {
          cta.remove();
        }
      }
      if (hasContent2(article)) {
        result.push({ id: "body", style: null, el: article });
      }
      if (cta && cta.isConnected && hasContent2(cta)) {
        result.push({ id: "transaction-cta", style: null, el: cta });
      }
    }
    return result;
  }
  function transform2(hookName, element, payload) {
    const document = element.ownerDocument || element;
    const template = payload && payload.template;
    if (!template || !template.sections || template.sections.length < 2) return;
    if (hookName === "beforeTransform") {
      const sections = resolveSections(element, template);
      if (!sections.length) return;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const { id, el, style } = sections[i];
        el.setAttribute(EL_MARK, id);
        el.setAttribute("data-excat-section-style", style || "");
        const hr = document.createElement("hr");
        hr.setAttribute(MARK, id);
        if (i === 0) hr.setAttribute("data-excat-section-first", "true");
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      const hrs = [...element.querySelectorAll(`hr[${MARK}]`)];
      const tplSections = template.sections || [];
      for (let i = hrs.length - 1; i >= 0; i -= 1) {
        const hr = hrs[i];
        const id = hr.getAttribute(MARK);
        const el = element.querySelector(`[${EL_MARK}="${id}"]`);
        let style;
        if (el && el.hasAttribute("data-excat-section-style")) {
          style = el.getAttribute("data-excat-section-style") || null;
        } else {
          const tpl = tplSections.find((s) => s.id === id);
          style = tpl ? tpl.style : null;
        }
        if (style) {
          const meta = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style }
          });
          if (el) {
            el.after(meta);
          } else if (hrs[i + 1]) {
            hrs[i + 1].before(meta);
          } else {
            hr.parentElement.append(meta);
          }
        }
        if (el) {
          el.removeAttribute(EL_MARK);
          el.removeAttribute("data-excat-section-style");
        }
        if (hr.hasAttribute("data-excat-section-first")) {
          hr.remove();
        } else {
          hr.removeAttribute(MARK);
        }
      }
    }
  }

  // tools/importer/import-active-and-creative-kids-voucher.js
  var PAGE_TEMPLATE = {
    "name": "active-and-creative-kids-voucher",
    "urls": [
      "https://www.service.nsw.gov.au/active-and-creative-kids-voucher"
    ],
    "representativeUrl": "https://www.service.nsw.gov.au/active-and-creative-kids-voucher",
    "description": 'Program landing page with a photo hero (header.page-hero) and a sticky "On this page" nav; body is article.landing-page sections (#stickyNavContainer > section.landing-page__section) holding a notice, default content and image tile grids.',
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
  var parsers = {
    "hero-banner": parse,
    "cards-image-tile": parse2
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_active_and_creative_kids_voucher_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      const meta = WebImporter.Blocks.getMetadata(document);
      const lastPublished = document.querySelector('head meta[name="last-published"]');
      if (lastPublished && lastPublished.content) meta["Last Published"] = lastPublished.content;
      if (Object.keys(meta).length > 0) {
        main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
      }
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_active_and_creative_kids_voucher_exports);
})();
