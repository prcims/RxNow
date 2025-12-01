// Medication DB: RxNorm API integration

/**
 * Search RxNorm for active medications by name (API docs: https://rxnav.nlm.nih.gov/RxNormAPI.html)
 * Returns [{ id, name, strength, form }]
 */
export async function searchMedicationsRxNorm(query) {
  if (!query || query.length < 2) return [];
  // RxNorm: Search by term
  const rxcuiResp = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`);
  const rxcuiJson = await rxcuiResp.json();

  // Parse results: Make a flat array [{id, name, strength, form}]
  let meds = [];
  if (rxcuiJson.drugGroup?.conceptGroup) {
    for (const group of rxcuiJson.drugGroup.conceptGroup) {
      if (group.conceptProperties) {
        group.conceptProperties.forEach((med) => {
          // med.rxcui, med.name, med.synonym, med.ttys
          meds.push({
            id: med.rxcui,
            name: med.name,
            strength: med.synonym?.split(' ')[1] || '',
            form: med.synonym?.split(' ').slice(2).join(' ') || '',
          });
        });
      }
    }
  }
  // Deduplicate and filter
  meds = meds.filter(m => m.name).slice(0, 20); // Limit for demo performance
  return meds;
}
