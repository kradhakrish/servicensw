/*
 * Accordion Transcript Block
 * Collapsible panel(s): a single "Transcript" item under a video, or a run of
 * content accordions (source .accordion__group with an "Expand all" control).
 */

const EXPAND_RE = /^(expand|collapse) all$/i;

function isTranscript(block, labels) {
  const prev = block.parentElement?.previousElementSibling;
  if (prev?.classList.contains('embed-video-wrapper')) return true;
  return labels.length > 0 && labels.every((l) => /transcript/i.test(l));
}

// blocks in the same run of adjacent accordion-transcript wrappers
function getRun(wrapper) {
  const run = [wrapper];
  let next = wrapper.nextElementSibling;
  while (next?.classList.contains('accordion-transcript-wrapper')) {
    run.push(next);
    next = next.nextElementSibling;
  }
  return run;
}

// turn an authored "Expand all" paragraph just before the run into a real control
function addExpandAll(block) {
  const wrapper = block.parentElement;
  if (!wrapper?.classList.contains('accordion-transcript-wrapper')) return;
  const prev = wrapper.previousElementSibling;
  if (!prev?.classList.contains('default-content-wrapper')) return;
  const para = prev.lastElementChild;
  if (!para || para.tagName !== 'P' || !EXPAND_RE.test(para.textContent.trim())) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'accordion-transcript-expand-all';
  button.textContent = 'Expand all';
  button.setAttribute('aria-expanded', 'false');

  const controls = document.createElement('div');
  controls.className = 'accordion-transcript-controls';
  controls.append(button);
  block.prepend(controls);

  para.remove();
  if (!prev.children.length) prev.remove();

  const items = () => getRun(wrapper).flatMap((w) => [...w.querySelectorAll('details.accordion-transcript-item')]);
  const sync = () => {
    const all = items();
    const open = all.length > 0 && all.every((d) => d.open);
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? 'Collapse all' : 'Expand all';
  };

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    items().forEach((d) => { d.open = open; });
    sync();
  });

  // toggle events do not bubble; listen in the capture phase on the section
  (wrapper.parentElement || wrapper).addEventListener('toggle', (e) => {
    if (e.target.classList?.contains('accordion-transcript-item')) sync();
  }, true);
}

export default function decorate(block) {
  const labels = [];
  [...block.children].forEach((row) => {
    const [label, ...rest] = [...row.children];
    if (!label) {
      row.remove();
      return;
    }

    const summary = document.createElement('summary');
    summary.className = 'accordion-transcript-item-label';
    summary.append(...label.childNodes);
    if (!summary.textContent.trim()) summary.textContent = 'Transcript';
    labels.push(summary.textContent.trim());

    // tolerate missing or extra body cells
    const body = document.createElement('div');
    body.className = 'accordion-transcript-item-body';
    rest.forEach((cell) => body.append(...cell.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-transcript-item';
    details.append(summary, body);
    row.replaceWith(details);
  });

  // content accordions (not a video transcript) use heading-size labels
  if (!block.classList.contains('transcript') && !isTranscript(block, labels)) {
    block.classList.add('heading');
  }

  addExpandAll(block);
}
