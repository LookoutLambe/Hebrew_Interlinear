// Step 1: Extract a Hebrew → English gloss dictionary from all existing verse data in BOM.html
const fs = require('fs');

const bom = fs.readFileSync('C:\\Users\\chris\\Desktop\\Hebrew BOM\\BOM.html', 'utf8');

// Find all verse data constants (arrays of verse objects)
// Pattern: ["HebrewWord","english-gloss"]
const pairRegex = /\["([^"]+)","([^"]*?)"\]/g;
const dict = {};
let match;
let totalPairs = 0;

while ((match = pairRegex.exec(bom)) !== null) {
  const hebrew = match[1];
  const english = match[2];

  // Skip sof pasuk markers and empty glosses for structural items
  if (hebrew === '\u05C3' || hebrew === '׃') continue;
  if (!english) continue;

  totalPairs++;

  if (!dict[hebrew]) {
    dict[hebrew] = {};
  }
  dict[hebrew][english] = (dict[hebrew][english] || 0) + 1;
}

// For each Hebrew word, pick the most common gloss
const finalDict = {};
for (const [heb, glosses] of Object.entries(dict)) {
  let bestGloss = '';
  let bestCount = 0;
  for (const [gloss, count] of Object.entries(glosses)) {
    if (count > bestCount) {
      bestCount = count;
      bestGloss = gloss;
    }
  }
  finalDict[heb] = bestGloss;
}

// Save dictionary as JSON
fs.writeFileSync(
  'C:\\Users\\chris\\Desktop\\Hebrew BOM\\gloss_dictionary.json',
  JSON.stringify(finalDict, null, 0),
  'utf8'
);

console.log(`Total word pairs found: ${totalPairs}`);
console.log(`Unique Hebrew words: ${Object.keys(finalDict).length}`);

// Also save a version with all glosses (for context)
fs.writeFileSync(
  'C:\\Users\\chris\\Desktop\\Hebrew BOM\\gloss_dictionary_full.json',
  JSON.stringify(dict, null, 2),
  'utf8'
);

// Show some stats
const sampleWords = Object.entries(finalDict).slice(0, 20);
console.log('\nSample entries:');
sampleWords.forEach(([h, e]) => console.log(`  ${h} → ${e}`));
