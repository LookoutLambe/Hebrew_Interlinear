// Comprehensive resolver for ALL remaining ??? glosses
// Strategy: layered approach - morphological rules, then hardcoded glosses for the rest
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\chris\\Desktop\\Hebrew BOM';
const dict = JSON.parse(fs.readFileSync(path.join(baseDir, 'gloss_dictionary.json'), 'utf8'));
const extraGlosses = JSON.parse(fs.readFileSync(path.join(baseDir, 'extra_glosses.json'), 'utf8'));
const workDict = { ...dict, ...extraGlosses };

// Load unknown words
const unknowns = JSON.parse(fs.readFileSync(path.join(baseDir, 'all_unknown_words.json'), 'utf8'));

// ═══════════════════════════════════════
// COMPREHENSIVE MANUAL GLOSSES
// Every word that appears 3+ times
// ═══════════════════════════════════════
const manualGlosses = {
  // PROPER NAMES (Ether genealogies, cities, people)
  'חֵת': 'Heth', 'שֵׁז': 'Shez', 'מוֹרֹנִי': 'Moroni', 'עֹמֶר': 'Omer',
  'כוֹם': 'Com', 'סֶבוּס': 'Sebus', 'גִּלְגָּל': 'Gilgal',
  'רִיפְלָקִישׁ': 'Riplakish', 'קוֹרִיאַנְטוֹן': 'Corianton',
  'מוֹרִיאַנְטוֹמֶר': 'Moriancumer', 'לִימְהִי': 'Limhi',
  'אַנְטִי־נֶפִי־לֶחִי': 'Anti-Nephi-Lehi',
  'אַמַּלִיקְיָה': 'Amalickiah', 'אֲמַלִיקְיָה': 'Amalickiah',
  'יַעֲרֶד': 'Jared', 'מָהוֹנְרִי': 'Mahonri',
  'פָגָג': 'Pagag', 'אוֹרִיחָה': 'Oriha', 'קִיבּ': 'Kib',
  'שׁוּלֶם': 'Shule', 'עוֹמֶר': 'Omer', 'אֵתוֹן': 'Ethem',
  'אָהָה': 'Ahah', 'מוֹרוֹן': 'Moron', 'קוֹרִיאַנְטוֹמֶר': 'Coriantumr',
  'קוֹרִיאַנְטֶמֶר': 'Coriantumr', 'לְקוֹרִיאַנְטוּמְר': 'to-Coriantumr',
  'בְּקוֹרִיאַנְטוּמְר': 'in-Coriantumr',
  'אֵמוֹס': 'Amos', 'הַעֲרָרַת': 'Ararat', 'גִּלְאָד': 'Gilead',
  'אַבְלוֹם': 'Ablom', 'עוֹגַת': 'Ogath', 'רָמָה': 'Ramah',
  'אֲגוֹשׁ': 'Agosh', 'חוֹרִיב': 'Horeb', 'נִמְרָה': 'Nimrah',
  'שִׁבְלוֹם': 'Shiblom', 'שִׁבְלוֹן': 'Shiblon',
  'חוֹנְטִי': 'Lehonti', 'מוֹרוֹנְטוֹן': 'Moronton',
  'אַמּוֹנִיחָה': 'Ammonihah', 'אַנְטִיפָּרָה': 'Antiparah',
  'זֶרַהֶמְנָה': 'Zerahemnah', 'אָרוֹן': 'Aaron',
  'גִּדְיוֹנִי': 'Gideonihah', 'קוּמֶנוֹס': 'Cumenihah',
  'נוֹחַ': 'Noah', 'יָרֶד': 'Jared', 'הַיָּרֶד': 'the-Jared',
  'פָּחוֹרָן': 'Pahoran', 'בָּבֶל': 'Babel', 'נִמְרוֹד': 'Nimrod',
  'אֵלִיָּהוּ': 'Elijah', 'מַלְכִּיצֶדֶק': 'Melchizedek',
  'אַבִּנָדִי': 'Abinadi', 'גִּדְגִּדּוֹנָה': 'Gidgiddonah',
  'לָכוֹנֵאוּס': 'Lachoneus', 'קוּמוֹרָה': 'Cumorah',
  'מוּלֵק': 'Mulek', 'גִּלְגָל': 'Gilgal', 'פַּקְטּוּס': 'Pactus',
  'נֶפִיחַ': 'Nephihah',
  'אָנְטִי': 'Anti', 'בּוּנְטִיפוּל': 'Bountiful',

  // VERBS - common forms
  'בָּנָה': 'built', 'שָׁפַט': 'judged', 'זָעַק': 'cried-out',
  'נֶעֱנַשׁ': 'was-punished', 'נִפְרְדוּ': 'they-separated',
  'נָסוֹגוּ': 'they-retreated', 'נִסּוּ': 'they-fled',
  'הֵכִינוּ': 'they-prepared', 'וַיָּכִינוּ': 'and-they-prepared',
  'וַיַּכֵּם': 'and-he-smote-them', 'וּכְבוֹא': 'and-when-came',
  'עָשִׂינוּ': 'we-did/made', 'לַעֲזֹר': 'to-help',
  'שָׁלַחְתִּי': 'I-sent', 'נְתַתֶּם': 'you-gave',
  'נִקְרֵאתִי': 'I-was-called', 'לְחַפֵּשׂ': 'to-search',
  'לְהָפִיץ': 'to-scatter', 'תִּתֵּן': 'you-shall-give',
  'לִפֹּל': 'to-fall', 'אֶתְהַלֵּל': 'I-will-boast',
  'לְהִתְהַלֵּל': 'to-boast', 'לְשַׁנּוֹת': 'to-change',
  'יִחְיוּ': 'they-shall-live', 'נִרְצַח': 'was-murdered',
  'הֲרָגוֹ': 'they-slew-him', 'וַיּוֹלֶד': 'and-he-begat',
  'תּוֹסֶפֶת': 'furthermore', 'מָתַי': 'when',
  'יָשַׁב': 'dwelt/sat', 'מָלַךְ': 'reigned', 'בָּרַח': 'fled',
  'חָזַק': 'was-strong', 'הִכָּנַע': 'humbled-himself',
  'הֶאֱמִין': 'believed', 'הֶאֱמִינוּ': 'they-believed',
  'הִתְנַבֵּא': 'prophesied', 'הִתְנַבְּאוּ': 'they-prophesied',
  'הִצְלִיחַ': 'succeeded/prospered', 'הָעֱבִיר': 'transferred',
  'הוֹרִישׁ': 'dispossessed', 'הוֹלִיד': 'begat',
  'הִתְחַנֵּן': 'pleaded', 'הִשְׁתַּחֲוָה': 'bowed-down',
  'הִשְׁתַּחֲווּ': 'they-bowed-down', 'הִתְחַזֵּק': 'strengthened-himself',
  'הִתְאַסְּפוּ': 'they-gathered', 'נֶאֶסְפוּ': 'they-were-gathered',
  'הֻכּוּ': 'they-were-smitten', 'הוּכּוּ': 'they-were-smitten',
  'נֶהֶרְגוּ': 'were-slain', 'נִלְכְּדוּ': 'were-captured',
  'נִכְבְּשׁוּ': 'were-subdued', 'נִלְחָם': 'fought',
  'נִלְחֲמוּ': 'they-fought', 'נִשְׁבַּע': 'swore',
  'נִשְׁבְּעוּ': 'they-swore', 'הוּשְׁמְדוּ': 'were-destroyed',
  'הוּשְׁלְכוּ': 'were-cast-out', 'הוּכָנוּ': 'were-prepared',
  'רָדַף': 'pursued', 'רָדְפוּ': 'they-pursued',
  'הִרְבָּה': 'much/many', 'נֶאֱמַר': 'was-said',
  'נוֹדַע': 'was-known', 'קָצַף': 'was-angry',
  'נָשָׂא': 'carried/bore', 'נָשְׂאוּ': 'they-carried',
  'שָׁלְטוּ': 'they-ruled', 'שָׁמְרוּ': 'they-kept',
  'שִׁלְטוֹנוֹ': 'his-government', 'מָלְכוּ': 'they-reigned',
  'הֵעִיד': 'testified', 'הֵעִידוּ': 'they-testified',
  'הָעִיר': 'aroused', 'הֵסִיתוּ': 'they-incited',
  'עוֹרֵר': 'aroused', 'עוֹרְרוּ': 'they-aroused',
  'סָפַר': 'recounted', 'סִפֵּר': 'told/recounted',
  'הוֹדִיעַ': 'made-known', 'צִוָּה': 'commanded',
  'הִטְמִין': 'hid', 'גָּנַב': 'stole', 'גָּנְבוּ': 'they-stole',
  'רָצַח': 'murdered', 'רָצְחוּ': 'they-murdered',
  'שָׂרְפוּ': 'they-burned', 'הֶעֱלוּ': 'they-raised-up',
  'עָמְדוּ': 'they-stood', 'יָשְׁבוּ': 'they-dwelt',
  'קָמוּ': 'they-arose', 'שָׂמוּ': 'they-placed',
  'בָּחֲרוּ': 'they-chose', 'קִבְּלוּ': 'they-received',
  'סָרוּ': 'they-departed', 'כָּפְרוּ': 'they-denied',
  'חָדְלוּ': 'they-ceased', 'חָרְדוּ': 'they-trembled',
  'עָבְרוּ': 'they-crossed', 'נָסְעוּ': 'they-journeyed',
  'אָסְפוּ': 'they-gathered', 'מָצְאוּ': 'they-found',
  'סָבְבוּ': 'they-surrounded', 'קָרְבוּ': 'they-drew-near',
  'הָפְכוּ': 'they-turned', 'נִהְיוּ': 'they-became',
  'בָּרְכוּ': 'they-blessed', 'אָכְלוּ': 'they-ate',
  'שָׁתוּ': 'they-drank', 'שָׁכְנוּ': 'they-dwelt',

  // NOUNS - common forms
  'אֹתוֹת': 'signs', 'מַצַּב': 'situation/state',
  'מְקוֹמוֹת': 'places', 'עֲיֵפִים': 'weary(mp)',
  'טַעַם': 'taste/sense', 'אִוֶּלֶת': 'foolishness',
  'דִּבְרַת': 'on-account-of', 'עָנְיָם': 'their-poverty',
  'וּמִשְׁקַל': 'and-weight-of', 'כַּקְּעָרָה': 'as-the-dish/rameumptom',
  'צְבָאוֹתָם': 'their-armies', 'וּבְרִיתוֹתֵיהֶם': 'and-their-covenants',
  'וְחִצֵּיהֶם': 'and-their-arrows', 'וּמִשְׁפְּחוֹתֵיהֶם': 'and-their-families',
  'לַנֶּפִיִּים': 'to-the-Nephites',
  'חֶרֶב': 'sword', 'חֲרָבוֹת': 'swords', 'חַרְבּוֹ': 'his-sword',
  'חֲרָבוֹתֵיהֶם': 'their-swords', 'חַרְבוֹתֵינוּ': 'our-swords',
  'חֵץ': 'arrow', 'חִצִּים': 'arrows', 'חִצֵּיהֶם': 'their-arrows',
  'מָגֵן': 'shield', 'מָגִנִּים': 'shields',
  'כְּלֵי': 'weapons-of', 'כְּלֵיהֶם': 'their-weapons',
  'שִׁרְיוֹן': 'breastplate', 'שִׁרְיוֹנוֹת': 'breastplates',
  'קֶשֶׁת': 'bow', 'קְשָׁתוֹת': 'bows',
  'אֶבֶן': 'stone', 'אֲבָנִים': 'stones',
  'קֶלַע': 'sling', 'קְלָעִים': 'slings',
  'מִבְצָר': 'fortification', 'מְבַצְּרִים': 'fortifications',
  'חוֹמָה': 'wall', 'חוֹמוֹת': 'walls',
  'שַׁעַר': 'gate', 'שְׁעָרִים': 'gates',
  'מִגְדָּל': 'tower', 'מִגְדָּלִים': 'towers',
  'דֶּרֶךְ': 'way/road', 'דְּרָכִים': 'ways',
  'כֹּחַ': 'strength', 'כֹּחָם': 'their-strength',
  'חַיִל': 'army/valor', 'חֵילוֹת': 'armies',
  'שָׂר': 'captain', 'שָׂרִים': 'captains', 'שָׂרֵי': 'captains-of',
  'מֶלֶךְ': 'king', 'מְלָכִים': 'kings', 'מַלְכֵי': 'kings-of',
  'הַמַּלְכָּה': 'the-queen', 'מַמְלָכָה': 'kingdom',
  'מִשְׁפָּחָה': 'family', 'מִשְׁפְּחוֹת': 'families',
  'שֵׁבֶט': 'tribe', 'שְׁבָטִים': 'tribes',
  'עֵדָה': 'congregation', 'עֲדַת': 'congregation-of',
  'קְהִלָּה': 'church', 'בַּקְּהִלָּה': 'in-the-church',
  'בְּרִית': 'covenant', 'בְּרִיתוֹת': 'covenants',
  'עֵדוּת': 'testimony', 'תְּעוּדָה': 'certificate',
  'תּוֹעֵבָה': 'abomination', 'תּוֹעֵבוֹת': 'abominations',
  'תּוֹעֲבוֹתֵיהֶם': 'their-abominations',
  'חֶסֶד': 'mercy/lovingkindness', 'חַסְדֵי': 'mercies-of',
  'רַחֲמִים': 'compassion', 'בְּרַחֲמִים': 'in-compassion',
  'צֶדֶק': 'righteousness', 'צִדְקַת': 'righteousness-of',
  'עָוֹן': 'iniquity', 'עֲווֹנוֹת': 'iniquities',
  'חֵטְא': 'sin', 'חֲטָאִים': 'sins', 'חַטָּאת': 'sin(f)',
  'פֶּשַׁע': 'transgression', 'פְּשָׁעִים': 'transgressions',
  'כַּפָּרָה': 'atonement', 'הַכַּפָּרָה': 'the-atonement',
  'תְּשׁוּבָה': 'repentance', 'הַתְּשׁוּבָה': 'the-repentance',
  'גְּאֻלָּה': 'redemption', 'הַגְּאֻלָּה': 'the-redemption',
  'יְשׁוּעָה': 'salvation', 'הַיְשׁוּעָה': 'the-salvation',
  'תְּחִיָּה': 'resurrection', 'הַתְּחִיָּה': 'the-resurrection',
  'גֵּיהִנֹּם': 'hell', 'גַּן־עֵדֶן': 'garden-of-Eden',
  'נֶפֶשׁ': 'soul', 'נְפָשׁוֹת': 'souls',
  'גּוּף': 'body', 'גּוּפוֹ': 'his-body', 'גּוּפָם': 'their-body',
  'בָּשָׂר': 'flesh', 'בְּשַׂר': 'flesh-of',
  'דָּם': 'blood', 'דְּמֵי': 'blood-of', 'דָּמָם': 'their-blood',

  // ADJECTIVES
  'חָזָק': 'strong', 'חֲזָקִים': 'strong(mp)',
  'גָּדוֹל': 'great', 'גְּדוֹלָה': 'great(f)', 'גְּדוֹלִים': 'great(mp)',
  'קָטָן': 'small', 'קְטַנָּה': 'small(f)',
  'חָדָשׁ': 'new', 'חֲדָשָׁה': 'new(f)',
  'יָשָׁר': 'upright/straight', 'יְשָׁרִים': 'upright(mp)',
  'צַדִּיק': 'righteous', 'צַדִּיקִים': 'righteous(mp)',
  'רָשָׁע': 'wicked', 'רְשָׁעִים': 'wicked(mp)',
  'טָמֵא': 'unclean', 'טְמֵאִים': 'unclean(mp)',
  'טָהוֹר': 'pure', 'טְהוֹרִים': 'pure(mp)',
  'נֶאֱמָן': 'faithful', 'נֶאֱמָנִים': 'faithful(mp)',
  'עָנָו': 'humble', 'עֲנָוִים': 'humble(mp)',

  // PREPOSITIONS & PARTICLES
  'בְּחֵמָה': 'in-fury', 'בַּעֲבוּרוֹ': 'because-of-him',
  'לַנֶּצַח': 'forever', 'מִנֶּגֶד': 'from-before',
  'בִּפְנֵי': 'in-presence-of', 'בְּפָנָיו': 'in-his-face',
  'מִמֶּנּוּ': 'from-him', 'מִמֶּנָּה': 'from-her/it',
  'עִמּוֹ': 'with-him', 'עִמָּהּ': 'with-her',
  'אֵלָיו': 'unto-him', 'אֵלֶיהָ': 'unto-her',
  'בּוֹ': 'in-him/it', 'בָּהּ': 'in-her/it',
  'לוֹ': 'to-him', 'לָהּ': 'to-her',
  'כְּנֶגְדּוֹ': 'against-him', 'עָלָיו': 'upon-him',
  'תַּחְתָּיו': 'in-his-stead', 'אַחֲרָיו': 'after-him',
  'לְפָנָיו': 'before-him', 'מֵאַחֲרָיו': 'from-behind-him',
  'בֵּינֵיהֶם': 'between-them', 'בְּתוֹכָם': 'in-their-midst',
  'מִלִּפְנֵיהֶם': 'from-before-them',

  // SUFFIXED FORMS
  'אַרְצוֹ': 'his-land', 'אַרְצָם': 'their-land',
  'עַמּוֹ': 'his-people', 'עַמָּם': 'their-people',
  'עָרָיו': 'his-cities', 'עָרֵיהֶם': 'their-cities',
  'שְׁמוֹ': 'his-name', 'שְׁמָם': 'their-name',
  'כִּסְאוֹ': 'his-throne', 'כִּסְאָם': 'their-throne',
  'יָדוֹ': 'his-hand', 'יָדָם': 'their-hand',
  'עֵינָיו': 'his-eyes', 'עֵינֵיהֶם': 'their-eyes',
  'לִבּוֹ': 'his-heart', 'לִבָּם': 'their-heart',
  'פִּיו': 'his-mouth', 'פִּיהֶם': 'their-mouth',
  'רֹאשׁוֹ': 'his-head', 'רָאשֵׁיהֶם': 'their-heads',
  'אָבִיו': 'his-father', 'אֲבוֹתֵיהֶם': 'their-fathers',
  'אִמּוֹ': 'his-mother', 'אִמָּם': 'their-mother',
  'אָחִיו': 'his-brother', 'אֲחֵיהֶם': 'their-brothers',
  'בְּנוֹ': 'his-son', 'בָּנָיו': 'his-sons', 'בְּנֵיהֶם': 'their-sons',
  'בִּתּוֹ': 'his-daughter', 'בְּנוֹתֵיהֶם': 'their-daughters',
  'אִשְׁתּוֹ': 'his-wife', 'נְשֵׁיהֶם': 'their-wives',
  'עַבְדוֹ': 'his-servant', 'עַבְדָּיו': 'his-servants',
  'צְבָאוֹ': 'his-army', 'צְבָאוֹתָיו': 'his-armies',
  'מַמְלַכְתּוֹ': 'his-kingdom', 'אֶת־מַמְלַכְתּוֹ': 'ACC-his-kingdom',
  'דְּבָרָיו': 'his-words', 'דִּבְרֵיהֶם': 'their-words',
  'מַעֲשָׂיו': 'his-works', 'מַעֲשֵׂיהֶם': 'their-works',
  'חַטֹּאתָיו': 'his-sins', 'חַטֹּאתָם': 'their-sins',
  'עֲווֹנוֹתָיו': 'his-iniquities', 'עֲווֹנוֹתֵיהֶם': 'their-iniquities',
};

// ═══════════════════════════════════════
// EXTENDED MORPHOLOGICAL RULES
// ═══════════════════════════════════════
const prefixes = [
  { p: 'וְ', g: 'and-' }, { p: 'וַ', g: 'and-' }, { p: 'וּ', g: 'and-' },
  { p: 'וָ', g: 'and-' }, { p: 'וִ', g: 'and-' },
  { p: 'בְּ', g: 'in-' }, { p: 'בַּ', g: 'in-the-' }, { p: 'בָּ', g: 'in-the-' },
  { p: 'בִּ', g: 'in-' },
  { p: 'לְ', g: 'to-' }, { p: 'לַ', g: 'to-the-' }, { p: 'לָ', g: 'to-the-' },
  { p: 'לִ', g: 'to-' },
  { p: 'כְּ', g: 'as-' }, { p: 'כַּ', g: 'as-the-' }, { p: 'כָּ', g: 'as-the-' },
  { p: 'כָ', g: 'as-' },
  { p: 'מִ', g: 'from-' }, { p: 'מֵ', g: 'from-' }, { p: 'מְ', g: 'from-' },
  { p: 'הַ', g: 'the-' }, { p: 'הָ', g: 'the-' }, { p: 'הֶ', g: 'the-' },
  { p: 'שֶׁ', g: 'that-' },
];

const allDict = { ...workDict, ...manualGlosses };

function resolve(word) {
  // Direct match in combined dictionary
  if (allDict[word]) return allDict[word];

  // Maqaf split
  if (word.includes('־')) {
    const parts = word.split('־');
    const glossed = parts.map(p => allDict[p] || tryPrefix(p) || p);
    // Return joined glosses
    return glossed.join('-');
  }

  // Prefix stripping (up to 2 levels)
  const prefixed = tryPrefix(word);
  if (prefixed) return prefixed;

  // Try removing trailing ם (plural suffix) or ה (feminine)
  if (word.endsWith('ִים') || word.endsWith('ִּים')) {
    const stem = word.slice(0, -2);
    if (allDict[stem]) return allDict[stem] + '(mp)';
  }

  // Return transliteration attempt for proper nouns (capitalized context)
  return transliterate(word);
}

function tryPrefix(word) {
  for (const { p, g } of prefixes) {
    if (word.startsWith(p) && word.length > p.length + 1) {
      const rem = word.slice(p.length);
      if (allDict[rem]) return g + allDict[rem];
      // Double prefix
      for (const { p: p2, g: g2 } of prefixes) {
        if (rem.startsWith(p2) && rem.length > p2.length + 1) {
          const rem2 = rem.slice(p2.length);
          if (allDict[rem2]) return g + g2 + allDict[rem2];
        }
      }
    }
  }
  return null;
}

// Basic Hebrew-to-English transliteration for proper nouns
function transliterate(word) {
  // Strip niqqud for pattern matching
  const consonants = word.replace(/[\u0591-\u05C7]/g, '');

  const map = {
    'א': '', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'o',
    'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'i', 'כ': 'k', 'ך': 'k',
    'ל': 'l', 'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's',
    'ע': '', 'פ': 'p', 'ף': 'f', 'צ': 'ts', 'ץ': 'ts',
    'ק': 'k', 'ר': 'r', 'שׁ': 'sh', 'שׂ': 's', 'ש': 'sh', 'ת': 't',
    '־': '-',
  };

  let result = '';
  for (const ch of consonants) {
    result += map[ch] || ch;
  }
  // Capitalize first letter (proper noun convention)
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  return result || word;
}

// ═══════════════════════════════════════
// APPLY TO BOM.html
// ═══════════════════════════════════════
let bom = fs.readFileSync(path.join(baseDir, 'BOM.html'), 'utf8');

let resolved = 0;
let total = 0;

bom = bom.replace(/\["([^"]+)","\?\?\?"\]/g, (match, hebrew) => {
  total++;
  const gloss = resolve(hebrew);
  if (gloss && gloss !== '???') {
    resolved++;
    const gEsc = gloss.replace(/"/g, '\\"');
    return `["${hebrew}","${gEsc}"]`;
  }
  return match;
});

fs.writeFileSync(path.join(baseDir, 'BOM.html'), bom, 'utf8');

// Count remaining ???
const remaining = (bom.match(/"\?\?\?"/g) || []).length;
console.log(`Resolved: ${resolved}/${total}`);
console.log(`Remaining ???: ${remaining}`);

if (remaining > 0) {
  // Extract remaining for review
  const re = /\["([^"]+)","\?\?\?"\]/g;
  const leftover = {};
  let m;
  while ((m = re.exec(bom)) !== null) {
    leftover[m[1]] = (leftover[m[1]] || 0) + 1;
  }
  const sorted = Object.entries(leftover).sort((a, b) => b[1] - a[1]);
  console.log(`Unique remaining: ${sorted.length}`);
  console.log('Top 30:');
  sorted.slice(0, 30).forEach(([w, c]) => console.log(`  ${w} (${c}x)`));
  fs.writeFileSync(path.join(baseDir, 'still_unknown.json'), JSON.stringify(sorted, null, 2), 'utf8');
}
