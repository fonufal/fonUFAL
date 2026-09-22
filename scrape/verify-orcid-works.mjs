import { readFileSync, writeFileSync } from 'fs';

const raw = JSON.parse(readFileSync(new URL('./orcid-works-raw.json', import.meta.url), 'utf-8'));

// Keep only 2021+ (recent), drop preprints (duplicate the published version), require a DOI.
const candidates = raw.filter(w => w.year && Number(w.year) >= 2021 && w.type !== 'preprint' && w.doi);

// Dedupe by DOI, merging member attributions.
const byDoi = new Map();
for (const w of candidates) {
  const key = w.doi.toLowerCase();
  if (!byDoi.has(key)) byDoi.set(key, { doi: w.doi, members: new Set() });
  byDoi.get(key).members.add(w.memberName);
}
// Drop the English-translation duplicate of the DELTA-style bilingual pair (keep Portuguese DOI only).
byDoi.delete('10.1590/1981-5794-e16329t');

console.log(`${byDoi.size} unique DOIs to verify via Crossref`);

const verified = [];
for (const [doi, info] of byDoi) {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    if (!res.ok) { console.log(`SKIP ${doi} — Crossref ${res.status}`); continue; }
    const m = (await res.json()).message;
    const title = m.title?.[0];
    if (!title) { console.log(`SKIP ${doi} — no title in Crossref (likely a journal-issue shell, not an article)`); continue; }
    const authors = (m.author || []).map(a => `${a.given ? a.given + ' ' : ''}${a.family || ''}`.trim()).filter(Boolean);
    verified.push({
      doi,
      title,
      authors,
      journal: m['container-title']?.[0] || null,
      volume: m.volume || null,
      issue: m.issue || null,
      page: m.page || null,
      year: m.published?.['date-parts']?.[0]?.[0] || null,
      type: m.type,
      sourcedFromMembers: [...info.members],
    });
    console.log(`OK   ${doi} — ${title.slice(0, 60)}`);
  } catch (e) {
    console.log(`ERROR ${doi}: ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 250));
}

writeFileSync(new URL('./orcid-works-verified.json', import.meta.url), JSON.stringify(verified, null, 2));
console.log(`\n${verified.length} works verified and kept.`);
