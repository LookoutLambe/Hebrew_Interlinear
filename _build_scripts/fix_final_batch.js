// Final batch fix for remaining bad transliterations
const fs = require('fs');
let bom = fs.readFileSync('BOM.html', 'utf8');
const dict = JSON.parse(fs.readFileSync('gloss_dictionary.json', 'utf8'));
function stripNiqqud(s) { return s.replace(/[\u0591-\u05C7]/g, ''); }

const strippedDict = {};
for (const [h, e] of Object.entries(dict)) {
  const s = stripNiqqud(h);
  if (!strippedDict[s]) strippedDict[s] = e;
}

// Manual fixes for remaining top bad transliterations
const fixes = {
  // From the list above
  'אֶת־שׁוּלֶה': '[ACC]-Shule',
  'הִתְפַּשְּׁטוּ': 'they-spread-out',
  'הָאַרְסִיִּים': 'the-poisonous-ones',
  'מֻפְלֶגֶת': 'exceeding',
  'אָחַח': 'alas',
  'הַקַּדְמוֹנָה': 'the-ancient',
  'אֶת־שָׁרֶד': '[ACC]-Shared',
  'כָּמְנוֹר': 'Comnor',
  'נִתְקַיְּמוּ': 'they-were-fulfilled',
  'לָחֲצוּ': 'they-oppressed',
  'הֶבְדֵּל': 'the-separation',
  'נֶעֶנְשׁוּ': 'they-were-punished',
  'לְמַכּוֹת': 'to-smite',
  'וַיִּתְחַמְּשׁוּ': 'and-they-armed-themselves',
  'לִנְטוֹת': 'to-incline',
  'וּלְתִמְהוֹנֵנוּ': 'and-to-our-astonishment',
  'שִׁרְיוֹנָם': 'their-armor',
  'לְהִכָּשֵׁל': 'to-stumble',
  'מְצַפִּים': 'watching',
  'הִצִּיל': 'he-delivered',
  'הַשָּׁעָה': 'the-hour',
  'צַמְתִּי': 'I-fasted',
  'הַצֹּרֵר': 'the-adversary',
  'לְהִתְפַּלֵּא': 'to-marvel',
  'כִּסְנִינֵה': 'Kisnninah',
  'כְּמִדַּת': 'according-to-the-measure-of',
  'כְּמִשְׁקַל': 'as-the-weight-of',
  'לְחֶשְׁבּוֹנָם': 'to-their-account',
  'אַשְׁמָתוֹ': 'his-guilt',
  'הַמִּתְהַפֶּכֶת': 'the-flaming/turning',
  'וַיִּפְקֹד': 'and-he-appointed',
  'לְקַוּוֹת': 'to-hope',
  'בְּכוֹרִיַנְטוּמְר': 'in-Coriantumr',
  'סְנוּם': 'Snum',
  'שׁוּם': 'any/nothing',
  'קָרוּ': 'happened',

  // More verbal forms
  'הֻשְׁלְכוּ': 'they-were-cast-out',
  'הֵשִׁיב': 'he-restored',
  'הִבְרִיחָם': 'he-drove-them-away',
  'לְהַבִּיעַ': 'to-express',
  'וַיִּסְתֹּרוּ': 'and-they-hid',
  'וַיִּפְגְּעוּ': 'and-they-met',
  'וַיִּגַּע': 'and-he-touched',
  'הֲרָאִיתָ': 'have-you-seen',
  'וּבִרְאוֹתוֹ': 'and-when-he-saw',
  'בִּרְאוֹתְכֶם': 'when-you-see',
  'שָׁאֲלוּ': 'they-asked',
  'הִשְׁבִּיעַ': 'he-caused-to-swear',
  'וַיִּתְקַע': 'and-he-pitched',
  'וַיִּתְנַבְּאוּ': 'and-they-prophesied',
  'שָׂרַפְתִּי': 'I-burned',
  'וַיִּתְחַנְּנוּ': 'and-they-beseeched',
  'הֵגֵנּוּ': 'he-protected-us',
  'הִסְכִּימוּ': 'they-agreed',
  'הַמְשַׁקֵּר': 'the-liar',
  'חֹתְנוֹ': 'his-father-in-law',
  'הִנִּיחוּ': 'they-left',
  'הֵסִיר': 'he-removed',
  'הֵמִית': 'he-put-to-death',
  'נִכְזְבָה': 'disappointed',
  'חוֹשֵׁב': 'thinking',
  'לִתְפֹּס': 'to-seize',
  'חָנוּ': 'they-camped',
  'תָּפְשׂוּ': 'they-seized',
  'הַשִּׁיבָה': 'restore!',
  'לַחֲלַקְלַקּוֹת': 'to-flattery',
  'לְהִתְקַיֵּם': 'to-be-fulfilled',
  'כְּנָפֶיהָ': 'her-wings',
  'תַטְבִּילוּ': 'you-shall-immerse',
  'תַּטְבִּילוּ': 'you-shall-immerse',
  'יִגְמָלְךָ': 'he-shall-reward-you',
  'הַגֶּשֶׁם': 'the-rain',
  'הַשְּׁטָפוֹת': 'the-floods',
  'כְּכַלֹּתוֹ': 'when-he-finished',
  'חֲפַצְתֶּם': 'you-desired',
  'נִבְלְלוּ': 'they-were-confounded',
  'יְגָרְשֵׁנוּ': 'he-shall-drive-us-out',
  'יִבְשְׁלוּ': 'they-shall-ripen',
  'לִנְשֹׁם': 'to-breathe',
  'כִּדְמוּת': 'in-the-likeness-of',
  'חָתַמְתִּי': 'I-sealed',
  'יִפָּתְחוּ': 'they-shall-open',
  'הַסְּעָרוֹת': 'the-storms',
  'סְבָבוּם': 'surrounded-them',
  'נִדְחֲפוּ': 'they-were-pushed',
  'לְהִתְפַּשֵּׁט': 'to-spread',
  'רִחֵם': 'he-had-mercy',
  'מָשְׁחוֹ': 'his-anointing',
  'בַּהֲעָבִירוֹ': 'when-he-passed',
  'חֲמוּשִׁים': 'armed',
  'נַחֲזִיק': 'we-shall-hold-fast',
  'לְהַכְרִית': 'to-cut-off',
  'כִּשְׁבוּיֵי': 'as-captives-of',
  'שְׁבוּיֵי': 'captives-of',
  'מַטְמוֹנָיו': 'his-treasures',
  'צָרִיךְ': 'necessary',
  'תִּכָּרֵת': 'shall-be-cut-off',
  'יִתְפַּלְלוּ': 'they-shall-pray',
  'תְּשׁוּקַת': 'desire-of',
  'נִתֶּנֶת': 'given(f)',
  'שְׁלַחְתֶּם': 'you-sent',
  'תִסְבְּלוּ': 'you-shall-suffer',
  'תְּכַחֵשׁ': 'you-deny',
  'הַסִּבָּה': 'the-cause',
  'הַמֹּשֵׁל': 'the-ruler',
  'כְּנֵסֶת': 'assembly',
  'הַסּוּפָה': 'the-storm',
  'בְּהִפָּרְדָם': 'when-they-separated',
  'טָמְנוּ': 'they-hid',
  'כֻלָּהּ': 'all-of-it(f)',
  'שֹׁכְבִים': 'lying-down',
  'לַחֲרוֹת': 'to-engrave',
  'נָתוּן': 'given',
  'נִצַּלְנוּ': 'we-were-saved',
  'הִתַּכְתִּי': 'I-smelted',

  // Proper names with prefixes
  'אַנְטִיפָּרָה': 'Antiparah',
  'מוֹרִיַנְטוֹן': 'Morianton',
  'עַמְנִיגַדָּה': 'Amnigaddah',
  'כּוֹרִיַנְטוּם': 'Coriantum',
  'כּוֹרִיַנְטוּר': 'Coriantor',
  'אוֹרִיהָה': 'Orihah',
  'אַנְטְיוֹנוּם': 'Antionum',
  'גְדִיאַנְטוֹן': 'Gadianton',
  'עֲמוּלֵק': 'Amulek',
  'לְאָכִישׁ': 'to-Akish',
  'הָעַמּוֹנִיחָהִים': 'the-Ammonihahites',
  'הָעֲמוּלוֹנִים': 'the-Amulonites',
};

// Apply fixes
const re = /\["([^"]+)","([^"]*)"\]/g;
let m;
const replacements = new Map();
let count = 0;

// Build stripped versions
const strippedFixes = {};
for (const [h, e] of Object.entries(fixes)) {
  strippedFixes[stripNiqqud(h)] = e;
}

while ((m = re.exec(bom)) !== null) {
  const heb = m[1];
  const gloss = m[2];
  if (!gloss || heb === '׃') continue;

  // Check if this Hebrew word has a fix
  const clean = heb.replace(/[׃]/g, '');
  const fix = fixes[clean] || fixes[heb];
  if (fix && fix !== gloss) {
    replacements.set(m[0], `["${heb}","${fix}"]`);
    count++;
    continue;
  }

  // Try stripped
  const stripped = stripNiqqud(clean);
  const fix2 = strippedFixes[stripped];
  if (fix2 && fix2 !== gloss) {
    replacements.set(m[0], `["${heb}","${fix2}"]`);
    count++;
  }
}

console.log(`Applying ${count} fixes (${replacements.size} unique patterns)`);

for (const [orig, repl] of replacements) {
  bom = bom.split(orig).join(repl);
}

fs.writeFileSync('BOM.html', bom, 'utf8');
console.log('Done!');
