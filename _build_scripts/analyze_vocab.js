// Analyze all Hebrew word → English gloss pairs for inconsistencies
// Groups by exact Hebrew word (with nikkud) and shows all different glosses

const fs = require('fs');
const html = fs.readFileSync('BOM.html', 'utf8');

// Extract all word pairs from verse arrays
const pairRegex = /\["([^"]+)","([^"]*)"\]/g;
const wordMap = new Map(); // Hebrew → { gloss: count }
let match;
let totalPairs = 0;

while ((match = pairRegex.exec(html)) !== null) {
  const heb = match[1];
  const eng = match[2];
  if (heb === '׃' || eng === '') continue; // skip sof-pasuk
  totalPairs++;

  if (!wordMap.has(heb)) {
    wordMap.set(heb, new Map());
  }
  const glosses = wordMap.get(heb);
  glosses.set(eng, (glosses.get(eng) || 0) + 1);
}

console.log(`Total word pairs: ${totalPairs}`);
console.log(`Unique Hebrew words: ${wordMap.size}`);

// Find words with multiple glosses
const multiGloss = [];
for (const [heb, glosses] of wordMap) {
  if (glosses.size > 1) {
    const entries = [...glosses.entries()].sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, e) => s + e[1], 0);
    multiGloss.push({ heb, entries, total, count: glosses.size });
  }
}

// Sort by total occurrences (most common words first)
multiGloss.sort((a, b) => b.total - a.total);

console.log(`\nWords with multiple glosses: ${multiGloss.length}\n`);
console.log('=== TOP 80 MOST COMMON WORDS WITH VARIANT GLOSSES ===\n');

for (let i = 0; i < Math.min(80, multiGloss.length); i++) {
  const { heb, entries, total, count } = multiGloss[i];
  console.log(`${heb} (${total} total, ${count} variants):`);
  for (const [gloss, cnt] of entries) {
    const pct = ((cnt / total) * 100).toFixed(1);
    console.log(`  ${cnt}x (${pct}%) "${gloss}"`);
  }
  console.log('');
}

// Also output the full data as JSON for further analysis
const output = multiGloss.map(({ heb, entries, total }) => ({
  hebrew: heb,
  total,
  glosses: entries.map(([g, c]) => ({ gloss: g, count: c }))
}));

fs.writeFileSync('vocab_variants.json', JSON.stringify(output, null, 2));
console.log('Full data written to vocab_variants.json');
