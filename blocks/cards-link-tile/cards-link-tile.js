/**
 * Makes the whole card clickable through a single primary link.
 * The heading carries the link (stretched over the card by CSS); a
 * standalone link paragraph that only repeats the target is removed.
 * @param {Element} body The card body element
 */
function linkCard(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  const links = [...body.querySelectorAll('a[href]')];
  if (!links.length) return;

  const headingLink = heading ? heading.querySelector('a[href]') : null;
  const primary = headingLink || links[links.length - 1];

  if (heading && !headingLink) {
    const a = document.createElement('a');
    a.href = primary.href;
    a.append(...heading.childNodes);
    heading.append(a);
    const p = primary.closest('p');
    if (p && p.textContent.trim() === primary.textContent.trim()) p.remove();
    a.classList.add('cards-link-tile-link');
  } else {
    primary.classList.add('cards-link-tile-link');
    primary.classList.remove('button', 'primary', 'secondary', 'accent');
    const wrapper = primary.closest('.button-container');
    if (wrapper) wrapper.classList.remove('button-container');
  }

  const arrow = document.createElement('span');
  arrow.className = 'cards-link-tile-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  body.append(arrow);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children]
      .filter((cell) => cell.textContent.trim() || cell.children.length);
    if (!cells.length) return;
    const li = document.createElement('li');
    const body = document.createElement('div');
    body.className = 'cards-link-tile-card-body';
    // tolerate authors splitting content over several cells
    cells.forEach((cell) => body.append(...cell.childNodes));
    li.append(body);
    linkCard(body);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
