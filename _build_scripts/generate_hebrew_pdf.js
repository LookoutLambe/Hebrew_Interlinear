// Generate Hebrew-only BOM PDF with cross-references at page bottom
// Layout: 6"x9" KDP, two columns, mirror margins for Hebrew RTL binding
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');

// ─── Load data ───────────────────────────────────────────────────────
console.log('Loading data...');
const verses = require(path.join(BASE, 'official_verses.json'));
const crossrefs = require(path.join(BASE, 'crossrefs.json'));
const frontMatter = require(path.join(BASE, 'front_matter.json'));

console.log(`  ${verses.length} verses, ${Object.keys(crossrefs).length} cross-ref entries`);

// ─── Book metadata ───────────────────────────────────────────────────
const BOOKS = [
  { name: '1 Nephi',          hebrew: 'נֶפִי א׳',           chapters: 22 },
  { name: '2 Nephi',          hebrew: 'נֶפִי ב׳',           chapters: 33 },
  { name: 'Jacob',            hebrew: 'יַעֲקֹב',            chapters: 7 },
  { name: 'Enos',             hebrew: 'אֱנוֹשׁ',            chapters: 1 },
  { name: 'Jarom',            hebrew: 'יָרוֹם',             chapters: 1 },
  { name: 'Omni',             hebrew: 'עָמְנִי',            chapters: 1 },
  { name: 'Words of Mormon',  hebrew: 'דִּבְרֵי מוֹרְמוֹן', chapters: 1 },
  { name: 'Mosiah',           hebrew: 'מוֹשִׁיָּה',         chapters: 29 },
  { name: 'Alma',             hebrew: 'אַלְמָא',            chapters: 63 },
  { name: 'Helaman',          hebrew: 'הֵילָמָן',           chapters: 16 },
  { name: '3 Nephi',          hebrew: 'נֶפִי ג׳',           chapters: 30 },
  { name: '4 Nephi',          hebrew: 'נֶפִי ד׳',           chapters: 1 },
  { name: 'Mormon',           hebrew: 'מוֹרְמוֹן',          chapters: 9 },
  { name: 'Ether',            hebrew: 'עֵתֶר',              chapters: 15 },
  { name: 'Moroni',           hebrew: 'מוֹרוֹנִי',          chapters: 10 },
];

// Hebrew numerals (1-176 covers all BOM verse numbers)
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

// ─── Reference translation to Hebrew ────────────────────────────────
const REF_TO_HEBREW = {
  // OT — use \u00A0 (non-breaking space) in multi-word names so they don't split across lines
  'Gen.': 'בראשית', 'Ex.': 'שמות', 'Lev.': 'ויקרא', 'Num.': 'במדבר',
  'Deut.': 'דברים', 'Josh.': 'יהושע', 'Judg.': 'שופטים', 'Ruth': 'רות',
  '1 Sam.': 'שמואל\u00A0א', '2 Sam.': 'שמואל\u00A0ב',
  '1 Kgs.': 'מלכים\u00A0א', '2 Kgs.': 'מלכים\u00A0ב',
  '1 Chr.': 'דבה״י\u00A0א', '2 Chr.': 'דבה״י\u00A0ב',
  'Ezra': 'עזרא', 'Neh.': 'נחמיה', 'Esth.': 'אסתר',
  'Job': 'איוב', 'Ps.': 'תהלים', 'Prov.': 'משלי',
  'Eccl.': 'קהלת', 'Song': 'שיר\u00A0השירים',
  'Isa.': 'ישעיהו', 'Jer.': 'ירמיהו', 'Lam.': 'איכה',
  'Ezek.': 'יחזקאל', 'Dan.': 'דניאל',
  'Hosea': 'הושע', 'Joel': 'יואל', 'Amos': 'עמוס',
  'Obad.': 'עובדיה', 'Jonah': 'יונה', 'Micah': 'מיכה',
  'Nahum': 'נחום', 'Hab.': 'חבקוק', 'Zeph.': 'צפניה',
  'Hag.': 'חגי', 'Zech.': 'זכריה', 'Mal.': 'מלאכי',
  // NT
  'Matt.': 'מתי', 'Mark': 'מרקוס', 'Luke': 'לוקס', 'John': 'יוחנן',
  'Acts': 'מעשי', 'Rom.': 'רומים',
  '1 Cor.': 'קורינתים\u00A0א', '2 Cor.': 'קורינתים\u00A0ב',
  'Gal.': 'גלטים', 'Eph.': 'אפסים', 'Philip.': 'פיליפים', 'Col.': 'קולוסים',
  '1 Thes.': 'תסלוניקים\u00A0א', '2 Thes.': 'תסלוניקים\u00A0ב',
  '1 Tim.': 'טימותיאוס\u00A0א', '2 Tim.': 'טימותיאוס\u00A0ב',
  'Titus': 'טיטוס', 'Philem.': 'פילימון',
  'Heb.': 'עברים', 'James': 'יעקב',
  '1 Pet.': 'פטרוס\u00A0א', '2 Pet.': 'פטרוס\u00A0ב',
  '1 Jn.': 'יוחנן\u00A0א', '2 Jn.': 'יוחנן\u00A0ב', '3 Jn.': 'יוחנן\u00A0ג',
  'Jude': 'יהודה', 'Rev.': 'התגלות',
  // Restoration
  'D&C': 'תו״מ', 'Moses': 'משה', 'Abr.': 'אברהם',
  'JS—H': 'יס״ה', 'JS—M': 'יס״מ', 'A of F': 'א״א',
  // BOM
  '1 Ne.': 'נפי\u00A0א', '2 Ne.': 'נפי\u00A0ב', '3 Ne.': 'נפי\u00A0ג', '4 Ne.': 'נפי\u00A0ד',
  'Jacob': 'יעקב', 'Enos': 'אנוש', 'Jarom': 'ירום', 'Omni': 'עמני',
  'W of M': 'דב״מ', 'Mosiah': 'מושיה', 'Alma': 'אלמא',
  'Hel.': 'הילמן', 'Morm.': 'מורמון', 'Ether': 'עתר', 'Moro.': 'מורוני',
};

// Convert Latin footnote markers to Hebrew letters
const MARKER_TO_HEB = { a:'א', b:'ב', c:'ג', d:'ד', e:'ה', f:'ו', g:'ז', h:'ח', i:'ט', j:'י', k:'כ', l:'ל' };
function hebMarker(m) { return MARKER_TO_HEB[m] || m; }

// Sort abbreviations longest-first for greedy matching
const REF_ABBRS = Object.keys(REF_TO_HEBREW).sort((a, b) => b.length - a.length);

function translateRef(refStr) {
  let norm = refStr.replace(/\u00a0/g, ' ');

  for (const abbr of REF_ABBRS) {
    if (norm.indexOf(abbr) === 0) {
      const hebBook = REF_TO_HEBREW[abbr];
      let rest = norm.substring(abbr.length).trim();

      const m = rest.match(/^(\d+):(\d+)(.*)$/);
      if (m) {
        const ch = hebrewNum(parseInt(m[1]));
        const vs = hebrewNum(parseInt(m[2]));
        let suffix = m[3] || '';
        suffix = suffix.replace(/\d+/g, n => hebrewNum(parseInt(n)));
        return `${hebBook}\u00A0${ch}:${vs}${suffix}`;
      }

      const cm = rest.match(/^(\d+)(.*)$/);
      if (cm) {
        let rest2 = cm[2] || '';
        rest2 = rest2.replace(/\d+/g, n => hebrewNum(parseInt(n)));
        return `${hebBook}\u00A0${hebrewNum(parseInt(cm[1]))}${rest2}`;
      }

      return hebBook + (rest ? '\u00A0' + rest.replace(/\d+/g, n => hebrewNum(parseInt(n))) : '');
    }
  }
  return refStr.replace(/\d+/g, n => hebrewNum(parseInt(n)));
}

// ─── Build structured data ───────────────────────────────────────────
console.log('Processing verses and cross-references...');

const englishMap = {};
verses.forEach(v => {
  englishMap[`${v.book}|${v.chapter}|${v.verse}`] = v.english;
});

const elements = [];
let totalRefs = 0, keptRefs = 0;

for (const book of BOOKS) {
  elements.push({ type: 'book-title', book: book.name, hebrew: book.hebrew });

  for (let ch = 1; ch <= book.chapters; ch++) {
    if (book.chapters > 1) {
      elements.push({ type: 'chapter-heading', book: book.name, chapter: ch, hebrew: `פרק ${hebrewNum(ch)}` });
    }

    const chVerses = verses.filter(v => v.book === book.name && v.chapter === ch);
    chVerses.sort((a, b) => a.verse - b.verse);

    for (const v of chVerses) {
      const key = `${v.book}|${v.chapter}|${v.verse}`;
      const allRefs = crossrefs[key] || [];
      totalRefs += allRefs.length;

      const refs = allRefs.filter(r => r.category === 'cross-ref');
      keptRefs += refs.length;

      const hebrewText = v.hebrew.replace(/\u05C3/g, '').trim();
      const hebrewWords = hebrewText.split(/\s+/).filter(w => w.length > 0);
      const englishText = v.english || '';
      const englishWords = englishText.split(/\s+/);

      const markerPositions = {};
      for (const ref of refs) {
        let placed = false;
        const searchText = (ref.text || '').toLowerCase().trim();
        if (!searchText) continue;

        if (englishWords.length > 0 && hebrewWords.length > 0) {
          let engIdx = -1;
          for (let i = 0; i < englishWords.length; i++) {
            const ew = englishWords[i].replace(/[.,;:!?()"']/g, '').toLowerCase();
            if (ew === searchText || ew.includes(searchText) || searchText.includes(ew)) {
              engIdx = i; break;
            }
          }
          if (engIdx >= 0) {
            const ratio = engIdx / Math.max(englishWords.length, 1);
            const hebIdx = Math.min(Math.round(ratio * hebrewWords.length), hebrewWords.length - 1);
            if (!markerPositions[hebIdx]) markerPositions[hebIdx] = [];
            markerPositions[hebIdx].push(ref.marker);
            placed = true;
          }
        }
        if (!placed) {
          if (!markerPositions[0]) markerPositions[0] = [];
          markerPositions[0].push(ref.marker);
        }
      }

      let verseHtml = `<b class="vn">${hebrewNum(v.verse)}</b>\u00A0`;
      for (let i = 0; i < hebrewWords.length; i++) {
        if (markerPositions[i]) {
          for (const m of markerPositions[i]) {
            verseHtml += `<sup class="xm">${hebMarker(m)}</sup>`;
          }
        }
        verseHtml += hebrewWords[i];
        if (i < hebrewWords.length - 1) verseHtml += ' ';
      }
      verseHtml += ' \u05C3';

      const footnotes = [];
      for (const ref of refs) {
        const hebrewRefs = (ref.refs || [])
          .filter(r => /\d+:\d+/.test(r))
          .map(r => translateRef(r));
        if (hebrewRefs.length > 0) {
          const fnText = hebrewRefs.join('; ').replace(/\d+/g, n => hebrewNum(parseInt(n)));
          footnotes.push({ marker: hebMarker(ref.marker), text: fnText });
        }
      }

      // Sort footnotes by marker letter (alef, bet, gimel...)
      footnotes.sort((a, b) => {
        const order = 'אבגדהוזחטיכל';
        return order.indexOf(a.marker) - order.indexOf(b.marker);
      });

      elements.push({
        type: 'verse', book: book.name, bookHebrew: book.hebrew,
        chapter: v.chapter, verse: v.verse, bookChapters: book.chapters,
        html: verseHtml, footnotes, key
      });
    }
  }
}

console.log(`  ${elements.length} elements, refs: ${totalRefs} total → ${keptRefs} kept (TG removed)`);

// ─── Page layout constants (points) ─────────────────────────────────
const PAGE_W = 6 * 72;
const PAGE_H = 9 * 72;
const MARGIN_TOP = 0.5 * 72;
const MARGIN_BOTTOM = 0.45 * 72;
const GUTTER = 0.75 * 72;
const OUTER = 0.5 * 72;
const COL_GAP = 0.2 * 72;
const HEADER_H = 16;
const HEADER_GAP = 4;
const PAGE_NUM_H = 14;
const CONTENT_H = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM - HEADER_H - HEADER_GAP - PAGE_NUM_H;
const COL_W = (PAGE_W - GUTTER - OUTER - COL_GAP) / 2;
const FN_SEP_H = 10;

// ─── Build pagination HTML ──────────────────────────────────────────
// Uses the EXACT SAME CSS multi-column layout as the final render.
// overflow:hidden matches final render — multi-column properly constrains to 2 cols.
// scrollWidth > clientWidth detects when content overflows into extra columns.
// Footnote area height is MEASURED in a real 3-column container (not estimated).
function buildPaginationHtml() {
  const contentW = PAGE_W - GUTTER - OUTER;

  // Store elements WITHOUT wrapper divs — match final render structure exactly
  let storageDivs = '';
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.type === 'book-title')
      storageDivs += `<div class="bt" data-i="${i}">${el.hebrew}</div>\n`;
    else if (el.type === 'chapter-heading')
      storageDivs += `<div class="ch" data-i="${i}">${el.hebrew}</div>\n`;
    else
      storageDivs += `<div class="v" data-i="${i}">${el.html}</div>\n`;
  }

  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'David Libre', 'David', serif; font-size: 12pt; line-height: 1.4; direction: rtl; }
#storage { display: none; }
#test-col {
  width: ${contentW}pt;
  column-count: 2; column-gap: ${COL_GAP}pt; column-fill: auto;
  column-rule: 0.5pt solid #bbb;
  font-size: 12pt; line-height: 1.4;
  text-align: justify; direction: rtl;
  overflow: hidden;
}
#test-fn {
  width: ${contentW}pt;
  column-count: 3; column-gap: ${COL_GAP}pt;
  font-size: 7.5pt; line-height: 1.2; direction: rtl;
  padding: 4pt 0 0; border-top: 0.5pt solid #999;
}
.bt { text-align:center; font-size:18pt; font-weight:700; padding: 0 0 8pt; column-span: all; }
.ch { text-align:center; font-size:13pt; font-weight:700; padding: 6pt 0 5pt; border-top:0.5pt solid #aaa; border-bottom:0.5pt solid #aaa; margin: 4pt 0; break-after: avoid; }
.v { display: block; margin-bottom: 3pt; text-align: justify; }
.vn { font-weight:700; font-size:0.85em; }
.xm { font-size:0.6em; color:#444; vertical-align:super; margin:0 1px; }
.fn-ch { text-align: center; font-weight: 700; padding: 2pt 0 1pt; column-span: all; font-size: 8pt; }
.fn-line { break-inside: avoid; margin-bottom: 1pt; display: flex; gap: 2pt; direction: rtl; }
.fn-v { font-weight: 700; width: 1.4em; text-align: right; flex-shrink: 0; }
.fn-m { font-weight: 700; width: 0.9em; text-align: center; flex-shrink: 0; }
.fn-t { flex: 1; }
</style></head><body>
<div id="storage">${storageDivs}</div>
<div id="test-col"></div>
<div id="test-fn"></div>
</body></html>`;
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    protocolTimeout: 600000
  });

  // ── Pass 1: Paginate using IDENTICAL CSS multi-column layout ──
  // Uses the same 2-column CSS as the final render + overflow:hidden.
  // Overflow detected via scrollWidth > clientWidth (extra columns = overflow).
  // Footnote area height is MEASURED in a real 3-col container, not estimated.
  console.log('Pass 1: Paginating in browser (CSS multi-column + overflow:hidden)...');
  const pagPage = await browser.newPage();
  await pagPage.setViewport({ width: 1200, height: 800 });

  const pagHtml = buildPaginationHtml();
  const pagPath = path.join(__dirname, '_paginate.html');
  fs.writeFileSync(pagPath, pagHtml, 'utf8');
  await pagPage.goto('file:///' + pagPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0', timeout: 60000
  });
  await pagPage.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  // Build elMeta with actual footnote HTML for measuring
  const elMeta = elements.map((el, i) => {
    const m = { type: el.type, fnCount: 0, fnHtml: '' };
    if (el.type === 'verse') {
      m.chapter = el.chapter;
      m.chapterHeb = hebrewNum(el.chapter);
      m.multiChapter = (el.bookChapters || 1) > 1;
    }
    if (el.type === 'verse' && el.footnotes?.length > 0) {
      m.fnCount = el.footnotes.length;
      m.fnHtml = el.footnotes.map((f, j) => {
        const vn = hebrewNum(el.verse);
        return `<div class="fn-line"><span class="fn-v">${j === 0 ? vn : ''}</span><span class="fn-m">${f.marker}</span><span class="fn-t">${f.text}</span></div>`;
      }).join('');
    }
    return m;
  });

  const pageAssignments = await pagPage.evaluate((meta, contentH_pt) => {
    const ptToPx = 96 / 72;
    const contentH = contentH_pt * ptToPx;

    const testCol = document.getElementById('test-col');
    const testFn = document.getElementById('test-fn');
    const storage = document.getElementById('storage');
    const total = meta.length;

    // Build O(1) lookup map
    const elMap = {};
    storage.querySelectorAll('[data-i]').forEach(el => {
      elMap[el.getAttribute('data-i')] = el;
    });

    // Detect overflow: with overflow:hidden, extra columns increase scrollWidth
    function overflows() {
      // Primary: scrollWidth exceeds visible width = content needs more columns
      if (testCol.scrollWidth > testCol.clientWidth + 1) return true;
      // Backup: check last element's position via getClientRects
      const last = testCol.lastElementChild;
      if (!last) return false;
      const cRect = testCol.getBoundingClientRect();
      const rects = last.getClientRects();
      if (rects.length === 0) return true; // element not laid out = fully clipped
      for (const r of rects) {
        if (r.left < cRect.left - 1) return true;   // RTL overflow (extra columns go left)
        if (r.bottom > cRect.bottom + 1) return true; // vertical overflow
      }
      return false;
    }

    // Get actual measured footnote area height
    function measuredFnH(fnAccum) {
      if (!fnAccum) return 0;
      testFn.innerHTML = fnAccum;
      const h = testFn.offsetHeight; // includes padding + border (box-sizing)
      return h;
    }

    const pages = [];
    let cur = 0;

    while (cur < total) {
      const pageItems = [];
      let fnAccum = '';
      let pageFnChapter = 0; // track chapter for footnote headings

      // Clear test column
      testCol.innerHTML = '';
      testCol.style.height = contentH + 'px';

      // Book title: always starts new page (column-span: all)
      if (meta[cur].type === 'book-title') {
        const src = elMap[cur];
        testCol.appendChild(src.cloneNode(true));
        pageItems.push(cur);
        cur++;
      }

      // Adjust height for current footnotes (none yet)
      let fnH = 0;
      testCol.style.height = (contentH - fnH) + 'px';

      while (cur < total) {
        const el = meta[cur];
        if (el.type === 'book-title') break;

        // Save state for rollback
        const savedFnAccum = fnAccum;
        const savedFnChapter = pageFnChapter;

        // Project new footnote area
        let projFnAccum = fnAccum;
        // Add chapter heading in footnotes when chapter changes (multi-chapter books)
        if (el.type === 'verse' && el.fnHtml && el.multiChapter && el.chapter !== pageFnChapter) {
          projFnAccum += '<div class="fn-ch">\u05E4\u05E8\u05E7 ' + el.chapterHeb + '</div>';
        }
        if (el.fnHtml) projFnAccum += el.fnHtml;
        const projFnH = measuredFnH(projFnAccum);

        // Update column height and add element
        testCol.style.height = (contentH - projFnH) + 'px';
        const src = elMap[cur];
        const clone = src.cloneNode(true);
        clone.removeAttribute('data-i');
        testCol.appendChild(clone);

        if (overflows()) {
          // Doesn't fit — remove and finalize page
          testCol.removeChild(clone);
          fnAccum = savedFnAccum;
          pageFnChapter = savedFnChapter;
          fnH = measuredFnH(fnAccum);
          testCol.style.height = (contentH - fnH) + 'px';
          break;
        }

        // Chapter heading: ensure at least one verse follows on same page
        if (el.type === 'chapter-heading' && cur + 1 < total && meta[cur + 1].type === 'verse') {
          const nextEl = meta[cur + 1];
          let testFnAccum = projFnAccum;
          // Account for chapter heading in footnotes for next verse
          if (nextEl.fnHtml && nextEl.multiChapter && nextEl.chapter !== (el.type === 'verse' ? el.chapter : pageFnChapter)) {
            testFnAccum += '<div class="fn-ch">\u05E4\u05E8\u05E7 ' + (nextEl.chapterHeb || '') + '</div>';
          }
          if (nextEl.fnHtml) testFnAccum += nextEl.fnHtml;
          const testFnH = measuredFnH(testFnAccum);
          testCol.style.height = (contentH - testFnH) + 'px';

          const nextSrc = elMap[cur + 1];
          const nextClone = nextSrc.cloneNode(true);
          nextClone.removeAttribute('data-i');
          testCol.appendChild(nextClone);
          const wouldOverflow = overflows();
          testCol.removeChild(nextClone);

          // Restore height
          testCol.style.height = (contentH - projFnH) + 'px';

          if (wouldOverflow) {
            testCol.removeChild(clone);
            fnAccum = savedFnAccum;
            pageFnChapter = savedFnChapter;
            fnH = measuredFnH(fnAccum);
            testCol.style.height = (contentH - fnH) + 'px';
            break;
          }
        }

        pageItems.push(cur);
        fnAccum = projFnAccum;
        fnH = projFnH;
        // Update chapter tracking
        if (el.type === 'verse') pageFnChapter = el.chapter;
        cur++;
      }

      if (pageItems.length === 0 && cur < total) {
        pageItems.push(cur);
        cur++;
      }

      pages.push(pageItems);
    }

    testFn.innerHTML = '';
    return pages;
  }, elMeta, CONTENT_H);

  // DEBUG: Check page 1 to verify overflow detection works
  const debug = await pagPage.evaluate((firstPage, contentH_pt) => {
    const ptToPx = 96 / 72;
    const contentH = contentH_pt * ptToPx;
    const testCol = document.getElementById('test-col');
    const storage = document.getElementById('storage');

    // Build O(1) lookup for debug
    const debugMap = {};
    storage.querySelectorAll('[data-i]').forEach(el => {
      debugMap[el.getAttribute('data-i')] = el;
    });

    testCol.innerHTML = '';
    testCol.style.height = contentH + 'px';

    for (const idx of firstPage) {
      const src = debugMap[idx];
      if (src) testCol.appendChild(src.cloneNode(true));
    }

    const cRect = testCol.getBoundingClientRect();
    const childInfo = [];
    for (let i = 0; i < Math.min(testCol.children.length, 30); i++) {
      const rects = testCol.children[i].getClientRects();
      const r0 = rects[0];
      childInfo.push({
        tag: testCol.children[i].className,
        text: testCol.children[i].textContent.substring(0, 20),
        left: r0 ? Math.round(r0.left) : null,
        top: r0 ? Math.round(r0.top) : null,
        bottom: r0 ? Math.round(r0.bottom) : null,
        right: r0 ? Math.round(r0.right) : null
      });
    }

    return {
      container: { left: Math.round(cRect.left), top: Math.round(cRect.top), right: Math.round(cRect.right), bottom: Math.round(cRect.bottom), w: Math.round(cRect.width), h: Math.round(cRect.height) },
      expectedH: Math.round(contentH),
      scrollW: testCol.scrollWidth, clientW: testCol.clientWidth,
      scrollH: testCol.scrollHeight, clientH: testCol.clientHeight,
      numChildren: testCol.children.length,
      children: childInfo
    };
  }, pageAssignments[0], CONTENT_H);

  console.log(`  DEBUG page 1: ${debug.numChildren} children, container h=${debug.container.h} expected=${debug.expectedH}`);
  console.log(`    scrollW=${debug.scrollW} clientW=${debug.clientW} scrollH=${debug.scrollH} clientH=${debug.clientH}`);
  console.log(`    Container: left=${debug.container.left} right=${debug.container.right} top=${debug.container.top} bottom=${debug.container.bottom}`);
  if (debug.children.length > 0) {
    const first = debug.children[0];
    const last = debug.children[debug.children.length - 1];
    console.log(`    First child: ${first.tag} "${first.text}" top=${first.top} bottom=${first.bottom} left=${first.left} right=${first.right}`);
    console.log(`    Last child: ${last.tag} "${last.text}" top=${last.top} bottom=${last.bottom} left=${last.left} right=${last.right}`);
  }

  await pagPage.close();
  try { fs.unlinkSync(pagPath); } catch(e) {}

  // Post-process: ensure no page ends with a chapter heading (orphaned heading)
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

  console.log(`  ${pageAssignments.length} pages`);

  // ── Build page objects from assignments ──
  const pages = [];
  let curBookHebrew = '';
  const FN_LINE_H_PT = 7.5 * 1.2 + 1; // font-size * line-height + margin-bottom
  const BT_H_PT = 18 + 8; // font-size + padding-bottom for book titles

  for (const indices of pageAssignments) {
    const pg = {
      items: [], footnotes: [], fnHeight: 0, btHeight: 0,
      bookHebrew: '', startChapter: 0, startVerse: 0, endChapter: 0, endVerse: 0
    };

    let totalFnLines = 0;
    for (const idx of indices) {
      const el = elements[idx];
      pg.items.push({ element: el, spanAll: el.type === 'book-title' });

      if (el.type === 'book-title') {
        curBookHebrew = el.hebrew;
        pg.btHeight = BT_H_PT;
      }
      if (el.type === 'verse') {
        if (el.footnotes?.length > 0) {
          pg.footnotes.push(...el.footnotes.map(f => ({
            ...f, verseNum: hebrewNum(el.verse),
            chapter: el.chapter, multiChapter: (el.bookChapters || 1) > 1
          })));
          totalFnLines += el.footnotes.length;
        }
        if (!pg.startChapter) {
          pg.startChapter = el.chapter;
          pg.startVerse = el.verse;
        }
        pg.endChapter = el.chapter;
        pg.endVerse = el.verse;
      }
      pg.bookHebrew = el.bookHebrew || curBookHebrew;
    }

    if (totalFnLines > 0) {
      pg.fnHeight = Math.ceil(totalFnLines / 3) * FN_LINE_H_PT;
    }

    pages.push(pg);
  }

  console.log(`  Built ${pages.length} page objects`);

  // ── Pass 3: Generate HTML ──
  console.log('Pass 3: Generating final HTML...');

  function renderPage(pg, pageNum) {
    const isOdd = pageNum % 2 === 1;
    const pR = isOdd ? GUTTER : OUTER;
    const pL = isOdd ? OUTER : GUTTER;

    let contentHtml = '';
    for (const item of pg.items) {
      const el = item.element;
      if (el.type === 'book-title') contentHtml += `<div class="bt">${el.hebrew}</div>`;
      else if (el.type === 'chapter-heading') contentHtml += `<div class="ch">${el.hebrew}</div>`;
      else contentHtml += `<div class="v">${el.html}</div>`;
    }

    let fnHtml = '';
    if (pg.footnotes.length > 0) {
      let lastVN = '';
      let lastCh = 0;
      for (const fn of pg.footnotes) {
        // Add chapter heading when chapter changes (multi-chapter books only)
        if (fn.chapter !== lastCh && fn.multiChapter) {
          fnHtml += `<div class="fn-ch">\u05E4\u05E8\u05E7 ${hebrewNum(fn.chapter)}</div>`;
          lastCh = fn.chapter;
          lastVN = ''; // reset so verse number shows after chapter heading
        }
        const showV = fn.verseNum !== lastVN;
        fnHtml += `<div class="fn-line">`;
        fnHtml += `<span class="fn-v">${showV ? fn.verseNum : ''}</span>`;
        fnHtml += `<span class="fn-m">${fn.marker}</span>`;
        fnHtml += `<span class="fn-t">${fn.text}</span>`;
        fnHtml += `</div>`;
        lastVN = fn.verseNum;
      }
    }

    let verseRange = '';
    if (pg.startChapter && pg.endChapter) {
      const sc = hebrewNum(pg.startChapter);
      const sv = hebrewNum(pg.startVerse);
      const ec = hebrewNum(pg.endChapter);
      const ev = hebrewNum(pg.endVerse);
      if (pg.startChapter === pg.endChapter) {
        verseRange = pg.startVerse === pg.endVerse ? `${sc}:${sv}` : `${sc}:${sv}–${ev}`;
      } else {
        verseRange = `${sc}:${sv} – ${ec}:${ev}`;
      }
    }

    return `<div class="page" style="padding-right:${pR}pt;padding-left:${pL}pt;">
  <div class="header"><span class="h-r">${pg.bookHebrew || ''}</span><span class="h-l">${verseRange}</span></div>
  <div class="content">${contentHtml}</div>
  ${fnHtml ? `<div class="fn-area">${fnHtml}</div>` : ''}
  <div class="pn">${hebrewNum(pageNum)}</div>
</div>`;
  }

  // ── Front matter pages ──
  function buildFrontMatter() {
    let html = '';
    const pad = `padding: ${MARGIN_TOP}pt ${GUTTER}pt ${MARGIN_BOTTOM}pt ${OUTER}pt`;
    const pageContentH = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM; // ~579.6pt available
    const CHARS_PER_LINE = 52; // approximate for 12pt Hebrew at 342pt width
    const LINE_H = 12 * 1.6; // 19.2pt
    const PARA_MARGIN = 8;
    const TITLE_H = 16 + 12 + 8; // section title font-size + line-height + margin

    // Estimate paragraph height from character count
    function estParaH(text) {
      const lines = Math.max(1, Math.ceil(text.length / CHARS_PER_LINE));
      return lines * LINE_H + PARA_MARGIN;
    }

    // Build multi-page section: splits paragraphs across pages if content too long
    function buildSectionPages(header, paragraphs) {
      const sectionPages = [];
      let curPage = [];
      let usedH = TITLE_H; // first page has title

      for (const p of paragraphs) {
        const pH = estParaH(p);
        if (usedH + pH > pageContentH && curPage.length > 0) {
          sectionPages.push(curPage);
          curPage = [];
          usedH = 0; // continuation pages have no title
        }
        curPage.push(p);
        usedH += pH;
      }
      if (curPage.length > 0) sectionPages.push(curPage);

      let result = '';
      for (let i = 0; i < sectionPages.length; i++) {
        result += `<div class="fm-page" style="${pad}">`;
        if (i === 0) result += `\n  <div class="fm-section-title">${header}</div>`;
        result += `\n  <div class="fm-text">${sectionPages[i].map(p => `<p>${p.trim()}</p>`).join('\n')}</div>`;
        result += `\n</div>`;
      }
      return result;
    }

    // 2 blank pages before title (Hebrew binding — title starts on left page)
    html += `<div class="fm-page" style="${pad}"></div>`;
    html += `<div class="fm-page" style="${pad}"></div>`;

    // Page 1: Title at top + translator/edition at bottom (single page)
    const s0 = frontMatter[0];
    const s1 = frontMatter[1];
    const transLines = s1.full.split('\n').filter(l => l.trim());
    html += `<div class="fm-page" style="${pad}">
      <div class="fm-title-page">
        <div class="fm-title-top">
          <div class="fm-main-title">${s0.header}</div>
          <div class="fm-subtitle">${s0.body}</div>
        </div>
        <div class="fm-title-bottom">
          ${transLines.map(l => `<div class="fm-trans-line">${l.trim()}</div>`).join('\n')}
        </div>
      </div>
    </div>`;

    // Translator's introduction (may span multiple pages)
    const s2 = frontMatter[2];
    const introParagraphs = s2.body.split('\n').filter(l => l.trim());
    html += buildSectionPages(s2.header, introParagraphs);

    // BOM Title page (may span multiple pages)
    const s3 = frontMatter[3];
    const titleParas = s3.body.split('\n').filter(l => l.trim());
    html += buildSectionPages(s3.header, titleParas);

    // Remaining sections: Introduction, testimonies, etc.
    for (let i = 4; i < frontMatter.length; i++) {
      const s = frontMatter[i];
      if (s.header === 'ראשי דברים') {
        // Table of contents — generate with actual page numbers
        html += `<div class="fm-page" style="${pad}">
          <div class="fm-section-title">${s.header}</div>
          <div class="fm-toc">`;

        // Find the page number for each book
        for (const book of BOOKS) {
          const bookPageIdx = pageAssignments.findIndex(indices =>
            indices.some(idx => elements[idx].type === 'book-title' && elements[idx].book === book.name)
          );
          const pageNum = bookPageIdx >= 0 ? bookPageIdx + 1 : '';
          const hebPageNum = pageNum ? hebrewNum(pageNum) : '';
          html += `<div class="fm-toc-line"><span>${book.hebrew}</span><span>${hebPageNum}</span></div>\n`;
        }

        html += `</div></div>`;
        continue;
      }

      const bodyLines = s.body.split('\n').filter(l => l.trim());
      html += buildSectionPages(s.header, bodyLines);
    }

    // 2 blank pages after TOC (so 1 Nephi starts on left page)
    html += `<div class="fm-page" style="${pad}"></div>`;
    html += `<div class="fm-page" style="${pad}"></div>`;

    return html;
  }

  const fmHtml = buildFrontMatter();
  const fmPageCount = (fmHtml.match(/class="fm-page/g) || []).length;
  console.log(`  Front matter: ${fmPageCount} pages`);

  let pagesHtml = '';
  for (let i = 0; i < pages.length; i++) pagesHtml += renderPage(pages[i], i + 1);

  const finalHtml = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap" rel="stylesheet">
<style>
@page { size: 6in 9in; margin: 0; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'David Libre', 'David', serif; background: white; }
.page {
  width: ${PAGE_W}pt; height: ${PAGE_H}pt;
  padding-top: ${MARGIN_TOP}pt; padding-bottom: ${MARGIN_BOTTOM}pt;
  overflow: hidden; page-break-after: always;
  display: flex; flex-direction: column;
}
.page:last-child { page-break-after: auto; }
.header {
  display: flex; justify-content: space-between; flex-shrink: 0;
  font-size: 8pt; color: #555; border-bottom: 0.5pt solid #999;
  padding-bottom: 2pt; margin-bottom: ${HEADER_GAP}pt; height: ${HEADER_H}pt; direction: rtl;
}
.h-r { font-weight: 500; }
.content {
  flex: 1; min-height: 0;
  column-count: 2; column-gap: ${COL_GAP}pt; column-fill: auto;
  column-rule: 0.5pt solid #bbb;
  font-size: 12pt; line-height: 1.4;
  text-align: justify; direction: rtl; overflow: hidden;
}
.v { display: block; margin-bottom: 3pt; }
.vn { font-weight: 700; font-size: 0.85em; }
.xm { font-size: 0.6em; color: #444; vertical-align: super; margin: 0 1px; }
.bt { text-align: center; font-size: 18pt; font-weight: 700; padding: 0 0 8pt; margin: 0; column-span: all; }
.ch {
  text-align: center; font-size: 13pt; font-weight: 700;
  padding: 6pt 0 5pt; border-top: 0.5pt solid #aaa; border-bottom: 0.5pt solid #aaa; margin: 4pt 0;
  break-after: avoid;
}
.fn-area {
  flex-shrink: 0; padding: 4pt 0 0;
  border-top: 0.5pt solid #999; font-size: 7.5pt; line-height: 1.2; direction: rtl;
  column-count: 3; column-gap: ${COL_GAP}pt; column-rule: 0.5pt solid #bbb;
}
.fn-ch { text-align: center; font-weight: 700; padding: 2pt 0 1pt; column-span: all; font-size: 8pt; }
.fn-line { break-inside: avoid; margin-bottom: 1pt; display: flex; gap: 2pt; direction: rtl; }
.fn-v { font-weight: 700; width: 1.4em; text-align: right; flex-shrink: 0; }
.fn-m { font-weight: 700; width: 0.9em; text-align: center; flex-shrink: 0; }
.fn-t { flex: 1; }
.pn {
  flex-shrink: 0; font-size: 8pt; color: #555;
  text-align: center; height: ${PAGE_NUM_H}pt;
}
.fm-page {
  width: ${PAGE_W}pt; height: ${PAGE_H}pt;
  position: relative; overflow: hidden; page-break-after: always;
  font-family: 'David Libre', 'David', serif; font-size: 12pt; line-height: 1.6;
  direction: rtl; text-align: justify;
}
.fm-center {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; text-align: center;
}
.fm-title-page {
  display: flex; flex-direction: column; justify-content: space-between;
  height: 100%; text-align: center;
}
.fm-title-top { padding-top: 48pt; }
.fm-title-bottom { padding-bottom: 48pt; }
.fm-main-title { font-size: 28pt; font-weight: 700; margin-bottom: 16pt; }
.fm-subtitle { font-size: 16pt; color: #333; }
.fm-trans-line { font-size: 14pt; margin-bottom: 8pt; }
.fm-section-title {
  font-size: 16pt; font-weight: 700; text-align: center;
  margin-bottom: 12pt; column-span: all;
}
.fm-text p { margin-bottom: 8pt; text-indent: 0; }
.fm-title-text { text-align: center; margin-top: 16pt; }
.fm-title-text p { margin-bottom: 6pt; text-indent: 0; text-align: center; }
.fm-toc { direction: rtl; }
.fm-toc-line { display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 0.5pt dotted #999; }
</style></head><body>
${fmHtml}
${pagesHtml}
</body></html>`;

  const htmlPath = path.join(__dirname, '_hebrew_bom_pages.html');
  fs.writeFileSync(htmlPath, finalHtml, 'utf8');
  console.log(`  HTML: ${(finalHtml.length / 1024 / 1024).toFixed(1)} MB`);

  // ── Pass 4: Render PDF ──
  console.log('Pass 4: Rendering PDF...');
  const pdfPage = await browser.newPage();
  pdfPage.setDefaultTimeout(600000);
  await pdfPage.goto('file:///' + htmlPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0', timeout: 120000
  });
  await pdfPage.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 3000));

  const outputPath = path.join(BASE, 'Hebrew_BOM_Scripture.pdf');
  await pdfPage.pdf({
    path: outputPath, width: '6in', height: '9in',
    printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: false, margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  const stats = fs.statSync(outputPath);
  console.log(`\nPDF: ${outputPath}`);
  console.log(`  Pages: ${fmPageCount + pages.length} (${fmPageCount} front + ${pages.length} content), Size: ${(stats.size/1024/1024).toFixed(1)} MB`);

  await browser.close();
  console.log('Done!');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
