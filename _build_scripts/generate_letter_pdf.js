// Generate 8.5x11 Interlinear Hebrew BOM PDF — Book-style RTL binding
// Two-pass: front matter (no page numbers) + body (page numbers, mirrored gutter)
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');
const frontMatter = require(path.join(BASE, 'front_matter.json'));

// ─── Book metadata ───────────────────────────────────────────────────
const BOOKS = [
  { name: '1 Nephi',          hebrew: 'נֶפִי א׳',           chapters: 22, prefix: 'ch',    colophon: 'colophonWords' },
  { name: '2 Nephi',          hebrew: 'נֶפִי ב׳',           chapters: 33, prefix: 'n2_ch', colophon: 'n2_colophonVerses' },
  { name: 'Jacob',            hebrew: 'יַעֲקֹב',            chapters: 7,  prefix: 'jc_ch', colophon: 'jc_colophonVerses' },
  { name: 'Enos',             hebrew: 'אֱנוֹשׁ',            chapters: 1,  prefix: 'en_ch' },
  { name: 'Jarom',            hebrew: 'יָרוֹם',             chapters: 1,  prefix: 'jr_ch' },
  { name: 'Omni',             hebrew: 'עָמְנִי',            chapters: 1,  prefix: 'om_ch' },
  { name: 'Words of Mormon',  hebrew: 'דִּבְרֵי מוֹרְמוֹן', chapters: 1,  prefix: 'wm_ch' },
  { name: 'Mosiah',           hebrew: 'מוֹשִׁיָּה',         chapters: 29, prefix: 'mo_ch' },
  { name: 'Alma',             hebrew: 'אַלְמָא',            chapters: 63, prefix: 'al_ch' },
  { name: 'Helaman',          hebrew: 'הֵילָמָן',           chapters: 16, prefix: 'he_ch' },
  { name: '3 Nephi',          hebrew: 'נֶפִי ג׳',           chapters: 30, prefix: 'tn_ch' },
  { name: '4 Nephi',          hebrew: 'נֶפִי ד׳',           chapters: 1,  prefix: 'fn_ch' },
  { name: 'Mormon',           hebrew: 'מוֹרְמוֹן',          chapters: 9,  prefix: 'mm_ch' },
  { name: 'Ether',            hebrew: 'עֵתֶר',              chapters: 15, prefix: 'et_ch' },
  { name: 'Moroni',           hebrew: 'מוֹרוֹנִי',          chapters: 10, prefix: 'mr_ch' },
];

// Hebrew numerals
function hebrewNum(n) {
  if (n <= 0) return String(n);
  const ones = ['','א','ב','ג','ד','ה','ו','ז','ח','ט'];
  const tens = ['','י','כ','ל','מ','נ','ס','ע','פ','צ'];
  const hundreds = ['','ק','ר','ש','ת'];
  if (n === 15) return 'טו';
  if (n === 16) return 'טז';
  let result = '';
  if (n >= 100) { result += hundreds[Math.floor(n/100)]; n %= 100; }
  if (n >= 10) { result += tens[Math.floor(n/10)]; n %= 10; }
  if (n > 0) result += ones[n];
  return result;
}

// ─── RTL gutter margins (points) ─────────────────────────────────────
// Hebrew book: spine on RIGHT
// Odd pages (1,3,5) = left side of spread → gutter on RIGHT
// Even pages (2,4,6) = right side of spread → gutter on LEFT
const GUTTER = '0.9in';
const OUTER  = '0.55in';
const TOP_M  = '0.6in';
const BOT_M  = '0.7in';

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    protocolTimeout: 1800000
  });

  // ── Step 1: Extract data from BOM.html ──
  console.log('Step 1: Extracting interlinear data from BOM.html...');
  const extractPage = await browser.newPage();
  extractPage.setDefaultTimeout(120000);
  const bomPath = path.join(BASE, 'BOM.html');
  await extractPage.goto('file:///' + bomPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0', timeout: 120000
  });

  const data = await extractPage.evaluate((booksJson) => {
    const books = JSON.parse(booksJson);
    const result = { books: [], frontMatter: {} };
    function getVar(name) { try { return eval(name); } catch(e) { return null; } }

    const fmKeys = ['frontIntro','frontTitle','frontIntroduction','frontThreeWit','frontEightWit','frontJST','frontBrief'];
    for (const key of fmKeys) {
      const val = getVar(key);
      if (val) result.frontMatter[key] = val;
    }

    for (const book of books) {
      const bookData = { name: book.name, hebrew: book.hebrew, chapters: [] };
      if (book.colophon) {
        const col = getVar(book.colophon);
        if (col) {
          if (Array.isArray(col) && col.length > 0) {
            if (Array.isArray(col[0]) && col[0].length === 2) {
              bookData.colophon = [{ num: '', words: col }];
            } else {
              bookData.colophon = col;
            }
          }
        }
      }
      for (let ch = 1; ch <= book.chapters; ch++) {
        const varName = book.prefix + ch + 'Verses';
        const verses = getVar(varName);
        if (verses) bookData.chapters.push({ num: ch, verses: verses });
        else console.warn('Missing: ' + varName);
      }
      result.books.push(bookData);
    }
    return result;
  }, JSON.stringify(BOOKS));

  await extractPage.close();

  let totalVerses = 0;
  for (const book of data.books) {
    for (const ch of book.chapters) totalVerses += ch.verses.length;
  }
  console.log(`  Extracted ${data.books.length} books, ${totalVerses} verses`);

  // ── Step 2: Build HTML helpers ──
  console.log('Step 2: Building HTML...');

  function renderWord(heb, eng) {
    return `<span class="wp"><span class="wh">${heb}</span><span class="we">${eng || ''}</span></span>`;
  }

  function renderVerse(verse) {
    let html = `<div class="verse">`;
    if (verse.num) html += `<span class="vn">${verse.num}</span>`;
    html += `<span class="words">`;
    const words = verse.words.filter(p => p[0] && p[0] !== '׃');
    for (const pair of words) html += renderWord(pair[0], pair[1]);
    html += `<span class="sof">׃</span></span></div>`;
    return html;
  }

  function renderColophon(colophonVerses) {
    let html = `<div class="colophon">`;
    for (const v of colophonVerses) {
      html += `<div class="colophon-verse"><span class="words">`;
      const words = v.words.filter(p => p[0] && p[0] !== '׃');
      for (const pair of words) html += renderWord(pair[0], pair[1]);
      html += `<span class="sof">׃</span></span></div>`;
    }
    html += `</div>`;
    return html;
  }

  // ─── Shared CSS (tightened: 13pt Hebrew, compact spacing) ──────────
  const sharedCSS = `
@page { size: 8.5in 11in; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'David Libre', 'David', serif;
  direction: rtl;
  background: white;
  color: #1a1a1a;
}
.verse {
  margin-bottom: 6pt;
  break-inside: avoid;
  page-break-inside: avoid;
}
.vn {
  display: inline-block;
  font-size: 9pt;
  font-weight: 700;
  color: #666;
  margin-left: 3pt;
  vertical-align: top;
  padding-top: 1pt;
}
.words { display: inline; }
.wp {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-left: 4pt;
  margin-bottom: 2pt;
  vertical-align: top;
}
.wh {
  font-family: 'David Libre', serif;
  font-size: 13pt;
  font-weight: 700;
  line-height: 1.25;
}
.we {
  font-family: 'Crimson Pro', serif;
  font-size: 7pt;
  font-style: italic;
  color: #555;
  direction: ltr;
  line-height: 1.15;
  white-space: nowrap;
}
.sof {
  font-family: 'David Libre', serif;
  font-size: 13pt;
  font-weight: 700;
  margin-right: 2pt;
  vertical-align: top;
  line-height: 1.25;
}
.book { page-break-before: always; }
.book-title {
  font-size: 22pt;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3pt;
  padding-top: 28pt;
}
.book-title-eng {
  font-family: 'Crimson Pro', serif;
  font-size: 13pt;
  font-weight: 600;
  text-align: center;
  direction: ltr;
  color: #555;
  margin-bottom: 14pt;
}
.colophon {
  margin-bottom: 12pt;
  padding: 8pt 12pt;
  border: 0.5pt solid #bbb;
  border-radius: 3pt;
  background: #fafaf7;
}
.colophon-verse { margin-bottom: 3pt; }
.chapter-heading {
  font-size: 14pt;
  font-weight: 700;
  text-align: center;
  margin: 14pt 0 8pt;
  padding: 4pt 0;
  border-top: 0.5pt solid #aaa;
  border-bottom: 0.5pt solid #aaa;
  page-break-after: avoid;
}
@media print {
  .verse { break-inside: avoid !important; page-break-inside: avoid !important; }
  .chapter-heading { break-after: avoid !important; page-break-after: avoid !important; }
  .book { break-before: page !important; page-break-before: always !important; }
  .fm-page { break-after: page !important; page-break-after: always !important; }
}`;

  // ─── FRONT MATTER HTML (no page numbers, uniform margins) ──────────
  let fmContent = '';
  // Title page
  fmContent += `<div class="fm-page title-page">
    <div class="title-content">
      <div class="title-main">ספר מורמון</div>
      <div class="title-sub">עֵדוּת אַחֶרֶת יֵשׁוּעַ הַמָּשִׁיחַ</div>
      <div class="title-ornament">· · ◆ · ·</div>
      <div class="title-eng">The Book of Mormon</div>
      <div class="title-eng-sub">Another Testament of Jesus Christ</div>
      <div class="title-eng-sub" style="margin-top:20pt;font-size:10pt">Hebrew Interlinear Translation</div>
    </div>
  </div>`;

  const FM_SECTIONS = [
    { key: 'frontIntro',         header: 'מבוא המתרגם' },
    { key: 'frontTitle',         header: 'ספר מורמון' },
    { key: 'frontIntroduction',  header: 'מבוא' },
    { key: 'frontThreeWit',      header: 'עדות שלשת העדים' },
    { key: 'frontEightWit',      header: 'עדות שמונה עדים' },
    { key: 'frontJST',           header: 'עדות הנביא יוסף סמית' },
    { key: 'frontBrief',         header: 'ביאור קצר על־ספר מורמון' },
  ];
  for (const section of FM_SECTIONS) {
    const verses = data.frontMatter[section.key];
    if (!verses) continue;
    fmContent += `<div class="fm-page fm-section">`;
    fmContent += `<div class="fm-header">${section.header}</div>`;
    for (const v of verses) fmContent += renderVerse(v);
    fmContent += `</div>`;
  }

  const fmHtml = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
${sharedCSS}
.title-page {
  page-break-after: always;
  display: flex; align-items: center; justify-content: center;
  height: 100vh; text-align: center;
}
.title-content { text-align: center; }
.title-main { font-size: 34pt; font-weight: 700; margin-bottom: 10pt; }
.title-sub { font-size: 16pt; font-weight: 500; margin-bottom: 16pt; color: #333; }
.title-ornament { font-size: 12pt; margin-bottom: 16pt; color: #888; letter-spacing: 6pt; }
.title-eng { font-family: 'Crimson Pro', serif; font-size: 18pt; font-weight: 600; direction: ltr; margin-bottom: 5pt; }
.title-eng-sub { font-family: 'Crimson Pro', serif; font-size: 12pt; font-weight: 400; direction: ltr; color: #444; }
.fm-page { page-break-after: always; }
.fm-header {
  font-size: 16pt; font-weight: 700; text-align: center;
  margin-bottom: 14pt; padding-bottom: 6pt; border-bottom: 1pt solid #ccc;
}
</style></head><body>${fmContent}</body></html>`;

  const fmPath = path.join(__dirname, '_letter_fm.html');
  fs.writeFileSync(fmPath, fmHtml, 'utf8');
  console.log(`  Front matter HTML: ${(fmHtml.length / 1024).toFixed(0)} KB`);

  // ─── BODY HTML (1 Nephi → Moroni, mirrored gutter) ─────────────────
  let bodyContent = '';
  for (const bookData of data.books) {
    bodyContent += `<div class="book">`;
    bodyContent += `<div class="book-title">${bookData.hebrew}</div>`;
    bodyContent += `<div class="book-title-eng">${bookData.name}</div>`;
    if (bookData.colophon) bodyContent += renderColophon(bookData.colophon);
    for (const ch of bookData.chapters) {
      if (bookData.chapters.length > 1) {
        bodyContent += `<div class="chapter-heading">פרק ${hebrewNum(ch.num)}</div>`;
      }
      for (const verse of ch.verses) bodyContent += renderVerse(verse);
    }
    bodyContent += `</div>`;
  }

  const bodyHtml = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
${sharedCSS}
</style></head><body>${bodyContent}</body></html>`;

  const bodyPath = path.join(__dirname, '_letter_body.html');
  fs.writeFileSync(bodyPath, bodyHtml, 'utf8');
  console.log(`  Body HTML: ${(bodyHtml.length / 1024 / 1024).toFixed(1)} MB`);

  // ── Step 3: Render front matter PDF ──
  console.log('Step 3a: Rendering front matter PDF...');
  const fmPage = await browser.newPage();
  fmPage.setDefaultTimeout(300000);
  await fmPage.goto('file:///' + fmPath.replace(/\\/g, '/'), {
    waitUntil: 'load', timeout: 120000
  });
  await new Promise(r => setTimeout(r, 5000));

  const fmPdfPath = path.join(__dirname, '_fm.pdf');
  await fmPage.pdf({
    path: fmPdfPath,
    format: 'Letter',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: '0.65in', right: '0.7in', bottom: '0.65in', left: '0.7in' }
  });
  await fmPage.close();
  const fmStats = fs.statSync(fmPdfPath);
  console.log(`  Front matter PDF: ${(fmStats.size/1024).toFixed(0)} KB`);

  // ── Step 3b: Render body PDF ──
  console.log('Step 3b: Rendering body PDF...');
  const bodyPage = await browser.newPage();
  bodyPage.setDefaultTimeout(1800000);
  console.log('  Loading body HTML via setContent...');
  await bodyPage.setContent(bodyHtml, {
    waitUntil: 'domcontentloaded', timeout: 300000
  });
  console.log('  Waiting for fonts + layout...');
  await new Promise(r => setTimeout(r, 15000));

  // Render with OUTER margins — gutter shift applied in pdf-lib
  const bodyPdfPath = path.join(__dirname, '_body.pdf');
  await bodyPage.pdf({
    path: bodyPdfPath,
    format: 'Letter',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: TOP_M, right: OUTER, bottom: BOT_M, left: OUTER }
  });
  await bodyPage.close();
  await browser.close();

  const bodyStats = fs.statSync(bodyPdfPath);
  console.log(`  Body PDF: ${(bodyStats.size/1024/1024).toFixed(1)} MB`);

  // ── Step 4: Merge with pdf-lib + mirrored gutter + page numbers ──
  console.log('Step 4: Merging PDFs + mirrored gutter + page numbers...');
  const { StandardFonts, rgb } = require('pdf-lib');
  const merged = await PDFDocument.create();
  const [width, height] = [8.5 * 72, 11 * 72];

  // RTL mirrored gutter: shift body pages to create mirror margins
  // Body rendered with OUTER (0.55in) on both sides
  // Gutter side needs GUTTER (0.9in) → shift content by (0.9-0.55)/2 = 0.175in = 12.6pt
  const GUTTER_SHIFT = (0.9 - 0.55) / 2 * 72; // ~12.6pt

  // Blank page (front)
  merged.addPage([width, height]);

  // Front matter (no page numbers)
  const fmDoc = await PDFDocument.load(fs.readFileSync(fmPdfPath));
  const fmCopied = await merged.copyPages(fmDoc, fmDoc.getPageIndices());
  for (const p of fmCopied) merged.addPage(p);

  // Pad front matter to even page count
  const totalFmPages = 1 + fmCopied.length;
  if (totalFmPages % 2 !== 0) {
    merged.addPage([width, height]);
  }

  // Blank separator pages
  merged.addPage([width, height]);
  merged.addPage([width, height]);

  const bodyStartIdx = merged.getPageCount();

  // Body pages — embed as XObjects to apply gutter shift
  const bodyDoc = await PDFDocument.load(fs.readFileSync(bodyPdfPath));
  const bodyPageCount = bodyDoc.getPageCount();
  console.log(`  Embedding ${bodyPageCount} body pages with mirrored gutter...`);

  for (let i = 0; i < bodyPageCount; i++) {
    const [embedded] = await merged.embedPdf(bodyDoc, [i]);
    const newPage = merged.addPage([width, height]);
    const isOdd = (i + 1) % 2 === 1;
    // RTL: odd pages → gutter on RIGHT → shift content LEFT
    //       even pages → gutter on LEFT → shift content RIGHT
    const xShift = isOdd ? -GUTTER_SHIFT : GUTTER_SHIFT;
    newPage.drawPage(embedded, {
      x: xShift,
      y: 0,
      width: width,
      height: height,
    });
  }

  // Pad to even total
  if (merged.getPageCount() % 2 !== 0) {
    merged.addPage([width, height]);
  }

  // Add page numbers to body pages only
  const font = await merged.embedFont(StandardFonts.TimesRoman);
  const allPages = merged.getPages();
  for (let i = bodyStartIdx; i < bodyStartIdx + bodyPageCount; i++) {
    const pg = allPages[i];
    const pageNum = i - bodyStartIdx + 1;
    const numStr = String(pageNum);
    const textW = font.widthOfTextAtSize(numStr, 9);
    // Center page number, offset by gutter shift
    const isOdd = pageNum % 2 === 1;
    const xShift = isOdd ? -GUTTER_SHIFT : GUTTER_SHIFT;
    pg.drawText(numStr, {
      x: (width - textW) / 2 + xShift,
      y: 28,
      size: 9,
      font: font,
      color: rgb(0.33, 0.33, 0.33),
    });
  }

  const pdfBytes = await merged.save();
  const outputPath = path.join(BASE, 'Hebrew_Interlinear_BOM_Letter.pdf');
  fs.writeFileSync(outputPath, pdfBytes);

  // Cleanup temp files
  try { fs.unlinkSync(fmPdfPath); } catch(e) {}
  try { fs.unlinkSync(bodyPdfPath); } catch(e) {}

  const totalPages = merged.getPageCount();
  const finalStats = fs.statSync(outputPath);
  console.log(`\nPDF generated: ${outputPath}`);
  console.log(`  Total pages: ${totalPages} (${fmCopied.length} front matter + ${bodyPageCount} body + blanks)`);
  console.log(`  Body pages: ${bodyPageCount} (KDP limit: 590)`);
  console.log(`  Size: ${(finalStats.size / 1024 / 1024).toFixed(1)} MB`);

  if (totalPages > 590) {
    console.log('  WARNING: Total pages over KDP 590 limit!');
  }

  console.log('Done!');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
