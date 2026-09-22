import { readFileSync, writeFileSync } from 'fs';

const members = JSON.parse(readFileSync(new URL('./membros-final.json', import.meta.url), 'utf-8'));
let orcidById = {};
try {
  const matches = JSON.parse(readFileSync(new URL('./orcid-matches.json', import.meta.url), 'utf-8'));
  orcidById = Object.fromEntries(matches.map(m => [m.id, m.orcid]));
} catch {
  console.warn('orcid-matches.json not found — run find-orcid.mjs first for ORCID links');
}

const categoryLabels = {
  lider: 'Liderança',
  pesquisador: 'Pesquisador(a)',
  estudante: 'Estudante',
  egresso: 'Egresso(a)',
};

// Only email, lattes and orcid are shown — vcard and researchgate are dropped.
// ORCID is only ever included when independently verified by find-orcid.mjs
// (exact name match against the public ORCID record) — never guessed.
const authors = members.map(m => {
  const links = {};
  if (m.links.email) links.email = m.links.email;
  if (m.links.lattes) links.lattes = m.links.lattes;
  const orcid = orcidById[m.id];
  if (orcid) links.orcid = `https://orcid.org/${orcid}`;
  return {
    id: m.id,
    name: m.name,
    category: m.category,
    categoryLabel: categoryLabels[m.category] || m.category,
    subRole: m.subRole,
    bio: m.bio,
    photo: m.photoFile,
    links,
  };
});

writeFileSync(
  new URL('../src/data/authors.json', import.meta.url),
  JSON.stringify(authors, null, 2) + '\n'
);
console.log(`Wrote ${authors.length} authors`);
