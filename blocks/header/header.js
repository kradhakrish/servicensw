// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA / EDS).
 * @returns {Promise<{html: string, url: URL}|null>} fragment markup and its URL
 */
async function fetchNav() {
  const paths = ['/content/nav.plain.html', '/nav.plain.html'];
  for (let i = 0; i < paths.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(paths[i]);
    if (resp.ok) {
      // eslint-disable-next-line no-await-in-loop
      return { html: await resp.text(), url: new URL(paths[i], window.location.href) };
    }
  }
  return null;
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
  root.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), base).href;
  });
}

/**
 * Turns decorative images (empty alt) into masked spans that follow the text colour.
 * @param {Element} root container
 */
function decorateIcons(root) {
  root.querySelectorAll('img[alt=""]').forEach((img) => {
    const icon = document.createElement('span');
    icon.className = 'nav-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.setProperty('--nav-icon', `url("${img.src}")`);
    const picture = img.closest('picture') || img;
    picture.replaceWith(icon);
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
 * Normalises a path for comparison (drops the local /content prefix and trailing slash).
 * @param {string} path pathname
 * @returns {string}
 */
function normalisePath(path) {
  return path.replace(/^\/content(?=\/|$)/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
}

/**
 * Marks the nav link for the current section.
 * @param {Element} list nav list
 */
function markActive(list) {
  const current = normalisePath(window.location.pathname);
  let best = null;
  list.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    const path = normalisePath(url.pathname);
    const match = path === '/' ? current === '/' : (current === path || current.startsWith(`${path}/`));
    if (match && (!best || path.length > best.path.length)) best = { a, path };
  });
  if (best) best.a.setAttribute('aria-current', 'page');
}

/**
 * Closes every open dropdown in the header.
 * @param {Element} header header element
 * @param {Element} [except] dropdown to keep open
 */
function closeDropdowns(header, except) {
  header.querySelectorAll('.nav-dropdown-toggle[aria-expanded="true"]').forEach((button) => {
    if (button !== except) button.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Builds a click-to-open dropdown from `li > p (label) + ul (items)`.
 * @param {Element} li list item holding the label and the sub list
 * @param {Element} header header element
 * @returns {Element} the dropdown element
 */
function buildDropdown(li, header) {
  const label = li.querySelector(':scope > p') || li.firstElementChild;
  const items = li.querySelector(':scope > ul');
  const dropdown = document.createElement('div');
  dropdown.className = 'nav-dropdown';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-dropdown-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-haspopup', 'true');
  button.append(...label.childNodes);
  const lastIcon = button.querySelector('.nav-icon:last-child');
  if (lastIcon && button.querySelectorAll('.nav-icon').length > 1) lastIcon.classList.add('nav-icon-chevron');

  const panelId = `nav-dropdown-${header.querySelectorAll('.nav-dropdown').length}`;
  items.id = panelId;
  items.className = 'nav-dropdown-panel';
  button.setAttribute('aria-controls', panelId);

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    closeDropdowns(header, button);
    button.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  dropdown.append(button, items);
  return dropdown;
}

/**
 * Language links (Google Translate URLs with a `tl` target) become menu buttons, as on the
 * source: choosing one opens the current page translated; the source language is a no-op.
 * @param {Element} dropdown language dropdown
 */
function decorateTranslateLinks(dropdown) {
  const panel = dropdown.querySelector('.nav-dropdown-panel');
  const toggle = dropdown.querySelector('.nav-dropdown-toggle');
  if (!panel) return;
  panel.setAttribute('role', 'menu');
  panel.querySelectorAll('a[href*="translate.google."]').forEach((a) => {
    const url = new URL(a.href);
    const lang = url.searchParams.get('tl');
    const source = url.searchParams.get('sl');
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'menuitem');
    button.dataset.language = lang;
    button.textContent = a.textContent;
    button.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      if (!lang || lang === source) return;
      url.searchParams.set('u', window.location.href);
      window.location.href = url.href;
    });
    a.parentElement.setAttribute('role', 'none');
    a.replaceWith(button);
  });
}

/**
 * Builds the search form from a link: href = action, text = label, icon = button icon.
 * @param {Element} section search section
 * @returns {Element|null} search form
 */
function buildSearch(section) {
  const link = section.querySelector('a[href]');
  if (!link) return null;
  const label = link.textContent.trim() || 'Search';
  const icon = link.querySelector('.nav-icon');

  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = link.href;
  form.method = 'get';

  const inputId = 'nav-search-input';
  const labelEl = document.createElement('label');
  labelEl.className = 'nav-visually-hidden';
  labelEl.htmlFor = inputId;
  labelEl.textContent = label;

  const input = document.createElement('input');
  input.type = 'search';
  input.id = inputId;
  input.name = 'q';
  input.placeholder = label;
  input.autocomplete = 'off';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.setAttribute('aria-label', label);
  if (icon) submit.append(icon);

  form.append(labelEl, input, submit);
  return form;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const nav = await fetchNav();
  if (!nav) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = nav.html;
  resolveImages(fragment, nav.url);
  decorateIcons(fragment);
  unbuttonize(fragment);

  const [brand, sections, search, utility] = [...fragment.children];
  const header = block.closest('header') || block;
  let skipLink = null;

  // utility bar (language selector, account links)
  const utilityBar = document.createElement('div');
  utilityBar.className = 'nav-utility';
  const utilityInner = document.createElement('div');
  utilityInner.className = 'nav-container';
  if (utility) {
    utility.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (li.querySelector(':scope > ul')) {
        const dropdown = buildDropdown(li, header);
        decorateTranslateLinks(dropdown);
        utilityInner.append(dropdown);
      }
    });
    const accountLinks = [];
    utility.querySelectorAll(':scope > p > a').forEach((a) => {
      if (a.getAttribute('href').startsWith('#')) {
        skipLink = a;
        skipLink.className = 'nav-skip-link';
      } else {
        a.className = 'nav-utility-link';
        accountLinks.push(a);
      }
    });
    if (accountLinks.length) {
      const accountNav = document.createElement('nav');
      accountNav.className = 'nav-account';
      accountNav.setAttribute('aria-label', 'Global header account menu');
      const list = document.createElement('ul');
      accountLinks.forEach((a) => {
        const li = document.createElement('li');
        li.append(a);
        list.append(li);
      });
      accountNav.append(list);
      utilityInner.append(accountNav);
    }
  }
  utilityBar.append(utilityInner);

  // the skip link targets the page's main element
  if (skipLink) {
    const main = document.querySelector('main');
    const target = skipLink.getAttribute('href').slice(1);
    if (main && target && !document.getElementById(target)) {
      main.id = target;
      main.tabIndex = -1;
    }
  }

  // main bar (brand, sections, search)
  const mainBar = document.createElement('div');
  mainBar.className = 'nav-main';
  mainBar.id = 'nav';
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-container';

  if (brand) {
    const brandLink = brand.querySelector('a');
    const brandEl = document.createElement('div');
    brandEl.className = 'nav-brand';
    if (brandLink) {
      const images = brandLink.querySelectorAll('img');
      const last = images[images.length - 1];
      if (last && last.alt) {
        const name = document.createElement('span');
        name.className = 'nav-visually-hidden';
        name.textContent = last.alt;
        brandLink.append(name);
      }
      images.forEach((img, i) => {
        if (i > 0) {
          const divider = document.createElement('span');
          divider.className = 'nav-brand-divider';
          divider.setAttribute('aria-hidden', 'true');
          img.before(divider);
        }
        img.alt = '';
        img.loading = 'eager';
      });
      brandEl.append(brandLink);
    }
    mainInner.append(brandEl);
  }

  if (sections) {
    const list = sections.querySelector('ul');
    if (list) {
      const sectionsNav = document.createElement('nav');
      sectionsNav.className = 'nav-sections-wrapper';
      sectionsNav.setAttribute('aria-label', 'Global header menu');
      list.className = 'nav-sections';
      markActive(list);
      sectionsNav.append(list);
      mainInner.append(sectionsNav);
    }
  }

  if (search) {
    const form = buildSearch(search);
    if (form) mainInner.append(form);
  }

  mainBar.append(mainInner);

  // close dropdowns on outside click and Escape
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) closeDropdowns(header);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = header.querySelector('.nav-dropdown-toggle[aria-expanded="true"]');
    if (open) {
      closeDropdowns(header);
      open.focus();
    }
  });
  isDesktop.addEventListener('change', () => closeDropdowns(header));

  block.textContent = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  if (skipLink) wrapper.append(skipLink);
  wrapper.append(utilityBar, mainBar);
  block.append(wrapper);
}
