#!/usr/bin/env node
/**
 * fix_he_3n_et_glosses.js - Fix ??? glosses in Helaman, 3 Nephi, and Ether
 * Reuses Alma morphological patterns + book-specific proper nouns/vocabulary
 */
const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', '_chapter_data', 'he_data.js'),
  path.join(__dirname, '..', '_chapter_data', '3n_data.js'),
  path.join(__dirname, '..', '_chapter_data', 'et_data.js'),
];

// ═══════════════════════════════════════════════════════════════
// COMPREHENSIVE HEBREW GLOSS DICTIONARY
// ═══════════════════════════════════════════════════════════════
const glossMap = {
  // ═══════════════════════════════════════
  // PROPER NOUNS - Helaman, 3 Nephi, Ether specific
  // ═══════════════════════════════════════
  'שֵׁז': 'Shiz',
  'חֵת': 'Heth',
  'עֹמֶר': 'Omer',
  'עֹמֶר׃': 'Omer',
  'עֵמֶר': 'Emer',
  'כוֹם': 'Com',
  'זֶמְנָרִיהָה': 'Zemnarihah',
  'גְדִיאַנְטוֹן': 'Gadianton',
  'לְגְדִיאַנְטוֹן': 'to-Gadianton',
  'כּוֹרִיַנְטוּמְר': 'Coriantumr',
  'לְכּוֹרִיַנְטוּמְר': 'to-Coriantumr',
  'בְּכוֹרִיַנְטוּמְר': 'in-Coriantumr',
  'אֶת־כּוֹרִיַנְטוּמְר': '[ACC]-Coriantumr',
  'כּוֹרִיַנְטוּם': 'Coriantum',
  'אֶת־כּוֹרִיַנְטוּם': '[ACC]-Coriantum',
  'כּוֹרִיַנְטוֹר': 'Coriantor',
  'רִפְלָקִישׁ': 'Riplakish',
  'קִיב': 'Kib',
  'שִׁבְלוֹם': 'Shiblom',
  'מוֹרוֹנִיהָה': 'Moronihah',
  'לְמוֹרוֹנִיהָה': 'to-Moronihah',
  'בְּמוֹרוֹנִיהָה': 'in-Moronihah',
  'מוֹרִיַנְטוֹן': 'Morianton',
  'לְמוֹרִיַנְטוֹן': 'to-Morianton',
  'כּוֹהוֹר': 'Cohor',
  'אוֹרִיהָה': 'Orihah',
  'בּוּנְטִיפוּל': 'Bountiful',
  'בְּבוּנְטִיפוּל': 'in-Bountiful',
  'לְבוּנְטִיפוּל': 'to-Bountiful',
  'לְאָכִישׁ': 'to-Akish',
  'אָכִישׁ': 'Akish',
  'עֲמִינָדָב': 'Aminadab',
  'צֵזוֹרָם': 'Cezoram',
  'גִּלְגָּל': 'Gilgal',
  'בְּגִּלְגָּל': 'in-Gilgal',
  'גִדְגִדֹּנִי': 'Gidgiddoni',
  'לְגִדְגִדֹּנִי': 'to-Gidgiddoni',
  'לַכְמוֹנֵאוּס': 'Lachoneus',
  'לְלַכְמוֹנֵאוּס': 'to-Lachoneus',
  'גִדְיָנְחִי': 'Giddianhi',
  'לְגִדְיָנְחִי': 'to-Giddianhi',
  'סְנוּם': 'Senom',
  'סְעוֹן': 'Seon',
  'טִימוֹתִי': 'Timothy',

  // ═══════════════════════════════════════
  // QAL PERFECT (all persons)
  // ═══════════════════════════════════════
  // 3ms
  'שָׁפַט': 'judged',
  'זָעַק': 'cried-out',
  'אָבַד': 'perished',
  'בָּנָה': 'built',
  'רָצָה': 'desired',
  'פָּנָה': 'turned',
  'רִחֵם': 'had-mercy',
  'מָרַד': 'rebelled',
  // 3fs
  'וַתִּכְבַּד': 'and-it-was-heavy(f)',
  'וַתִּמְשֹׁךְ': 'and-it-continued(f)',
  'שָׁמְעָה': 'she-heard',
  'קָרְבָה': 'she-drew-near',
  'רָעֲשָׁה': 'it-quaked(f)',
  // 3cp
  'כָּרְעוּ': 'they-bowed',
  'כִּתְבוּ': 'they-wrote',
  'צָעֲקוּ': 'they-cried-out',
  'שָׁאֲלוּ': 'they-asked',
  'עָרְבוּ': 'they-pledged',
  'נֶהֶפְכוּ': 'they-were-overturned',
  'רַבּוּ': 'they-multiplied',
  'קָרוּ': 'they-happened',
  'שֵׁרְתוּ': 'they-served',
  // 2ms
  'צִוִּיתָנִי': 'you-commanded-me',
  // 2mp
  'חֲפַצְתֶּם': 'you(pl)-desired',
  'נְתַתֶּם': 'you(pl)-gave',
  'עֲשִׂיתָנוּ': 'you-made-us',
  // 1cs
  'שָׁלַחְתִּי': 'I-sent',
  'שָׂרַפְתִּי': 'I-burned',
  'נִשֵּׂאתִי': 'I-bore/married',
  'קָבַרְתִּי': 'I-buried',
  'הוֹרַדְתִּי': 'I-brought-down',
  // 1cp
  'שַׁבְנוּ': 'we-returned',
  'רַצְנוּ': 'we-ran',

  // ═══════════════════════════════════════
  // QAL IMPERFECT
  // ═══════════════════════════════════════
  'יָעִיד': 'he-shall-testify',
  'יַעֲבֹד': 'he-shall-serve',
  'יִתְקַבְּצוּ': 'they-shall-gather',
  'יִירָשֶׁנָּה': 'he-shall-inherit-it(f)',
  'יִטָּהֲרוּ': 'they-shall-be-purified',
  'יִטְעֲמוּ': 'they-shall-taste',
  'יִחְיוּ': 'they-shall-live',
  'יִגְמָלְךָ': 'he-shall-reward-you',
  'תִּכְלֶה': 'she/you-shall-consume',
  'תִתֵּן': 'you-shall-give',
  'תָּבֹאנָה': 'they(f)-shall-come',
  'תָּפְשׂוּ': 'you(pl)-shall-seize',
  'תַחְפְּצוּ': 'you(pl)-shall-desire',
  'תִסְבְּלוּ': 'you(pl)-shall-suffer',
  'תִּשְׁעִים': 'ninety',
  'תִּלָּקַחְנָה': 'they(f)-shall-be-taken',
  'תִּכְתֹּב׃': 'you-shall-write',
  'תִּכְתֹּב': 'you-shall-write',
  'תִּכְתְּבוּ': 'you(pl)-shall-write',
  'תִּכְעֲסוּ': 'you(pl)-shall-be-angry',
  'תִּבְשְׁלוּ': 'you(pl)-shall-cook',
  'תְגָרְשׁוּהוּ': 'you(pl)-shall-drive-him-out',
  'תְּקַבְּלוּהוּ': 'you(pl)-shall-receive-him',
  'תְּקַבֵּץ': 'she/you-shall-gather',
  'אֶשְׁכֹּן': 'I-shall-dwell',

  // ═══════════════════════════════════════
  // QAL IMPERATIVE
  // ═══════════════════════════════════════
  'שִׁמְרוּ': 'guard!/keep!',
  'תַטְבִּילוּ': 'baptize!',
  'תַּטְבִּילוּ': 'baptize!',
  'אַל־תִּדְאֲגוּ': 'do-not-worry!',

  // ═══════════════════════════════════════
  // QAL PARTICIPLE
  // ═══════════════════════════════════════
  'פֹּנֶה': 'turning',
  'זוֹעֲקִים': 'crying-out',
  'שׁוֹדֵד': 'robber',
  'שֹׁלֵחַ': 'sending',
  'שָׁבִים': 'returning',
  'עֹשֵׂי': 'doers-of',
  'הָרוֹצְחִים': 'the-murderers',
  'הַשָּׁבִים': 'the-returning',
  'הַמְּבַקֵּשׁ': 'the-one-seeking',
  'רוֹדְפִים': 'pursuing',
  'מוֹצָא': 'finding/source',
  'נוֹהֲגִים': 'leading',
  'עוֹף': 'bird/fowl',

  // ═══════════════════════════════════════
  // QAL INFINITIVE CONSTRUCT
  // ═══════════════════════════════════════
  'לִכְרֹעַ': 'to-bow',
  'לְקַוּוֹת': 'to-hope',
  'לְהִתְקַיֵּם': 'to-be-fulfilled',
  'לְהִתְקַיֵּם׃': 'to-be-fulfilled',
  'לַחֲלַקְלַקּוֹת': 'to-flattery',
  'לָעִיר': 'to-the-city',
  'לָאֲנָשִׁים': 'to-the-men',

  // ═══════════════════════════════════════
  // NIPHAL
  // ═══════════════════════════════════════
  'נִרְצַח': 'was-murdered',
  'נִשְׁלְמָה': 'was-fulfilled(f)',
  'נִקְבְּרוּ': 'were-buried',
  'נָפוֹץ': 'was-scattered',
  'שֻׁכְנְעוּ': 'were-convinced',
  'שֻׁחְרְרוּ': 'were-set-free',
  'תֻּכּוּ': 'were-smitten',
  'נִטְבָּל': 'was-baptized',
  'וְנִטְבָּל': 'and-was-baptized',

  // ═══════════════════════════════════════
  // HIPHIL
  // ═══════════════════════════════════════
  'הִשְׁחִיתוּ': 'they-destroyed',
  'הֵכִינוּ': 'they-prepared',
  'הֻשְׁלְכוּ': 'were-cast-out',
  'הוֹרַדְתִּי': 'I-brought-down',
  'וַיְרַחֵם': 'and-he-had-mercy',
  'וַיְבָרֵךְ': 'and-he-blessed',
  'לְהַשְׁחָתָה': 'to-destruction',
  'הַשְׁחָתָה': 'destruction',
  'הַשִּׁיבָה': 'the-restoration',

  // ═══════════════════════════════════════
  // VAYYIQTOL
  // ═══════════════════════════════════════
  'וַיַּשֵּׂג': 'and-he-overtook',
  'וַיִּתְנַבְּאוּ': 'and-they-prophesied',
  'וַיִּפֶן': 'and-he-turned',
  'וַיִּתְאַחֲדוּ': 'and-they-united',
  'וַיִּשְׂבָּעוּ': 'and-they-were-satisfied',
  'וַיִּרְעֲשׁוּ': 'and-they-trembled',
  'וַיִּמְרֹד': 'and-he-rebelled',
  'וַיִּלְכֹּד': 'and-he-captured',
  'וַיִּגַּע': 'and-he-touched',
  'וַיַּבִּיטוּ': 'and-they-looked',
  'וַיָּאֶר': 'and-it-shone',

  // ═══════════════════════════════════════
  // NOUNS WITH PRONOMINAL SUFFIXES
  // ═══════════════════════════════════════
  // 3ms
  'זִקְנָתוֹ': 'his-old-age',
  'מַטְמוֹנָיו': 'his-treasures',
  'כְּכַלֹּתוֹ': 'when-he-finished',
  'שִׂמְחָתוֹ': 'his-joy',
  'וְרֵעָיו': 'and-his-friends',
  'בְּאָבִיו': 'against-his-father',
  'וְאָבִיךָ': 'and-your-father',
  // 3fs
  'וְיוֹשְׁבֶיהָ': 'and-its-inhabitants',
  'כְּנָפֶיהָ': 'her-wings',
  'בְּשׁוּלֶה': 'in-her-skirt',
  'אֶת־אֶפְרוֹחֶיהָ': '[ACC]-her-chicks',
  // 3mp
  'וּמִשְׁפְּחוֹתֵיהֶם': 'and-their-families',
  'קְצָתָם': 'some-of-them',
  'מַטְמוֹנֵיהֶם': 'their-treasures',
  'וּבְרִיתוֹתֵיהֶם': 'and-their-covenants',
  'קְרוֹבֵיהֶם': 'their-relatives',
  'שְׂכָרָם': 'their-wages',
  'שְׂכָרָם׃': 'their-wages',
  'עָנְיָם': 'their-affliction',
  'צִדְקָתָם': 'their-righteousness',
  'חֻלְשָׁתָם': 'their-weakness',
  'אֶת־חֻלְשָׁתָם': '[ACC]-their-weakness',
  'אֶת־מִשְׁפְּטֵיהֶם': '[ACC]-their-judgments',
  // 2ms
  'רֹאשְׁךָ': 'your-head',
  'עָלַיִךְ': 'upon-you(f)',
  'מִקִּרְבֶּךָ': 'from-your-midst',
  // 2mp
  'מֵעַצְמְכֶם': 'from-yourselves',
  'עָנְיְכֶם': 'your(pl)-affliction',
  'עָשְׁרְכֶם': 'your(pl)-wealth',
  'וּרְכוּשְׁכֶם': 'and-your(pl)-possessions',
  'בְּדִבְרֵיכֶם': 'in-your(pl)-words',
  'אַרְצוֹתֵיכֶם': 'your(pl)-lands',
  // 1cs
  'חַסְדִּי': 'my-lovingkindness',
  'יְדִידִי': 'my-beloved',
  'קְהִלָּתִי': 'my-congregation',
  // 1cp
  'עָשְׁרֵנוּ': 'our-wealth',
  'מַסָּעֵנוּ': 'our-journey',

  // ═══════════════════════════════════════
  // STANDALONE NOUNS & ADJECTIVES
  // ═══════════════════════════════════════
  'אֹתוֹת': 'signs',
  'הָאֹתוֹת': 'the-signs',
  'וְהַמּוֹפְתִים': 'and-the-wonders',
  'וְהַבְּרָקִים': 'and-the-lightnings',
  'הַשְּׁטָפוֹת': 'the-floods',
  'הַגֶּשֶׁם': 'the-rain',
  'הָרָעָב': 'the-famine',
  'הֶרֶס': 'destruction',
  'הַסּוֹדִי': 'the-secret',
  'הַסּוֹדִיּוֹת': 'the-secret(fp)',
  'חֶרְפָּה': 'reproach',
  'כַּקְּעָרָה': 'as-a-dish',
  'תָּמָּה': 'amazement',
  'תַּרְנְגֹלֶת': 'hen',
  'שֶׁבִי': 'captivity',
  'רְשׁוּת': 'authority',
  'עֶצֶב': 'sorrow',
  'סְפִינוֹת': 'ships',
  'לַקְּהִלָּה': 'to-the-congregation',
  'לַפָּרֹכֶת': 'to-the-veil',
  'לַשּׁוֹדְדִים': 'to-the-robbers',
  'לַאֲחִי': 'to-my-brother',
  'אֲטוּמוֹת': 'sealed',
  'אֲבָל': 'but/however',
  'כְּאִישׁ': 'as-a-man',
  'מִקֶּרֶב': 'from-the-midst-of',
  'מֵאָבְדַן': 'from-destruction',
  'גִבּוֹרִים': 'mighty-men',
  'כָתוּב': 'written',
  'כְּלָל': 'general/altogether',
  'חֹזֶק': 'strength',
  'חֲדֹל': 'cease!',
  'בַּדָּרוֹם': 'in-the-south',
  'בְּסַכָּנַת': 'in-danger-of',
  'בַּתָּוֶךְ': 'in-the-midst',
  'בַּסָּתֶר': 'in-secret',
  'בַּכֵּלִים': 'in-the-vessels',
  'בַּחֲרוֹן': 'in-the-wrath-of',
  'בַּגָּלוּי': 'in-the-open',
  'בַּגָּלוּי׃': 'in-the-open',
  'בָּאֱמוּנָה': 'in-faith',
  'בֶאֱמוּנַת': 'in-the-faith-of',
  'בֶן': 'son',
  'בֵּאֵר': 'well/explained',
  'בְּרִשְׁעָה': 'in-wickedness',
  'בְּכֻלָּם': 'in-all-of-them',
  'בְּיָדָיו': 'in-his-hands',
  'עַל־הַצְּלָב': 'upon-the-cross',
  'אֶת־אֶצְבַּע': '[ACC]-finger',
  'אֶת־עֵמֶר': '[ACC]-Emer',
  'אֶת־מַמְלַכְתּוֹ': '[ACC]-his-kingdom',
  'אֶת־אִשְׁתּוֹ': '[ACC]-his-wife',
  'אֶת־הַקֵּיסָם': '[ACC]-the-beam',
  'אֶל־עַרְבוֹת': 'to-the-plains-of',
  'אֵימָה': 'terror',
  'אוֹצָרוֹת': 'storehouses',
  'אַהֲלַי': 'would-that',
  'וּמְקוֹמוֹת': 'and-places',
  'וּבַלַּיְלָה': 'and-in-the-night',
  'וּבֶצַע': 'and-greed',
  'וּמִמָּחֳרָת': 'and-from-the-morrow',
  'וּכְבוֹא': 'and-when-came',
  'וְאָמֵן': 'and-amen',
  'וְאָחִיו': 'and-his-brother',
  'וְשַׁעֲרֵי': 'and-gates-of',
  'וְנַעֲשָׂה': 'and-we-shall-do',
  'וְנַעֲשָׂה׃': 'and-we-shall-do',
  'וְלִשְׁתּוֹת': 'and-to-drink',
  'וְיָבוֹאוּ': 'and-they-shall-come',
  'וְהַנָּשִׁים': 'and-the-women',
  'וְהַלֹּא': 'and-is-it-not',
  'וּשְׁמַעְתֶּם': 'and-you(pl)-heard',
  'הַיֵּשׁ': 'is-there',
  'הֲרָגוֹ': 'his-slaying',
  'הַחֲמִשָּׁה': 'the-five',
  'שְׁמוֹנֶה': 'eight',
  'תֵּשַׁע': 'nine',
  'שְׁתַּיִם': 'two',
  'מִכְלָא': 'from-prison',
  'מִבַּעַד': 'through',
  'מִבְּשָׂרִי': 'from-my-flesh',
  'פָּחוֹת': 'less',
  'קִים': 'standing/existing',
  'קִבְּלוּנִי': 'they-received-me',
  'רְאִיָּה': 'evidence',
  'קוֹץ': 'thorn',
  'שׁוּר': 'wall',
  'רֵעֵי': 'friends-of',
  'פְּתוּחִים': 'open',
  'פְּצָעִים': 'wounds',
  'נִשְׁלְמָה': 'was-fulfilled(f)',

  // ═══════════════════════════════════════
  // MORE COMPOUND FORMS & PHRASES
  // ═══════════════════════════════════════
  'כִּרְאוֹתוֹ': 'when-he-saw',
  'מֵאָחִיו': 'from-his-brothers',
  'מִיָּמִין': 'from-the-right',
  'בְּחָרִיצוּת': 'with-diligence',
  'לְהוֹרִיד': 'to-bring-down',
  'לְהוֹשִׁיעָם': 'to-save-them',
  'מְקוֹמוֹת': 'places',
  'בָּאֲנָשִׁים': 'among-men',
  'מַחֲנֵה': 'camp-of',
  'מַחֲשָׁבוֹת': 'thoughts',
  'אֶת־צְבָאוֹ': '[ACC]-his-army',
  'אֶת־צְבָאוֹ׃': '[ACC]-his-army',
  'מִלְחֶמֶת': 'war-of',
  'מִלְחָמָה': 'war',
  'מִשְׁמֶרֶת': 'guard/watch',
  'הַצְלָחָה': 'success',
  'נִצָּחוֹן': 'victory',
  'מַצַּב': 'state',
  'רְדִיפָה': 'persecution',
  'עָוֶל': 'iniquity',
  'מָעוֹז': 'stronghold',
  'מָבוֹא': 'entrance',
  'בַּיִת': 'house',
  'מִבַּיִת': 'from-within',
  'פַּחַד': 'dread',
  'חׇכְמָה': 'wisdom',
  'חׇכְמָתוֹ': 'his-wisdom',
  'מְנוּחָה': 'rest',
  'בַּדְּרוֹר': 'in-liberty',
  'אֲפֵלָה': 'darkness',
  'אֳנִיּוֹת': 'ships',
  'עֲיֵפִים': 'weary',
  'אֲסוּרִים': 'prisoners',
  'מְרַגְּלִים': 'spies',
  'מְעֻנִּים': 'afflicted',
  'חֲמוּשִׁים': 'armed',
  'מַסְפִּיק': 'sufficient',
  'אֲמִתִּי': 'true',
  'אֵי': 'where',
  'אֵפוֹא': 'then',
  'אֲפִלּוּ': 'even',
  'נִפְלָא': 'wondrous',
  'נָתוּן': 'given',
  'נָחוּץ': 'necessary',
  'כֹהֲנִים': 'priests',
  'גְאֻלָּה': 'redemption',
  'תְּשׁוּבָה': 'repentance',
  'לַתְּשׁוּבָה': 'to-repentance',
  'וּמֵבִיא': 'and-brings',

  // Additional common forms from existing Alma dictionary
  'דִּבְרַת': 'the-order-of',
  'הַדִּבְרָה': 'the-manner',
  'מַה־זֹּאת': 'what-is-this',
  'מָתַי': 'when',
  'אֲדוֹת': 'concerning',
  'בְּגָלוּי': 'plainly',
  'כִּדְבָרוֹ': 'according-to-his-word',
  'כִּדְבָרוֹ׃': 'according-to-his-word',
  'כִּדְבַר': 'according-to-the-word-of',
  'כִּרְצוֹנָם': 'according-to-their-desires',
  'נוֹכַח': 'convinced',
  'לְכׇל': 'to-all',
  'וְכׇל': 'and-all',
  'בְּמִקְרָא': 'with-a-calling',
  'הַקְּדוֹשִׁים': 'the-holy',
  'הַצְּדָקָה': 'the-righteousness',
  'הָעֶלְיוֹן': 'the-Most-High',
  'הַנְּבוּאָה': 'prophecy',
  'הַנְּבוּאָה׃': 'prophecy',
  'שַׁרְשְׁרוֹת': 'chains',
  'לְשַׁחַת': 'to-destruction',
  'שָׁחַת': 'destruction',
  'שְׁאוֹל': 'Sheol',
  'אֵינוֹ': 'he-is-not',
  'אֵינָהּ': 'she/it-is-not',
  'אֵינִי': 'I-am-not',
  'אֵינְךָ': 'you-are-not',
  'הַאִם': 'whether',
  'מִמִּזְרַח': 'from-the-east',
  'הַמַּעֲרָב': 'the-west',
  'בַיָּמִים': 'in-the-days',
  'לִגְבוּלוֹת': 'to-the-borders-of',
  'לְבָאֵר': 'to-explain',
  'לְהִתְוַכֵּחַ': 'to-contend',
  'מִסּוֹדוֹתָיו': 'from-his-mysteries',
  'הֲכָנָה': 'preparation',
  'וּלְגָרְשֵׁנוּ': 'and-to-drive-us-out',
  'בַחֲרוֹנִי': 'in-my-wrath',
  'חֲרוֹנוֹ': 'his-wrath',
  'לְהִגָּאֵל': 'to-be-redeemed',
  'בּוּשָׁה': 'shame',
  'כְהֻנַּת־שֶׁקֶר': 'priestcraft',
  'הַכְּהֻנָּה': 'the-priesthood',
  'לִכְהֻנַּת': 'to-the-priesthood-of',
  'אֲחֻזָּה': 'possession',
  'לְאֵין־מָוֶת': 'to-immortality',
  'הֲרָגוֹ': 'his-slaying',
  'כְּמוֹת': 'as-the-death-of',
  'לַתּוֹרָה': 'to-the-law',
  'מִיִּרְאַת': 'because-of-fear-of',
  'אֶל־מִדְבַּר': 'to-the-wilderness',
  'אֶל־הַמִּדְבָּר': 'to-the-wilderness',
  'עַד־שְׁפֹּךְ': 'unto-the-shedding-of',
  'מִשְּׁפֹּךְ': 'from-shedding',
  'וּבְלִי־מְחִיר': 'and-without-price',
  'לַשֹּׁפְטִים': 'to-the-judges',
  'וְהַשֹּׁפֵט': 'and-the-judge',
  'הָרְצִיחוֹת': 'the-murders',
  'רְצִיחוֹתֵיהֶם': 'their-murders',
  'מְרִידוֹת': 'rebellions',
  'תּוֹסֶפֶת': 'addition',
  'דִּבְרַת': 'the-order-of',
  'בְּנָקֵל': 'easily',
};

// ═══════════════════════════════════════
// PREFIX STRIPPING FUNCTION
// ═══════════════════════════════════════
function tryPrefixes(w) {
  // וְ/וּ/וַ/וָ = "and-"
  let m = w.match(/^(וְ|וּ|וַ|וָ|וֶ)(.*)/);
  if (m) {
    let rest = m[2];
    if (glossMap[rest]) return 'and-' + glossMap[rest];
    let m2 = rest.match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'and-the-' + glossMap[m2[2]];
    let m3 = rest.match(/^(בְּ|בַּ|בִּ|בְ|לְ|לַ|לִ|מִ|מֵ|כְּ|כַּ)(.*)/);
    if (m3) {
      let p = /^[בב]/.test(m3[1]) ? 'in-' : /^[לל]/.test(m3[1]) ? 'to-' : /^[מ]/.test(m3[1]) ? 'from-' : 'as-';
      if (glossMap[m3[2]]) return 'and-' + p + glossMap[m3[2]];
    }
  }
  m = w.match(/^(בְּ|בַּ|בִּ|בָּ|בְ|בַ|בִ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'in-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'in-the-' + glossMap[m2[2]];
  }
  m = w.match(/^(לְ|לַ|לִ|לָ|לֶ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'to-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'to-the-' + glossMap[m2[2]];
  }
  m = w.match(/^(מִ|מֵ|מְ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'from-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'from-the-' + glossMap[m2[2]];
  }
  m = w.match(/^(כְּ|כַּ|כְ|כַ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'as-' + glossMap[m[2]];
  }
  m = w.match(/^(הַ|הָ)(.*)/);
  if (m && glossMap[m[2]]) return 'the-' + glossMap[m[2]];
  // אֶת prefix
  m = w.match(/^אֶת[־](.*)/);
  if (m && glossMap[m[1]]) return '[ACC]-' + glossMap[m[1]];

  return null;
}

// ═══════════════════════════════════════
// PROCESS EACH FILE
// ═══════════════════════════════════════
let totalFixed = 0;
let totalRemaining = 0;

files.forEach(file => {
  let data = fs.readFileSync(file, 'utf8');
  let fileFixed = 0;
  let fileTotal = 0;

  data = data.replace(/\["([^"]+)","(\?\?\?)"\]/g, function(match, hebrew) {
    fileTotal++;
    if (glossMap[hebrew]) { fileFixed++; return '["' + hebrew + '","' + glossMap[hebrew] + '"]'; }
    let clean = hebrew.replace(/׃$/, '');
    if (glossMap[clean]) { fileFixed++; return '["' + hebrew + '","' + glossMap[clean] + '"]'; }
    let gloss = tryPrefixes(clean);
    if (gloss) { fileFixed++; return '["' + hebrew + '","' + gloss + '"]'; }
    return match;
  });

  fs.writeFileSync(file, data, 'utf8');
  let remaining = (data.match(/"\?\?\?"/g) || []).length;
  console.log(`${path.basename(file)}: Fixed ${fileFixed} of ${fileTotal} ??? (remaining: ${remaining})`);
  totalFixed += fileFixed;
  totalRemaining += remaining;
});

console.log(`\nTotal: Fixed ${totalFixed}, Remaining: ${totalRemaining}`);
