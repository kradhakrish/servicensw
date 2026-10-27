/* eslint-disable */
/* global WebImporter */

/**
 * Service NSW cleanup transformer.
 * Removes global chrome and page utilities (header, breadcrumb, ReadSpeaker,
 * TOC, sticky nav, back-to-top, social sharing, feedback form, footer, chat)
 * while keeping page header H1 + intro, notices, body and transaction CTA.
 */

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => el.remove());
  });
}

function hasContent(el) {
  if (!el) return false;
  if (el.textContent.replace(/ /g, ' ').trim()) return true;
  return !!el.querySelector('img, picture, video, iframe');
}

export default function transform(hookName, element, payload) {
  const document = element.ownerDocument || element;

  if (hookName === 'beforeTransform') {
    // Capture "Last published" date before removing the widget.
    const lastUpdated = element.querySelector('.last-updated');
    if (lastUpdated) {
      const match = lastUpdated.textContent.match(/Last published:\s*(.+)/i);
      const date = match ? match[1].trim() : '';
      if (date && document.head && !document.head.querySelector('meta[name="last-published"]')) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'last-published');
        meta.setAttribute('content', date);
        document.head.append(meta);
      }
    }

    // ReadSpeaker / font-size controls: main > div.container wrapping .page-control
    element.querySelectorAll('.page-control').forEach((pc) => {
      const wrapper = pc.parentElement;
      if (wrapper && wrapper.matches('div.container') && wrapper.parentElement
        && wrapper.parentElement.matches('main')) {
        wrapper.remove();
      } else {
        pc.remove();
      }
    });

    // Transaction CTA: keep only the primary button link as default content.
    element.querySelectorAll('.transaction-cta').forEach((cta) => {
      const btn = cta.querySelector('a.button--primary');
      if (!btn) {
        cta.remove();
        return;
      }
      const p = document.createElement('p');
      p.append(btn);
      cta.replaceChildren(p);
    });

    // Tracking / third-party iframes (keep oEmbed video iframes for parsers).
    element.querySelectorAll('iframe').forEach((iframe) => {
      const src = iframe.getAttribute('src') || '';
      if (iframe.classList.contains('media-oembed-content')
        || /vimeo\.com|youtube\.com|youtu\.be|\/media\/oembed/i.test(src)) return;
      iframe.remove();
    });

    removeAll(element, [
      // Global chrome
      '#block-sitewidenotice',
      '#global-header',
      'a[class*="SkipToContent"]',
      'header[class*="GlobalHeader"]',
      '#global-footer',
      'footer[class*="GlobalFooter"]',
      '#drupal-live-announce',
      // Page utilities
      'nav.breadcrumb',
      '.print-logo',
      '#block-openreadspeakerblock',
      '#block-fontresizeblock',
      'nav.toc',
      '#toc',
      '#block-content > div.sticky-nav',
      '.sticky-nav',
      'nav#stickyNav',
      '.back-to-top',
      '#back-to-top',
      '.last-updated',
      '#socialSharing',
      '#block-snswcustomersatisfactionform',
      // Chat widget
      '#coai-webchat',
      '[id^="coai-"]',
      // Tracking pixels
      'img[width="1"][height="1"]',
      // Non-authorable
      'script',
      'style',
      'noscript',
      'link',
    ]);

    // Empty notices wrappers
    element.querySelectorAll('#notices-container').forEach((nc) => {
      if (!hasContent(nc)) nc.remove();
    });
    element.querySelectorAll('div.page-notices').forEach((pn) => {
      if (!hasContent(pn)) pn.remove();
    });
    element.querySelectorAll('div.page-notices div.hidden').forEach((h) => {
      if (!hasContent(h)) h.remove();
    });

    // Containers emptied by the removals above (e.g. last-updated/social wrapper)
    element.querySelectorAll('article.page-wrapper > div.container').forEach((c) => {
      if (!hasContent(c)) c.remove();
    });
  }

  if (hookName === 'afterTransform') {
    removeAll(element, ['script', 'style', 'noscript', 'link']);
    // Tracking attributes (do not touch data-excat-* used by the sections transformer)
    element.querySelectorAll('[data-rsevent-id], [onclick]').forEach((el) => {
      el.removeAttribute('data-rsevent-id');
      el.removeAttribute('onclick');
    });
    if (element.hasAttribute && element.hasAttribute('data-rsevent-id')) {
      element.removeAttribute('data-rsevent-id');
    }
    // Decorative inline-SVG backgrounds (e.g. the notice info icon) would otherwise be
    // turned into broken data: images by WebImporter.rules.transformBackgroundImages.
    element.querySelectorAll('[style*="background-image"]').forEach((el) => {
      if (/url\(\s*["']?data:/i.test(el.getAttribute('style') || '')) {
        el.style.removeProperty('background-image');
      }
    });
    element.querySelectorAll('img[src^="data:"]').forEach((img) => {
      const wrapper = img.closest('picture') || img;
      const p = wrapper.parentElement;
      wrapper.remove();
      if (p && p.tagName === 'P' && !p.textContent.trim() && !p.children.length) p.remove();
    });
  }
}
