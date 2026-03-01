const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  const bomPath = path.resolve(__dirname, '..', 'BOM.html');
  await page.goto('file:///' + bomPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });

  const verses = await page.evaluate(() => {
    try { return ch1Verses; } catch(e) { return null; }
  });
  const colophon = await page.evaluate(() => {
    try { return colophonWords; } catch(e) { return null; }
  });
  await browser.close();

  // Build sample HTML
  const PAGE_W = 432, PAGE_H = 648;
  const TOP_M = 28.8, BOT_M = 14.4, COL_GAP = 10.8;
  const HEADER_H = 12, HEADER_GAP = 3, PAGE_NUM_H = 10;
  const GUTTER = 54, OUTER = 36;
  const CONTENT_H = PAGE_H - TOP_M - BOT_M - HEADER_H - HEADER_GAP - PAGE_NUM_H;
  const TEXT_AREA_W = PAGE_W - GUTTER - OUTER;

  function renderWord(heb, eng) {
    const gloss = (eng || '').replace(/-/g, '\u2011');
    return '<span class="wp"><span class="wh">' + heb + '</span><span class="we">' + gloss + '</span></span>';
  }

  function renderVerse(v) {
    const words = v.words.filter(p => p[0] && p[0] !== '\u05C3');
    if (!words.length) return '';
    let html = '<span class="vn">' + v.num + '</span>';
    for (let i = 0; i < words.length; i++) {
      html += renderWord(words[i][0], words[i][1]);
      if (i < words.length - 1) html += '<span class="arr">\u2039</span>';
    }
    html += '<span class="sof">\u05C3</span>';
    return html;
  }

  let bodyHtml = '';
  // Book title
  bodyHtml += '<div class="bt">\u05E0\u05B6\u05E4\u05B4\u05D9 \u05D0\u05F3</div>';
  bodyHtml += '<div class="bt-eng">1 Nephi</div>';

  // Colophon
  if (colophon) {
    bodyHtml += '<div class="colophon">';
    const cWords = colophon.filter(p => p[0] && p[0] !== '\u05C3');
    for (let i = 0; i < cWords.length; i++) {
      bodyHtml += renderWord(cWords[i][0], cWords[i][1]);
      if (i < cWords.length - 1) bodyHtml += '<span class="arr">\u2039</span>';
    }
    bodyHtml += '<span class="sof">\u05C3</span></div>';
  }

  // Chapter heading
  bodyHtml += '<div class="ch">\u05E4\u05E8\u05E7 \u05D0</div>';

  // Verses
  for (const v of verses) {
    bodyHtml += '<div class="v">' + renderVerse(v) + '</div>';
  }

  const html = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
@page { size: 6in 9in; margin: ${TOP_M}pt ${OUTER}pt ${BOT_M}pt ${GUTTER}pt; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'David Libre', 'David', serif;
  font-size: 10pt; line-height: 1.1;
  direction: rtl; background: white; color: #1a1a1a;
  column-count: 2; column-gap: ${COL_GAP}pt; column-fill: auto;
  column-rule: 0.5pt solid #ccc;
}
.bt {
  text-align: center; font-size: 15pt; font-weight: 700;
  padding: 6pt 0 1pt; column-span: all;
}
.bt-eng {
  text-align: center; font-family: 'Crimson Pro', serif;
  font-size: 8pt; font-weight: 600; color: #555;
  direction: ltr; margin-bottom: 2pt; column-span: all;
}
.ch {
  text-align: center; font-size: 10pt; font-weight: 700;
  padding: 2pt 0 1pt; border-top: 0.5pt solid #aaa;
  border-bottom: 0.5pt solid #aaa; margin: 1pt 0;
}
.colophon {
  column-span: all;
  margin-bottom: 2pt; padding: 2pt 4pt;
  border: 0.5pt solid #bbb; border-radius: 2pt;
  background: #fafaf7; direction: rtl;
}
.v { display: block; margin-bottom: 0.5pt; }
.vn {
  display: inline-block;
  font-size: 6pt; font-weight: 700; color: #666;
  margin-left: 1pt; vertical-align: top; padding-top: 0.5pt;
}
.wp {
  display: inline-flex; flex-direction: column;
  align-items: center;
  margin-left: 0.3pt; margin-bottom: 0pt;
  vertical-align: top;
}
.wh {
  font-family: 'David Libre', serif;
  font-size: 12pt; font-weight: 700;
  line-height: 1.05; color: #1a2744;
}
.we {
  font-family: 'Crimson Pro', serif;
  font-size: 5pt; font-style: italic;
  color: #555; direction: ltr;
  line-height: 1.0; white-space: nowrap;
}
.arr {
  display: inline-block; font-family: 'Crimson Pro', serif;
  font-size: 4pt; color: #bbb;
  vertical-align: bottom; padding-bottom: 0.5pt;
  margin: 0 0pt; line-height: 1;
}
.sof {
  font-family: 'David Libre', serif;
  font-size: 12pt; font-weight: 700;
  margin-right: 0.5pt; vertical-align: top;
  line-height: 1.05; color: #1a2744;
}
</style></head><body>
${bodyHtml}
</body></html>`;

  const outPath = path.resolve(__dirname, '..', '_sample_1nephi1.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Written: ' + outPath);
  console.log('Verses: ' + verses.length);
})();
