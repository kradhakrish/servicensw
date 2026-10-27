/*
 * Accordion Transcript Block
 * Collapsible panel(s), typically a single "Transcript" item under a video.
 */

export default function decorate(block) {
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

    // tolerate missing or extra body cells
    const body = document.createElement('div');
    body.className = 'accordion-transcript-item-body';
    rest.forEach((cell) => body.append(...cell.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-transcript-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
