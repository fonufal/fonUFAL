import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, extname } from 'path';

const members = JSON.parse(readFileSync(new URL('./membros-parsed.json', import.meta.url), 'utf-8'));

const outDir = new URL('../public/team/', import.meta.url);
mkdirSync(outDir, { recursive: true });

function slugify(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const results = [];
let ok = 0, fail = 0;

for (const m of members) {
  const slug = slugify(m.name);
  const ext = (extname(new URL(m.photo).pathname) || '.jpg').toLowerCase();
  const filename = `${slug}${ext}`;
  const outPath = new URL(filename, outDir);
  try {
    const res = await fetch(m.photo, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(outPath, buf);
    ok++;
    results.push({ ...m, id: slug, photoFile: `/team/${filename}` });
  } catch (e) {
    fail++;
    console.error(`FAILED ${m.name}: ${e.message}`);
    results.push({ ...m, id: slug, photoFile: null });
  }
}

console.log(`Downloaded ${ok} photos, ${fail} failed`);
writeFileSync(new URL('./membros-final.json', import.meta.url), JSON.stringify(results, null, 2));
