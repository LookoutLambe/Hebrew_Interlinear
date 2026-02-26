const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');

// Fix all כִּלָּה variants: 'finished' → 'finished/done' (Schottenstein dual-meaning)
const words = ['כִּלָּה', 'כָּלָה', 'כִלָּה'];
let total = 0;
for (const heb of words) {
  const escaped = heb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pat = new RegExp(`\\["${escaped}","finished"\\]`, 'g');
  const matches = html.match(pat);
  if (matches) {
    html = html.replace(pat, `["${heb}","finished/done"]`);
    console.log(`${matches.length}x  ${heb}: "finished" → "finished/done"`);
    total += matches.length;
  }
}
console.log(`\nTotal: ${total} fixes`);
fs.writeFileSync('BOM.html', html);
console.log('BOM.html updated!');
