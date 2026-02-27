const fs = require('fs');

// ═══════════════════════════════════════════════════════════
// MORPHOLOGICAL PASS 1: VAYYIQTOL (NARRATIVE PAST) FORMS
// Pattern: וַיִּ/וַתִּ/וַיָּ + root → "and-he/she/they-VERBed"
// These are the easiest to parse systematically
// ═══════════════════════════════════════════════════════════

// Vayyiqtol verb dictionary: stem (after וַיִּ/וַתִּ) → gloss
// Format: the portion AFTER the vav-consecutive prefix → English past meaning
const VAYYIQTOL_MAP = {
  // ── 3mp forms (וַיִּ...וּ) ──
  'שְׁדְדוּ': 'and-they-plundered',
  'רְצְחוּ': 'and-they-murdered',
  'שְׁקְטוּ': 'and-they-were-quiet',
  'מְשְׁחוּ': 'and-they-anointed',
  'תְכּוֹנְנוּ': 'and-they-prepared-themselves',
  'תְחַמְּשׁוּ': 'and-they-armed-themselves',
  'נָּגְרוּ': 'and-they-flowed',
  'צָּבְרוּ': 'and-they-gathered',
  'בָּדְלוּ': 'and-they-separated',
  'פְגְּעוּ': 'and-they-attacked',
  'שְׁמִידוּ': 'and-they-destroyed',
  'כְרְעוּ': 'and-they-bowed-down',
  'בָּהֲלוּ': 'and-they-were-alarmed',
  'תְקְעוּ': 'and-they-blew',
  'מָּלְטוּ': 'and-they-escaped',
  'מָּנוּ': 'and-they-were-counted',
  'שָּׁמַע': 'and-it-was-heard',
  'שָּׁמְעוּ': 'and-they-were-heard',
  'כְנְעוּ': 'and-they-submitted',
  'סְבֹּל': 'and-he-bore/endured',
  'רְבּוּ': 'and-they-multiplied',
  'חְיוּ': 'and-they-lived',
  'חְזְקוּ': 'and-they-grew-strong',
  'גְרְשׁוּהוּ': 'and-they-drove-him-out',
  'מִּיתוּ': 'and-they-put-to-death',
  'לְכוּ': 'and-they-went',
  'עְלוּ': 'and-they-went-up',
  'רְדוּ': 'and-they-went-down',
  'צְאוּ': 'and-they-went-out',
  'בֹאוּ': 'and-they-came',
  'שְׁבוּ': 'and-they-returned',
  'קְחוּ': 'and-they-took',
  'תְנוּ': 'and-they-gave',
  'שִׁימוּ': 'and-they-placed',
  'כְתְבוּ': 'and-they-wrote',
  'קְרְאוּ': 'and-they-called',
  'שְׁלְחוּ': 'and-they-sent',
  'מְצְאוּ': 'and-they-found',
  'רְאוּ': 'and-they-saw',
  'דְעוּ': 'and-they-knew',
  'סְפוּ': 'and-they-added',
  'בְרְחוּ': 'and-they-fled',
  'נוּסוּ': 'and-they-fled',
  'עְמְדוּ': 'and-they-stood',
  'שְׁפְטוּ': 'and-they-judged',
  'מְלְכוּ': 'and-they-reigned',
  'חְטְאוּ': 'and-they-sinned',
  'בְנוּ': 'and-they-built',
  'אְסְפוּ': 'and-they-gathered',
  'לְחְמוּ': 'and-they-fought',
  'שְׁתוּ': 'and-they-drank',
  'שְׂרְפוּ': 'and-they-burned',
  'חְפְרוּ': 'and-they-dug',
  'טְמְנוּ': 'and-they-hid',
  'זְרְעוּ': 'and-they-sowed',
  'קְצְרוּ': 'and-they-reaped',
  'סְבְבוּ': 'and-they-surrounded',
  'חְנוּ': 'and-they-encamped',
  'קְבְרוּ': 'and-they-buried',
  'שְׁבְעוּ': 'and-they-swore',
  'בְחְרוּ': 'and-they-chose',
  'אְהְבוּ': 'and-they-loved',
  'שְׂנְאוּ': 'and-they-hated',
  'רְדְפוּ': 'and-they-pursued',
  'עְזְבוּ': 'and-they-forsook',
  'שְׁבְרוּ': 'and-they-broke',
  'חְשְׁבוּ': 'and-they-thought',
  'עְבְדוּ': 'and-they-served',
  'כְרְתוּ': 'and-they-cut',
  'הְרְגוּ': 'and-they-killed',
  'קְבְצוּ': 'and-they-gathered',

  // ── 3ms forms (וַיִּ/וַיָּ + stem) ──
  'שְׁמֹר': 'and-he-guarded',
  'שְׁמַע': 'and-he-heard',
  'שְׁלַח': 'and-he-sent',
  'קְרָא': 'and-he-called',
  'מְצָא': 'and-he-found',
  'רְאֶה': 'and-he-saw',
  'דַע': 'and-he-knew',
  'בֹא': 'and-he-came',
  'לֵךְ': 'and-he-went',
  'קַח': 'and-he-took',
  'תֵּן': 'and-he-gave',
  'שֶׁב': 'and-he-sat/dwelt',
  'עַל': 'and-he-went-up',
  'רֶד': 'and-he-went-down',
  'צֵא': 'and-he-went-out',
  'שָׁב': 'and-he-returned',
  'כְתֹּב': 'and-he-wrote',
  'שְׂרֹף': 'and-he-burned',
  'מְלֹךְ': 'and-he-reigned',
  'בְנֶה': 'and-he-built',
  'עֲשֶׂה': 'and-he-made',
  'חֲזֵק': 'and-he-grew-strong',
  'פֹּל': 'and-he-fell',
  'מָת': 'and-he-died',
  'גְדַּל': 'and-he-grew',
  'עֲמֹד': 'and-he-stood',
  'כְרַע': 'and-he-knelt',
  'שְׁפֹּט': 'and-he-judged',
  'לְחַם': 'and-he-fought',
  'חֲטָא': 'and-he-sinned',

  // ── Hifil vayyiqtol (causative) ──
  // These often appear as וַיּוֹ.../וַיַּ.../וַיָּ...
  'וֹלֵךְ': 'and-he-led',
  'וֹצֵא': 'and-he-brought-out',
  'וֹרֶד': 'and-he-brought-down',
  'עַל': 'and-he-brought-up',
  'שֵׁב': 'and-he-caused-to-dwell',
  'גֵּד': 'and-he-told',
  'כֶּה': 'and-he-struck',

  // ── 3fs forms (וַתִּ...) ──
  // similar patterns with feminine subject
};

// Also build a direct word→gloss map for vayyiqtol forms
// that are hard to parse by pattern
const DIRECT_VAYYIQTOL = {
  'וַיִּשְׁדְדוּ': 'and-they-plundered',
  'וַיִּרְצְחוּ': 'and-they-murdered',
  'וַיִּסְבֹּל': 'and-he-endured',
  'וַיִּשְׁקְטוּ': 'and-they-were-quiet',
  'וַיִּמְשְׁחוּ': 'and-they-anointed',
  'וַיִּתְכּוֹנְנוּ': 'and-they-prepared-themselves',
  'וַיִּתְחַמְּשׁוּ': 'and-they-armed-themselves',
  'וַיִּנָּגְרוּ': 'and-they-flowed',
  'וַיִּצָּבְרוּ': 'and-they-heaped-up',
  'וַיִּבָּדְלוּ': 'and-they-separated',
  'וַיִּפְגְּעוּ': 'and-they-attacked',
  'וַיַּשְׁמִידוּ': 'and-they-destroyed',
  'וַיִּכְרַע': 'and-he-bowed-down',
  'וַיִּבָּהֲלוּ': 'and-they-were-alarmed',
  'וַיִּתְקַע': 'and-he-blew(trumpet)',
  'וַיִּתְקְעוּ': 'and-they-blew(trumpets)',
  'וַיִּמָּלְטוּ': 'and-they-escaped',
  'וַיִּמָּנוּ': 'and-they-were-counted',
  'וַיִּשָּׁמַע': 'and-it-was-heard',
  'וַיִּכָּנְעוּ': 'and-they-humbled-themselves',
  'וַיִּרְבּוּ': 'and-they-multiplied',
  'וַיִּחְיוּ': 'and-they-lived',
  'וַיֶּחֱזְקוּ': 'and-they-grew-strong',
  'וַיְגָרְשׁוּהוּ': 'and-they-drove-him-out',
  'וַיָּמִיתוּ': 'and-they-put-to-death',
  'וַיּוֹלֵךְ': 'and-he-led',
  'וַיַּעַל': 'and-he-brought-up',
  'וַיַּגֵּד': 'and-he-told',
  'וַיַּכֶּה': 'and-he-struck',
  'וַיִּפְקֹד': 'and-he-appointed',
  'וַיִּסְגְּרוּ': 'and-they-shut',
  'וַיַּעְבִירוּ': 'and-they-transported',
  'וַיִּשְׁאֲרוּ': 'and-they-remained',
  'וַיִּלְכְדוּ': 'and-they-captured',
  'וַיִּכְבְשׁוּ': 'and-they-conquered',
  'וַיַּעַבְרוּ': 'and-they-crossed-over',
  'וַיִּשְׁבְעוּ': 'and-they-swore',
  'וַיִּקְבְצוּ': 'and-they-gathered',
  'וַיַּאַסְפוּ': 'and-they-assembled',
  'וַיָּשִׂימוּ': 'and-they-placed',
  'וַיַּכּוּ': 'and-they-struck',
  'וַיִּפְלוּ': 'and-they-fell',
  'וַיִּרְדְפוּ': 'and-they-pursued',
  'וַיַּשְׁלִיכוּ': 'and-they-cast',
  'וַיִּסְעוּ': 'and-they-set-out',
  'וַיַּחֲנוּ': 'and-they-encamped',
  'וַיִּקְבְרוּ': 'and-they-buried',
  'וַיִּבְנוּ': 'and-they-built',
  'וַיִּשְׁלְחוּ': 'and-they-sent',
  'וַיַּעַשׂוּ': 'and-they-made',
  'וַיִּרְאוּ': 'and-they-saw',
  'וַיֵּדְעוּ': 'and-they-knew',
  'וַיָּבוֹאוּ': 'and-they-came',
  'וַיֵּלְכוּ': 'and-they-went',
  'וַיִּקְחוּ': 'and-they-took',
  'וַיִּתְנוּ': 'and-they-gave',
  'וַיֵּשְׁבוּ': 'and-they-dwelt',
  'וַיֵּרְדוּ': 'and-they-went-down',
  'וַיַּעֲלוּ': 'and-they-went-up',
  'וַיֵּצְאוּ': 'and-they-went-out',
  'וַיָּשׁוּבוּ': 'and-they-returned',
  'וַיִּכְתְבוּ': 'and-they-wrote',
  'וַיִּמְצְאוּ': 'and-they-found',
  'וַיִּשְׁמְעוּ': 'and-they-heard',
  'וַיִּקְרְאוּ': 'and-they-called',
  'וַיַּעַמְדוּ': 'and-they-stood',
  'וַיַּאֲמִינוּ': 'and-they-believed',
  'וַיִּשְׂרְפוּ': 'and-they-burned',
  'וַיִּלְחֲמוּ': 'and-they-fought',
  'וַיַּחְפְרוּ': 'and-they-dug',
  'וַיִּזְרְעוּ': 'and-they-sowed',
  'וַיַּסְתִירוּ': 'and-they-hid',
  'וַיִּבְחֲרוּ': 'and-they-chose',
  'וַיַּהַרְגוּ': 'and-they-killed',
  'וַיִּשְׂנְאוּ': 'and-they-hated',
  'וַיַּעַזְבוּ': 'and-they-forsook',
  'וַיַּעַבְדוּ': 'and-they-served',
  'וַיִּכְרְתוּ': 'and-they-cut(covenant)',
  'וַיִּשְׁבְרוּ': 'and-they-broke',
  'וַיַּחְשְׁבוּ': 'and-they-thought',
  'וַיְבָרְכוּ': 'and-they-blessed',
  'וַיְקַבְצוּ': 'and-they-gathered',
  'וַיִּטְמְנוּ': 'and-they-hid',
  'וַיִּנוּסוּ': 'and-they-fled',
  'וַיִּבְרְחוּ': 'and-they-fled',
  'וַיָּסֻרוּ': 'and-they-turned-aside',
  'וַיִּשְׁפְכוּ': 'and-they-poured-out',
  'וַיִּגְנְבוּ': 'and-they-stole',
};

// ═══════════════════════════════════════════════════════════
// Apply fixes to all data files
// ═══════════════════════════════════════════════════════════

const dataFiles = [
  '_chapter_data/al_data.js',
  '_chapter_data/he_data.js',
  '_chapter_data/3n_data.js',
  '_chapter_data/et_data.js',
];

let grandTotal = 0;

dataFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = 0;

  for (const [hebrewWord, englishGloss] of Object.entries(DIRECT_VAYYIQTOL)) {
    const search = `["${hebrewWord}","???"]`;
    const replace = `["${hebrewWord}","${englishGloss}"]`;
    const count = content.split(search).length - 1;
    if (count > 0) {
      content = content.split(search).join(replace);
      fileFixed += count;
    }
  }

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`${filePath}: Fixed ${fileFixed} vayyiqtol forms`);
    grandTotal += fileFixed;
  } else {
    console.log(`${filePath}: No vayyiqtol matches found`);
  }
});

console.log(`\nTotal vayyiqtol fixes: ${grandTotal}`);

// Count remaining ???
let remaining = 0;
dataFiles.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const count = (c.match(/"\?\?\?"/g) || []).length;
  remaining += count;
  console.log(`  ${f}: ${count} ??? remaining`);
});
console.log(`Total ??? remaining: ${remaining}`);
