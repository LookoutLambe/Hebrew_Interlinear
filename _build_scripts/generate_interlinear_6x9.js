// Generate 6×9 Schottenstein-style Interlinear Hebrew BOM PDF
// Two columns, Hebrew word on top + English gloss below, chevron arrows
// No commentary — interlinear fills the full text area
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

// Hebrew numerals (gematria)
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

// ─── Page layout (points) ────────────────────────────────────────────
const PAGE_W    = 6 * 72;        // 432pt
const PAGE_H    = 9 * 72;        // 648pt
const GUTTER    = 0.75 * 72;     // 54pt (inside/spine margin)
const OUTER     = 0.5 * 72;      // 36pt (outside margin)
const TOP_M     = 0.5 * 72;      // 36pt
const BOT_M     = 0.25 * 72;     // 18pt
const COL_GAP   = 0.2 * 72;      // 14.4pt
const HEADER_H  = 14;
const HEADER_GAP = 4;
const PAGE_NUM_H = 10;
const CONTENT_H = PAGE_H - TOP_M - BOT_M - HEADER_H - HEADER_GAP - PAGE_NUM_H;
const TEXT_AREA_W = PAGE_W - GUTTER - OUTER;
const COL_W     = (TEXT_AREA_W - COL_GAP) / 2;

const GUTTER_SHIFT = (0.75 - 0.5) / 2 * 72; // 9pt

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    protocolTimeout: 1800000
  });

  // ── Step 1: Extract interlinear data from BOM.html ──
  console.log('Step 1: Extracting interlinear data from BOM.html...');
  const extractPage = await browser.newPage();
  extractPage.setDefaultTimeout(120000);
  const bomPath = path.join(BASE, 'BOM.html');
  await extractPage.goto('file:///' + bomPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0', timeout: 120000
  });

  const data = await extractPage.evaluate((booksJson) => {
    const books = JSON.parse(booksJson);
    const result = { books: [] };
    function getVar(name) { try { return eval(name); } catch(e) { return null; } }

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
        if (verses) bookData.chapters.push({ num: ch, verses });
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

  // ── Step 2: Build structured elements ──
  console.log('Step 2: Building elements...');

  const elements = [];
  for (const bookData of data.books) {
    elements.push({ type: 'book-title', book: bookData.name, hebrew: bookData.hebrew });

    if (bookData.colophon) {
      elements.push({ type: 'colophon', bookHebrew: bookData.hebrew, verses: bookData.colophon });
    }

    for (const ch of bookData.chapters) {
      if (bookData.chapters.length > 1) {
        elements.push({ type: 'chapter-heading', book: bookData.name, bookHebrew: bookData.hebrew,
                         chapter: ch.num, hebrew: `פרק ${hebrewNum(ch.num)}` });
      }
      for (const verse of ch.verses) {
        elements.push({
          type: 'verse', book: bookData.name, bookHebrew: bookData.hebrew,
          chapter: ch.num, verse: verse.num,
          bookChapters: bookData.chapters.length,
          words: verse.words
        });
      }
    }
  }
  console.log(`  ${elements.length} elements`);

  // ── Step 3: Build pagination HTML ──
  // Uses CSS multi-column in the browser to measure what fits on each page
  console.log('Step 3: Paginating in browser...');

  function renderWordHtml(heb, eng) {
    const gloss = (eng || '').replace(/-/g, '\u2011'); // non-breaking hyphens
    return `<span class="wp"><span class="wh">${heb}</span><span class="we">${gloss}</span></span>`;
  }

  function renderVerseHtml(el) {
    const words = el.words.filter(p => p[0] && p[0] !== '׃');
    if (words.length === 0) return '';
    let html = '';
    if (el.verse) html += `<span class="vn">${el.verse}</span>`;
    for (let i = 0; i < words.length; i++) {
      html += renderWordHtml(words[i][0], words[i][1]);
      if (i < words.length - 1) html += `<span class="arr">‹</span>`;
    }
    html += `<span class="sof">׃</span>`;
    return html;
  }

  function renderColophonHtml(colVerses) {
    let html = '';
    for (const v of colVerses) {
      const words = (v.words || []).filter(p => p[0] && p[0] !== '׃');
      html += `<div class="col-v">`;
      for (let i = 0; i < words.length; i++) {
        html += renderWordHtml(words[i][0], words[i][1]);
        if (i < words.length - 1) html += `<span class="arr">‹</span>`;
      }
      html += `<span class="sof">׃</span></div>`;
    }
    return html;
  }

  // Pre-render all elements into HTML
  const elHtmls = elements.map(el => {
    if (el.type === 'book-title') return `<div class="bt">${el.hebrew}</div>`;
    if (el.type === 'chapter-heading') return `<div class="ch">${el.hebrew}</div>`;
    if (el.type === 'colophon') return `<div class="colophon">${renderColophonHtml(el.verses)}</div>`;
    if (el.type === 'verse') return `<div class="v">${renderVerseHtml(el)}</div>`;
    return '';
  });

  // Storage divs for pagination measurement
  let storageDivs = '';
  for (let i = 0; i < elHtmls.length; i++) {
    storageDivs += `<div data-i="${i}">${elHtmls[i].replace(/^<div class="[^"]*">/, '').replace(/<\/div>$/, '')}</div>`;
  }

  // Actually, just store the full rendered HTML with class for proper measurement
  storageDivs = '';
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.type === 'book-title')
      storageDivs += `<div class="bt" data-i="${i}">${el.hebrew}</div>\n`;
    else if (el.type === 'chapter-heading')
      storageDivs += `<div class="ch" data-i="${i}">${el.hebrew}</div>\n`;
    else if (el.type === 'colophon')
      storageDivs += `<div class="colophon" data-i="${i}">${renderColophonHtml(el.verses)}</div>\n`;
    else if (el.type === 'verse')
      storageDivs += `<div class="v" data-i="${i}">${renderVerseHtml(el)}</div>\n`;
  }

  const sharedCSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'David Libre', 'David', serif;
  font-size: 10pt;
  line-height: 1.1;
  direction: rtl;
  background: white;
  color: #1a1a1a;
}
.bt {
  text-align: center; font-size: 16pt; font-weight: 700;
  padding: 10pt 0 2pt; column-span: all;
}
.bt-eng {
  text-align: center; font-family: 'Crimson Pro', serif;
  font-size: 9pt; font-weight: 600; color: #555;
  direction: ltr; margin-bottom: 4pt; column-span: all;
}
.ch {
  text-align: center; font-size: 11pt; font-weight: 700;
  padding: 3pt 0 2pt; border-top: 0.5pt solid #aaa;
  border-bottom: 0.5pt solid #aaa; margin: 2pt 0;
  break-after: avoid;
}
.colophon {
  column-span: all;
  margin-bottom: 4pt; padding: 3pt 6pt;
  border: 0.5pt solid #bbb; border-radius: 2pt;
  background: #fafaf7; direction: rtl;
}
.col-v { margin-bottom: 2pt; }
.v {
  display: block; margin-bottom: 1.5pt;
}
.vn {
  display: inline-block;
  font-size: 7pt; font-weight: 700; color: #666;
  margin-left: 1.5pt; vertical-align: top;
  padding-top: 1pt;
}
.wp {
  display: inline-flex; flex-direction: column;
  align-items: center;
  margin-left: 0.5pt; margin-bottom: 1pt;
  vertical-align: top;
}
.wh {
  font-family: 'David Libre', serif;
  font-size: 14pt; font-weight: 700;
  line-height: 1.1; color: #1a2744;
}
.we {
  font-family: 'Crimson Pro', serif;
  font-size: 5.5pt; font-style: italic;
  color: #555; direction: ltr;
  line-height: 1.05; white-space: nowrap;
}
.arr {
  display: inline-block;
  font-family: 'Crimson Pro', serif;
  font-size: 5pt; color: #bbb;
  vertical-align: bottom;
  padding-bottom: 0.5pt;
  margin: 0 0.25pt;
  line-height: 1;
}
.sof {
  font-family: 'David Libre', serif;
  font-size: 14pt; font-weight: 700;
  margin-right: 1pt; vertical-align: top;
  line-height: 1.1; color: #1a2744;
}`;

  const pagHtml = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
${sharedCSS}
#storage { display: none; }
#test-col {
  width: ${TEXT_AREA_W}pt;
  column-count: 2; column-gap: ${COL_GAP}pt; column-fill: auto;
  column-rule: 0.5pt solid #ccc;
  overflow: hidden; direction: rtl;
}
</style></head><body>
<div id="storage">${storageDivs}</div>
<div id="test-col"></div>
</body></html>`;

  const pagPath = path.join(__dirname, '_interlinear_paginate.html');
  fs.writeFileSync(pagPath, pagHtml, 'utf8');

  const pagPage = await browser.newPage();
  await pagPage.setViewport({ width: 1200, height: 800 });
  await pagPage.goto('file:///' + pagPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0', timeout: 120000
  });
  await pagPage.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 3000));

  const elMeta = elements.map(el => ({ type: el.type }));

  const pageAssignments = await pagPage.evaluate((meta, contentH_pt) => {
    const ptToPx = 96 / 72;
    const contentH = contentH_pt * ptToPx;

    const testCol = document.getElementById('test-col');
    const storage = document.getElementById('storage');

    const elMap = {};
    storage.querySelectorAll('[data-i]').forEach(el => {
      elMap[el.getAttribute('data-i')] = el;
    });

    function overflows() {
      if (testCol.scrollWidth > testCol.clientWidth + 1) return true;
      const last = testCol.lastElementChild;
      if (!last) return false;
      const cRect = testCol.getBoundingClientRect();
      const rects = last.getClientRects();
      if (rects.length === 0) return true;
      for (const r of rects) {
        if (r.left < cRect.left - 1) return true;
        if (r.bottom > cRect.bottom + 1) return true;
      }
      return false;
    }

    const pages = [];
    let cur = 0;
    const total = meta.length;

    while (cur < total) {
      const pageItems = [];
      testCol.innerHTML = '';
      testCol.style.height = contentH + 'px';

      // Book title always starts a new page
      if (meta[cur].type === 'book-title') {
        const src = elMap[cur];
        testCol.appendChild(src.cloneNode(true));
        pageItems.push(cur);
        cur++;
      }

      while (cur < total) {
        const el = meta[cur];
        if (el.type === 'book-title') break;

        const src = elMap[cur];
        const clone = src.cloneNode(true);
        clone.removeAttribute('data-i');
        testCol.appendChild(clone);

        if (overflows()) {
          testCol.removeChild(clone);
          break;
        }

        // Chapter heading: ensure at least one verse follows
        if (el.type === 'chapter-heading' && cur + 1 < total && meta[cur + 1].type === 'verse') {
          const nextSrc = elMap[cur + 1];
          const nextClone = nextSrc.cloneNode(true);
          nextClone.removeAttribute('data-i');
          testCol.appendChild(nextClone);
          const wouldOverflow = overflows();
          testCol.removeChild(nextClone);

          if (wouldOverflow) {
            testCol.removeChild(clone);
            break;
          }
        }

        pageItems.push(cur);
        cur++;
      }

      if (pageItems.length === 0 && cur < total) {
        pageItems.push(cur);
        cur++;
      }

      // If page has only a chapter heading, force-add the next verse
      if (pageItems.length === 1 && meta[pageItems[0]].type === 'chapter-heading' && cur < total) {
        const src = elMap[cur];
        const clone = src.cloneNode(true);
        clone.removeAttribute('data-i');
        testCol.appendChild(clone);
        pageItems.push(cur);
        cur++;
      }

      pages.push(pageItems);
    }

    return pages;
  }, elMeta, CONTENT_H);

  await pagPage.close();
  try { fs.unlinkSync(pagPath); } catch(e) {}

  // Post-process: prevent orphaned chapter headings at page end
  for (let p = 0; p < pageAssignments.length - 1; p++) {
    const items = pageAssignments[p];
    if (items.length > 1) {
      const lastIdx = items[items.length - 1];
      if (elements[lastIdx].type === 'chapter-heading') {
        items.pop();
        pageAssignments[p + 1].unshift(lastIdx);
      }
    }
  }

  console.log(`  ${pageAssignments.length} body pages`);

  // ── Step 4: Build page objects ──
  const pages = [];
  let curBookHebrew = '', curBookEng = '';

  for (const indices of pageAssignments) {
    const pg = {
      items: [], bookHebrew: '', bookEng: '',
      startChapter: 0, startVerse: 0, endChapter: 0, endVerse: 0
    };

    for (const idx of indices) {
      const el = elements[idx];
      pg.items.push(el);

      if (el.type === 'book-title') {
        curBookHebrew = el.hebrew;
        curBookEng = el.book;
      }
      if (el.type === 'verse') {
        if (!pg.startChapter) {
          pg.startChapter = el.chapter;
          pg.startVerse = el.verse;
        }
        pg.endChapter = el.chapter;
        pg.endVerse = el.verse;
      }
      pg.bookHebrew = el.bookHebrew || curBookHebrew;
      pg.bookEng = el.book || curBookEng;
    }

    pages.push(pg);
  }

  // ── Step 5: Render final HTML ──
  console.log('Step 5: Building final HTML...');

  function renderPageHtml(pg, pageNum) {
    const isOdd = pageNum % 2 === 1;
    // RTL binding: spine on RIGHT when closed
    // Odd (recto, RIGHT side of spread): spine/gutter on LEFT
    // Even (verso, LEFT side of spread): spine/gutter on RIGHT
    const pR = isOdd ? OUTER : GUTTER;
    const pL = isOdd ? GUTTER : OUTER;

    let contentHtml = '';
    for (const el of pg.items) {
      if (el.type === 'book-title') {
        contentHtml += `<div class="bt">${el.hebrew}</div>`;
        contentHtml += `<div class="bt-eng">${el.book}</div>`;
      } else if (el.type === 'chapter-heading') {
        contentHtml += `<div class="ch">${el.hebrew}</div>`;
      } else if (el.type === 'colophon') {
        contentHtml += `<div class="colophon">${renderColophonHtml(el.verses)}</div>`;
      } else if (el.type === 'verse') {
        contentHtml += `<div class="v">${renderVerseHtml(el)}</div>`;
      }
    }

    // Running header: book name + verse range
    let verseRange = '';
    if (pg.startChapter && pg.endChapter) {
      const sc = hebrewNum(pg.startChapter);
      const sv = pg.startVerse || '';
      const ec = hebrewNum(pg.endChapter);
      const ev = pg.endVerse || '';
      if (pg.startChapter === pg.endChapter) {
        verseRange = sv === ev ? `${sc}:${sv}` : `${sc}:${sv}–${ev}`;
      } else {
        verseRange = `${sc}:${sv} – ${ec}:${ev}`;
      }
    }

    return `<div class="page" style="padding-right:${pR}pt;padding-left:${pL}pt;">
  <div class="header"><span class="h-book">${pg.bookHebrew || ''}</span><span class="h-range">${verseRange}</span></div>
  <div class="content">${contentHtml}</div>
  <div class="pn">${pageNum}</div>
</div>`;
  }

  // ── Front matter ──
  function buildFrontMatter() {
    let html = '';
    let fmIdx = 0; // track front matter page index for alternating gutters

    // RTL binding: alternate gutter side per page
    function fmPad() {
      const isOdd = fmIdx % 2 === 0; // 0-based: even index = odd page (recto)
      const pR = isOdd ? OUTER : GUTTER;
      const pL = isOdd ? GUTTER : OUTER;
      fmIdx++;
      return `padding: ${TOP_M}pt ${pR}pt ${BOT_M}pt ${pL}pt`;
    }

    // 2 blank pages
    html += `<div class="fm-page" style="${fmPad()}"></div>`;
    html += `<div class="fm-page" style="${fmPad()}"></div>`;

    // Title page
    const s0 = frontMatter[0];
    const s1 = frontMatter[1];
    const transLines = s1.full.split('\n').filter(l => l.trim());
    html += `<div class="fm-page" style="${fmPad()}">
      <div class="fm-title-page">
        <div class="fm-title-top">
          <div class="fm-main-title">${s0.header}</div>
          <div class="fm-subtitle">${s0.body}</div>
        </div>
        <div class="fm-title-bottom">
          <div class="fm-interlinear-label">Hebrew Interlinear Translation</div>
          ${transLines.map(l => `<div class="fm-trans-line">${l.trim()}</div>`).join('\n')}
        </div>
      </div>
    </div>`;

    // Continuous-flow front matter: sections flow into each other without page breaks
    const pageContentH = PAGE_H - TOP_M - BOT_M;
    const CHARS_PER_LINE = 45;
    const LINE_H = 12 * 1.6;
    const PARA_MARGIN = 8;
    const SECTION_TITLE_H = 16 + 12 + 14; // title font + gap + spacing before/after
    const SECTION_GAP = 18; // extra space between sections on same page

    function estParaH(text) {
      const lines = Math.max(1, Math.ceil(text.length / CHARS_PER_LINE));
      return lines * LINE_H + PARA_MARGIN;
    }

    // Collect all content blocks: [{type:'title',text}, {type:'para',text}]
    const blocks = [];
    // Sections 2-8 (skip 0=main title, 1=translator credit, 9=TOC — handled separately)
    for (let i = 2; i < frontMatter.length; i++) {
      const s = frontMatter[i];
      if (s.header === 'ראשי דברים') continue; // TOC handled separately
      blocks.push({ type: 'title', text: s.header });
      const paras = s.body.split('\n').filter(l => l.trim());
      for (const p of paras) blocks.push({ type: 'para', text: p.trim() });
    }

    // Paginate blocks continuously
    const fmPages = [];
    let curPageBlocks = [];
    let usedH = 0;

    for (let b = 0; b < blocks.length; b++) {
      const blk = blocks[b];
      let blkH;
      if (blk.type === 'title') {
        // Section title needs space; if not first on page, add gap
        blkH = SECTION_TITLE_H + (curPageBlocks.length > 0 ? SECTION_GAP : 0);
        // Ensure title + at least one paragraph fits on same page
        const nextParaH = (b + 1 < blocks.length && blocks[b + 1].type === 'para')
          ? estParaH(blocks[b + 1].text) : 0;
        if (usedH + blkH + nextParaH > pageContentH && curPageBlocks.length > 0) {
          fmPages.push(curPageBlocks);
          curPageBlocks = [];
          usedH = 0;
          blkH = SECTION_TITLE_H; // no gap when starting new page
        }
      } else {
        blkH = estParaH(blk.text);
        if (usedH + blkH > pageContentH && curPageBlocks.length > 0) {
          fmPages.push(curPageBlocks);
          curPageBlocks = [];
          usedH = 0;
        }
      }
      curPageBlocks.push(blk);
      usedH += blkH;
    }
    if (curPageBlocks.length > 0) fmPages.push(curPageBlocks);

    // Render continuous front matter pages
    for (const pageBlocks of fmPages) {
      let pageHtml = `<div class="fm-page" style="${fmPad()}">`;
      let inSection = false;
      for (const blk of pageBlocks) {
        if (blk.type === 'title') {
          if (inSection) pageHtml += `</div>`; // close previous fm-text
          pageHtml += `\n  <div class="fm-section-title">${blk.text}</div>`;
          pageHtml += `\n  <div class="fm-text">`;
          inSection = true;
        } else {
          if (!inSection) { pageHtml += `\n  <div class="fm-text">`; inSection = true; }
          pageHtml += `<p>${blk.text}</p>\n`;
        }
      }
      if (inSection) pageHtml += `</div>`;
      pageHtml += `\n</div>`;
      html += pageHtml;
    }

    // Table of contents (own page)
    const tocSection = frontMatter.find(s => s.header === 'ראשי דברים');
    if (tocSection) {
      html += `<div class="fm-page" style="${fmPad()}">
        <div class="fm-section-title">${tocSection.header}</div>
        <div class="fm-toc">`;
      for (const book of BOOKS) {
        const bookPageIdx = pageAssignments.findIndex(indices =>
          indices.some(idx => elements[idx].type === 'book-title' && elements[idx].book === book.name)
        );
        const pageNum = bookPageIdx >= 0 ? bookPageIdx + 1 : '';
        html += `<div class="fm-toc-line"><span>${book.hebrew}</span><span>${pageNum}</span></div>\n`;
      }
      html += `</div></div>`;
    }

    // Pad to even page count (blank page before body if needed)
    const curFmCount = (html.match(/class="fm-page/g) || []).length;
    if (curFmCount % 2 !== 0) {
      html += `<div class="fm-page" style="${fmPad()}"></div>`;
    }

    return html;
  }

  const fmHtml = buildFrontMatter();
  const fmPageCount = (fmHtml.match(/class="fm-page/g) || []).length;
  console.log(`  Front matter: ${fmPageCount} pages`);

  let pagesHtml = '';
  for (let i = 0; i < pages.length; i++) pagesHtml += renderPageHtml(pages[i], i + 1);

  const finalHtml = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
@page { size: 6in 9in; margin: 0; }
${sharedCSS}
.page {
  width: ${PAGE_W}pt; height: ${PAGE_H}pt;
  padding-top: ${TOP_M}pt; padding-bottom: ${BOT_M}pt;
  overflow: hidden; page-break-after: always;
  display: flex; flex-direction: column;
}
.page:last-child { page-break-after: auto; }
.header {
  display: flex; justify-content: space-between; flex-shrink: 0;
  font-size: 7.5pt; color: #555; border-bottom: 0.5pt solid #999;
  padding-bottom: 2pt; margin-bottom: ${HEADER_GAP}pt;
  height: ${HEADER_H}pt; direction: rtl;
}
.h-book { font-weight: 600; }
.h-range { font-weight: 400; }
.content {
  height: ${CONTENT_H}pt; flex-shrink: 0;
  column-count: 2; column-gap: ${COL_GAP}pt; column-fill: auto;
  column-rule: 0.5pt solid #ccc;
  direction: rtl; overflow: hidden;
}
.pn {
  flex-shrink: 0; font-size: 7.5pt; color: #555;
  text-align: center; height: ${PAGE_NUM_H}pt;
  padding-top: 3pt;
}
/* Front matter */
.fm-page {
  width: ${PAGE_W}pt; height: ${PAGE_H}pt;
  position: relative; overflow: hidden; page-break-after: always;
  font-family: 'David Libre', 'David', serif; font-size: 12pt; line-height: 1.6;
  direction: rtl; text-align: justify;
}
.fm-title-page {
  display: flex; flex-direction: column; justify-content: space-between;
  height: 100%; text-align: center;
}
.fm-title-top { padding-top: 40pt; }
.fm-title-bottom { padding-bottom: 40pt; }
.fm-main-title { font-size: 26pt; font-weight: 700; margin-bottom: 14pt; }
.fm-subtitle { font-size: 14pt; color: #333; }
.fm-interlinear-label {
  font-family: 'Crimson Pro', serif; font-size: 11pt;
  direction: ltr; margin-bottom: 16pt; color: #444;
}
.fm-trans-line { font-size: 12pt; margin-bottom: 6pt; }
.fm-section-title {
  font-size: 15pt; font-weight: 700; text-align: center;
  margin-bottom: 10pt;
}
.fm-text p { margin-bottom: 6pt; text-indent: 0; }
.fm-toc { direction: rtl; }
.fm-toc-line {
  display: flex; justify-content: space-between;
  padding: 3pt 0; border-bottom: 0.5pt dotted #999;
}
</style></head><body>
${fmHtml}
${pagesHtml}
</body></html>`;

  const htmlPath = path.join(__dirname, '_interlinear_6x9_pages.html');
  fs.writeFileSync(htmlPath, finalHtml, 'utf8');
  console.log(`  Final HTML: ${(finalHtml.length / 1024 / 1024).toFixed(1)} MB`);

  // ── Step 6: Render PDF ──
  console.log('Step 6: Rendering PDF...');
  const pdfPage = await browser.newPage();
  pdfPage.setDefaultTimeout(1800000);
  console.log('  Loading HTML via setContent...');
  await pdfPage.setContent(finalHtml, {
    waitUntil: 'domcontentloaded', timeout: 300000
  });
  console.log('  Waiting for fonts + layout...');
  await pdfPage.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 15000));

  const outputPath = path.join(BASE, 'Hebrew_Interlinear_BOM_6x9.pdf');
  await pdfPage.pdf({
    path: outputPath, width: '6in', height: '9in',
    printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: false, margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  const stats = fs.statSync(outputPath);
  console.log(`\nPDF: ${outputPath}`);
  console.log(`  Pages: ${fmPageCount + pages.length} (${fmPageCount} front + ${pages.length} body)`);
  console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  if (fmPageCount + pages.length > 828) {
    console.log(`  NOTE: ${fmPageCount + pages.length} pages exceeds KDP 6x9 limit of 828.`);
    console.log('  PDF generated successfully. Manual trimming may be needed for KDP submission.');
  }

  await browser.close();

  // Cleanup temp files
  try { fs.unlinkSync(htmlPath); } catch(e) {}

  console.log('Done!');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
