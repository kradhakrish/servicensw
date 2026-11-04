import {
  decorateBlocks,
  decorateSections,
  loadSections,
} from '../../scripts/aem.js';

/**
 * Returns the intended page URL. AEM can preserve an internal relative href
 * while the authored link text contains the full external EDS URL.
 * @param {HTMLAnchorElement} link authored page link
 * @returns {URL} page to consume
 */
function getPageUrl(link) {
  const authoredUrl = link.textContent.trim();
  if (/^https?:\/\//i.test(authoredUrl)) return new URL(authoredUrl);
  return new URL(link.href, window.location.href);
}

/**
 * Fetches the plain HTML representation of an EDS page.
 * @param {URL} pageUrl EDS page URL
 * @returns {Promise<HTMLElement>} detached main element
 */
async function fetchMain(pageUrl) {
  const plainUrl = new URL(pageUrl);
  plainUrl.pathname = `${plainUrl.pathname
    .replace(/(\.plain)?\.html$/, '')
    .replace(/\/$/, '')}.plain.html`;

  const response = await fetch(plainUrl);
  if (!response.ok) {
    throw new Error(`Unable to load form content (${response.status})`);
  }

  const main = document.createElement('main');
  main.innerHTML = await response.text();
  return main;
}

/**
 * Resolves an embed-adaptive-form page to its underlying form page.
 * @param {HTMLElement} main detached page content
 * @param {URL} sourceUrl source page URL
 * @returns {Promise<HTMLElement>} detached form page content
 */
async function resolveFormMain(main, sourceUrl) {
  const embeddedForm = main.querySelector('.embed-adaptive-form a[href]');
  if (!embeddedForm) return main;

  const formUrl = new URL(embeddedForm.getAttribute('href'), sourceUrl);
  return fetchMain(formUrl);
}

/**
 * Consumes only the main form content from an external EDS page.
 * @param {HTMLElement} block forms block
 */
export default async function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;

  try {
    const pageUrl = getPageUrl(link);
    const pageMain = await fetchMain(pageUrl);
    const formMain = await resolveFormMain(pageMain, pageUrl);

    decorateSections(formMain);
    decorateBlocks(formMain);
    await loadSections(formMain);

    const formBlock = formMain.querySelector('.form.block');
    if (!formBlock) throw new Error('The remote page does not contain a form block');

    block.replaceChildren(formBlock);
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'forms-error';
    message.setAttribute('role', 'alert');
    message.textContent = 'The form could not be loaded. Please try again later.';
    block.replaceChildren(message);
    // eslint-disable-next-line no-console
    console.error('Failed to load external form content', error);
  }
}
