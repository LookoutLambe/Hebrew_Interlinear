// Fix glosses that "bleed" into adjacent words — where a Hebrew word's gloss
// includes the meaning of its neighbor. Each Hebrew word should only gloss ITSELF.
//
// Example: בְּקֶרֶב "among-all" + כָּל "all" → בְּקֶרֶב "among" + כָּל "all"
// The "all" in "among-all" belongs to כָּל, not to בְּקֶרֶב

const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');

// Step 1: First analyze what בְּקֶרֶב and similar words are glossed as
const pairRegex = /\["([^"]+)","([^"]*)"\]/g;
const wordMap = new Map();
let m;
while ((m = pairRegex.exec(html)) !== null) {
  const heb = m[1], eng = m[2];
  if (!eng) continue;
  if (!wordMap.has(heb)) wordMap.set(heb, new Map());
  wordMap.get(heb).set(eng, (wordMap.get(heb).get(eng) || 0) + 1);
}

// Show glosses for key words the user mentioned
const checkWords = [
  'בְּקֶרֶב', 'כָּל', 'בְּכָל', 'עַל', 'אֶל', 'מִן', 'אֶת',
  'לְ', 'בְּ', 'מִ', 'כְּ',
];

console.log('=== CURRENT GLOSSES FOR KEY WORDS ===\n');
for (const w of checkWords) {
  if (wordMap.has(w)) {
    const glosses = [...wordMap.get(w).entries()].sort((a,b) => b[1] - a[1]);
    console.log(`${w}:`);
    for (const [g, c] of glosses.slice(0, 10)) {
      console.log(`  ${c}x "${g}"`);
    }
    console.log('');
  }
}

// Step 2: Find patterns where adjacent words share gloss components
// Extract pairs in sequence to find overlaps
const allPairs = [];
const pairRegex2 = /\["([^"]+)","([^"]*)"\]/g;
while ((m = pairRegex2.exec(html)) !== null) {
  allPairs.push({ heb: m[1], eng: m[2], pos: m.index });
}

// Find cases where word A's gloss ends with word B's gloss (or starts with it)
console.log('=== BLEEDING GLOSS PATTERNS (adjacent words sharing meaning) ===\n');

const bleedPatterns = new Map();
for (let i = 0; i < allPairs.length - 1; i++) {
  const a = allPairs[i];
  const b = allPairs[i + 1];
  if (!a.eng || !b.eng) continue;
  if (a.heb === '\u05C3' || b.heb === '\u05C3') continue;

  const aParts = a.eng.split('-');
  const bParts = b.eng.split('-');

  // Check if last part(s) of A match first part(s) of B
  if (aParts.length > 1 && bParts.length >= 1) {
    const lastA = aParts[aParts.length - 1];
    const firstB = bParts[0];
    if (lastA === firstB && lastA.length > 1) {
      const key = `${a.heb}("${a.eng}") + ${b.heb}("${b.eng}") → overlap: "${lastA}"`;
      bleedPatterns.set(key, (bleedPatterns.get(key) || 0) + 1);
    }
  }

  // Check if first part(s) of A match last part(s) of B
  if (aParts.length >= 1 && bParts.length > 1) {
    const firstA = aParts[0];
    const lastB = bParts[bParts.length - 1];
    if (firstA === lastB && firstA.length > 1) {
      const key = `${a.heb}("${a.eng}") + ${b.heb}("${b.eng}") → overlap: "${firstA}"`;
      bleedPatterns.set(key, (bleedPatterns.get(key) || 0) + 1);
    }
  }
}

const sorted = [...bleedPatterns.entries()].sort((a,b) => b[1] - a[1]);
console.log(`Total unique bleeding patterns: ${sorted.length}\n`);
console.log('Top 50:');
for (let i = 0; i < Math.min(50, sorted.length); i++) {
  console.log(`  ${sorted[i][1]}x  ${sorted[i][0]}`);
}
