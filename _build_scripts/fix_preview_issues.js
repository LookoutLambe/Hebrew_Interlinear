const fs = require('fs');
let bom = fs.readFileSync('BOM.html', 'utf8');

// Fixes spotted in preview verification
const fixes = [
  ['"Dlt"', '"door"'],
  ['"Gsot"', '"coarse"'],
  ['"Gsoth"', '"coarse(f)"'],
  // Fix remaining double/triple prefixes
];

let count = 0;
for (const [bad, good] of fixes) {
  while (bom.includes(bad)) {
    bom = bom.replace(bad, good);
    count++;
  }
}

// Fix remaining double prefixes more aggressively
const doublePrefixes = [
  [/in-the-the-/g, 'in-the-'],
  [/the-the-/g, 'the-'],
  [/and-the-the-/g, 'and-the-'],
  [/and-and-/g, 'and-'],
  [/in-in-/g, 'in-'],
  [/to-to-/g, 'to-'],
  [/from-from-/g, 'from-'],
  [/to-the-the-/g, 'to-the-'],
  [/from-the-the-/g, 'from-the-'],
  [/and-in-the-the-/g, 'and-in-the-'],
  [/and-to-the-the-/g, 'and-to-the-'],
  [/and-from-the-the-/g, 'and-from-the-'],
];

let dpCount = 0;
for (const [pat, repl] of doublePrefixes) {
  const m = bom.match(pat);
  if (m) dpCount += m.length;
  bom = bom.replace(pat, repl);
}

console.log(`Fixed ${count} glosses`);
if (dpCount > 0) console.log(`Fixed ${dpCount} double-prefix occurrences`);

fs.writeFileSync('BOM.html', bom, 'utf8');
console.log('Saved');
