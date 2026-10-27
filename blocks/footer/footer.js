/**
 * Fetches the footer fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA / EDS).
 * @returns {Promise<{html: string, url: URL}|null>} fragment markup and its URL
 */
async function fetchFooter() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let path = '/content/footer.plain.html';
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    path = '/footer.plain.html';
    resp = await fetch('/footer.plain.html');
  }
  if (!resp.ok) return null;
  return { html: await resp.text(), url: new URL(path, window.location.href) };
}

/**
 * Resolves relative image paths against the fragment URL, so they work on nested pages.
 * @param {Element} root fragment root
 * @param {URL} base fragment URL
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
}

/**
 * Removes EDS button decoration that may have been added to links.
 * @param {Element} root container
 */
function unbuttonize(root) {
  root.querySelectorAll('.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
  root.querySelectorAll('.button-container, .button-wrapper').forEach((p) => p.classList.remove('button-container', 'button-wrapper'));
}

/**
 * Wraps a section's content in a full-width band with a centred container.
 * @param {string} className band class
 * @param {Node[]} nodes content
 * @returns {Element} band
 */
function band(className, nodes) {
  const outer = document.createElement('div');
  outer.className = className;
  const inner = document.createElement('div');
  inner.className = 'footer-container';
  inner.append(...nodes);
  outer.append(inner);
  return outer;
}

/**
 * Icon links (image + text) keep the text for screen readers only.
 * @param {Element} list list of icon links
 */
function decorateIconLinks(list) {
  list.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    if (!img) return;
    const label = a.textContent.trim();
    const text = document.createElement('span');
    text.className = 'footer-visually-hidden';
    text.textContent = label;
    img.alt = '';
    img.loading = 'lazy';
    a.replaceChildren(img, text);
  });
}

/**
 * Groups `h2 + ul` pairs into columns; an image-link list joins the last column.
 * @param {Element} section link section
 * @returns {Element} columns element
 */
function buildColumns(section) {
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  let column = null;
  [...section.children].forEach((el) => {
    if (el.tagName === 'H2') {
      column = document.createElement('div');
      column.className = 'footer-column';
      columns.append(column);
      column.append(el);
    } else if (el.tagName === 'UL' && el.querySelector('img')) {
      el.className = 'footer-social';
      decorateIconLinks(el);
      (column || columns).append(el);
    } else if (column) {
      if (el.tagName === 'UL') el.className = 'footer-links';
      column.append(el);
    }
  });
  return columns;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footer = await fetchFooter();
  if (!footer) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = footer.html;
  resolveImages(fragment, footer.url);
  unbuttonize(fragment);

  const [ack, links, legal, mobile] = [...fragment.children];
  const bands = [];

  if (ack) bands.push(band('footer-ack', [...ack.childNodes]));
  if (links) {
    const parts = [buildColumns(links)];
    if (mobile) {
      const list = mobile.querySelector('ul');
      if (list) {
        list.className = 'footer-mobile-links';
        parts.push(list);
      }
    }
    bands.push(band('footer-main', parts));
  }
  if (legal) {
    const list = legal.querySelector('ul');
    if (list) list.className = 'footer-legal';
    bands.push(band('footer-bottom', [...legal.childNodes]));
  }

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.className = 'footer-wrapper-nav';
  nav.setAttribute('aria-label', 'Global footer');
  nav.append(...bands);
  block.append(nav);
}
