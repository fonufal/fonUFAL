import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs';

const BASE = '/fonUFAL';

const posts = JSON.parse(readFileSync(new URL('./noticias-parsed.json', import.meta.url), 'utf-8'));
const urlToLocalRaw = JSON.parse(readFileSync(new URL('./url-to-local.json', import.meta.url), 'utf-8'));
const urlToLocal = Object.fromEntries(Object.entries(urlToLocalRaw).map(([k, v]) => [k, `${BASE}${v}`]));

const outDir = new URL('../src/content/blog/', import.meta.url);
mkdirSync(outDir, { recursive: true });

for (const f of readdirSync(outDir)) {
  if (f.endsWith('.md')) unlinkSync(new URL(f, outDir));
}

function toDescription(html) {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#8217;/g, '’').replace(/&#8211;/g, '–').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 160 ? text.slice(0, 157).trim() + '...' : text;
}

function yamlEscape(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

let written = 0;
for (const post of posts) {
  let content = post.content;
  content = content.replace(/https?:\/\/(www\.)?fale\.ufal\.br\/grupopesquisa\/fonufal\/?/g, 'https://fale.ufal.br/grupo/fonufal/');
  for (const [remote, local] of Object.entries(urlToLocal)) {
    const normalized = remote.replace(/^https?:\/\/(www\.)?fale\.ufal\.br\/grupopesquisa\/fonufal\//, 'https://fale.ufal.br/grupo/fonufal/');
    content = content.split(normalized).join(local);
  }
  // any <img> still pointing at the live site 404'd during download and has no local file — drop it
  content = content.replace(/<img[^>]*src="https:\/\/fale\.ufal\.br\/grupo\/fonufal\/wp-content\/uploads\/[^"]*"[^>]*>/g, '');
  // WordPress's emoji shim: swap the hotlinked s.w.org glyph image for the plain character it represents
  content = content.replace(/<img[^>]*class="wp-smiley"[^>]*alt="([^"]*)"[^>]*>/g, '$1');
  content = content.replace(/<img[^>]*alt="([^"]*)"[^>]*class="wp-smiley"[^>]*>/g, '$1');
  content = content
    .replace(/\s+srcset="[^"]*"/g, '')
    .replace(/\s+sizes="[^"]*"/g, '');
  const pubDate = new Date(post.pubDate).toISOString().slice(0, 10);
  const description = toDescription(post.content);
  const tags = [...new Set(post.categories.map(c => c.toLowerCase()))];

  const frontmatter = [
    '---',
    `title: "${yamlEscape(post.title)}"`,
    `description: "${yamlEscape(description)}"`,
    `pubDate: ${pubDate}`,
    `originalUrl: "${post.link}"`,
    `tags: [${tags.map(t => `"${yamlEscape(t)}"`).join(', ')}]`,
    '---',
    '',
    content,
    '',
  ].join('\n');

  writeFileSync(new URL(`${post.slug}.md`, outDir), frontmatter);
  written++;
}

console.log(`Wrote ${written} blog posts`);
