import { readFileSync, writeFileSync } from 'fs';

const pubs = JSON.parse(readFileSync(new URL('../src/data/publications.json', import.meta.url), 'utf-8'));

function bibKey(p) {
  const first = p.authors[0]?.split(' ').pop().toLowerCase().replace(/[^a-z]/g, '') || 'anon';
  return `${first}${p.year}${p.id.split('-').slice(-1)[0]}`;
}

function esc(s) {
  return s.replace(/&/g, '\\&');
}

const entries = pubs.map(p => {
  const key = bibKey(p);
  const lines = [
    `@article{${key},`,
    `  author  = {${p.authors.join(' and ')}},`,
    `  title   = {${esc(p.title)}},`,
  ];
  if (p.journal) lines.push(`  journal = {${esc(p.journal)}},`);
  if (p.volume) lines.push(`  volume  = {${p.volume}},`);
  if (p.issue) lines.push(`  number  = {${p.issue}},`);
  if (p.pages) lines.push(`  pages   = {${p.pages.replace('–', '--')}},`);
  lines.push(`  year    = {${p.year}},`);
  const doiMatch = p.url.match(/^https:\/\/doi\.org\/(.+)$/);
  if (doiMatch) lines.push(`  doi     = {${doiMatch[1]}},`);
  lines.push(`  url     = {${p.url}}`);
  lines.push('}');
  return lines.join('\n');
});

const header = `% Publicações do fonUFAL identificadas no arquivo de notícias preservado do
% WordPress e no ORCID público dos membros atuais (não extraídas do Lattes:
% o visualizador de currículos do CNPq exige verificação por CAPTCHA, que
% não é contornada por este processo). Cada entrada foi verificada
% individualmente contra o Crossref antes de ser incluída.
% Gerado a partir de src/data/publications.json — não editar manualmente.

`;

writeFileSync(new URL('../src/data/publications.bib', import.meta.url), header + entries.join('\n\n') + '\n');
console.log(`Wrote ${entries.length} BibTeX entries`);
