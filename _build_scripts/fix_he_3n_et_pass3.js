#!/usr/bin/env node
/**
 * fix_he_3n_et_pass3.js - Pass 3: Target 3 Nephi & Ether specific vocabulary
 * Genealogies, military terms, ship-building, political vocabulary
 */
const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', '_chapter_data', 'he_data.js'),
  path.join(__dirname, '..', '_chapter_data', '3n_data.js'),
  path.join(__dirname, '..', '_chapter_data', 'et_data.js'),
];

const glossMap = {

  // ═══════════════════════════════════════
  // ETHER PROPER NOUNS (genealogy)
  // ═══════════════════════════════════════
  'הֶלָמָן': 'Helaman',
  'אֶתֶם': 'Ethem',
  'אָחַח': 'Ahah',
  'שֵׁת': 'Seth',
  'שִׁבְלוֹן': 'Shiblon',
  'כוֹם': 'Com',
  'עַמְנִיגַדָּה': 'Amnigaddah',
  'הֶאַרְתוֹם': 'Hearthom',
  'לִיב': 'Lib',
  'קִישׁ': 'Kish',
  'כּוֹרוֹם': 'Corom',
  'לֵוִי': 'Levi',
  'קִים': 'Kim',
  'שׁוּלֶה': 'Shule',
  'אֶמֶר': 'Emer',
  'מוֹרִיאַנְקוּמֶר': 'Moriancumer',
  'דֶּסֶרֶת': 'Deseret',
  'שֶׁלֶם': 'Shelem',
  'פָּגָג': 'Pagag',

  // Ether genealogy construct forms: בֶן-X
  'בֶן־מוֹרוֹן': 'son-of-Moron',
  'בֶן־אֶתֶם': 'son-of-Ethem',
  'בֶן־אָחַח': 'son-of-Ahah',
  'בֶן־שֵׁת': 'son-of-Seth',
  'בֶן־שִׁבְלוֹן': 'son-of-Shiblon',
  'בֶן־כוֹם': 'son-of-Com',
  'בֶן־כּוֹרִיַנְטוּם': 'son-of-Coriantum',
  'בֶן־עַמְנִיגַדָּה': 'son-of-Amnigaddah',
  'בֶן־אַהֲרֹן': 'son-of-Aaron',
  'בֶן־הֶאַרְתוֹם': 'son-of-Hearthom',
  'בֶן־לִיב': 'son-of-Lib',
  'בֶן־קִישׁ': 'son-of-Kish',
  'בֶן־כּוֹרוֹם': 'son-of-Corom',
  'בֶן־לֵוִי': 'son-of-Levi',
  'בֶן־קִים': 'son-of-Kim',
  'בֶן־מוֹרִיַנְטוֹן': 'son-of-Morianton',
  'בֶן־שֵׁז': 'son-of-Shiz',
  'בֶן־חֵת': 'son-of-Heth',
  'בֶן־אֶמֶר': 'son-of-Emer',
  'בֶן־עֹמֶר': 'son-of-Omer',
  'בֶן־שׁוּלֶה': 'son-of-Shule',
  'בֶן־קִיב': 'son-of-Kib',
  'בֶן־אוֹרִיהָה': 'son-of-Orihah',
  'בֶן־יָרֶד': 'son-of-Jared',

  // And-X forms for genealogy
  'וְאֶתֶם': 'and-Ethem',
  'וְאָחַח': 'and-Ahah',
  'וְשֵׁת': 'and-Seth',
  'וְשִׁבְלוֹן': 'and-Shiblon',
  'וְכוֹרִיַנְטוּם': 'and-Coriantum',
  'וְעַמְנִיגַדָּה': 'and-Amnigaddah',
  'וְהֶאַרְתוֹם': 'and-Hearthom',
  'וְלִיב': 'and-Lib',
  'וְקִישׁ': 'and-Kish',
  'וְכּוֹרוֹם': 'and-Corom',
  'וְלֵוִי': 'and-Levi',
  'וְשׁוּלֶה': 'and-Shule',
  'וְיֶרֶד': 'and-Jared',
  'וַאֲחִי': 'and-the-brother-of',

  // ═══════════════════════════════════════
  // SHIP / VESSEL VOCABULARY (Ether)
  // ═══════════════════════════════════════
  'סְפִינוֹת': 'ships',
  'הַסְּפִינוֹת': 'the-ships',
  'הַכֵּלִים': 'the-vessels',
  'כֵּלִים': 'vessels',
  'חֹר': 'hole',
  'הַחֹר': 'the-hole',
  'חַלּוֹנוֹת': 'windows',
  'מַבּוּל': 'flood',
  'הַמַּבּוּלִים': 'the-floods',
  'בַּמַּבּוּלִים': 'in-the-floods',
  'הַמָּסָךְ': 'the-veil/screen',
  'גַלֵּי': 'waves-of',
  'דַלְתָּן': 'their-door',
  'וְדַלְתָּן': 'and-their-door',
  'דָפְנֵיהֶן': 'their-sides',
  'וְדָפְנֵיהֶן': 'and-their-sides',
  'קְצוֹתֵיהֶן': 'their-ends',
  'וְקְצוֹתֵיהֶן': 'and-their-ends',
  'מְחֻדָּדוֹת': 'pointed',
  'רֹאשָׁן': 'their-top',
  'וְרֹאשָׁן': 'and-their-top',
  'אָטוּם': 'sealed',
  'אֲטוּמָה': 'sealed(f)',
  'אָרְכָּן': 'their-length',
  'וְאָרְכָּן': 'and-their-length',
  'תַחְתִּיתָן': 'their-bottom',
  'וְתַחְתִּיתָן': 'and-their-bottom',
  'בָּרֹאשׁ': 'at-the-top',
  'בַּתַּחְתִּית': 'at-the-bottom',
  'אֲוִיר': 'air',
  'הָאֲוִיר': 'the-air',
  'בְּתוֹכָן': 'inside-them(f)',
  'גָּבְהוֹ': 'its-height',
  'כְּאֹרֶךְ': 'as-the-length-of',
  'בָהֶן': 'in-them(f)',
  'מוּדְרָכִים': 'guided',
  'כַּתַּנִּין': 'like-a-whale',
  'נִגְוַע': 'we-shall-perish',
  'לִנְשֹׁם': 'to-breathe',
  'נַנְהִיג': 'we-shall-steer',
  'הוֹרֵיתָנִי': 'you-instructed-me',
  'הֲכִינוֹתִי': 'I-prepared',
  'הֲתִתֵּן': 'will-you-give',
  'הֲכִינוֹנוּ': 'we-prepared',
  'נַעֲבֹר': 'we-shall-cross',
  'תַחְפֹּץ': 'you-shall-desire',
  'נִגְוָע': 'we-shall-perish',

  // Stone/light vocabulary
  'אֲבָנִים': 'stones',
  'בָאֲבָנִים': 'with-stones',
  'אֶצְבָּעוֹ': 'his-finger',
  'בְּאֶצְבָּעוֹ': 'with-his-finger',
  'בְּאֶצְבָּעֲךָ': 'with-your-finger',
  'כְּאֶצְבַּע': 'like-a-finger',
  'כְּבָשָׂר': 'like-flesh',
  'כִּזְכוּכִית': 'like-glass',
  'זַכָּה': 'pure/clear',
  'יָאִירוּ': 'they-shall-shine',
  'וְיָאִירוּ': 'and-they-shall-shine',
  'וַהֲכִינֵם': 'and-prepare-them',
  'לְבָנוֹת': 'white/clear',
  'וּבָרוֹת': 'and-clear/pure',
  'וַיִּשָּׂאֵן': 'and-he-carried-them',
  'וַיּוּסַר': 'and-it-was-removed',

  // ═══════════════════════════════════════
  // MILITARY / POLITICAL (3 Nephi)
  // ═══════════════════════════════════════
  'הַקְּרָב': 'the-battle',
  'צְבָאוֹת': 'armies/hosts',
  'הַצְּבָאוֹת': 'the-armies',
  'צְבָאוֹתַי': 'my-armies',
  'צְבָאוֹתֵיהֶם': 'their-armies',
  'מִלְחֲמוֹתָם': 'their-wars',
  'הַנִּצָּבִים': 'the-ones-standing',
  'מִנְהַג': 'custom/manner',
  'הַמְפַקֵּד': 'the-commander',
  'שָׂרֵי': 'captains-of',
  'לְשָׂרֵי': 'to-the-captains-of',
  'לְמַנּוֹת': 'to-appoint',
  'לְפַקֵּד': 'to-command/appoint',
  'נִתְמַנָּה': 'was-appointed',
  'מִשְׁמָר': 'guard/watch',
  'לְמִשְׁמָר': 'for-a-guard',
  'מַטְבִּילִים': 'ones-baptizing',
  'חוֹתֵם': 'seal',

  // Gadianton/rebel vocabulary
  'הַסּוֹרְרִים': 'the-rebels',
  'מִסּוֹרְרֵי': 'from-rebels-of',
  'בַּסּוֹרְרִים': 'among-the-rebels',
  'מֵהַסּוֹרְרִים': 'from-the-rebels',
  'הַסֵּתֶר': 'the-hiding',
  'הַכּוֹפְרִים': 'the-deniers',
  'טֶבַח': 'slaughter',
  'הַחֶבְרָה': 'the-society/band',
  'תְּבִיעוֹת': 'demands',
  'אִיּוּמֵי': 'threats-of',
  'וְאִיּוּמֵי': 'and-threats-of',
  'עַזּוּת': 'boldness',

  // ═══════════════════════════════════════
  // 3 NEPHI VAYYIQTOL
  // ═══════════════════════════════════════
  'וַיִּפְקֹד': 'and-he-appointed',
  'וַיִּקְבְּעוּ': 'and-they-fixed/established',
  'וַיִּתְעַצֵּב': 'and-he-was-grieved',
  'וַיִּתְקַיְּמוּ': 'and-they-were-fulfilled',
  'וַתִּזְרַח': 'and-it-rose(f)',
  'וַיַּתְעֵם': 'and-he-led-them-astray',
  'וַיַּחֲרִיבוּ': 'and-they-destroyed',
  'וַיָּפִיצוּ': 'and-they-scattered',
  'וַיֵּאָלְצוּ': 'and-they-were-forced',
  'וַיִּמָּנוּ': 'and-they-were-counted',
  'וַתּוּסַר': 'and-it-was-removed(f)',
  'וַתִּקְשֶׁה': 'and-it-was-hard(f)',
  'וַיִּשְׁתּוֹמֵם': 'and-he-was-astonished',
  'וַיְמַנֶּה': 'and-he-appointed',
  'וַיֻּתְעוּ': 'and-they-were-led-astray',
  'וַיִּתְהַלֵּךְ': 'and-he-walked-about',
  'וַיָּכִינוּ': 'and-they-prepared',

  // Helaman vayyiqtol
  'וַתִּרְבֶּה': 'and-it-increased(f)',
  'וַתֵּלֶךְ': 'and-she-went',
  'וַיִּמְשֹׁךְ': 'and-he-drew/continued',
  'וַתִּשְׁבֹּת': 'and-it-ceased(f)',
  'וַתִּיבַשׁ': 'and-it-dried-up(f)',
  'וַתֻּכַּה': 'and-it-was-struck(f)',
  'וַיִּתְעַנּוּ': 'and-they-fasted',
  'וַיְבַעֲרוּ': 'and-they-burned',
  'וַיַּטְמִינוּ': 'and-they-hid',
  'וַיָּשֶׁב': 'and-he-returned',
  'וַיּוֹרֶד': 'and-he-brought-down',
  'וַתִּתֵּן': 'and-she-gave',
  'וַיְפָאֲרוּ': 'and-they-glorified',
  'וַתִּפְרֹץ': 'and-it-spread(f)',
  'וַיּוּסְתוּ': 'and-they-were-incited',
  'וַיָּחֵלוּ': 'and-they-began',
  'וַיִּרְצְחוּ': 'and-they-murdered',
  'וַיָּבֹזּוּ': 'and-they-plundered',
  'וַיִּתְחַבְּאוּ': 'and-they-hid',
  'וַיָּתַךְ': 'and-he-melted',
  'וַיּוֹכִיחֵהוּ': 'and-he-rebuked-him',

  // ═══════════════════════════════════════
  // QAL PERFECT (more forms)
  // ═══════════════════════════════════════
  'הִתְקַיְּמוּ': 'they-were-fulfilled',
  'צָפוּ': 'they-watched',
  'גֵּרְשׁוּם': 'they-drove-out',
  'פָּרְשׁוּ': 'they-dissented',
  'עֻנּוּ': 'they-were-afflicted',
  'בִּקְּשׁוּ': 'they-sought',
  'כִסּוּ': 'they-covered',
  'הִשְׁבִּיתוּ': 'they-ceased',
  'הִסָּגְרוּ': 'they-shut-themselves',
  'עֻוְּתוּ': 'they-were-perverted',
  'הֵרֵעוּ': 'they-did-evil',
  'תּוּמְכוּ': 'they-supported',
  'הֻשְׁמָדוּ': 'they-were-destroyed',
  'דֻּבָּרוּ': 'they-were-spoken',
  'גִּדְּפוּ': 'they-blasphemed',
  'נִלְקַח': 'was-taken',
  'הֻכְּתָה': 'was-struck(f)',
  'קָשְׁתָה': 'it-was-hard(f)',
  'נִבְלְלוּ': 'they-were-confounded',
  'הוּפְרָה': 'was-broken(f)',
  'בָלַל': 'he-confused',
  'נִבְעַת': 'he-was-terrified',
  'נָפָלְתָּ': 'you-fell',
  'הִשְׁמַדְתָּ': 'you-destroyed',
  'הִשְׁמַעְתִּי': 'I-proclaimed',
  'הוֹדַעְתִּי': 'I-made-known',
  'הוֹדַע': 'he-made-known',

  // ═══════════════════════════════════════
  // QAL IMPERFECT (more forms)
  // ═══════════════════════════════════════
  'יִתְקַיְּמוּ': 'they-shall-be-fulfilled',
  'יִוָּלֵד': 'he-shall-be-born',
  'יִפְקְדוּ': 'they-shall-visit',
  'יָסוֹגוּ': 'they-shall-retreat',
  'יִבְלֹל': 'he-shall-confuse',
  'יִמְצָאֵם': 'he-shall-find-them',
  'יִבְשְׁלוּ': 'they-shall-cook',
  'יִתְמַלֵּא': 'it-shall-be-filled',
  'יִשְׁטְפוּ': 'they-shall-wash-over',
  'יַחְזִיקוּ': 'they-shall-hold',
  'יָחוּסוּ': 'they-shall-spare',
  'יַחְשְׂכוּ': 'they-shall-be-dark',
  'יָשִׁיבוּ': 'they-shall-return',
  'יְגָרְשֵׁנוּ': 'he-shall-drive-us-out',
  'יוֹבִילֵנוּ': 'he-shall-lead-us',
  'יִצְרֵנוּ': 'he-shall-preserve-us',
  'יְפִיצֵם': 'he-shall-scatter-them',
  'תִּפְתַּח': 'you-shall-open',
  'תִּסְתֹּם': 'you-shall-seal',
  'תִגְוְעוּ': 'you(pl)-shall-perish',
  'תַמְשִׁיכוּ': 'you(pl)-shall-continue',
  'תְנֻצַּח': 'it-shall-be-conquered',
  'תִנָּצְלוּ': 'you(pl)-shall-be-delivered',
  'אַעֲלֶה': 'I-shall-raise',
  'אֲכִין': 'I-shall-prepare',
  'אַמְשִׁיךְ': 'I-shall-continue',
  'אֶנְקֹם': 'I-shall-avenge',
  'אֶפָּגֵשׁ': 'I-shall-meet',
  'נָבִין': 'we-shall-understand',
  'תָּשִׁיב': 'you-shall-return',
  'הֲתָשִׁיב': 'will-you-return',
  'תִּשְׁבֹּת': 'it-shall-cease',
  'תַּקְשִׁיב': 'you-shall-listen',
  'תִּתֵּן': 'you-shall-give',

  // ═══════════════════════════════════════
  // IMPERATIVES
  // ═══════════════════════════════════════
  'שָׂא': 'lift-up!',
  'רְדוּ': 'go-down!',
  'הָשֵׁב': 'return!/restore!',
  'וּבְנֵה': 'and-build!',

  // ═══════════════════════════════════════
  // MORE PARTICIPLES
  // ═══════════════════════════════════════
  'הָעֹמְדִים': 'the-ones-standing',
  'הַכּוֹתֵב': 'the-one-writing',
  'הַהֹלְכִים': 'the-ones-going',
  'וְהַהֹלְכִים': 'and-the-ones-going',
  'הַצַּיָּד': 'the-hunter',
  'הַיּוֹרֵשׁ': 'the-one-inheriting',
  'הַנִּמְנִים': 'the-ones-counted',
  'הַנִּתְעָבִים': 'the-abominable-ones',
  'וְהַמֹּשֵׁל': 'and-the-ruler',
  'וְנוֹתֵן': 'and-giving',
  'וְכוֹתֵב': 'and-writing',
  'וּמְקַוֶּה': 'and-hoping',
  'הַסּוֹעֵר': 'the-stormy',
  'מַתְעֶה': 'one-who-leads-astray',
  'מְנַסֶּה': 'one-who-tempts',
  'וּמַבִיא': 'and-bringing',
  'בּוֹדִים': 'fabricating',
  'הַמּוֹפֵת': 'the-sign/wonder',

  // ═══════════════════════════════════════
  // NOUNS / ADJECTIVES
  // ═══════════════════════════════════════
  'בְּכוֹרוֹ': 'his-firstborn',
  'כּוֹכָב': 'star',
  'כְּזָבִים': 'lies',
  'הַמִּרְמוֹת': 'the-deceptions',
  'וְהַמִּרְמוֹת': 'and-the-deceptions',
  'שִׁגְגָתָם': 'their-error',
  'בְּשִׁגְגָתָם': 'in-their-error',
  'מִבְצְרֵיהֶם': 'their-fortresses',
  'כִחֲשֵׁיהֶם': 'their-deceptions',
  'בְּכִחֲשֵׁיהֶם': 'in-their-deceptions',
  'דִּבְרֵי': 'words-of',
  'וּבְדִבְרֵי': 'and-in-words-of',
  'עִוֵּר': 'he-blinded',
  'אִוֶּלֶת': 'folly',
  'שָׁוְא': 'vanity',
  'וָשָׁוְא': 'and-vanity',
  'אֱוִילִים': 'fools',
  'וְרֵקִים': 'and-empty-ones',
  'פְּקֻדָּתִי': 'my-command',
  'זְמַנָּם': 'their-time',
  'הַקְּרִיאָה': 'the-calling',
  'זְכֻיּוֹת': 'rights',
  'וּזְכֻיּוֹת': 'and-rights',
  'עֲבוֹדָתָם': 'their-service',
  'וַעֲבוֹדָתָם': 'and-their-service',
  'דְּרוֹרָם': 'their-liberty',
  'וּדְרוֹרָם': 'and-their-liberty',
  'קִלְלָתָם': 'their-curse',
  'כְּעוֹר': 'like-skin',
  'בַחוּרֵיהֶם': 'their-young-men',
  'פִּלּוּגֵיהֶם': 'their-divisions',
  'וּפִּלּוּגֵיהֶם': 'and-their-divisions',
  'חָזְקְךָ': 'your-strength',
  'מִשְׁפַּטְכֶם': 'your(pl)-judgment',
  'דְּרוֹרְכֶם': 'your(pl)-liberty',
  'וּדְרוֹרְכֶם': 'and-your(pl)-liberty',
  'אַרְצְכֶם': 'your(pl)-land',
  'וְאַרְצְכֶם': 'and-your(pl)-land',
  'עָרֵיכֶם': 'your(pl)-cities',
  'חָזְקְכֶם': 'your(pl)-strength',
  'וְרוּחֲכֶם': 'and-your(pl)-spirit',
  'הַנְּדִיבָה': 'the-generous(f)',
  'שְׁלוֹמְכֶם': 'your(pl)-peace',
  'לִשְׁלוֹמְכֶם': 'for-your(pl)-peace',
  'עֲוֺנוֹתֵיכֶם': 'your(pl)-iniquities',
  'נְבוּאוֹתָיו': 'his-prophecies',
  'וּנְבוּאוֹתָיו': 'and-his-prophecies',
  'מַעֲשֵׂינוּ': 'our-deeds',
  'עֲבָדֵינוּ': 'our-servants',
  'שֻׁתָּפֵינוּ': 'our-partners',
  'וְשֻׁתָּפֵינוּ': 'and-our-partners',
  'מֵעַמְּךָ': 'from-your-people',
  'עֲוֺנוֹתֵיהֶם': 'their-iniquities',
  'מִשְׁפְּטֵיהֶם': 'their-judgments',
  'מַעֲשֶׂיהָ': 'her-deeds',
  'וּמַעֲשֶׂיהָ': 'and-her-deeds',
  'מֶמְשַׁלְתָּם': 'their-dominion',
  'עַוְלָתָם': 'their-injustice',
  'אֲחֻזַּת': 'possession-of',
  'אֲבָנֵי': 'stones-of',
  'דְּגֵי': 'fish-of',
  'דְּבוֹרַת': 'bee-of',
  'דְּבַשׁ': 'honey',
  'נַחֲלֵי': 'streams-of',
  'דְבוֹרִים': 'bees',
  'עֵמֶק': 'valley',
  'הַדָּגָן': 'the-grain',
  'דְּגָנָהּ': 'her-grain',
  'וּדְגָנָהּ': 'and-her-grain',
  'מַגֵּפַת': 'plague-of',
  'הַדֶּבֶר': 'the-pestilence',
  'וְהַדֶּבֶר': 'and-the-pestilence',
  'חָרְבוֹתֵיהֶם': 'their-swords',
  'תַּחְבּוּלוֹתֵיהֶם': 'their-schemes',
  'הַהֲמוֹנִים': 'the-multitudes',
  'הַשְׁחָתָתָם': 'their-destruction',
  'הַשְׁחָתָתֵנוּ': 'our-destruction',
  'חֲרוֹנְךָ': 'your-wrath',
  'הָרָאשִׁים': 'the-leaders',

  // ═══════════════════════════════════════
  // PREPOSITION + NOUN COMBOS
  // ═══════════════════════════════════════
  'בַּמָּסוֹרוֹת': 'in-the-traditions',
  'בַּעֲבוּרִי': 'for-my-sake',
  'בְּשִׁגְגָתָם': 'in-their-error',
  'בַּשָּׁנִים': 'in-the-years',
  'בִּשְׂדֵה': 'in-a-field-of',
  'בְּאׇבְדָן': 'in-destruction',
  'בְּמָנְעֲכֶם': 'in-your-withholding',
  'בְּדָרְשׁוֹ': 'in-his-seeking',
  'בְּאַיְּמוֹ': 'in-his-threat',
  'בְּפָרְשָׁם': 'in-their-dissenting',
  'בְּהַחֲזִיקְכֶם': 'in-your-holding',
  'בְּקֹצֶר': 'in-shortness-of',
  'בְּהַגִּידוֹ': 'in-his-telling',
  'בַּשַׂקִּים': 'in-sackcloth',
  'בְּהַשְׁחָתַת': 'in-the-destruction-of',
  'בְּאָמְרִי': 'in-my-saying',
  'בְּאֹפֶן': 'in-a-manner',
  'בְּהִסָּגְרָהּ': 'when-it-is-shut(f)',
  'בְּעָבְרֵנוּ': 'in-our-crossing',
  'בְּחֶמְלָה': 'with-compassion',
  'בְּיָדְךָ': 'in-your-hand',
  'בְּהִבָּלְעֲכֶם': 'when-you-are-swallowed',
  'בְּעָוֺן': 'in-iniquity',
  'בַחֲבוּרַת': 'in-the-band-of',

  'מִצֵּאת': 'from-the-going-forth-of',
  'מִמַּעֲרָב': 'from-the-west',
  'מִזְרָח': 'east',
  'דָּרוֹם': 'south',
  'מִיָּם': 'from-the-sea/west',
  'מִן־הַדִּבְרֵי': 'from-the-words-of',
  'מִידֵי': 'from-the-hands-of',
  'מִסּוֹרְרֵי': 'from-rebels-of',
  'מִן־הַסֶּלַע': 'from-the-rock',
  'מִמַּעֲמַקֵּי': 'from-the-depths-of',
  'מִזַּרְעֲךָ': 'from-your-seed',
  'מֵרֵעֵינוּ': 'from-our-friends',
  'מֵעֶשְׂרִים': 'more-than-twenty',
  'מִכָּל־הַגּוֹיִם': 'from-all-the-nations',

  'לְהִתְעַצֵּב': 'to-grieve',
  'לְהָפִיץ': 'to-scatter',
  'לֶחֱזֹק': 'to-strengthen',
  'לִשְׁכֹּחַ': 'to-forget',
  'לַעֲצֹם': 'to-be-mighty',
  'לִמְנוֹת': 'to-count',
  'לְהִכָּחֵד': 'to-be-destroyed',
  'לְשׁוֹדְדֵי': 'to-the-robbers-of',
  'לִכְפֹּר': 'to-deny',
  'לְהַדִּיחַ': 'to-mislead',
  'לְהַפְחִידוֹ': 'to-frighten-him',
  'לְאִגֶּרֶת': 'to-the-letter',
  'לְכֹחַ': 'to-the-power-of',
  'לְהַצִּיב': 'to-establish',
  'וּלְהָגֵן': 'and-to-defend',
  'לְאַחִים': 'to/as-brothers',
  'לִצְלֹחַ': 'to-prosper',
  'וְלִפְרוֹץ': 'and-to-break-forth',
  'לַמּוּת': 'to-the-death',
  'לְבָרְכָם': 'to-bless-them',
  'לְמִישׁוֹר': 'to-a-plain',

  'עַל־בְּרִיאַת': 'concerning-the-creation-of',
  'עַל־הַשְׁחָתָתָם': 'concerning-their-destruction',
  'עַל־הַשְׁחָתָתֵנוּ': 'concerning-our-destruction',
  'עַל־רֵעֵיהֶם': 'against-their-friends',
  'עַל־הַמָּיִם': 'upon-the-waters',
  'אֶת־דִּבְרַי': '[ACC]-my-words',
  'אֶת־הַדִּבְרֵי': '[ACC]-the-words-of',
  'אֶת־הַסְּפִינוֹת': '[ACC]-the-ships',
  'אֶת־הַחֹר': '[ACC]-the-hole',
  'אֶת־הַכֵּלִים': '[ACC]-the-vessels',
  'אֶל־עֵמֶק': 'to-the-valley-of',
  'אֶת־חָרְבוֹתֵיהֶם': '[ACC]-their-swords',
  'אֶת־תַּחְבּוּלוֹתֵיהֶם': '[ACC]-their-schemes',
  'אֶת־מִקְנְךָ': '[ACC]-your-livestock',
  'אֶת־שְׂפָתָם': '[ACC]-their-language',
  'אֶת־דְּבָרֵינוּ': '[ACC]-our-words',
  'עַד־הַמְּלֹאת': 'until-the-filling',

  // WAW prefix combos
  'וּבַדָּבָר': 'and-in-the-matter',
  'וּבַמּוֹפְתִים': 'and-in-the-wonders',
  'וּשְׂמַח': 'and-rejoice!',
  'וּרְצוֹן': 'and-the-will-of',
  'וּמוֹפֵת': 'and-a-wonder',
  'וּפָחוֹת': 'and-less',
  'וּבְהִבָּחֲנִי': 'and-in-testing-me',
  'וְהִתְאַחֲדוּ': 'and-unite!',
  'וְהִתְוַדְּעוּ': 'and-make-yourselves-known!',
  'וְהִפִּילוּ': 'and-they-brought-down',
  'וְהָעָבְרוּ': 'and-they-transgressed',
  'וְשְׁפֹךְ': 'and-shedding-of',
  'וּמִימֵי': 'and-from-the-days-of',
  'וְתִזְעֲקוּ': 'and-you(pl)-shall-cry-out',
  'וְלַעֲוֵר': 'and-to-blind',
  'וְתֵשַׁע': 'and-nine',
  'וְכָפְרָם': 'and-their-atonement',
  'וְהַלַּיְלָה': 'and-the-night',
  'וַיִּתְעַצֵּב': 'and-he-grieved',
  'וּלְבַדּוֹ': 'and-alone',
  'וּמְלֹא': 'and-fullness-of',
  'וּמִשְׁפְּחוֹתֶיךָ': 'and-your-families',
  'וּמִסְפַּר': 'and-a-number-of',
  'וְקַלּוֹת': 'and-light(fp)',
  'וְאַל־תִּקְצֹף': 'and-do-not-be-angry!',
  'וְאַל־תִּתֵּן': 'and-do-not-give!',
  'וְשׁוֹכֵן': 'and-dwelling',
  'וְהָשֵׁב': 'and-return!/restore!',
  'וְתַשְׁבִּית': 'and-you-shall-cause-to-cease',
  'וְהוֹרֵד': 'and-bring-down!',
  'וְיִשָּׁכֵךְ': 'and-it-shall-subside',
  'וּתְנַסֶּה': 'and-you-shall-test',
  'וְחַסְתִּי': 'and-I-took-refuge',

  // כ prefix
  'כְּיוֹם': 'as-a-day',
  'כְּמִשְׁפָּטָהּ': 'according-to-its-custom(f)',
  'כְּצָהֳרָיִם': 'as-noon',
  'כְּבוֹאָם': 'when-they-came',
  'כְּקַלּוּת': 'as-the-lightness-of',
  'כַּמֵּתִים': 'as-dead-ones',
  'כָל־יוֹרֵשׁ': 'every-inheritor',

  // ה prefix
  'הַמְּזִמָּה': 'the-scheme',
  'הָאַרְבַּע': 'the-four',
  'הַחֲמֵשׁ': 'the-five',
  'הַעֹמְדִים': 'the-ones-standing',
  'הָעוֹלֶה': 'the-one-going-up',
  'הָעוֹלָמִית': 'the-eternal(f)',
  'הַלָּיְלָה': 'the-night',
  'הַגְּשָׁמִים': 'the-rains',
  'וְהַגְּשָׁמִים': 'and-the-rains',
  'הַתְּהוֹם': 'the-abyss',
  'הָרוּחוֹת': 'the-winds',
  'וְהָרוּחוֹת': 'and-the-winds',
  'הַנֶפִילָה': 'the-fall',
  'הַשַּׁדַּי': 'the-Almighty',

  // Misc
  'כֻלָּהּ': 'all-of-it(f)',
  'יוֹד': 'Yod',
  'חָמֵשׁ': 'five',
  'שְׁמוֹנָה': 'eight',
  'נֶפִיִּים': 'Nephites',
  'שְׁאֵת': 'rising/lifting',
  'וֶאֱמוּנַתְכֶם': 'and-your(pl)-faith',
  'נְבִיאַי': 'my-prophets',
  'הֲבַעֲבוּר': 'is-it-because',
  'גָּמוּר': 'complete/utter',
  'לָהָר': 'to-the-mountain',
  'בְּיוֹתֵר': 'exceedingly',
  'גַם־פַּחִים': 'also-traps',
  'פֶּן־יַכֵּנִי': 'lest-he-strike-me',
  'בְּיַד־יְהוָה': 'by-the-hand-of-YHWH',
  'אִם־תֶּחֶטְאוּ': 'if-you-sin',
  'מַחְשְׁבוֹתַי': 'my-thoughts',
  'לֹא־יָדוֹן': 'he-shall-not-strive',
  'בָאָדָם': 'in-mankind',
  'בָאֳהָלִים': 'in-tents',
  'וּלְאַחֶיךָ': 'and-to-your-brothers',
  'רֵעֶיךָ': 'your-friends',
  'זְעַקְתֶּם': 'your(pl)-cry',
  'עַל־הַמָּיִם׃': 'upon-the-waters',
  'חֻלְשָׁתוֹ': 'his-weakness',
  'מִשְׁאֲלוֹתֵינוּ': 'our-requests',
  'הִכִּיתָנוּ': 'you-struck-us',
  'וַתִּדְחֵנוּ': 'and-you-pushed-us-away',
  'וְדָרוֹם': 'and-south',
  'הַצְּפוֹנִית': 'the-northern(f)',
  'אֲשַׁעֵר': 'I-shall-estimate',
  'נִשְׁלְחָה': 'was-sent(f)',
  'וָלָיְלָה': 'and-night',
  'הִקְשִׁיב': 'he-listened',
  'לְאִגֶּרֶת': 'to-the-letter',
  'נָתְנָה': 'she-gave',
  'וְלֹא־נָתְנָה': 'and-it-did-not-give(f)',
  'הָלָכָה': 'she-went',
  'יִסָּעוּ': 'they-shall-travel',
  'וּנְקֹמוֹ': 'and-his-vengeance',
  'פֶּן־יִתְקַיְּמוּ': 'lest-they-be-fulfilled',
  'אִם־יַעַבְדוּךָ': 'if-they-serve-you',
  'כִּדְבָרֶיךָ': 'according-to-your-words',
  'וְדָרוֹם': 'and-south',
  'וְעַד־דָּרוֹם': 'and-unto-the-south',
  'הַמִּזְרָח': 'the-east',
  'וְאֶל־מְקוֹמוֹת': 'and-to-places',
  'עִם־אֲחֵיהֶם': 'with-their-brothers',
  'וְהַשְׁמִידוּם': 'and-destroy-them!',
  'בְּאֹפֶן': 'in-a-manner',
  'נִירָשֶׁנָּה': 'we-shall-possess-it',
  'בָאֳהָלִים': 'in-tents',
  'אֲחֵיהֶם': 'their-brothers',
  'וַאֲקִים': 'and-I-shall-establish',
  'מְקוֹמוֹת': 'places',
  'וְיָסֵר': 'and-he-shall-chastise',
  'הַמְּסִלָּה': 'the-highway',
  'לְהָמוֹן': 'to-the-multitude',
};

// ═══════════════════════════════════════
// PREFIX STRIPPING (same approach as pass 2)
// ═══════════════════════════════════════
function tryPrefixes(w) {
  let clean = w.replace(/׃$/, '');
  if (glossMap[clean]) return glossMap[clean];

  let m = clean.match(/^(וְ|וּ|וַ|וָ|וֶ)(.*)/);
  if (m) {
    let rest = m[2];
    if (glossMap[rest]) return 'and-' + glossMap[rest];
    let m2 = rest.match(/^(הַ|הָ|הֶ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'and-the-' + glossMap[m2[2]];
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
  m = clean.match(/^(בְּ|בַּ|בִּ|בָּ|בְ|בַ|בִ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'in-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'in-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^(לְ|לַ|לִ|לָ|לֶ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'to-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'to-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^(מִ|מֵ|מְ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'from-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'from-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^(כְּ|כַּ|כְ|כַ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'as-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'as-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^(הַ|הָ|הֶ)(.*)/);
  if (m && glossMap[m[2]]) return 'the-' + glossMap[m[2]];
  m = clean.match(/^(שֶׁ|שֶ)(.*)/);
  if (m && glossMap[m[2]]) return 'that-' + glossMap[m[2]];
  m = clean.match(/^אֶת[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return '[ACC]-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return '[ACC]-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^אֶל[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'to-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'to-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^עַל[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'upon-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'upon-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^עִם[־](.*)/);
  if (m && glossMap[m[1]]) return 'with-' + glossMap[m[1]];
  m = clean.match(/^מִן[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'from-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'from-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^כָל[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'all-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'all-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^בֶּן[־](.*)/);
  if (m && glossMap[m[1]]) return 'son-of-' + glossMap[m[1]];
  m = clean.match(/^בֵּן[־](.*)/);
  if (m && glossMap[m[1]]) return 'son-of-' + glossMap[m[1]];
  m = clean.match(/^אִם[־](.*)/);
  if (m && glossMap[m[1]]) return 'if-' + glossMap[m[1]];
  m = clean.match(/^פֶּן[־](.*)/);
  if (m && glossMap[m[1]]) return 'lest-' + glossMap[m[1]];
  m = clean.match(/^אַל[־](.*)/);
  if (m && glossMap[m[1]]) return 'do-not-' + glossMap[m[1]];
  m = clean.match(/^מַה[־](.*)/);
  if (m && glossMap[m[1]]) return 'what-' + glossMap[m[1]];
  m = clean.match(/^עַד[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'unto-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'unto-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^גַם[־](.*)/);
  if (m && glossMap[m[1]]) return 'also-' + glossMap[m[1]];

  return null;
}

// ═══════════════════════════════════════
// PROCESS
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
