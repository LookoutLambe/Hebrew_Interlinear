// Compare BOM.html glosses against official English from dual BOM
// Goal: identify English glosses that don't match the official Book of Mormon text
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_FILE = path.resolve(__dirname, 'BOM.html');
const OFFICIAL_FILE = path.resolve(__dirname, 'official_verses.json');

console.log('Reading files...');
const html = fs.readFileSync(HTML_FILE, 'utf8');
const official = JSON.parse(fs.readFileSync(OFFICIAL_FILE, 'utf8'));

// Build official verse lookup: "Book Chapter:Verse" -> english text
const officialMap = {};
for (const v of official) {
  const key = `${v.book} ${v.chapter}:${v.verse}`;
  officialMap[key] = v.english;
}
console.log(`Official verses loaded: ${official.length}`);

// Variable prefix -> book name mapping
const prefixToBook = {
  'ch': ['1 Nephi', null],        // ch1Verses -> 1 Nephi ch 1
  'n2_ch': ['2 Nephi', null],
  'jc_ch': ['Jacob', null],
  'en_ch': ['Enos', null],
  'jr_ch': ['Jarom', null],
  'om_ch': ['Omni', null],
  'wm_ch': ['Words of Mormon', null],
  'mo_ch': ['Mosiah', null],
  'al_ch': ['Alma', null],
  'he_ch': ['Helaman', null],
  'tn_ch': ['3 Nephi', null],
  'fn_ch': ['4 Nephi', null],
  'mm_ch': ['Mormon', null],
  'et_ch': ['Ether', null],
  'mr_ch': ['Moroni', null],
};

// Hebrew letter to number mapping
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

// Extract verse arrays from HTML using bracket counting
function extractVerseArrays(html) {
  const results = {};
  // Match: const xxxVerses = [
  const declRegex = /const\s+(\w+Verses)\s*=\s*\[/g;
  let match;

  while ((match = declRegex.exec(html)) !== null) {
    const varName = match[1];
    const startIdx = match.index + match[0].length - 1; // position of '['

    // Count brackets to find matching ']'
    let depth = 1;
    let i = startIdx + 1;
    while (i < html.length && depth > 0) {
      if (html[i] === '[') depth++;
      else if (html[i] === ']') depth--;
      i++;
    }

    if (depth !== 0) {
      console.warn(`Warning: unmatched brackets for ${varName}`);
      continue;
    }

    const arrayStr = html.substring(startIdx, i);

    // Evaluate the array in a sandbox
    try {
      const arr = vm.runInNewContext(`(${arrayStr})`, {});
      results[varName] = arr;
    } catch (e) {
      console.warn(`Warning: failed to parse ${varName}: ${e.message}`);
    }
  }

  return results;
}

console.log('Extracting verse arrays from BOM.html...');
const verseArrays = extractVerseArrays(html);
console.log(`Extracted ${Object.keys(verseArrays).length} verse arrays`);

// Map each verse array to book/chapter
function getBookChapter(varName) {
  // Sort prefixes by length (longest first) so 'n2_ch' matches before 'ch'
  const prefixes = Object.keys(prefixToBook).sort((a, b) => b.length - a.length);

  for (const prefix of prefixes) {
    const pattern = new RegExp(`^${prefix.replace('_', '_')}(\\d+)Verses$`);
    const m = varName.match(pattern);
    if (m) {
      return { book: prefixToBook[prefix][0], chapter: parseInt(m[1]) };
    }
  }
  return null; // front matter, colophons, etc.
}

// Normalize text for comparison
function normalizeWord(w) {
  return w.toLowerCase()
    .replace(/[.,;:!?'"()[\]{}]/g, '')
    .replace(/['']/g, "'")
    .trim();
}

// Split gloss into component words (split on hyphens)
function glossWords(gloss) {
  if (!gloss || gloss === '—' || gloss === '׃' || gloss === '') return [];
  return gloss.split('-').map(normalizeWord).filter(w => w.length > 0);
}

// Common function words that are OK to appear in glosses even if not in official
const functionWords = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'shall', 'would',
  'should', 'may', 'might', 'can', 'could', 'not', 'no', 'nor',
  'if', 'then', 'that', 'this', 'these', 'those', 'it', 'its',
  'he', 'she', 'him', 'her', 'his', 'my', 'your', 'our', 'their',
  'me', 'you', 'us', 'them', 'we', 'they', 'i', 'who', 'whom',
  'which', 'what', 'where', 'when', 'how', 'why', 'all', 'each',
  'every', 'some', 'any', 'so', 'as', 'up', 'out', 'about',
]);

// Stem simple English words (very basic)
function stems(word) {
  const w = normalizeWord(word);
  const result = [w];
  // Add common variations
  if (w.endsWith('ed')) result.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith('ing')) result.push(w.slice(0, -3), w.slice(0, -3) + 'e');
  if (w.endsWith('s') && !w.endsWith('ss')) result.push(w.slice(0, -1));
  if (w.endsWith('es')) result.push(w.slice(0, -2));
  if (w.endsWith('tion')) result.push(w.slice(0, -4) + 't', w.slice(0, -4) + 'te');
  if (w.endsWith('ly')) result.push(w.slice(0, -2));
  if (w.endsWith('ness')) result.push(w.slice(0, -4));
  if (w.endsWith('ment')) result.push(w.slice(0, -4));
  return result;
}

// Check if a word (or its stems) appears in the official text words
function wordInOfficial(word, officialWords) {
  if (functionWords.has(word)) return true;
  const wordStems = stems(word);
  for (const stem of wordStems) {
    if (stem.length < 2) continue;
    for (const ow of officialWords) {
      const owStems = stems(ow);
      if (owStems.some(os => os === stem)) return true;
      // Also check if one contains the other
      if (stem.length >= 4 && ow.startsWith(stem)) return true;
      if (stem.length >= 4 && ow.includes(stem)) return true;
    }
  }
  return false;
}

// Compare all verses
let totalVerses = 0;
let matchedVerses = 0;
let totalWords = 0;
let matchedWords = 0;
let mismatchedGlosses = [];

const bookStats = {};

for (const [varName, verses] of Object.entries(verseArrays)) {
  const bc = getBookChapter(varName);
  if (!bc) continue; // skip front matter, colophons

  const { book, chapter } = bc;
  if (!bookStats[book]) bookStats[book] = { total: 0, matched: 0, mismatched: 0 };

  for (const verse of verses) {
    if (!verse || !verse.words) continue;
    const verseNum = hebToNum(verse.num);
    if (verseNum < 1) continue;

    const key = `${book} ${chapter}:${verseNum}`;
    const officialText = officialMap[key];

    if (!officialText) {
      // No official match found
      continue;
    }

    totalVerses++;
    const officialWords = officialText.split(/\s+/).map(normalizeWord).filter(w => w);

    let verseMismatches = [];

    for (const [heb, eng] of verse.words) {
      if (!eng || eng === '' || eng === '—' || heb === '׃') continue;

      totalWords++;
      bookStats[book].total++;

      const parts = glossWords(eng);
      const nonFunctionParts = parts.filter(p => !functionWords.has(p));

      if (nonFunctionParts.length === 0) {
        // All function words - OK
        matchedWords++;
        bookStats[book].matched++;
        continue;
      }

      // Check if content words appear in official text
      const allFound = nonFunctionParts.every(p => wordInOfficial(p, officialWords));

      if (allFound) {
        matchedWords++;
        bookStats[book].matched++;
      } else {
        bookStats[book].mismatched++;
        const missingWords = nonFunctionParts.filter(p => !wordInOfficial(p, officialWords));
        verseMismatches.push({
          hebrew: heb,
          currentGloss: eng,
          missingWords,
          verse: key
        });
      }
    }

    if (verseMismatches.length === 0) {
      matchedVerses++;
    } else {
      mismatchedGlosses.push(...verseMismatches);
    }
  }
}

// Report
console.log('\n========================================');
console.log('  GLOSS vs OFFICIAL ENGLISH COMPARISON');
console.log('========================================\n');
console.log(`Total verses compared: ${totalVerses}`);
console.log(`Verses with all glosses matching: ${matchedVerses} (${(matchedVerses/totalVerses*100).toFixed(1)}%)`);
console.log(`Total word glosses checked: ${totalWords}`);
console.log(`Matching glosses: ${matchedWords} (${(matchedWords/totalWords*100).toFixed(1)}%)`);
console.log(`Mismatched glosses: ${mismatchedGlosses.length} (${(mismatchedGlosses.length/totalWords*100).toFixed(1)}%)`);

console.log('\n--- Per-book stats ---');
for (const [book, stats] of Object.entries(bookStats)) {
  const pct = stats.total > 0 ? ((stats.matched/stats.total)*100).toFixed(1) : 'N/A';
  console.log(`  ${book}: ${stats.matched}/${stats.total} match (${pct}%), ${stats.mismatched} mismatched`);
}

// Show sample mismatches per book
console.log('\n--- Sample mismatches (first 5 per book) ---');
const byBook = {};
for (const m of mismatchedGlosses) {
  const book = m.verse.split(' ').slice(0, -1).join(' ');
  if (!byBook[book]) byBook[book] = [];
  byBook[book].push(m);
}

for (const [book, mismatches] of Object.entries(byBook)) {
  console.log(`\n  === ${book} (${mismatches.length} mismatches) ===`);
  for (const m of mismatches.slice(0, 5)) {
    const off = officialMap[m.verse] || '';
    console.log(`  ${m.verse}: "${m.hebrew}" → "${m.currentGloss}" (missing: ${m.missingWords.join(', ')})`);
    console.log(`    Official: ${off.substring(0, 120)}...`);
  }
}

// Save full report
const report = {
  summary: {
    totalVerses,
    matchedVerses,
    totalWords,
    matchedWords,
    mismatchCount: mismatchedGlosses.length,
    matchRate: `${(matchedWords/totalWords*100).toFixed(1)}%`
  },
  bookStats,
  mismatches: mismatchedGlosses
};

fs.writeFileSync(
  path.resolve(__dirname, 'gloss_comparison_report.json'),
  JSON.stringify(report, null, 2)
);
console.log('\nFull report saved to gloss_comparison_report.json');
