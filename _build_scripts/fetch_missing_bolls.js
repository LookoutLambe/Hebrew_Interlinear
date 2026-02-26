// Fetch missing Bible verses from bolls.life API (alternative to bible-api.com which is blocking us)
const fs = require('fs');
const path = require('path');
const https = require('https');
const BASE = path.resolve(__dirname, '..');

// Load existing data
const svPath = path.join(BASE, 'scripture_verses.json');
const sv = JSON.parse(fs.readFileSync(svPath, 'utf8'));
console.log('Loaded existing cache:', Object.keys(sv).length, 'verses');

// bolls.life book ID mapping (KJV standard ordering)
const bookToId = {
  'Genesis': 1, 'Exodus': 2, 'Leviticus': 3, 'Numbers': 4, 'Deuteronomy': 5,
  'Joshua': 6, 'Judges': 7, 'Ruth': 8, '1 Samuel': 9, '2 Samuel': 10,
  '1 Kings': 11, '2 Kings': 12, '1 Chronicles': 13, '2 Chronicles': 14,
  'Ezra': 15, 'Nehemiah': 16, 'Esther': 17, 'Job': 18, 'Psalms': 19,
  'Proverbs': 20, 'Ecclesiastes': 21, 'Song of Solomon': 22,
  'Isaiah': 23, 'Jeremiah': 24, 'Lamentations': 25, 'Ezekiel': 26,
  'Daniel': 27, 'Hosea': 28, 'Joel': 29, 'Amos': 30, 'Obadiah': 31,
  'Jonah': 32, 'Micah': 33, 'Nahum': 34, 'Habakkuk': 35, 'Zephaniah': 36,
  'Haggai': 37, 'Zechariah': 38, 'Malachi': 39,
  'Matthew': 40, 'Mark': 41, 'Luke': 42, 'John': 43, 'Acts': 44,
  'Romans': 45, '1 Corinthians': 46, '2 Corinthians': 47, 'Galatians': 48,
  'Ephesians': 49, 'Philippians': 50, 'Colossians': 51,
  '1 Thessalonians': 52, '2 Thessalonians': 53, '1 Timothy': 54, '2 Timothy': 55,
  'Titus': 56, 'Philemon': 57, 'Hebrews': 58, 'James': 59,
  '1 Peter': 60, '2 Peter': 61, '1 John': 62, '2 John': 63, '3 John': 64,
  'Jude': 65, 'Revelation': 66
};

// Parse crossrefs.json to find all needed Bible verse references
const cr = JSON.parse(fs.readFileSync(path.join(BASE, 'crossrefs.json'), 'utf8'));
const bm = {
  'Gen.':'Genesis','Ex.':'Exodus','Lev.':'Leviticus','Num.':'Numbers',
  'Deut.':'Deuteronomy','Josh.':'Joshua','Judg.':'Judges','Ruth':'Ruth',
  '1 Sam.':'1 Samuel','2 Sam.':'2 Samuel','1 Kgs.':'1 Kings','2 Kgs.':'2 Kings',
  '1 Chr.':'1 Chronicles','2 Chr.':'2 Chronicles','Ezra':'Ezra','Neh.':'Nehemiah',
  'Esth.':'Esther','Job':'Job','Ps.':'Psalms','Prov.':'Proverbs',
  'Eccl.':'Ecclesiastes','Isa.':'Isaiah','Jer.':'Jeremiah',
  'Lam.':'Lamentations','Ezek.':'Ezekiel','Dan.':'Daniel','Hosea':'Hosea',
  'Joel':'Joel','Amos':'Amos','Obad.':'Obadiah','Jonah':'Jonah',
  'Micah':'Micah','Nahum':'Nahum','Hab.':'Habakkuk','Zeph.':'Zephaniah',
  'Hag.':'Haggai','Zech.':'Zechariah','Mal.':'Malachi',
  'Matt.':'Matthew','Mark':'Mark','Luke':'Luke','John':'John',
  'Acts':'Acts','Rom.':'Romans','1 Cor.':'1 Corinthians','2 Cor.':'2 Corinthians',
  'Gal.':'Galatians','Eph.':'Ephesians','Philip.':'Philippians','Col.':'Colossians',
  '1 Thes.':'1 Thessalonians','2 Thes.':'2 Thessalonians',
  '1 Tim.':'1 Timothy','2 Tim.':'2 Timothy','Titus':'Titus','Philem.':'Philemon',
  'Heb.':'Hebrews','James':'James','1 Pet.':'1 Peter','2 Pet.':'2 Peter',
  '1 Jn.':'1 John','2 Jn.':'2 John','3 Jn.':'3 John','Jude':'Jude','Rev.':'Revelation'
};
const bomAbbrevs = ['1 Ne.','2 Ne.','3 Ne.','4 Ne.','Jacob','Enos','Jarom','Omni','W of M','Mosiah','Alma','Hel.','Morm.','Ether','Moro.'];

// Collect all needed chapter references (with continuation ref logic)
const neededChapters = new Set(); // "BookName|chapter"
for (const [key, entries] of Object.entries(cr)) {
  for (const e of entries) {
    if (!e.refs) continue;
    let lastPrefix = '';
    for (let r of e.refs) {
      r = r.replace(/\u00a0/g, ' '); // Normalize non-breaking spaces
      let fullRef = r;
      if (/^\d/.test(r) && lastPrefix) {
        fullRef = lastPrefix + ' ' + r;
      } else {
        let found = false;
        for (const a of bomAbbrevs) {
          if (r.indexOf(a) === 0) { lastPrefix = a; found = true; break; }
        }
        if (!found) {
          for (const ab of Object.keys(bm)) {
            if (r.indexOf(ab) === 0) { lastPrefix = ab; found = true; break; }
          }
        }
      }
      if (bomAbbrevs.some(a => fullRef.indexOf(a) === 0)) continue;
      if (/^TG |^GS |^BD |^IE /.test(fullRef)) continue;
      for (const [ab, full] of Object.entries(bm)) {
        if (fullRef.indexOf(ab) === 0) {
          const rest = fullRef.substring(ab.length).trim();
          const m = rest.match(/^(\d+):(\d+)/);
          if (m) {
            const vkey = full + '|' + m[1] + '|' + m[2];
            if (!sv[vkey]) {
              neededChapters.add(full + '|' + m[1]);
            }
          }
        }
      }
    }
  }
}

// Filter to only valid chapters (reasonable chapter numbers)
const maxChapters = {
  'Genesis':50,'Exodus':40,'Leviticus':27,'Numbers':36,'Deuteronomy':34,
  'Joshua':24,'Judges':21,'Ruth':4,'1 Samuel':31,'2 Samuel':24,
  '1 Kings':22,'2 Kings':25,'1 Chronicles':29,'2 Chronicles':36,
  'Ezra':10,'Nehemiah':13,'Esther':10,'Job':42,'Psalms':150,
  'Proverbs':31,'Ecclesiastes':12,'Song of Solomon':8,
  'Isaiah':66,'Jeremiah':52,'Lamentations':5,'Ezekiel':48,
  'Daniel':12,'Hosea':14,'Joel':3,'Amos':9,'Obadiah':1,
  'Jonah':4,'Micah':7,'Nahum':3,'Habakkuk':3,'Zephaniah':3,
  'Haggai':2,'Zechariah':14,'Malachi':4,
  'Matthew':28,'Mark':16,'Luke':24,'John':21,'Acts':28,
  'Romans':16,'1 Corinthians':16,'2 Corinthians':13,'Galatians':6,
  'Ephesians':6,'Philippians':4,'Colossians':4,
  '1 Thessalonians':5,'2 Thessalonians':3,'1 Timothy':6,'2 Timothy':4,
  'Titus':3,'Philemon':1,'Hebrews':13,'James':5,
  '1 Peter':5,'2 Peter':3,'1 John':5,'2 John':1,'3 John':1,
  'Jude':1,'Revelation':22
};

const validChapters = [...neededChapters].filter(ch => {
  const [book, num] = ch.split('|');
  const max = maxChapters[book];
  return max && parseInt(num) <= max;
});

console.log('Chapters to fetch:', validChapters.length);
validChapters.forEach(ch => console.log('  ' + ch));

// Fetch function
function fetchChapter(bookName, chapter) {
  return new Promise((resolve, reject) => {
    const bookId = bookToId[bookName];
    if (!bookId) { reject(new Error('Unknown book: ' + bookName)); return; }
    const url = `https://bolls.life/get-chapter/KJV/${bookId}/${chapter}/`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const verses = JSON.parse(data);
            const result = {};
            for (const v of verses) {
              // Strip Strong's number tags <S>1234</S>
              const text = v.text.replace(/<S>\d+<\/S>/g, '').replace(/\s+/g, ' ').trim();
              result[bookName + '|' + chapter + '|' + v.verse] = text;
            }
            resolve(result);
          } catch (e) {
            reject(new Error('Parse error: ' + e.message));
          }
        } else if (res.statusCode === 429) {
          reject(new Error('RATE_LIMITED'));
        } else {
          reject(new Error('HTTP ' + res.statusCode));
        }
      });
    }).on('error', reject);
  });
}

// Sequential fetch with delay
async function fetchAll() {
  let ok = 0, err = 0, added = 0;
  for (let i = 0; i < validChapters.length; i++) {
    const [book, ch] = validChapters[i].split('|');
    try {
      const verses = await fetchChapter(book, parseInt(ch));
      const count = Object.keys(verses).length;
      Object.assign(sv, verses);
      ok++;
      added += count;
      process.stdout.write(`\r  ${i+1}/${validChapters.length}: ${book} ${ch} → ${count} verses (${ok} ok, ${err} err)`);
    } catch (e) {
      err++;
      console.log(`\n  ERROR: ${book} ${ch}: ${e.message}`);
      if (e.message === 'RATE_LIMITED') {
        console.log('  Waiting 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
        i--; // retry
        continue;
      }
    }
    // Delay between requests
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\n\nFetch complete: ${ok} chapters ok, ${err} errors, ${added} new verses`);
  console.log('Total verses:', Object.keys(sv).length);

  // Save
  fs.writeFileSync(svPath, JSON.stringify(sv, null, 2));
  console.log('Saved scripture_verses.json');

  // Also generate scripture_verses.js
  const jsContent = 'window._scriptureVerses = ' + JSON.stringify(sv) + ';\n';
  fs.writeFileSync(path.join(BASE, 'scripture_verses.js'), jsContent);
  console.log('Saved scripture_verses.js (' + (jsContent.length / 1024).toFixed(1) + ' KB)');
}

fetchAll().catch(e => console.error('Fatal:', e));
