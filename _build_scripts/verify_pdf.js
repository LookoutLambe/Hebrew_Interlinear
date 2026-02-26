const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(300000);
  await page.setViewport({ width: 576, height: 720 });

  const filePath = path.resolve(__dirname, 'BOM.html');
  await page.goto('file:///' + filePath.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);

  // Show all panels, hide UI
  await page.evaluate(() => {
    document.querySelectorAll('.chapter-panel').forEach(p => p.style.display = 'block');
    document.querySelector('.controls').style.display = 'none';
    document.getElementById('menu-toggle').style.display = 'none';
    document.getElementById('drawer').style.display = 'none';
    document.getElementById('drawer-overlay').style.display = 'none';
  });

  // Screenshot the top (title + intro)
  await page.screenshot({ path: 'pdf_preview_top.png', fullPage: false });
  console.log('Saved pdf_preview_top.png');

  // Scroll to 1 Nephi chapter 1
  await page.evaluate(() => {
    const ch1 = document.getElementById('panel-ch1');
    if (ch1) ch1.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'pdf_preview_ch1.png', fullPage: false });
  console.log('Saved pdf_preview_ch1.png');

  // Scroll to Alma 32
  await page.evaluate(() => {
    const el = document.getElementById('panel-al-ch32');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'pdf_preview_alma32.png', fullPage: false });
  console.log('Saved pdf_preview_alma32.png');

  await browser.close();
  console.log('Done!');
})();
