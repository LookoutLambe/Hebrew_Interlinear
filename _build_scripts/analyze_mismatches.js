// Analyze the most common vocabulary mismatches to build a synonym map
// For each non-official gloss word, find what official word usually appears
// in the same verse context
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_FILE = path.resolve(__dirname, 'BOM_backup.html');
const OFFICIAL_FILE = path.resolve(__dirname, 'official_verses.json');

const html = fs.readFileSync(HTML_FILE, 'utf8');
const official = JSON.parse(fs.readFileSync(OFFICIAL_FILE, 'utf8'));

const officialMap = {};
for (const v of official) {
  officialMap[`${v.book} ${v.chapter}:${v.verse}`] = v.english;
}

const prefixToBook = [
  ['n2_ch', '2 Nephi'], ['jc_ch', 'Jacob'], ['en_ch', 'Enos'],
  ['jr_ch', 'Jarom'], ['om_ch', 'Omni'], ['wm_ch', 'Words of Mormon'],
  ['mo_ch', 'Mosiah'], ['al_ch', 'Alma'], ['he_ch', 'Helaman'],
  ['tn_ch', '3 Nephi'], ['fn_ch', '4 Nephi'], ['mm_ch', 'Mormon'],
  ['et_ch', 'Ether'], ['mr_ch', 'Moroni'], ['ch', '1 Nephi'],
];

function hebToNum(heb) {
  const map = {
    'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
    'י':10,'יא':11,'יב':12,'יג':13,'יד':14,'טו':15,'טז':16,'יז':17,'יח':18,'יט':19,
    'כ':20,'כא':21,'כב':22,'כג':23,'כד':24,'כה':25,'כו':26,'כז':27,'כח':28,'כט':29,
    'ל':30,'לא':31,'לב':32,'לג':33,'לד':34,'לה':35,'לו':36,'לז':37,'לח':38,'לט':39,
    'מ':40,'מא':41,'מב':42,'מג':43,'מד':44,'מה':45,'מו':46,'מז':47,'מח':48,'מט':49,
    'נ':50,'נא':51,'נב':52,'נג':53,'נד':54,'נה':55,'נו':56,'נז':57,'נח':58,'נט':59,
    'ס':60,'סא':61,'סב':62,'סג':63,'סד':64,'סה':65,'סו':66,
  };
  return map[heb] || -1;
}

function getBookChapter(varName) {
  for (const [prefix, book] of prefixToBook) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = varName.match(new RegExp(`^${escaped}(\\d+)Verses$`));
    if (m) return { book, chapter: parseInt(m[1]) };
  }
  return null;
}

function norm(w) { return w.toLowerCase().replace(/[^a-z']/g, ''); }

function tokenize(text) {
  return text.replace(/[–—]/g, ' ').replace(/[.,;:!?'"()\[\]{}]/g, ' ')
    .split(/\s+/).filter(w => w.length > 0);
}

const universalWords = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by','from',
  'is','are','was','were','be','been','have','has','had','do','does','did',
  'will','shall','would','should','may','might','can','could',
  'not','no','nor','if','then','that','this','these','those','it','its',
  'he','she','him','her','his','my','your','our','their','me','you','us','them','we','they','i',
  'who','whom','which','what','where','when','how','why',
  'all','each','every','some','any','so','as','up','out','about',
  'also','even','yet','now','unto','upon','into',
]);

function extractVerseArrays(html) {
  const results = {};
  const declRegex = /const\s+(\w+Verses)\s*=\s*\[/g;
  let match;
  while ((match = declRegex.exec(html)) !== null) {
    const varName = match[1];
    const startIdx = match.index + match[0].length - 1;
    let depth = 1, i = startIdx + 1;
    while (i < html.length && depth > 0) {
      if (html[i] === '[') depth++;
      else if (html[i] === ']') depth--;
      i++;
    }
    if (depth !== 0) continue;
    try {
      const arr = vm.runInNewContext(`(${html.substring(startIdx, i)})`, {});
      results[varName] = arr;
    } catch (e) {}
  }
  return results;
}

console.log('Extracting verse arrays from backup...');
const verseArrays = extractVerseArrays(html);

// For each mismatched gloss word, track:
// - how often it appears as a gloss word
// - what official words appear in the same verses (with frequency)
const glossWordStats = {}; // non-official word -> { count, officialCooccurrences: {word: count} }

for (const [varName, verses] of Object.entries(verseArrays)) {
  const bc = getBookChapter(varName);
  if (!bc) continue;
  const { book, chapter } = bc;

  for (const verse of verses) {
    if (!verse || !verse.words) continue;
    const verseNum = hebToNum(verse.num);
    if (verseNum < 1) continue;

    const key = `${book} ${chapter}:${verseNum}`;
    const officialText = officialMap[key];
    if (!officialText) continue;

    const offTokens = tokenize(officialText);
    const vocabNorm = new Set(offTokens.map(w => norm(w)));

    for (const [heb, eng] of verse.words) {
      if (!eng || eng === '' || eng === '—' || heb === '׃') continue;

      const parts = eng.replace(/\(f\)|\(m\)|\(pl\)|\(sg\)|\(du\)/gi, '')
        .replace(/\[ACC\]/gi, 'ACC').replace(/\[REL\]/gi, 'REL')
        .split('-').map(p => p.trim()).filter(p => p.length > 0);

      for (const part of parts) {
        const n = norm(part);
        if (!n || n.length < 2) continue;
        if (universalWords.has(n)) continue;
        if (n === 'acc' || n === 'rel') continue;
        if (vocabNorm.has(n)) continue;

        // This word is NOT in the official text for this verse
        if (!glossWordStats[n]) glossWordStats[n] = { count: 0, officialWords: {} };
        glossWordStats[n].count++;

        // Track what official words co-occur in this verse
        for (const ow of offTokens) {
          const on = norm(ow);
          if (on.length < 3 || universalWords.has(on)) continue;
          if (!glossWordStats[n].officialWords[on]) glossWordStats[n].officialWords[on] = 0;
          glossWordStats[n].officialWords[on]++;
        }
      }
    }
  }
}

// Sort by frequency
const sorted = Object.entries(glossWordStats)
  .sort((a, b) => b[1].count - a[1].count);

console.log(`\nFound ${sorted.length} unique non-official gloss words`);
console.log('\n=== TOP 100 NON-OFFICIAL GLOSS WORDS ===');
console.log('(with most common co-occurring official words)\n');

for (const [word, stats] of sorted.slice(0, 100)) {
  // Top 5 co-occurring official words
  const topOfficial = Object.entries(stats.officialWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w, c]) => `${w}(${c})`)
    .join(', ');
  console.log(`  "${word}" x${stats.count} — top official: ${topOfficial}`);
}

// Save full data
fs.writeFileSync(
  path.resolve(__dirname, 'vocab_analysis.json'),
  JSON.stringify(sorted.slice(0, 500).map(([w, s]) => ({
    word: w,
    count: s.count,
    topOfficial: Object.entries(s.officialWords).sort((a, b) => b[1] - a[1]).slice(0, 10)
  })), null, 2)
);
console.log('\nSaved vocab_analysis.json');
