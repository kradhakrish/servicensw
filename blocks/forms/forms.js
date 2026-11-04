/**
 * Returns the intended page URL. AEM can preserve an internal relative href
 * while the authored link text contains the full external EDS URL.
 * @param {HTMLAnchorElement} link authored page link
 * @returns {URL} page to embed
 */
function getPageUrl(link) {
  const authoredUrl = link.textContent.trim();
  if (/^https?:\/\//i.test(authoredUrl)) return new URL(authoredUrl);
  return new URL(link.href, window.location.href);
}

/**
 * Embeds an external EDS page authored in the Forms block.
 * @param {HTMLElement} block forms block
 */
export default function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;

  const pageUrl = getPageUrl(link);
  const frame = document.createElement('iframe');
  frame.className = 'forms-page';
  frame.src = pageUrl.href;
  frame.title = link.getAttribute('title') || link.textContent.trim() || 'Form';
  frame.loading = 'eager';

  block.replaceChildren(frame);
}
