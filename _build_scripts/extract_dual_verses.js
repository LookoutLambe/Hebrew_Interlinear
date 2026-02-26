// Extract verse-aligned Hebrew + Official English from the dual BOM DOCX XML
// Structure: 2-column tables with Hebrew (left, RTL) | English (right)
// Book headers like "The First Book of Nephi", chapters like "Chapter 1"
// Verses start with Hebrew letter+period (e.g. "א.") and English number

const fs = require('fs');
const path = require('path');

const XML_FILE = 'C:\\Users\\chris\\AppData\\Local\\Temp\\dual_bom_extracted\\word\\document.xml';

console.log('Reading XML...');
const xml = fs.readFileSync(XML_FILE, 'utf8');

// Extract all table rows
const rows = [];
const trRegex = /<w:tr[\s>][\s\S]*?<\/w:tr>/g;
let trMatch;
while ((trMatch = trRegex.exec(xml)) !== null) {
  const row = trMatch[0];
  const cells = [];
  const tcRegex = /<w:tc[\s>][\s\S]*?<\/w:tc>/g;
  let tcMatch;
  while ((tcMatch = tcRegex.exec(row)) !== null) {
    const cell = tcMatch[0];
    const texts = [];
    const tRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let tMatch;
    while ((tMatch = tRegex.exec(cell)) !== null) {
      if (tMatch[1].trim()) texts.push(tMatch[1]);
    }
    cells.push(texts.join(' ').trim());
  }
  if (cells.length >= 2) {
    rows.push({ hebrew: cells[0], english: cells[1] });
  }
}

console.log(`Extracted ${rows.length} table rows`);

// Parse book/chapter/verse structure
const verses = [];
let currentBook = '';
let currentChapter = 0;

// Book name mappings from English headings to standard short names
const bookMap = {
  'the first book of nephi':  '1 Nephi',
  'first book of nephi':      '1 Nephi',
  'the second book of nephi': '2 Nephi',
  'second book of nephi':     '2 Nephi',
  'the book of jacob':        'Jacob',
  'book of jacob':            'Jacob',
  'the book of enos':         'Enos',
  'book of enos':             'Enos',
  'the book of jarom':        'Jarom',
  'book of jarom':            'Jarom',
  'the book of omni':         'Omni',
  'book of omni':             'Omni',
  'the words of mormon':      'Words of Mormon',
  'words of mormon':          'Words of Mormon',
  'the book of mosiah':       'Mosiah',
  'book of mosiah':           'Mosiah',
  'the book of alma':         'Alma',
  'book of alma':             'Alma',
  'the book of helaman':      'Helaman',
  'book of helaman':          'Helaman',
  'third nephi':              '3 Nephi',
  'the book of third nephi':  '3 Nephi',
  'fourth nephi':             '4 Nephi',
  'the book of fourth nephi': '4 Nephi',
  'the book of mormon':       'Mormon',
  'book of mormon':           'Mormon',
  'the book of ether':        'Ether',
  'book of ether':            'Ether',
  'the book of moroni':       'Moroni',
  'book of moroni':           'Moroni',
};

// Hebrew book name mappings
const hebBookMap = {
  'נפי א׳': '1 Nephi',
  'נפי ב׳': '2 Nephi',
  'יעקב':   'Jacob',
  'אנוש':   'Enos',
  'ירום':    'Jarom',
  'עמני':    'Omni',
  'דברי מורמון': 'Words of Mormon',
  'מושיה':   'Mosiah',
  'אלמא':   'Alma',
  'הילמן':   'Helaman',
  'נפי ג׳': '3 Nephi',
  'נפי ד׳': '4 Nephi',
  'מורמון':  'Mormon',
  'עתר':     'Ether',
  'מורוני':  'Moroni',
};

for (let i = 0; i < rows.length; i++) {
  const { hebrew, english } = rows[i];
  const engLower = english.toLowerCase().trim();

  // Check for book heading
  let foundBook = false;
  for (const [pattern, name] of Object.entries(bookMap)) {
    if (engLower.includes(pattern) && english.length < 120) {
      currentBook = name;
      currentChapter = 0;
      foundBook = true;
      break;
    }
  }
  if (!foundBook) {
    // Check Hebrew book names
    const hebClean = hebrew.replace(/[\u0591-\u05C7]/g, '').trim();
    for (const [pattern, name] of Object.entries(hebBookMap)) {
      if (hebClean === pattern) {
        currentBook = name;
        currentChapter = 0;
        foundBook = true;
        break;
      }
    }
  }
  if (foundBook) continue;

  // Check for chapter heading
  const chMatch = english.match(/^Chapter\s+(\d+)$/i);
  if (chMatch) {
    currentChapter = parseInt(chMatch[1]);
    continue;
  }

  // Check Hebrew chapter heading
  const hebChMatch = hebrew.match(/^פרק\s+/);
  if (hebChMatch && english.match(/^Chapter\s+\d+$/i)) {
    continue; // Already handled above
  }

  // Extract verse - English starts with number, Hebrew starts with Hebrew letter + period
  const engVerseMatch = english.match(/^(\d+)\s+(.+)/s);
  const hebVerseMatch = hebrew.match(/^([א-ת]{1,2})\.\s*(.+)/s);

  if (engVerseMatch && hebrew && currentBook) {
    const verseNum = parseInt(engVerseMatch[1]);
    const engText = engVerseMatch[2].trim();
    // Strip Hebrew verse letter prefix if present
    const hebText = hebVerseMatch ? hebVerseMatch[2].trim() : hebrew.trim();

    verses.push({
      book: currentBook,
      chapter: currentChapter,
      verse: verseNum,
      hebrew: hebText,
      english: engText
    });
  }
}

console.log(`Parsed ${verses.length} verses`);

// Stats
const bookCounts = {};
verses.forEach(v => {
  const key = v.book;
  bookCounts[key] = (bookCounts[key] || 0) + 1;
});
console.log('\nVerses per book:');
for (const [book, count] of Object.entries(bookCounts)) {
  console.log(`  ${book}: ${count}`);
}

// Show sample verses
console.log('\n=== 1 NEPHI 1:1-3 ===');
verses.filter(v => v.book === '1 Nephi' && v.chapter === 1 && v.verse <= 3).forEach(v => {
  console.log(`\n${v.book} ${v.chapter}:${v.verse}`);
  console.log(`  HEB: ${v.hebrew.substring(0, 150)}`);
  console.log(`  ENG: ${v.english.substring(0, 150)}`);
});

console.log('\n=== ALMA 32:1-2 ===');
verses.filter(v => v.book === 'Alma' && v.chapter === 32 && v.verse <= 2).forEach(v => {
  console.log(`\n${v.book} ${v.chapter}:${v.verse}`);
  console.log(`  HEB: ${v.hebrew.substring(0, 150)}`);
  console.log(`  ENG: ${v.english.substring(0, 150)}`);
});

console.log('\n=== MORONI 10:3-5 ===');
verses.filter(v => v.book === 'Moroni' && v.chapter === 10 && v.verse >= 3 && v.verse <= 5).forEach(v => {
  console.log(`\n${v.book} ${v.chapter}:${v.verse}`);
  console.log(`  HEB: ${v.hebrew.substring(0, 150)}`);
  console.log(`  ENG: ${v.english.substring(0, 150)}`);
});

// Save
const outPath = path.resolve(__dirname, 'official_verses.json');
fs.writeFileSync(outPath, JSON.stringify(verses, null, 0));
console.log(`\nSaved ${verses.length} verses to official_verses.json (${(fs.statSync(outPath).size/1024/1024).toFixed(1)} MB)`);
