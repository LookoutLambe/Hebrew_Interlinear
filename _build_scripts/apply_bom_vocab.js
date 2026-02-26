// Apply BOM-specific vocabulary fixes to Hebrew interlinear glosses
// Strategy: Target specific Hebrew→gloss pairs and replace with BOM vocabulary
// Only change glosses where the Hebrew word clearly maps to the BOM term

const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');

// === TARGETED VOCABULARY SWAPS ===
// Each entry: [hebrewWord, currentGloss, newGloss, description]
// Only exact matches — no substring games
const swaps = [
  // ── REIGN vs RULE (BOM says "reign of the judges", "did reign", etc.) ──
  ['לִמְשֹׁל', 'to-rule', 'to-reign', 'BOM: "reign of the judges"'],
  ['מָשַׁל', 'ruled', 'reigned', 'BOM: "reigned in his stead"'],
  ['מָשַׁל', 'rule', 'reign', 'BOM: "reign"'],
  ['מָשְׁלוּ', 'ruled', 'reigned', 'BOM: "reigned"'],
  ['מָשְׁלוּ', 'they-ruled', 'they-reigned', 'BOM: "they reigned"'],
  ['מוֹשֵׁל', 'ruling', 'reigning', 'BOM: "reigning"'],
  ['מוֹשֵׁל', 'ruler', 'ruler', 'keep - BOM uses ruler too'],
  ['מֶמְשָׁלָה', 'rule', 'reign', 'BOM: "reign"'],
  ['מֶמְשֶׁלֶת', 'the-rule-of', 'the-reign-of', 'BOM: "the reign of"'],
  ['הַמֶּמְשָׁלָה', 'the-rule', 'the-reign', 'BOM: "the reign"'],
  ['מֶמְשַׁלְתּוֹ', 'his-rule', 'his-reign', 'BOM: "his reign"'],

  // ── ANGEL vs MESSENGER (BOM: "angel of the Lord") ──
  ['הַמַּלְאָךְ', 'the-messenger', 'the-angel', 'BOM: "the angel"'],
  ['הַמַּלְאָךְ', 'the-same-messenger', 'the-same-angel', 'BOM: "the angel"'],
  ['הַמַּלְאָךְ', 'by-the-mouth-of-the-angel', 'by-the-mouth-of-the-angel', 'keep'],
  ['הַמַּלְאָךְ', 'by-the-angel', 'by-the-angel', 'keep'],
  ['מַלְאָכִים', 'messengers', 'angels', 'BOM: "angels"'],
  ['מַלְאָכִים', 'the-messengers', 'the-angels', 'BOM: "the angels"'],
  ['מַלְאֲכֵי', 'messengers-of', 'angels-of', 'BOM: "angels of"'],
  ['מַלְאַךְ', 'a-messenger', 'an-angel', 'BOM: "an angel"'],
  ['מַלְאַךְ', 'messenger', 'angel', 'BOM: "angel"'],

  // ── CHURCH vs ASSEMBLY/CONGREGATION ──
  ['קְהִלּוֹת', 'congregations', 'churches', 'BOM: "churches"'],
  ['הַקְּהִלָּה', 'the-congregation', 'the-church', 'BOM: "the church"'],
  ['הַקְּהִלָּה', 'the-assembly', 'the-church', 'BOM: "the church"'],
  ['קְהִלָּה', 'a-congregation', 'a-church', 'BOM: "a church"'],
  ['קְהִלָּה', 'congregation', 'church', 'BOM: "church"'],
  ['קְהִלָּה', 'assembly', 'church', 'BOM: "church"'],
  ['קְהִלַּת', 'the-congregation-of', 'the-church-of', 'BOM: "the church of"'],
  ['קְהִלַּת', 'the-assembly-of', 'the-church-of', 'BOM: "the church of"'],
  ['קְהִלַּת', 'congregation-of', 'church-of', 'BOM: "church of"'],

  // ── BAPTIZE vs IMMERSE ──
  ['טָבַל', 'immersed', 'baptized', 'BOM: "baptized"'],
  ['טָבַל', 'immerse', 'baptize', 'BOM: "baptize"'],
  ['טָבַל', 'to-immerse', 'to-baptize', 'BOM: "to baptize"'],
  ['טְבִילָה', 'immersion', 'baptism', 'BOM: "baptism"'],
  ['טְבִילַת', 'immersion-of', 'baptism-of', 'BOM: "baptism of"'],
  ['הַטְּבִילָה', 'the-immersion', 'the-baptism', 'BOM: "the baptism"'],
  ['נִטְבַּל', 'was-immersed', 'was-baptized', 'BOM: "was baptized"'],
  ['נִטְבְּלוּ', 'were-immersed', 'were-baptized', 'BOM: "were baptized"'],
  ['לִטְבֹּל', 'to-immerse', 'to-baptize', 'BOM: "to baptize"'],
  ['הִטְבִּיל', 'immersed', 'baptized', 'BOM: "baptized"'],
  ['הַטּוֹבֵל', 'the-immerser', 'the-Baptist', 'keep or swap?'],

  // ── COVENANT vs AGREEMENT ──
  ['בְּרִית', 'an-agreement', 'a-covenant', 'BOM: "a covenant"'],
  ['בְּרִית', 'agreement', 'covenant', 'BOM: "covenant"'],
  ['הַבְּרִית', 'the-agreement', 'the-covenant', 'BOM: "the covenant"'],

  // ── COMMANDMENT vs COMMAND ──
  ['מִצְוָה', 'a-command', 'a-commandment', 'BOM: "a commandment"'],
  ['מִצְוָה', 'command', 'commandment', 'BOM: "commandment"'],
  ['מִצְוֹת', 'commands', 'commandments', 'BOM: "commandments"'],
  ['מִצְוֹת', 'the-commands-of', 'the-commandments-of', 'BOM: "the commandments of"'],
  ['מִצְוֹתָיו', 'his-commands', 'his-commandments', 'BOM: "his commandments"'],
  ['מִצְוֹתַי', 'my-commands', 'my-commandments', 'BOM: "my commandments"'],

  // ── PROPHECY/PROPHESY vs PREDICTION ──
  ['נְבוּאָה', 'a-prediction', 'a-prophecy', 'BOM: "a prophecy"'],
  ['נְבוּאָה', 'prediction', 'prophecy', 'BOM: "prophecy"'],
  ['נְבוּאוֹת', 'predictions', 'prophecies', 'BOM: "prophecies"'],
  ['נִבָּא', 'predicted', 'prophesied', 'BOM: "prophesied"'],
  ['הִתְנַבֵּא', 'predicted', 'prophesied', 'BOM: "prophesied"'],
  ['לְהִתְנַבֵּא', 'to-predict', 'to-prophesy', 'BOM: "to prophesy"'],
  ['הִתְנַבְּאוּ', 'predicted', 'prophesied', 'BOM: "prophesied"'],

  // ── MERCY / CHARITY for חסד ──
  // חסד is complex - BOM uses mercy, charity, goodness, loving-kindness
  // The current "charity/covenant-love" is an unusual gloss - let's use "mercy" as BOM default
  ['חֶסֶד', 'charity/covenant-love', 'mercy', 'BOM: "mercy" is most common for חסד'],
  ['חֶסֶד', 'covenant-love-of', 'mercy-of', 'BOM: "mercy of"'],
  ['חֶסֶד', 'the-covenant-love-of', 'the-mercy-of', 'BOM: "the mercy of"'],
  ['וְחַסְדּוֹ', 'and-His-lovingkindness', 'and-His-mercy', 'BOM: "and his mercy"'],

  // ── DEPARTED/DEPART vs WENT OUT ──
  ['יָצָא', 'went-out', 'departed', 'BOM: "departed"'],
  ['יָצָא', 'he-went-out', 'he-departed', 'BOM: "he departed"'],
  ['יָצְאוּ', 'went-out', 'departed', 'BOM: "departed"'],
  ['יָצְאוּ', 'they-went-out', 'they-departed', 'BOM: "they departed"'],
  ['וַיֵּצֵא', 'and-went-out', 'and-departed', 'BOM: "and departed"'],
  ['וַיֵּצֵא', 'and-he-went-out', 'and-he-departed', 'BOM: "and he departed"'],
  ['וַיֵּצְאוּ', 'and-went-out', 'and-departed', 'BOM: "and departed"'],
  ['וַיֵּצְאוּ', 'and-they-went-out', 'and-they-departed', 'BOM: "and they departed"'],
  ['לָצֵאת', 'to-go-out', 'to-depart', 'BOM: "to depart"'],
  ['יוֹצֵא', 'going-out', 'departing', 'BOM: "departing"'],

  // ── ASCEND/DESCEND vs GO UP/GO DOWN ──
  ['עָלָה', 'went-up', 'ascended', 'BOM: "ascended"'],
  ['עָלָה', 'he-went-up', 'he-ascended', 'BOM: "he ascended"'],
  ['עָלוּ', 'went-up', 'ascended', 'BOM: "ascended"'],
  ['עָלוּ', 'they-went-up', 'they-ascended', 'BOM: "they ascended"'],
  ['וַיַּעַל', 'and-went-up', 'and-ascended', 'BOM: "and ascended"'],
  ['וַיַּעַל', 'and-he-went-up', 'and-he-ascended', 'BOM: "and he ascended"'],
  ['וַיַּעֲלוּ', 'and-went-up', 'and-ascended', 'BOM: "and ascended"'],
  ['וַיַּעֲלוּ', 'and-they-went-up', 'and-they-ascended', 'BOM: "and they ascended"'],
  ['יָרַד', 'went-down', 'descended', 'BOM: "descended"'],
  ['יָרַד', 'he-went-down', 'he-descended', 'BOM: "he descended"'],
  ['יָרְדוּ', 'went-down', 'descended', 'BOM: "descended"'],
  ['יָרְדוּ', 'they-went-down', 'they-descended', 'BOM: "they descended"'],
  ['וַיֵּרֶד', 'and-went-down', 'and-descended', 'BOM: "and descended"'],
  ['וַיֵּרְדוּ', 'and-went-down', 'and-descended', 'BOM: "and descended"'],
  ['לַעֲלוֹת', 'to-go-up', 'to-ascend', 'BOM: "to ascend"'],
  ['לָרֶדֶת', 'to-go-down', 'to-descend', 'BOM: "to descend"'],

  // ── DOCTRINE vs TEACHING ──
  ['תּוֹרָה', 'teaching', 'doctrine', 'BOM: "doctrine"'],
  ['תּוֹרָה', 'the-teaching', 'the-doctrine', 'BOM: "the doctrine"'],
  ['תּוֹרוֹת', 'teachings', 'doctrines', 'BOM: "doctrines"'],
  ['תּוֹרַת', 'the-teaching-of', 'the-doctrine-of', 'BOM: "the doctrine of"'],
  ['תּוֹרַת', 'teaching-of', 'doctrine-of', 'BOM: "doctrine of"'],

  // ── INIQUITY/WICKEDNESS (BOM uses both but "iniquity" is more characteristic) ──
  // Actually keeping these as-is since BOM uses both transgression and iniquity

  // ── DESTRUCTION vs SLAUGHTER ──
  ['הַשְׁמָדָה', 'the-slaughter', 'the-destruction', 'BOM: "the destruction"'],
  ['הַשְׁמָדָה', 'slaughter', 'destruction', 'BOM: "destruction"'],
  ['שְׁמָדָה', 'slaughter', 'destruction', 'BOM: "destruction"'],
  ['חָרְבָּן', 'destruction', 'destruction', 'keep'],

  // ── CITY (already mostly correct, but check settlement) ──
  ['יִשּׁוּב', 'a-settlement', 'a-city', 'BOM: "a city"'],
  ['יִשּׁוּב', 'settlement', 'city', 'BOM: "city"'],
  ['הַיִּשּׁוּב', 'the-settlement', 'the-city', 'BOM: "the city"'],

  // ── PEOPLE/NATION (BOM predominantly uses "people") ──
  // גּוֹי is specifically "nation" in Hebrew and BOM does use both
  // Keep as-is for now
];

// Apply swaps
let totalApplied = 0;
const results = [];

for (const [heb, oldGloss, newGloss, desc] of swaps) {
  if (oldGloss === newGloss) continue; // skip "keep" entries

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

// Print results
console.log('=== BOM VOCABULARY FIXES APPLIED ===\n');
results.sort((a, b) => b.count - a.count);
for (const { heb, oldGloss, newGloss, count, desc } of results) {
  console.log(`${count}x  ${heb}: "${oldGloss}" → "${newGloss}"  (${desc})`);
}
console.log(`\nTotal fixes applied: ${totalApplied}`);

// Now let's also do a broader scan: find ALL glosses containing "rule/ruled/ruling"
// to see if we missed any forms
console.log('\n=== REMAINING "rule" glosses (should be few/none after fixes) ===');
const ruleCheck = /\["([^"]+)","([^"]*rule[^"]*)"\]/g;
let rm;
const ruleRemaining = new Map();
while ((rm = ruleCheck.exec(html)) !== null) {
  const key = `${rm[1]} → "${rm[2]}"`;
  ruleRemaining.set(key, (ruleRemaining.get(key) || 0) + 1);
}
for (const [k, c] of [...ruleRemaining.entries()].sort((a,b) => b[1] - a[1])) {
  console.log(`  ${c}x ${k}`);
}

// Same for "messenger"
console.log('\n=== REMAINING "messenger" glosses ===');
const msgCheck = /\["([^"]+)","([^"]*messenger[^"]*)"\]/g;
const msgRemaining = new Map();
while ((rm = msgCheck.exec(html)) !== null) {
  const key = `${rm[1]} → "${rm[2]}"`;
  msgRemaining.set(key, (msgRemaining.get(key) || 0) + 1);
}
for (const [k, c] of [...msgRemaining.entries()].sort((a,b) => b[1] - a[1])) {
  console.log(`  ${c}x ${k}`);
}

// Same for "immerse/immersion"
console.log('\n=== REMAINING "immerse/immersion" glosses ===');
const immCheck = /\["([^"]+)","([^"]*immers[^"]*)"\]/g;
const immRemaining = new Map();
while ((rm = immCheck.exec(html)) !== null) {
  const key = `${rm[1]} → "${rm[2]}"`;
  immRemaining.set(key, (immRemaining.get(key) || 0) + 1);
}
for (const [k, c] of [...immRemaining.entries()].sort((a,b) => b[1] - a[1])) {
  console.log(`  ${c}x ${k}`);
}

// Write updated file
fs.writeFileSync('BOM.html', html);
console.log('\nBOM.html updated successfully!');
