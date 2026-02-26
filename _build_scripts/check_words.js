const html = require('fs').readFileSync('BOM.html', 'utf8');

function checkWord(heb, label) {
  const re = new RegExp('\\["' + heb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '","([^"]*)"\\]', 'g');
  const map = new Map();
  let m;
  while ((m = re.exec(html)) !== null) {
    map.set(m[1], (map.get(m[1]) || 0) + 1);
  }
  console.log(`=== ${label} (${heb}) ===`);
  for (const [g, c] of [...map.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${c}x "${g}"`);
  }
  console.log('');
}

checkWord('בְּקֶרֶב', 'among');
checkWord('כִּלָּה', 'killah - finished/completed');
checkWord('כָּלָה', 'kalah - finished/completed');
checkWord('כִלָּה', 'killah variant');

// Also check "among-all" anywhere
console.log('=== any word glossed "among-all" ===');
const re = /\["([^"]+)","among-all"\]/g;
let m;
while ((m = re.exec(html)) !== null) {
  console.log(`  ${m[1]} → "among-all"`);
}
