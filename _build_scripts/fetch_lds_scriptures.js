// Fetch D&C, Moses, Abraham, JS-H verse text from churchofjesuschrist.org
// and add to scripture_verses.js
const fs = require('fs');
const https = require('https');
const path = require('path');
const BASE = path.resolve(__dirname, '..');

// Load existing scripture_verses
let existing = {};
try {
  const jsContent = fs.readFileSync(path.join(BASE, 'scripture_verses.js'), 'utf8');
  const match = jsContent.match(/window\._scriptureVerses\s*=\s*(\{[\s\S]*\})\s*;/);
  if (match) existing = JSON.parse(match[1]);
  console.log('Loaded existing verses:', Object.keys(existing).length);
} catch (e) {
  console.log('Could not load existing, starting fresh');
}

// Chapters to fetch
// D&C: sections 1-138
// Moses: chapters 1-8
// Abraham: chapters 1-5
// JS-H: chapter 1
const toFetch = [];

// D&C chapters needed (from crossrefs analysis)
const dcChapters = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,38,39,40,41,42,43,44,45,46,47,48,49,50,52,53,54,55,56,58,59,60,61,62,63,64,66,67,68,71,72,74,75,76,77,78,82,83,84,85,86,87,88,89,90,93,95,97,98,100,101,103,104,105,107,108,109,110,111,112,113,115,117,119,121,122,123,124,127,128,129,130,132,133,134,135,136,137,138];

dcChapters.forEach(ch => {
  toFetch.push({
    book: 'D&C',
    chapter: ch,
    uri: `/scriptures/dc-testament/dc/${ch}`,
  });
});

// Moses chapters 1-8
for (let ch = 1; ch <= 8; ch++) {
  toFetch.push({
    book: 'Moses',
    chapter: ch,
    uri: `/scriptures/pgp/moses/${ch}`,
  });
}

// Abraham chapters 1-5
for (let ch = 1; ch <= 5; ch++) {
  toFetch.push({
    book: 'Abraham',
    chapter: ch,
    uri: `/scriptures/pgp/abr/${ch}`,
  });
}

// JS-H chapter 1
toFetch.push({
  book: 'JS-H',
  chapter: 1,
  uri: `/scriptures/pgp/js-h/1`,
});

console.log(`Total chapters to fetch: ${toFetch.length}`);

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Parse verse content from the Church website HTML
function parseVersesFromHtml(html) {
  const verses = {};

  // The Church website embeds verse content in <p> tags with class "verse"
  // or in structured content. Let's try multiple patterns.

  // Pattern 1: Look for verse content in the HTML
  // Verse markers typically have data-aid attributes or verse number spans
  // The format is usually: <span class="verse-number">1</span> verse text...

  // Try to find verse paragraphs
  const verseRe = /<p[^>]*class="[^"]*verse[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = verseRe.exec(html)) !== null) {
    const content = m[1];
    // Extract verse number
    const numMatch = content.match(/class="[^"]*verse-number[^"]*"[^>]*>(\d+)<\/span>/);
    if (numMatch) {
      const verseNum = parseInt(numMatch[1]);
      // Strip HTML tags to get plain text
      let text = content
        .replace(/<span[^>]*class="[^"]*verse-number[^"]*"[^>]*>\d+\s*<\/span>/g, '')
        .replace(/<sup[^>]*>.*?<\/sup>/g, '')  // Remove footnote markers
        .replace(/<[^>]+>/g, '')  // Remove remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      if (text) verses[verseNum] = text;
    }
  }

  // Pattern 2: If pattern 1 didn't work, try JSON-LD or script data
  if (Object.keys(verses).length === 0) {
    // Look for structured data in script tags
    const scriptRe = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    while ((m = scriptRe.exec(html)) !== null) {
      try {
        const data = JSON.parse(m[1]);
        if (data.text) {
          // Try to parse verse numbers from the text
        }
      } catch(e) {}
    }
  }

  // Pattern 3: Try simpler regex for verse content
  if (Object.keys(verses).length === 0) {
    // Some pages use <p id="p1" ...> format
    const pRe = /<p[^>]*id="p(\d+)"[^>]*>([\s\S]*?)<\/p>/gi;
    while ((m = pRe.exec(html)) !== null) {
      const verseNum = parseInt(m[1]);
      let text = m[2]
        .replace(/<sup[^>]*>.*?<\/sup>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      // Remove leading verse number if present
      text = text.replace(/^\d+\s+/, '');
      if (text && verseNum > 0) verses[verseNum] = text;
    }
  }

  return verses;
}

async function main() {
  const results = { ...existing };
  let fetched = 0, errors = 0, versesAdded = 0;

  for (let i = 0; i < toFetch.length; i++) {
    const { book, chapter, uri } = toFetch[i];

    // Check if we already have verses for this chapter
    const chapterKey = `${book}|${chapter}|`;
    const existingForChapter = Object.keys(results).filter(k => k.startsWith(chapterKey));
    if (existingForChapter.length > 5) {
      // Already have this chapter
      fetched++;
      continue;
    }

    const url = `https://www.churchofjesuschrist.org/study${uri}?lang=eng`;
    try {
      const resp = await fetchUrl(url);
      if (resp.status === 200) {
        const verses = parseVersesFromHtml(resp.body);
        const count = Object.keys(verses).length;
        if (count > 0) {
          for (const [vNum, text] of Object.entries(verses)) {
            results[`${book}|${chapter}|${vNum}`] = text;
            versesAdded++;
          }
          fetched++;
          process.stdout.write(`\r  ${book} ${chapter}: ${count} verses    `);
        } else {
          // Try to debug
          console.log(`\n  WARNING: ${book} ${chapter} - parsed 0 verses from ${resp.body.length} chars`);
          // Save a sample for debugging
          if (i < 3) {
            fs.writeFileSync(path.join(BASE, `_build_scripts/debug_html_${book}_${chapter}.html`), resp.body.substring(0, 5000), 'utf8');
          }
          errors++;
        }
      } else {
        console.log(`\n  ERROR: ${book} ${chapter} - HTTP ${resp.status}`);
        errors++;
      }
    } catch (e) {
      console.log(`\n  ERROR: ${book} ${chapter} - ${e.message}`);
      errors++;
    }

    await sleep(500); // Be respectful

    // Save periodically
    if ((i + 1) % 20 === 0) {
      const jsContent = 'window._scriptureVerses = ' + JSON.stringify(results, null, 0) + ';\n';
      fs.writeFileSync(path.join(BASE, 'scripture_verses.js'), jsContent, 'utf8');
      console.log(`\n  Saved progress: ${Object.keys(results).length} total verses`);
    }
  }

  console.log(`\n\nFetch complete: ${fetched} chapters ok, ${errors} errors`);
  console.log(`Verses added: ${versesAdded}`);
  console.log(`Total verses in file: ${Object.keys(results).length}`);

  // Final save
  const jsContent = 'window._scriptureVerses = ' + JSON.stringify(results, null, 0) + ';\n';
  fs.writeFileSync(path.join(BASE, 'scripture_verses.js'), jsContent, 'utf8');
  console.log(`Saved scripture_verses.js (${(jsContent.length / 1024).toFixed(1)} KB)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
