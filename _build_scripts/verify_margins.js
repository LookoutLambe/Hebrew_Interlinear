const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

(async () => {
  // Check both PDFs
  for (const file of ['Hebrew_Interlinear_BOM_KDP.pdf', 'Hebrew_Interlinear_BOM_KDP_RTL.pdf']) {
    const fp = path.resolve(__dirname, file);
    if (!fs.existsSync(fp)) { console.log(`${file}: NOT FOUND`); continue; }

    const bytes = fs.readFileSync(fp);
    const pdf = await PDFDocument.load(bytes);
    const pages = pdf.getPages();

    console.log(`\n=== ${file} ===`);
    console.log(`Pages: ${pages.length}`);
    console.log(`File size: ${(bytes.length / 1024 / 1024).toFixed(1)} MB`);

    // Check first few pages
    for (const i of [0, 1, 7, 199, pages.length - 1]) {
      if (i >= pages.length) continue;
      const pg = pages[i];
      const mb = pg.getMediaBox();
      const sz = pg.getSize();
      console.log(`  Page ${i + 1}: MediaBox=[${mb.x.toFixed(1)}, ${mb.y.toFixed(1)}, ${mb.width.toFixed(1)}, ${mb.height.toFixed(1)}] Size=${sz.width.toFixed(1)}x${sz.height.toFixed(1)}pt (${(sz.width/72).toFixed(2)}"x${(sz.height/72).toFixed(2)}")`);
    }

    // For RTL version, verify the shift
    if (file.includes('RTL')) {
      const p1 = pages[0];
      const mb = p1.getMediaBox();
      console.log(`\n  Margin analysis for RTL version:`);
      console.log(`    MediaBox origin X: ${mb.x.toFixed(1)}pt = ${(mb.x/72).toFixed(3)}in`);
      console.log(`    This shifts content ${(mb.x/72).toFixed(3)}in to the left`);
      console.log(`    Original left margin: 0.65in → New effective left: ${(0.65 - mb.x/72).toFixed(3)}in`);
      console.log(`    Original right margin: 0.4in → New effective right: ${(0.4 + mb.x/72).toFixed(3)}in (GUTTER)`);
    }
  }
})();
