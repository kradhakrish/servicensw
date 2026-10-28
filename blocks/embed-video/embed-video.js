/*
 * Embed Video Block
 * Responsive 16:9 Vimeo / YouTube player, lazy-loaded or click-to-play
 * behind an optional poster image.
 */

const frame = (src, title) => `<div class="embed-video-frame">
    <iframe src="${src}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      allowfullscreen title="${title}" loading="lazy"></iframe>
  </div>`;

/**
 * Vimeo: supports public (vimeo.com/123) and unlisted links with a
 * privacy hash (vimeo.com/123/abcdef or ?h=abcdef), plus player URLs.
 */
const embedVimeo = (url, autoplay) => {
  const parts = url.pathname.split('/').filter(Boolean);
  const idIndex = parts.findIndex((p) => /^\d+$/.test(p));
  const id = idIndex >= 0 ? parts[idIndex] : parts[0];
  const hash = url.searchParams.get('h') || (idIndex >= 0 ? parts[idIndex + 1] : '');
  const params = new URLSearchParams();
  if (hash && /^[a-z0-9]+$/i.test(hash)) params.set('h', hash);
  if (autoplay) {
    params.set('autoplay', '1');
    params.set('muted', '1');
  }
  const qs = params.toString();
  return frame(`https://player.vimeo.com/video/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`, 'Content from Vimeo');
};

const embedYoutube = (url, autoplay) => {
  let vid = url.searchParams.get('v') || '';
  if (url.hostname.includes('youtu.be')) [vid] = url.pathname.split('/').filter(Boolean);
  if (!vid && url.pathname.startsWith('/embed/')) [, , vid] = url.pathname.split('/');
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  return frame(`https://www.youtube.com/embed/${encodeURIComponent(vid || '')}?rel=0${suffix}`, 'Content from YouTube');
};

const EMBEDS = [
  { match: ['vimeo'], name: 'vimeo', render: embedVimeo },
  { match: ['youtube', 'youtu.be'], name: 'youtube', render: embedYoutube },
];

function loadEmbed(block, href, autoplay) {
  if (block.classList.contains('embed-video-is-loaded')) return;
  let url;
  try {
    url = new URL(href);
  } catch {
    return;
  }
  const config = EMBEDS.find((e) => e.match.some((m) => url.hostname.includes(m)));
  if (config) {
    block.innerHTML = config.render(url, autoplay);
    block.classList.add(`embed-video-${config.name}`);
  } else {
    block.innerHTML = frame(url.href, `Content from ${url.hostname}`);
  }
  block.classList.add('embed-video-is-loaded');
}

export default function decorate(block) {
  const placeholder = block.querySelector('picture');
  const anchor = block.querySelector('a[href]');
  // fall back to a plain-text URL if the author did not link it
  const text = block.textContent.trim().match(/https?:\/\/\S+/);
  const href = anchor ? anchor.href : (text && text[0]);
  if (!href) return;

  block.textContent = '';

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-video-placeholder';
    const play = document.createElement('div');
    play.className = 'embed-video-placeholder-play';
    const button = document.createElement('button');
    button.type = 'button';
    button.title = 'Play video';
    button.setAttribute('aria-label', 'Play video');
    play.append(button);
    wrapper.append(placeholder, play);
    wrapper.addEventListener('click', () => loadEmbed(block, href, true));
    block.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, href);
      }
    });
    observer.observe(block);
  }
}
