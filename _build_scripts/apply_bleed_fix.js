// Fix bleeding glosses: when a word's gloss contains a trailing or leading
// component that matches the adjacent word's gloss, strip the redundant part.
// Each Hebrew word should only gloss ITSELF.

const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');

// Step 1: Build list of all word pairs in sequence
const pairRegex = /\["([^"]+)","([^"]*)"\]/g;
const allPairs = [];
let m;
while ((m = pairRegex.exec(html)) !== null) {
  allPairs.push({ heb: m[1], eng: m[2], pos: m.index, len: m[0].length });
}

console.log(`Total pairs: ${allPairs.length}`);

// Step 2: Find and fix bleeding patterns
// Strategy: when the LAST hyphen-part of word A exactly equals the FIRST
// hyphen-part of word B (for content words > 2 chars), strip from A.
// When the FIRST hyphen-part of word A exactly equals the LAST
// hyphen-part of word B, strip from A.
// Skip: "of", "the", "to", "and", "in", "a" — these are too common and structural

const skipWords = new Set([
  'of', 'the', 'to', 'and', 'in', 'a', 'an', 'is', 'are', 'was',
  'for', 'by', 'on', 'at', 'or', 'be', 'it', 'he', 'we', 'I',
  'do', 'so', 'no', 'up', 'if', 'as', 'my', 'me'
]);

let fixes = [];

for (let i = 0; i < allPairs.length - 1; i++) {
  const a = allPairs[i];
  const b = allPairs[i + 1];
  if (!a.eng || !b.eng) continue;
  if (a.heb === '\u05C3' || b.heb === '\u05C3') continue;

  const aParts = a.eng.split('-');
  const bParts = b.eng.split('-');

  // Pattern: last part of A = first part of B (or entire B)
  if (aParts.length > 1) {
    const lastA = aParts[aParts.length - 1];
    // Check if lastA matches B's first word or B's entire gloss
    if (lastA.length > 2 && !skipWords.has(lastA.toLowerCase())) {
      if (lastA === bParts[0] || lastA === b.eng) {
        const newGloss = aParts.slice(0, -1).join('-');
        if (newGloss.length >= 1) {
          fixes.push({
            idx: i,
            target: 'a',
            oldGloss: a.eng,
            newGloss: newGloss,
            overlap: lastA,
            context: `${a.heb}("${a.eng}") + ${b.heb}("${b.eng}")`
          });
        }
      }
    }
  }

  // Pattern: first part of B = last part of A (or entire A)
  if (bParts.length > 1) {
    const firstB = bParts[0];
    if (firstB.length > 2 && !skipWords.has(firstB.toLowerCase())) {
      if (firstB === aParts[aParts.length - 1] || firstB === a.eng) {
        const newGloss = bParts.slice(1).join('-');
        if (newGloss.length >= 1) {
          fixes.push({
            idx: i,
            target: 'b',
            oldGloss: b.eng,
            newGloss: newGloss,
            overlap: firstB,
            context: `${a.heb}("${a.eng}") + ${b.heb}("${b.eng}")`
          });
        }
      }
    }
  }
}

console.log(`\nBleeding patterns found: ${fixes.length}\n`);

// Show all fixes grouped by type
console.log('=== ALL PROPOSED FIXES ===\n');
for (const f of fixes) {
  const pair = f.target === 'a' ? allPairs[f.idx] : allPairs[f.idx + 1];
  console.log(`  ${pair.heb}: "${f.oldGloss}" → "${f.newGloss}"  (overlap: "${f.overlap}")  [${f.context}]`);
}

// Step 3: Apply fixes (in reverse order to preserve positions)
// Sort by position descending so replacements don't shift later positions
const uniqueFixes = [];
const seen = new Set();
for (const f of fixes) {
  const pair = f.target === 'a' ? allPairs[f.idx] : allPairs[f.idx + 1];
  const key = `${pair.pos}:${f.oldGloss}`;
  if (!seen.has(key)) {
    seen.add(key);
    uniqueFixes.push({ ...f, pair });
  }
}

uniqueFixes.sort((a, b) => b.pair.pos - a.pair.pos);

let applied = 0;
for (const f of uniqueFixes) {
  const pair = f.pair;
  const oldStr = `["${pair.heb}","${f.oldGloss}"]`;
  const newStr = `["${pair.heb}","${f.newGloss}"]`;

  // Replace at exact position
  const before = html.substring(pair.pos, pair.pos + oldStr.length);
  if (before === oldStr) {
    html = html.substring(0, pair.pos) + newStr + html.substring(pair.pos + oldStr.length);
    applied++;
  }
}

console.log(`\nApplied ${applied} bleeding gloss fixes`);

fs.writeFileSync('BOM.html', html);
console.log('BOM.html updated!');
