const fs = require('fs');

function stripNiqqud(str) {
  return str.replace(/[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4-\u05C7]/g, '');
}
function normalizeHebrew(str) {
  return stripNiqqud(str).replace(/[׃־]/g, '');
}

const d = JSON.parse(fs.readFileSync('C:/Users/chris/Desktop/Hebrew BOM/bad_glosses_final.json', 'utf8'));
const all = [...d.hebrew_in_gloss, ...d.transliterations];

// Check: how many entries have their normalized hebrew NOT in the manualFixes?
// We need to import the actual manualFixes from the script

// Instead, let's just check what proportion of entries:
// 1. Have dictionary matches
// 2. Have "already reasonable" glosses
// 3. Fall through to transliteration

let dictMatch = 0, dictOcc = 0;
let reasonable = 0, reasonableOcc = 0;
let translit = 0, translitOcc = 0;

// Simulate - just count by checking the gloss patterns
all.forEach(e => {
  const g = e.gloss;
  const hasHebrew = /[\u05D0-\u05EA]/.test(g);
  const hasVowels = /[aeiou]/i.test(g);
  const startsLatin = /^[A-Za-z]/.test(g);
  const longEnough = g.length > 3;
  const hasHyphen = g.includes('-');
  const isProperName = /^[A-Z][a-z]+$/.test(g);

  if (hasHebrew) {
    // Always needs fixing (hebrew chars in gloss)
    translit++;
    translitOcc += e.count;
  } else if (startsLatin && hasVowels && longEnough && (hasHyphen || isProperName)) {
    // Looks reasonable
    reasonable++;
    reasonableOcc += e.count;
  } else {
    // Garbage transliteration
    translit++;
    translitOcc += e.count;
  }
});

console.log('Has Hebrew chars or garbage translit:', translit, 'entries,', translitOcc, 'occurrences');
console.log('Looks reasonable:', reasonable, 'entries,', reasonableOcc, 'occurrences');
console.log('Total:', all.length, 'entries,', translitOcc + reasonableOcc, 'occurrences');

// So the ones that ARE "reasonable" and kept as-is have this many occurrences:
console.log('\nReasonable entries that are KEPT:');
const reasonableEntries = all.filter(e => {
  const g = e.gloss;
  const hasHebrew = /[\u05D0-\u05EA]/.test(g);
  const hasVowels = /[aeiou]/i.test(g);
  const startsLatin = /^[A-Za-z]/.test(g);
  const longEnough = g.length > 3;
  const hasHyphen = g.includes('-');
  const isProperName = /^[A-Z][a-z]+$/.test(g);
  return (hasHebrew === false) && startsLatin && hasVowels && longEnough && (hasHyphen || isProperName);
}).sort((a,b)=>b.count-a.count);

reasonableEntries.slice(0, 50).forEach(e => {
  console.log(e.count, e.hebrew, '|', e.gloss);
});
