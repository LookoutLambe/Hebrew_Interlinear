// Fetch all non-BOM scripture verse text referenced in crossrefs.json
// Uses bible-api.com for Bible (KJV)
// Retries failed chapters with longer delays
const fs = require('fs');
const https = require('https');

const path = require('path');
const BASE = path.resolve(__dirname, '..');
const crossrefs = require(path.join(BASE, 'crossrefs.json'));

// Load existing results if available (resume capability)
let existingVerses = {};
try {
  existingVerses = JSON.parse(fs.readFileSync(path.join(BASE, 'scripture_verses.json'), 'utf8'));
  console.log('Loaded existing cache:', Object.keys(existingVerses).length, 'verses');
} catch(e) {
  console.log('No existing cache, starting fresh');
}

const bomAbbrevs = ['1 Ne.','2 Ne.','3 Ne.','4 Ne.','Jacob','Enos','Jarom','Omni','W of M','Mosiah','Alma','Hel.','Morm.','Ether','Moro.'];

const bibleBookMap = {
  'Gen.': 'Genesis', 'Ex.': 'Exodus', 'Lev.': 'Leviticus', 'Num.': 'Numbers',
  'Deut.': 'Deuteronomy', 'Josh.': 'Joshua', 'Judg.': 'Judges', 'Ruth': 'Ruth',
  '1 Sam.': '1 Samuel', '2 Sam.': '2 Samuel', '1 Kgs.': '1 Kings', '2 Kgs.': '2 Kings',
  '1 Chr.': '1 Chronicles', '2 Chr.': '2 Chronicles', 'Ezra': 'Ezra', 'Neh.': 'Nehemiah',
  'Esth.': 'Esther', 'Job': 'Job', 'Ps.': 'Psalms', 'Prov.': 'Proverbs',
  'Eccl.': 'Ecclesiastes', 'Song': 'Song of Solomon', 'Isa.': 'Isaiah', 'Jer.': 'Jeremiah',
  'Lam.': 'Lamentations', 'Ezek.': 'Ezekiel', 'Dan.': 'Daniel', 'Hosea': 'Hosea',
  'Joel': 'Joel', 'Amos': 'Amos', 'Obad.': 'Obadiah', 'Jonah': 'Jonah',
  'Micah': 'Micah', 'Nahum': 'Nahum', 'Hab.': 'Habakkuk', 'Zeph.': 'Zephaniah',
  'Hag.': 'Haggai', 'Zech.': 'Zechariah', 'Mal.': 'Malachi',
  'Matt.': 'Matthew', 'Mark': 'Mark', 'Luke': 'Luke', 'John': 'John',
  'Acts': 'Acts', 'Rom.': 'Romans', '1 Cor.': '1 Corinthians', '2 Cor.': '2 Corinthians',
  'Gal.': 'Galatians', 'Eph.': 'Ephesians', 'Philip.': 'Philippians', 'Col.': 'Colossians',
  '1 Thes.': '1 Thessalonians', '2 Thes.': '2 Thessalonians',
  '1 Tim.': '1 Timothy', '2 Tim.': '2 Timothy', 'Titus': 'Titus', 'Philem.': 'Philemon',
  'Heb.': 'Hebrews', 'James': 'James', '1 Pet.': '1 Peter', '2 Pet.': '2 Peter',
  '1 Jn.': '1 John', '2 Jn.': '2 John', '3 Jn.': '3 John', 'Jude': 'Jude', 'Rev.': 'Revelation'
};

function parseRef(refText, lastBook) {
  refText = refText.trim();
  if (/^(TG |GS |BD |IE |HEB |OR |JST )/.test(refText)) return null;
  if (!/\d/.test(refText)) return null;
  if (/^\d+:\d+/.test(refText) && lastBook) {
    const m = refText.match(/^(\d+):(\d+)/);
    if (m) return { book: lastBook.book, chapter: parseInt(m[1]), verse: parseInt(m[2]), apiName: lastBook.apiName, source: lastBook.source };
  }
  if (/^v{1,2}\.\s*\d+/.test(refText)) return null;
  for (const [abbr, fullName] of Object.entries(bibleBookMap)) {
    if (refText.startsWith(abbr)) {
      const rest = refText.substring(abbr.length).trim();
      const m = rest.match(/^(\d+):(\d+)/);
      if (m) return { book: abbr, chapter: parseInt(m[1]), verse: parseInt(m[2]), apiName: fullName, source: 'bible' };
    }
  }
  if (refText.startsWith('D&C')) {
    const m = refText.substring(3).trim().match(/^(\d+):(\d+)/);
    if (m) return { book: 'D&C', chapter: parseInt(m[1]), verse: parseInt(m[2]), apiName: 'D&C', source: 'dc' };
  }
  if (refText.startsWith('Moses')) {
    const m = refText.substring(5).trim().match(/^(\d+):(\d+)/);
    if (m) return { book: 'Moses', chapter: parseInt(m[1]), verse: parseInt(m[2]), apiName: 'Moses', source: 'pogp' };
  }
  if (refText.startsWith('Abr.')) {
    const m = refText.substring(4).trim().match(/^(\d+):(\d+)/);
    if (m) return { book: 'Abr.', chapter: parseInt(m[1]), verse: parseInt(m[2]), apiName: 'Abraham', source: 'pogp' };
  }
  if (/^JS[—\-]H/.test(refText)) {
    const m = refText.match(/(\d+):(\d+)/);
    if (m) return { book: 'JS—H', chapter: parseInt(m[1]), verse: parseInt(m[2]), apiName: 'JS-H', source: 'pogp' };
  }
  if (/^JS[—\-]M/.test(refText)) {
    const m = refText.match(/(\d+):(\d+)/);
    if (m) return { book: 'JS—M', chapter: parseInt(m[1]), verse: parseInt(m[2]), apiName: 'JS-M', source: 'pogp' };
  }
  return null;
}

// Collect refs
console.log('Parsing crossrefs.json...');
const verseRefs = new Map();
for (const [verseKey, entries] of Object.entries(crossrefs)) {
  let lastParsed = null;
  for (const entry of entries) {
    if (!entry.refs) continue;
    for (const r of entry.refs) {
      if (bomAbbrevs.some(a => r.startsWith(a))) { lastParsed = null; continue; }
      const parsed = parseRef(r, lastParsed);
      if (parsed) {
        const key = parsed.apiName + '|' + parsed.chapter + '|' + parsed.verse;
        if (!verseRefs.has(key)) verseRefs.set(key, parsed);
        lastParsed = parsed;
      }
    }
  }
}
console.log('Unique verse references:', verseRefs.size);

// Group Bible refs by chapter
const chapterGroups = new Map();
for (const [key, ref] of verseRefs) {
  if (ref.source === 'bible') {
    const chKey = ref.apiName + ' ' + ref.chapter;
    if (!chapterGroups.has(chKey)) chapterGroups.set(chKey, []);
    chapterGroups.get(chKey).push(ref.verse);
  }
}

// Filter out chapters where we already have all needed verses
const chaptersToFetch = [];
for (const [chKey, verses] of chapterGroups) {
  const parts = chKey.split(' ');
  const chNum = parts.pop();
  const bookName = parts.join(' ');
  const missing = verses.some(v => !existingVerses[bookName + '|' + chNum + '|' + v]);
  if (missing) chaptersToFetch.push({ chKey, bookName, chNum, verses });
}

console.log('Chapters still needing fetch:', chaptersToFetch.length, '/', chapterGroups.size);

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'HebrewBOM-Builder/1.0' } }, (res) => {
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

async function main() {
  const results = { ...existingVerses };
  let fetched = 0, errors = 0, rateLimited = 0;

  console.log('\n=== Fetching Bible chapters (KJV) ===');
  for (let i = 0; i < chaptersToFetch.length; i++) {
    const { chKey, bookName, chNum } = chaptersToFetch[i];
    const url = `https://bible-api.com/${bookName.replace(/ /g, '+')}+${chNum}?translation=kjv`;

    try {
      const resp = await fetchUrl(url);
      if (resp.status === 200) {
        const data = JSON.parse(resp.body);
        if (data.verses) {
          for (const v of data.verses) {
            results[bookName + '|' + chNum + '|' + v.verse] = v.text.trim();
          }
          fetched++;
        }
      } else if (resp.status === 429) {
        rateLimited++;
        // Back off significantly on rate limit
        await sleep(5000);
        // Retry once
        const retry = await fetchUrl(url);
        if (retry.status === 200) {
          const data = JSON.parse(retry.body);
          if (data.verses) {
            for (const v of data.verses) {
              results[bookName + '|' + chNum + '|' + v.verse] = v.text.trim();
            }
            fetched++;
          }
        } else {
          errors++;
        }
      } else if (resp.status === 404) {
        // Book/chapter doesn't exist in KJV (e.g., bad reference)
        errors++;
      } else {
        errors++;
      }
    } catch (e) {
      errors++;
    }

    if ((i + 1) % 5 === 0 || i === chaptersToFetch.length - 1) {
      process.stdout.write(`\r  Progress: ${i+1}/${chaptersToFetch.length} (${fetched} ok, ${errors} err, ${rateLimited} rate-limited)`);
    }

    // Slower: 800ms between requests to avoid rate limiting
    await sleep(800);

    // Save periodically (every 50 chapters)
    if ((fetched + errors) % 50 === 0 && fetched > 0) {
      const tempJs = 'window._scriptureVerses = ' + JSON.stringify(results, null, 0) + ';\n';
      fs.writeFileSync(path.join(BASE, 'scripture_verses.js'), tempJs, 'utf8');
      fs.writeFileSync(path.join(BASE, 'scripture_verses.json'), JSON.stringify(results, null, 2), 'utf8');
    }
  }

  console.log(`\n  Bible fetch: ${fetched} chapters ok, ${errors} errors, ${rateLimited} rate-limited`);
  console.log('  Total verses:', Object.keys(results).length);

  // Save final results
  const jsContent = 'window._scriptureVerses = ' + JSON.stringify(results, null, 0) + ';\n';
  fs.writeFileSync(path.join(BASE, 'scripture_verses.js'), jsContent, 'utf8');
  fs.writeFileSync(path.join(BASE, 'scripture_verses.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved scripture_verses.js (' + (jsContent.length / 1024).toFixed(1) + ' KB)');
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
