const path = require('path');
const BASE = path.resolve(__dirname, '..');
const cr = require(path.join(BASE, 'crossrefs.json'));

const entry = cr['1 Nephi|1|4'];
for (const e of entry) {
  if (e.text !== 'Zedekiah') continue;
  for (const r of e.refs) {
    // Show character codes for each ref
    const codes = [];
    for (let i = 0; i < Math.min(r.length, 20); i++) {
      codes.push(r.charCodeAt(i).toString(16));
    }
    console.log(JSON.stringify(r), 'codes:', codes.join(' '));

    // Check specific matches
    if (r.indexOf('2 Kgs.') === 0) console.log('  MATCHES "2 Kgs."');
    if (r.indexOf('2\u00a0Kgs.') === 0) console.log('  MATCHES "2\\u00a0Kgs." (nbsp)');
    if (r.startsWith('2')) console.log('  STARTS WITH 2');
  }
}
