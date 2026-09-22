import { readFileSync, writeFileSync } from 'fs';

const members = JSON.parse(readFileSync(new URL('./orcid-matches.json', import.meta.url), 'utf-8'));

const allWorks = [];

for (const m of members) {
  const res = await fetch(`https://pub.orcid.org/v3.0/${m.orcid}/works`, { headers: { Accept: 'application/json' } });
  const json = await res.json();
  for (const group of json.group || []) {
    const summary = group['work-summary'][0];
    const externalIds = group['external-ids']?.['external-id'] || summary['external-ids']?.['external-id'] || [];
    const doi = externalIds.find(e => e['external-id-type'] === 'doi')?.['external-id-value'];
    allWorks.push({
      memberId: m.id,
      memberName: m.name,
      title: summary.title?.title?.value,
      type: summary.type,
      journal: summary['journal-title']?.value || null,
      year: summary['publication-date']?.year?.value || null,
      doi: doi || null,
      putCode: summary['put-code'],
    });
  }
  await new Promise(r => setTimeout(r, 300));
}

writeFileSync(new URL('./orcid-works-raw.json', import.meta.url), JSON.stringify(allWorks, null, 2));
console.log(`Fetched ${allWorks.length} works across ${members.length} members`);
