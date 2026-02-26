// Second pass: catch remaining forms the first pass missed
const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');

const swaps = [
  // Remaining immerse → baptize forms
  ['לְהַטְבִּיל', 'to-immerse/baptize', 'to-baptize', 'BOM: "to baptize"'],
  ['תַטְבִּילוּ', 'you-shall-immerse', 'you-shall-baptize', 'BOM: "ye shall baptize"'],
  ['תַּטְבִּילוּ', 'you-shall-immerse', 'you-shall-baptize', 'BOM: "ye shall baptize"'],
  ['מַטְבִּיל', 'one-who-immerses', 'one-who-baptizes', 'BOM: "baptizes"'],
  ['וְהִטָּבְלוּ', 'and-be-immersed', 'and-be-baptized', 'BOM: "and be baptized"'],
  ['וַיִּטָּבְלוּ', 'and-they-were-immersed', 'and-they-were-baptized', 'BOM: "and they were baptized"'],
  ['בִּטְבִילַת', 'in-immersing-of', 'in-baptism-of', 'BOM: "in baptism of"'],

  // Remaining rule → reign (where context is governance, not "ruler" noun)
  ['וְלִמְשֹׁל', 'and-to-rule', 'and-to-reign', 'BOM: "and to reign"'],
  ['יִמְשֹׁל', 'he-shall-rule', 'he-shall-reign', 'BOM: "he shall reign"'],
  ['יִמָּשֵׁל', 'he-shall-rule', 'he-shall-reign', 'BOM: "he shall reign"'],
  ['מָשְׁלוּ', 'rule', 'reign', 'BOM: "reign"'],
  ['סָבְלוּ', 'to-rule', 'to-reign', 'BOM: "to reign"'], // if this is really rule context
  ['לְהִשָּׁלֵט', 'to-rule', 'to-reign', 'BOM: "to reign"'],
  ['לִשְׁלֹט', 'to-ruled', 'to-reign', 'BOM: "to reign"'],
  ['תִמְשֹׁל', 'she-should-rule', 'she-should-reign', 'BOM: "should reign"'],
  ['יִמְשְׁלוּ־בָם', 'shall-rule-over-them', 'shall-reign-over-them', 'BOM: "shall reign"'],
  ['וְרָדוּ', 'and-they-shall-rule', 'and-they-shall-reign', 'BOM: "and they shall reign"'],
  ['רֹדֶה', 'he-who-ruled', 'he-who-reigned', 'BOM: "reigned"'],

  // Remaining messenger → angel
  ['מַלְאֲכֵי־גוֹי', 'the-messengers-of-the-nation', 'the-angels-of-the-nation', 'BOM: "angels"'],

  // Also check for "assembly" → "church" forms we might have missed
  ['עֲדַת', 'the-assembly-of', 'the-church-of', 'BOM: "the church of"'],
  ['הָעֵדָה', 'the-assembly', 'the-church', 'BOM: "the church"'],

  // "teaching" → "doctrine" for additional forms
  ['תוֹרָה', 'a-teaching', 'a-doctrine', 'BOM: "a doctrine"'],
  ['תוֹרָתוֹ', 'his-teaching', 'his-doctrine', 'BOM: "his doctrine"'],
];

let totalApplied = 0;
const results = [];

for (const [heb, oldGloss, newGloss, desc] of swaps) {
  if (oldGloss === newGloss) continue;

  const escapedHeb = heb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedOld = oldGloss.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\["${escapedHeb}","${escapedOld}"\\]`, 'g');

  const matches = html.match(pattern);
  const count = matches ? matches.length : 0;

  if (count > 0) {
    html = html.replace(pattern, `["${heb}","${newGloss}"]`);
    totalApplied += count;
    results.push({ heb, oldGloss, newGloss, count, desc });
  }
}

console.log('=== SECOND PASS BOM VOCAB FIXES ===\n');
results.sort((a, b) => b.count - a.count);
for (const { heb, oldGloss, newGloss, count, desc } of results) {
  console.log(`${count}x  ${heb}: "${oldGloss}" → "${newGloss}"  (${desc})`);
}
console.log(`\nTotal additional fixes: ${totalApplied}`);

// Verify: check remaining non-BOM terms
console.log('\n=== FINAL CHECK: remaining "immerse" ===');
const immCheck = /\["([^"]+)","([^"]*immers[^"]*)"\]/g;
let rm;
while ((rm = immCheck.exec(html)) !== null) {
  console.log(`  ${rm[1]} → "${rm[2]}"`);
}

console.log('\n=== FINAL CHECK: remaining "messenger" ===');
const msgCheck = /\["([^"]+)","([^"]*messenger[^"]*)"\]/g;
while ((rm = msgCheck.exec(html)) !== null) {
  console.log(`  ${rm[1]} → "${rm[2]}"`);
}

fs.writeFileSync('BOM.html', html);
console.log('\nBOM.html updated successfully!');
