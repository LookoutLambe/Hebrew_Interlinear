const path = require('path');
const BASE = path.resolve(__dirname, '..');
const cr = require(path.join(BASE, 'crossrefs.json'));
const sv = require(path.join(BASE, 'scripture_verses.json'));

const bm = {
  '2 Kgs.':'2 Kings', '2 Chr.':'2 Chronicles', 'Jer.':'Jeremiah'
};

const entry = cr['1 Nephi|1|4'];
if (!entry) { console.log('No entry'); process.exit(); }
for (const e of entry) {
  if (!e.refs) continue;
  console.log('Entry:', e.text, 'refs:', JSON.stringify(e.refs));
  for (const r of e.refs) {
    for (const [ab, full] of Object.entries(bm)) {
      if (r.indexOf(ab) === 0) {
        const rest = r.substring(ab.length).trim();
        const m = rest.match(/^(\d+):(\d+)/);
        if (m) {
          const vkey = full + '|' + m[1] + '|' + m[2];
          console.log('  Ref:', r, '->', vkey, sv[vkey] ? 'EXISTS' : 'MISSING');
        } else {
          console.log('  Ref:', r, '-> no chapter:verse match in rest:', rest);
        }
      }
    }
  }
}
