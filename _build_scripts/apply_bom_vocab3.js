// Third pass: catch all remaining congregation→church, charity/covenant-love→mercy,
// went-down→descended, teaching→doctrine, and remaining went-out→departed forms
const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');

const swaps = [
  // ── CONGREGATION → CHURCH (עֵדָה / קְהִלָּה forms) ──
  ['עֲדַת', 'congregation-of', 'church-of', 'BOM: "church of"'],
  ['הָעֵדָה', 'the-congregation', 'the-church', 'BOM: "the church"'],
  ['עֵדָה', 'congregation', 'church', 'BOM: "church"'],
  ['לַעֲדַת', 'to-congregation-of', 'to-church-of', 'BOM: "to church of"'],
  ['הָעֵדוֹת', 'the-congregations', 'the-churches', 'BOM: "the churches"'],
  ['מֵהָעֵדָה', 'from-the-congregation', 'from-the-church', 'BOM: "from the church"'],
  ['אֶת־עֲדַת', 'ACC-congregation-of', 'ACC-church-of', 'BOM: "church of"'],
  ['מֵעֲדָתְךָ', 'from-congregation-of-your', 'from-church-of-your', 'BOM: "from church"'],
  ['אֶת־קְהִלַּת', 'ACC-congregation-of', 'ACC-church-of', 'BOM: "church of"'],
  ['לָעֵדָה', 'to-the-congregation', 'to-the-church', 'BOM: "to the church"'],
  ['אֶל־הָעֵדָה', 'unto-the-congregation', 'unto-the-church', 'BOM: "unto the church"'],
  ['קְהִלָּתוֹ', 'His-congregation', 'His-church', 'BOM: "his church"'],
  ['קְהִלָּתוֹ', 'his-congregation', 'his-church', 'BOM: "his church"'],
  ['עַל־עֲדַת', 'upon-congregation-of', 'upon-church-of', 'BOM: "upon church of"'],
  ['קְהִלָּתוֹ׃', 'His-congregation', 'His-church', 'BOM: "his church"'],
  ['וּבִקְהִלָּתֵנוּ', 'and-in-congregation-of-our/-us', 'and-in-church-of-our/-us', 'BOM: "and in our church"'],
  ['עֲדָתֵנוּ', 'congregation-of-our/-us', 'church-of-our/-us', 'BOM: "our church"'],
  ['עִם־קְהִלַּת', 'with-congregation-of', 'with-church-of', 'BOM: "with church of"'],
  ['הַקְּהִלּוֹת', 'the-congregations', 'the-churches', 'BOM: "the churches"'],
  ['קְהִלּוֹתֵיהֶם', 'their-congregations', 'their-churches', 'BOM: "their churches"'],
  ['וּקְהִלּוֹתֵיכֶם', 'and-your-congregations', 'and-your-churches', 'BOM: "and your churches"'],
  ['קְהִלּוֹתֵיכֶם', 'your-congregations', 'your-churches', 'BOM: "your churches"'],

  // ── CHARITY/COVENANT-LOVE → MERCY (remaining חֶסֶד forms) ──
  ['כְּחֶסֶד', 'as-charity/covenant-love', 'as-mercy', 'BOM: "as mercy"'],
  ['חֶסֶד׃', 'charity/covenant-love', 'mercy', 'BOM: "mercy"'],
  ['רַב־חֶסֶד', 'much-charity/covenant-love', 'much-mercy', 'BOM: "much mercy"'],
  ['מֵחֶסֶד', 'from-charity/covenant-love', 'from-mercy', 'BOM: "from mercy"'],
  ['לְחֶסֶד', 'to-charity/covenant-love', 'to-mercy', 'BOM: "to mercy"'],

  // ── REMAINING WENT-DOWN → DESCENDED ──
  ['וַיֵּרֶד', 'and-he-went-down', 'and-he-descended', 'BOM: "and he descended"'],
  ['וַנֵּרֶד', 'and-we-went-down', 'and-we-descended', 'BOM: "and we descended"'],
  ['וַנֵּרֵד', 'and-went-down', 'and-descended', 'BOM: "and descended"'],
  ['וַנֵּרֶד', 'and-went-down-we', 'and-descended-we', 'BOM: "and we descended"'],
  ['וַיֵּרְדוּ', 'and-they-went-down', 'and-they-descended', 'BOM: "and they descended"'],

  // ── REMAINING WENT-OUT → DEPARTED ──
  ['יֹצְאִים', 'went-out', 'departed', 'BOM: "departed"'],
  ['וַנֵּצֵא', 'and-went-out', 'and-departed', 'BOM: "and departed"'],
  ['וָאֵצֵא', 'and-I-went-out', 'and-I-departed', 'BOM: "and I departed"'],
  ['יָצָאתִי', 'I-went-out', 'I-departed', 'BOM: "I departed"'],

  // ── REMAINING WENT-UP → ASCENDED ──
  ['וָאַעַל', 'and-went-up-I', 'and-ascended-I', 'BOM: "and I ascended"'],
  ['וָאַעַל', 'and-went-up', 'and-ascended', 'BOM: "and ascended"'],
  ['כַּעֲלוֹתֵנוּ', 'when-we-went-up', 'when-we-ascended', 'BOM: "when we ascended"'],
  ['וַנַּעַל', 'and-we-went-up', 'and-we-ascended', 'BOM: "and we ascended"'],
  ['בַּעֲלוֹתֵנוּ', 'as-we-went-up', 'as-we-ascended', 'BOM: "as we ascended"'],
  ['וַנַּעֲלֶה', 'and-we-went-up', 'and-we-ascended', 'BOM: "and we ascended"'],
  ['בַּעֲלוֹתָם', 'when-they-went-up', 'when-they-ascended', 'BOM: "when they ascended"'],
  ['אַעֲלֶה', 'I-will-went-up', 'I-will-ascend', 'BOM: "I will ascend"'],
  ['וַיַּעֲלֵם', 'and-he-went-up-their', 'and-he-ascended-their', 'BOM: "and he ascended"'],
  ['תַעֲלֶה', 'you-will-went-up', 'you-will-ascend', 'BOM: "you will ascend"'],
  ['יַעַלוּ', 'he-will-they-went-up', 'they-will-ascend', 'BOM: "they will ascend"'],
  ['וְתַעֲלוּ', 'and-she-they-went-up', 'and-they-ascend', 'BOM: "and they ascend"'],

  // ── TEACHING → DOCTRINE (remaining forms) ──
  ['תּוֹרָתוֹ', 'His-teaching', 'His-doctrine', 'BOM: "his doctrine"'],
  ['וְתוֹרָתָם', 'and-their-teachings', 'and-their-doctrines', 'BOM: "and their doctrines"'],

  // ── GO-OUT → DEPART (future/imperative forms) ──
  ['וְיֵצֵא', 'and-go-out', 'and-depart', 'BOM: "and depart"'],
  ['וְיָצֵא', 'and-may-go-out', 'and-may-depart', 'BOM: "and may depart"'],
  ['יֵצְאוּ', 'they-shall-go-out', 'they-shall-depart', 'BOM: "they shall depart"'],
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

console.log('=== THIRD PASS BOM VOCAB FIXES ===\n');
results.sort((a, b) => b.count - a.count);
for (const { heb, oldGloss, newGloss, count, desc } of results) {
  console.log(`${count}x  ${heb}: "${oldGloss}" → "${newGloss}"  (${desc})`);
}
console.log(`\nTotal additional fixes: ${totalApplied}`);

// Final verification counts
console.log('\n=== FINAL VERIFICATION ===');
const checks = [
  ['congregation', 'congregation'],
  ['charity/covenant-love', 'charity\\/covenant-love'],
  ['went-out', 'went-out'],
  ['went-up', 'went-up'],
  ['went-down', 'went-down'],
  ['messenger', 'messenger'],
  ['immerse', 'immers'],
];
for (const [label, pat] of checks) {
  const re = new RegExp('\\["[^"]+","[^"]*' + pat + '[^"]*"\\]', 'g');
  const m = html.match(re);
  console.log(`  "${label}" remaining: ${m ? m.length : 0}`);
}

fs.writeFileSync('BOM.html', html);
console.log('\nBOM.html updated!');
