import { readFileSync, writeFileSync } from 'fs';

const posts = [];
const seen = new Set();

for (let p = 1; p <= 6; p++) {
  const html = readFileSync(new URL(`./noticias-p${p}.html`, import.meta.url), 'utf-8');
  const articleRe = /<article id="post-(\d+)" class="[^"]*"[\s\S]*?<h2><a href="([^"]+)" title="([^"]*)">([^<]*)<\/a><\/h2>[\s\S]*?<p class="post_excerpt">([\s\S]*?)<\/p>/g;
  const catRe = /class="post-\d+ post type-post status-publish format-standard hentry ([^"]*)"/;
  let m;
  const chunkStart = html.indexOf('<article');
  const articles = html.split(/(?=<article id="post-)/).filter(c => c.startsWith('<article id="post-'));
  for (const chunk of articles) {
    const idMatch = chunk.match(/<article id="post-(\d+)"/);
    const catMatch = chunk.match(/hentry ([^"]*)"/);
    const titleMatch = chunk.match(/<h2><a href="([^"]+)" title="([^"]*)">([^<]*)<\/a><\/h2>/);
    const excerptMatch = chunk.match(/<p class="post_excerpt">([\s\S]*?)<\/p>/);
    if (!idMatch || !titleMatch) continue;
    const id = idMatch[1];
    if (seen.has(id)) continue;
    seen.add(id);
    posts.push({
      id,
      url: titleMatch[1],
      title: titleMatch[3].trim(),
      categories: catMatch ? catMatch[1].split(' ').map(c => c.replace('category-', '')) : [],
      excerpt: excerptMatch ? excerptMatch[1].replace(/<[^>]+>/g, '').trim() : '',
    });
  }
}

console.log(`Found ${posts.length} posts`);
writeFileSync(new URL('./noticias-list.json', import.meta.url), JSON.stringify(posts, null, 2));
