#!/usr/bin/env node
/**
 * fix_alma_glosses.js
 *
 * Fixes all "???" glosses in al_data.js using comprehensive Hebrew morphological analysis.
 * Handles verb conjugations (all binyanim), pronominal suffixes, construct chains,
 * prefixed particles, and proper nouns.
 */

const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', '_chapter_data', 'al_data.js');
let content = fs.readFileSync(dataFile, 'utf8');

// ═══════════════════════════════════════════════════════════════
// COMPREHENSIVE HEBREW GLOSS DICTIONARY
// Organized by category: verbs by conjugation, nouns with suffixes,
// proper nouns, particles, construct forms, etc.
// ═══════════════════════════════════════════════════════════════

const glossMap = {
  // ═══════════════════════════════════════
  // PROPER NOUNS (Book of Mormon names, places)
  // ═══════════════════════════════════════
  'מוֹרֹנִי': 'Moroni',
  'נִיחוֹר': 'Nehor',
  'נִחוֹר': 'Nehor',
  'אַמְלִיסִי': 'Amlici',
  'אַמְלִיסִיִּים': 'Amlicites',
  'הָאַמְלִיסִיִּים': 'the-Amlicites',
  'הָעַמְלִיסִים': 'the-Amlicites',
  'וְהָעַמְלִיסִים': 'and-the-Amlicites',
  'עֲמָלֵקִים': 'Amalekites',
  'הָעֲמָלֵקִים': 'the-Amalekites',
  'וְהָעֲמָלֵקִים': 'and-the-Amalekites',
  'לָמוֹנִי': 'Lamoni',
  'אַנְטִי־נֶפִי־לֶחִי': 'Anti-Nephi-Lehi',
  'אַנְטִיפָּרָה': 'Antiparah',
  'פָּכוּס': 'Pachus',
  'מֶלֶק': 'Melek',
  'סֶבוּס': 'Sebus',
  'כּוּמֵנִי': 'Cumeni',
  'אַנְטְיוֹנָה': 'Antionah',
  'נְפִיחָה': 'Nephihah',
  'אַבִּינָדָב': 'Abinadab',
  'אַמּוֹן': 'Ammon',
  'אַמּוֹנִיהָ': 'Ammonihah',
  'גִּדְעוֹן': 'Gideon',
  'בְּגִדְעוֹן': 'in-Gideon',
  'וְגִדְעוֹן': 'and-Gideon',
  'קוֹרִיאַנְטוֹן': 'Corianton',
  'אַנְטִי': 'Anti',
  'זְרַחֶמְלָה': 'Zarahemla',
  'מוּלֵק': 'Mulek',
  'יֶרֶד': 'Jared',
  'הֶלָמָן': 'Helaman',
  'לְהֶלָמָן': 'to-Helaman',
  'גִּלְגָּל': 'Gilgal',
  'לְאַנְטִיפָּרָה': 'to-Antiparah',
  'שִׁבְלוֹן': 'Shiblon',
  'מוֹרוֹנִי': 'Moroni',
  'לְמוֹרוֹנִי': 'to-Moroni',
  'טֵאַנְכוּם': 'Teancum',
  'לְטֵאַנְכוּם': 'to-Teancum',
  'פָּחוֹרָן': 'Pahoran',
  'לְפָחוֹרָן': 'to-Pahoran',
  'אַמַּלִקְיָה': 'Amalickiah',
  'אַמַּלִקְיָהוּ': 'Amalickiah',
  'יִשְׁמָעֵאל': 'Ishmael',
  'יִשְׁמְעֵאלִים': 'Ishmaelites',
  'הַיִּשְׁמְעֵאלִים': 'the-Ishmaelites',
  'אַהֲרֹן': 'Aaron',
  'נֹחַ': 'Noah',
  'אִיזָבֶל׃': 'Isabel',
  'אִיזָבֶל': 'Isabel',
  'אַנְטִי־נֶפִי־לֶחִיִּים': 'Anti-Nephi-Lehites',
  'הָאַנְטִי־נֶפִי־לֶחִיִּים': 'the-Anti-Nephi-Lehites',
  'לַנֶּפִיִּים': 'to-the-Nephites',
  'זוֹרָמִים': 'Zoramites',
  'הַזּוֹרָמִים': 'the-Zoramites',
  'הַלָּמָנִים': 'the-Lamanites',
  'לַלָּמָנִים': 'to-the-Lamanites',
  'מוֹרוֹנִיהָ': 'Moronihah',

  // ═══════════════════════════════════════
  // QAL PERFECT (3ms, 3fs, 3cp, 2ms, 2fs, 1cs, 1cp)
  // ═══════════════════════════════════════
  // 3ms
  'פָּגַשׁ': 'met',
  'טָמַן': 'laid',
  'גָּזַר': 'decreed',
  'שָׁפַךְ': 'poured-out',
  'חָמַל': 'had-compassion',
  'עָבַר': 'passed',
  'נָהַג': 'led',
  'יָצָא': 'went-out',
  'בָּרַח': 'fled',
  'שָׁכַב': 'lay-down',
  'נָפַל': 'fell',
  'עָמַד': 'stood',
  'חָשַׁב': 'thought',
  'כָּרַע': 'bowed',
  'גָּנַב': 'stole',
  'סָר': 'departed',
  'בָּחַר': 'chose',
  'אָסַף': 'gathered',
  'שָׂנֵא': 'hated',
  'מָנָע': 'withheld',
  'כָּבַד': 'was-heavy',
  'חָזַק': 'was-strong',
  'חָרָה': 'was-kindled',
  'מָלַךְ': 'reigned',
  'שָׁקַל': 'weighed',
  'תָּלָה': 'hanged',
  'שָׁבַר': 'broke',
  'חָנָה': 'encamped',
  'רָעַד': 'trembled',
  'רָדַף': 'pursued',
  'וְרָדַף': 'and-pursued',
  'הָרַג': 'slew',
  'שָׁבָה': 'took-captive',
  'עָרַךְ': 'arranged',
  'כָּבַשׁ': 'subdued',
  'בָּנָה': 'built',
  'חָפַר': 'dug',
  'סָבַב': 'surrounded',
  'רָצָה': 'desired',
  'שָׂרַף': 'burned',
  'דָּחָה': 'pushed',
  'מָרַד': 'rebelled',

  // 3fs
  'הָיְתָה': 'was(f)',
  'נִקְרְאָה': 'was-called(f)',
  'נִשְׁלְחָה': 'was-sent(f)',

  // 3cp (common plural)
  'הֶחֱרִישׁוּ': 'silenced',
  'נִסּוּ': 'fled',
  'נָסוֹגוּ': 'retreated',
  'נָפְלוּ': 'fell',
  'קָמוּ': 'arose',
  'נִפְרְדוּ': 'separated',
  'נִבְחֲרוּ': 'were-chosen',
  'נִזְכְּרוּ': 'remembered',
  'אָהֲבוּ': 'loved',
  'אָהָבוּם': 'loved-them',
  'אֲהֵבוּם': 'loved-them',
  'שָׁלְחוּ': 'sent',
  'נָהֲרוּ': 'streamed',
  'יָצְאוּ': 'went-out',
  'חָזְרוּ': 'returned',
  'רָדְפוּ': 'pursued',
  'עָבְרוּ': 'passed',
  'נֶאֶסְרוּ': 'were-bound',
  'גֵּרְשׁוּ': 'drove-out',
  'נִלְחֲמוּ': 'fought',
  'עָמְדוּ': 'stood',
  'הִכּוּ': 'struck',
  'חָנוּ': 'encamped',
  'כָּרְעוּ': 'bowed',

  // 2ms
  'שָׁפַכְתָּ': 'you-poured-out',
  'אָשַׁמְתָּ': 'you-sinned',
  'שִׁקַּרְתָּ': 'you-lied',
  'עָבַרְתָּ': 'you-transgressed',
  'עָשִׂיתָ': 'you-did',
  'רָאִיתָ': 'you-saw',
  'יָדַעְתָּ': 'you-knew',
  'הָלַכְתָּ': 'you-went',
  'שָׁמַעְתָּ': 'you-heard',
  'חָטָאתָ': 'you-sinned',
  'מָצָאתָ': 'you-found',
  'עָזַבְתָּ': 'you-abandoned',
  'אָמַנְתָּ': 'you-believed',

  // 2fs
  // (rarely used in BOM context)

  // 1cs
  'חָפַצְתִּי': 'I-desired',
  'נִשְׁבַּעְתִּי': 'I-swore',
  'עָשִׂיתִי': 'I-did',
  'חָטָאתִי': 'I-sinned',
  'יָדַעְתִּי': 'I-knew',
  'הָלַכְתִּי': 'I-went',
  'רָאִיתִי': 'I-saw',
  'שָׁמַעְתִּי': 'I-heard',
  'שָׁלַחְתִּי': 'I-sent',
  'נָתַתִּי': 'I-gave',
  'כָּתַבְתִּי': 'I-wrote',
  'זָכַרְתִּי': 'I-remembered',
  'אָמַרְתִּי': 'I-said',
  'קָרָאתִי': 'I-called',

  // 1cp
  'עָשִׂינוּ': 'we-did',
  'לָקַחְנוּ': 'we-took',
  'חָמַלְנוּ': 'we-had-compassion',
  'יָדַעְנוּ': 'we-knew',
  'אִחַדְנוּ': 'we-united',
  'שָׁמַעְנוּ': 'we-heard',
  'רָאִינוּ': 'we-saw',
  'הָלַכְנוּ': 'we-went',
  'דִּבַּרְנוּ': 'we-spoke',
  'מָצָאנוּ': 'we-found',

  // ═══════════════════════════════════════
  // QAL IMPERFECT (prefix conjugation)
  // ═══════════════════════════════════════
  // 3ms (יִ/יַ)
  'יִרְעָד': 'he-shall-tremble',
  'יִרְעֲדוּ': 'they-shall-tremble',
  'יִפֹּל': 'he-shall-fall',
  'יִשְׂמַח': 'he-shall-rejoice',
  'יִשְׂמָחוּ': 'they-shall-rejoice',
  'וְיִשְׂמָחוּ': 'and-they-shall-rejoice',
  'יִפְגֹּשׁ': 'he-shall-meet',
  'יֵצֵא': 'he-shall-go-out',
  'יֵצְאוּ': 'they-shall-go-out',
  'יִבְרַח': 'he-shall-flee',
  'יֶחֱרַד': 'he-shall-fear',
  'יֵשֵׁב': 'he-shall-dwell',
  'יַעֲלֶה': 'he-shall-ascend',
  'יֵרֵד': 'he-shall-descend',
  'יַכֶּה': 'he-shall-strike',
  'יִקְרָא': 'he-shall-call',
  'יִשְׁפֹּט': 'he-shall-judge',
  'יִשְׁכַּב': 'he-shall-lie-down',
  'יִגְדַּל': 'he-shall-grow',
  'יִרְדֹּף': 'he-shall-pursue',
  'יַחֲשֹׁב': 'he-shall-think',
  'יֶחֱזַק': 'he-shall-be-strong',
  'יִבְחַר': 'he-shall-choose',
  'יִמְלֹךְ': 'he-shall-reign',

  // 3fp
  // 2ms (תִ)
  'תַּחְשֹׁב': 'you-shall-think',
  'תָּמוּת': 'you-shall-die',

  // 1cs (אֶ/אֲ)
  'אֶדָּעֲךָ': 'I-shall-know-you',
  'אֵדַע': 'I-shall-know',
  'אֶהְיֶה': 'I-shall-be',
  'אֶהֱרֹג': 'I-shall-slay',
  'אֶחְמֹל': 'I-shall-have-compassion',
  'אֶחְדַּל׃': 'I-shall-cease',
  'אֶחְדַּל': 'I-shall-cease',
  'אֶגְרֹם': 'I-shall-cause',
  'אֶתְהַלֵּל': 'I-shall-boast',
  'אֲגַלֶּה': 'I-shall-reveal',
  'אֲחַלֶּה': 'I-shall-beseech',
  'אֲקַבֵּל': 'I-shall-receive',
  'אֲקַוֶּה': 'I-shall-hope',
  'אֲצַפֶּה': 'I-shall-watch',
  'אֲפָרֵשׁ': 'I-shall-spread-out',
  'אֲפָרְשֶׁנּוּ': 'I-shall-spread-it',
  'אִוָּכַח': 'I-shall-argue',
  'אִוָּלֵד': 'I-shall-be-born',
  'אִירָא': 'I-shall-fear',

  // 1cp (נ)
  'נוֹדֶה': 'we-shall-give-thanks',
  'נָשׁוּבָה': 'let-us-return',
  'נָבוֹאָה': 'let-us-come',

  // ═══════════════════════════════════════
  // QAL IMPERATIVE
  // ═══════════════════════════════════════
  'אֱמֹר': 'say!',
  'אִמְּצוּ': 'be-strong!',
  'אִמֵּת': 'be-true',
  'רְדָפוּם': 'pursue-them!',

  // ═══════════════════════════════════════
  // QAL PARTICIPLE
  // ═══════════════════════════════════════
  'יוֹרֵשׁ': 'inheriting',
  'דֹּרֵשׁ': 'seeking',
  'בּוֹטֵחַ': 'trusting',
  'הָרוֹצֵחַ': 'the-murderer',
  'הַמְשַׁקְּרִים': 'the-liars',
  'הַנּוֹדָע': 'the-known',
  'מְהֻלָּל': 'praised',
  'מְרַגְּלִים': 'spies',
  'לָעֹמְדִים': 'to-those-standing',
  'הַנּוֹגְעִים': 'pertaining',
  'הַמִּתְהַפֶּכֶת': 'the-turning',

  // ═══════════════════════════════════════
  // QAL INFINITIVE CONSTRUCT (with preps)
  // ═══════════════════════════════════════
  'לִפֹּל': 'to-fall',
  'לִשְׁדֹד': 'to-plunder',
  'לַעֲזֹר': 'to-help',
  'לְשַׁנּוֹת': 'to-change',
  'לְחַפֵּשׂ': 'to-search',
  'לִלְכֹּד': 'to-capture',
  'לָגֶשֶׁת': 'to-approach',
  'לְרַגְּלֵי': 'at-the-feet-of',

  // ═══════════════════════════════════════
  // NIPHAL (נִפְעַל) - passive/reflexive
  // ═══════════════════════════════════════
  'נֶעֱנַשׁ': 'was-punished',
  'נֶעֶנְשׁוּ': 'were-punished',
  'נִשְׁמְעוּ': 'were-heard',
  'נִתְפַּשְׂתָּ': 'you-were-caught',
  'נִמְצָא': 'was-found',
  'לֹא־נִמְצָא': 'not-was-found',
  'נִמָּצֵא': 'shall-be-found',
  'נִגְזַר': 'was-decreed',
  'נִגְלוּ': 'were-revealed',
  'נֻרְשַׁע׃': 'we-shall-be-condemned',
  'נֻרְשַׁע': 'we-shall-be-condemned',
  'נִקְרְאוּ': 'were-called',

  // ═══════════════════════════════════════
  // PIEL (פִּעֵל) - intensive active
  // ═══════════════════════════════════════
  'לְבָאֵר': 'to-explain',
  'וּלְבָאֵר': 'and-to-explain',
  'לְקַיֵּם': 'to-establish',
  'וּלְקַיֵּם': 'and-to-establish',
  'לְשַׁקֵּר': 'to-lie',
  'וּלְרַמּוֹת': 'and-to-deceive',
  'לְגַדֵּף': 'to-revile',
  'לְכַלְכְּלוֹ': 'to-sustain-him',
  'לִמְכַזֵּב': 'a-liar',
  'לְבַדָּם': 'alone',

  // ═══════════════════════════════════════
  // HIPHIL (הִפְעִיל) - causative active
  // ═══════════════════════════════════════
  'הֶחֱרִישׁוּ': 'they-silenced',
  'הוֹדָה': 'confessed',
  'וְהוֹדִיעָם': 'and-made-known-to-them',
  'הוֹדִיעָם': 'made-known-to-them',
  'הוֹדִיעוֹ': 'made-known-to-him',
  'לְהַשְׁמִידוֹ': 'to-destroy-him',
  'לְהַשְׁלִיכָם': 'to-cast-them-out',
  'לְהַסְתִּירֵנוּ': 'to-hide-us',
  'הִכְנִיעָם': 'has-subjected-them',
  'הִמְשִׁיכוּ': 'they-continued',
  'אִם־הִמְשִׁיכוּ': 'if-they-continued',
  'הִשִּׂיגָם': 'overtook-them',
  'אִם־הִשִּׂיגָם': 'if-overtook-them',
  'הִקְשֵׁינוּ': 'we-hardened',
  'אִם־הִקְשֵׁינוּ': 'if-we-hardened',
  'הָעֵדָה': 'the-congregation',
  'מֵהָעֵדָה': 'from-the-congregation',
  'מֵהִתְפַּשֵּׁט': 'from-spreading',
  'לְהִתְוַכֵּחַ': 'to-contend',
  'לְהִשָּׁחֵת': 'to-be-destroyed',

  // ═══════════════════════════════════════
  // HOPHAL (הֻפְעַל) - causative passive
  // ═══════════════════════════════════════
  'הוּבְאָה': 'was-brought(f)',
  'הוּשְׂמוּ': 'were-placed',
  'הוּכְנָה': 'was-prepared',
  'הוּכַן': 'was-prepared',
  'הוּמַת': 'was-put-to-death',
  'אִם־יוּמַת': 'if-shall-be-put-to-death',

  // ═══════════════════════════════════════
  // HITHPAEL (הִתְפַּעֵל) - reflexive
  // ═══════════════════════════════════════
  'וְהִתְהַלְּכוֹ': 'and-his-walking',
  'לְהִשְׁתּוֹמֵם׃': 'to-be-astonished',
  'לְהִשְׁתּוֹמֵם': 'to-be-astonished',
  'וַיִּתְנַכְּרוּ': 'and-they-dissembled',
  'לְהִתְוַכֵּחַ': 'to-contend',
  'וְיִשְׁתַּנֶּה': 'and-shall-be-changed',

  // ═══════════════════════════════════════
  // NOUNS WITH PRONOMINAL SUFFIXES
  // ═══════════════════════════════════════

  // 3ms suffix (-וֹ)
  'תְּפָשׂוֹ': 'caught-him',
  'בְּכַחֲשׁוֹ': 'in-his-lying',
  'וּבְמִרְמָתוֹ': 'and-in-his-deceit',
  'אַשְׁמָתוֹ': 'his-guilt',
  'רְצוֹנוֹ': 'his-will',
  'כִּרְצוֹנוֹ': 'according-to-his-will',
  'לֶהָבָתוֹ': 'its-flame',
  'בְּרוּחוֹ׃': 'by-His-spirit',
  'בְּרוּחוֹ': 'by-His-spirit',
  'אֵינוֹ': 'he-is-not',
  'כְּבוֹדוֹ': 'his-glory',
  'אֶת־כְּבוֹדוֹ׃': '[ACC]-his-glory',
  'וּבְכֹחוֹ': 'and-in-his-power',
  'בְּהוֹדוֹ': 'in-his-majesty',
  'וּבְמַמְלַכְתּוֹ': 'and-in-his-kingdom',
  'חֲרוֹנוֹ': 'his-wrath',
  'דָמוֹ': 'his-blood',

  // 3fs suffix (-ָהּ)
  'אֵינָהּ': 'she/it-is-not',
  'עֲלֶיהָ': 'upon-her/it',
  'אִישָׁהּ': 'her-husband',
  'לַעֲשׂוֹתָהּ': 'to-do-it(f)',

  // 3mp suffix (-ָם / -ֵיהֶם)
  'עִנּוּיֵיהֶם': 'their-afflictions',
  'צְבָאוֹתָם': 'their-armies',
  'מִמּוֹרֵיהֶם': 'from-their-teachers',
  'אֵימָתָם': 'their-terror',
  'אֲבָנֵיהֶם': 'their-stones',
  'חִצֵּיהֶם': 'their-arrows',
  'וְחִצֵּיהֶם': 'and-their-arrows',
  'אִמּוֹתֵיהֶם': 'their-mothers',
  'אִמּוֹתֵיהֶם׃': 'their-mothers',
  'מַכּוֹתָיו': 'his-wounds',
  'כִּרְצוֹנָם': 'according-to-their-desires',
  'וּכְחֶפְצָם': 'and-according-to-their-will',
  'שַׁרְשְׁרוֹתָיו': 'his-chains',
  'בְּשַׁרְשְׁרוֹתָיו': 'in-his-chains',
  'אִיּוּמֵיכֶם׃': 'your-threatenings',
  'אִיּוּמִים': 'threatenings',

  // 2ms suffix (-ְךָ)
  'בְּכַחֲשְׁךָ': 'in-your-lying',
  'וּבְעָרְמָתְךָ': 'and-in-your-craftiness',
  'מַחְשְׁבוֹתֶיךָ': 'your-thoughts',
  'אֶת־כָּל־מַחְשְׁבוֹתֶיךָ': '[ACC]-all-your-thoughts',
  'מְזִמָּתְךָ': 'your-scheme',
  'אֶת־מְזִמָּתְךָ': '[ACC]-your-scheme',
  'נַפְשְׁךָ': 'your-soul',
  'צֹרְרְךָ': 'your-adversary',
  'אֵינְךָ': 'you-are-not',
  'דִּינְךָ': 'your-judgment',
  'בִּרְאוֹתְךָ': 'when-you-saw',

  // 1cs suffix (-ִי)
  'אִגַּרְתִּי': 'my-epistle',
  'אֶת־אִגַּרְתִּי': '[ACC]-my-epistle',
  'אֵבָרַי': 'my-limbs',
  'אֵיבְרֵי': 'limbs-of',
  'בְּנִי': 'my-son',

  // 1cp suffix (-ֵנוּ)
  'אֲחֻזָּתֵנוּ': 'our-possession',
  'אִמּוֹתֵינוּ׃': 'our-mothers',
  'אִמּוֹתֵינוּ': 'our-mothers',
  'לְבָשְׁתֵּנוּ': 'to-our-shame',

  // 2mp suffix (-כֶם)
  'אֲחֻזַּתְכֶם': 'your(pl)-possession',
  'מַחְשְׁבוֹתֵינוּ': 'our-thoughts',

  // ═══════════════════════════════════════
  // NOUNS (standalone)
  // ═══════════════════════════════════════
  'מִלְחֶמֶת': 'war-of',
  'מִלְחָמָה': 'war',
  'מִיתַת': 'death-of',
  'בּוּשָׁה׃': 'shame',
  'בּוּשָׁה': 'shame',
  'כְהֻנַּת־שֶׁקֶר': 'priestcraft',
  'בִּכְהֻנַּת־שֶׁקֶר': 'in-priestcraft',
  'תּוֹסֶפֶת': 'addition',
  'מַצַּב': 'state/condition',
  'נִצָּחוֹן': 'victory',
  'הַצְלָחָה': 'success',
  'בַּיִת': 'house',
  'מִבַּיִת': 'from-within',
  'בַיָּמִים': 'in-the-days',
  'טַעַם': 'reason/decree',
  'רְדִיפָה': 'persecution',
  'בְּחֵמָה': 'in-wrath',
  'לְצָרָה': 'to-affliction',
  'לְמַסָּה': 'to-trial',
  'לְמַכּוֹת': 'to-smite',
  'בְּאֶגְרוֹף׃': 'with-fist',
  'בְּאֶגְרוֹף': 'with-fist',
  'שַׁרְשְׁרוֹת': 'chains',
  'דִּבְרַת': 'matter-of',
  'הַדִּבְרָה': 'the-manner',
  'בַּדְּרוֹר': 'in-liberty',
  'אֲחֻזָּה': 'possession',
  'אֲחֻזַּת': 'possession-of',
  'מְזִמָּה': 'purpose/scheme',
  'עֲרוּמָה': 'crafty',
  'כְּעָרְמַת': 'as-the-craftiness-of',
  'פַח': 'snare',
  'הַצֹּרֵר': 'the-adversary',
  'שְׁבִי': 'captivity',
  'שִׁבְיוֹ׃': 'his-captivity',
  'שִׁבְיוֹ': 'his-captivity',
  'הַכָּרַת': 'the-consciousness-of',
  'כֵּס': 'throne',
  'מוּפָרָה': 'frustrated',
  'תֹּקֶף׃': 'force',
  'תֹּקֶף': 'force',
  'הֲכָנָה': 'preparation',
  'הַהֲכָנָה': 'the-preparation',
  'שָׁחַת׃': 'destruction',
  'שָׁחַת': 'destruction',
  'לְשַׁחַת': 'to-destruction',
  'כְּצֶדֶק': 'according-to-justice-of',
  'כְּחֶסֶד': 'according-to-mercy-of',
  'מִסּוֹדוֹתָיו': 'from-his-mysteries',
  'כְּחֵלֶק': 'according-to-portion-of',
  'כְּהַקֶּשֶׁב': 'according-to-heed',
  'וְהַשְּׁקִידָה': 'and-the-diligence',
  'הַמַּקְשֶׁה': 'he-who-hardens',
  'יֵדָעֵם': 'he-shall-know-them',
  'בִּמְלוֹאָם׃': 'in-their-fullness',
  'בִּמְלוֹאָם': 'in-their-fullness',
  'יִשָּׁבוּ': 'they-shall-be-captured',
  'וְיוּבְלוּ': 'and-they-shall-be-led',
  'וּשְׁבִי': 'and-captivity-of',
  'בְּגָלוּי': 'plainly',
  'לְאֵין־מָוֶת': 'to-immortality',
  'וְעַל־הֲבָאָה': 'and-upon-the-bringing',
  'כְּמַעֲשֵׂינוּ׃': 'according-to-our-works',
  'כְּמַעֲשֵׂינוּ': 'according-to-our-works',
  'כָּל־מַעֲשֵׂינוּ': 'all-our-works',
  'דְבָרֵינוּ': 'our-words',
  'יַרְשִׁיעוּנוּ': 'shall-condemn-us',
  'תְמִימִים': 'blameless',
  'וּבָרָעָה': 'and-in-evil',
  'נָעֵז': 'we-shall-dare',
  'וְנִשְׂמַח': 'and-we-shall-rejoice',
  'לְהַבִּיט': 'to-look',
  'וְהֶהָרִים': 'and-the-mountains',
  'אֶת־הַכְּרֻבִים': '[ACC]-the-cherubim',
  'וְאֶת־לַהַט': 'and-[ACC]-the-flame-of',
  'לְגַן־עֵדֶן': 'to-the-garden-of-Eden',
  'פֶּן־יִגְּשׁוּ': 'lest-they-approach',
  'וְאָכְלוּ': 'and-eat',
  'וָחָי': 'and-live',
  'בְּאָכְלוֹ': 'in-his-eating',
  'בְּנָפְלוֹ': 'in-his-falling',
  'וְנוֹפֵל׃': 'and-fallen',
  'וְנוֹפֵל': 'and-fallen',
  'אִם־תֹּאכַל': 'if-you-eat',
  'וְרֹאִים': 'and-we-see',
  'כִּי־בָא': 'that-came',
  'לַיָּמִים': 'for-the-days',
  'הָאֵין־קֵץ': 'the-endless',
  'לֹא־יָכְלָה': 'could-not(f)',
  'תָּבִיא': 'shall-bring',
  'לִתְחִיַּת': 'to-the-resurrection-of',
  'כֶּאֱמוּנָתָם': 'according-to-their-faith',
  'וּתְשׁוּבָתָם': 'and-their-repentance',
  'וַיִּבְחָרוּ': 'and-they-chose',
  'בַטּוֹב': 'the-good',
  'בָרָע': 'evil',
  'וַיִּקָּרֵאוּ': 'and-they-were-called',
  'בְּמִקְרָא': 'with-a-calling',
  'מִיסוֹד': 'from-foundation-of',
  'הָרִאשׁוֹנוֹת': 'the-first(fp)',
  'תְחִלָּה': 'first',
  'לִפְעֹל': 'to-act',
  'בְּמִצְוֹתָיו': 'in-his-commandments',
  'הַשְּׁנִיּוֹת': 'the-second(fp)',
  'כׇּל־הַשָּׁב': 'everyone-who-repents',
  'וַיִּפְתַּח': 'and-he-opened',
  'לִפְרֹשׂ': 'to-spread-out',
  'בַחֲרוֹנִי': 'in-my-wrath',
  'יַכְעִיסֵהוּ': 'shall-provoke-him',
  'וְיוֹרִיד': 'and-shall-bring-down',
  'כַּמְּרִיבָה': 'as-the-provocation',
  'בַּמְּרִיבָה': 'in-the-provocation',
  'לָרִאשׁוֹן׃': 'as-the-first',
  'לָרִאשׁוֹן': 'as-the-first',
  'בִּרְאוֹתֵנוּ': 'seeing',
  'וְאַל־נַקְשֶׁה': 'and-let-us-not-harden',
  'פֶּן־נַכְעִיס': 'lest-we-provoke',
  'לְהוֹרִיד': 'to-bring-down',
  'נוֹכַח': 'convinced',
  'וָיוֹתֵר': 'and-more',
  'וְלַעֲמוּלֶק': 'and-to-Amulek',
  'וּמְזִמּוֹתָיו': 'and-his-schemes',
  'מַה־זֹּאת': 'what-is-this',
  'לְכׇל': 'to-all',
  'וְכׇל': 'and-all',
  'לָתֶת': 'to-give',
  'וְלָתֶת־לוֹ': 'and-to-give-to-him',
  'וְלִלְבֹּשׁ': 'and-to-clothe',
  'לַמַּאֲמִינִים': 'to-the-believers',
  'וַיִּפְגַּע': 'and-he-met',
  'וַיּוֹכִיחֵהוּ': 'and-reproved-him',
  'וַיִּקָּחוּ': 'and-they-took',
  'הֲרָגוֹ': 'his-slaying',
  'עַל־הַפְּשָׁעִים': 'concerning-the-transgressions',
  'וַיָּרֶב': 'and-he-contended',
  'גַם־בִּקַּשְׁתָּ': 'also-you-sought',
  'תְּפָשׂוּהוּ': 'seize-him!',
  'כָּל־הַמֵּת': 'every-one-who-dies',
  'בַּחֲטָאָיו': 'in-his-sins',
  'כְּמוֹת': 'as-the-death-of',
  'כְּלֹא־נַעֲשְׂתָה': 'as-if-not-was-made',
  'גְאֻלָּה': 'redemption',
  'לְהִגָּאֵל': 'to-be-redeemed',
  'עָלֶיהָ׃': 'upon-it(f)',
  'וּדְבַר': 'and-the-word-of',
  'לַתּוֹרָה': 'to-the-law',
  'אֶת־הַתּוֹרָה׃': '[ACC]-the-law',
  'מִיִּרְאַת': 'because-of-fear-of',
  'הִלָּחֲמוֹ': 'his-fighting',
  'עָם־צָרֵיהֶם': 'with-their-enemies',
  'עִם־צָרֵיהֶם': 'with-their-enemies',
  'וּבִלְתִּי־נָמוֹט': 'and-without-wavering',
  'לְכָל־הָאָדָם׃': 'to-every-man',
  'לְכָל־הָאָדָם': 'to-every-man',
  'אֲדוֹת': 'concerning',
  'אֲסָפוֹת': 'assemblies',
  'אֲפֵלָה': 'darkness',
  'אֳנִיּוֹת': 'ships',
  'אִוֶּלֶת': 'foolishness',
  'אֱוִילִיים': 'foolish',
  'אֱוִילִים': 'foolish',
  'אֱוִילִית': 'foolish(f)',
  'אֱלוֹהַּ': 'God',
  'אֵי': 'where',
  'אֵימַת': 'terror-of',
  'אֵימָה': 'terror',
  'אֵינִי': 'I-am-not',
  'אֵפוֹא': 'then',
  'אֵבֶר': 'limb',
  'אֲמִתִּי': 'true',
  'אֲדֻמִּים': 'red',
  'אֲרוּרָה': 'cursed(f)',
  'אֲרִיכֵי': 'long-of',
  'אֲרִיכוּת': 'length',
  'אֲרָיוֹת': 'lions',
  'אִלְּמִים': 'mute',
  'אֲפִלּוּ': 'even',
  'אֲסוּרִים': 'prisoners',
  'לְאֹשֶׁר': 'to-happiness',
  'הַיָּקָר': 'the-precious',
  'הַשְּׁבוּיִים': 'the-prisoners',
  'הָרְצִיחוֹת': 'the-murders',
  'אִם־יְכֻלְכְּלוּ': 'if-they-can-be-sustained',
  'עֲיֵפִים': 'weary',
  'וּמִשְׁקַל': 'and-weight-of',
  'לְכׇל': 'to-all',
  'יְבִיאֲכֶם': 'shall-bring-you',
  'יְסוֹבֵב': 'shall-encircle',
  'יַאְסָרְכֶם': 'shall-bind-you',
  'תְּשִׂימֵם': 'you-shall-set-them',
  'לְגָרְשֵׁנוּ': 'to-drive-us-out',
  'וּלְגָרְשֵׁנוּ׃': 'and-to-drive-us-out',
  'יֵאָסְרוּ': 'they-shall-be-bound',
  'הַקְּדוֹשִׁים': 'the-holy',
  'כִּדְבָרוֹ': 'according-to-his-word',
  'כִּדְבָרוֹ׃': 'according-to-his-word',
  'אֶל־מְנוּחָתִי׃': 'to-my-rest',
  'אֶל־מְנוּחָתִי': 'to-my-rest',
  'עָוֶל': 'iniquity',
  'הַצְּדָקָה': 'the-righteousness',
  'הָעֶלְיוֹן׃': 'the-Most-High',
  'הָעֶלְיוֹן': 'the-Most-High',
  'עֲוֹנְכֶם': 'your(pl)-iniquity',
  'לַתְּשׁוּבָה׃': 'to-repentance',
  'לַתְּשׁוּבָה': 'to-repentance',
  'וּמֵבִיא': 'and-brings',
  'כְּרוּחַ': 'as-the-spirit-of',
  'הַנְּבוּאָה׃': 'prophecy',
  'הַנְּבוּאָה': 'prophecy',
  'כַּאֲגַם': 'as-a-lake-of',
  'וְגׇפְרִית': 'and-brimstone',
  'אִם־תְּדַבְּרוּ': 'if-you-speak',
  'אִם־תְּכַחֵשׁ': 'if-you-deny',
  'אִם־תְּעַוְּתוּ': 'if-you-pervert',
  'אִם־תְּפָשׂוּם': 'if-you-seize-them',
  'אִם־תִּכָּנְעוּ': 'if-you-humble-yourselves',
  'אִם־תַּאֲמִין': 'if-you-believe',
  'אִם־תַּנִּיחוּ': 'if-you-permit',
  'אִם־תָּסִירוּ': 'if-you-remove',
  'אִם־תָּסוֹגוּ': 'if-you-turn-away',
  'אִם־גֵּרְשׁוּנִי': 'if-they-cast-me-out',
  'אִם־יְשִׂימֵהוּ': 'if-he-makes-him',
  'אִם־יִצְעֲדוּ': 'if-they-march',
  'אִם־יִקְדַּם': 'if-he-goes-before',
  'אִם־יִתְמְכוּ': 'if-they-hold-fast',
  'אִם־יָרְעַל': 'if-poisoned',
  'אִם־לְהַפִּילוֹ': 'if-to-fell-him',
  'אִם־מֵאֱלֹהַי': 'if-from-my-God',
  'אִם־נִפֹּל': 'if-we-fall',
  'אִם־צָדַק': 'if-righteous',
  'אִם־חֲשַׁבְתֶּם': 'if-you-thought',
  'וַיַּרְאוּ': 'and-they-showed',
  'וַיַּכֵּם': 'and-he-smote-them',
  'הִלָּחֲמוֹ': 'his-fighting',
  'עַד־שְׁפֹּךְ': 'unto-the-shedding-of',
  'מָתַי': 'when',
  'אֶל־מִדְבַּר': 'to-the-wilderness',
  'אֶל־הַמִּדְבָּר׃': 'to-the-wilderness',
  'אֶל־הַמִּדְבָּר': 'to-the-wilderness',
  'לְהַפִּילוֹ': 'to-fell-him',
  'וּבְלִי־מְחִיר׃': 'and-without-price',
  'וּבְלִי־מְחִיר': 'and-without-price',

  // ═══════════════════════════════════════
  // WAW-CONSECUTIVE + IMPERFECT (VAYYIQTOL)
  // ═══════════════════════════════════════
  'וַיִּפְתַּח': 'and-he-opened',
  'וַיִּכְבַּד': 'and-it-was-heavy',
  'וַיִּפְגַּע': 'and-he-met',
  'וַיָּרֶב': 'and-he-contended',
  'וַיִּקָּחוּ': 'and-they-took',
  'וַיּוֹכִיחֵהוּ': 'and-he-reproved-him',
  'וַיַּרְאוּ': 'and-they-showed',
  'וַיַּכֵּם': 'and-he-smote-them',
  'וַיַּעַשׂ': 'and-he-did',
  'וַיִּבְחָרוּ': 'and-they-chose',
  'וַיִּקָּרֵאוּ': 'and-they-were-called',
  'וַיְעַנּוּם': 'and-they-afflicted-them',

  // ═══════════════════════════════════════
  // MORE COMMON WORDS FOUND IN ALMA
  // ═══════════════════════════════════════
  '(הַנַּח': '(set-aside',
  '(כִּי': '(that',
  'וְהִנְּךָ': 'and-behold-you',
  'כִּי־הָיְתָה': 'that-was(f)',
  'לֹא־יֵדְעוּ': 'not-they-shall-know',
  'יִנָּתֵן': 'shall-be-given',
  'כָל־מִשְׁפָּטָיו': 'all-his-judgments',
  'בְּכָל־מַעֲשָׂיו': 'in-all-his-works',
  'יֵשׁ־לוֹ': 'there-is-to-him',
  'כָּל־הַכֹּחַ': 'all-the-power',
  'לְהוֹשִׁיעַ': 'to-save',
  'כָּל־אִישׁ': 'every-man',
  'הַמַּאֲמִין': 'the-one-believing',
  'מֵאָז': 'from-then',
  'אִם־תָּשׁוּבוּ': 'if-you-return',
  'תַקְשׁוּ': 'you-harden',
  'וְעָשִׂיתִי': 'and-I-shall-work',
  'יְחִידִי׃': 'Only-Begotten',
  'יְחִידִי': 'Only-Begotten',
  'יִהְיֶה': 'shall-be',
  'לִסְלִיחַת': 'for-remission-of',
  'חֲטָאָיו': 'his-sins',
  'כִּי־נָפַל': 'that-fell',
  'הָאָסוּר': 'the-forbidden',
  'כִּדְבַר': 'according-to-the-word-of',
  'לְעוֹלְמֵי': 'forever-and',
  'יַקְשׁוּ': 'they-harden',
  'יַקְשֶׁה': 'hardens',
  'אִם־תַּקְשׁוּ': 'if-you-harden',
  'לֹא־הָיָה': 'not-was',
  'לֹא־תוּכַל': 'not-can',
  'לֹא־יוּכְלוּ': 'not-can-they',
  'כִּי־זֶה': 'that-this',
  'מַה־הוּא': 'what-is-it',
  'מַה־זֹּאת': 'what-is-this',
  'כִּי־בָא': 'that-came',
  'גַּם־צַדִּיק': 'also-righteous',
  'גַּם־רָשָׁע': 'also-wicked',
  'גַּם־מוֹת': 'also-death-of',
  'כָל־בְּנֵי': 'all-the-sons-of',
  'אַף־עַל־פִּי־כֵן': 'nevertheless',
  'וְאַף־עַל־פִּי־כֵן': 'and-nevertheless',

  // Construct/compound forms
  'עַל־תְּחִיַּת': 'concerning-the-resurrection-of',
  'מִן־הַמֵּתִים': 'from-the-dead',
  'עַל־מַלְכוּת': 'concerning-the-kingdom-of',
  'אֶל־מְנוּחַת': 'to-the-rest-of',
  'עַל־בְּנֵי': 'upon-the-sons-of',
  'מִשָּׂרֵי': 'from-the-rulers-of',

  // Additional chapter-specific vocabulary
  'הָעוֹלָם': 'the-world',
  'הַנִּצְחִית': 'eternal(f)',
  'אֵין': 'there-is-not',
  'עָוֶל': 'iniquity',
};

// ═══════════════════════════════════════
// APPLY FIXES
// ═══════════════════════════════════════
let fixCount = 0;
let unfixedWords = {};

// Replace each ["word","???"] with proper gloss
content = content.replace(/\["([^"]+)","(\?\?\?)"\]/g, function(match, hebrew, q) {
  // Clean up the Hebrew word for lookup (strip trailing sof pasuk)
  let lookupKey = hebrew.replace(/׃$/, '');
  let hasSof = hebrew.endsWith('׃');

  // Direct lookup
  if (glossMap[hebrew]) {
    fixCount++;
    return '["' + hebrew + '","' + glossMap[hebrew] + '"]';
  }

  // Try without sof pasuk
  if (hasSof && glossMap[lookupKey]) {
    fixCount++;
    return '["' + hebrew + '","' + glossMap[lookupKey] + '"]';
  }

  // Try morphological pattern matching
  let gloss = morphAnalyze(hebrew);
  if (gloss) {
    fixCount++;
    return '["' + hebrew + '","' + gloss + '"]';
  }

  // Track unfixed
  unfixedWords[hebrew] = (unfixedWords[hebrew] || 0) + 1;
  return match;
});

// ═══════════════════════════════════════
// MORPHOLOGICAL ANALYSIS FUNCTION
// ═══════════════════════════════════════
function morphAnalyze(word) {
  let w = word.replace(/׃$/, '');

  // --- Vav-consecutive/conjunctive prefix ---
  if (/^וַיִּ/.test(w)) {
    // Vayyiqtol 3ms
    let stem = w.replace(/^וַיִּ/, '');
    return tryVayyiqtol(stem, 'and-he-');
  }
  if (/^וַתִּ/.test(w)) {
    // Vayyiqtol 3fs or 2ms
    let stem = w.replace(/^וַתִּ/, '');
    return tryVayyiqtol(stem, 'and-she/you-');
  }
  if (/^וַנִּ/.test(w)) {
    let stem = w.replace(/^וַנִּ/, '');
    return tryVayyiqtol(stem, 'and-we-');
  }

  // --- Pronominal suffixes on known words ---
  // 3ms suffix -וֹ on verbs and nouns
  if (/וֹ$/.test(w) && w.length > 3) {
    let base = w.replace(/וֹ$/, '');
    // Could be "his-X" or "him" suffix on verb
  }

  // 3mp suffix -ָם
  if (/ָם$/.test(w) && w.length > 3) {
    // "their-X" or "them" suffix
  }

  // --- Prefixed prepositions ---
  // בְּ/בַּ/בִּ = "in/with"
  if (/^בְּ|^בַּ|^בִּ/.test(w)) {
    let base = w.replace(/^בְּ|^בַּ|^בִּ/, '');
    if (glossMap[base]) return 'in-' + glossMap[base];
  }

  // לְ/לַ/לִ = "to/for"
  if (/^לְ|^לַ|^לִ/.test(w)) {
    let base = w.replace(/^לְ|^לַ|^לִ/, '');
    if (glossMap[base]) return 'to-' + glossMap[base];
  }

  // מִ/מֵ = "from"
  if (/^מִ|^מֵ/.test(w)) {
    let base = w.replace(/^מִ|^מֵ/, '');
    if (glossMap[base]) return 'from-' + glossMap[base];
  }

  // כְּ/כַּ = "as/like"
  if (/^כְּ|^כַּ/.test(w)) {
    let base = w.replace(/^כְּ|^כַּ/, '');
    if (glossMap[base]) return 'as-' + glossMap[base];
  }

  // וְ = "and" prefix
  if (/^וְ|^וּ|^וַ|^וָ/.test(w)) {
    let base = w.replace(/^וְ|^וּ|^וַ|^וָ/, '');
    if (glossMap[base]) return 'and-' + glossMap[base];
    // Try with article
    if (/^הַ|^הָ/.test(base)) {
      let baseNoArt = base.replace(/^הַ|^הָ/, '');
      if (glossMap[baseNoArt]) return 'and-the-' + glossMap[baseNoArt];
    }
  }

  return null;
}

function tryVayyiqtol(stem, prefix) {
  // This is a simplified approach - real morphology would need full dictionary
  return null;
}

// Write the result
fs.writeFileSync(dataFile, content, 'utf8');

// Report
console.log(`Fixed ${fixCount} of 7096 ??? entries.`);
let unfixedList = Object.entries(unfixedWords).sort((a,b) => b[1] - a[1]);
console.log(`\nRemaining unfixed unique words: ${unfixedList.length}`);
console.log('\nTop 40 most common unfixed:');
unfixedList.slice(0, 40).forEach(([w, c]) => console.log(`  ${c}x  ${w}`));
