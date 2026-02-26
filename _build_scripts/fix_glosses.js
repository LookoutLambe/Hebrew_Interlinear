// Fix English glosses in BOM.html — HEBREW-FIRST approach
// 1. Resolve slash alternatives (pick the one in official text for THAT verse)
// 2. Conservative stem matching (only inflectional: plural/tense of same root)
// 3. Formatting cleanup ([ACC] → ACC, remove gender markers)
// DOES NOT change words that are valid Hebrew translations even if different from official
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_FILE = path.resolve(__dirname, 'BOM.html');
const OFFICIAL_FILE = path.resolve(__dirname, 'official_verses.json');

console.log('Reading files...');
let html = fs.readFileSync(HTML_FILE, 'utf8');
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

// Fix a single verse's glosses
function fixVerseGlosses(verseWords, officialText) {
  const offTokens = tokenize(officialText);
  const vocabNorm = new Set(offTokens.map(w => norm(w)));

  const result = {};
  let slashResolved = 0;
  let formatFixed = 0;

  for (let wi = 0; wi < verseWords.length; wi++) {
    const [heb, eng] = verseWords[wi];
    if (!eng || eng.trim() === '' || eng === '—' || heb === '׃') continue;

    let newGloss = eng;
    let changed = false;

    // 1. Formatting cleanup
    const cleaned = newGloss
      .replace(/\(f\)|\(m\)|\(pl\)|\(sg\)|\(du\)/gi, '')
      .replace(/\[ACC\]/gi, 'ACC')
      .replace(/\[REL\]/gi, 'REL')
      .trim();
    if (cleaned !== newGloss) {
      newGloss = cleaned;
      changed = true;
    }

    // NOTE: Slash alternatives (like "who/which/that", "but/surely") are
    // INTENTIONAL Schottenstein-style interlinear notation showing the range
    // of meanings for the Hebrew word. DO NOT resolve them.

    if (changed && newGloss !== eng) {
      result[wi] = newGloss;
    }
  }

  return result;
}

// Extract verse arrays
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

console.log('Extracting verse arrays...');
const verseArrays = extractVerseArrays(html);
console.log(`Extracted ${Object.keys(verseArrays).length} verse arrays`);

// Process all verses
const allFixes = {};
let totalFixed = 0;
let totalProcessed = 0;
const examples = [];

for (const [varName, verses] of Object.entries(verseArrays)) {
  const bc = getBookChapter(varName);
  if (!bc) continue;
  const { book, chapter } = bc;

  for (let vi = 0; vi < verses.length; vi++) {
    const verse = verses[vi];
    if (!verse || !verse.words) continue;
    const verseNum = hebToNum(verse.num);
    if (verseNum < 1) continue;

    const key = `${book} ${chapter}:${verseNum}`;
    const officialText = officialMap[key];
    if (!officialText) continue;

    totalProcessed++;
    const fixes = fixVerseGlosses(verse.words, officialText);
    if (!fixes || Object.keys(fixes).length === 0) continue;

    for (const [wiStr, newGloss] of Object.entries(fixes)) {
      if (!allFixes[varName]) allFixes[varName] = {};
      if (!allFixes[varName][vi]) allFixes[varName][vi] = {};
      allFixes[varName][vi][parseInt(wiStr)] = newGloss;
      totalFixed++;

      if (examples.length < 50) {
        const oldGloss = verse.words[parseInt(wiStr)][1];
        examples.push({ verse: key, old: oldGloss, new: newGloss });
      }
    }
  }
}

console.log(`\nProcessed ${totalProcessed} verses`);
console.log(`Changed ${totalFixed} glosses`);

// Show sample changes
console.log('\n--- Sample changes ---');
for (const ex of examples.slice(0, 20)) {
  console.log(`  ${ex.verse}: "${ex.old}" → "${ex.new}"`);
}

// Apply fixes — handle both inline (one verse per line) and multi-line formats
// Strategy: for each verse array, find it in the HTML and replace word pairs

let newHtml = html;
let totalApplied = 0;

for (const [varName, verseFixes] of Object.entries(allFixes)) {
  // Find the verse array declaration in HTML
  const declPattern = new RegExp(`const\\s+${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*\\[`);
  const declMatch = declPattern.exec(newHtml);
  if (!declMatch) continue;

  const arrayStart = declMatch.index + declMatch[0].length - 1; // position of '['

  // Find matching ']'
  let depth = 1, pos = arrayStart + 1;
  while (pos < newHtml.length && depth > 0) {
    if (newHtml[pos] === '[') depth++;
    else if (newHtml[pos] === ']') depth--;
    pos++;
  }
  if (depth !== 0) continue;
  const arrayEnd = pos; // position after the final ']'

  // Extract the array content and process it
  let arrayContent = newHtml.substring(arrayStart, arrayEnd);

  // For each verse that has fixes, find it in the array content
  // Verses appear as { num:"X", words:[...] }
  // We need to find the Nth verse and replace specific word pairs

  // Count verse occurrences to find the right one
  const versePattern = /\{\s*num\s*:\s*"[^"]+"\s*,\s*words\s*:\s*\[/g;
  let verseMatch;
  let verseIdx = 0;
  const versePositions = [];

  while ((verseMatch = versePattern.exec(arrayContent)) !== null) {
    versePositions.push(verseMatch.index);
    verseIdx++;
  }

  // Process fixes for each verse (in reverse order to preserve positions)
  const verseIndices = Object.keys(verseFixes).map(Number).sort((a, b) => b - a);

  for (const vi of verseIndices) {
    if (vi >= versePositions.length) continue;
    const wordFixes = verseFixes[vi];

    // Find the verse content: from { to the closing } (handling nested brackets)
    const vStart = versePositions[vi];
    // Find the words array within this verse
    // Handle both "words:[" and "words: [" formats
    let wordsStart = arrayContent.indexOf('words:[', vStart);
    if (wordsStart === -1) wordsStart = arrayContent.indexOf('words: [', vStart);
    if (wordsStart === -1) continue;
    const wordsArrayStart = arrayContent.indexOf('[', wordsStart + 5);

    // Find the matching ] for the words array
    let d = 1, p = wordsArrayStart + 1;
    while (p < arrayContent.length && d > 0) {
      if (arrayContent[p] === '[') d++;
      else if (arrayContent[p] === ']') d--;
      p++;
    }
    const wordsArrayEnd = p;

    let wordsContent = arrayContent.substring(wordsArrayStart, wordsArrayEnd);

    // Find all word pairs ["heb","eng"] in this words array
    const pairPattern = /\["((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)"\]/g;
    let pairMatch;
    let wordIdx = 0;
    const pairReplacements = [];

    while ((pairMatch = pairPattern.exec(wordsContent)) !== null) {
      if (wordFixes[wordIdx] !== undefined) {
        const heb = pairMatch[1];
        const newEng = wordFixes[wordIdx].replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        pairReplacements.push({
          start: pairMatch.index,
          end: pairMatch.index + pairMatch[0].length,
          replacement: `["${heb}","${newEng}"]`
        });
        totalApplied++;
      }
      wordIdx++;
    }

    // Apply replacements in reverse order
    for (const rep of pairReplacements.reverse()) {
      wordsContent = wordsContent.substring(0, rep.start) + rep.replacement + wordsContent.substring(rep.end);
    }

    arrayContent = arrayContent.substring(0, wordsArrayStart) + wordsContent + arrayContent.substring(wordsArrayEnd);
  }

  newHtml = newHtml.substring(0, arrayStart) + arrayContent + newHtml.substring(arrayEnd);
}

console.log(`Applied ${totalApplied} replacements to HTML`);
const origSize = Buffer.byteLength(html);
const newSize = Buffer.byteLength(newHtml);
console.log(`\nFile: ${(origSize/1024/1024).toFixed(1)}MB → ${(newSize/1024/1024).toFixed(1)}MB`);
fs.writeFileSync(HTML_FILE, newHtml);
console.log('Written updated BOM.html');
