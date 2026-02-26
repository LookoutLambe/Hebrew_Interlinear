// Fix specific vocabulary issues
const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');

const fixes = [
  // בְּקֶרֶב means "among / in the midst of" — NOT "among-all" (the "all" is from כל)
  ['בְּקֶרֶב', 'among-all', 'among', 'means "among", not "among-all"'],
  ['בְּקֶרֶב', 'to-be-made-among', 'among', 'just "among"'],

  // כִּלָּה (killah) = Pi'el verb "he finished/completed" — NOT "all-of-it"
  // This is confused with כֻּלָּהּ (kullah) = "all of it (fem)"
  ['כִּלָּה', 'all-of-it(f)', 'finished', 'Pi\'el: "he finished/completed"'],
  ['כָּלָה', 'all-of-it(f)', 'finished', 'Qal: "finished"'],
  ['כִלָּה', 'all-of-it(f)', 'finished', 'Pi\'el variant: "finished"'],

  // בְּכָל "among-all" should be "in-all" or "among-all" depending on context
  // Actually בכל = "in all" / "with all" — these 7 cases are borderline
  // Let's leave בכל as-is since "among all" can be valid for it
];

let total = 0;

for (const [heb, oldGloss, newGloss, reason] of fixes) {
  const escapedHeb = heb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedOld = oldGloss.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\["${escapedHeb}","${escapedOld}"\\]`, 'g');
  const matches = html.match(pattern);
  const count = matches ? matches.length : 0;
  if (count > 0) {
    html = html.replace(pattern, `["${heb}","${newGloss}"]`);
    console.log(`${count}x  ${heb}: "${oldGloss}" → "${newGloss}"  (${reason})`);
    total += count;
  }
}

console.log(`\nTotal: ${total} fixes`);
fs.writeFileSync('BOM.html', html);
console.log('BOM.html updated!');
