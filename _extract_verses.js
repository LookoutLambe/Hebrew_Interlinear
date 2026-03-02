#!/usr/bin/env node
// Extraction script: Moves verse data from BOM.html to external verses/*.js files
// Run: node _extract_verses.js

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, 'BOM.html');
const VERSES_DIR = path.join(__dirname, 'verses');
const OUTPUT_PATH = path.join(__dirname, 'BOM_new.html');

// Read BOM.html
const lines = fs.readFileSync(HTML_PATH, 'utf-8').split('\n');
console.log('Total lines:', lines.length);

// Book definitions
const BOOKS = [
  { name: '1nephi', vars: /^const ch(\d+)Verses\b/, prefix: 'ch', renderPat: /^renderVerseSet\(ch\d+Verses,/, extra: [/^const colophonWords\b/, /^renderColophon\(\)/] },
  { name: '2nephi', vars: /^const n2_ch(\d+)Verses\b/, prefix: '2n-ch', renderPat: /^renderVerseSet\(n2_(ch\d+Verses|colophonVerses),/, extra: [/^const n2_colophonVerses\b/] },
  { name: 'jacob', vars: /^const jc_ch(\d+)Verses\b/, prefix: 'jc-ch', renderPat: /^renderVerseSet\(jc_(ch\d+Verses|colophonVerses),/, extra: [/^const jc_colophonVerses\b/] },
  { name: 'enos', vars: /^const en_ch(\d+)Verses\b/, prefix: 'en-ch', renderPat: /^renderVerseSet\(en_ch\d+Verses,/ },
  { name: 'jarom', vars: /^const jr_ch(\d+)Verses\b/, prefix: 'jr-ch', renderPat: /^renderVerseSet\(jr_ch\d+Verses,/ },
  { name: 'omni', vars: /^const om_ch(\d+)Verses\b/, prefix: 'om-ch', renderPat: /^renderVerseSet\(om_ch\d+Verses,/ },
  { name: 'words_of_mormon', vars: /^const wm_ch(\d+)Verses\b/, prefix: 'wm-ch', renderPat: /^renderVerseSet\(wm_ch\d+Verses,/ },
  { name: 'mosiah', vars: /^const mo_ch(\d+)Verses\b/, prefix: 'mo-ch', renderPat: /^renderVerseSet\(mo_ch\d+Verses,/ },
  { name: 'alma', vars: /^const al_ch(\d+)Verses\b/, prefix: 'al-ch', renderPat: /^renderVerseSet\(al_ch\d+Verses,/ },
  { name: 'helaman', vars: /^const he_ch(\d+)Verses\b/, prefix: 'he-ch', renderPat: /^renderVerseSet\(he_ch\d+Verses,/ },
  { name: '3nephi', vars: /^const tn_ch(\d+)Verses\b/, prefix: '3n-ch', renderPat: /^renderVerseSet\(tn_ch\d+Verses,/ },
  { name: '4nephi', vars: /^const fn_ch(\d+)Verses\b/, prefix: '4n-ch', renderPat: /^renderVerseSet\(fn_ch\d+Verses,/ },
  { name: 'mormon', vars: /^const mm_ch(\d+)Verses\b/, prefix: 'mm-ch', renderPat: /^renderVerseSet\(mm_ch\d+Verses,/ },
  { name: 'ether', vars: /^const et_ch(\d+)Verses\b/, prefix: 'et-ch', renderPat: /^renderVerseSet\(et_ch\d+Verses,/ },
  { name: 'moroni', vars: /^const mr_ch(\d+)Verses\b/, prefix: 'mr-ch', renderPat: /^renderVerseSet\(mr_ch\d+Verses,/ },
  { name: 'frontmatter', vars: /^const (frontIntro|frontTitle|frontIntroduction|frontThreeWit|frontEightWit|frontJST|frontBrief)\b/, prefix: 'front', renderPat: /^renderVerseSet\(front(Intro|Title|Introduction|ThreeWit|EightWit|JST|Brief),/ },
];

// Orphaned comment patterns that should also be removed (section headers for verse data)
const ORPHAN_COMMENTS = [
  /^\/\/ =+$/,
  /^\/\/ ═+$/,
  /^\/\/ COLOPHON DATA$/,
  /^\/\/ FRONT MATTER/,
  /^\/\/ Each section is an array/,
  /^\/\/ מבוא המתרגם/,
  /^\/\/ 2 NEPHI/i,
  /^\/\/ 1 NEPHI/i,
  /^\/\/ JACOB/i,
  /^\/\/ ENOS/i,
  /^\/\/ JAROM/i,
  /^\/\/ OMNI/i,
  /^\/\/ WORDS OF MORMON/i,
  /^\/\/ MOSIAH/i,
  /^\/\/ ALMA/i,
  /^\/\/ HELAMAN/i,
  /^\/\/ 3 NEPHI/i,
  /^\/\/ 4 NEPHI/i,
  /^\/\/ MORMON/i,
  /^\/\/ ETHER/i,
  /^\/\/ MORONI/i,
  /^\/\/ BRIEF EXPLANATION/i,
];

// Collect lines for each book
const bookLines = {};
BOOKS.forEach(b => bookLines[b.name] = []);

// Track which lines to remove
const removeLines = new Set();

// State machine
let insideConst = false;
let currentBook = null;
let bracketDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  if (insideConst) {
    bookLines[currentBook].push(line);
    removeLines.add(i);
    for (let c = 0; c < trimmed.length; c++) {
      if (trimmed[c] === '[') bracketDepth++;
      else if (trimmed[c] === ']') bracketDepth--;
    }
    if (bracketDepth <= 0) {
      insideConst = false;
      currentBook = null;
    }
    continue;
  }

  // Check verse constants and renderVerseSet calls
  let matched = false;
  for (const book of BOOKS) {
    if (book.vars.test(trimmed)) {
      insideConst = true;
      currentBook = book.name;
      bracketDepth = 0;
      for (let c = 0; c < trimmed.length; c++) {
        if (trimmed[c] === '[') bracketDepth++;
        else if (trimmed[c] === ']') bracketDepth--;
      }
      if (bracketDepth <= 0) insideConst = false;
      bookLines[book.name].push(line);
      removeLines.add(i);
      matched = true;
      break;
    }
    if (book.renderPat.test(trimmed)) {
      bookLines[book.name].push(line);
      removeLines.add(i);
      matched = true;
      break;
    }
    if (book.extra) {
      for (const pat of book.extra) {
        if (pat.test(trimmed)) {
          bookLines[book.name].push(line);
          removeLines.add(i);
          matched = true;
          // If this line contains an opening bracket, enter bracket-tracking mode
          let openBrackets = 0;
          for (let c = 0; c < trimmed.length; c++) {
            if (trimmed[c] === '[') openBrackets++;
            else if (trimmed[c] === ']') openBrackets--;
          }
          if (openBrackets > 0) {
            insideConst = true;
            currentBook = book.name;
            bracketDepth = openBrackets;
          }
          break;
        }
      }
      if (matched) break;
    }
  }

  // Catch orphaned comment headers
  if (!matched) {
    for (const pat of ORPHAN_COMMENTS) {
      if (pat.test(trimmed)) {
        removeLines.add(i);
        matched = true;
        break;
      }
    }
  }
}

console.log('\nLines collected per book:');
let totalExtracted = 0;
for (const book of BOOKS) {
  console.log(`  ${book.name}: ${bookLines[book.name].length} lines`);
  totalExtracted += bookLines[book.name].length;
}
console.log(`Total extracted: ${totalExtracted}`);
console.log(`Total lines to remove (incl comments): ${removeLines.size}`);

// Write external JS files
if (!fs.existsSync(VERSES_DIR)) fs.mkdirSync(VERSES_DIR);

const BOOK_LABELS = {
  '1nephi': '1 Nephi', '2nephi': '2 Nephi', 'jacob': 'Jacob',
  'enos': 'Enos', 'jarom': 'Jarom', 'omni': 'Omni',
  'words_of_mormon': 'Words of Mormon', 'mosiah': 'Mosiah', 'alma': 'Alma',
  'helaman': 'Helaman', '3nephi': '3 Nephi', '4nephi': '4 Nephi',
  'mormon': 'Mormon', 'ether': 'Ether', 'moroni': 'Moroni',
  'frontmatter': 'Front Matter'
};

for (const book of BOOKS) {
  const content = bookLines[book.name];
  if (content.length === 0) {
    console.log(`WARNING: No lines found for ${book.name}`);
    continue;
  }
  const transformed = content.map(l => l.replace(/^(\s*)const /, '$1var '));
  const filePath = path.join(VERSES_DIR, book.name + '.js');
  const output = `// verses/${book.name}.js — ${BOOK_LABELS[book.name]} verse data\n(function() {\n${transformed.join('\n')}\n})();\n`;
  fs.writeFileSync(filePath, output, 'utf-8');
  console.log(`Wrote ${filePath} (${output.length} bytes)`);
}

// Write cleaned BOM.html — collapse excessive blank lines
const outputLines = [];
let consecutiveBlank = 0;
for (let i = 0; i < lines.length; i++) {
  if (removeLines.has(i)) continue;
  if (lines[i].trim() === '') {
    consecutiveBlank++;
    if (consecutiveBlank > 1) continue; // max 1 consecutive blank
  } else {
    consecutiveBlank = 0;
  }
  outputLines.push(lines[i]);
}

// Insert script tags after the transliteration restore block
const insertScripts = [
  '</script>',
  '<script src="verses/frontmatter.js"></script>',
  '<script src="verses/1nephi.js"></script>',
  '<script src="verses/2nephi.js"></script>',
  '<script src="verses/jacob.js"></script>',
  '<script src="verses/enos.js"></script>',
  '<script src="verses/jarom.js"></script>',
  '<script src="verses/omni.js"></script>',
  '<script src="verses/words_of_mormon.js"></script>',
  '<script src="verses/mosiah.js"></script>',
  '<script src="verses/alma.js"></script>',
  '<script src="verses/helaman.js"></script>',
  '<script src="verses/3nephi.js"></script>',
  '<script src="verses/4nephi.js"></script>',
  '<script src="verses/mormon.js"></script>',
  '<script src="verses/ether.js"></script>',
  '<script src="verses/moroni.js"></script>',
  '<script>',
];

let insertIdx = -1;
for (let i = 0; i < outputLines.length; i++) {
  if (outputLines[i].trim().includes("} catch(e) { document.body.classList.add('hide-translit'); }")) {
    insertIdx = i + 1;
    break;
  }
}

if (insertIdx !== -1) {
  outputLines.splice(insertIdx, 0, ...insertScripts);
  console.log(`\nInserted script tags at output line ${insertIdx}`);
} else {
  console.log('ERROR: Could not find insertion point!');
}

fs.writeFileSync(OUTPUT_PATH, outputLines.join('\n'), 'utf-8');
console.log(`Wrote ${OUTPUT_PATH} (${outputLines.length} lines, was ${lines.length})`);
