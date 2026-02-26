// Step 3: Generate interlinear JS data for missing chapters
// Tokenize Hebrew text, match with dictionary, report coverage
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\chris\\Desktop\\Hebrew BOM';
const dict = JSON.parse(fs.readFileSync(path.join(baseDir, 'gloss_dictionary.json'), 'utf8'));
const fullDict = JSON.parse(fs.readFileSync(path.join(baseDir, 'gloss_dictionary_full.json'), 'utf8'));
const verses = JSON.parse(fs.readFileSync(path.join(baseDir, 'extracted_verses.json'), 'utf8'));

// Hebrew numeral lookup
const arabicToHebrew = {};
const hebrewNumerals = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'יא': 11, 'יב': 12, 'יג': 13, 'יד': 14, 'טו': 15, 'טז': 16,
  'יז': 17, 'יח': 18, 'יט': 19, 'כ': 20, 'כא': 21, 'כב': 22, 'כג': 23,
  'כד': 24, 'כה': 25, 'כו': 26, 'כז': 27, 'כח': 28, 'כט': 29, 'ל': 30,
  'לא': 31, 'לב': 32, 'לג': 33, 'לד': 34, 'לה': 35, 'לו': 36, 'לז': 37,
  'לח': 38, 'לט': 39, 'מ': 40, 'מא': 41, 'מב': 42, 'מג': 43, 'מד': 44,
  'מה': 45, 'מו': 46, 'מז': 47, 'מח': 48, 'מט': 49, 'נ': 50, 'נא': 51,
  'נב': 52, 'נג': 53, 'נד': 54, 'נה': 55, 'נו': 56, 'נז': 57, 'נח': 58,
  'נט': 59, 'ס': 60, 'סא': 61, 'סב': 62, 'סג': 63,
  'עז': 77,
};
for (const [h, n] of Object.entries(hebrewNumerals)) arabicToHebrew[n] = h;

// Tokenize a Hebrew verse text into words
function tokenize(text) {
  // Hebrew text may use spaces and maqaf (־) to separate words
  // Some words are joined with maqaf, keep those together
  // Split on spaces, preserve maqaf-joined tokens
  return text.split(/\s+/).filter(w => w.length > 0);
}

// Look up a gloss in the dictionary with fallback strategies
function lookupGloss(word) {
  // Direct match
  if (dict[word]) return dict[word];

  // Try without trailing punctuation (sof pasuk ׃, etc.)
  const cleaned = word.replace(/[׃:\.;,!?]/g, '').trim();
  if (cleaned && dict[cleaned]) return dict[cleaned];

  // Try matching a variant with different niqqud/vowels
  // Not easily done without a full morphological analyzer

  return null;
}

// Missing chapters to process
const missingChapters = {
  'al': Array.from({length: 63}, (_, i) => i + 1),          // Alma 1-63
  'he': Array.from({length: 12}, (_, i) => i + 5),           // Helaman 5-16
  '3n': Array.from({length: 30}, (_, i) => i + 1),           // 3 Nephi 1-30
  'et': Array.from({length: 15}, (_, i) => i + 1),           // Ether 1-15
};

let totalWords = 0;
let matchedWords = 0;
let unmatchedSet = {};

// Process each book
for (const [bookCode, chapters] of Object.entries(missingChapters)) {
  const bookData = verses[bookCode];
  if (!bookData) {
    console.log(`WARNING: No data for ${bookCode}`);
    continue;
  }

  let bookTotal = 0;
  let bookMatched = 0;

  for (const chapterNum of chapters) {
    const chapterVerses = bookData[chapterNum];
    if (!chapterVerses) {
      console.log(`WARNING: ${bookCode} chapter ${chapterNum} not found in DOCX`);
      continue;
    }

    for (const verse of chapterVerses) {
      const words = tokenize(verse.text);
      for (const word of words) {
        totalWords++;
        bookTotal++;
        const gloss = lookupGloss(word);
        if (gloss) {
          matchedWords++;
          bookMatched++;
        } else {
          unmatchedSet[word] = (unmatchedSet[word] || 0) + 1;
        }
      }
    }
  }

  const pct = bookTotal > 0 ? ((bookMatched / bookTotal) * 100).toFixed(1) : '0';
  console.log(`${bookCode}: ${bookMatched}/${bookTotal} words matched (${pct}%)`);
}

console.log(`\nTotal: ${matchedWords}/${totalWords} words matched (${((matchedWords/totalWords)*100).toFixed(1)}%)`);
console.log(`Unique unmatched words: ${Object.keys(unmatchedSet).length}`);

// Sort unmatched by frequency
const sorted = Object.entries(unmatchedSet).sort((a, b) => b[1] - a[1]);
console.log(`\nTop 50 most frequent unmatched words:`);
sorted.slice(0, 50).forEach(([w, c]) => console.log(`  ${w} (${c}x)`));

// Save all unmatched for review
fs.writeFileSync(
  path.join(baseDir, 'unmatched_words.json'),
  JSON.stringify(sorted, null, 2),
  'utf8'
);
