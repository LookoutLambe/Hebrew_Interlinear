const html = require('fs').readFileSync('BOM.html', 'utf8');
const re = /\["כַּאֲשֶׁר","([^"]*)"\]/g;
const map = new Map();
let m;
while ((m = re.exec(html)) !== null) {
  map.set(m[1], (map.get(m[1]) || 0) + 1);
}
console.log('כַּאֲשֶׁר glosses:');
for (const [g, c] of [...map.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${c}x "${g}"`);
}
