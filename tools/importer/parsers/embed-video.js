/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-video.
 * Source: iframe.media-oembed-content whose src is a Drupal oembed proxy
 * (/media/oembed?url=<encoded video url>&...). Cell: link to the real video URL.
 */
export default function parse(element, { document }) {
  const cells = [];
  const iframe = element.tagName === 'IFRAME' ? element : element.querySelector('iframe');
  const src = iframe ? (iframe.getAttribute('src') || iframe.getAttribute('data-src') || '') : '';

  let videoUrl = '';
  try {
    const u = new URL(src, 'https://www.service.nsw.gov.au');
    const proxied = u.searchParams.get('url');
    videoUrl = proxied || u.href;
  } catch (e) {
    const m = src.match(/[?&]url=([^&]+)/);
    videoUrl = m ? decodeURIComponent(m[1]) : src;
  }
  if (videoUrl && videoUrl.startsWith('//')) videoUrl = `https:${videoUrl}`;
  if (videoUrl && !/^https?:/i.test(videoUrl) && /^(www\.)?(vimeo|youtube|youtu\.be)/i.test(videoUrl)) {
    videoUrl = `https://${videoUrl}`;
  }

  if (videoUrl) {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = videoUrl;
    cells.push([a]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
