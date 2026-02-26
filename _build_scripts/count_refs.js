const d = require('C:/Users/chris/Desktop/Hebrew BOM/crossrefs.json');
const bomAbbrevs = ['1 Ne.','2 Ne.','3 Ne.','4 Ne.','Jacob','Enos','Jarom','Omni','W of M','Mosiah','Alma','Hel.','Morm.','Ether','Moro.'];

let scriptRefs = new Set();
for (const arr of Object.values(d)) {
  arr.forEach(entry => {
    if (entry.refs) entry.refs.forEach(r => {
      if (/\d+:\d+/.test(r)) {
        const isBom = bomAbbrevs.some(a => r.startsWith(a));
        if (!isBom) {
          scriptRefs.add(r);
        }
      }
    });
  });
}
console.log('Unique non-BOM scripture refs with ch:v:', scriptRefs.size);
const arr = [...scriptRefs].slice(0, 30);
arr.forEach(r => console.log('  ' + r));
