// Step 2: Extract Hebrew text from DOCX for missing chapters
// DOCX is a ZIP file containing word/document.xml
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const baseDir = 'C:\\Users\\chris\\Desktop\\Hebrew BOM';
const docxPath = path.join(baseDir, 'Hebrew_BOM_20_February_2026.docx');
const extractDir = path.join(baseDir, 'docx_extract');

// Unzip the DOCX (copy as .zip first since PowerShell requires .zip extension)
if (!fs.existsSync(extractDir)) {
  fs.mkdirSync(extractDir, { recursive: true });
}

const zipCopy = path.join(baseDir, 'temp_docx.zip');
fs.copyFileSync(docxPath, zipCopy);
execSync(`powershell -Command "Expand-Archive -Path '${zipCopy}' -DestinationPath '${extractDir}' -Force"`, { stdio: 'inherit' });
fs.unlinkSync(zipCopy);

// Parse the document.xml
const xmlPath = path.join(extractDir, 'word', 'document.xml');
const xml = fs.readFileSync(xmlPath, 'utf8');

// Parse paragraphs - extract text from w:t elements within each w:p
function extractParagraphs(xml) {
  const paragraphs = [];
  // Match each w:p element
  const pRegex = /<w:p[ >][\s\S]*?<\/w:p>/g;
  let pMatch;
  while ((pMatch = pRegex.exec(xml)) !== null) {
    const pXml = pMatch[0];

    // Get paragraph style
    let style = 'Normal';
    const styleMatch = pXml.match(/<w:pStyle w:val="([^"]+)"/);
    if (styleMatch) style = styleMatch[1];

    // Extract all text runs
    let text = '';
    const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let tMatch;
    while ((tMatch = tRegex.exec(pXml)) !== null) {
      text += tMatch[1];
    }
    text = text.trim();
    if (text) {
      paragraphs.push({ style, text });
    }
  }
  return paragraphs;
}

const paragraphs = extractParagraphs(xml);
console.log(`Total paragraphs with text: ${paragraphs.length}`);

// Hebrew book names and their codes
const bookMap = [
  { name: 'נפי א׳', code: '1n', chapters: 22 },
  { name: 'נפי ב׳', code: '2n', chapters: 33 },
  { name: 'יעקב', code: 'jc', chapters: 7 },
  { name: 'אנוש', code: 'en', chapters: 1 },
  { name: 'ירום', code: 'jr', chapters: 1 },
  { name: 'עמני', code: 'om', chapters: 1 },
  { name: 'דברי מורמון', code: 'wm', chapters: 1 },
  { name: 'מושיה', code: 'mo', chapters: 29 },
  { name: 'אלמא', code: 'al', chapters: 63 },
  { name: 'הילמן', code: 'he', chapters: 16 },
  { name: 'נפי ג׳', code: '3n', chapters: 30 },
  { name: 'נפי ד׳', code: '4n', chapters: 1 },
  { name: 'מורמון', code: 'mm', chapters: 9 },
  { name: 'אתר', code: 'et', chapters: 15 },
  { name: 'מורוני', code: 'mr', chapters: 10 },
];

// Hebrew numeral to Arabic mapping
const hebrewNumerals = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'יא': 11, 'יב': 12, 'יג': 13, 'יד': 14, 'טו': 15, 'טז': 16,
  'יז': 17, 'יח': 18, 'יט': 19, 'כ': 20, 'כא': 21, 'כב': 22, 'כג': 23,
  'כד': 24, 'כה': 25, 'כו': 26, 'כז': 27, 'כח': 28, 'כט': 29, 'ל': 30,
  'לא': 31, 'לב': 32, 'לג': 33, 'לד': 34, 'לה': 35, 'לו': 36, 'לז': 37,
  'לח': 38, 'לט': 39, 'מ': 40, 'מא': 41, 'מב': 42, 'מג': 43, 'מד': 44,
  'מה': 45, 'מו': 46, 'מז': 47, 'מח': 48, 'מט': 49, 'נ': 50, 'נא': 51,
  'נב': 52, 'נג': 53, 'נד': 54, 'נה': 55, 'נו': 56, 'נז': 57, 'נח': 58,
  'נט': 59, 'ס': 60, 'סא': 61, 'סב': 62, 'סג': 63, 'סד': 64, 'סה': 65,
  'סו': 66, 'סז': 67, 'סח': 68, 'סט': 69, 'ע': 70, 'עא': 71, 'עב': 72,
  'עג': 73, 'עד': 74, 'עה': 75, 'עו': 76, 'עז': 77,
};

// Reverse: Arabic to Hebrew numeral
const arabicToHebrew = {};
for (const [heb, num] of Object.entries(hebrewNumerals)) {
  arabicToHebrew[num] = heb;
}

// Parse the document into books/chapters/verses
const result = {};
let currentBook = null;
let currentChapter = 0;
let currentBookCode = null;

for (let i = 0; i < paragraphs.length; i++) {
  const { style, text } = paragraphs[i];

  // Detect book header (Heading1)
  if (style === 'Heading1') {
    const book = bookMap.find(b => text.includes(b.name));
    if (book) {
      currentBook = book.name;
      currentBookCode = book.code;
      currentChapter = 0;
      result[currentBookCode] = result[currentBookCode] || {};

      // Single-chapter books don't have chapter headings
      if (book.chapters === 1) {
        currentChapter = 1;
        result[currentBookCode][1] = [];
      }
    }
    continue;
  }

  // Detect chapter header (Heading2 with פרק)
  if (style === 'Heading2' && text.includes('פרק')) {
    const chapterText = text.replace('פרק', '').trim();
    const chapterNum = hebrewNumerals[chapterText];
    if (chapterNum && currentBookCode) {
      currentChapter = chapterNum;
      result[currentBookCode][currentChapter] = [];
    }
    continue;
  }

  // Detect verse (Normal paragraph starting with Hebrew numeral followed by period)
  if (style === 'Normal' && currentBookCode && currentChapter > 0) {
    // Match verse number pattern: Hebrew letter(s) followed by a period and space
    const verseMatch = text.match(/^([א-ת]{1,2})\.\s+(.+)/);
    if (verseMatch) {
      const verseNumHeb = verseMatch[1];
      const verseText = verseMatch[2].trim();
      const verseNum = hebrewNumerals[verseNumHeb];

      if (verseNum) {
        if (!result[currentBookCode][currentChapter]) {
          result[currentBookCode][currentChapter] = [];
        }
        result[currentBookCode][currentChapter].push({
          num: verseNumHeb,
          arabicNum: verseNum,
          text: verseText
        });
      }
    }
  }
}

// Save the extracted text
fs.writeFileSync(
  path.join(baseDir, 'extracted_verses.json'),
  JSON.stringify(result, null, 2),
  'utf8'
);

// Print summary for missing books
const missingBooks = ['al', 'he', '3n', 'et'];
for (const code of missingBooks) {
  const bookData = result[code];
  if (!bookData) {
    console.log(`${code}: NOT FOUND`);
    continue;
  }
  const chapters = Object.keys(bookData).map(Number).sort((a, b) => a - b);
  const totalVerses = chapters.reduce((sum, ch) => sum + (bookData[ch] ? bookData[ch].length : 0), 0);
  console.log(`${code}: ${chapters.length} chapters, ${totalVerses} verses`);

  // Show first verse of first chapter as sample
  if (chapters.length > 0 && bookData[chapters[0]] && bookData[chapters[0]].length > 0) {
    const sample = bookData[chapters[0]][0];
    console.log(`  Sample (ch${chapters[0]} v1): ${sample.text.substring(0, 80)}...`);
  }
}
