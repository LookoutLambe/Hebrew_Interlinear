// Fix remaining consonant-heavy transliterations
const fs = require('fs');
let bom = fs.readFileSync('BOM.html', 'utf8');
const dict = JSON.parse(fs.readFileSync('gloss_dictionary.json', 'utf8'));

function stripNiqqud(s) { return s.replace(/[\u0591-\u05C7]/g, ''); }

// Massive manual fix dictionary for remaining transliterations
const manualFixes = {
  // High frequency (3+ occurrences)
  'אֲבִיר': 'Mighty-One',
  'כְנֵסִיּוֹתֵיכֶם': 'your-synagogues',
  'צָרִיךְ': 'necessary',
  'תִּכָּרֵת': 'you-shall-be-cut-off',
  'יִתְפַּלְלוּ': 'they-shall-pray',
  'תְּשׁוּקַת': 'desire-of',
  'נִתֶּנֶת': 'given(f)',
  'חֲמוּשִׁים': 'armed',
  'נַחֲזִיק': 'we-shall-hold-fast',
  'לְהַכְרִית': 'to-cut-off',
  'הֵגֵנּוּ': 'he-protected-us',
  'נִכְזְבָה': 'disappointed',
  'שְׁבוּיֵי': 'captives-of',
  'חוֹשֵׁב': 'thinking',
  'כִּשְׁבוּיֵי': 'as-captives-of',
  'לִתְפֹּס': 'to-seize',
  'חָנוּ': 'they-camped',
  'הַשִּׁיבָה': 'restore!',
  'תָּפְשׂוּ': 'they-seized',
  'מַטְמוֹנָיו': 'his-treasures',
  'לַחֲלַקְלַקּוֹת': 'to-flattering-things',
  'לְהִתְקַיֵּם': 'to-be-fulfilled',
  'שָׂרַפְתִּי': 'I-burned',
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
  'סְבָבוּם': 'they-surrounded-them',
  'נִדְחֲפוּ': 'they-were-pushed',
  'לְהִתְפַּשֵּׁט': 'to-spread',
  'הִסְכִּימוּ': 'they-agreed',
  'הַמְשַׁקֵּר': 'the-liar',
  'רִחֵם': 'he-had-mercy',
  'חֹתְנוֹ': 'his-father-in-law',
  'מָשְׁחוֹ': 'his-anointing',
  'בֶן־כוֹם': 'son-of-Com',
  'בַּהֲעָבִירוֹ': 'when-he-passed',

  // Common verb forms
  'הֻשְׁלְכוּ': 'they-were-cast-out',
  'נִבְחֲרוּ': 'they-were-chosen',
  'הֻכְרַחְתֶּם': 'you-were-compelled',
  'הֻכָּה': 'was-smitten',
  'הֵשִׁיב': 'he-restored',
  'לְקַוּוֹת': 'to-hope',
  'בְּחִיר': 'chosen-one',
  'תֻּכּוּ': 'they-were-smitten',
  'וַיִּפְתַּח': 'and-he-opened',
  'וַיִּפְקֹד': 'and-he-appointed',
  'הֵמִית': 'he-put-to-death',
  'הִבְרִיחָם': 'he-drove-them-away',
  'הִנִּיחוּ': 'they-left',
  'הֵסִיר': 'he-removed',
  'הַסִּבָּה': 'the-cause',
  'הַמֹּשֵׁל': 'the-ruler',
  'כְּנֵסֶת': 'assembly',
  'הַסּוּפָה': 'the-storm',
  'לְהַבִּיעַ': 'to-express',
  'נָתוּן': 'given',
  'תְּכַחֵשׁ': 'you-deny',
  'סְנוּם': 'Snum',
  'שׁוּם': 'any',
  'תִסְבְּלוּ': 'you-shall-suffer',
  'בְּהִפָּרְדָם': 'when-they-separated',
  'שְׁלַחְתֶּם': 'you-sent',
  'שֹׁכְבִים': 'lying-down',
  'לַחֲרוֹת': 'to-engrave',
  'טָמְנוּ': 'they-hid',
  'כֻלָּהּ': 'all-of-it(f)',
  'לְהַשְׁחָתָה': 'to-destruction',

  // More verbs
  'הִתְלַבֵּשׁ': 'he-clothed-himself',
  'נִשְׁבְּעוּ': 'they-swore',
  'הִתְחַזְּקוּ': 'they-strengthened-themselves',
  'הִתְנַפְּלוּ': 'they-attacked',
  'הִשְׁבִּיעַ': 'he-made-swear',
  'הִכְנִיעַ': 'he-subdued',
  'הִשְׁחִית': 'he-corrupted',
  'הִשְׁמִיד': 'he-destroyed',
  'הִשְׁמִידוּ': 'they-destroyed',
  'נִלְכְּדוּ': 'they-were-captured',
  'הֻכְנְעוּ': 'they-were-humbled',
  'נִפְקְדוּ': 'they-were-numbered',
  'נִכְרְתוּ': 'they-were-cut-off',
  'נִמְצְאוּ': 'they-were-found',
  'נִשְׁמְעוּ': 'they-were-heard',
  'נִלְקְחוּ': 'they-were-taken',
  'נִשְׁלְחוּ': 'they-were-sent',
  'נִבְדְּלוּ': 'they-were-separated',
  'נֶהֶרְסוּ': 'they-were-destroyed',
  'הִגִּיעוּ': 'they-arrived',
  'הִפְקִיד': 'he-appointed',
  'הִכִּירוּ': 'they-recognized',
  'הוּבְאוּ': 'they-were-brought',
  'הֻשְׁמְדוּ': 'they-were-destroyed',
  'הֻשְׁלַךְ': 'was-cast-out',

  // Hithpael forms (reflexive)
  'מִתְפַּלְלִים': 'praying',
  'הִתְבּוֹנְנוֹ': 'his-pondering',
  'וַיִּתְפַּלְּלוּ': 'and-they-prayed',
  'וַיִּתְפַּלֵּל': 'and-he-prayed',
  'וַיִּתְנַבְּאוּ': 'and-they-prophesied',
  'וַיִּתְחַנְּנוּ': 'and-they-beseeched',

  // Nouns with suffixes
  'מַחְשְׁבוֹתֵיהֶם': 'their-thoughts',
  'תַּחְבּוּלוֹתֵיהֶם': 'their-wiles',
  'מְצוּדוֹתֵיהֶם': 'their-fortresses',
  'שְׁבוּעוֹתֵיהֶם': 'their-oaths',
  'כּוֹחוֹתָיו': 'his-powers',
  'חֲזוֹנוֹתַי': 'my-visions',
  'מַשְׁקֵיהֶם': 'their-drinks',
  'חֳלָיֵיהֶם': 'their-diseases',
  'מִבְצְרֵי': 'fortresses-of',
  'מִצְחוֹתֵיהֶם': 'their-foreheads',
  'מִשְׁפְּחוֹתֵיכֶם': 'your-families',
  'מַחְשְׁבוֹתֶיךָ': 'your-thoughts',
  'מַחְשְׁבוֹתָיו': 'his-thoughts',
  'מַחְשְׁבוֹתַי': 'my-thoughts',
  'מְזִמּוֹתֵיכֶם': 'your-plots',
  'מִשְׁפָּטֵינוּ': 'our-judgments',
  'כְנֵסִיּוֹתֵיהֶם': 'their-synagogues',
  'תְפִלּוֹתֵיהֶם': 'their-prayers',
  'נְבוּאוֹתֵיהֶם': 'their-prophecies',
  'מִלְחֲמוֹתֵיהֶם': 'their-wars',
  'לִבּוֹתֵיהֶם': 'their-hearts',
  'גְּבוּלֵיהֶם': 'their-borders',
  'מֶרְכְּבוֹתֵיהֶם': 'their-chariots',
  'שִׁגְעוֹנוֹתֵיהֶם': 'their-madness',
  'פִּלְיָתָם': 'their-remnant',
  'הַמְגַדְּפִים': 'the-blasphemers',
  'הַמְנַסִּים': 'the-ones-trying',
  'הַקָּמִים': 'those-rising-up',
  'הַנְהָגַת': 'the-conduct-of',
  'תַּחְבֻּלוֹת': 'wiles',
  'מִשְׁאֲלוֹתֵינוּ': 'our-requests',

  // Nature/objects
  'הַגֶּשֶׁם': 'the-rain',
  'סְפִינוֹת': 'ships',
  'הַסְּפִינוֹת': 'the-ships',
  'כְּזֻכוּכִית': 'like-glass',
  'זְכוּכִית': 'glass',

  // More misc
  'הָעֹמְדִים': 'the-ones-standing',
  'מְעֻנִּים': 'afflicted',
  'אֲפִלּוּ': 'even/also',
  'לִפְעֹל': 'to-work',
  'אָשֵׁם': 'guilty',
  'אֲסוּרִים': 'bound',
  'הַמַּעֲרָב': 'the-west',
  'עֲמוּלֵק': 'Amulek',
  'גְדִיאַנְטוֹן': 'Gadianton',
  'לְאָכִישׁ': 'to-Akish',
  'אוֹרִיהָה': 'Orihah',
  'אַנְטְיוֹנוּם': 'Antionum',
  'אַנְטִיפָּרָה': 'Antiparah',
  'מוֹרִיַנְטוֹן': 'Morianton',
  'עַמְנִיגַדָּה': 'Amnigaddah',
  'כּוֹרִיַנְטוּם': 'Coriantum',
  'כּוֹרִיַנְטוּר': 'Coriantor',
  'כּוֹרִיַנְטוּמְר': 'Coriantumr',
  'בְּכוֹרִיַנְטוּמְר': 'in-Coriantumr',
  'הָעֲמוּלוֹנִים': 'the-Amulonites',
  'הָעַמּוֹנִיחָהִים': 'the-Ammonihahites',

  // More verbs (common)
  'נִצַּלְנוּ': 'we-were-saved',
  'הִתַּכְתִּי': 'I-smelted',
  'וַהֲכִינֵם': 'and-prepare-them',
  'הֲכִינוֹנוּ': 'we-prepared',
  'צִוִּיתָנִי': 'you-commanded-me',
  'הוֹרֵיתָנִי': 'you-instructed-me',
  'הִכִּיתָנוּ': 'you-smote-us',
  'וַתִּדְחֵנוּ': 'and-you-rejected-us',
  'עֲשִׂיתָנוּ': 'you-made-us',
  'יִצְרֵנוּ': 'our-nature',
  'נְקַבֵּל': 'we-may-receive',
  'תַמְשִׁיכוּ': 'you-continue',
  'תִּבְשְׁלוּ': 'you-ripen',
  'תֶּחֶטְאוּ': 'you-sin',
  'יָדוֹן': 'shall-strive',
  'יִבְלֹל': 'he-confounds',
  'נָבִין': 'we-understand',
  'יַעֲבֹד': 'he-shall-serve',
  'יֶחֶטְאוּ': 'they-shall-sin',
  'יוֹשִׁיעַ': 'he-shall-save',
  'יִטְעֲמוּ': 'they-shall-taste',
  'תָּבִיא': 'you-bring',
  'תִּמָּלֵא': 'shall-be-filled',
  'תָּבֹאנָה': 'they-shall-come(f)',
  'תִּפְתַּח': 'you-shall-open',
  'תִּסְתֹּם': 'you-shall-seal',
  'תִגְוְעוּ': 'you-shall-perish',
  'וְתִקְּחוּ': 'and-you-take',
  'יָאִירוּ': 'they-shall-shine',
  'וְיָאִירוּ': 'and-they-shall-shine',
  'בְּעָבְרֵנוּ': 'when-we-cross',
  'בְּעָרְמָה': 'with-cunning',
  'בְּחֶמְלָה': 'with-compassion',
  'הַנְפִילָה': 'the-fall',
  'הַמְּלֹאת': 'the-fullness',
  'הַסֶּלַע': 'the-rock',
  'וְהָשֵׁב': 'and-restore',
  'הַסּוֹעֵר': 'the-stormy',
  'וְקַלּוֹת': 'and-light(weight)',
  'כְּקַלּוּת': 'as-lightness-of',
  'הָעוֹף': 'the-bird',
  'מִקְנְךָ': 'your-livestock',
  'פַּחִים': 'snares',
  'עֹל': 'yoke',
  'הַתְּשַׁע': 'the-nine',
  'מַסָּעֵנוּ': 'our-journey',
  'אֶשְׁכֹּן': 'I-will-dwell',
  'עָלַיִךְ': 'upon-you(f)',
  'אֲבָל': 'but/however',
  'שָׁאֲלוּ': 'they-asked',
  'זוֹעֲקִים': 'crying-out',
  'הֶעֱשִׁירוּ': 'they-became-rich',
  'קוֹרְאִים': 'calling',
  'פְּצָעִים': 'wounds',
  'הַמָּלֵא': 'the-full',
  'בִּגְאוֹנָם': 'in-their-pride',
  'חוּלְשָׁתוֹ': 'his-weakness',
  'אֲוִיר': 'air',
  'בְּתַחְתִּית': 'at-the-bottom',
  'בַּמַּבּוּל': 'in-the-flood',
  'בַּמַּבּוּלִים': 'in-the-floods',
  'לְהַשְׁחָתָה': 'to-destruction',
  'בְּאֶצְבָּעֲךָ': 'with-your-finger',
  'דְּבָרֵינוּ': 'our-words',
  'שְׂפָתָם': 'their-language',
  'רֵעֵיהֶם': 'their-friends',
  'הָאֲרָצוֹת': 'the-lands',
  'תְּבוּנָה': 'understanding',
  'חֵפֶץ': 'desire',
  'בֶצַע': 'gain/profit',
  'אֵימַת': 'terror-of',
  'אֵימָה': 'terror',
  'רָעֵב': 'hungry',
  'נָסַע': 'he-journeyed',
  'לֶאֱסֹר': 'to-bind',
  'עַצְמְךָ': 'yourself',
  'מִצְּבָאוֹ': 'from-his-army',
  'אוֹמֶרֶת': 'saying(f)',
  'חֲטָאֵי': 'sins-of',
  'חַטֹּאתַי': 'my-sins',
  'אֵיתָנִים': 'mighty/enduring',
  'כִּרְאוֹתוֹ': 'when-he-saw-him',
  'בֶאֱמוּנַת': 'in-faith-of',
  'מִיִּרְאַת': 'from-fear-of',
  'אֱוִילִים': 'fools',
  'אֲטוּמוֹת': 'sealed',
  'וְרֵעָיו': 'and-his-friends',
  'שָׁמְעָה': 'she-heard',
  'מוֹצָא': 'origin/source',
  'בְּאַבְנֵיהֶם': 'with-their-stones',
  'מַטְמוֹנָיו': 'his-treasures',

  // ═══ Additional common forms ═══
  'יִשְׁתַּחֲווּ': 'they-shall-worship',
  'נִלְחַם': 'he-fought',
  'נִשְׁבַּע': 'he-swore',
  'הִתְפַּלֵּל': 'he-prayed',
  'הִתְנַבֵּא': 'he-prophesied',
  'הִתְבּוֹנֵן': 'he-pondered',
  'הִשְׁתַּחֲוָה': 'he-worshipped',
  'הִכִּיר': 'he-recognized',
  'הִמְשִׁיךְ': 'he-continued',
  'הִצְלִיחַ': 'he-succeeded',
  'הִרְשִׁיעַ': 'he-acted-wickedly',
  'הִרְבָּה': 'he-multiplied',
  'הִכְרִית': 'he-cut-off',
  'הִשְׁלִיךְ': 'he-cast-out',
  'נִשְׁמַד': 'was-destroyed',
  'נִלְכַּד': 'was-captured',
  'נִפְתַּח': 'was-opened',
  'נִכְנַע': 'was-humbled',
  'נִצַּל': 'was-saved',
  'נִפְדָּה': 'was-redeemed',
  'נִמְצָא': 'was-found',
  'נִקְרָא': 'was-called',
  'נִשְׁלַח': 'was-sent',

  // Construct state nouns
  'כְהֻנַּת': 'priesthood-of',
  'כָהֻנַּת': 'priesthood-of',
  'מַלְכוּת': 'kingdom-of',
  'תּוֹלְדוֹת': 'generations-of',
  'מִשְׁמֶרֶת': 'charge-of',
  'גְּבוּרַת': 'might-of',
  'תְּפִלַּת': 'prayer-of',
  'בִּתְפִלָּה': 'in-prayer',
  'תְּשׁוּעַת': 'salvation-of',
  'תְּשׁוּבַת': 'repentance-of',
  'כִּפֻּרִים': 'atonement',
  'הַכִּפֻּרִים': 'the-atonement',
  'מְנוּחָה': 'rest',
  'הַמְּנוּחָה': 'the-rest',
  'נְקָמָה': 'vengeance',
  'גְּבוּרָה': 'might',
  'תְּפִלָּה': 'prayer',
  'תְּשׁוּעָה': 'deliverance',
};

// Build stripped versions for matching
const strippedFixes = {};
for (const [heb, eng] of Object.entries(manualFixes)) {
  strippedFixes[stripNiqqud(heb)] = eng;
}
const strippedDict = {};
for (const [heb, eng] of Object.entries(dict)) {
  const s = stripNiqqud(heb);
  if (!strippedDict[s]) strippedDict[s] = eng;
}

// Prefix patterns
const prefixes = [
  { pat: /^וַיְ/, g: 'and-' }, { pat: /^וַיִּ/, g: 'and-' }, { pat: /^וַתִּ/, g: 'and-' },
  { pat: /^וְהִ/, g: 'and-' }, { pat: /^וּמִ/, g: 'and-from-' }, { pat: /^וְהַ/, g: 'and-the-' },
  { pat: /^וּבְ/, g: 'and-in-' }, { pat: /^וּלְ/, g: 'and-to-' },
  { pat: /^בְּהִ/, g: 'in-' }, { pat: /^בְּ/, g: 'in-' }, { pat: /^בַּ/, g: 'in-the-' },
  { pat: /^בָּ/, g: 'in-the-' }, { pat: /^הַ/, g: 'the-' }, { pat: /^הָ/, g: 'the-' },
  { pat: /^וְ/, g: 'and-' }, { pat: /^וַ/, g: 'and-' }, { pat: /^וּ/, g: 'and-' },
  { pat: /^לְ/, g: 'to-' }, { pat: /^לַ/, g: 'to-the-' }, { pat: /^לָ/, g: 'to-the-' },
  { pat: /^מִ/, g: 'from-' }, { pat: /^מֵ/, g: 'from-' },
  { pat: /^כְּ/, g: 'as-' }, { pat: /^כַּ/, g: 'as-the-' }, { pat: /^שֶׁ/, g: 'that-' },
];

function lookup(word) {
  const clean = word.replace(/[׃]/g, '').trim();
  if (!clean) return null;
  if (manualFixes[clean]) return manualFixes[clean];
  if (manualFixes[word]) return manualFixes[word];
  if (dict[clean]) return dict[clean];
  const stripped = stripNiqqud(clean);
  if (strippedFixes[stripped]) return strippedFixes[stripped];
  if (strippedDict[stripped]) return strippedDict[stripped];

  // Try prefix stripping
  for (const { pat, g } of prefixes) {
    if (pat.test(clean)) {
      const rest = clean.replace(pat, '');
      if (rest.length >= 2) {
        const r = manualFixes[rest] || dict[rest];
        if (r) return g + r;
        const rs = stripNiqqud(rest);
        if (strippedFixes[rs]) return g + strippedFixes[rs];
        if (strippedDict[rs]) return g + strippedDict[rs];
      }
    }
  }
  return null;
}

// Find bad glosses and fix them
const re = /\["([^"]+)","([^"]*)"\]/g;
let match;
const replacements = new Map();
let fixCount = 0;

function isBadTranslit(gloss) {
  const segs = gloss.split('-');
  for (const seg of segs) {
    if (seg.length < 3) continue;
    if (/^[A-Z][a-z]+$/.test(seg)) {
      const l = seg.toLowerCase();
      const v = (l.match(/[aeiou]/g)||[]).length;
      if (l.length >= 4 && v/l.length < 0.2) return true;
      if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(l)) return true;
      if (/^[bcdfghjklmnpqrstvwxyz]{3}/i.test(l) && l.length >= 4) return true;
    }
  }
  // Also check for Hebrew chars
  if (/[\u0590-\u05FF]/.test(gloss)) return true;
  return false;
}

while ((match = re.exec(bom)) !== null) {
  const heb = match[1];
  const gloss = match[2];
  if (!gloss || gloss === '' || heb === '׃') continue;
  if (!isBadTranslit(gloss)) continue;

  // Try maqaf split
  const parts = heb.split('\u05BE');
  if (parts.length >= 2) {
    const gp = [];
    let allOk = true;
    for (const p of parts) {
      const f = lookup(p);
      if (f) gp.push(f); else { allOk = false; gp.push(null); }
    }
    if (allOk) {
      replacements.set(match[0], `["${heb}","${gp.join('-')}"]`);
      fixCount++;
      continue;
    }
  }

  // Single word
  const found = lookup(heb);
  if (found) {
    replacements.set(match[0], `["${heb}","${found}"]`);
    fixCount++;
  }
}

console.log(`Fixed: ${fixCount} additional glosses`);
console.log(`Applying ${replacements.size} replacements...`);

for (const [orig, repl] of replacements) {
  bom = bom.split(orig).join(repl);
}

fs.writeFileSync('BOM.html', bom, 'utf8');
console.log('Done! BOM.html updated.');

// Re-count remaining
const re2 = /\["([^"]+)","([^"]*)"\]/g;
let m2, remaining = 0;
while ((m2 = re2.exec(bom)) !== null) {
  if (m2[1] !== '׃' && isBadTranslit(m2[2])) remaining++;
}
console.log(`Remaining bad transliterations: ${remaining}`);
