import { readFileSync, writeFileSync } from 'fs';

const authors = JSON.parse(readFileSync(new URL('../src/data/authors.json', import.meta.url), 'utf-8'));
const current = authors.filter(a => a.category !== 'egresso');

function splitName(fullName) {
  // Brazilian name convention: first token = given name, last token = family name
  // (search API matches on these two fields; middle names are ignored for matching)
  const parts = fullName.trim().split(/\s+/).filter(p => !['Jr.', 'Jr', 'Neto', 'Filho'].includes(p));
  return { given: parts[0], family: parts[parts.length - 1] };
}

const CONNECTORS = new Set(['da', 'de', 'do', 'das', 'dos']);

function tokenSet(s) {
  return new Set(
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[.,]/g, ' ').split(/\s+/).filter(t => t && !CONNECTORS.has(t))
  );
}

function sameSet(a, b) {
  return a.size === b.size && [...a].every(t => b.has(t));
}

// Require an EXACT token match (order-independent, punctuation-insensitive)
// between the member's known name and the ORCID record's actual name — not a
// subset/superset match, which produced false positives in both directions
// ("Mariana Silva Sousa" matching an unrelated "Mariana de Sousa Loureiro",
// and would also wrongly accept "Helen Moraes" against "Helen Moraes de Moura").
function nameMatches(expected, actualGiven, actualFamily) {
  return sameSet(tokenSet(expected), tokenSet(`${actualGiven || ''} ${actualFamily || ''}`));
}

const results = [];

for (const m of current) {
  const { given, family } = splitName(m.name);
  const q = `family-name:${family} AND given-names:${given} AND affiliation-org-name:"Universidade Federal de Alagoas"`;
  const searchUrl = `https://pub.orcid.org/v3.0/search?q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(searchUrl, { headers: { Accept: 'application/json' } });
    const json = await res.json();
    if (json['num-found'] !== 1) {
      console.log(`SKIP   ${m.name} (${json['num-found']} results)`);
      await new Promise(r => setTimeout(r, 200));
      continue;
    }
    const orcid = json.result[0]['orcid-identifier'].path;
    const personRes = await fetch(`https://pub.orcid.org/v3.0/${orcid}/person`, { headers: { Accept: 'application/json' } });
    const person = await personRes.json();
    const actualGiven = person.name?.['given-names']?.value;
    const actualFamily = person.name?.['family-name']?.value;
    if (nameMatches(m.name, actualGiven, actualFamily)) {
      results.push({ id: m.id, name: m.name, orcid });
      console.log(`MATCH  ${m.name} -> ${orcid} (verified: ${actualGiven} ${actualFamily})`);
    } else {
      console.log(`REJECT ${m.name} -> record is actually "${actualGiven} ${actualFamily}", not the same person`);
    }
  } catch (e) {
    console.log(`ERROR  ${m.name}: ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 300)); // be polite to the public API
}

writeFileSync(new URL('./orcid-matches.json', import.meta.url), JSON.stringify(results, null, 2));
console.log(`\n${results.length} of ${current.length} current members matched.`);
