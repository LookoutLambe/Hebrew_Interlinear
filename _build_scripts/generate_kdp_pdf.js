const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    protocolTimeout: 600000
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(600000); // 10 minutes — PDF generation on 135K elements is slow
  await page.setViewport({ width: 1200, height: 800 });

  const filePath = path.resolve(__dirname, 'BOM.html');
  console.log('Loading BOM.html...');
  await page.goto('file:///' + filePath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0',
    timeout: 120000
  });

  console.log('Waiting for fonts to load...');
  await page.evaluate(() => document.fonts.ready);

  // Do ALL DOM manipulation + CSS injection in ONE evaluate call
  console.log('Preparing content and injecting print styles...');
  const hiddenCount = await page.evaluate(() => {

    // ---- 1. Hide UI ----
    const hide = sel => document.querySelectorAll(sel).forEach(el => el.style.display = 'none');
    hide('.controls');
    hide('#menu-toggle');
    hide('#drawer');
    hide('#drawer-overlay');
    hide('.chapter-nav');

    // ---- 2. Show all chapter panels ----
    document.querySelectorAll('.chapter-panel').forEach(p => p.style.display = 'block');

    // ---- 3. Inject book headers for books that don't have them ----
    const bookFirstChapter = {
      'panel-ch1':    { he: 'נֶפִי א׳' },
      'panel-en-ch1': { he: 'אֱנוֹשׁ' },
      'panel-jr-ch1': { he: 'יָרוֹם' },
      'panel-om-ch1': { he: 'עָמְנִי' },
      'panel-wm-ch1': { he: 'דִּבְרֵי מוֹרְמוֹן' },
      'panel-mo-ch1': { he: 'מוֹשִׁיָּה' },
      'panel-al-ch1': { he: 'אַלְמָא' },
      'panel-he-ch1': { he: 'הֵילָמָן' },
      'panel-3n-ch1': { he: 'נֶפִי ג׳' },
      'panel-4n-ch1': { he: 'נֶפִי ד׳' },
      'panel-mm-ch1': { he: 'מוֹרְמוֹן' },
      'panel-et-ch1': { he: 'עֵתֶר' },
      'panel-mr-ch1': { he: 'מוֹרוֹנִי' },
    };
    for (const [panelId, info] of Object.entries(bookFirstChapter)) {
      const panel = document.getElementById(panelId);
      if (!panel || panel.querySelector('.book-header')) continue;
      const hdr = document.createElement('div');
      hdr.className = 'book-header print-book-header';
      hdr.innerHTML = '<div class="book-title">' + info.he + '</div>';
      panel.insertBefore(hdr, panel.firstChild);
    }

    // ---- 4. Hide ornament ----
    const ornament = document.querySelector('.ornament');
    if (ornament) ornament.style.display = 'none';

    // ---- 5. Hide empty panels ----
    let hidden = 0;
    document.querySelectorAll('.chapter-panel').forEach(p => {
      if (p.id === 'panel-intro') return;
      const hasWords = p.querySelectorAll('.word-unit').length > 0;
      const hasBookHeader = p.querySelector('.book-header');
      if (!hasWords && !hasBookHeader) {
        const vc = p.querySelectorAll('[id$="-verses"]');
        let hasVerses = false;
        vc.forEach(v => { if (v.children.length > 0) hasVerses = true; });
        if (!hasVerses) { p.style.display = 'none'; hidden++; }
      }
    });

    // ---- 6. Inject KDP print CSS directly ----
    const style = document.createElement('style');
    style.textContent = `
      @page {
        size: 8in 10in;
        margin: 0.5in 0.65in 0.4in 0.4in;
      }
      * { -webkit-print-color-adjust: exact; }
      html, body {
        background: white !important;
        margin: 0 !important;
        padding: 0 !important;
        font-size: 9pt;
      }
      .page {
        background: white !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: none !important;
        min-height: auto !important;
        box-shadow: none !important;
      }
      .page::before { display: none !important; }

      #panel-intro { page-break-after: always; }
      #panel-intro > div { max-width: none !important; padding: 0 !important; }
      #panel-intro p { font-size: 0.95em !important; line-height: 1.5 !important; margin-bottom: 8px !important; }

      .book-header {
        text-align: center;
        padding: 40px 0 14px !important;
        page-break-before: always;
      }
      .page > .book-header:first-child { page-break-before: auto; }
      .book-title { font-size: 1.8em !important; color: #1a1a1a !important; }
      .book-subtitle { font-size: 0.9em !important; color: #444 !important; }

      .chapter-panel { padding: 0 !important; page-break-before: auto; }
      .chapter-panel[id*="colophon"] { page-break-before: always; }
      .chapter-panel .book-header { page-break-before: auto; }

      .chapter-heading {
        text-align: center;
        padding: 10px 0 8px !important;
        margin-top: 12px !important;
        margin-bottom: 8px !important;
        border-top: 1px solid #aaa !important;
        border-bottom: 1px solid #aaa !important;
        page-break-after: avoid;
      }
      .chapter-heading h2 { font-size: 1.2em !important; color: #1a1a1a !important; }

      .verse {
        display: flex !important;
        align-items: flex-start !important;
        gap: 4px !important;
        padding: 3px 0 !important;
        border-bottom: none !important;
        background: none !important;
      }

      .verse-num {
        flex-shrink: 0 !important;
        width: 20px !important;
        font-size: 0.8em !important;
        font-weight: 700 !important;
        color: #555 !important;
        padding-top: 3px !important;
        line-height: 1 !important;
      }

      .word-flow {
        flex: 1 !important;
        direction: rtl !important;
        text-align: right !important;
      }

      .word-unit {
        display: inline-flex !important;
        flex-direction: column !important;
        align-items: center !important;
        padding: 1px 0px 2px !important;
        margin: 0px 2px !important;
        min-width: 18px !important;
        vertical-align: top !important;
        background: none !important;
      }
      .word-unit:hover { background: none !important; }

      .hw {
        font-size: 1.15em !important;
        font-weight: 500 !important;
        line-height: 1.25 !important;
        color: #000 !important;
        direction: rtl !important;
      }

      .gl {
        font-family: 'Crimson Pro', serif !important;
        font-size: 0.52em !important;
        font-style: italic !important;
        color: #444 !important;
        line-height: 1.1 !important;
        direction: ltr !important;
        opacity: 1 !important;
      }

      .arr { font-size: 0.9em !important; }

      .colophon {
        border: 1px solid #bbb !important;
        padding: 8px 12px !important;
        margin-bottom: 10px !important;
        background: none !important;
      }
      .colophon-label { color: #555 !important; font-size: 0.75em !important; margin-bottom: 6px !important; }
      .colophon .word-unit .hw { font-size: 0.9em !important; }
      .colophon .word-unit .gl { font-size: 0.45em !important; }

      .title-interlinear { margin: 10px 0 6px !important; padding: 8px 0 6px !important; }
      .tw .th { font-size: 1.4em !important; }
      .tw .tg { font-size: 0.65em !important; }

      .controls, #menu-toggle, #drawer, #drawer-overlay,
      .chapter-nav, .nav-next, .nav-prev { display: none !important; }
      .ornament { display: none !important; }
      .chapter-panel:empty { display: none !important; }
    `;
    document.head.appendChild(style);

    return hidden;
  });

  console.log(`Hidden ${hiddenCount} empty panels`);
  await new Promise(r => setTimeout(r, 2000));

  // ---- Generate PDF ----
  const outputPath = path.resolve(__dirname, 'Hebrew_Interlinear_BOM_KDP.pdf');
  console.log('Generating PDF (this may take a few minutes)...');

  await page.pdf({
    path: outputPath,
    width: '8in',
    height: '10in',
    printBackground: false,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: {
      top: '0.5in',
      right: '0.65in',   // gutter — RTL binding on right
      bottom: '0.4in',
      left: '0.4in'      // outer margin
    }
  });

  const fs = require('fs');
  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);

  console.log(`\nPDF generated: ${outputPath}`);
  console.log(`File size: ${sizeMB} MB`);

  await browser.close();
  console.log('Done!');
})();
