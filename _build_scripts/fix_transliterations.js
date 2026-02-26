// Fix remaining transliterated glosses in BOM.html
// These are Hebrew words that got transliterated instead of translated
const fs = require('fs');
let bom = fs.readFileSync('BOM.html', 'utf8');

// Strip niqqud for matching
function stripNiqqud(s) {
  return s.replace(/[\u0591-\u05C7]/g, '');
}

// Comprehensive Hebrew→English glosses for remaining transliterations
// Organized by category
const fixes = {
  // ═══ VERBS - Passive/Hufal/Nifal forms ═══
  'הֻשְׁלְכוּ': 'they-were-cast-out',
  'נִבְחֲרוּ': 'they-were-chosen',
  'קָרוּ': 'happened',
  'הֻכְרַחְתֶּם': 'you-were-compelled',
  'הֻכָּה': 'was-smitten',
  'הֵשִׁיב': 'he-restored',
  'תֻּכּוּ': 'they-were-smitten',
  'נִבְחַר': 'was-chosen',
  'הֻשְׁמְדוּ': 'they-were-destroyed',
  'הֻכּוּ': 'they-were-smitten',
  'נִשְׁלְמָה': 'let-us-make-peace',
  'הֻעֲמְדוּ': 'they-were-placed',
  'נִכְבְּשׁוּ': 'they-were-subdued',
  'הֻשְׁלַךְ': 'he-was-cast-out',
  'נִשְׁבְּעוּ': 'they-swore',
  'הֻכְנְעוּ': 'they-were-humbled',
  'נִלְכְּדוּ': 'they-were-captured',
  'הֻשְׁמַד': 'was-destroyed',
  'נִפְדּוּ': 'they-were-redeemed',
  'נִקְרְאוּ': 'they-were-called',
  'נִפְקְדוּ': 'they-were-numbered',
  'נִכְרְתוּ': 'they-were-cut-off',
  'הוּבְאוּ': 'they-were-brought',
  'הוּבָא': 'was-brought',
  'הוּבְאָה': 'was-brought(f)',
  'נִתְּנָה': 'was-given(f)',
  'נִתַּן': 'was-given',
  'נִמְצְאוּ': 'they-were-found',
  'נִשְׁמְעוּ': 'they-were-heard',
  'נִלְקְחוּ': 'they-were-taken',
  'נִשְׁלַח': 'was-sent',
  'נִשְׁלְחוּ': 'they-were-sent',
  'הוּשַׁב': 'was-returned',
  'הוּכַן': 'was-prepared',
  'נִבְדְּלוּ': 'they-were-separated',
  'נִשְׁבָּר': 'was-broken',
  'נֶהֶרְסוּ': 'they-were-destroyed',
  'נִצְּלוּ': 'they-were-saved',
  'נִצַּלְנוּ': 'we-were-saved',

  // ═══ VERBS - Piel/Hifil ═══
  'וַיִּפְתַּח': 'and-he-opened',
  'וַיִּפְקֹד': 'and-he-appointed',
  'הֵמִית': 'he-put-to-death',
  'הִבְרִיחָם': 'he-drove-them-away',
  'הִנִּיחוּ': 'they-left/placed',
  'הֵסִיר': 'he-removed',
  'וַיִּתְפַּלְלוּ': 'and-they-prayed',
  'וַיִּתְפַּלֵּל': 'and-he-prayed',
  'מִתְפַּלְלִים': 'praying',
  'וַיִּתְבּוֹנֵן': 'and-he-pondered',
  'הִתְבּוֹנְנוֹ': 'his-pondering',
  'וַיְשַׁלֵּחַ': 'and-he-sent',
  'הִשְׁבִּיעַ': 'he-caused-to-swear',
  'וַיַּגִּישׁוּ': 'and-they-brought-near',
  'הִתְנַפְּלוּ': 'they-fell-upon',
  'הִשְׁמִיד': 'he-destroyed',
  'הִשְׁמִידוּ': 'they-destroyed',
  'הִגִּיעוּ': 'they-arrived',
  'הִפְקִיד': 'he-appointed',
  'הִכְנִיעַ': 'he-subdued',
  'הִתְרַפָּה': 'became-slack',
  'הִשְׁחִית': 'he-corrupted',
  'הִכִּירוּ': 'they-recognized',

  // ═══ VERBS - Common Qal forms ═══
  'שֹׁכְבִים': 'lying-down',
  'לַחֲרוֹת': 'to-engrave',
  'טָמְנוּ': 'they-hid',
  'כֻלָּהּ': 'all-of-it(f)',
  'שְׁלַחְתֶּם': 'you-sent',
  'לְקַוּוֹת': 'to-hope',
  'תִסְבְּלוּ': 'you-shall-suffer',
  'הִפָּרְדָם': 'their-separating',
  'תְּכַחֵשׁ': 'you-deny',
  'נָתוּן': 'given',
  'הַמֹּשֵׁל': 'the-ruler',
  'כְּנֵסֶת': 'assembly',
  'הַסִּבָּה': 'the-cause',
  'הַסּוּפָה': 'the-storm',
  'לְהַבִּיעַ': 'to-express',
  'בְּחִיר': 'chosen-one',
  'סְנוּם': 'Snum',
  'שׁוּם': 'any/put',
  'בְּכוֹרִיַנְטוּמְר': 'in-Coriantumr',

  // ═══ VERBS - More common forms ═══
  'וַיִּזְכְּרוּ': 'and-they-remembered',
  'וַיִּתְאַסְּפוּ': 'and-they-gathered',
  'וַיִּשְׁתַּחֲווּ': 'and-they-worshipped',
  'וַיִּבְכּוּ': 'and-they-wept',
  'וַיִּתְחַזְּקוּ': 'and-they-strengthened',
  'וַיִּתְנַפְּלוּ': 'and-they-fell-upon',
  'וַיְּקַבְּלוּ': 'and-they-received',
  'וַיִּשְׁלְחוּ': 'and-they-sent',
  'וַיִּמְנוּ': 'and-they-counted',
  'וַיִּכְנְעוּ': 'and-they-submitted',
  'וַיִּתְפַּשְׂוּ': 'and-they-seized',
  'וַיִּתְחַנְּנוּ': 'and-they-beseeched',
  'וַיִּסְתֹּרוּ': 'and-they-hid',
  'וַיִּבְרְחוּ': 'and-they-fled',
  'וַיִּתְעַצְּבוּ': 'and-they-grieved',
  'וַיִּתְעַצֵּב': 'and-he-grieved',
  'וַיִּפְגְּעוּ': 'and-they-met',
  'וַיִּתְקַע': 'and-he-pitched',
  'וַיִּתְנַבְּאוּ': 'and-they-prophesied',
  'וַיִּלָּחֲמוּ': 'and-they-fought',
  'וַיַּקְרִיבוּ': 'and-they-offered',
  'וַיִּשְׁפְּטוּ': 'and-they-judged',
  'וַיִּתְקַדְּשׁוּ': 'and-they-sanctified',
  'וַיַּמְלִיכוּ': 'and-they-made-king',
  'וַיְבָרֲכוּ': 'and-they-blessed',

  // ═══ NOUNS with suffixes ═══
  'מַחְשְׁבוֹתֵיהֶם': 'their-thoughts',
  'מַחְשְׁבוֹתַי': 'my-thoughts',
  'מַחְשְׁבוֹתָיו': 'his-thoughts',
  'מַחְשְׁבוֹתֶיךָ': 'your-thoughts',
  'תַּחְבּוּלוֹתֵיהֶם': 'their-wiles',
  'תַּחְבֻּלוֹת': 'wiles',
  'מִשְׁפְּחוֹתֵיהֶם': 'their-families',
  'מִשְׁפְּחוֹתֵיכֶם': 'your-families',
  'מִשְׁפָּטֵינוּ': 'our-judgments',
  'מְזִמּוֹתֵיכֶם': 'your-plots',
  'מְצוּדוֹתֵיהֶם': 'their-fortresses',
  'שְׁבוּעוֹתֵיהֶם': 'their-oaths',
  'חֲזוֹנוֹתַי': 'my-visions',
  'כּוֹחוֹתָיו': 'his-powers',
  'מַשְׁקֵיהֶם': 'their-drinks',
  'חֳלָיֵיהֶם': 'their-diseases',
  'מִבְצְרֵי': 'fortresses-of',
  'פִּלְיָתָם': 'their-remnant',
  'מִצְחוֹתֵיהֶם': 'their-foreheads',
  'הַקָּמִים': 'the-ones-rising-up',
  'הַנְהָגַת': 'the-conduct-of',
  'הַמְגַדְּפִים': 'the-blasphemers',
  'הַמְנַסִּים': 'the-ones-trying',

  // ═══ COMPOUND WORDS (maqaf-joined) ═══
  'כְהֻנַּת': 'priesthood-of',
  'כָהֻנַּת': 'priesthood-of',

  // ═══ ADJECTIVES/PARTICIPLES ═══
  'עָמְדִים': 'standing',
  'הָעֹמְדִים': 'the-ones-standing',
  'מְעֻנִּים': 'afflicted',
  'אֲפִלּוּ': 'even/also',
  'לִפְעֹל': 'to-work',
  'אָשֵׁם': 'guilty',
  'אֲסוּרִים': 'bound/prisoners',
  'הַמַּעֲרָב': 'the-west',
  'יֶחֶטְאוּ': 'they-shall-sin',
  'עָנְיְכֶם': 'your-affliction',
  'עֲמוּלֵק': 'Amulek',
  'מַלְאָכוֹ': 'his-angel',
  'גְדִיאַנְטוֹן': 'Gadianton',
  'עוֹף': 'bird/fowl',
  'יַעֲבֹד': 'he-shall-serve',
  'אֲטוּמוֹת': 'sealed/closed',
  'לְאָכִישׁ': 'to-Akish',
  'וְרֵעָיו': 'and-his-friends',
  'שָׁמְעָה': 'she-heard',
  'עֵמֶר': 'Omer',
  'עֶדְרֵיהֶם': 'their-flocks',
  'מוֹצָא': 'found/origin',
  'יִטְעֲמוּ': 'they-shall-taste',
  'אֱוִילִים': 'fools',
  'אֵימַת': 'terror-of',
  'אָהֲבוּ': 'they-loved',
  'מִיִּרְאַת': 'from-fear-of',
  'רָעֵב': 'hungry',
  'יוֹשִׁיעַ': 'he-shall-save',
  'אוֹמֶרֶת': 'saying(f)',
  'חֲטָאֵי': 'sins-of',
  'תָּבִיא': 'you-bring',
  'אֵימָה': 'terror',
  'כִּרְאוֹתוֹ': 'when-he-saw',
  'נָסַע': 'he-journeyed',
  'לֶאֱסֹר': 'to-bind',
  'בְּאַבְנֵיהֶם': 'with-their-stones',
  'וַיִּתְעַצֵּב': 'and-he-was-grieved',
  'וְהָעֲמוּלוֹנִים': 'and-the-Amulonites',
  'חַטֹּאתַי': 'my-sins',
  'אֵיתָנִים': 'mighty/strong',
  'תִּמָּלֵא': 'shall-be-filled',
  'אַנְטְיוֹנוּם': 'Antionum',
  'תָּבֹאנָה': 'they-shall-come(f)',
  'עַצְמְךָ': 'yourself',
  'מִצְּבָאוֹ': 'from-his-army',
  'בְּעָרְמָה': 'with-cunning',
  'עֹל': 'yoke',
  'הַתְּשַׁע': 'the-nine',
  'אַנְטִיפָּרָה': 'Antiparah',
  'מַסָּעֵנוּ': 'our-journey',
  'אֶשְׁכֹּן': 'I-will-dwell',
  'עָלַיִךְ': 'upon-you(f)',
  'אֲבָל': 'but/however',
  'וַיִּגַּע': 'and-he-touched',
  'הֲרָאִיתָ': 'have-you-seen',
  'וּבִרְאוֹתוֹ': 'and-when-he-saw',
  'בִּרְאוֹתְכֶם': 'when-you-see',
  'שָׁאֲלוּ': 'they-asked',
  'אוֹרִיהָה': 'Orihah',
  'בֶצַע': 'gain/profit',
  'זוֹעֲקִים': 'crying-out',
  'הֶעֱשִׁירוּ': 'they-became-rich',
  'קוֹרְאִים': 'calling',
  'בֶאֱמוּנַת': 'in-faith-of',
  'עֲשִׂיתָנוּ': 'you-made-us',
  'וַיִּתְקַע': 'and-he-pitched',
  'פְּצָעִים': 'wounds',
  'לְהִתְעַצֵּב': 'to-grieve',
  'הַמָּלֵא': 'the-full',
  'בִּגְאוֹנָם': 'in-their-pride',
  'בְּאַבְנֵי': 'with-stones-of',
  'חוּלְשָׁתוֹ': 'his-weakness',
  'אֲוִיר': 'air',
  'כְּזֻכוּכִית': 'like-glass',
  'וְנִשְׁאַן': 'and-they-carried',
  'לְבָנוֹת': 'white',
  'וּבָרוֹת': 'and-clear',
  'בְּתַחְתִּית': 'at-the-bottom',
  'תִּפְתַּח': 'you-open',
  'תִּסְתֹּם': 'you-seal',
  'תִגְוְעוּ': 'you-perish',
  'בַּמַּבּוּל': 'in-the-flood',
  'בַּמַּבּוּלִים': 'in-the-floods',
  'וְתִקְּחוּ': 'and-you-take',
  'לְהַשְׁחָתָה': 'to-destruction',
  'הִתַּכְתִּי': 'I-smelted',
  'בְּאֶצְבָּעֲךָ': 'with-your-finger',
  'וַהֲכִינֵם': 'and-prepare-them',
  'יָאִירוּ': 'they-shall-shine',
  'וְיָאִירוּ': 'and-they-shall-shine',
  'הֲכִינוֹנוּ': 'we-prepared',
  'בְּעָבְרֵנוּ': 'when-we-cross',
  'צִוִּיתָנִי': 'you-commanded-me',
  'הוֹרֵיתָנִי': 'you-instructed-me',
  'הַסְּפִינוֹת': 'the-ships',
  'סְפִינוֹת': 'ships',
  'יִצְרֵנוּ': 'our-nature',
  'הַנְפִילָה': 'the-fall',
  'נְקַבֵּל': 'we-may-receive',
  'מִשְׁאֲלוֹתֵינוּ': 'our-requests',
  'הִכִּיתָנוּ': 'you-smote-us',
  'וַתִּדְחֵנוּ': 'and-you-pushed-us-away',
  'בְּחֶמְלָה': 'with-compassion',
  'וְהָשֵׁב': 'and-return',
  'הַסּוֹעֵר': 'the-stormy',
  'הַסֶּלַע': 'the-rock',
  'וְקַלּוֹת': 'and-light(weight)',
  'כְּקַלּוּת': 'as-the-lightness-of',
  'הָעוֹף': 'the-bird',
  'הָמַּיִם': 'the-waters',
  'עַמְנִיגַדָּה': 'Amnigaddah',
  'מוֹרִיַנְטוֹן': 'Morianton',
  'כּוֹרִיַנְטוּם': 'Coriantum',
  'יִבְלֹל': 'he-shall-confound',
  'נָבִין': 'we-understand',
  'דְּבָרֵינוּ': 'our-words',
  'שְׂפָתָם': 'their-language',
  'רֵעֵיהֶם': 'their-friends',
  'מִקְנְךָ': 'your-livestock',
  'פַּחִים': 'snares',
  'הַמְּלֹאת': 'the-fullness',
  'תַמְשִׁיכוּ': 'you-continue',
  'יָדוֹן': 'shall-strive',
  'תֶּחֶטְאוּ': 'you-sin',
  'תִּבְשְׁלוּ': 'you-shall-be-ripe',
  'הָאֲרָצוֹת': 'the-lands',
  'הַפְּלִשְׁתִּים': 'the-Philistines',
  'כַּפְּלִשְׁתִּים': 'like-the-Philistines',
  'וּפְלִשְׁתִּים': 'and-Philistines',
  'שְׁלֵם': 'Shelem',
  'תְּבוּנָה': 'understanding',
  'תִזְכְּרִי': 'you-remember(f)',
  'אַבְנֵי': 'stones-of',
  'חֵפֶץ': 'desire/precious',
  'לְהַשִּׂיג': 'to-obtain',
  'כִּסֵּא': 'throne',
  'הַכִּסֵּא': 'the-throne',
  'מֶרְכָּבָה': 'chariot',
  'מֶרְכְּבוֹתֵיהֶם': 'their-chariots',
  'מִשְׁמָר': 'guard',
  'הַמִּשְׁמָר': 'the-guard',
  'מִשְׁתֶּה': 'feast',
  'הַמִּשְׁתֶּה': 'the-feast',
  'מִגְדָּל': 'tower',
  'הַמִּגְדָּל': 'the-tower',
  'מִקְדָּשׁ': 'temple',
  'הַמִּקְדָּשׁ': 'the-temple',
  'מִזְבֵּחַ': 'altar',
  'הַמִּזְבֵּחַ': 'the-altar',
  'מִשְׁפָּט': 'judgment',
  'הַמִּשְׁפָּט': 'the-judgment',
  'חֹשֶׁךְ': 'darkness',
  'הַחֹשֶׁךְ': 'the-darkness',
  'קָדְשׁוֹ': 'his-holiness',
  'בְּקָדְשׁוֹ': 'in-his-holiness',

  // ═══ MORE PROPER NAMES ═══
  'כּוֹרִיַנְטוּר': 'Coriantor',
  'אַנְטִיפָּרָה׃': 'Antiparah',
  'מַלְכִּי': 'Melchi',
  'וּמַלְכִּי': 'and-Melchi',

  // ═══ MISC COMMON WORDS ═══
  'הַשָּׂטָן': 'the-Adversary',
  'שָׂטָן': 'Adversary',
  'מִשְׁמֶרֶת': 'charge/duty',
  'תְּשׁוּעָה': 'deliverance',
  'נְקָמָה': 'vengeance',
  'גְּבוּרָה': 'might',
  'תְּפִלָּה': 'prayer',
  'בִּתְפִלָּה': 'in-prayer',
  'תְפִלָּתוֹ': 'his-prayer',
  'תְפִלּוֹתֵיהֶם': 'their-prayers',
  'בַּקָּשָׁה': 'petition',
  'הוֹדָיָה': 'thanksgiving',
  'כִּפֻּרִים': 'atonement',
  'הַכִּפֻּרִים': 'the-atonement',
  'תְּחִיָּה': 'resurrection',
  'הַתְּחִיָּה': 'the-resurrection',
  'שְׁכִינָה': 'presence',
  'מְנוּחָה': 'rest',
  'הַמְּנוּחָה': 'the-rest',
};

// Also load the existing dictionary for fallback lookups
const dict = JSON.parse(fs.readFileSync('gloss_dictionary.json', 'utf8'));

// Build stripped-niqqud versions
const strippedFixes = {};
for (const [heb, eng] of Object.entries(fixes)) {
  strippedFixes[stripNiqqud(heb)] = eng;
}
const strippedDict = {};
for (const [heb, eng] of Object.entries(dict)) {
  const s = stripNiqqud(heb);
  if (!strippedDict[s]) strippedDict[s] = eng;
}

// Prefix patterns for morphological analysis
const prefixes = [
  { pattern: /^וַיְ/, gloss: 'and-' },
  { pattern: /^וַיִּ/, gloss: 'and-' },
  { pattern: /^וַתִּ/, gloss: 'and-' },
  { pattern: /^וְהִ/, gloss: 'and-' },
  { pattern: /^וּמִ/, gloss: 'and-from-' },
  { pattern: /^וְהַ/, gloss: 'and-the-' },
  { pattern: /^וּבְ/, gloss: 'and-in-' },
  { pattern: /^וּלְ/, gloss: 'and-to-' },
  { pattern: /^וְלִ/, gloss: 'and-to-' },
  { pattern: /^בְּהִ/, gloss: 'in-' },
  { pattern: /^בְּ/, gloss: 'in-' },
  { pattern: /^בַּ/, gloss: 'in-the-' },
  { pattern: /^בָּ/, gloss: 'in-the-' },
  { pattern: /^הַ/, gloss: 'the-' },
  { pattern: /^הָ/, gloss: 'the-' },
  { pattern: /^וְ/, gloss: 'and-' },
  { pattern: /^וַ/, gloss: 'and-' },
  { pattern: /^וּ/, gloss: 'and-' },
  { pattern: /^לְ/, gloss: 'to-' },
  { pattern: /^לַ/, gloss: 'to-the-' },
  { pattern: /^לָ/, gloss: 'to-the-' },
  { pattern: /^מִ/, gloss: 'from-' },
  { pattern: /^מֵ/, gloss: 'from-' },
  { pattern: /^כְּ/, gloss: 'as-' },
  { pattern: /^כַּ/, gloss: 'as-the-' },
  { pattern: /^שֶׁ/, gloss: 'that-' },
];

function lookupWord(word) {
  const clean = word.replace(/[׃]/g, '').trim();
  if (!clean) return null;

  // Direct match
  if (fixes[clean]) return fixes[clean];
  if (fixes[word]) return fixes[word];
  if (dict[clean]) return dict[clean];

  // Stripped niqqud match
  const stripped = stripNiqqud(clean);
  if (strippedFixes[stripped]) return strippedFixes[stripped];
  if (strippedDict[stripped]) return strippedDict[stripped];

  // Prefix stripping
  for (const { pattern, gloss: prefixGloss } of prefixes) {
    if (pattern.test(clean)) {
      const rest = clean.replace(pattern, '');
      if (rest.length >= 2) {
        const restLookup = fixes[rest] || dict[rest];
        if (restLookup) return prefixGloss + restLookup;
        const restStripped = stripNiqqud(rest);
        if (strippedFixes[restStripped]) return prefixGloss + strippedFixes[restStripped];
        if (strippedDict[restStripped]) return prefixGloss + strippedDict[restStripped];
      }
    }
  }

  return null;
}

// Clean transliteration: remove Hebrew chars, produce readable output
function cleanTranslit(gloss) {
  // Replace Hebrew chars with their English equivalents
  return gloss
    .replace(/א/g, '')
    .replace(/ע/g, '')
    .replace(/[\u0590-\u05FF]/g, '');
}

// Find and fix bad glosses
const re = /\["([^"]+)","([^"]*)"\]/g;
let match;
const replacements = new Map();
let fixCount = 0;
let cleanCount = 0;

while ((match = re.exec(bom)) !== null) {
  const heb = match[1];
  const gloss = match[2];
  if (!gloss || gloss === '' || heb === '׃') continue;

  // Check if gloss contains Hebrew chars
  const hasHebrew = /[\u0590-\u05FF]/.test(gloss);

  // Check if gloss contains transliteration segments
  const segments = gloss.split('-');
  let hasTranslit = false;
  for (const seg of segments) {
    if (seg.length >= 3 && /^[A-Z][a-z]+$/.test(seg)) {
      const lower = seg.toLowerCase();
      const vowels = (lower.match(/[aeiou]/g) || []).length;
      if (lower.length >= 4 && vowels / lower.length < 0.2) hasTranslit = true;
      if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(lower)) hasTranslit = true;
      if (/^[bcdfghjklmnpqrstvwxyz]{3}/i.test(lower) && lower.length >= 4) hasTranslit = true;
    }
  }

  if (!hasHebrew && !hasTranslit) continue;

  // Try to fix: look up the Hebrew word
  // For maqaf compounds, split and look up each part
  const parts = heb.split('\u05BE');
  if (parts.length >= 2) {
    const glossParts = [];
    let allFound = true;
    for (const part of parts) {
      const found = lookupWord(part);
      if (found) {
        glossParts.push(found);
      } else {
        allFound = false;
        glossParts.push(null);
      }
    }
    if (allFound) {
      const newGloss = glossParts.join('-');
      replacements.set(match[0], `["${heb}","${newGloss}"]`);
      fixCount++;
      continue;
    }
  }

  // Try single word lookup
  const found = lookupWord(heb);
  if (found) {
    replacements.set(match[0], `["${heb}","${found}"]`);
    fixCount++;
    continue;
  }

  // Clean up Hebrew chars in transliterations
  if (hasHebrew) {
    const cleaned = cleanTranslit(gloss);
    if (cleaned !== gloss) {
      replacements.set(match[0], `["${heb}","${cleaned}"]`);
      cleanCount++;
    }
  }
}

console.log(`Found ${fixCount} fixable glosses`);
console.log(`Found ${cleanCount} glosses to clean (Hebrew char removal)`);
console.log(`Total replacements: ${replacements.size}`);

// Apply replacements
for (const [original, replacement] of replacements) {
  bom = bom.split(original).join(replacement);
}

// Also fix YHWH → the-Lord (should already be done but just in case)
const yhwhCount = (bom.match(/"YHWH"/g) || []).length;
bom = bom.replace(/"YHWH"/g, '"the-Lord"');
console.log(`Replaced ${yhwhCount} remaining YHWH occurrences`);

fs.writeFileSync('BOM.html', bom, 'utf8');
console.log('Done! BOM.html updated.');
