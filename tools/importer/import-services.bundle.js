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

  // tools/importer/import-services.js
  var import_services_exports = {};
  __export(import_services_exports, {
    default: () => import_services_default
  });

  // tools/importer/parsers/cards-image-tile.js
  function parse(element, { document }) {
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

  // tools/importer/parsers/cards-link-tile.js
  function parse2(element, { document }) {
    const cells = [];
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const cards = [...element.querySelectorAll("a.tile--menu-box, a.tile--ghost-box")];
    cards.forEach((card) => {
      const href = card.getAttribute("href") || "";
      const srcHeading = card.querySelector(".tile__heading, h1, h2, h3, h4, h5, h6");
      const descEl = card.querySelector(".tile__desc");
      let title = "";
      let desc = "";
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
          desc = parts.join(" ");
        }
      } else {
        if (descEl) {
          desc = clean(descEl.textContent);
          const clone = card.cloneNode(true);
          const d = clone.querySelector(".tile__desc");
          if (d) d.remove();
          title = clean(clone.textContent);
        } else {
          title = clean(card.textContent);
        }
      }
      if (!title && !desc) return;
      const contentCell = [];
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
        contentCell.push(h3);
      }
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        contentCell.push(p);
      }
      if (href && !title) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        p.append(a);
        contentCell.push(p);
      }
      cells.push([contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-link-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-video.js
  function parse3(element, { document }) {
    const cells = [];
    const iframe = element.tagName === "IFRAME" ? element : element.querySelector("iframe");
    const src = iframe ? iframe.getAttribute("src") || iframe.getAttribute("data-src") || "" : "";
    let videoUrl = "";
    try {
      const u = new URL(src, "https://www.service.nsw.gov.au");
      const proxied = u.searchParams.get("url");
      videoUrl = proxied || u.href;
    } catch (e) {
      const m = src.match(/[?&]url=([^&]+)/);
      videoUrl = m ? decodeURIComponent(m[1]) : src;
    }
    if (videoUrl && videoUrl.startsWith("//")) videoUrl = `https:${videoUrl}`;
    if (videoUrl && !/^https?:/i.test(videoUrl) && /^(www\.)?(vimeo|youtube|youtu\.be)/i.test(videoUrl)) {
      videoUrl = `https://${videoUrl}`;
    }
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.textContent = videoUrl;
      cells.push([a]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-transcript.js
  function parse4(element, { document }) {
    const cells = [];
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const titles = [...element.querySelectorAll(".accordion__title")];
    const bodies = [...element.querySelectorAll(".accordion__body")];
    const count = Math.max(titles.length, bodies.length);
    for (let i = 0; i < count; i += 1) {
      const titleEl = titles[i];
      const bodyEl = bodies[i];
      let titleText = "";
      if (titleEl) {
        const inner = titleEl.querySelector("button, span");
        titleText = clean(inner && clean(inner.textContent) ? inner.textContent : titleEl.textContent);
      }
      if (!titleText) titleText = "Transcript";
      const bodyCell = [];
      if (bodyEl) {
        [...bodyEl.childNodes].forEach((n) => {
          if (n.nodeType === 3 && !n.textContent.trim()) return;
          if (n.nodeType === 3) {
            const p = document.createElement("p");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-transcript", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-text-media.js
  function parse5(element, { document }) {
    const cells = [];
    let cols = [...element.children].filter((c) => c.classList.contains("grid__col") || c.classList.contains("grid--6-col"));
    if (!cols.length) cols = [...element.children];
    const row = cols.map((col) => {
      const inner = col.querySelector(":scope > .block") || col;
      [...inner.querySelectorAll(".embedded-entity")].forEach((wrap) => {
        wrap.replaceWith(...wrap.childNodes);
      });
      return [...inner.childNodes].filter((n) => n.nodeType !== 3 || n.textContent.trim());
    });
    if (row.length) cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-text-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table.js
  function parse6(element, { document }) {
    const cells = [];
    const table = element.tagName === "TABLE" ? element : element.querySelector("table");
    if (!table) return;
    table.querySelectorAll("[data-label]").forEach((el) => el.removeAttribute("data-label"));
    const cellContent = (c) => {
      const nodes = [...c.childNodes].filter((n) => n.nodeType !== 3 || n.textContent.trim());
      return nodes.length ? nodes : "";
    };
    const rows = [];
    const thead = table.querySelector(":scope > thead");
    if (thead) rows.push(...thead.querySelectorAll(":scope > tr"));
    table.querySelectorAll(":scope > tbody > tr, :scope > tr").forEach((tr) => rows.push(tr));
    const tfoot = table.querySelector(":scope > tfoot");
    if (tfoot) rows.push(...tfoot.querySelectorAll(":scope > tr"));
    const width = Math.max(0, ...rows.map((tr) => tr.querySelectorAll(":scope > th, :scope > td").length));
    rows.forEach((tr) => {
      const row = [...tr.querySelectorAll(":scope > th, :scope > td")].map(cellContent);
      if (!row.length) return;
      while (row.length < width) row.push("");
      cells.push(row);
    });
    const variants = [];
    if (!thead && !table.querySelector("th")) variants.push("no-header");
    if (table.classList.contains("table--striped")) variants.push("striped");
    const block = WebImporter.Blocks.createBlock(document, { name: "table", variants, cells });
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

  // tools/importer/import-services.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "cards-image-tile": parse,
    "cards-link-tile": parse2,
    "embed-video": parse3,
    "accordion-transcript": parse4,
    "columns-text-media": parse5,
    "table": parse6
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
  var import_services_default = {
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
  return __toCommonJS(import_services_exports);
})();
