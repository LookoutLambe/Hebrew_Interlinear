// Fix כַּאֲשֶׁר to use Schottenstein-style dual gloss "when/as"
// The user wants two or three definitions shown, like real Schottenstein interlinears
const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');

// כַּאֲשֶׁר = "when/as" (temporal conjunction)
// Keep compound forms like "even-as" and "that-when"
const fixes = [
  ['כַּאֲשֶׁר', 'as', 'when/as', 'Schottenstein: dual meaning'],
  ['כַּאֲשֶׁר', 'when', 'when/as', 'Schottenstein: dual meaning'],
  ['כַּאֲשֶׁר', 'as/when', 'when/as', 'standardize order'],
];

let total = 0;
for (const [heb, old, newG, desc] of fixes) {
  const escaped = heb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedOld = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pat = new RegExp(`\\["${escaped}","${escapedOld}"\\]`, 'g');
  const matches = html.match(pat);
  const count = matches ? matches.length : 0;
  if (count > 0) {
    html = html.replace(pat, `["${heb}","${newG}"]`);
    console.log(`${count}x  "${old}" → "${newG}"  (${desc})`);
    total += count;
  }
}

console.log(`\nTotal: ${total} fixes`);
fs.writeFileSync('BOM.html', html);
console.log('BOM.html updated!');
