const path = require('path');
const BASE = path.resolve(__dirname, '..');
const cr = require(path.join(BASE, 'crossrefs.json'));
const sv = require(path.join(BASE, 'scripture_verses.json'));

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

const missing = new Set();
for (const [key, entries] of Object.entries(cr)) {
  for (const e of entries) {
    if (!e.refs) continue;
    let lastPrefix = '';
    for (const r of e.refs) {
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
      for (const [ab, full] of Object.entries(bm)) {
        if (fullRef.indexOf(ab) === 0) {
          const rest = fullRef.substring(ab.length).trim();
          const m = rest.match(/^(\d+):(\d+)/);
          if (m) {
            const vkey = full + '|' + m[1] + '|' + m[2];
            if (!sv[vkey]) missing.add(vkey);
          }
        }
      }
    }
  }
}

const byBook = {};
for (const k of missing) {
  const b = k.split('|')[0];
  byBook[b] = (byBook[b] || 0) + 1;
}
console.log('Missing verses:', missing.size);
for (const [b, c] of Object.entries(byBook).sort((a, b) => b[1] - a[1])) {
  console.log('  ' + b + ': ' + c);
}
const examples = [...missing].slice(0, 30);
console.log('\nExamples:');
examples.forEach(k => console.log('  ' + k));
