import { readFileSync, writeFileSync } from 'fs';

const verified = JSON.parse(readFileSync(new URL('./orcid-works-verified.json', import.meta.url), 'utf-8'));
const existing = JSON.parse(readFileSync(new URL('../src/data/publications.json', import.meta.url), 'utf-8'));

// Normalize known fonUFAL member name spellings to the canonical form used in authors.json.
// External collaborators (co-authors from other institutions) are left as Crossref has them.
function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const NAME_MAP = {
  'miguel oliveira': 'Miguel Oliveira Jr.',
  'miguel oliveira jr': 'Miguel Oliveira Jr.',
  'miguel oliveira junior': 'Miguel Oliveira Jr.',
  'miguel jose alves oliveira junior': 'Miguel Oliveira Jr.',
  'miguel jose alves de oliveira junior': 'Miguel Oliveira Jr.',
  'ebson wilkerson r. da silva': 'Ebson Wilkerson Rocha da Silva',
  'ebson wilkerson rocha silva': 'Ebson Wilkerson Rocha da Silva',
  'arthur ronald brasi terto': 'Arthur Ronald Brasil Terto',
  'julio c. galdino': 'Julio Cesar Galdino',
  'julio galdino': 'Julio Cesar Galdino',
  'kyvia fernanda tenorio da silva': 'Kyvia Fernanda Tenório da Silva',
  'remildo barbosa da silva': 'Remildo Barbosa da Silva',
  'humberto meira de araujo neto': 'Humberto Meira de Araújo Neto',
};

function normalizeName(name) {
  const key = stripAccents(name).toLowerCase().trim();
  return NAME_MAP[key] || name;
}

function slugId(doi) {
  return doi.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}

const excludeDoi = new Set(['10.58976/peletron.v2n2.cadlin']); // correction notice, not an article

const newEntries = verified
  .filter(w => !excludeDoi.has(w.doi.toLowerCase()))
  .map(w => ({
    id: slugId(w.doi),
    authors: w.authors.map(normalizeName),
    title: w.title,
    journal: w.journal,
    volume: w.volume,
    issue: w.issue,
    pages: w.page ? w.page.replace('-', '–') : null,
    year: w.year,
    url: `https://doi.org/${w.doi}`,
  }));

// De-dup against existing (by DOI/url) in case of overlap.
const existingUrls = new Set(existing.map(p => p.url));
const merged = [...existing, ...newEntries.filter(e => !existingUrls.has(e.url))];
merged.sort((a, b) => b.year - a.year);

writeFileSync(new URL('../src/data/publications.json', import.meta.url), JSON.stringify(merged, null, 2) + '\n');
console.log(`Wrote ${merged.length} publications (${existing.length} existing + ${newEntries.length} new)`);
