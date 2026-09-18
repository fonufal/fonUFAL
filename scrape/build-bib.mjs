import { readFileSync, writeFileSync } from 'fs';

const pubs = JSON.parse(readFileSync(new URL('../src/data/publications.json', import.meta.url), 'utf-8'));

function authorList(p) {
  return p.authors || (p.author ? [p.author] : []);
}

function bibKey(p) {
  const names = authorList(p);
  const first = names[0]?.split(' ').pop().toLowerCase().replace(/[^a-z]/g, '') || 'anon';
  const year = p.year || p.startYear || 'nd';
  return `${first}${year}${p.id.split('-').slice(-1)[0]}`;
}

function esc(s) {
  return s.replace(/&/g, '\\&');
}

const bibType = { artigo: 'article', livro: 'book', capitulo: 'incollection', tese: 'phdthesis', dissertacao: 'mastersthesis' };

const entries = pubs.map(p => {
  const key = bibKey(p);
  const names = authorList(p);
  const year = p.year || p.startYear;
  const lines = [`@${bibType[p.type] || 'misc'}{${key},`];
  if (names.length) lines.push(`  author  = {${names.join(' and ')}},`);
  lines.push(`  title   = {${esc(p.title)}},`);
  if (p.journal) lines.push(`  journal = {${esc(p.journal)}},`);
  if (p.bookTitle) lines.push(`  booktitle = {${esc(p.bookTitle)}},`);
  if (p.publisher) lines.push(`  publisher = {${esc(p.publisher)}},`);
  if (p.institution) lines.push(`  school  = {${esc(p.institution)}},`);
  if (p.volume) lines.push(`  volume  = {${p.volume}},`);
  if (p.issue) lines.push(`  number  = {${p.issue}},`);
  if (p.pages) lines.push(`  pages   = {${String(p.pages).replace('–', '--')}},`);
  if (year) lines.push(`  year    = {${year}},`);
  if (p.url) {
    const doiMatch = p.url.match(/^https:\/\/doi\.org\/(.+)$/);
    if (doiMatch) lines.push(`  doi     = {${doiMatch[1]}},`);
    lines.push(`  url     = {${p.url}},`);
  }
  lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
  lines.push('}');
  return lines.join('\n');
});

const header = `% Produção do fonUFAL: artigos, livros, capítulos e orientações de teses e
% dissertações. Artigos mais antigos foram identificados no arquivo de
% notícias preservado do WordPress e no ORCID público dos membros atuais,
% verificados contra o Crossref; o restante (incluindo livros, capítulos e
% orientações) foi extraído diretamente do Lattes de Miguel Oliveira Jr.
% Gerado a partir de src/data/publications.json — não editar manualmente.

`;

writeFileSync(new URL('../src/data/publications.bib', import.meta.url), header + entries.join('\n\n') + '\n');
console.log(`Wrote ${entries.length} BibTeX entries`);
