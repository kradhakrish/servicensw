/* eslint-disable no-console */
/**
 * Re-hosts page images in Document Authoring.
 *
 * Imported pages reference images on www.service.nsw.gov.au, which refuses image requests
 * from other sites. This script downloads each image once, uploads it to DA under
 * /images/pages/, and rewrites the image URLs in content/*.plain.html to the DA copies.
 *
 * Usage (from the repo root):
 *   node tools/importer/rehost-images.mjs            # download + rewrite only (uses manifest)
 *   node tools/importer/rehost-images.mjs --upload   # also upload missing images to DA
 *
 * The manifest (tools/importer/image-manifest.json) maps source URL -> DA path, so re-running
 * after a re-import only rewrites pages and uploads images that are new.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';

const ORG = 'kradhakrish';
const REPO = 'servicensw';
const DA_FOLDER = 'images/pages';
const SOURCE_HOSTS = ['www.service.nsw.gov.au'];
const CONTENT_DIR = 'content';
const MANIFEST = 'tools/importer/image-manifest.json';
const CACHE_DIR = 'migration-work/rehosted-images';
const SKIP = new Set(['nav.plain.html', 'footer.plain.html']);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

const upload = process.argv.includes('--upload');

function listPages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'images' ? [] : listPages(p);
    return e.name.endsWith('.plain.html') && !SKIP.has(path.relative(CONTENT_DIR, p)) ? [p] : [];
  });
}

/** Detects the real image type from its bytes (the source mislabels some JPEGs as PNG). */
function sniffExt(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a') return 'png';
  if (buf.slice(0, 4).toString() === 'GIF8') return 'gif';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  if (/^\s*(<\?xml|<svg)/.test(buf.slice(0, 200).toString())) return 'svg';
  return null;
}

const MIME = {
  jpg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
};

function daName(url, ext) {
  const { pathname } = new URL(url);
  const stem = decodeURIComponent(path.basename(pathname)).replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'image';
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 8);
  return `${stem}-${hash}.${ext}`;
}

function curl(args) {
  return execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 50e6 });
}

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
fs.mkdirSync(CACHE_DIR, { recursive: true });

const pages = listPages(CONTENT_DIR);
const srcRe = /(<(?:img|source)\b[^>]*?\b(?:src|srcset)=")([^"]+)(")/g;
const urls = new Set();
pages.forEach((p) => {
  [...fs.readFileSync(p, 'utf8').matchAll(srcRe)].forEach((m) => {
    const u = m[2].replace(/&amp;/g, '&');
    try { if (SOURCE_HOSTS.includes(new URL(u).host)) urls.add(u); } catch { /* relative */ }
  });
});
console.log(`${pages.length} pages, ${urls.size} source images`);

let downloaded = 0;
let uploaded = 0;
const failures = [];
[...urls].forEach((u) => {
  let entry = manifest[u];
  if (!entry) {
    const tmp = path.join(CACHE_DIR, 'download.tmp');
    const code = curl(['-s', '-L', '-A', UA, '-H', 'Referer: https://www.service.nsw.gov.au/', '-o', tmp, '-w', '%{http_code}', u]);
    const buf = fs.existsSync(tmp) ? fs.readFileSync(tmp) : Buffer.alloc(0);
    const ext = sniffExt(buf);
    if (code !== '200' || !ext) {
      failures.push({ url: u, reason: `download ${code}, type ${ext}` });
      return;
    }
    const name = daName(u, ext);
    fs.renameSync(tmp, path.join(CACHE_DIR, name));
    entry = {
      daPath: `${DA_FOLDER}/${name}`, file: name, mime: MIME[ext], uploaded: false,
    };
    manifest[u] = entry;
    downloaded += 1;
  }
  if (upload && !entry.uploaded) {
    const file = path.join(CACHE_DIR, entry.file);
    const code = curl(['-s', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST', '-F', `data=@${file};type=${entry.mime}`,
      `https://admin.da.live/source/${ORG}/${REPO}/${entry.daPath}`]);
    if (code.startsWith('2')) {
      entry.uploaded = true;
      uploaded += 1;
    } else {
      failures.push({ url: u, reason: `upload ${code}` });
    }
  }
});
fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

// rewrite pages to the DA copies (only images that are in DA)
let rewrittenPages = 0;
pages.forEach((p) => {
  const html = fs.readFileSync(p, 'utf8');
  const next = html.replace(srcRe, (all, pre, src, post) => {
    const entry = manifest[src.replace(/&amp;/g, '&')];
    if (!entry || !entry.uploaded) return all;
    return `${pre}https://content.da.live/${ORG}/${REPO}/${entry.daPath}${post}`;
  });
  if (next !== html) {
    fs.writeFileSync(p, next);
    rewrittenPages += 1;
  }
});

console.log(`downloaded ${downloaded}, uploaded ${uploaded}, pages rewritten ${rewrittenPages}`);
if (failures.length) {
  console.log('failures:');
  failures.forEach((f) => console.log(`  ${f.reason}  ${f.url}`));
  process.exitCode = 1;
}
