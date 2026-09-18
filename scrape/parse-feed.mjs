import { readFileSync, writeFileSync } from 'fs';

function decodeEntities(str) {
  return str
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function slugify(str) {
  return str
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const posts = [];
const seen = new Set();

for (let p = 1; p <= 6; p++) {
  const xml = readFileSync(new URL(`./feed-p${p}.xml`, import.meta.url), 'utf-8');
  const items = xml.split('<item>').slice(1).map(s => s.split('</item>')[0]);
  for (const item of items) {
    const title = decodeEntities((item.match(/<title>([\s\S]*?)<\/title>/) || [,''])[1]).trim();
    const link = (item.match(/<link>([\s\S]*?)<\/link>/) || [,''])[1].trim();
    const pIdMatch = link.match(/[?&]p=(\d+)/);
    const id = pIdMatch ? pIdMatch[1] : slugify(title);
    if (seen.has(id)) continue;
    seen.add(id);
    const pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [,''])[1].trim();
    const categories = [...item.matchAll(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g)].map(m => m[1]);
    const contentMatch = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
    const content = contentMatch ? contentMatch[1].trim() : '';
    // real photos: exclude wp smiley emoji icons
    const images = [...content.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/g)]
      .map(m => m[1])
      .filter(src => !src.includes('s.w.org/images/core/emoji'));
    posts.push({ id, slug: slugify(title), title, link, pubDate, categories, content, images });
  }
}

posts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

const slugCounts = {};
for (const post of posts) {
  slugCounts[post.slug] = (slugCounts[post.slug] || 0) + 1;
  if (slugCounts[post.slug] > 1) post.slug = `${post.slug}-${post.id}`;
}
console.log(`Parsed ${posts.length} posts, ${posts.filter(p => p.images.length).length} with real images`);
writeFileSync(new URL('./noticias-parsed.json', import.meta.url), JSON.stringify(posts, null, 2));
