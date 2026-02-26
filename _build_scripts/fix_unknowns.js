// Post-processing: Try to resolve ??? glosses using morphological prefix/suffix stripping
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\chris\\Desktop\\Hebrew BOM';
const dict = JSON.parse(fs.readFileSync(path.join(baseDir, 'gloss_dictionary.json'), 'utf8'));
const extraGlosses = JSON.parse(fs.readFileSync(path.join(baseDir, 'extra_glosses.json'), 'utf8'));
const workDict = { ...dict, ...extraGlosses };

// Common Hebrew prefixes and their glosses
const prefixes = [
  { prefix: 'וְ', gloss: 'and-' },
  { prefix: 'וַ', gloss: 'and-' },
  { prefix: 'וּ', gloss: 'and-' },
  { prefix: 'וָ', gloss: 'and-' },
  { prefix: 'וִ', gloss: 'and-' },
  { prefix: 'בְּ', gloss: 'in-' },
  { prefix: 'בַּ', gloss: 'in-the-' },
  { prefix: 'בָּ', gloss: 'in-the-' },
  { prefix: 'בִּ', gloss: 'in-' },
  { prefix: 'לְ', gloss: 'to-' },
  { prefix: 'לַ', gloss: 'to-the-' },
  { prefix: 'לָ', gloss: 'to-the-' },
  { prefix: 'לִ', gloss: 'to-' },
  { prefix: 'כְּ', gloss: 'as-' },
  { prefix: 'כַּ', gloss: 'as-the-' },
  { prefix: 'כָּ', gloss: 'as-the-' },
  { prefix: 'מִ', gloss: 'from-' },
  { prefix: 'מֵ', gloss: 'from-' },
  { prefix: 'הַ', gloss: 'the-' },
  { prefix: 'הָ', gloss: 'the-' },
  { prefix: 'שֶׁ', gloss: 'that-' },
];

// Try to match a word by stripping prefixes
function tryMorphMatch(word) {
  // First try maqaf split
  if (word.includes('־')) {
    const parts = word.split('־');
    const glossParts = parts.map(p => {
      if (workDict[p]) return workDict[p];
      const morph = tryPrefixStrip(p);
      if (morph) return morph;
      return null;
    });
    if (glossParts.every(g => g !== null)) {
      return glossParts.join('-');
    }
    // If most parts match, still use it
    const matched = glossParts.filter(g => g !== null).length;
    if (matched > 0 && matched >= parts.length - 1) {
      return glossParts.map(g => g || '???').join('-');
    }
  }

  return tryPrefixStrip(word);
}

function tryPrefixStrip(word) {
  // Try each prefix
  for (const { prefix, gloss } of prefixes) {
    if (word.startsWith(prefix) && word.length > prefix.length + 1) {
      const remainder = word.slice(prefix.length);
      if (workDict[remainder]) {
        return gloss + workDict[remainder];
      }
      // Try double prefix (e.g., וְבַ = and-in-the-)
      for (const { prefix: p2, gloss: g2 } of prefixes) {
        if (remainder.startsWith(p2) && remainder.length > p2.length + 1) {
          const rem2 = remainder.slice(p2.length);
          if (workDict[rem2]) {
            return gloss + g2 + workDict[rem2];
          }
        }
      }
    }
  }
  return null;
}

// Read BOM.html and fix ??? glosses
let bom = fs.readFileSync(path.join(baseDir, 'BOM.html'), 'utf8');

let fixed = 0;
let remaining = 0;

// Match patterns like ["HebrewWord","???"]
bom = bom.replace(/\["([^"]+)","(\?\?\?)"\]/g, (match, hebrew, gloss) => {
  const resolved = tryMorphMatch(hebrew);
  if (resolved) {
    fixed++;
    const rEsc = resolved.replace(/"/g, '\\"');
    return `["${hebrew}","${rEsc}"]`;
  }
  remaining++;
  return match;
});

fs.writeFileSync(path.join(baseDir, 'BOM.html'), bom, 'utf8');
console.log(`Fixed ${fixed} glosses via morphological matching`);
console.log(`Remaining ??? glosses: ${remaining}`);
console.log(`Resolution rate: ${((fixed / (fixed + remaining)) * 100).toFixed(1)}%`);
