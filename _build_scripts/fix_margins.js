const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// The existing PDF has margins: top=0.5in right=0.4in bottom=0.4in left=0.65in (gutter on LEFT = English)
// For Hebrew RTL, gutter should be on RIGHT (binding on right side).
//
// We can't move content after rendering, but we CAN adjust the CropBox/MediaBox
// to shift the visible area. A simpler approach: re-generate with correct margins.
//
// But since re-generation times out, the practical fix is to shift each page's
// content by adjusting its MediaBox. The content was rendered with left=0.65in, right=0.4in.
// We need left=0.4in, right=0.65in. That's a shift of 0.25in = 18pt to the RIGHT.

(async () => {
  const inputPath = path.resolve(__dirname, 'Hebrew_Interlinear_BOM_KDP.pdf');
  const outputPath = path.resolve(__dirname, 'Hebrew_Interlinear_BOM_KDP_RTL.pdf');

  console.log('Loading PDF...');
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  console.log(`Total pages: ${pages.length}`);

  // Current MediaBox: [0, 0, 576, 720] (8in x 10in at 72dpi)
  // Current margins baked in by Puppeteer:
  //   top=0.5in=36pt, right=0.4in=28.8pt, bottom=0.4in=28.8pt, left=0.65in=46.8pt
  // Content area: x from 46.8 to 547.2 (=576-28.8), width=500.4pt
  //
  // We want: top=0.5in=36pt, right=0.65in=46.8pt, bottom=0.4in=28.8pt, left=0.4in=28.8pt
  // Shift needed: move content 18pt to the left (decrease left margin by 18pt, increase right by 18pt)
  //
  // We do this by shifting the MediaBox to the RIGHT by 18pt.
  // New MediaBox: [18, 0, 594, 720]
  // This means the PDF viewer sees a 576pt wide page starting at x=18,
  // effectively moving all content 18pt to the left on the page.

  const shiftPt = 18; // 0.25in = 18pt

  for (const pg of pages) {
    const mb = pg.getMediaBox();
    // Shift the mediabox origin to the right
    pg.setMediaBox(mb.x + shiftPt, mb.y, mb.width, mb.height);

    // Also shift CropBox if it exists
    const cb = pg.getCropBox();
    pg.setCropBox(cb.x + shiftPt, cb.y, cb.width, cb.height);
  }

  console.log('Saving RTL-gutter PDF...');
  const newBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, newBytes);

  const sizeMB = (newBytes.length / 1024 / 1024).toFixed(1);
  console.log(`\nSaved: ${outputPath}`);
  console.log(`File size: ${sizeMB} MB`);
  console.log(`Pages: ${pages.length}`);
  console.log('Gutter margin shifted to RIGHT side for RTL Hebrew binding.');
})();
