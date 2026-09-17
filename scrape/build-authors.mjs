import { readFileSync, writeFileSync } from 'fs';

const members = JSON.parse(readFileSync(new URL('./membros-final.json', import.meta.url), 'utf-8'));

const categoryLabels = {
  lider: 'Liderança',
  pesquisador: 'Pesquisador(a)',
  estudante: 'Estudante',
  egresso: 'Egresso(a)',
};

const authors = members.map(m => ({
  id: m.id,
  name: m.name,
  category: m.category,
  categoryLabel: categoryLabels[m.category] || m.category,
  subRole: m.subRole,
  bio: m.bio,
  photo: m.photoFile,
  links: m.links,
}));

writeFileSync(
  new URL('../src/data/authors.json', import.meta.url),
  JSON.stringify(authors, null, 2) + '\n'
);
console.log(`Wrote ${authors.length} authors`);
