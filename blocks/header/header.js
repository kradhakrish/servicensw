// desktop layout from 1024px, as on the source site
const isDesktop = window.matchMedia('(width >= 1024px)');

/**
 * Fetches the nav fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA / EDS).
 * @returns {Promise<{html: string, url: URL}|null>} fragment markup and its URL
 */
async function fetchNav() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let path = '/content/nav.plain.html';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    path = '/nav.plain.html';
    resp = await fetch('/nav.plain.html');
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

  const panelId = `nav-dropdown-${header.querySelectorAll('.nav-dropdown').length}-${Math.random().toString(36).slice(2, 7)}`;
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
 * @param {string} inputId id for the search input
 * @returns {Element|null} search form
 */
function buildSearch(section, inputId) {
  const link = section.querySelector('a[href]');
  if (!link) return null;
  const label = link.textContent.trim() || 'Search';
  const icon = link.querySelector('.nav-icon');

  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = link.href;
  form.method = 'get';

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
 * Builds the logo link: images separated by a divider, name kept as hidden text.
 * @param {Element} section brand section
 * @returns {Element} brand element
 */
function buildBrand(section) {
  const brandEl = document.createElement('div');
  brandEl.className = 'nav-brand';
  const brandLink = section.querySelector('a');
  if (!brandLink) return brandEl;
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
  return brandEl;
}

/**
 * Builds the main nav list (current section marked) inside a labelled nav.
 * @param {Element} section sections section
 * @param {string} className nav class name
 * @returns {{nav: Element, list: Element}|null}
 */
function buildSections(section, className) {
  const list = section.querySelector('ul');
  if (!list) return null;
  const nav = document.createElement('nav');
  nav.className = className;
  nav.setAttribute('aria-label', 'Global header menu');
  list.className = 'nav-sections';
  markActive(list);
  nav.append(list);
  return { nav, list };
}

/**
 * Reads the utility section: dropdowns, account links and the skip link.
 * @param {Element} section utility section
 * @param {Element} header header element
 * @returns {{dropdowns: Element[], links: Element[], skipLink: Element|null}}
 */
function readUtility(section, header) {
  const result = { dropdowns: [], links: [], skipLink: null };
  if (!section) return result;
  section.querySelectorAll(':scope > ul > li').forEach((li) => {
    if (li.querySelector(':scope > ul')) {
      const dropdown = buildDropdown(li, header);
      decorateTranslateLinks(dropdown);
      result.dropdowns.push(dropdown);
    }
  });
  section.querySelectorAll(':scope > p > a').forEach((a) => {
    if (a.getAttribute('href').startsWith('#')) {
      a.className = 'nav-skip-link';
      result.skipLink = a;
    } else {
      a.className = 'nav-utility-link';
      result.links.push(a);
    }
  });
  return result;
}

/**
 * Creates a mobile bar button with an icon and a small label.
 * @param {string} className button class
 * @param {string} label visible label
 * @param {string} controls id of the controlled element
 * @returns {Element} button
 */
function barButton(className, label, controls) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-controls', controls);
  button.setAttribute('aria-expanded', 'false');
  button.textContent = label;
  return button;
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
  // the mobile drawer and search panel are built from their own copy of the content
  const mobileCopy = fragment.cloneNode(true);

  const header = block.closest('header') || block;
  const [brand, sections, search, utility] = [...fragment.children];
  const [, mSections, mSearch, mUtility] = [...mobileCopy.children];

  // utility bar (desktop): language selector, account links
  const utilityBar = document.createElement('div');
  utilityBar.className = 'nav-utility';
  const utilityInner = document.createElement('div');
  utilityInner.className = 'nav-container';
  const util = readUtility(utility, header);
  utilityInner.append(...util.dropdowns);
  if (util.links.length) {
    const accountNav = document.createElement('nav');
    accountNav.className = 'nav-account';
    accountNav.setAttribute('aria-label', 'Global header account menu');
    const list = document.createElement('ul');
    util.links.forEach((a) => {
      const li = document.createElement('li');
      li.append(a);
      list.append(li);
    });
    accountNav.append(list);
    utilityInner.append(accountNav);
  }
  utilityBar.append(utilityInner);

  // the skip link targets the page's main element
  if (util.skipLink) {
    const main = document.querySelector('main');
    const target = util.skipLink.getAttribute('href').slice(1);
    if (main && target && !document.getElementById(target)) {
      main.id = target;
      main.tabIndex = -1;
    }
  }

  // main bar: brand, sections, search (desktop) + menu / search buttons (mobile)
  const mainBar = document.createElement('div');
  mainBar.className = 'nav-main';
  mainBar.id = 'nav';
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-container';

  const menuButton = barButton('nav-menu-button nav-hamburger-button', 'Menu', 'nav-drawer');
  const searchButton = barButton('nav-search-button', (search && search.textContent.trim()) || 'Search', 'nav-search-panel');
  mainInner.append(menuButton);
  if (brand) mainInner.append(buildBrand(brand));
  if (sections) {
    const built = buildSections(sections, 'nav-sections-wrapper');
    if (built) mainInner.append(built.nav);
  }
  if (search) {
    const form = buildSearch(search, 'nav-search-input');
    if (form) mainInner.append(form);
  }
  mainInner.append(searchButton);
  mainBar.append(mainInner);

  // mobile drawer: sections, account links and the language selector in one list
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.id = 'nav-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', menuButton.textContent);
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'nav-drawer-close';
  closeButton.setAttribute('aria-label', 'Close dialog');
  drawer.append(closeButton);
  if (mSections) {
    const built = buildSections(mSections, 'nav-drawer-nav');
    if (built) {
      const mUtil = readUtility(mUtility, header);
      mUtil.links.forEach((a) => {
        const li = document.createElement('li');
        li.append(a);
        built.list.append(li);
      });
      mUtil.dropdowns.forEach((dropdown) => {
        const li = document.createElement('li');
        li.append(dropdown);
        built.list.append(li);
      });
      drawer.append(built.nav);
    }
  }

  // mobile search panel
  const searchPanel = document.createElement('div');
  searchPanel.className = 'nav-search-panel';
  searchPanel.id = 'nav-search-panel';
  if (mSearch) {
    const form = buildSearch(mSearch, 'nav-search-input-mobile');
    if (form) searchPanel.append(form);
  }

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';

  /**
   * Opens or closes a mobile panel ('menu' or 'search').
   * @param {string|null} panel panel to open, or null to close all
   */
  const setMobilePanel = (panel) => {
    const menuOpen = panel === 'menu';
    const searchOpen = panel === 'search';
    wrapper.classList.toggle('is-menu-open', menuOpen);
    wrapper.classList.toggle('is-search-open', searchOpen);
    menuButton.setAttribute('aria-expanded', String(menuOpen));
    searchButton.setAttribute('aria-expanded', String(searchOpen));
    document.body.style.overflowY = menuOpen ? 'hidden' : '';
    if (menuOpen) {
      window.scrollTo(0, 0);
      closeButton.focus();
    }
    if (searchOpen) {
      window.scrollTo(0, 0);
      const input = searchPanel.querySelector('input');
      if (input) input.focus();
    }
    if (!panel) closeDropdowns(header);
  };

  menuButton.addEventListener('click', () => setMobilePanel(wrapper.classList.contains('is-menu-open') ? null : 'menu'));
  searchButton.addEventListener('click', () => setMobilePanel(wrapper.classList.contains('is-search-open') ? null : 'search'));
  closeButton.addEventListener('click', () => {
    setMobilePanel(null);
    menuButton.focus();
  });

  // close dropdowns on outside click; Escape closes dropdowns, then mobile panels
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) closeDropdowns(header);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = header.querySelector('.nav-dropdown-toggle[aria-expanded="true"]');
    if (open) {
      closeDropdowns(header);
      open.focus();
    } else if (wrapper.classList.contains('is-menu-open') || wrapper.classList.contains('is-search-open')) {
      const trigger = wrapper.classList.contains('is-menu-open') ? menuButton : searchButton;
      setMobilePanel(null);
      trigger.focus();
    }
  });

  // crossing the breakpoint resets every open panel
  isDesktop.addEventListener('change', () => {
    setMobilePanel(null);
    closeDropdowns(header);
  });

  block.textContent = '';
  if (util.skipLink) wrapper.append(util.skipLink);
  wrapper.append(utilityBar, mainBar, drawer, searchPanel, overlay);
  block.append(wrapper);
}
