const path = require('path');
const BASE = path.resolve(__dirname, '..');
const d = require(path.join(BASE, 'scripture_verses.json'));
const cr = require(path.join(BASE, 'crossrefs.json'));
const bomAbbrevs = ['1 Ne.','2 Ne.','3 Ne.','4 Ne.','Jacob','Enos','Jarom','Omni','W of M','Mosiah','Alma','Hel.','Morm.','Ether','Moro.'];
const bm = {
  'Gen.':'Genesis','Ex.':'Exodus','Lev.':'Leviticus','Num.':'Numbers',
  'Deut.':'Deuteronomy','Josh.':'Joshua','Judg.':'Judges','Ruth':'Ruth',
  '1 Sam.':'1 Samuel','2 Sam.':'2 Samuel','1 Kgs.':'1 Kings','2 Kgs.':'2 Kings',
  '1 Chr.':'1 Chronicles','2 Chr.':'2 Chronicles','Ezra':'Ezra','Neh.':'Nehemiah',
  'Esth.':'Esther','Job':'Job','Ps.':'Psalms','Prov.':'Proverbs',
  'Eccl.':'Ecclesiastes','Song':'Song of Solomon','Isa.':'Isaiah','Jer.':'Jeremiah',
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

const missing = new Set();
for (const arr of Object.values(cr)) {
  for (const e of arr) {
    if (!e.refs) continue;
    for (const r of e.refs) {
      if (bomAbbrevs.some(a => r.startsWith(a))) continue;
      for (const [ab, full] of Object.entries(bm)) {
        if (r.startsWith(ab)) {
          const rest = r.substring(ab.length).trim();
          const m = rest.match(/^(\d+):(\d+)/);
          if (m && !d[full + '|' + m[1] + '|' + m[2]]) {
            missing.add(full + '|' + m[1] + '|' + m[2]);
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
// Show some examples
const examples = [...missing].slice(0, 15);
console.log('\nExample missing keys:');
examples.forEach(k => console.log('  ' + k));
