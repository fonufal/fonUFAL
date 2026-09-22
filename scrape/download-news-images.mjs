import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { extname } from 'path';

const posts = JSON.parse(readFileSync(new URL('./noticias-parsed.json', import.meta.url), 'utf-8'));
const outDir = new URL('../public/noticias/', import.meta.url);
mkdirSync(outDir, { recursive: true });

function normalizeUrl(src) {
  return src.replace(/^https?:\/\/(www\.)?fale\.ufal\.br\/grupopesquisa\/fonufal\//, 'https://fale.ufal.br/grupo/fonufal/');
}

function isRealImage(buf) {
  if (buf.length < 8) return false;
  const sig = buf.subarray(0, 4);
  if (sig[0] === 0xff && sig[1] === 0xd8) return true; // JPEG
  if (sig[0] === 0x89 && sig[1] === 0x50) return true; // PNG
  if (sig.toString('ascii', 0, 3) === 'GIF') return true; // GIF
  if (buf.toString('ascii', 8, 12) === 'WEBP') return true; // WEBP
  return false;
}

let ok = 0, fail = 0;
const urlToLocal = new Map();

for (const post of posts) {
  for (let i = 0; i < post.images.length; i++) {
    const src = normalizeUrl(post.images[i]);
    if (urlToLocal.has(src)) continue;
    try {
      const u = new URL(src);
      let ext = (extname(u.pathname) || '.jpg').toLowerCase().split('?')[0];
      if (!/^\.(jpe?g|png|gif|webp)$/.test(ext)) ext = '.jpg';
      const filename = `${post.slug}-${i + 1}${ext}`;
      const res = await fetch(src, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!isRealImage(buf)) throw new Error('response is not a real image (likely a soft-404 HTML page)');
      writeFileSync(new URL(filename, outDir), buf);
      urlToLocal.set(post.images[i], `/noticias/${filename}`);
      ok++;
    } catch (e) {
      console.error(`FAILED ${src}: ${e.message}`);
      fail++;
    }
  }
}

console.log(`Downloaded ${ok} images, ${fail} failed`);
writeFileSync(new URL('./url-to-local.json', import.meta.url), JSON.stringify(Object.fromEntries(urlToLocal), null, 2));
