export default function decorate(block) {
  const firstRow = block.firstElementChild;
  if (!firstRow) return;
  const cols = [...firstRow.children];
  block.classList.add(`columns-text-media-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pics = col.querySelectorAll('picture');
      if (!pics.length) {
        col.classList.add('columns-text-media-text-col');
        return;
      }
      // a column holding only image(s) is the media column; images inside
      // links (e.g. app store badges) stay part of the text column
      const onlyMedia = [...col.children].every((el) => el.tagName === 'PICTURE'
        || (el.tagName === 'P' && el.querySelector('picture') && !el.querySelector('a')
          && el.textContent.trim() === ''));
      col.classList.add(onlyMedia ? 'columns-text-media-img-col' : 'columns-text-media-text-col');
    });
  });
}
