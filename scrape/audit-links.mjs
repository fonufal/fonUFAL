const BASE = 'http://localhost:4321';
const START = '/fonUFAL/';
const visited = new Set();
const toVisit = [START];
const brokenLinks = [];
const brokenImages = [];
const pageErrors = [];

async function fetchText(path) {
  const res = await fetch(BASE + path);
  return { status: res.status, text: res.status === 200 ? await res.text() : '' };
}

while (toVisit.length) {
  const path = toVisit.shift();
  if (visited.has(path)) continue;
  visited.add(path);

  const { status, text } = await fetchText(path);
  if (status !== 200) {
    pageErrors.push(`${status} ${path}`);
    continue;
  }

  // internal links
  for (const m of text.matchAll(/href="(\/fonUFAL\/[^"#]*)"/g)) {
    const href = m[1].split('?')[0];
    if (!visited.has(href) && !toVisit.includes(href)) toVisit.push(href);
  }
  // external/mailto links worth a HEAD check are skipped for speed

  // images
  for (const m of text.matchAll(/src="(\/fonUFAL\/[^"]*\.(?:jpe?g|png|gif|webp))"/g)) {
    const src = m[1];
    if (!visited.has('img:' + src)) {
      visited.add('img:' + src);
      const r = await fetch(BASE + src);
      if (r.status !== 200) brokenImages.push(`${r.status} ${src} (found on ${path})`);
    }
  }
}

console.log(`Visited ${visited.size} URLs (pages+images)`);
console.log(`\nBroken pages/links (${pageErrors.length}):`);
pageErrors.forEach(e => console.log(' ', e));
console.log(`\nBroken images (${brokenImages.length}):`);
brokenImages.forEach(e => console.log(' ', e));
