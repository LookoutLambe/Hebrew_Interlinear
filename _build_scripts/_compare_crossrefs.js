/**
 * Compare crossrefs.js (backup) vs crossrefs.json (current)
 */
const fs = require('fs');
const path = require('path');

const base = 'C:/Users/chris/Desktop/Hebrew BOM';

// --- Load crossrefs.js (strip wrapper) ---
let jsRaw = fs.readFileSync(path.join(base, 'crossrefs.js'), 'utf8').trim();
const prefix = 'window._crossrefsData = ';
if (!jsRaw.startsWith(prefix)) {
  console.error('ERROR: crossrefs.js does not start with expected prefix.');
  console.error('Starts with:', jsRaw.substring(0, 60));
  process.exit(1);
}
jsRaw = jsRaw.slice(prefix.length);
if (jsRaw.endsWith('};')) {
  jsRaw = jsRaw.slice(0, -1);
}
let jsData;
try {
  jsData = JSON.parse(jsRaw);
} catch (e) {
  console.error('ERROR parsing crossrefs.js as JSON:', e.message);
  const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || '0');
  console.error('Context:', jsRaw.substring(pos - 80, pos + 80));
  process.exit(1);
}

// --- Load crossrefs.json ---
let jsonData;
try {
  jsonData = JSON.parse(fs.readFileSync(path.join(base, 'crossrefs.json'), 'utf8'));
} catch (e) {
  console.error('ERROR parsing crossrefs.json:', e.message);
  process.exit(1);
}

// --- Compare keys ---
const jsKeys = Object.keys(jsData).sort();
const jsonKeys = Object.keys(jsonData).sort();

console.log('=== KEY COUNT ===');
console.log('crossrefs.js  : ' + jsKeys.length + ' verse keys');
console.log('crossrefs.json: ' + jsonKeys.length + ' verse keys');
console.log();

const jsSet = new Set(jsKeys);
const jsonSet = new Set(jsonKeys);

const onlyInJs = jsKeys.filter(k => !jsonSet.has(k));
const onlyInJson = jsonKeys.filter(k => !jsSet.has(k));

console.log('=== KEYS ONLY IN crossrefs.js (backup) ===');
if (onlyInJs.length === 0) {
  console.log('(none)');
} else {
  console.log('Count: ' + onlyInJs.length);
  onlyInJs.forEach(k => console.log('  ' + k));
}
console.log();

console.log('=== KEYS ONLY IN crossrefs.json (current) ===');
if (onlyInJson.length === 0) {
  console.log('(none)');
} else {
  console.log('Count: ' + onlyInJson.length);
  onlyInJson.forEach(k => console.log('  ' + k));
}
console.log();

// --- Compare matching verses ---
const commonKeys = jsKeys.filter(k => jsonSet.has(k));
let identical = 0;
let different = 0;
const diffs = [];

for (const key of commonKeys) {
  const jsVal = JSON.stringify(jsData[key]);
  const jsonVal = JSON.stringify(jsonData[key]);
  if (jsVal === jsonVal) {
    identical++;
  } else {
    different++;
    diffs.push(key);
  }
}

console.log('=== MATCHING VERSE COMPARISON ===');
console.log('Common keys : ' + commonKeys.length);
console.log('Identical   : ' + identical);
console.log('Different   : ' + different);
console.log();

if (different > 0) {
  console.log('=== DIFFERING VERSES (first 30) ===');
  const showDiffs = diffs.slice(0, 30);
  for (const key of showDiffs) {
    console.log('--- ' + key + ' ---');
    const jsEntries = jsData[key];
    const jsonEntries = jsonData[key];
    console.log('  JS  entries: ' + jsEntries.length);
    console.log('  JSON entries: ' + jsonEntries.length);
    const jsSet2 = new Set(jsEntries.map(e => JSON.stringify(e)));
    const jsonSet2 = new Set(jsonEntries.map(e => JSON.stringify(e)));
    const addedEntries = jsonEntries.filter(e => !jsSet2.has(JSON.stringify(e)));
    const removedEntries = jsEntries.filter(e => !jsonSet2.has(JSON.stringify(e)));
    if (addedEntries.length > 0) {
      console.log('  Added in JSON (' + addedEntries.length + '):');
      addedEntries.slice(0, 3).forEach(e => console.log('    + ' + JSON.stringify(e)));
      if (addedEntries.length > 3) console.log('    ... and ' + (addedEntries.length - 3) + ' more');
    }
    if (removedEntries.length > 0) {
      console.log('  Removed from JS (' + removedEntries.length + '):');
      removedEntries.slice(0, 3).forEach(e => console.log('    - ' + JSON.stringify(e)));
      if (removedEntries.length > 3) console.log('    ... and ' + (removedEntries.length - 3) + ' more');
    }
  }
  if (diffs.length > 30) {
    console.log('\n... and ' + (diffs.length - 30) + ' more differing verses.');
  }
  console.log();
}

// --- Side-by-side samples from different books ---
console.log('=== SIDE-BY-SIDE SAMPLES ===');

const sampleVerses = [];
const bookPrefixes = [
  { book: '1 Nephi', prefix: '1ne_' },
  { book: 'Alma', prefix: 'al_' },
  { book: '3 Nephi', prefix: '3ne_' },
  { book: 'Moroni', prefix: 'mro_' },
];

for (const { book, prefix } of bookPrefixes) {
  const candidates = commonKeys.filter(k => k.startsWith(prefix));
  if (candidates.length > 0) {
    const pick = candidates[Math.floor(candidates.length / 2)];
    sampleVerses.push({ book, key: pick });
    sampleVerses.push({ book, key: candidates[0] });
  } else {
    // Try to debug key format
    const sample = commonKeys.slice(0, 10);
    console.log('  No keys with prefix "' + prefix + '". Sample keys: ' + sample.join(', '));
  }
}

for (const { book, key } of sampleVerses) {
  console.log('\n--- ' + book + ': ' + key + ' ---');
  console.log('  crossrefs.js (backup):');
  const jsVal = jsData[key];
  if (jsVal) {
    jsVal.forEach((entry, i) => console.log('    [' + i + '] ' + JSON.stringify(entry)));
  } else {
    console.log('    (not present)');
  }
  console.log('  crossrefs.json (current):');
  const jsonVal = jsonData[key];
  if (jsonVal) {
    jsonVal.forEach((entry, i) => console.log('    [' + i + '] ' + JSON.stringify(entry)));
  } else {
    console.log('    (not present)');
  }
  const same = JSON.stringify(jsVal) === JSON.stringify(jsonVal);
  console.log('  Match: ' + (same ? 'IDENTICAL' : 'DIFFERENT'));
}

// --- Summary of diff types ---
if (different > 0) {
  console.log('\n=== DIFF SUMMARY BY BOOK ===');
  const bookCounts = {};
  for (const key of diffs) {
    const parts = key.match(/^(.+?)(\d+)_(\d+)$/);
    const bookCode = parts ? parts[1] : key.split('_')[0];
    bookCounts[bookCode] = (bookCounts[bookCode] || 0) + 1;
  }
  const sorted = Object.entries(bookCounts).sort((a, b) => b[1] - a[1]);
  for (const [code, count] of sorted) {
    console.log('  ' + code + ': ' + count + ' differing verse(s)');
  }
}

console.log('\n=== DONE ===');
