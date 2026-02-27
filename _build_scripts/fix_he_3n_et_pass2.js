#!/usr/bin/env node
/**
 * fix_he_3n_et_pass2.js - Pass 2: Comprehensive morphological fix for Helaman, 3 Nephi, Ether
 * Greatly expanded dictionary + improved prefix/suffix/maqaf handling
 */
const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', '_chapter_data', 'he_data.js'),
  path.join(__dirname, '..', '_chapter_data', '3n_data.js'),
  path.join(__dirname, '..', '_chapter_data', 'et_data.js'),
];

// ═══════════════════════════════════════════════════════════════
// MASSIVE GLOSS DICTIONARY - organized by morphological category
// ═══════════════════════════════════════════════════════════════
const glossMap = {

  // ═══════════════════════════════════════
  // PROPER NOUNS
  // ═══════════════════════════════════════
  'עֲמוּלֵק': 'Amulek',
  'זֵעְזְרוֹם': 'Zeezrom',
  'עַמּוֹנִיהָה': 'Ammonihah',
  'נֶפִי': 'Nephi',
  'נֶפִים': 'Nephites',
  'לַמָּנִים': 'Lamanites',
  'גָדִיאַנְטוֹן': 'Gadianton',
  'סֵאַנְטוּם': 'Seantum',
  'סֵיזוֹרָם': 'Cezoram',
  'הֵילָמָן': 'Helaman',
  'זֵנוֹק': 'Zenock',
  'עֵזִיאָס': 'Ezias',
  'יִרְמְיָהוּ': 'Jeremiah',
  'יוּרַם': 'Joram',
  'מוֹרוֹנִיהָה': 'Moronihah',
  'שֵׁז': 'Shiz',
  'חֵת': 'Heth',
  'עֹמֶר': 'Omer',
  'עֵמֶר': 'Emer',
  'כּוֹרִיַנְטוּמְר': 'Coriantumr',
  'כּוֹרִיַנְטוּם': 'Coriantum',
  'כּוֹרִיַנְטוֹר': 'Coriantor',
  'רִפְלָקִישׁ': 'Riplakish',
  'קִיב': 'Kib',
  'שִׁבְלוֹם': 'Shiblom',
  'מוֹרִיַנְטוֹן': 'Morianton',
  'כּוֹהוֹר': 'Cohor',
  'אוֹרִיהָה': 'Orihah',
  'אָכִישׁ': 'Akish',
  'עֲמִינָדָב': 'Aminadab',
  'צֵזוֹרָם': 'Cezoram',
  'גִּלְגָּל': 'Gilgal',
  'גִדְגִדֹּנִי': 'Gidgiddoni',
  'לַכְמוֹנֵאוּס': 'Lachoneus',
  'גִדְיָנְחִי': 'Giddianhi',
  'טִימוֹתִי': 'Timothy',
  'בּוּנְטִיפוּל': 'Bountiful',
  'זֶמְנָרִיהָה': 'Zemnarihah',
  'שָׂמוּאֵל': 'Samuel',
  'לַמָּנִי': 'Lamanite',
  'יָרֶד': 'Jared',
  'יָרְדִי': 'Jaredite',
  'יָרְדִים': 'Jaredites',
  'מֹשֶׁה': 'Moses',
  'אַהֲרֹן': 'Aaron',
  'אָדָם': 'Adam',
  'חַוָּה': 'Eve',
  'אַבְרָהָם': 'Abraham',
  'יִצְחָק': 'Isaac',
  'יַעֲקֹב': 'Jacob',
  'יוֹסֵף': 'Joseph',
  'דָּוִד': 'David',
  'אֵלִיָּהוּ': 'Elijah',
  'יְשַׁעְיָהוּ': 'Isaiah',
  'צִידוֹן': 'Sidon',
  'זָרַחֶמְלָה': 'Zarahemla',
  'נְפִיחָה': 'Nephihah',
  'מַלְכִּיצֶדֶק': 'Melchizedek',
  'קַיִן': 'Cain',
  'לֶמֶךְ': 'Lemech',
  'שׂוּל': 'Shule',
  'עָהָה': 'Ahah',
  'מוֹרוֹן': 'Moron',
  'נִמְרוֹד': 'Nimrod',
  'עֵבֶר': 'Eber',
  'אֶתֶר': 'Ether',
  'פָּגָג': 'Pagag',

  // ═══════════════════════════════════════
  // QAL PERFECT - 3ms
  // ═══════════════════════════════════════
  'שָׁפַט': 'judged',
  'זָעַק': 'cried-out',
  'אָבַד': 'perished',
  'בָּנָה': 'built',
  'רָצָה': 'desired',
  'פָּנָה': 'turned',
  'מָרַד': 'rebelled',
  'פִּתָּה': 'enticed',
  'זָמַם': 'plotted',
  'מָשַׁךְ': 'drew/pulled',
  'הוֹלִיךְ': 'he-led',
  'הֵפִיץ': 'he-scattered',
  'פָּרַשׁ': 'he-spread',
  'תָּפַס': 'he-seized',
  'גֹּרַשׁ': 'was-driven-out',
  'כָּרַת': 'he-cut',

  // QAL PERFECT - 3fs
  'שָׁמְעָה': 'she-heard',
  'קָרְבָה': 'she-drew-near',
  'רָעֲשָׁה': 'it-quaked(f)',
  'חָרְבָה': 'it-was-desolate(f)',
  'נוֹדָעָה': 'was-known(f)',
  'נוֹסְדָה': 'was-founded(f)',
  'נִשְׁמְדָה': 'was-destroyed(f)',
  'נִשְׁבָּרָה': 'was-broken(f)',
  'שָׁבָה': 'she-returned',
  'אָחֲזָה': 'she-seized',
  'הִזִּיקָה': 'it-damaged(f)',
  'הוֹצִיאָהּ': 'he-brought-her-out',
  'הִגְבִּיהָה': 'she-raised-high',

  // QAL PERFECT - 3cp
  'כָּרְעוּ': 'they-bowed',
  'צָעֲקוּ': 'they-cried-out',
  'שָׁאֲלוּ': 'they-asked',
  'נֶהֶפְכוּ': 'they-were-overturned',
  'רַבּוּ': 'they-multiplied',
  'שֵׁרְתוּ': 'they-served',
  'זָכְרוּ': 'they-remembered',
  'הָמְמוּ': 'they-were-confused',
  'זָהֲרוּ': 'they-shone',
  'חָיוּ': 'they-lived',
  'רָצוּ': 'they-ran',
  'צָדוּ': 'they-hunted',
  'יָשְׁרוּ': 'they-were-upright',
  'הֵסֵבּוּ': 'they-turned',
  'הֶעֱשִׁירוּ': 'they-became-rich',
  'הוֹכִיחוּ': 'they-proved',
  'הֱבִישׁוּם': 'they-put-them-to-shame',

  // QAL PERFECT - 2ms
  'יָרֵאתָ': 'you-feared',
  'בִקַּשְׁתָּ': 'you-sought',
  'כָּרַתָּ': 'you-cut/made',
  'רָצַחְתָּ': 'you-murdered',

  // QAL PERFECT - 2mp
  'חֲפַצְתֶּם': 'you(pl)-desired',
  'נְתַתֶּם': 'you(pl)-gave',
  'שְׁלַחְתֶּם': 'you(pl)-sent',
  'הִכְעַסְתֶּם': 'you(pl)-angered',

  // QAL PERFECT - 1cs
  'שָׁלַחְתִּי': 'I-sent',
  'שָׂרַפְתִּי': 'I-burned',
  'קָבַרְתִּי': 'I-buried',
  'הוֹרַדְתִּי': 'I-brought-down',
  'הִסְכַּמְתִּי': 'I-agreed',

  // QAL PERFECT - 1cp
  'שַׁבְנוּ': 'we-returned',
  'רַצְנוּ': 'we-ran',
  'הִשְׁלַכְנוּ': 'we-cast-out',
  'נָפַלְנוּ': 'we-fell',

  // ═══════════════════════════════════════
  // QAL IMPERFECT
  // ═══════════════════════════════════════
  'יִבֹּל': 'it-shall-wither',
  'יִבְנוּ': 'they-shall-build',
  'יִסְבְּלוּ': 'they-shall-suffer',
  'יִפָּגַע': 'he-shall-be-struck',
  'יִתְנַשֵּׂא': 'he-shall-exalt-himself',
  'יַרְוִיחוּ': 'they-shall-profit',
  'יַטֵּנוּ': 'he-shall-turn-us',
  'יִרְעַד': 'he-shall-tremble',
  'תִּזְכּוּ': 'you(pl)-shall-remember',
  'תִתְפְּשׂוּ': 'you(pl)-shall-seize',
  'תִּרְצְחוּ': 'you(pl)-shall-murder',
  'תָּרִיבוּ': 'you(pl)-shall-contend',
  'תִמָּלֵא': 'it-shall-be-filled(f)',
  'תִשְׁאַל': 'you-shall-ask',
  'תִלָּקַחְנָה': 'they(f)-shall-be-taken',
  'תַנִּיחוּ': 'you(pl)-shall-leave',
  'תַּכְחִישׁוּ': 'you(pl)-shall-deny',
  'אֶשְׁפֹּךְ': 'I-shall-pour-out',
  'אֲבָרֶכְךָ': 'I-shall-bless-you',
  'יְפִיצְכֶם': 'he-shall-scatter-you(pl)',

  // ═══════════════════════════════════════
  // VAYYIQTOL (waw-consecutive imperfect)
  // ═══════════════════════════════════════
  'וַיִּזְכְּרוּ': 'and-they-remembered',
  'וַתִּרְעַשׁ': 'and-it-trembled(f)',
  'וַיַּחְדֹּר': 'and-it-penetrated',
  'וַיִּפְנוּ': 'and-they-turned',
  'וַתָּבֹא': 'and-she-came',
  'וַיּוּכְלוּ': 'and-they-were-able',
  'וַיִּתְנַבֵּא': 'and-he-prophesied',
  'וַיִּקְרְעוּ': 'and-they-tore',
  'וַיַּפְנוּ': 'and-they-turned',
  'וַיִּצְעֲקוּ': 'and-they-cried-out',
  'וַיָּרִימוּ': 'and-they-raised',
  'וַיִּשְׁכַּב': 'and-he-lay-down',
  'וַיִּתְקַבְּצוּ': 'and-they-gathered',
  'וַיִּרְמְסוּ': 'and-they-trampled',
  'וַיִּזְרְעוּ': 'and-they-sowed',
  'וַיְזַקְּקוּם': 'and-they-refined-them',
  'וַיַּתְעוּ': 'and-they-strayed',
  'וַיָּזֹם': 'and-he-plotted',
  'וַיִּתְבּוֹנֵן': 'and-he-considered',
  'וַיָּרִיבוּ': 'and-they-contended',
  'וַנִּשְׁתּוֹמֵם': 'and-we-were-astonished',
  'וַיִּרְעֲשׁוּ': 'and-they-trembled',
  'וַיְשָׁרְתוּם': 'and-they-served-them',
  'וַיַּזְהִירוּם': 'and-they-warned-them',
  'וַיִּסָּגְרוּ': 'and-they-were-shut-up',
  'וַיְבַלְּעוּם': 'and-they-swallowed-them',
  'וַיָּגֶל': 'and-he-rejoiced',
  'וַתָּשִׂימוּ': 'and-you-set',
  'וַיֻּכְרַח': 'and-he-was-forced',
  'וַעֲשִׂיתִיךָ': 'and-I-made-you',
  'וַיַּבִּיטוּ': 'and-they-looked',
  'וַיִּמְרֹד': 'and-he-rebelled',
  'וַיִּלְכֹּד': 'and-he-captured',
  'וַיִּגַּע': 'and-he-touched',
  'וַיָּאֶר': 'and-it-shone',

  // ═══════════════════════════════════════
  // NIPHAL
  // ═══════════════════════════════════════
  'נִלְאָה': 'was-weary',
  'נֶרְאָה': 'was-seen/appeared',
  'נִרְצָח': 'was-murdered',
  'נִדְקַר': 'was-pierced',
  'נִשְׁלְחוּ': 'were-sent',
  'נֶחְלְקוּ': 'they-were-divided',
  'נִשְׁלַחְתִּי': 'I-was-sent',

  // ═══════════════════════════════════════
  // HOPHAL
  // ═══════════════════════════════════════
  'הוּקְמוּ': 'they-were-established',
  'הוּסְתוּ': 'they-were-incited',
  'הוּמְרוּ': 'they-were-changed',
  'הֻקְּפוּ': 'they-were-surrounded',

  // ═══════════════════════════════════════
  // HIPHIL
  // ═══════════════════════════════════════
  'הִתְחַזֵּק': 'he-strengthened-himself',
  'הִצִּילוֹ': 'he-rescued-him',
  'הוֹדִיעָם': 'he-informed-them',
  'הִכְחִישׁ': 'he-denied',
  'הוֹדָה': 'he-confessed',
  'הִשְׁתַּחֲוָה': 'he-bowed-down',
  'הִשְׁתַּפֵּל': 'he-humbled-himself',

  // ═══════════════════════════════════════
  // HITHPAEL
  // ═══════════════════════════════════════
  'הִתְפַּשְּׁטוּ': 'they-spread-out',

  // ═══════════════════════════════════════
  // PARTICIPLES (active and passive)
  // ═══════════════════════════════════════
  'הַבּוֹחֲרִים': 'the-ones-choosing',
  'הַנּוֹתָרִים': 'the-remaining-ones',
  'הַמְּבִיאָה': 'the-one-bringing(f)',
  'מַגִּידִים': 'ones-declaring',
  'מַשְׂכִּילִים': 'wise-ones',
  'הַמַּרְעִישׁ': 'the-one-shaking',
  'שׁוֹפֵךְ': 'shedder',
  'צוֹבְרִים': 'ones-heaping-up',
  'מַרְשִׁיעִים': 'ones-condemning',
  'מַנִּיחִים': 'ones-leaving',
  'כּוֹעֲסִים': 'angry-ones',
  'שׁוֹכֵב': 'lying-down',
  'מְגַדֵּף': 'blasphemer',
  'הָרוֹעֶה': 'the-shepherd',
  'הָרוֹצֵחַ': 'the-murderer',
  'מַרְשִׁיעַ': 'condemning',
  'הַמְּנַגֵּד': 'the-one-opposing',
  'שׁוֹפְטִים': 'judges',
  'אֻמָּנִים': 'craftsmen',
  'מְרִיאִים': 'fattened-ones',
  'פּוֹרְשִׁים': 'dissenters',
  'אִלְּמִים': 'mute-ones',
  'אֲסוּרִים': 'prisoners',
  'הַמַּבִּיטִים': 'the-ones-looking',

  // ═══════════════════════════════════════
  // INFINITIVES (with ל prefix)
  // ═══════════════════════════════════════
  'לְהִשָּׁלֵט': 'to-rule',
  'לִמְשֹׁךְ': 'to-draw/pull',
  'לִפֹּל': 'to-fall',
  'לִתְמֹהַּ': 'to-be-amazed',
  'לִסְפֹּק': 'to-clap',
  'לְהָרֵעַ': 'to-do-evil',
  'לִגְנֹב': 'to-steal',
  'לִזְנוֹת': 'to-commit-whoredom',
  'לִשְׁלֹט': 'to-rule',
  'לִתְפֹּס': 'to-seize',
  'לִסְפֹּד': 'to-mourn',
  'לָצוּם': 'to-fast',
  'לַחְקֹר': 'to-investigate',
  'לְהָחֵל': 'to-begin',
  'לְיַלֵל': 'to-wail',
  'לְהִתְהַלֵּל': 'to-boast',
  'לְהַגִּיעַ': 'to-reach',
  'לְהַמְשִׁיךְ': 'to-continue',
  'לִגְאֳלָם': 'to-redeem-them',
  'לְהַשְׁחָתָם': 'to-destroy-them',
  'לַהֲרָגֵנוּ': 'to-kill-us',
  'לְהוֹשִׁיעָם': 'to-save-them',
  'לְהַנִּיחַ': 'to-leave/rest',
  'לִפְחֹת': 'to-decrease',
  'לִגְדֹּל': 'to-grow',
  'לִזְעֹק': 'to-cry-out',
  'לִמְכֹּר': 'to-sell',
  'לְהַרְוִיחַ': 'to-profit',
  'לִטֹּל': 'to-take',
  'לְהִתְחַבֵּר': 'to-join',
  'לַהֲרֹג': 'to-kill',
  'לְהַשְׁחָתָה': 'to-destruction',
  'לְשַׁעַר': 'to-estimate',
  'לְבַטְּאָהּ': 'to-express-it(f)',

  // ═══════════════════════════════════════
  // STANDALONE NOUNS
  // ═══════════════════════════════════════
  'אוֹצָר': 'treasure',
  'מוּסָד': 'foundation',
  'מוּסָּד': 'foundation',
  'דַּק': 'thin/fine',
  'לַחַשׁ': 'whisper',
  'בַד': 'linen',
  'דַם': 'blood',
  'חֲבוּרָה': 'band/group',
  'חֲבוּרַת': 'band-of',
  'חוֹמוֹת': 'walls',
  'מָסוֹרוֹת': 'traditions',
  'דְּרָשׁוֹת': 'inquiries',
  'עָפְרוֹת': 'ores',
  'מַתְכוֹת': 'metals',
  'סוֹדִיּוֹת': 'secret-things',
  'סוֹדִיִּים': 'secret(mp)',
  'מְרִידוֹת': 'rebellions',
  'זַעֲקַת': 'cry-of',
  'תּוֹרָתָם': 'their-law',
  'שָׁזוּר': 'intertwined',
  'גָבוֹהַּ': 'high/tall',
  'מְנֻגָּד': 'opposed',
  'קָשׁוּר': 'bound',
  'נִצְחִי': 'eternal',
  'אֵבֶל': 'mourning',
  'מִגְדָּל': 'tower',
  'הַשּׁוּק': 'the-market',
  'הַגָּן': 'the-garden',
  'הֶעָתִיד': 'the-future',
  'בֶגֶד': 'garment',
  'כֶּלֶא': 'prison',
  'עַמּוּד': 'pillar',
  'שְׁמוֹנַת': 'eight-of',
  'תִּמְהוֹן': 'amazement',
  'סַמְכוּת': 'authority',
  'שְׂרָפָה': 'burning',
  'קְבוּרָה': 'burial',
  'מְסִלָּה': 'highway',
  'כֶּפֶר': 'atonement/ransom',

  // ═══════════════════════════════════════
  // NOUNS WITH PRONOMINAL SUFFIXES
  // ═══════════════════════════════════════
  // 3ms
  'חִצָּיו': 'his-arrows',
  'סַעֲרוֹתָיו': 'his-storms',
  'רוּחוֹתָיו': 'his-spirits',
  'מוֹלַדְתּוֹ': 'his-birthplace',
  'חֲרוֹנוֹ': 'his-wrath',

  // 3fs
  'סְבִיבוֹתֶיהָ': 'its-surroundings(f)',

  // 3mp
  'חַטֹּאתֵיהֶם': 'their-sins',
  'עֲווֹנוֹתֵיהֶם': 'their-iniquities',
  'בְּרִיתוֹתֵיהֶם': 'their-covenants',
  'אוֹתוֹתֵיהֶם': 'their-signs',
  'שׁוֹדֵיהֶם': 'their-robbers',
  'גְנֵבוֹתֵיהֶם': 'their-thefts',
  'רְצִיחוֹתֵיהֶם': 'their-murders',
  'מְזִמּוֹתֵיהֶם': 'their-schemes',
  'אָלוֹתֵיהֶם': 'their-oaths',
  'מַחְשְׁבוֹתֵיהֶם': 'their-thoughts',
  'מַעֲרֻמֵּיהֶם': 'their-nakedness',
  'שְׁלָלֵיהֶם': 'their-spoils',
  'דַרְכֵיהֶם': 'their-ways',
  'רִצְחֵיהֶם': 'their-murders',
  'שְׂרָפָתַם': 'their-burning',
  'חָזְקָם': 'their-strength',
  'חֶלְקָם': 'their-portion',
  'קַלּוּתָם': 'their-lightness',
  'חֲטָאתֶם': 'their-sin',

  // 2ms
  'נַפְשְׁךָ': 'your-soul',

  // 2mp
  'שְׁמוֹתֵיכֶם': 'your(pl)-names',
  'מוּסַדְכֶם': 'your(pl)-foundation',
  'עֲוֹנוֹתֵיכֶם': 'your(pl)-iniquities',
  'עֲוֹנוֹתֵינוּ': 'our-iniquities',
  'פִּתְחֵיכֶם': 'your(pl)-doors',
  'שׁוֹפְטְכֶם': 'your(pl)-judge',
  'רְצִיחוֹתֵיכֶם': 'your(pl)-murders',
  'זְנוּתְכֶם': 'your(pl)-whoredoms',
  'רִשְׁעַתְכֶם': 'your(pl)-wickedness',
  'קָדְשְׁכֶם': 'your(pl)-holiness',
  'עָשְׁרֵי': 'riches-of',
  'חֲבוּרַתְכֶם': 'your(pl)-band',

  // 1cs
  'מַלְאָכַי': 'my-angels',
  'עֲבָדַי': 'my-servants',
  'עֲבָדָי': 'my-servants',
  'אֶבְלִי': 'my-mourning',
  'קִינָתִי': 'my-lamentation',
  'חַיַּי': 'my-life',
  'רְצוֹנִי': 'my-will',

  // 1cp
  'גּוֹאֲלֵנוּ': 'our-redeemer',
  'שׁוֹפְטֵנוּ': 'our-judge',
  'עָרֵינוּ': 'our-cities',
  'אֲחֻזָּתֵנוּ': 'our-possession',
  'תְּמִיהָתֵנוּ': 'our-amazement',
  'לִבֵּנוּ': 'our-heart',
  'יְדִיעָתֵנוּ': 'our-knowledge',

  // ═══════════════════════════════════════
  // ADJECTIVES
  // ═══════════════════════════════════════
  'נִצְחִית': 'eternal(f)',
  'הָעַזּוֹת': 'the-fierce(fp)',
  'הַנִּצְחִיִּים': 'the-eternal(mp)',
  'הַצְּנוּעִים': 'the-humble(mp)',
  'בְּנוּיִים': 'built(mp)',
  'בְּשֵׁלִים': 'ripe(mp)',

  // ═══════════════════════════════════════
  // ADVERBS / PARTICLES / PREPOSITIONS
  // ═══════════════════════════════════════
  'אָהּ': 'alas!',
  'לְיֵשׁ': 'to-existence',
  'בְּקָרוֹב': 'soon',

  // ═══════════════════════════════════════
  // NUMBERS
  // ═══════════════════════════════════════
  'שְׁמוֹנַת': 'eight-of',

  // ═══════════════════════════════════════
  // MISC VERBAL FORMS
  // ═══════════════════════════════════════
  'הָחֵל': 'beginning',
  'בֵּרְכָם': 'he-blessed-them',
  'קַבֶּצְכֶם': 'gathering-you(pl)',
  'יַצְהִיר': 'he-shall-declare',
  'נוֹכִיחַ': 'we-shall-prove',
  'יַכְשִׁילוּהוּ': 'they-shall-trip-him',
  'הֲשָׁבַת': 'have-you-ceased',
  'הֲרָצַחְתָּ': 'did-you-murder?',
  'הֲתָרִיבוּ': 'will-you-contend?',
  'הַיְדַעְתֶּם': 'did-you-know?',

  // ═══════════════════════════════════════
  // WAW-PREFIX FORMS (non-vayyiqtol)
  // ═══════════════════════════════════════
  'וְהִתְוַדּוּ': 'and-they-confessed',
  'וְנִטְבְּלוּ': 'and-they-were-baptized',
  'וְנוֹכְחוּ': 'and-they-were-convinced',
  'וְתָמְכוּ': 'and-they-supported',
  'וְצָפוּ': 'and-they-watched',
  'וְשָׂמְחוּ': 'and-they-rejoiced',
  'וְטָווּ': 'and-they-spun',
  'וּבָשְׁלוּ': 'and-they-cooked',
  'וְהַבַּקָּשָׁה': 'and-the-request',
  'וְהָאֲבַדּוֹן': 'and-the-destruction',
  'וְהַחוֹמוֹת': 'and-the-walls',
  'וְזֵעְזְרוֹם': 'and-Zeezrom',
  'וַעֲמוּלֵק': 'and-Amulek',
  'וּנֶפִי': 'and-Nephi',
  'וּנֶפִים': 'and-Nephites',
  'וְגָדִיאַנְטוֹן': 'and-Gadianton',
  'וּמְלֵאַת': 'and-full-of(f)',
  'וּמָסוֹרֶת': 'and-tradition',
  'וּרְשָׁעִים': 'and-wicked-ones',
  'וְהַשֶּׂה': 'and-the-lamb',
  'וּמַתָּן': 'and-a-gift',
  'וְעָפְרוֹת': 'and-ores',
  'וְשָׁלוֹם': 'and-peace',
  'וּלְמִלְחָמוֹת': 'and-to-wars',
  'וְלִשְׁפִיכוּת': 'and-to-shedding-of',
  'וְהַבּוֹזְזִים': 'and-the-plunderers',
  'וְרוֹצְחֵי': 'and-murderers-of',
  'וּבְאָלוֹתֵיהֶם': 'and-by-their-oaths',
  'וּלְשָׁמֵר': 'and-to-guard',
  'וְלִגְנֹב': 'and-to-steal',
  'וְלִזְנוֹת': 'and-to-commit-whoredom',
  'וְהַבְּרִיתוֹת': 'and-the-covenants',
  'וּלְגֵיהִנֹּם': 'and-to-Gehenna',
  'וְהָרֶצַח': 'and-the-murder',
  'וְאָלוֹתֵיהֶם': 'and-their-oaths',
  'וּמַחְשְׁבוֹת': 'and-thoughts',
  'וּמִכַּסְפָּם': 'and-from-their-silver',
  'וּלְקִינַת': 'and-to-lamentation-of',
  'וּבְתוֹעֵבוֹת': 'and-in-abominations',
  'וְלָלֶכֶת': 'and-to-walk',
  'וְקֹשִׁי': 'and-stubbornness',
  'וְנָכוֹן': 'and-correct/established',
  'וְלָעֲנָוִים': 'and-to-the-humble',
  'וּלְעוֹבְדֵי': 'and-to-the-servants-of',
  'וְהַסַּמְכוּת': 'and-the-authority',
  'וְלַהֲרֹג': 'and-to-kill',
  'וַיִּתְנַפַּח': 'and-he-swelled-up',
  'וְשָׂמַחְתִּי': 'and-I-rejoiced',
  'וּמְמַהֵר': 'and-hurrying',
  'וְהַבְלֵי': 'and-vanities-of',
  'וְתִשְׁדְדוּ': 'and-you(pl)-shall-rob',
  'וְתִגְנְבוּ': 'and-you(pl)-shall-steal',
  'וְתַעֲנוּ': 'and-you(pl)-shall-oppress',
  'וְתַעֲשׂוּ': 'and-you(pl)-shall-do',
  'וְיַרְבֶּה': 'and-he-shall-multiply',
  'וְתֻשְׁמְדוּ': 'and-you(pl)-shall-be-destroyed',
  'וְהִתְחַבַּרְתֶּם': 'and-you(pl)-joined',
  'וּמְבַקְשִׁים': 'and-seeking',
  'וְתִמְצְאוּ': 'and-you(pl)-shall-find',
  'וְיֶחֱוַר': 'and-he-shall-turn-pale',
  'וְהַחִוָּרוֹן': 'and-the-paleness',
  'וְיוֹדִיעַ': 'and-he-shall-inform',
  'וְיֵאָסֵר': 'and-he-shall-be-bound',
  'וְיוּבָא': 'and-he-shall-be-brought',
  'וְדָבָר': 'and-a-thing',
  'וְהוֹדֶה': 'and-he-confessed',
  'וְתוֹדֶה': 'and-you-shall-confess',
  'וְתַכֶּה': 'and-you-shall-strike',
  'וֶהְיֵה': 'and-be!',
  'וּמֵבִיא': 'and-bringing',
  'וְאִמְרוּ': 'and-say!',
  'וּמַעֲבִיר': 'and-one-who-transfers',
  'וְלִגְדֹּל': 'and-to-grow',
  'וּבַמִּשְׁפָּט': 'and-in-the-judgment',
  'וְכַּאֲשֶׁר': 'and-as/when',
  'וּמִיָּד': 'and-immediately',
  'וּבִתְחִלַּת': 'and-in-the-beginning-of',
  'וּבַד': 'and-linen',
  'וּמְרִיתֶם': 'and-you(pl)-rebelled',
  'וּבָאנוּ': 'and-we-came',
  'וּלְהַרְוִיחַ': 'and-to-profit',

  // ═══════════════════════════════════════
  // MAQAF COMPOUNDS (with ־)
  // ═══════════════════════════════════════
  'מִן־הַבּוֹחֲרִים': 'from-the-ones-choosing',
  'אֶת־שְׁמוֹתֵיכֶם': '[ACC]-your(pl)-names',
  'מַה־לְּבַקֵּשׁ': 'what-to-seek',
  'אִם־לִגְאֳלָם': 'if-to-redeem-them',
  'אֶת־מוּסַדְכֶם': '[ACC]-your(pl)-foundation',
  'אֶת־רוּחוֹתָיו': '[ACC]-his-spirits',
  'פֶּן־יִשָּׂרְפוּ': 'lest-they-be-burned',
  'אַל־תִּירָאוּ': 'do-not-fear!',
  'עַד־הַנֶּפֶשׁ': 'unto-the-soul',
  'אֶת־עֲבָדַי': '[ACC]-my-servants',
  'אֶת־עֲבָדָי': '[ACC]-my-servants',
  'עִם־מַלְאֲכֵי': 'with-angels-of',
  'כָל־הַדְּרָשׁוֹת': 'all-the-inquiries',
  'אֶת־מַעֲרֻמֵּיהֶם': '[ACC]-their-nakedness',
  'עַל־הֶעָתִיד': 'concerning-the-future',
  'מֵחֲבוּרַת': 'from-the-band-of',
  'עִם־חֲבוּרוֹת': 'with-bands',
  'עַל־רְצִיחוֹתֵיהֶם': 'concerning-their-murders',
  'בְּנִגּוּד': 'in-opposition',
  'לְחֻקֵּי': 'to-the-laws-of',
  'מֵהַשַּׁיָּכִים': 'from-those-belonging',
  'לַחֲבוּרָתָם': 'to-their-band',
  'הָאָלוֹת': 'the-oaths',
  'לְדֶרֶךְ': 'to-the-way-of',
  'מִן־הָרְשׁוּמוֹת': 'from-the-records',
  'עִם־קַיִן': 'with-Cain',
  'בֵּן־הֵילָמָן': 'son-of-Helaman',
  'עַל־כִּסְאוֹת': 'upon-seats',
  'עַל־כִּסְאוֹתָם': 'upon-their-seats',
  'אֶל־הַשּׁוּק': 'to-the-market',
  'עַל־מִגְדָּלִי': 'upon-my-towers',
  'אֶת־עֲוֹנוֹתֵיכֶם': '[ACC]-your(pl)-iniquities',
  'אֶת־עֲוֹנוֹתֵינוּ': '[ACC]-our-iniquities',
  'עַל־עָשְׁרֵי': 'concerning-riches-of',
  'כָל־הָעֲווֹנוֹת': 'all-the-iniquities',
  'מַה־יְּדַבֵּרוּ': 'what-they-shall-speak',
  'אֶת־הָעֲווֹנוֹת': '[ACC]-the-iniquities',
  'עַל־הַחֲמִשָּׁה': 'concerning-the-five',
  'בִּבְרִיתוֹתֵיהֶם': 'in-their-covenants',
  'בַּעֲווֹנוֹתֵיהֶם': 'in-their-iniquities',
  'מִזְּהָבָם': 'from-their-gold',
  'לְדַרְכֵיהֶם': 'to-their-ways',
  'בְּרִצְחֵיהֶם': 'in-their-murders',
  'כָל־הָאוֹתוֹת': 'all-the-signs',
  'אֶת־נְחַשׁ': '[ACC]-serpent',
  'כָל־הַמַּבִּיטִים': 'all-the-ones-looking',
  'כִּנְבוּאָתוֹ': 'according-to-his-prophecy',
  'עַל־פִּתְחֵיכֶם': 'upon-your(pl)-doors',
  'אֶת־סֵיזוֹרָם': '[ACC]-Cezoram',
  'אֶת־אָחִיךָ': '[ACC]-your-brother',
  'מַה־לֹּאמַר': 'what-to-say',
  'עַל־פָּנֶיךָ': 'upon-your-face',
  'אִם־בִּקַּשְׁתָּ': 'if-you-sought',
  'אֶת־מִצְוֺתָי': '[ACC]-my-commandments',
  'אֶת־רְצוֹנִי': '[ACC]-my-will',
  'אֶת־חַיַּי': '[ACC]-my-life',
  'בְּשִׁבְתָּם': 'in-their-sitting',

  // Additional preposition combinations
  'בַּחֹק': 'in-the-statute',
  'בַכֶּלֶא': 'in-the-prison',
  'בְּעַמּוּד': 'in-a-pillar',
  'בְּחוֹמוֹת': 'in-walls',
  'בִּידִידִי': 'in-my-beloved',
  'בְּגַנּוֹ': 'in-his-garden',
  'בְּצַעַר': 'in-sorrow',
  'בְּעָשְׁרֵי': 'in-riches-of',
  'בְּדַרְכְּכֶם': 'in-your(pl)-way',
  'בְּהִתְבּוֹנְנוֹ': 'in-his-considering',
  'בִּלְבָבוֹ': 'in-his-heart',
  'בַּקֶּשֶׁר': 'in-the-conspiracy',
  'בְּאַשְׁמָתְךָ': 'in-your-guilt',
  'בַּהֶסְכֵּם': 'in-the-agreement',
  'בַּקְּבוּרָה': 'at-the-burial',
  'בִּקְבוּרַת': 'at-the-burial-of',
  'בְּיוֹמוֹ': 'in-his-day',
  'בְּשֶׁקֶר': 'in-falsehood',
  'בְּבֶגֶד': 'in-a-garment',
  'בַּיַּבָּשָׁה': 'in-the-dry-land',
  'בְּרֵעֲכֶם': 'against-your-neighbors',
  'בְּרָעָה': 'in-evil',
  'בְקֶרֶב': 'in-the-midst-of',
  'בְּכֹפֶר': 'in-atonement',
  'בַחֲרוֹנִי': 'in-my-wrath',

  // מ prefix forms
  'מֵהַפּוֹרְשִׁים': 'from-the-dissenters',
  'מִיִּרְאָה': 'from-fear',
  'מִתִּמָּהוֹן': 'from-astonishment',
  'מִימוֹת': 'from-the-days-of',
  'מֵחֶלְקָם': 'from-their-portion',
  'מֵהָאַחֵר': 'from-the-other',
  'מִתְּחִלַּת': 'from-the-beginning-of',
  'מִתְּמִיהָתֵנוּ': 'from-our-amazement',
  'מִפִּשְׁתָּן': 'from-flax',
  'מִיָּמָיו': 'from-his-days',

  // ל prefix forms
  'לְתִמְהוֹן': 'to-amazement',
  'לְאוֹתוֹ': 'to-that',
  'לַעֲנַן': 'to-the-cloud',
  'לְתַחַת': 'to-beneath',
  'לְתְהוֹם': 'to-the-abyss',
  'לְפִתּוּיֵי': 'to-enticements-of',
  'לְאֻמְלָלוּת': 'to-wretchedness',
  'לַשָּׁבִים': 'to-those-returning',
  'לָאֲשֵׁמִים': 'to-the-guilty',
  'לָרְשָׁעִים': 'to-the-wicked',
  'לַכְּלָבִים': 'to-the-dogs',
  'לְחַיּוֹת': 'to-the-beasts-of',
  'לְעֹמֶק': 'to-the-depth',
  'לַשָּׁמָיִם': 'to-the-heavens',
  'לֶאֱמוּנָתוֹ': 'to-his-faithfulness',
  'לְדַרְכָּם': 'to-their-way',
  'לְהַשְׁחָתָה': 'to-destruction',

  // על prefix
  'עַל־עֲוֹנוֹתֵינוּ': 'concerning-our-iniquities',

  // כ prefix forms
  'כִּפְנֵי': 'as-the-face-of',
  'כִּמְדַבְּרִים': 'as-ones-speaking',
  'כִּלֶחִישָׁה': 'as-a-whisper',
  'כִּשְׁלֹשׁ': 'about-three',
  'כַּפֶּשַׁע': 'as-a-transgression',
  'כְּמִשְׁתּוֹמֵם': 'as-one-astonished',

  // ה prefix forms (article)
  'הָאוֹתוֹת': 'the-signs',
  'הַיִּרְאָה': 'the-fear',
  'הַיַּצִּיבָה': 'the-firm(f)',
  'הַמּוּעָדָה': 'the-appointed(f)',
  'הַמְּסִלָּה': 'the-highway',
  'הָאֵבֶל': 'the-mourning',
  'הַקְּבוּרָה': 'the-burial',
  'הַכְּסִילִים': 'the-fools',
  'הָעִוְרִים': 'the-blind',
  'הָעֹמֶדֶת': 'the-one-standing(f)',

  // ש prefix
  'שֶׁהֵעַדְתִּי': 'that-I-testified',
  'שֶׁעָשִׂיתִי': 'that-I-did',
  'שֶׁהֶרְאֵיתִי': 'that-I-showed',

  // Miscellaneous remaining
  'לְתִמְהוֹנָם': 'to-their-astonishment',
  'תְּנָאֵי': 'conditions-of',
  'בְּחִיר': 'chosen-one',
  'עֲרְלֵי': 'uncircumcised-of',
  'הַלֵּבָב': 'the-heart',
  'הָעֹרֶף': 'the-neck',
  'עַרְלֵי': 'uncircumcised-of',
  'קְשֵׁי': 'stiff-of',
  'לָזוּז': 'to-move',
  'לָהָר': 'to-the-mountain',
  'עֲבוּרָם': 'for-their-sake',
  'נוֹדָעָה': 'was-known(f)',
  'מְחוֹלֵל': 'creator/originator',
  'אֲחִיזָה': 'seizing',
  'עֲזַבְכֶם': 'your(pl)-forsaking',
  'רָעָדוּ': 'they-trembled',
  'בֵּאֲרוּ': 'they-explained',
  'נִשְׁלְמָה': 'was-fulfilled(f)',
  'הִנִּיחוּ': 'they-left/allowed',
  'לְבַקֵּשׁ': 'to-seek',
  'יִשָּׂרְפוּ': 'they-shall-be-burned',
  'תִּירָאוּ': 'you(pl)-shall-fear',
  'תֻּשְׁמְדוּ': 'you(pl)-shall-be-destroyed',
  'יִתָּפֵשׂ': 'he-shall-be-seized',
  'תִּבְדְקוּ': 'you(pl)-shall-examine',
  'תַתִּיר': 'you-shall-release',
  'יִקָּרַע': 'it-shall-be-torn',
  'וּלְחַיּוֹת': 'and-to-beasts-of',
  'עַד־לְהַשְׁחָתָה': 'unto-destruction',
  'לְמוֹרוֹנִיהָה': 'to-Moronihah',
  'בְּמוֹרוֹנִיהָה': 'in-Moronihah',
  'לְגָדִיאַנְטוֹן': 'to-Gadianton',
  'בַּחֲבוּרַת': 'in-the-band-of',
  'פֶּן־יִצְעֲקוּ': 'lest-they-cry-out',
  'נֶהֱרָג': 'was-killed',
  'וּבִפְעֻלּוֹת': 'and-in-the-deeds-of',
  'לְצַעַר': 'to-sorrow',
  'בְּלִי־לְאוּת': 'without-weariness',
  'וּלְהִתְחַבֵּר': 'and-to-join',
  'הַאִם': 'whether',
  'אֵי': 'where',
  'עֶדְרֵי': 'flocks-of',
  'מַקְשִׁיבִים': 'ones-listening',
  'תִבְשְׁלוּ': 'you(pl)-shall-cook',
  'אוֹיְבֵיכֶם': 'your(pl)-enemies',
  'בִּשְׁתֵּי': 'in-two',

  // More maqaf forms
  'אֶל־זֵעְזְרוֹם': 'to-Zeezrom',
  'מֵעָלֵינוּ': 'from-upon-us',
  'וּגְנֵבוֹתֵיהֶם': 'and-their-thefts',
  'יָרְדִית': 'Jaredite(f)',

  // More construct forms
  'דִּבְרַת': 'the-order-of',
  'מִלְחֶמֶת': 'war-of',
  'מַחֲנֵה': 'camp-of',
};

// ═══════════════════════════════════════
// IMPROVED PREFIX STRIPPING
// ═══════════════════════════════════════
function tryPrefixes(w) {
  // Strip sof pasuk first
  let clean = w.replace(/׃$/, '');
  if (glossMap[clean]) return glossMap[clean];

  // וְ/וּ/וַ/וָ = "and-"
  let m = clean.match(/^(וְ|וּ|וַ|וָ|וֶ)(.*)/);
  if (m) {
    let rest = m[2];
    if (glossMap[rest]) return 'and-' + glossMap[rest];
    // and-the-
    let m2 = rest.match(/^(הַ|הָ|הֶ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'and-the-' + glossMap[m2[2]];
    // and-in-/to-/from-/as-
    let m3 = rest.match(/^(בְּ|בַּ|בִּ|בְ|בַ|בָּ)(.*)/);
    if (m3) {
      if (glossMap[m3[2]]) return 'and-in-' + glossMap[m3[2]];
      let m4 = m3[2].match(/^(הַ|הָ)(.*)/);
      if (m4 && glossMap[m4[2]]) return 'and-in-the-' + glossMap[m4[2]];
    }
    m3 = rest.match(/^(לְ|לַ|לִ|לָ|לֶ)(.*)/);
    if (m3) {
      if (glossMap[m3[2]]) return 'and-to-' + glossMap[m3[2]];
      let m4 = m3[2].match(/^(הַ|הָ)(.*)/);
      if (m4 && glossMap[m4[2]]) return 'and-to-the-' + glossMap[m4[2]];
    }
    m3 = rest.match(/^(מִ|מֵ|מְ)(.*)/);
    if (m3) {
      if (glossMap[m3[2]]) return 'and-from-' + glossMap[m3[2]];
      let m4 = m3[2].match(/^(הַ|הָ)(.*)/);
      if (m4 && glossMap[m4[2]]) return 'and-from-the-' + glossMap[m4[2]];
    }
    m3 = rest.match(/^(כְּ|כַּ|כְ|כַ)(.*)/);
    if (m3 && glossMap[m3[2]]) return 'and-as-' + glossMap[m3[2]];
  }

  // בְּ/בַּ = "in-"
  m = clean.match(/^(בְּ|בַּ|בִּ|בָּ|בְ|בַ|בִ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'in-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'in-the-' + glossMap[m2[2]];
  }

  // לְ/לַ = "to-"
  m = clean.match(/^(לְ|לַ|לִ|לָ|לֶ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'to-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'to-the-' + glossMap[m2[2]];
  }

  // מִ/מֵ = "from-"
  m = clean.match(/^(מִ|מֵ|מְ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'from-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'from-the-' + glossMap[m2[2]];
  }

  // כְּ/כַּ = "as-"
  m = clean.match(/^(כְּ|כַּ|כְ|כַ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'as-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'as-the-' + glossMap[m2[2]];
  }

  // הַ/הָ = "the-"
  m = clean.match(/^(הַ|הָ|הֶ)(.*)/);
  if (m && glossMap[m[2]]) return 'the-' + glossMap[m[2]];

  // שֶׁ = "that-"
  m = clean.match(/^(שֶׁ|שֶ)(.*)/);
  if (m && glossMap[m[2]]) return 'that-' + glossMap[m[2]];

  // אֶת־ = "[ACC]-"
  m = clean.match(/^אֶת[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return '[ACC]-' + glossMap[m[1]];
    // Try further prefix on what follows אֶת
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return '[ACC]-the-' + glossMap[m2[2]];
  }

  // אֶל־ = "to-"
  m = clean.match(/^אֶל[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'to-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'to-the-' + glossMap[m2[2]];
  }

  // עַל־ = "upon-/concerning-"
  m = clean.match(/^עַל[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'upon-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'upon-the-' + glossMap[m2[2]];
  }

  // עִם־ = "with-"
  m = clean.match(/^עִם[־](.*)/);
  if (m && glossMap[m[1]]) return 'with-' + glossMap[m[1]];

  // מִן־ = "from-"
  m = clean.match(/^מִן[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'from-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'from-the-' + glossMap[m2[2]];
  }

  // כָל־ = "all-"
  m = clean.match(/^כָל[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'all-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'all-the-' + glossMap[m2[2]];
  }

  // אִם־ = "if-"
  m = clean.match(/^אִם[־](.*)/);
  if (m && glossMap[m[1]]) return 'if-' + glossMap[m[1]];

  // פֶּן־ = "lest-"
  m = clean.match(/^פֶּן[־](.*)/);
  if (m && glossMap[m[1]]) return 'lest-' + glossMap[m[1]];

  // אַל־ = "do-not-"
  m = clean.match(/^אַל[־](.*)/);
  if (m && glossMap[m[1]]) return 'do-not-' + glossMap[m[1]];

  // מַה־ = "what-"
  m = clean.match(/^מַה[־](.*)/);
  if (m && glossMap[m[1]]) return 'what-' + glossMap[m[1]];

  // עַד־ = "unto-"
  m = clean.match(/^עַד[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'unto-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'unto-the-' + glossMap[m2[2]];
  }

  // בֵּן־ / בֶּן־ = "son-of-"
  m = clean.match(/^בֵּן[־](.*)/);
  if (m && glossMap[m[1]]) return 'son-of-' + glossMap[m[1]];
  m = clean.match(/^בֶּן[־](.*)/);
  if (m && glossMap[m[1]]) return 'son-of-' + glossMap[m[1]];

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
    // Direct lookup
    if (glossMap[hebrew]) { fileFixed++; return '["' + hebrew + '","' + glossMap[hebrew] + '"]'; }
    // Strip sof pasuk
    let clean = hebrew.replace(/׃$/, '');
    if (glossMap[clean]) { fileFixed++; return '["' + hebrew + '","' + glossMap[clean] + '"]'; }
    // Try prefix analysis
    let gloss = tryPrefixes(hebrew);
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
