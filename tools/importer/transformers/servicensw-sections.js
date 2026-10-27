/* eslint-disable */
/* global WebImporter */

/**
 * Service NSW sections transformer.
 *
 * Section order on every page:
 *   1. Page header (header.page-header | header.page-hero)  -> light-grey
 *   2. Page notices (div.page-notices, if non-empty)          -> notice
 *   3a. Landing pages: one section per
 *       article.landing-page > section.landing-page__section
 *       (style from template sections[] when consistent, else
 *        landing-page--highlight -> light-blue)
 *   3b. Other pages: the article body as one default section, and the
 *       .transaction-cta button in its own final section.
 *
 * beforeTransform inserts <hr data-excat-section-id> breaks (a temporary one
 * before the first section) and tags each section element with
 * data-excat-section-el. afterTransform adds Section Metadata for styled
 * sections, then removes markers and the first temporary <hr>.
 */

const MARK = 'data-excat-section-id';
const EL_MARK = 'data-excat-section-el';

function hasContent(el) {
  if (!el) return false;
  if (el.textContent.replace(/ /g, ' ').trim()) return true;
  return !!el.querySelector('img, picture, video, iframe');
}

function firstMatch(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (let i = 0; i < list.length; i += 1) {
    try {
      const el = root.querySelector(list[i]);
      if (el) return el;
    } catch (e) { /* invalid selector, skip */ }
  }
  return null;
}

function safeMatches(el, sel) {
  try { return el.matches(sel); } catch (e) { return false; }
}

function templateSectionFor(el, templateSections) {
  return templateSections.find((s) => (s.selector || []).some((sel) => safeMatches(el, sel)));
}

function landingStyle(el, tplSection) {
  const isHighlight = el.classList.contains('landing-page--highlight');
  if (tplSection) {
    const tplStyle = tplSection.style || null;
    const tplBlue = !!(tplStyle && /light-blue/.test(tplStyle));
    // Only trust the template style when it agrees with the live DOM.
    if (tplBlue === isHighlight) {
      if (tplStyle && /split/.test(tplStyle) && !el.querySelector('.grid')) return 'light-blue';
      return tplStyle;
    }
  }
  return isHighlight ? 'light-blue' : null;
}

function resolveSections(root, template) {
  const tplSections = (template && template.sections) || [];
  const byId = (id) => tplSections.find((s) => s.id === id);
  const result = [];

  // 1. Page header
  const headerTpl = byId('rc2');
  const header = firstMatch(root, (headerTpl && headerTpl.selector) || ['header.page-header', 'header.page-hero']);
  if (hasContent(header)) {
    // Template style wins when set; an explicit null (e.g. voucher hero) means
    // no Section Metadata. The light-grey default only applies to the grey
    // header.page-header, never to header.page-hero.
    let headerStyle = headerTpl && headerTpl.style ? headerTpl.style : null;
    if (!headerStyle && !(headerTpl && headerTpl.style === null)
      && safeMatches(header, 'header.page-header')) {
      headerStyle = 'light-grey';
    }
    result.push({ id: (headerTpl && headerTpl.id) || 'page-header', style: headerStyle, el: header });
  }

  // 2. Page notices
  const noticeTpl = byId('rc3');
  const notices = firstMatch(root, (noticeTpl && noticeTpl.selector) || ['div.page-notices']);
  if (hasContent(notices)) {
    result.push({ id: (noticeTpl && noticeTpl.id) || 'page-notices', style: (noticeTpl && noticeTpl.style) || 'notice', el: notices });
  }

  // 3a. Landing pages
  const landing = root.querySelector('article.landing-page');
  if (landing) {
    const sections = [...landing.querySelectorAll(':scope > section.landing-page__section')];
    sections.forEach((sec, i) => {
      if (!hasContent(sec)) return;
      const tpl = templateSectionFor(sec, tplSections);
      result.push({ id: (tpl && tpl.id) || `landing-${i + 1}`, style: landingStyle(sec, tpl), el: sec });
    });
    return result;
  }

  // 3b. Other pages: article body + transaction CTA
  const article = root.querySelector('#block-content > article.page-wrapper')
    || root.querySelector('article.page-wrapper')
    || root.querySelector('#block-content');
  if (article) {
    const cta = article.querySelector('.transaction-cta');
    if (cta) {
      if (hasContent(cta)) {
        // Move the CTA after the article body so it forms the final section.
        article.after(cta);
      } else {
        cta.remove();
      }
    }
    if (hasContent(article)) {
      result.push({ id: 'body', style: null, el: article });
    }
    if (cta && cta.isConnected && hasContent(cta)) {
      result.push({ id: 'transaction-cta', style: null, el: cta });
    }
  }
  return result;
}

export default function transform(hookName, element, payload) {
  const document = element.ownerDocument || element;
  const template = payload && payload.template;
  if (!template || !template.sections || template.sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    const sections = resolveSections(element, template);
    if (!sections.length) return;
    // Walk in reverse so earlier insertions don't shift later targets.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const { id, el, style } = sections[i];
      el.setAttribute(EL_MARK, id);
      el.setAttribute('data-excat-section-style', style || '');
      const hr = document.createElement('hr');
      hr.setAttribute(MARK, id);
      if (i === 0) hr.setAttribute('data-excat-section-first', 'true');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    const hrs = [...element.querySelectorAll(`hr[${MARK}]`)];
    // Styles were resolved in beforeTransform and stored on the section element;
    // fall back to the template style if a parser replaced the element.
    const tplSections = template.sections || [];
    for (let i = hrs.length - 1; i >= 0; i -= 1) {
      const hr = hrs[i];
      const id = hr.getAttribute(MARK);
      const el = element.querySelector(`[${EL_MARK}="${id}"]`);
      let style;
      if (el && el.hasAttribute('data-excat-section-style')) {
        style = el.getAttribute('data-excat-section-style') || null;
      } else {
        const tpl = tplSections.find((s) => s.id === id);
        style = tpl ? tpl.style : null;
      }
      if (style) {
        const meta = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style },
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
        el.removeAttribute('data-excat-section-style');
      }
      if (hr.hasAttribute('data-excat-section-first')) {
        hr.remove();
      } else {
        hr.removeAttribute(MARK);
      }
    }
  }
}
