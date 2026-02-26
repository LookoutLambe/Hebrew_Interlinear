#!/usr/bin/env node
/**
 * fix_alma_glosses2.js - Comprehensive gloss fix for ALL ??? entries in Alma
 * Handles verb conjugations across all binyanim, pronominal suffixes,
 * construct chains, proper nouns, and compound forms.
 */
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', '_chapter_data', 'al_data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const glossMap = {
  // ═══════════════════════════════════════════════════════════════
  // PROPER NOUNS - Book of Mormon names, places, peoples
  // ═══════════════════════════════════════════════════════════════
  'מוֹרֹנִי': 'Moroni',
  'מוֹרוֹנִי': 'Moroni',
  'לְמוֹרוֹנִי': 'to-Moroni',
  'מוֹרוֹנִיהָ': 'Moronihah',
  'לְמוֹרוֹנִיהָ': 'to-Moronihah',
  'נִחוֹר': 'Nehor',
  'נְחוֹר': 'Nehor',
  'אַמְלִיסִי': 'Amlici',
  'לְאַמְלִיסִי': 'to-Amlici',
  'אַמְלִיסִיִּים': 'Amlicites',
  'הָאַמְלִיסִיִּים': 'the-Amlicites',
  'וְהָאַמְלִיסִיִּים': 'and-the-Amlicites',
  'הָעַמְלִיסִים': 'the-Amlicites',
  'וְהָעַמְלִיסִים': 'and-the-Amlicites',
  'עֲמָלֵקִים': 'Amalekites',
  'הָעֲמָלֵקִים': 'the-Amalekites',
  'וְהָעֲמָלֵקִים': 'and-the-Amalekites',
  'לָמוֹנִי': 'Lamoni',
  'לְלָמוֹנִי': 'to-Lamoni',
  'אַנְטִי־נֶפִי־לֶחִי': 'Anti-Nephi-Lehi',
  'אַנְטִי־נֶפִי־לֶחִיִּים': 'Anti-Nephi-Lehites',
  'הָאַנְטִי־נֶפִי־לֶחִיִּים': 'the-Anti-Nephi-Lehites',
  'אַנְטִיפָּרָה': 'Antiparah',
  'לְאַנְטִיפָּרָה': 'to-Antiparah',
  'בְּאַנְטִיפָּרָה': 'in-Antiparah',
  'פָּכוּס': 'Pachus',
  'מֶלֶק': 'Melek',
  'בְּמֶלֶק': 'in-Melek',
  'סֶבוּס': 'Sebus',
  'כּוּמֵנִי': 'Cumeni',
  'בְּכוּמֵנִי': 'in-Cumeni',
  'אַנְטְיוֹנָה': 'Antionah',
  'נְפִיחָה': 'Nephihah',
  'לִנְפִיחָה': 'to-Nephihah',
  'בִּנְפִיחָה': 'in-Nephihah',
  'אַבִּינָדָב': 'Abinadab',
  'אַמּוֹן': 'Ammon',
  'לְאַמּוֹן': 'to-Ammon',
  'אַמּוֹנִיהָ': 'Ammonihah',
  'בְּאַמּוֹנִיהָ': 'in-Ammonihah',
  'לְאַמּוֹנִיהָ': 'to-Ammonihah',
  'מֵאַמּוֹנִיהָ': 'from-Ammonihah',
  'גִּדְעוֹן': 'Gideon',
  'בְּגִדְעוֹן': 'in-Gideon',
  'וְגִדְעוֹן': 'and-Gideon',
  'לְגִדְעוֹן': 'to-Gideon',
  'קוֹרִיאַנְטוֹן': 'Corianton',
  'לְקוֹרִיאַנְטוֹן': 'to-Corianton',
  'זְרַחֶמְלָה': 'Zarahemla',
  'בִּזְרַחֶמְלָה': 'in-Zarahemla',
  'לִזְרַחֶמְלָה': 'to-Zarahemla',
  'מִזְּרַחֶמְלָה': 'from-Zarahemla',
  'מוּלֵק': 'Mulek',
  'הֶלָמָן': 'Helaman',
  'לְהֶלָמָן': 'to-Helaman',
  'שִׁבְלוֹן': 'Shiblon',
  'לְשִׁבְלוֹן': 'to-Shiblon',
  'טֵאַנְכוּם': 'Teancum',
  'לְטֵאַנְכוּם': 'to-Teancum',
  'פָּחוֹרָן': 'Pahoran',
  'לְפָחוֹרָן': 'to-Pahoran',
  'אַמַּלִקְיָה': 'Amalickiah',
  'אַמַּלִקְיָהוּ': 'Amalickiah',
  'לְאַמַּלִקְיָה': 'to-Amalickiah',
  'יִשְׁמָעֵאל': 'Ishmael',
  'יִשְׁמְעֵאלִים': 'Ishmaelites',
  'הַיִּשְׁמְעֵאלִים': 'the-Ishmaelites',
  'אַהֲרֹן': 'Aaron',
  'לְאַהֲרֹן': 'to-Aaron',
  'נֹחַ': 'Noah',
  'אִיזָבֶל': 'Isabel',
  'אִיזָבֶל׃': 'Isabel',
  'לַנֶּפִיִּים': 'to-the-Nephites',
  'זוֹרָמִים': 'Zoramites',
  'הַזּוֹרָמִים': 'the-Zoramites',
  'לַזּוֹרָמִים': 'to-the-Zoramites',
  'הַלָּמָנִים': 'the-Lamanites',
  'לַלָּמָנִים': 'to-the-Lamanites',
  'סִידוֹם': 'Sidom',
  'בְּסִידוֹם': 'in-Sidom',
  'לְסִידוֹם': 'to-Sidom',
  'סֶנוּם': 'Senom',
  'סְנוּם': 'Senom',
  'אַנְטְיוֹנוּם': 'Antionum',
  'בְּאַנְטְיוֹנוּם': 'in-Antionum',
  'לְאַנְטְיוֹנוּם': 'to-Antionum',
  'גִד': 'Gid',
  'לְגִד': 'to-Gid',
  'עֲמוּלֵק': 'Amulek',
  'לַעֲמוּלֵק': 'to-Amulek',
  'וְטֵאוֹמְנֶר': 'and-Teomner',
  'טֵאוֹמְנֶר': 'Teomner',
  'אַנְטִפוּס': 'Antipus',
  'לְאַנְטִפוּס': 'to-Antipus',
  'וְאַנְטִפוּס': 'and-Antipus',
  'וְהִמְנִי': 'and-Himni',
  'הִמְנִי': 'Himni',
  'וּמַתָּן': 'and-Mattan',
  'מַתָּן': 'Mattan',
  'וּמַתַּת': 'and-gift-of',
  'לְלֶחִי': 'to-Lehi',
  'לֶחִי': 'Lehi',
  'יֶרֶד': 'Jared',
  'מַלְכִּי־צֶדֶק': 'Melchizedek',
  'וּמַלְכִּי־צֶדֶק': 'and-Melchizedek',
  'הָעֲמוּלוֹנִים': 'the-Amulonites',
  'וְהָעֲמוּלוֹנִים': 'and-the-Amulonites',
  'עֲמוּלוֹנִים': 'Amulonites',
  'מוֹסִיָה': 'Mosiah',
  'לְמוֹסִיָה': 'to-Mosiah',
  'נֶפִי': 'Nephi',
  'לְנֶפִי': 'to-Nephi',
  'יְאוּס': 'Jeus',
  'אַלְפַּי': 'Alma\'s',
  'עִם־אַלְפַּי': 'with-my-men',
  'אַנְטִי': 'Anti',
  'מִינוֹן': 'Minon',
  'לְמִינוֹן': 'to-Minon',

  // ═══════════════════════════════════════════════════════════════
  // ORDINALS & NUMBERS
  // ═══════════════════════════════════════════════════════════════
  'הַחֲמִישִׁית': 'the-fifth(f)',
  'תְּשַׁע־עֶשְׂרֵה': 'nineteen',
  'שְׁנַיִם': 'two',
  'וַחֲמֵשׁ': 'and-five',
  'שְׂמֹאל': 'left',
  'יָמִין': 'right',

  // ═══════════════════════════════════════════════════════════════
  // QAL PERFECT
  // ═══════════════════════════════════════════════════════════════
  // 3ms
  'נָסַע': 'journeyed',
  'חָרַשׁ': 'was-silent',
  'עָמַל': 'labored',
  'חִזֵּק': 'strengthened',
  'פָּגַשׁ': 'met',
  'טָמַן': 'laid',
  'גָּזַר': 'decreed',
  'חָנָה': 'encamped',
  'רָדַף': 'pursued',
  'מָרַד': 'rebelled',
  'בָּנָה': 'built',
  'כָּבַשׁ': 'subdued',
  'סָבַב': 'surrounded',
  'רָצָה': 'desired',
  'שָׂרַף': 'burned',
  'כָּרַע': 'bowed',
  // 3cp
  'נִסּוּ': 'fled',
  'נָסוֹגוּ': 'retreated',
  'נִפְרְדוּ': 'separated',
  'נִבְחֲרוּ': 'were-chosen',
  'נִזְכְּרוּ': 'remembered',
  'נִלְחֲמוּ': 'fought',
  'נִבְהֲלוּ': 'were-terrified',
  'נִמְשְׁכוּ': 'were-drawn',
  'נִשְׁלְחוּ': 'were-sent',
  'רָצוּ': 'ran',
  'צָעֲדוּ': 'marched',
  'חָגְרוּ': 'girded',
  'שָׁבִים': 'returning',
  // 2ms
  'שָׁפַכְתָּ': 'you-poured-out',
  'אָשַׁמְתָּ': 'you-were-guilty',
  'שִׁקַּרְתָּ': 'you-lied',
  // 1cs
  'חָפַצְתִּי': 'I-desired',
  'נִשְׁבַּעְתִּי': 'I-swore',
  'נִקְרֵאתִי': 'I-was-called',
  'דִּבַּרְתִּי': 'I-spoke',
  // 1cp
  'עָשִׂינוּ': 'we-did',
  'לָקַחְנוּ': 'we-took',
  'חָמַלְנוּ': 'we-had-compassion',
  'אִחַדְנוּ': 'we-united',
  'נִצַּלְנוּ': 'we-were-delivered',
  // 2mp
  'נְתַתֶּם': 'you(pl)-gave',
  'הֻכְרַחְתֶּם': 'you(pl)-were-compelled',

  // ═══════════════════════════════════════════════════════════════
  // QAL IMPERFECT (yiqtol)
  // ═══════════════════════════════════════════════════════════════
  // 3ms
  'יוֹשִׁיעַ': 'he-shall-save',
  'יְחַזֵּק': 'he-shall-strengthen',
  // 3mp
  'יִרְעֲדוּ': 'they-shall-tremble',
  'יֶחֶטְאוּ': 'they-shall-sin',
  'יִצְעֲדוּ': 'they-shall-march',
  'יִפְגְּשׁוּ': 'they-shall-meet',
  'יַעֲזוּ': 'they-shall-dare',
  // 3fs
  'תִּמָּלֵא': 'she/it-shall-be-filled',
  // 2ms
  'תִּתֵּן': 'you-shall-give',
  'תִּתֶּן': 'you-shall-give',
  'תִשְׁמֹר': 'you-shall-keep',
  'תְּכַחֵשׁ': 'you-shall-deny',
  'תִכָּנְעוּ': 'you(pl)-shall-humble',
  'תִחְיוּ': 'you(pl)-shall-live',
  // 2mp
  'הֲתוֹסִיפוּ': 'shall-you(pl)-continue',
  // 1cs
  'אֶתְהַלֵּל': 'I-shall-boast',
  'אֶהְיֶה': 'I-shall-be',
  'אֶהֱרֹג': 'I-shall-slay',
  'אֶדָּעֲךָ': 'I-shall-know-you',
  'אֵדַע': 'I-shall-know',
  'אֶחְמֹל': 'I-shall-have-compassion',
  'אֶחְדַּל': 'I-shall-cease',
  'אֶחְדַּל׃': 'I-shall-cease',
  'אֶגְרֹם': 'I-shall-cause',
  'אֲגַלֶּה': 'I-shall-reveal',
  'אֲחַלֶּה': 'I-shall-beseech',
  'אֲקַבֵּל': 'I-shall-receive',
  'אֲקַוֶּה': 'I-shall-hope',
  'אֲצַפֶּה': 'I-shall-watch',
  'אֲפָרֵשׁ': 'I-shall-spread-out',
  'אֲפָרְשֶׁנּוּ': 'I-shall-spread-it-out',
  'אִוָּכַח': 'I-shall-contend',
  'אִוָּלֵד': 'I-shall-be-born',
  'אִירָא': 'I-shall-fear',
  // 1cp
  'נוֹדֶה': 'we-shall-give-thanks',
  'נָשׁוּבָה': 'let-us-return',
  'נָבוֹאָה': 'let-us-come',
  'נַחֲזִיק': 'we-shall-hold-fast',
  'נַחְפֹּץ': 'we-shall-desire',

  // ═══════════════════════════════════════════════════════════════
  // QAL PARTICIPLE
  // ═══════════════════════════════════════════════════════════════
  'בּוֹטֵחַ': 'trusting',
  'רֹעֶה': 'shepherd',
  'חוֹשֵׁב': 'thinking',
  'חוֹלֶה': 'sick',
  'חוֹתֵם': 'sealing',
  'אוֹמֶרֶת': 'saying(f)',
  'נוֹסְעִים': 'journeying',
  'נֹשְׂאִים': 'bearing',
  'שֹׁכְבִים': 'lying-down',
  'יְשֵׁנִים': 'sleeping',
  'מְלַמֵּד': 'teaching',
  'מְשַׁנֶּה': 'changing',
  'רָעֵב': 'hungry',
  'עֲיֵפִים': 'weary',
  'מְעֻנִּים': 'afflicted',
  'חֲמוּשִׁים': 'armed',
  'אֲסוּרִים': 'prisoners',
  'מְרַגְּלִים': 'spies',
  'מַסְפִּיק': 'sufficient',
  'הַשָּׁב': 'the-one-returning',
  'הַמְשַׁקְּרִים': 'the-liars',
  'הָרוֹצֵחַ': 'the-murderer',
  'הַנּוֹדָע': 'the-known',
  'יוֹרֵשׁ': 'inheriting',
  'דֹּרֵשׁ': 'seeking',
  'מְהֻלָּל': 'praised',
  'לָעֹמְדִים': 'to-those-standing',
  'הַנּוֹגְעִים': 'pertaining',
  'הַמִּתְהַפֶּכֶת': 'the-turning',
  'נָתוּן': 'given',
  'נָחוּץ': 'necessary',
  'צָרִיךְ': 'necessary',
  'וְיוֹדְעֵי': 'and-knowers-of',

  // ═══════════════════════════════════════════════════════════════
  // QAL IMPERATIVE
  // ═══════════════════════════════════════════════════════════════
  'אֱמֹר': 'say!',
  'אִמְּצוּ': 'be-strong!',
  'שׁוּם': 'put!',
  'רְדָפוּם': 'pursue-them!',

  // ═══════════════════════════════════════════════════════════════
  // QAL INFINITIVE CONSTRUCT
  // ═══════════════════════════════════════════════════════════════
  'לִפֹּל': 'to-fall',
  'לִשְׁדֹד': 'to-plunder',
  'לַעֲזֹר': 'to-help',
  'לְשַׁנּוֹת': 'to-change',
  'לְחַפֵּשׂ': 'to-search',
  'לִלְכֹּד': 'to-capture',
  'לָגֶשֶׁת': 'to-approach',
  'לְרַגְלֵי': 'at-the-feet-of',
  'לֶאֱסֹר': 'to-bind',
  'לִנְקֹם': 'to-avenge',
  'לִירֹשׁ': 'to-inherit',
  'לִצְפּוֹת': 'to-watch',
  'לְכַפֵּר': 'to-atone',
  'לַחֲרוֹת': 'to-engrave',
  'לְהָפֵר': 'to-break/annul',
  'לְהַכְרִית': 'to-cut-off',
  'לְהָפִיץ': 'to-scatter',
  'לְהֵהָרֵג': 'to-be-slain',
  'לְהִתְקִיף': 'to-strengthen',
  'לְהִתְהַלֵּל': 'to-boast',
  'לְהִתְוַכֵּחַ': 'to-contend',
  'לְהִשָּׁחֵת': 'to-be-destroyed',

  // ═══════════════════════════════════════════════════════════════
  // NIPHAL
  // ═══════════════════════════════════════════════════════════════
  'נֶעֱנַשׁ': 'was-punished',
  'נֶעֶנְשׁוּ': 'were-punished',
  'נִשְׁמְעוּ': 'were-heard',
  'נִתְפַּשְׂתָּ': 'you-were-caught',
  'נִגְזַר': 'was-decreed',
  'נִגְלוּ': 'were-revealed',
  'נִפְלָא': 'wondrous',
  'נִתֶּנֶת': 'is-given(f)',
  'נִשְׁמְרָה': 'was-guarded(f)',
  'נִשְׁפֹּךְ': 'was-poured-out',
  'נֶחְשְׁבוּ': 'were-considered',
  'נוֹשָׁעוּ׃': 'were-saved',
  'נוֹשָׁעוּ': 'were-saved',

  // ═══════════════════════════════════════════════════════════════
  // PIEL
  // ═══════════════════════════════════════════════════════════════
  'לְבָאֵר': 'to-explain',
  'וּלְבָאֵר': 'and-to-explain',
  'לְקַיֵּם': 'to-establish',
  'וּלְקַיֵּם': 'and-to-establish',
  'לְשַׁקֵּר': 'to-lie',
  'וּלְרַמּוֹת': 'and-to-deceive',
  'לְגַדֵּף': 'to-revile',
  'לְכַלְכְּלוֹ': 'to-sustain-him',
  'לִמְכַזֵּב': 'to-be-a-liar',
  'תְּנַחֵם': 'shall-comfort',
  'לַמְּדֵם': 'teach-them!',

  // ═══════════════════════════════════════════════════════════════
  // HIPHIL
  // ═══════════════════════════════════════════════════════════════
  'הֶעֱמִיד': 'established',
  'הוֹדָה': 'confessed',
  'הוֹדִיעָם': 'made-known-to-them',
  'וְהוֹדִיעָם': 'and-made-known-to-them',
  'הוֹדִיעוֹ': 'made-known-to-him',
  'לְהוֹרֹת': 'to-teach',
  'לְהַשְׁמִידוֹ': 'to-destroy-him',
  'לְהַשְׁלִיכָם': 'to-cast-them-out',
  'לְהַסְתִּירֵנוּ': 'to-hide-us',
  'הִכְנִיעָם': 'has-subjected-them',
  'מֵהִתְפַּשֵּׁט': 'from-spreading',
  'יַצִּילֵם': 'shall-deliver-them',
  'יְחַזְּקֵנוּ': 'shall-strengthen-us',
  'וְיוֹצִיא': 'and-shall-bring-out',

  // ═══════════════════════════════════════════════════════════════
  // HOPHAL
  // ═══════════════════════════════════════════════════════════════
  'הוּבְאָה': 'was-brought(f)',
  'הוּשְׂמוּ': 'were-placed',
  'יוּשַׁב': 'was-settled',

  // ═══════════════════════════════════════════════════════════════
  // HITHPAEL
  // ═══════════════════════════════════════════════════════════════
  'וְהִתְהַלְּכוֹ': 'and-his-walking',
  'וַיִּתְנַכְּרוּ': 'and-they-dissembled',
  'וְיִשְׁתַּנֶּה': 'and-shall-be-changed',

  // ═══════════════════════════════════════════════════════════════
  // VAYYIQTOL (WAW-CONSECUTIVE)
  // ═══════════════════════════════════════════════════════════════
  'וַיִּפְתַּח': 'and-he-opened',
  'וַיִּכְבַּד': 'and-it-was-heavy',
  'וַיִּפְגַּע': 'and-he-met',
  'וַיָּרֶב': 'and-he-contended',
  'וַיִּקָּחוּ': 'and-they-took',
  'וַיּוֹכִיחֵהוּ': 'and-he-reproved-him',
  'וַיַּרְאוּ': 'and-they-showed',
  'וַיַּכֵּם': 'and-he-smote-them',
  'וַיִּבְטְחוּ': 'and-they-trusted',
  'וַיִּתְחַזְּקוּ': 'and-they-strengthened-themselves',
  'וַיָּכִינוּ': 'and-they-prepared',
  'וַיִּירַשׁ': 'and-he-inherited',
  'וַיְקַצֵּץ': 'and-he-cut-off',
  'וַיְעַנּוּם': 'and-they-afflicted-them',
  'וַיֻּכְרְחוּ': 'and-they-were-compelled',
  'וַיָּצוּמוּ': 'and-they-fasted',
  'וַיָּפִיצוּ': 'and-they-scattered',
  'וַיָּסֶת': 'and-he-incited',
  'וַיַּשִּׂיגוּ': 'and-they-overtook',
  'וַיַּשְׁלִיכוּ': 'and-they-cast-out',
  'וַיַּאַסְרוּהוּ': 'and-they-bound-him',
  'וַיֶּחְפֹּץ': 'and-he-desired',
  'וַיִּתְעַצֵּב': 'and-he-was-grieved',
  'וַיִּרְחַב': 'and-it-expanded',
  'וַיִּפָּרְדוּ': 'and-they-separated',
  'וַיִּפְנוּ': 'and-they-turned',
  'וַיִּוָּדְעוּ': 'and-they-made-known',
  'וַיִּקְרְאוּ': 'and-they-called',
  'וַיִּקָּרְאוּ': 'and-they-were-called',
  'וַיָּעֳמְדוּ': 'and-they-were-ordained',
  'וַיְקַבֵּל': 'and-he-received',
  'וַיִּמְלֹךְ': 'and-he-reigned',
  'וַיָּקֶם': 'and-he-established',
  'הָעֳמְדוּ': 'were-ordained',

  // ═══════════════════════════════════════════════════════════════
  // NOUNS WITH PRONOMINAL SUFFIXES
  // ═══════════════════════════════════════════════════════════════
  // 3ms (-וֹ)
  'תְּפָשׂוֹ': 'caught-him',
  'בְּכַחֲשׁוֹ': 'in-his-lying',
  'וּבְמִרְמָתוֹ': 'and-in-his-deceit',
  'אַשְׁמָתוֹ': 'his-guilt',
  'רְצוֹנוֹ': 'his-will',
  'כִּרְצוֹנוֹ': 'according-to-his-will',
  'לֶהָבָתוֹ': 'its-flame',
  'אֵינוֹ': 'he-is-not',
  'כְּבוֹדוֹ': 'his-glory',
  'וּבְכֹחוֹ': 'and-in-his-power',
  'בְּהוֹדוֹ': 'in-his-majesty',
  'וּבְמַמְלַכְתּוֹ': 'and-in-his-kingdom',
  'חֲרוֹנוֹ': 'his-wrath',
  'דָמוֹ': 'his-blood',
  'חׇכְמָתוֹ': 'his-wisdom',
  'מַלְאָכוֹ': 'his-angel',
  'כִּרְאוֹתוֹ': 'when-he-saw',
  'מִצְּבָאוֹ': 'from-his-army',
  'אֶת־מְנוּחָתוֹ׃': '[ACC]-his-rest',
  'אֶל־מְנוּחָתוֹ׃': 'to-his-rest',
  'מִצְוֹתָיו': 'his-commandments',
  'קָדְשׁוֹ': 'his-holiness',
  'מֵרוּחוֹ': 'from-his-spirit',
  'בְּיָמָיו': 'in-his-days',
  'בְּרוּחוֹ': 'by-his-spirit',
  'בְּרוּחוֹ׃': 'by-his-spirit',

  // 3fs (-ָהּ)
  'אֵינָהּ': 'she/it-is-not',
  'אִישָׁהּ': 'her-husband',
  'לַעֲשׂוֹתָהּ': 'to-do-it(f)',
  'עָלֶיהָ': 'upon-her/it',
  'עָלֶיהָ׃': 'upon-her/it',

  // 3mp (-ָם / -ֵיהֶם)
  'צְבָאוֹתָם': 'their-armies',
  'עִנּוּיֵיהֶם': 'their-afflictions',
  'מִמּוֹרֵיהֶם': 'from-their-teachers',
  'אֵימָתָם': 'their-terror',
  'אֲבָנֵיהֶם': 'their-stones',
  'חִצֵּיהֶם': 'their-arrows',
  'וְחִצֵּיהֶם': 'and-their-arrows',
  'אִמּוֹתֵיהֶם': 'their-mothers',
  'אִמּוֹתֵיהֶם׃': 'their-mothers',
  'מַכּוֹתָיו': 'his-wounds',
  'שַׁרְשְׁרוֹתָיו': 'his-chains',
  'בְּשַׁרְשְׁרוֹתָיו': 'in-his-chains',
  'עֶדְרֵיהֶם': 'their-flocks',
  'עִם־עֶדְרֵיהֶם': 'with-their-flocks',
  'רְצִיחוֹתֵיהֶם': 'their-murders',
  'קְרוֹבֵיהֶם': 'their-relatives',
  'וְקַשְׁתוֹתֵיהֶם': 'and-their-bows',
  'בְּמִבְצְרֵיהֶם׃': 'in-their-fortifications',
  'בְּמִבְצְרֵיהֶם': 'in-their-fortifications',
  'כְנֵסִיּוֹתֵיכֶם': 'your(pl)-synagogues',
  'מֵאַהֲבָתָם': 'from-their-love',
  'צְבָאָם': 'their-army',
  'מִיֵּינָם': 'from-their-wine',
  'אֱמוּנָתָם': 'their-faith',
  'וְצִדְקָתָם': 'and-their-righteousness',

  // 2ms (-ְךָ)
  'בְּכַחֲשְׁךָ': 'in-your-lying',
  'וּבְעָרְמָתְךָ': 'and-in-your-craftiness',
  'מַחְשְׁבוֹתֶיךָ': 'your-thoughts',
  'מְזִמָּתְךָ': 'your-scheme',
  'נַפְשְׁךָ': 'your-soul',
  'צֹרְרְךָ': 'your-adversary',
  'אֵינְךָ': 'you-are-not',
  'דִּינְךָ': 'your-judgment',
  'בִּרְאוֹתְךָ': 'when-you-saw',
  'עַצְמְךָ': 'yourself',
  'מִשְׁפַּטְכֶם': 'your(pl)-judgment',

  // 2fs (-ֵךְ)
  'אֱמוּנָתֵךְ': 'your(f)-faith',

  // 1cs (-ִי)
  'אִגַּרְתִּי': 'my-epistle',
  'אֶת־אִגַּרְתִּי': '[ACC]-my-epistle',
  'אֵבָרַי': 'my-limbs',
  'חֲבֵרַי': 'my-companions',
  'חַטֹּאתַי': 'my-sins',
  'אֵינִי': 'I-am-not',

  // 1cp (-ֵנוּ)
  'אֲחֻזָּתֵנוּ': 'our-possession',
  'אִמּוֹתֵינוּ': 'our-mothers',
  'אִמּוֹתֵינוּ׃': 'our-mothers',
  'מַסָּעֵנוּ': 'our-journey',
  'מִלְחַמְתֵּנוּ': 'our-war',

  // 2mp (-כֶם)
  'אֲחֻזַּתְכֶם': 'your(pl)-possession',
  'עָנְיְכֶם': 'your(pl)-affliction',

  // 3mp (-ָם)
  'עָנְיָם': 'their-affliction',

  // ═══════════════════════════════════════════════════════════════
  // STANDALONE NOUNS & ADJECTIVES
  // ═══════════════════════════════════════════════════════════════
  'מִלְחֶמֶת': 'war-of',
  'מִלְחָמָה': 'war',
  'מִיתַת': 'death-of',
  'בּוּשָׁה': 'shame',
  'בּוּשָׁה׃': 'shame',
  'כְהֻנַּת־שֶׁקֶר': 'priestcraft',
  'בִּכְהֻנַּת־שֶׁקֶר': 'in-priestcraft',
  'תּוֹסֶפֶת': 'addition',
  'מַצַּב': 'state',
  'נִצָּחוֹן': 'victory',
  'הַצְלָחָה': 'success',
  'בַּיִת': 'house',
  'מִבַּיִת': 'from-within',
  'בַיָּמִים': 'in-the-days',
  'טַעַם': 'reason',
  'רְדִיפָה': 'persecution',
  'בְּחֵמָה': 'in-wrath',
  'לְצָרָה': 'to-affliction',
  'לְמַסָּה': 'to-trial',
  'לְמַכּוֹת': 'to-smite',
  'בְּאֶגְרוֹף': 'with-fist',
  'בְּאֶגְרוֹף׃': 'with-fist',
  'שַׁרְשְׁרוֹת': 'chains',
  'דִּבְרַת': 'the-order-of',
  'הַדִּבְרָה': 'the-manner',
  'בַּדְּרוֹר': 'in-liberty',
  'אֲחֻזָּה': 'possession',
  'אֲחֻזַּת': 'possession-of',
  'מְזִמָּה': 'scheme',
  'עֲרוּמָה': 'crafty',
  'כְּעָרְמַת': 'as-the-craftiness-of',
  'פַח': 'snare',
  'הַצֹּרֵר': 'the-adversary',
  'שְׁבִי': 'captivity',
  'שִׁבְיוֹ': 'his-captivity',
  'שִׁבְיוֹ׃': 'his-captivity',
  'הַכָּרַת': 'the-consciousness-of',
  'כֵּס': 'throne',
  'מוּפָרָה': 'frustrated',
  'תֹּקֶף': 'force',
  'תֹּקֶף׃': 'force',
  'הֲכָנָה': 'preparation',
  'הַהֲכָנָה': 'the-preparation',
  'שָׁחַת': 'destruction',
  'שָׁחַת׃': 'destruction',
  'לְשַׁחַת': 'to-destruction',
  'כְּצֶדֶק': 'according-to-the-justice-of',
  'כְּחֶסֶד': 'according-to-the-mercy-of',
  'פַּחַד': 'fear/dread',
  'עֹל': 'yoke',
  'שִׂמְחַת': 'joy-of',
  'בְּחֶבְלֵי': 'in-the-bonds-of',
  'הַאִם': 'whether',
  'בְּנָקֵל': 'easily',
  'וּבִרְכַּת': 'and-blessing-of',
  'אָשֵׁם': 'guilty',
  'וְהַשֹּׁפֵט': 'and-the-judge',
  'הַיָּחִיד': 'the-Only-Begotten',
  'הַחֹפֶשׁ': 'the-freedom',
  'הַהֶרֶג': 'the-slaughter',
  'מִמִּזְרַח': 'from-the-east',
  'לַשֹּׁפְטִים': 'to-the-judges',
  'כְּבוֹא': 'when-came',
  'הַמַּעֲרָב': 'the-west',
  'לִגְבוּלוֹת': 'to-the-borders-of',
  'מְקוֹמוֹת': 'places',
  'מַעְצוֹר': 'restraint',
  'מְרִידוֹת': 'rebellions',
  'אוּצָרוֹת': 'storehouses',
  'שְׂכַר': 'wages',
  'רֶוַח': 'relief',
  'קָרְבָה': 'drew-near(f)',
  'מִנֶּגֶד': 'from-opposite',
  'מִיַּם': 'from-the-sea',
  'לָעִיר': 'to-the-city',
  'לַנָּהָר': 'to-the-river',
  'כְּנֵסֶת': 'synagogue',
  'כֹהֲנִים': 'priests',
  'הַכְּהֻנָּה': 'the-priesthood',
  'וְהַכְּהֻנָּה': 'and-the-priesthood',
  'לַכְּהֻנָּה': 'to-the-priesthood',
  'לִכְהֻנַּת': 'to-the-priesthood-of',
  'שְׁבוּיֵי': 'captives-of',
  'אֶת־שְׁבוּיֵי': '[ACC]-the-captives-of',
  'כִּשְׁבוּיֵי': 'as-captives-of',
  'הַשְּׁבוּיִים': 'the-prisoners',
  'הָרְצִיחוֹת': 'the-murders',
  'לְכָזֶה': 'like-this',
  'וְכָהֵנָּה': 'and-like-these',
  'לְתִמְהוֹנָם': 'to-their-astonishment',
  'לְקֵץ': 'to-the-end-of',
  'לְצֶדֶק': 'to-righteousness',
  'חׇכְמָה': 'wisdom',
  'אֳנִיּוֹת': 'ships',
  'אֱלוֹהַּ': 'God',
  'אִוֶּלֶת': 'foolishness',
  'אֱוִילִיים': 'foolish',
  'אֱוִילִים': 'foolish',
  'אֱוִילִית': 'foolish(f)',
  'אֵי': 'where',
  'אֵימַת': 'terror-of',
  'אֵימָה': 'terror',
  'אֵפוֹא': 'then',
  'אֵבֶר': 'limb',
  'אֵיבְרֵי': 'limbs-of',
  'אֲמִתִּי': 'true',
  'אִמֵּת': 'truth',
  'אֲדֻמִּים': 'red',
  'אֲרוּרָה': 'cursed(f)',
  'אֲרִיכֵי': 'long-of',
  'אֲרִיכוּת': 'length-of',
  'אֲרָיוֹת': 'lions',
  'אִלְּמִים': 'mute',
  'אֲפִלּוּ': 'even',
  'אֲפֵלָה': 'darkness',
  'אֲדוֹת': 'concerning',
  'אֲסָפוֹת': 'assemblies',
  'אֲבֵדָה': 'destruction',
  'אֲבַדַּן': 'destruction',
  'לְאֹשֶׁר': 'to-happiness',
  'הַיָּקָר': 'the-precious',
  'וּמִשְׁקַל': 'and-the-weight-of',
  'לְכׇל': 'to-all',
  'וְכׇל': 'and-all',
  'בְּגָלוּי': 'plainly',
  'לְאֵין־מָוֶת': 'to-immortality',
  'וְעַל־הֲבָאָה': 'and-upon-the-bringing',
  'תְמִימִים': 'blameless',
  'גְאֻלָּה': 'redemption',
  'לְהִגָּאֵל': 'to-be-redeemed',
  'מוּפָרָה': 'frustrated',
  'שַׁרְשְׁרוֹת': 'chains',
  'שְׁאוֹל': 'Sheol',
  'שְׁאוֹל׃': 'Sheol',
  'הַקְּדוֹשִׁים': 'the-holy',
  'הַקְּדוֹשָׁה': 'the-holy(f)',
  'נוֹכַח': 'convinced',
  'תְּשׁוּקַת': 'desire-of',
  'וּדְרוֹרָם': 'and-their-liberty',
  'וּצְבָאוֹ': 'and-his-army',
  'לְעַמּוֹן': 'to-Ammon',
  'לְעַמּוֹ': 'to-his-people',
  'וְעַבְדֵי': 'and-servants-of',
  'וְשָׂרֵי': 'and-princes-of',
  'פִּשְׁעֵי': 'transgressions-of',
  'חֲטָאֵי': 'sins-of',
  'עֲמָלָם': 'their-labor',
  'מָתַי': 'when',
  'וָצֶדֶק': 'and-righteousness',
  'אֶת־מִשְׂרַת': '[ACC]-the-office-of',
  'עַל־דִּבְרַת': 'after-the-order-of',
  'בִדְבָרִים': 'in-words',
  'וְקֵץ': 'and-end-of',
  'כְּדַעַת': 'according-to-the-knowledge-of',
  'אֶת־כׇּל־הַדְּבָרִים׃': '[ACC]-all-the-things',
  'אֶת־כׇּל־הַדְּבָרִים': '[ACC]-all-the-things',
  'הַמָּלֵא': 'full-of',
  'בְּבָחֳרָם': 'when-they-chose',
  'מִלֶּאֱבֹד׃': 'rather-than-to-perish',
  'מִלֶּאֱבֹד': 'rather-than-to-perish',
  'תְשׁוּבָה': 'repentance',
  'בָּאֲנָשִׁים': 'among-men',
  'לִנְפִיהָ': 'to-Nephihah',
  'לִנֶפִיה': 'to-Nephihah',
  'בְּדִבְרַת': 'after-the-order-of',
  'מוּכָנָה': 'prepared(f)',
  'יָכִינוּ': 'they-shall-prepare',
  'הַבֵּן': 'the-Son',
  'לָאָב': 'to-the-Father',

  // ═══════════════════════════════════════════════════════════════
  // COMPOUND PHRASES & COMMON CONSTRUCTIONS
  // ═══════════════════════════════════════════════════════════════
  'מַה־זֹּאת': 'what-is-this',
  '(הַנַּח': '(set-aside',
  '(כִּי': '(that',
  'וְהִנְּךָ': 'and-behold-you',
  'כִּי־הָיְתָה': 'that-was(f)',
  'לֹא־יֵדְעוּ': 'not-they-shall-know',
  'כָּל־מַעֲשֵׂינוּ': 'all-our-works',
  'כְּמַעֲשֵׂינוּ': 'according-to-our-works',
  'כְּמַעֲשֵׂינוּ׃': 'according-to-our-works',
  'דְבָרֵינוּ': 'our-words',
  'יַרְשִׁיעוּנוּ': 'shall-condemn-us',
  'וּבָרָעָה': 'and-in-evil',
  'נָעֵז': 'we-shall-dare',
  'וְנִשְׂמַח': 'and-we-shall-rejoice',
  'וְהֶהָרִים': 'and-the-mountains',
  'אֶת־הַכְּרֻבִים': '[ACC]-the-cherubim',
  'וְאֶת־לַהַט': 'and-[ACC]-the-flame-of',
  'לְגַן־עֵדֶן': 'to-the-garden-of-Eden',
  'פֶּן־יִגְּשׁוּ': 'lest-they-approach',
  'וְאָכְלוּ': 'and-eat',
  'וָחָי': 'and-live',
  'בְּאָכְלוֹ': 'in-his-eating',
  'בְּנָפְלוֹ': 'in-his-falling',
  'וְנוֹפֵל': 'and-fallen',
  'וְנוֹפֵל׃': 'and-fallen',
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
  'מִיסוֹד': 'from-the-foundation-of',
  'הָרִאשׁוֹנוֹת': 'the-first(fp)',
  'תְחִלָּה': 'first',
  'לִפְעֹל': 'to-act',
  'בְּמִצְוֹתָיו': 'in-his-commandments',
  'הַשְּׁנִיּוֹת': 'the-second(fp)',
  'כׇּל־הַשָּׁב': 'everyone-who-repents',
  'בַחֲרוֹנִי': 'in-my-wrath',
  'יַכְעִיסֵהוּ': 'shall-provoke-him',
  'וְיוֹרִיד': 'and-shall-bring-down',
  'כַּמְּרִיבָה': 'as-the-provocation',
  'בַּמְּרִיבָה': 'in-the-provocation',
  'לָרִאשׁוֹן': 'as-the-first',
  'לָרִאשׁוֹן׃': 'as-the-first',
  'בִּרְאוֹתֵנוּ': 'seeing',
  'וְאַל־נַקְשֶׁה': 'and-let-us-not-harden',
  'פֶּן־נַכְעִיס': 'lest-we-provoke',
  'לְהוֹרִיד': 'to-bring-down',
  'וָיוֹתֵר': 'and-more',
  'וְלַעֲמוּלֶק': 'and-to-Amulek',
  'וּמְזִמּוֹתָיו': 'and-his-schemes',
  'לָתֶת': 'to-give',
  'וְלָתֶת־לוֹ': 'and-to-give-to-him',
  'וְלִלְבֹּשׁ': 'and-to-clothe',
  'לַמַּאֲמִינִים': 'to-the-believers',
  'הֲרָגוֹ': 'his-slaying',
  'עַל־הַפְּשָׁעִים': 'concerning-the-transgressions',
  'גַם־בִּקַּשְׁתָּ': 'also-you-sought',
  'תְּפָשׂוּהוּ': 'seize-him!',
  'כָּל־הַמֵּת': 'every-one-who-dies',
  'בַּחֲטָאָיו': 'in-his-sins',
  'כְּמוֹת': 'as-the-death-of',
  'כְּלֹא־נַעֲשְׂתָה': 'as-if-not-was-made',
  'לַתּוֹרָה': 'to-the-law',
  'אֶת־הַתּוֹרָה׃': '[ACC]-the-law',
  'מִיִּרְאַת': 'because-of-fear-of',
  'הִלָּחֲמוֹ': 'his-fighting',
  'עִם־צָרֵיהֶם': 'with-their-enemies',
  'וּבִלְתִּי־נָמוֹט': 'and-without-wavering',
  'לְכָל־הָאָדָם': 'to-every-man',
  'לְכָל־הָאָדָם׃': 'to-every-man',
  'מִסּוֹדוֹתָיו': 'from-his-mysteries',
  'כְּחֵלֶק': 'according-to-the-portion-of',
  'כְּהַקֶּשֶׁב': 'according-to-heed',
  'וְהַשְּׁקִידָה': 'and-the-diligence',
  'הַמַּקְשֶׁה': 'he-who-hardens',
  'יֵדָעֵם': 'he-shall-know-them',
  'בִּמְלוֹאָם': 'in-their-fullness',
  'בִּמְלוֹאָם׃': 'in-their-fullness',
  'יִשָּׁבוּ': 'they-shall-be-captured',
  'וְיוּבְלוּ': 'and-they-shall-be-led',
  'וּשְׁבִי': 'and-captivity-of',
  'כַּאֲגַם': 'as-a-lake-of',
  'וְגׇפְרִית': 'and-brimstone',
  'יֵאָסְרוּ': 'they-shall-be-bound',
  'כִּדְבָרוֹ': 'according-to-his-word',
  'כִּדְבָרוֹ׃': 'according-to-his-word',
  'אֶל־מְנוּחָתִי': 'to-my-rest',
  'אֶל־מְנוּחָתִי׃': 'to-my-rest',
  'הַצְּדָקָה': 'the-righteousness',
  'הָעֶלְיוֹן': 'the-Most-High',
  'הָעֶלְיוֹן׃': 'the-Most-High',
  'עֲוֹנְכֶם': 'your(pl)-iniquity',
  'לַתְּשׁוּבָה': 'to-repentance',
  'לַתְּשׁוּבָה׃': 'to-repentance',
  'וּמֵבִיא': 'and-brings',
  'כְּרוּחַ': 'as-the-spirit-of',
  'הַנְּבוּאָה': 'prophecy',
  'הַנְּבוּאָה׃': 'prophecy',
  'יְבִיאֲכֶם': 'shall-bring-you',
  'יְסוֹבֵב': 'shall-encircle',
  'יַאְסָרְכֶם': 'shall-bind-you',
  'תְּשִׂימֵם': 'you-shall-set-them',
  'וּלְגָרְשֵׁנוּ': 'and-to-drive-us-out',
  'וּלְגָרְשֵׁנוּ׃': 'and-to-drive-us-out',
  'נֻרְשַׁע': 'we-shall-be-condemned',
  'נֻרְשַׁע׃': 'we-shall-be-condemned',
  'מַחְשְׁבוֹתֵינוּ': 'our-thoughts',
  'אֶת־כָּל־מַחְשְׁבוֹתֶיךָ': '[ACC]-all-your-thoughts',
  'אֶת־מְזִמָּתְךָ': '[ACC]-your-scheme',
  'אֶל־מִדְבַּר': 'to-the-wilderness',
  'אֶל־הַמִּדְבָּר': 'to-the-wilderness',
  'אֶל־הַמִּדְבָּר׃': 'to-the-wilderness',
  'עַד־שְׁפֹּךְ': 'unto-the-shedding-of',
  'וּבְלִי־מְחִיר': 'and-without-price',
  'וּבְלִי־מְחִיר׃': 'and-without-price',
  'אִם־הִקְשֵׁינוּ': 'if-we-hardened',
  'אִם־הִמְשִׁיכוּ': 'if-they-continued',
  'אִם־הִשִּׂיגָם': 'if-he-overtook-them',
  'אִם־יְכֻלְכְּלוּ': 'if-they-can-be-sustained',
  'אִם־יְשִׂימֵהוּ': 'if-he-makes-him',
  'אִם־יִצְעֲדוּ': 'if-they-march',
  'אִם־יִקְדַּם': 'if-he-precedes',
  'אִם־יִתְמְכוּ': 'if-they-hold-fast',
  'אִם־יָרְעַל': 'if-it-is-poisoned',
  'אִם־לְהַפִּילוֹ': 'if-to-overthrow-him',
  'אִם־מֵאֱלֹהַי': 'if-from-my-God',
  'אִם־נִפֹּל': 'if-we-fall',
  'אִם־צָדַק': 'if-righteous',
  'אִם־חֲשַׁבְתֶּם': 'if-you(pl)-thought',
  'אִם־תְּדַבְּרוּ': 'if-you(pl)-speak',
  'אִם־תְּכַחֵשׁ': 'if-you-deny',
  'אִם־תְּעַוְּתוּ': 'if-you(pl)-pervert',
  'אִם־תְּפָשׂוּם': 'if-you(pl)-seize-them',
  'אִם־תִּכָּנְעוּ': 'if-you(pl)-humble-yourselves',
  'אִם־תַּאֲמִין': 'if-you-believe',
  'אִם־תַּנִּיחוּ': 'if-you(pl)-permit',
  'אִם־תָּסִירוּ': 'if-you(pl)-remove',
  'אִם־תָּסוֹגוּ': 'if-you(pl)-turn-away',
  'אִם־גֵּרְשׁוּנִי': 'if-they-cast-me-out',
  'אִם־תָּשׁוּבוּ': 'if-you(pl)-return',
  'אִם־תַּקְשׁוּ': 'if-you(pl)-harden',
  'אִיּוּמֵיכֶם׃': 'your(pl)-threatenings',
  'אִיּוּמִים': 'threatenings',
  'כִּרְצוֹנָם': 'according-to-their-desires',
  'וּכְחֶפְצָם': 'and-according-to-their-will',
  'לְבָשְׁתֵּנוּ': 'to-our-shame',
  'מִשָּׂרֵי': 'from-the-rulers-of',
  'כְּהַבָּשָׂר': 'as-the-flesh',
  'וְהַחַי': 'and-the-living',
  'וְהַבְלֵי': 'and-the-vanities-of',
  'מִשְּׁפֹּךְ': 'from-shedding',
  'וּשְׁפֹּךְ': 'and-shedding-of',
  'וְלָשֵׂאת': 'and-to-bear',
  'לְהַבִּיט': 'to-look',
  'וְעָשִׂיתִי': 'and-I-shall-work',
  'לִסְלִיחַת': 'for-the-remission-of',
  'חֲטָאָיו': 'his-sins',
  'כִּדְבַר': 'according-to-the-word-of',
  'לְעוֹלְמֵי': 'forever-and',
  'יַקְשׁוּ': 'they-harden',
  'יַקְשֶׁה': 'hardens',
  'לֹא־הָיָה': 'not-was',
  'לֹא־תוּכַל': 'not-can',
  'לֹא־יוּכְלוּ': 'not-can-they',
  'אֶת־כְּבוֹדוֹ׃': '[ACC]-his-glory',
  'מִיסוֹד': 'from-the-foundation-of',
  'וְלַעֲשׂוֹת': 'and-to-do',
  'כְּבוֹא': 'when-came',
  'לְהִשְׁתּוֹמֵם': 'to-be-astonished',
  'לְהִשְׁתּוֹמֵם׃': 'to-be-astonished',
  'וּדְבַר': 'and-the-word-of',
  'עָלֶיהָ׃': 'upon-it(f)',
  'בְּדִבְרֵי': 'in-the-words-of',
  'וְלֶאֱכֹל': 'and-to-eat',
  'אֶת־כָּל־מַחְשְׁבוֹתֶיךָ': '[ACC]-all-your-thoughts',
  'נִתַּן': 'was-given',
  'מֵעוֹלָם': 'from-everlasting',
  'וְעַד־עוֹלָם': 'and-forever',
  'לְבָנָיו': 'to-his-sons',
  'וְחָפַצְתִּי': 'and-I-desired',
  'תִזְכְּרוּ': 'you(pl)-remember',
  'רֵאשִׁית': 'beginning-of',
  'לֵאלֹהִים': 'to-God',
  'בַּעֲבוּר': 'because-of',
  'שָׁבוּ': 'they-returned',
  'אָבִיו׃': 'his-father',
  'אָבִיו': 'his-father',
  'אִם־יוּמַת': 'if-put-to-death',
};

// ═══════════════════════════════════════════════════════════════
// APPLY FIXES
// ═══════════════════════════════════════════════════════════════
let fixCount = 0;
let totalQ = 0;

content = content.replace(/\["([^"]+)","(\?\?\?)"\]/g, function(match, hebrew) {
  totalQ++;

  // Direct lookup
  if (glossMap[hebrew]) {
    fixCount++;
    return '["' + hebrew + '","' + glossMap[hebrew] + '"]';
  }

  // Try without trailing sof pasuk
  let clean = hebrew.replace(/׃$/, '');
  if (glossMap[clean]) {
    fixCount++;
    return '["' + hebrew + '","' + glossMap[clean] + '"]';
  }

  // Try morphological prefix stripping
  let gloss = tryPrefixStrip(hebrew);
  if (gloss) {
    fixCount++;
    return '["' + hebrew + '","' + gloss + '"]';
  }

  return match;
});

function tryPrefixStrip(word) {
  let w = word.replace(/׃$/, '');

  // וְ/וּ/וַ/וָ = "and-"
  let vavMatch = w.match(/^(וְ|וּ|וַ|וָ|וֶ)(.*)/);
  if (vavMatch) {
    let rest = vavMatch[2];
    if (glossMap[rest]) return 'and-' + glossMap[rest];
    // Try with article: וְהַ, וּבְ, etc.
    let artMatch = rest.match(/^(הַ|הָ)(.*)/);
    if (artMatch && glossMap[artMatch[2]]) return 'and-the-' + glossMap[artMatch[2]];
    let prepMatch = rest.match(/^(בְּ|בַּ|בִּ|בְ|לְ|לַ|לִ|מִ|מֵ|כְּ|כַּ)(.*)/);
    if (prepMatch) {
      let prefix = prepMatch[1];
      let base = prepMatch[2];
      let prepGloss = /^[בב]/.test(prefix) ? 'in-' : /^[לל]/.test(prefix) ? 'to-' : /^[מ]/.test(prefix) ? 'from-' : 'as-';
      if (glossMap[base]) return 'and-' + prepGloss + glossMap[base];
    }
  }

  // בְּ/בַּ/בִּ = "in-"
  let betMatch = w.match(/^(בְּ|בַּ|בִּ|בָּ|בְ|בַ|בִ)(.*)/);
  if (betMatch) {
    let rest = betMatch[2];
    if (glossMap[rest]) return 'in-' + glossMap[rest];
    let artMatch = rest.match(/^(הַ|הָ)(.*)/);
    if (artMatch && glossMap[artMatch[2]]) return 'in-the-' + glossMap[artMatch[2]];
  }

  // לְ/לַ/לִ = "to-/for-"
  let lamedMatch = w.match(/^(לְ|לַ|לִ|לָ|לֶ)(.*)/);
  if (lamedMatch) {
    let rest = lamedMatch[2];
    if (glossMap[rest]) return 'to-' + glossMap[rest];
    let artMatch = rest.match(/^(הַ|הָ)(.*)/);
    if (artMatch && glossMap[artMatch[2]]) return 'to-the-' + glossMap[artMatch[2]];
  }

  // מִ/מֵ = "from-"
  let memMatch = w.match(/^(מִ|מֵ|מְ)(.*)/);
  if (memMatch) {
    let rest = memMatch[2];
    if (glossMap[rest]) return 'from-' + glossMap[rest];
    let artMatch = rest.match(/^(הַ|הָ)(.*)/);
    if (artMatch && glossMap[artMatch[2]]) return 'from-the-' + glossMap[artMatch[2]];
  }

  // כְּ/כַּ = "as-/like-"
  let kafMatch = w.match(/^(כְּ|כַּ|כְ|כַ)(.*)/);
  if (kafMatch) {
    let rest = kafMatch[2];
    if (glossMap[rest]) return 'as-' + glossMap[rest];
    let artMatch = rest.match(/^(הַ|הָ)(.*)/);
    if (artMatch && glossMap[artMatch[2]]) return 'as-the-' + glossMap[artMatch[2]];
  }

  // הַ/הָ = "the-" (standalone article)
  let artMatch = w.match(/^(הַ|הָ)(.*)/);
  if (artMatch && glossMap[artMatch[2]]) return 'the-' + glossMap[artMatch[2]];

  return null;
}

fs.writeFileSync(dataFile, content, 'utf8');

console.log(`Fixed ${fixCount} of ${totalQ} remaining ??? entries.`);
console.log(`Total remaining ???: ${totalQ - fixCount}`);

// Count remaining
let remaining = content.match(/"\?\?\?"/g);
console.log(`Verified remaining ???: ${remaining ? remaining.length : 0}`);
