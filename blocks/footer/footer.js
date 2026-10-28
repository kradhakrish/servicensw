// desktop layout from 1024px, as on the source site
const isDesktop = window.matchMedia('(width >= 1024px)');

/**
 * Normalises a path for comparison (drops the local /content prefix and trailing slash).
 * @param {string} path pathname
 * @returns {string}
 */
function normalisePath(path) {
  return path.replace(/^\/content(?=\/|$)/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
}

/**
 * Marks the link to the current page (matched by path, as the source site links absolutely).
 * @param {Element} list link list
 */
function markCurrent(list) {
  const current = normalisePath(window.location.pathname);
  list.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href, window.location.href);
    if (!url.protocol.startsWith('http')) return;
    if (normalisePath(url.pathname) === current) a.setAttribute('aria-current', 'page');
  });
}

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
 * Creates a labelled nav landmark.
 * @param {string} className nav class
 * @param {string} label accessible name
 * @param {Node[]} nodes content
 * @returns {Element} nav
 */
function labelledNav(className, label, nodes) {
  const nav = document.createElement('nav');
  nav.className = className;
  nav.setAttribute('aria-label', label);
  nav.append(...nodes);
  return nav;
}

/**
 * Icon links (image + text): the image becomes a CSS-painted icon (as on the source) and the
 * text stays for screen readers only.
 * @param {Element} list list of icon links
 */
function decorateIconLinks(list) {
  list.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    if (!img) return;
    const label = a.textContent.trim();
    const icon = document.createElement('span');
    icon.className = 'footer-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.setProperty('--footer-icon', `url("${img.src}")`);
    const text = document.createElement('span');
    text.className = 'footer-visually-hidden';
    text.textContent = label;
    a.replaceChildren(icon, text);
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
    const columns = buildColumns(links);
    const primary = labelledNav('footer-primary', 'Global footer primary menu', [columns]);
    const mobileList = mobile && mobile.querySelector('ul');
    if (mobileList) {
      mobileList.className = 'footer-mobile-links';
      markCurrent(mobileList);
      primary.append(mobileList);
    }
    bands.push(band('footer-main', [primary]));

    // social icons sit under the last column on desktop and under the mobile list otherwise
    const social = columns.querySelector('.footer-social');
    const lastColumn = columns.querySelector('.footer-column:last-of-type');
    if (social && lastColumn && mobileList) {
      const placeSocial = () => {
        if (isDesktop.matches) lastColumn.append(social);
        else mobileList.after(social);
      };
      placeSocial();
      isDesktop.addEventListener('change', placeSocial);
    }
  }
  if (legal) {
    const list = legal.querySelector('ul');
    if (list) {
      list.className = 'footer-legal';
      bands.push(band('footer-bottom', [labelledNav('footer-secondary', 'Global footer secondary menu', [list])]));
    }
  }

  block.textContent = '';
  block.append(...bands);
}
