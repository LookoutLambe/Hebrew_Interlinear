const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const pageNum = parseInt(process.argv[2] || '1');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);

  // Create a simple HTML page that loads the PDF from localhost:3000
  const html = `<!DOCTYPE html>
<html><head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"><\/script>
</head><body style="margin:0;background:white">
<canvas id="c"></canvas>
<script>
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
async function renderPage(num) {
  try {
    const pdf = await pdfjsLib.getDocument('http://localhost:3000/Hebrew_Interlinear_BOM_KDP.pdf').promise;
    window._totalPages = pdf.numPages;
    const pg = await pdf.getPage(num);
    const vp = pg.getViewport({scale: 2});
    const canvas = document.getElementById('c');
    canvas.width = vp.width;
    canvas.height = vp.height;
    await pg.render({canvasContext: canvas.getContext('2d'), viewport: vp}).promise;
    window._done = true;
  } catch(e) {
    window._error = e.message;
    window._done = true;
  }
}
renderPage(${pageNum});
<\/script></body></html>`;

  const tmpHtml = path.resolve(__dirname, '_pdf_viewer.html');
  fs.writeFileSync(tmpHtml, html);

  await page.goto('file:///' + tmpHtml.replace(/\\/g, '/'), { waitUntil: 'networkidle2', timeout: 120000 });

  // Wait for rendering to complete
  await page.waitForFunction(() => window._done === true, { timeout: 120000 });

  const error = await page.evaluate(() => window._error);
  if (error) {
    console.log('Error:', error);
    fs.unlinkSync(tmpHtml);
    await browser.close();
    return;
  }

  const totalPages = await page.evaluate(() => window._totalPages);
  console.log('Total pages in PDF:', totalPages);

  await page.screenshot({ path: `pdf_page_${pageNum}.png`, fullPage: true });
  console.log(`Saved pdf_page_${pageNum}.png`);

  fs.unlinkSync(tmpHtml);
  await browser.close();
})();
