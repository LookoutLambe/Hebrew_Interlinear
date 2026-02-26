#!/usr/bin/env node
/**
 * fix_alma_glosses3.js - Pass 3: Comprehensive remaining word fixes
 * Covers all remaining high-frequency and mid-frequency ??? words
 */
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', '_chapter_data', 'al_data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const glossMap = {
  // ═══════════════════════════════════════════════════════════════
  // REMAINING VERBS - ALL BINYANIM, ALL PERSONS
  // ═══════════════════════════════════════════════════════════════

  // --- VAYYIQTOL (Waw-consecutive imperfect) ---
  'וַיָּנָס': 'and-he-fled',
  'וַיָּנֻסוּ': 'and-they-fled',
  'וַיָּסֶת': 'and-he-incited',
  'וַיֵּצֵא': 'and-he-went-out',
  'וַיֵּצְאוּ': 'and-they-went-out',
  'וַיֵּלֶךְ': 'and-he-went',
  'וַיֵּלְכוּ': 'and-they-went',
  'וַיָּמָת': 'and-he-died',
  'וַיָּשָׁב': 'and-he-returned',
  'וַיָּשׁוּבוּ': 'and-they-returned',
  'וַיָּבֹאוּ': 'and-they-came',
  'וַיִּשְׁמַע': 'and-he-heard',
  'וַיִּשְׁמְעוּ': 'and-they-heard',
  'וַיִּרְאוּ': 'and-they-saw',
  'וַיִּנָּשְׂאוּ': 'and-they-were-lifted-up',
  'וַיִּקָּרְאוּ': 'and-they-were-called',
  'וַיִּוָּדְעוּ': 'and-they-were-made-known',
  'וַיִּתְעַצֵּב': 'and-he-was-grieved',
  'וַיִּתְחַזְּקוּ': 'and-they-strengthened-themselves',
  'וַיִּפָּרְדוּ': 'and-they-separated',
  'וַיִּפְנוּ': 'and-they-turned',
  'וַיִּרְחַב': 'and-it-expanded',
  'וַיָּצוּמוּ': 'and-they-fasted',
  'וַיָּפִיצוּ': 'and-they-scattered',
  'וַיַּשִּׂיגוּ': 'and-they-overtook',
  'וַיַּשְׁלִיכוּ': 'and-they-cast-out',
  'וַיַּאַסְרוּהוּ': 'and-they-bound-him',
  'וַיֶּחְפֹּץ': 'and-he-desired',
  'וַיִּבְטְחוּ': 'and-they-trusted',
  'וַיָּכִינוּ': 'and-they-prepared',
  'וַיִּירַשׁ': 'and-he-inherited',
  'וַיְקַצֵּץ': 'and-he-cut-off',
  'וַיֻּכְרְחוּ': 'and-they-were-compelled',
  'וַיַּכֵּם': 'and-he-smote-them',
  'וַיַּרְאוּ': 'and-they-showed',
  'וַיְעַנּוּם': 'and-they-afflicted-them',
  'וַיִּפְגַּע': 'and-he-met',
  'וַיָּרֶב': 'and-he-contended',
  'וַיּוֹכִיחֵהוּ': 'and-he-reproved-him',
  'וַיַּעֲלוּ': 'and-they-went-up',
  'וַיִּכְרְעוּ': 'and-they-bowed',
  'וַיִּצְעֲקוּ': 'and-they-cried-out',
  'וַיִּשְׁתַּחֲווּ': 'and-they-bowed-down',
  'וַיִּשְׁתּוֹמְמוּ': 'and-they-were-astonished',
  'וַיֵּרְדוּ': 'and-they-went-down',
  'וַיֵּאָסְפוּ': 'and-they-gathered',
  'וַיַּעַבְרוּ': 'and-they-crossed',
  'וַיִּלְכְּדוּ': 'and-they-captured',
  'וַיָּחֵלּוּ': 'and-they-began',
  'וַיִּפְקֹד': 'and-he-appointed',
  'וַיַּחֲנוּ': 'and-they-encamped',
  'וַיִּבְנוּ': 'and-they-built',
  'וַיָּרַשׁ': 'and-he-drove-out',
  'וַיַּעֲשׂוּ': 'and-they-did',
  'וַיַּפִּילוּ': 'and-they-felled',
  'וַיָּבוֹא': 'and-he-came',

  // --- HIPHIL PERFECT ---
  'הֵסִיר': 'removed',
  'הֵמִית': 'put-to-death',
  'הֵכִינוּ': 'they-prepared',
  'הֵגֵנּוּ': 'they-defended',
  'הִתְקַבְּצוּ': 'they-gathered-themselves',
  'הִבְרִיחָם': 'their-fleeing',
  'הֵשִׁיב': 'returned/answered',
  'הֶעֱבִיר': 'transferred',
  'הִפִּיל': 'felled',
  'הִרְבָּה': 'multiplied',
  'הִשְׁלִיךְ': 'cast-out',
  'הִכָּה': 'struck',
  'הִצִּיל': 'delivered',
  'הִתְנַגֵּד': 'opposed',
  'הוּמָתוּ': 'were-put-to-death',
  'הוּמָתוּ׃': 'were-put-to-death',

  // --- HIPHIL IMPERFECT ---
  'יוֹשִׁיעַ': 'he-shall-save',
  'לְהוֹשִׁיעָם': 'to-save-them',
  'יְחַזֵּק': 'he-shall-strengthen',
  'יְחַזְּקֵנוּ': 'shall-strengthen-us',
  'יַצִּילֵם': 'shall-deliver-them',
  'וְיוֹצִיא': 'and-shall-bring-out',
  'תוֹסִיף': 'she/you-shall-continue',
  'תוּסַר': 'shall-be-removed',
  'לְהָרִים': 'to-lift-up',
  'לְהָפִיץ': 'to-scatter',
  'לְהֵהָרֵג': 'to-be-slain',

  // --- QAL IMPERFECT (additional) ---
  'תָמוּת': 'you-shall-die',
  'תֵלֵךְ': 'you-shall-go',
  'תֹּאבַד': 'she/you-shall-perish',
  'תָּבֹאנָה': 'they(f)-shall-come',
  'תָחֵלּוּ': 'you(pl)-shall-begin',
  'תַּרְאוּ': 'you(pl)-shall-see',
  'תַּרְאֵנִי': 'you-shall-show-me',
  'תַּסְתִּיר': 'you-shall-hide',
  'תַּחְמֹל': 'you-shall-have-compassion',
  'תִּשָּׂא': 'you-shall-bear',
  'תִּנָּשֵׂא': 'shall-be-exalted',
  'תִּנָּשְׂאוּ': 'you(pl)-shall-be-exalted',
  'תִּלְמַד': 'you-shall-learn',
  'תִּכָּרֵת': 'shall-be-cut-off',
  'תִּזְכֹּר': 'you-shall-remember',
  'תִמְסְרוּ': 'you(pl)-shall-deliver',
  'תֻכֶּה': 'shall-be-struck',
  'תַּעֲרֹבֶת': 'mixture',
  'תְּנַסּוּ': 'you(pl)-shall-test',
  'תְּנַסֶּה': 'you-shall-test',
  'תְּטַפְּחוּהוּ': 'you(pl)-shall-nourish-it',
  'תְּטַפְּחוּ': 'you(pl)-shall-nourish',
  'תְּבִיעָה': 'claim',
  'תְּמִימִים': 'blameless',
  'תְּמִיהָה': 'astonishment',
  'תְּחִלָּה': 'beginning',
  'תְּחִיָּתָם': 'their-resurrection',
  'תְּשׁוּבַתְכֶם': 'your(pl)-repentance',

  // --- QAL PARTICIPLES (more) ---
  'שׁוֹמְרֵי': 'keepers-of',
  'שֹׁפְטֵי': 'judges-of',
  'שֹׁלֵחַ': 'sending',
  'שֹׁכֵב': 'lying-down',
  'רוֹדְפִים': 'pursuing',
  'קוֹרְאִים': 'calling',
  'צוֹמֵחַ': 'growing',
  'צֹעֲדִים': 'marching',
  'עוֹבְרִים': 'passing',
  'עוֹף': 'bird/fowl',
  'נוֹהֲגִים': 'leading',
  'מוֹנֶה': 'counting',
  'מוֹדִיעִים': 'informing',
  'מְצַפִּים': 'watching',
  'מְקַבְּלִים': 'receiving',
  'מְפִיצִים': 'scattering',
  'מִתְאַבְּלִים': 'mourning',
  'מַנִּיחַ': 'permitting',
  'מַסִּית': 'inciter',
  'הָעֹמְדִים': 'the-standing',
  'הָעֲתִידִים': 'the-intended',
  'הַמֹּשֵׁל': 'the-ruler',
  'הַחוֹטֵא': 'the-sinner',
  'תּוֹפֵחַ': 'swelling',
  'בּוֹטְחִים': 'trusting',

  // --- QAL PERFECT (more) ---
  'בָּחֲרוּ': 'they-chose',
  'גָּעֲרוּ': 'they-rebuked',
  'נָטוּ': 'they-turned-aside',
  'סֹבּוּ': 'they-surrounded',
  'קָרוּ': 'they-happened',
  'קָרְעוּ': 'they-tore',
  'קָלַע': 'slung',
  'רַבּוּ': 'they-were-many',
  'לָבְשׁוּ': 'they-put-on',
  'שָׁמְעָה': 'she-heard',
  'אָבִיתִי': 'I-desired',
  'צַמְתִּי': 'I-fasted',

  // --- NIPHAL (more) ---
  'נִתְקוֹמֵם': 'rose-up-against',
  'נִתְהַלֵּל': 'shall-boast',
  'נִתְּרוּ': 'they-were-broken',
  'נִשְׂמַח': 'we-shall-rejoice',
  'נִשְׁתַּכְּרוּ': 'they-became-drunk',
  'נִשְׁמָרִים': 'being-guarded',
  'נִשְׁמָרִים׃': 'being-guarded',
  'נִשְׁמַע': 'was-heard',
  'נִרְמַס': 'was-trampled',
  'נִרְמְסוּ': 'were-trampled',
  'נִקְרֵאתָ': 'you-were-called',
  'נִצְחִי': 'eternal',
  'נִסְבֹּל': 'we-shall-bear',
  'נִמְלְאוּ': 'they-were-filled',
  'נִכְזְבָה': 'was-disappointed(f)',
  'נֻשְׁמַד': 'was-destroyed',
  'נוֹסְדָה': 'was-established(f)',
  'נוֹדְעָה': 'was-made-known(f)',
  'נֶעֶרְמוּ': 'were-heaped-up',
  'נֶאֶמְרָה': 'was-said(f)',
  'נֶאֱלַץ': 'was-compelled',

  // --- PIEL (more) ---
  'לְשַׁלֵּחַ': 'to-send-away',
  'לַמְּדֵם': 'teach-them!',

  // --- PUAL ---
  'מְחֻבָּר': 'joined',

  // --- MORE NOUNS ---
  'הַתְּשַׁע': 'the-nine',
  'הַשֵּׁשׁ': 'the-six',
  'הַחֲמֵשׁ': 'the-five',
  'הַקָּרוּעַ': 'the-torn',
  'הַסֵּתֶר': 'the-secret',
  'הַסִּבָּה': 'the-cause',
  'הַבָּמָה': 'the-high-place',
  'הַאַתָּה': 'are-you',
  'הֲיֵשׁ': 'is-there',
  'הַשְׁכַחְתֶּם': 'have-you(pl)-forgotten',
  'דְבַר': 'word-of',
  'דְּרוֹרָם': 'their-liberty',
  'שַׂעֲרָה': 'storm',
  'שֶׁלָּהֶם': 'theirs',
  'שֵׁרֵת': 'service',
  'שֵׁדִי': 'demons',
  'שִׂמְחָתוֹ': 'his-joy',
  'שִׂמְחָתֵנוּ': 'our-joy',
  'שִׁשָּׁה': 'six',
  'שִׁרְיוֹנֵיהֶם': 'their-armor',
  'שְׂכָרָם': 'their-wages',
  'שְׂדוֹתֵיכֶם': 'your(pl)-fields',
  'שְׂדוֹת': 'fields',
  'שְׁפֹּךְ': 'shedding-of',
  'שְׁלַחְתֶּם': 'you(pl)-sent',
  'שְׁבוּעוֹתֵיהֶם': 'their-oaths',
  'שְׁבוּעָה': 'oath',
  'שְׁבוּיֵינוּ': 'our-captives',
  'שְׁבֻעוֹת': 'oaths',
  'שְׁבַע': 'seven',
  'רוּחֲכֶם': 'your(pl)-spirit',
  'רַעַל': 'poison',
  'רַחֲמֵיהֶם': 'their-compassion',
  'קֻצְּצוּ': 'were-cut-off',
  'קַבֵּל': 'receive!',
  'קְשֵׁה־עֹרֶף': 'stiff-necked',
  'קְשֵׁה־עֹרֶף׃': 'stiff-necked',
  'קְצִירָם': 'their-harvest',
  'קָבְרָם': 'their-burial',
  'פָּגַע': 'met',
  'פְּשָׁעֶיךָ': 'your-transgressions',
  'פְּצָעִים': 'wounds',
  'פְּנֵיכֶם': 'your(pl)-faces',
  'פְּגָשָׁם': 'their-meeting',
  'עוֹדְךָ': 'while-you-are-still',
  'עָרֵי': 'cities-of',
  'עָנִי': 'poor',
  'עַל־עַצְמָם': 'upon-themselves',
  'עַל־עַצְמָם׃': 'upon-themselves',
  'עַל־מִטָּתוֹ': 'upon-his-bed',
  'עַל־כִּסְאוֹתֵיכֶם': 'upon-your(pl)-thrones',
  'עַל־דְּרוֹרָם': 'for-their-liberty',
  'עַל־אֲחֵיהֶם': 'concerning-their-brothers',
  'עַל־אֲחֵיהֶם׃': 'concerning-their-brothers',
  'עֶזְרוֹם': 'Ezrom',
  'עֶזְרָה': 'help',
  'עֶדְרֵינוּ': 'our-flocks',
  'עִמָּךְ': 'with-you(f)',
  'עִמָּךְ׃': 'with-you(f)',
  'עִם־צְבָאוֹתַי': 'with-my-armies',
  'עֲצוֹתָיו': 'his-counsels',
  'עֲמֹל': 'labor',
  'עֲמִינָדִי': 'Aminadi',
  'עֲיֵפוּתָם': 'their-weariness',
  'עֲזַבְתֶּם': 'you(pl)-forsook',
  'עֲזִיבַתְכֶם': 'your(pl)-forsaking',
  'עֲבָדֶיהָ': 'her-servants',
  'סִדְרָם': 'their-order',
  'סְעוֹן': 'Seon',
  'סְנוּמִים': 'Senomites',
  'סְנוּמִים׃': 'Senomites',
  'סְנִינֵה': 'Seninah',
  'סְבִיבוֹתֵינוּ': 'our-surroundings',
  'סְבִיבְכֶם': 'around-you(pl)',
  'נָסִים': 'fleeing',
  'נָכְרִיָּה': 'foreign(f)',
  'נַחְשֹׁב': 'we-shall-think',
  'נַבִּיט': 'we-shall-look',
  'נֶפִיִּים': 'Nephites',
  'נֶפִיִּי': 'Nephite',
  'נְתוּנִים': 'given',
  'נְכַתֵּם': 'we-shall-write',
  'נְהַלֵּל': 'we-shall-praise',
  'נְבוֹנִים': 'understanding',
  'מוּלוֹקִי': 'Muloki',
  'מוֹתִי': 'my-death',
  'מוֹתִי׃': 'my-death',
  'מֻנָּה': 'appointed',
  'מָשָׁל': 'rule/proverb',
  'מָעוֹז': 'stronghold',
  'מָבוֹא': 'entrance',
  'מַעֲשֵׂר': 'tithe',
  'מַעֲמָדוֹ': 'his-standing',
  'מַסְעוֹתֵיהֶם': 'their-journeys',
  'מַכּוֹתֵיהֶם': 'their-wounds',
  'מַחֲשָׁבוֹת': 'thoughts',
  'מַחֲנֵה': 'camp-of',
  'מַה־מְּהֵרָה': 'how-quickly',
  'מֶמְשַׁלְתֵּנוּ': 'our-government',
  'מֵרֹאשָׁם': 'from-their-head',
  'מֵרָעָב': 'from-hunger',
  'מֵרְצוֹנָם': 'from-their-will',
  'מֵעָלֶיךָ': 'from-upon-you',
  'מֵעֶבְדוּת': 'from-bondage',
  'מֵעֲדָתָם': 'from-their-congregation',
  'מֵעֲדָתְךָ': 'from-your-congregation',
  'מֵחֲטָאֵיכֶם': 'from-your(pl)-sins',
  'מֵהָאַמָלִיקְיָהִים': 'from-the-Amalickiahites',
  'מֵאָחִיו': 'from-his-brothers',
  'מֵאַרְצוֹ': 'from-his-land',
  'מֵאַנְשֵׁינוּ': 'from-our-men',
  'מֵאַנְשֵׁיהֶם': 'from-their-men',
  'מֵאֶלֶף': 'from-a-thousand',
  'מֵאֲנָשָׁיו': 'from-his-men',
  'מֵאֱמוּנַתְכֶם': 'from-your(pl)-faith',
  'מִתְּמִיכָתָם': 'from-their-support',
  'מִשְׁמֶרֶת': 'guard/watch',
  'מִשְּׁבוּיֵי': 'from-the-captives-of',
  'מִקְדָּשִׁים': 'sanctuaries',
  'מִן־הַנְּעָרִים': 'from-the-young-men',
  'מִן־הַיָּיִן': 'from-the-wine',
  'מִלָּכֶם': 'from-you(pl)',
  'מִלֶּחִי': 'from-Lehi',
  'מִלְּבָבֵנוּ': 'from-our-hearts',
  'מִכׇּל': 'from-all',
  'מִכֹּחֲכֶם': 'from-your(pl)-strength',
  'מִכָּל־הַכִּכָּר': 'from-all-the-land',
  'מִכַּבְלֵי': 'from-the-bonds-of',
  'מִכִּסֵּא': 'from-the-throne',
  'מִיָּמִין': 'from-the-right',
  'מִבְטַחָם': 'their-trust',
  'מִבְּנוֹתָיו': 'from-his-daughters',
  'מְשִׁיחִיִּים': 'Christians',
  'מְרוֹרִים': 'bitter-things',
  'מְרִידָתָם': 'their-rebellion',
  'מְנוּחָה': 'rest',
  'לָרָע': 'to-evil',
  'לָעָוֶל': 'to-iniquity',
  'לָסוֹג': 'to-turn-back',
  'לָנוּחַ': 'to-rest',
  'לָאֵשׁ': 'to-fire',
  'לַמַּלְכָּה': 'to-the-queen',
  'לַלָּיְלָה': 'by-night',
  'לַלָּיְלָה׃': 'by-night',
  'לַלֵּב': 'to-the-heart',
  'לַחְקֹר': 'to-search-out',
  'לַגּוּף': 'to-the-body',
  'לַגִּבְעָה': 'to-the-hill',
  'לֶכְתּוֹ': 'his-going',
  'לֶאֱמֹן': 'to-believe',
  'לֵאלֹהֵיהֶם': 'to-their-God',
  'לִתְפֹּחַ': 'to-swell',
  'לִקְרָאתוֹ': 'to-meet-him',
  'לִפְקֹד': 'to-appoint',
  'לִנְטוֹת': 'to-stretch-out',
  'לִמְרִיבוֹת': 'to-contentions',
  'לִכְפֹּר': 'to-deny',
  'לִגְזֹל': 'to-rob',
  'לְתִמָּהוֹנוֹ': 'to-his-astonishment',
  'לְשׂוּמוֹ': 'to-place-him',
  'לְשֹׁפֵט': 'to-judge',
  'לְרַחֲמִים': 'to-mercy',
  'לְפִרְיוֹ': 'to-his-fruit',
  'לְעׇנְיוֹ': 'to-his-affliction',
  'לְעַבְדֵי': 'to-the-servants-of',
  'לְעַבְדִּי': 'to-my-servant',
  'לְעֶזְרָתֵנוּ': 'to-our-help',
  'לְמַעֲרָב': 'to-the-west',
  'לְמִחְיָתֵנוּ': 'for-our-sustenance',
  'לְמִבְצָר': 'to-a-fortress',
  'לְכׇל־הָאָרֶץ': 'to-all-the-land',
  'לְכִסֵּא': 'to-the-throne',
  'לְחַכּוֹת': 'to-wait',
  'לְחֶשְׁבּוֹנָם': 'to-their-account',
  'לְחֶשְׁבּוֹנָם׃': 'to-their-account',
  'לְחֵלֶק': 'to-divide',
  'בְּעָרְמָה': 'in-craftiness',
  'בְּעַמּוֹן': 'in-Ammon',
  'בְּלִבּוֹ': 'in-his-heart',
  'בְּיוֹתֵר': 'exceedingly',
  'בְּחָרִיצוּת': 'with-diligence',
  'בְּחַרְבוֹתֵיהֶם': 'with-their-swords',
  'בְּזָרַהֶמְלָה': 'in-Zarahemla',
  'בְּהַצָּלַת': 'in-the-deliverance-of',
  'בְּהִפָּרְדָם': 'when-they-separated',
  'בַּעֲבוֹדָתָם': 'in-their-service',
  'בַּנֶּגֶב': 'in-the-south',
  'בַּמַּעֲרָב': 'in-the-west',
  'בַּאֲחֵיהֶם': 'against-their-brothers',
  'בֶּאֱמוּנַתְכֶם': 'in-your(pl)-faith',
  'בְּרֶצַח': 'in-murder',
  'בְּצִבְאוֹת': 'in-armies-of',
  'אֶת־צְבָאוֹ': '[ACC]-his-army',
  'אֶת־צְבָאוֹ׃': '[ACC]-his-army',
  'אֶת־מַמְלַכְתּוֹ': '[ACC]-his-kingdom',
  'אֶת־מַחֲנֵה': '[ACC]-the-camp-of',
  'אֶת־מֵתֵי': '[ACC]-the-dead-of',
  'אֶת־מִשְׁפְּטֵיהֶם': '[ACC]-their-judgments',
  'אֶל־בֵּיתְךָ': 'to-your-house',
  'אֵיתָנִים': 'strong',
  'וְאֶלָּחֵם': 'and-I-shall-fight',
  'וּרְאוּיִים': 'and-worthy',
  'וְיִירְשׁוּ': 'and-they-shall-inherit',
  'וְהָאֲנָשִׁים': 'and-the-men',
  'וְשָׂרֵי': 'and-princes-of',
  'וְקַשְׁתוֹתֵיהֶם': 'and-their-bows',
  'אַרְצוֹ': 'his-land',
  'תָּם': 'complete/perfect',
  'תִּקּוּן': 'restoration',
  'נָכְרִיָּה': 'foreign(f)',
  'מִשְׂרַת': 'office-of',
  'אֶת־מִשְׂרַת': '[ACC]-the-office-of',
  'יָכִינוּ': 'they-shall-prepare',
  'הַבֵּן': 'the-Son',

  // Additional compound forms
  'אֶת־שְׁבוּיֵי': '[ACC]-the-captives-of',
  'עַל־דִּבְרַת': 'after-the-order-of',
  'אֶת־כׇּל־הַדְּבָרִים': '[ACC]-all-the-things',
  'אֶת־כׇּל־הַדְּבָרִים׃': '[ACC]-all-the-things',
  'וּבִדְבַר': 'and-in-the-matter-of',
  'בִדְבָרִים': 'in-words',
  'וְקֵץ': 'and-end-of',
  'כְּדַעַת': 'according-to-the-knowledge-of',
  'הַמָּלֵא': 'full-of',
  'בְּבָחֳרָם': 'when-they-chose',
  'מִלֶּאֱבֹד': 'rather-than-to-perish',
  'מִלֶּאֱבֹד׃': 'rather-than-to-perish',
  'אִמֵּת': 'truth',
  'תְשׁוּבָה': 'repentance',
  'מוּכָנָה': 'prepared(f)',
};

// Apply fixes
let fixCount = 0;
let totalQ = 0;

content = content.replace(/\["([^"]+)","(\?\?\?)"\]/g, function(match, hebrew) {
  totalQ++;
  if (glossMap[hebrew]) {
    fixCount++;
    return '["' + hebrew + '","' + glossMap[hebrew] + '"]';
  }
  let clean = hebrew.replace(/׃$/, '');
  if (glossMap[clean]) {
    fixCount++;
    return '["' + hebrew + '","' + glossMap[clean] + '"]';
  }

  // Try prefix stripping
  let gloss = tryPrefixes(clean);
  if (gloss) {
    fixCount++;
    return '["' + hebrew + '","' + gloss + '"]';
  }
  return match;
});

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
  // בְּ/בַּ/בִּ
  m = w.match(/^(בְּ|בַּ|בִּ|בָּ|בְ|בַ|בִ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'in-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'in-the-' + glossMap[m2[2]];
  }
  // לְ/לַ/לִ
  m = w.match(/^(לְ|לַ|לִ|לָ|לֶ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'to-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'to-the-' + glossMap[m2[2]];
  }
  // מִ/מֵ
  m = w.match(/^(מִ|מֵ|מְ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'from-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'from-the-' + glossMap[m2[2]];
  }
  // כְּ/כַּ
  m = w.match(/^(כְּ|כַּ|כְ|כַ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'as-' + glossMap[m[2]];
  }
  // הַ/הָ
  m = w.match(/^(הַ|הָ)(.*)/);
  if (m && glossMap[m[2]]) return 'the-' + glossMap[m[2]];

  return null;
}

fs.writeFileSync(dataFile, content, 'utf8');

console.log(`Pass 3 fixed ${fixCount} of ${totalQ} remaining ??? entries.`);
let remaining = content.match(/"\?\?\?"/g);
console.log(`Total remaining ???: ${remaining ? remaining.length : 0}`);
