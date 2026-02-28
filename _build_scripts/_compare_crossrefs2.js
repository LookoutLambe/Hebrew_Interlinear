const fs = require('fs');
const path = require('path');
const base = 'C:/Users/chris/Desktop/Hebrew BOM';

// Load both files
let jsRaw = fs.readFileSync(path.join(base, 'crossrefs.js'), 'utf8').trim();
jsRaw = jsRaw.slice('window._crossrefsData = '.length);
if (jsRaw.endsWith('};')) jsRaw = jsRaw.slice(0, -1);
const jsData = JSON.parse(jsRaw);
const jsonData = JSON.parse(fs.readFileSync(path.join(base, 'crossrefs.json'), 'utf8'));

const jsKeys = Object.keys(jsData).sort();
const jsonKeys = Object.keys(jsonData).sort();
const jsSet = new Set(jsKeys);
const jsonSet = new Set(jsonKeys);
const commonKeys = jsKeys.filter(k => jsonSet.has(k));

// Count diffs per book
const diffs = [];
for (const key of commonKeys) {
  if (JSON.stringify(jsData[key]) !== JSON.stringify(jsonData[key])) {
    diffs.push(key);
  }
}

// Count by actual book name
const bookDiffCounts = {};
for (const key of diffs) {
  const book = key.split('|')[0];
  bookDiffCounts[book] = (bookDiffCounts[book] || 0) + 1;
}
console.log('=== DIFF SUMMARY BY BOOK ===');
for (const [book, count] of Object.entries(bookDiffCounts).sort((a, b) => b[1] - a[1])) {
  console.log('  ' + book + ': ' + count + ' differing verse(s)');
}

// Count new keys by book
const newKeysByBook = {};
const onlyInJson = jsonKeys.filter(k => !jsSet.has(k));
for (const key of onlyInJson) {
  const book = key.split('|')[0];
  newKeysByBook[book] = (newKeysByBook[book] || 0) + 1;
}
console.log('\n=== NEW KEYS BY BOOK (only in crossrefs.json) ===');
for (const [book, count] of Object.entries(newKeysByBook).sort((a, b) => b[1] - a[1])) {
  console.log('  ' + book + ': ' + count + ' new verse(s)');
}

// Side-by-side samples
console.log('\n=== SIDE-BY-SIDE SAMPLES ===');

const samples = [
  '1 Nephi|3|7',
  '1 Nephi|17|35',
  'Alma|5|46',
  'Alma|32|21',
  'Alma|42|15',
  '3 Nephi|11|23',
  '3 Nephi|20|23',
  'Moroni|10|4',
  'Moroni|7|47',
  'Ether|12|6',
];

for (const key of samples) {
  console.log('\n--- ' + key + ' ---');
  const jsVal = jsData[key];
  const jsonVal = jsonData[key];
  
  console.log('  crossrefs.js (backup):');
  if (jsVal) {
    jsVal.forEach((entry, i) => console.log('    [' + i + '] ' + JSON.stringify(entry)));
  } else {
    console.log('    (not present)');
  }
  
  console.log('  crossrefs.json (current):');
  if (jsonVal) {
    jsonVal.forEach((entry, i) => console.log('    [' + i + '] ' + JSON.stringify(entry)));
  } else {
    console.log('    (not present)');
  }
  
  if (jsVal && jsonVal) {
    const same = JSON.stringify(jsVal) === JSON.stringify(jsonVal);
    console.log('  Match: ' + (same ? 'IDENTICAL' : 'DIFFERENT'));
  }
}

// Show a few examples of entirely new keys
console.log('\n=== SAMPLE NEW KEYS (only in crossrefs.json) ===');
const sampleNew = onlyInJson.slice(0, 5);
for (const key of sampleNew) {
  console.log('\n--- ' + key + ' (NEW) ---');
  jsonData[key].forEach((entry, i) => console.log('  [' + i + '] ' + JSON.stringify(entry)));
}
