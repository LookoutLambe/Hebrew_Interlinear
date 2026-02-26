/**
 * build_crossrefs.js
 *
 * One-time scraper to extract LDS scripture footnotes/cross-references
 * from churchofjesuschrist.org Book of Mormon chapter pages.
 *
 * Outputs: crossrefs.json
 * Usage: node build_crossrefs.js
 */

const https = require('https');
const fs = require('fs');

const BOOKS = [
  { name: '1 Nephi',         slug: '1-ne',   chapters: 22 },
  { name: '2 Nephi',         slug: '2-ne',   chapters: 30 },
  { name: 'Jacob',           slug: 'jacob',  chapters: 7  },
  { name: 'Enos',            slug: 'enos',   chapters: 1  },
  { name: 'Jarom',           slug: 'jarom',  chapters: 1  },
  { name: 'Omni',            slug: 'omni',   chapters: 1  },
  { name: 'Words of Mormon', slug: 'w-of-m', chapters: 1  },
  { name: 'Mosiah',          slug: 'mosiah', chapters: 29 },
  { name: 'Alma',            slug: 'alma',   chapters: 63 },
  { name: 'Helaman',         slug: 'hel',    chapters: 16 },
  { name: '3 Nephi',         slug: '3-ne',   chapters: 30 },
  { name: '4 Nephi',         slug: '4-ne',   chapters: 1  },
  { name: 'Mormon',          slug: 'morm',   chapters: 9  },
  { name: 'Ether',           slug: 'ether',  chapters: 15 },
  { name: 'Moroni',          slug: 'moro',   chapters: 10 },
];

const BASE_URL = 'https://www.churchofjesuschrist.org/study/scriptures/bofm';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'text/html' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = 'https://www.churchofjesuschrist.org' + loc;
        fetchPage(loc).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function parseChapter(html, bookName, chapter) {
  const result = {};

  // Split HTML at <footer to separate verse body from footnotes
  const footerStart = html.indexOf('<footer');
  const bodyHtml = footerStart > -1 ? html.substring(0, footerStart) : html;
  const footerHtml = footerStart > -1 ? html.substring(footerStart) : '';

  // ── Step 1: Collect inline markers (word being footnoted) ──
  // Pattern: <a class="study-note-ref" ... data-scroll-id="note1_a"><sup class="marker" data-value="a"></sup>word</a>
  const inlineMarkers = {};
  const inlineRegex = /<a[^>]*study-note-ref[^>]*data-scroll-id="(note(\d+)_([a-z]))"[^>]*><sup[^>]*data-value="[a-z]"[^>]*><\/sup>([^<]*)<\/a>/gi;
  let im;
  while ((im = inlineRegex.exec(bodyHtml)) !== null) {
    const noteId = im[1];    // note1_a
    const verseNum = im[2];  // 1
    const letter = im[3];    // a
    const word = im[4].trim();
    if (!inlineMarkers[verseNum]) inlineMarkers[verseNum] = [];
    inlineMarkers[verseNum].push({ letter, word, noteId });
  }

  // ── Step 2: Parse footnote definitions from <footer> ──
  // Pattern: <li data-marker="a" id="note1_a" data-full-marker="1a"> ... <a class="scripture-ref" href="...">Ref Text</a> ... </li>
  const footnoteDefs = {};
  const noteRegex = /<li[^>]*id="(note(\d+)_([a-z]))"[^>]*data-full-marker="(\d+[a-z])"[^>]*>([\s\S]*?)<\/li>/gi;
  let nm;
  while ((nm = noteRegex.exec(footerHtml)) !== null) {
    const noteId = nm[1];
    const verseNum = nm[2];
    const letter = nm[3];
    const content = nm[5];

    // Extract category (tg = Topical Guide, cross-ref, gst = Guide to Scriptures, etc.)
    const catMatch = content.match(/data-note-category="([^"]*)"/);
    const category = catMatch ? catMatch[1] : '';

    // Extract references from <a class="scripture-ref">
    const refs = [];
    const refRegex = /<a[^>]*class="scripture-ref"[^>]*>([^<]*(?:<small>[^<]*<\/small>[^<]*)?)<\/a>/gi;
    let rm;
    while ((rm = refRegex.exec(content)) !== null) {
      let refText = rm[1].replace(/<\/?small>/g, '').replace(/&amp;/g, '&').trim();
      if (refText) refs.push(refText);
    }

    footnoteDefs[noteId] = { category, refs };
  }

  // ── Step 3: Merge inline markers with footnote definitions ──
  for (const verseNum in inlineMarkers) {
    const verseKey = `${bookName}|${chapter}|${verseNum}`;
    const entries = inlineMarkers[verseNum].map(m => {
      const def = footnoteDefs[m.noteId] || {};
      return {
        marker: m.letter,
        text: m.word,
        refs: def.refs && def.refs.length > 0 ? def.refs : undefined,
        category: def.category || undefined
      };
    });

    if (entries.length > 0) {
      result[verseKey] = entries;
    }
  }

  return result;
}

async function scrapeChapter(book, chapter, retries = 2) {
  const url = `${BASE_URL}/${book.slug}/${chapter}?lang=eng`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const html = await fetchPage(url);
      const refs = parseChapter(html, book.name, chapter);
      const verseCount = Object.keys(refs).length;
      const markerCount = Object.values(refs).reduce((s, arr) => s + arr.length, 0);
      process.stdout.write(`  ${book.name} ${chapter}: ${verseCount} verses, ${markerCount} markers\n`);
      return refs;
    } catch (err) {
      if (attempt < retries) {
        console.log(`  ${book.name} ${chapter}: retry (${err.message})`);
        await sleep(2000);
      } else {
        console.error(`  ${book.name} ${chapter}: FAILED - ${err.message}`);
        return {};
      }
    }
  }
}

async function main() {
  console.log('=== Building Cross-References from churchofjesuschrist.org ===\n');

  const allRefs = {};
  let totalVerses = 0;
  let totalMarkers = 0;
  let totalChapters = 0;

  for (const book of BOOKS) {
    console.log(`\n── ${book.name} (${book.chapters} chapters) ──`);

    for (let ch = 1; ch <= book.chapters; ch++) {
      const refs = await scrapeChapter(book, ch);
      for (const key in refs) {
        allRefs[key] = refs[key];
        totalMarkers += refs[key].length;
      }
      totalVerses += Object.keys(refs).length;
      totalChapters++;

      // Rate limit: 500ms between requests
      await sleep(500);
    }
  }

  // Write output
  const outputPath = 'crossrefs.json';
  fs.writeFileSync(outputPath, JSON.stringify(allRefs, null, 2), 'utf8');

  const sizeMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
  console.log(`\n=== Done ===`);
  console.log(`Chapters scraped: ${totalChapters}`);
  console.log(`Verses with footnotes: ${totalVerses}`);
  console.log(`Total footnote markers: ${totalMarkers}`);
  console.log(`Output: ${outputPath} (${sizeMB} MB)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
