const fs = require('fs');
const c = fs.readFileSync('scripture_verses.js', 'utf8');
const books = new Set();
const re = /"([^|"]+)\|/g;
let m;
while ((m = re.exec(c)) !== null) books.add(m[1]);
const sorted = [...books].sort();
console.log('Books in scripture_verses.js (' + sorted.length + '):');
sorted.forEach(b => console.log('  ' + b));

// Also check what references are used in crossrefs.js
const xc = fs.readFileSync('crossrefs.js', 'utf8');
// Find references to D&C, Moses, Abraham, JS-H, A of F
const dcRefs = xc.match(/D&C \d+:\d+/g) || [];
const mosesRefs = xc.match(/Moses \d+:\d+/g) || [];
const abrRefs = xc.match(/Abr\. \d+:\d+/g) || [];
const jshRefs = xc.match(/JS—H \d+:\d+/g) || [];
const aofRefs = xc.match(/A of F \d+:\d+/g) || [];

console.log('\nCross-references to missing books:');
console.log('  D&C refs:', [...new Set(dcRefs)].length, 'unique');
console.log('  Moses refs:', [...new Set(mosesRefs)].length, 'unique');
console.log('  Abraham refs:', [...new Set(abrRefs)].length, 'unique');
console.log('  JS-H refs:', [...new Set(jshRefs)].length, 'unique');
console.log('  A of F refs:', [...new Set(aofRefs)].length, 'unique');

// Show first few of each
console.log('\n  D&C samples:', [...new Set(dcRefs)].slice(0, 10));
console.log('  Moses samples:', [...new Set(mosesRefs)].slice(0, 10));
console.log('  Abraham samples:', [...new Set(abrRefs)].slice(0, 10));
