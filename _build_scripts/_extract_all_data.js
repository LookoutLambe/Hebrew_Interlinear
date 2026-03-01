const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BOOKS = [
  { name: '1 Nephi',          hebrew: '\u05E0\u05B6\u05E4\u05B4\u05D9 \u05D0\u05F3',           chapters: 22, prefix: 'ch',    colophon: 'colophonWords' },
  { name: '2 Nephi',          hebrew: '\u05E0\u05B6\u05E4\u05B4\u05D9 \u05D1\u05F3',           chapters: 33, prefix: 'n2_ch', colophon: 'n2_colophonVerses' },
  { name: 'Jacob',            hebrew: '\u05D9\u05B7\u05E2\u05B2\u05E7\u05B9\u05D1',            chapters: 7,  prefix: 'jc_ch', colophon: 'jc_colophonVerses' },
  { name: 'Enos',             hebrew: '\u05D0\u05B1\u05E0\u05D5\u05B9\u05E9\u05C1',            chapters: 1,  prefix: 'en_ch' },
  { name: 'Jarom',            hebrew: '\u05D9\u05B8\u05E8\u05D5\u05B9\u05DD',             chapters: 1,  prefix: 'jr_ch' },
  { name: 'Omni',             hebrew: '\u05E2\u05B8\u05DE\u05B0\u05E0\u05B4\u05D9',            chapters: 1,  prefix: 'om_ch' },
  { name: 'Words of Mormon',  hebrew: '\u05D3\u05B4\u05BC\u05D1\u05B0\u05E8\u05B5\u05D9 \u05DE\u05D5\u05B9\u05E8\u05B0\u05DE\u05D5\u05B9\u05DF', chapters: 1,  prefix: 'wm_ch' },
  { name: 'Mosiah',           hebrew: '\u05DE\u05D5\u05B9\u05E9\u05B4\u05C1\u05D9\u05BC\u05B8\u05D4',         chapters: 29, prefix: 'mo_ch' },
  { name: 'Alma',             hebrew: '\u05D0\u05B7\u05DC\u05B0\u05DE\u05B8\u05D0',            chapters: 63, prefix: 'al_ch' },
  { name: 'Helaman',          hebrew: '\u05D4\u05B5\u05D9\u05DC\u05B8\u05DE\u05B8\u05DF',           chapters: 16, prefix: 'he_ch' },
  { name: '3 Nephi',          hebrew: '\u05E0\u05B6\u05E4\u05B4\u05D9 \u05D2\u05F3',           chapters: 30, prefix: 'tn_ch' },
  { name: '4 Nephi',          hebrew: '\u05E0\u05B6\u05E4\u05B4\u05D9 \u05D3\u05F3',           chapters: 1,  prefix: 'fn_ch' },
  { name: 'Mormon',           hebrew: '\u05DE\u05D5\u05B9\u05E8\u05B0\u05DE\u05D5\u05B9\u05DF',          chapters: 9,  prefix: 'mm_ch' },
  { name: 'Ether',            hebrew: '\u05E2\u05B5\u05EA\u05B6\u05E8',              chapters: 15, prefix: 'et_ch' },
  { name: 'Moroni',           hebrew: '\u05DE\u05D5\u05B9\u05E8\u05D5\u05B9\u05E0\u05B4\u05D9',          chapters: 10, prefix: 'mr_ch' },
];

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'], protocolTimeout: 600000 });
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  const bomPath = path.resolve(__dirname, '..', 'BOM.html');
  console.log('Loading BOM.html...');
  await page.goto('file:///' + bomPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 120000 });
  console.log('Extracting data...');

  const result = await page.evaluate((booksJson) => {
    const books = JSON.parse(booksJson);
    const out = [];
    function getVar(name) { try { return eval(name); } catch(e) { return null; } }

    for (const book of books) {
      const bData = { name: book.name, hebrew: book.hebrew, colophon: null, chapters: [] };

      if (book.colophon) {
        const col = getVar(book.colophon);
        if (col) {
          if (Array.isArray(col) && col.length > 0) {
            if (Array.isArray(col[0]) && col[0].length === 2) {
              bData.colophon = [{ num: '', words: col }];
            } else {
              bData.colophon = col;
            }
          }
        }
      }

      for (let ch = 1; ch <= book.chapters; ch++) {
        const varName = book.prefix + ch + 'Verses';
        const verses = getVar(varName);
        if (verses) {
          bData.chapters.push({ num: ch, verses });
        } else {
          console.warn('Missing: ' + varName);
        }
      }
      out.push(bData);
    }
    return out;
  }, JSON.stringify(BOOKS));

  await browser.close();

  let totalVerses = 0;
  for (const b of result) for (const c of b.chapters) totalVerses += c.verses.length;

  const outPath = path.resolve(__dirname, '..', '_all_data.json');
  fs.writeFileSync(outPath, JSON.stringify(result));
  console.log(`Saved: ${outPath}`);
  console.log(`Books: ${result.length}, Verses: ${totalVerses}`);
})();
