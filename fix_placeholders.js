#!/usr/bin/env node
/**
 * fix_placeholders.js
 *
 * Reads BOM.html, identifies transliteration placeholder glosses in
 * ["HebrewWord","Gloss"] pairs, and replaces them with proper English
 * glosses derived from Hebrew morphological analysis.
 *
 * Usage:  node fix_placeholders.js
 *   or:   "C:\Program Files\nodejs\node.exe" fix_placeholders.js
 *
 * The script:
 *  1. Extracts all unique ["Hebrew","Gloss"] pairs from BOM.html
 *  2. Identifies which glosses are transliteration placeholders
 *  3. Analyzes Hebrew morphology (prefixes, root, suffixes)
 *  4. Generates proper hyphenated English glosses
 *  5. Writes the corrected BOM.html back to disk
 *  6. Logs all changes and any unresolved placeholders
 */

'use strict';

const fs = require('fs');
const path = require('path');

const BOM_PATH = path.join(__dirname, 'BOM.html');
const LOG_PATH = path.join(__dirname, 'fix_placeholders_log.txt');

// ============================================================
// 1. KNOWN PROPER NOUNS — never treat these as placeholders
// ============================================================
const PROPER_NOUNS = new Set([
  // Book of Mormon names
  'Nephi','Lehi','Laman','Lemuel','Sam','Sariah','Laban','Zoram',
  'Ishmael','Jacob','Joseph','Enos','Jarom','Omni','Mosiah','Benjamin',
  'Alma','Amulek','Ammon','Aaron','Moroni','Mormon','Ether','Helaman',
  'Shiblon','Corianton','Korihor','Zeezrom','Gideon','Abinadi','Zeniff',
  'Noah','Limhi','Amalickiah','Teancum','Pahoran','Hagoth','Moronihah',
  'Nephi','Lehi','Cezoram','Kishkumen','Gadianton','Giddianhi',
  'Zemnarihah','Lachoneus','Gidgiddoni','Nehor','Amlici','Zerahemnah',
  'Amaleki','Chemish','Abinadom','Aminadab','Timothy','Zedekiah',
  'Coriantumr','Shiz','Jared','Morianton','Lib','Omer','Akish',
  'Riplakish','Shez','Com','Shiblom','Ether','Pagag','Moron',
  'Gilgal','Shared','Gilead','Cohor','Nimrah','Ablom','Heth',
  'Antionum','Melek','Sidon','Manti','Zarahemla','Gideon','Jershon',
  'Bountiful','Desolation','Cumorah','Moriantum','Irreantum',
  // Biblical names and places
  'Abraham','Isaac','Moses','Isaiah','Jeremiah','David','Solomon',
  'Sarah','Eve','Adam','Pharaoh','John','Elijah','Elisha','Esau',
  'Israel','Judah','Zion','Jerusalem','Egypt','Assyria','Babylon',
  'Nazareth','Bethlehem','Sinai','Tarshish','Rahab',
  'Zebulun','Naphtali','Ephraim','Samaria','Aram','Manasseh',
  'Rezin','Calno','Hamath','Oreb','Midian','Jesse','Philistia',
  'Geba','Ramah','Saul','Anathoth','Madmenah','Gebim',
  'Ontario','York',
  // Transliterated religious terms kept as-is
  'Messiah','Hosanna','Sheol','Riplah','Nahom','Shazer','Sinim',
  'Yeshua','Gadianton','Urim',
  // Other proper nouns that appear in the text
  'Anti','Reeds','Sidon','Antionum','Manti','Jershon','Chemish',
  'Abinadom','Giddianhi','Lachoneus','Gidgiddoni','Kishkumen',
  'Counselor','Eternal','Almighty','Reeds',
  // More BOM proper names
  'Amaleki','Aminadab','Aminadi','Ammonihah',
  'Antipas','Antum','Cumeni','Desolation',
  'Gilgal','Gidgiddonah','Gidonah','Helam',
  'Hermounts','Ishmael','Jacobugath','Kishkumen',
  'Lehonti','Liahona','Mathoni','Mathonihah',
  'Minon','Mocum','Moronihah','Mulek',
  'Neum','Ogath','Onidah','Pachus','Rameumptom',
  'Ripliancum','Seantum','Shared','Shelem',
  'Sherrizah','Shilom','Shurr','Teomner',
  'Tubaloth','Zenock','Zenos','Zerahemnah',
  'Ammonihah','Gid','Onihah','Mocum','Gilgal',
]);

// ============================================================
// 2. KNOWN ENGLISH WORDS — never treat these as placeholders
// ============================================================
const ENGLISH_WORDS = new Set([
  // Common English words that appear as glosses
  'God','Lord','Almighty','Eternal','Redeemer','Savior','Holy',
  'King','Queen','Prince','Priest','Prophet','Angel',
  'Him','His','Her','She','He','It','They','Them','We','You','Me','I',
  'One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Bountiful','Judean','Egyptian','Nephites','Lamanites',
  'Amalekites','Zoramites',
  'Introduction','Testimony','Explanation','Brief','Book',
  'Translator','Witnesses',
  'Smith','Joseph',
  // Single English words used as glosses
  'behold','yea','now','not','all','many','much','great','said',
  'come','came','go','went','say','says','see','saw','hear','heard',
  'know','knew','give','gave','take','took','make','made','do','did',
  'also','thus','therefore','wherefore','nevertheless','notwithstanding',
  'unto','upon','with','from','into','concerning','according','against',
  'good','evil','righteous','wicked','holy','sacred','pure','clean',
  'man','men','woman','women','people','son','sons','daughter',
  'father','mother','brother','sister','wife','husband','children',
  'land','earth','city','house','temple','church','water','sea',
  'day','days','night','year','years','time','times',
  'word','words','thing','things','name','heart','soul','spirit',
  'war','peace','sword','power','strength','might','glory',
  'death','life','truth','faith','hope','love','joy','mercy',
  'commandment','covenant','law','judgment','salvation','redemption',
  'sin','iniquity','transgression','wickedness','destruction',
  'repentance','forgiveness','righteousness','wisdom','knowledge',
  'prophecy','vision','revelation','scripture','record',
  'king','priest','prophet','judge','captain','ruler','chief',
  'gold','silver','brass','iron','copper','ore','steel',
  'wilderness','valley','hill','mountain','river','sea','ocean',
  'north','south','east','west',
  'arm','hand','face','eye','mouth','head','neck','blood','bone',
  'food','wine','bread','grain','seed','fruit','tree','olive',
  'horse','ass','cattle','sheep','flock','herd',
  'fire','smoke','cloud','rain','wind','storm',
  'bright','dark','white','black','red',
  'old','young','new','first','last',
  'free','liberty','bondage','captive','prison',
  'resurrection','atonement','baptism',
]);

// ============================================================
// 3. HEBREW PREFIX DEFINITIONS
// ============================================================
// Ordered from longest to shortest to match greedily
const HEBREW_PREFIXES = [
  // Conjunctive waw + preposition combinations
  { heb: 'וּבְ',  eng: 'and-in-' },
  { heb: 'וּבַ',  eng: 'and-in-the-' },
  { heb: 'וּבָ',  eng: 'and-in-the-' },
  { heb: 'וּלְ',  eng: 'and-to-' },
  { heb: 'וּלַ',  eng: 'and-to-the-' },
  { heb: 'וּלָ',  eng: 'and-to-the-' },
  { heb: 'וּמִ',  eng: 'and-from-' },
  { heb: 'וּמֵ',  eng: 'and-from-' },
  { heb: 'וּכְ',  eng: 'and-as-' },
  { heb: 'וְהַ', eng: 'and-the-' },
  { heb: 'וְהָ', eng: 'and-the-' },
  { heb: 'וַיְ', eng: 'and-' },    // vav-consecutive imperfect
  { heb: 'וַיִּ', eng: 'and-' },
  { heb: 'וַיַּ', eng: 'and-' },
  { heb: 'וַתִּ', eng: 'and-' },
  { heb: 'וַתְּ', eng: 'and-' },
  { heb: 'וְנִ', eng: 'and-' },     // and-niphal
  { heb: 'וְהִ', eng: 'and-' },     // and-hiphil
  { heb: 'וְהֶ', eng: 'and-' },
  { heb: 'וְ',   eng: 'and-' },
  { heb: 'וַ',   eng: 'and-' },
  { heb: 'וּ',   eng: 'and-' },
  // Article
  { heb: 'הַ',   eng: 'the-' },
  { heb: 'הָ',   eng: 'the-' },
  { heb: 'הֶ',   eng: 'the-' },
  // Prepositions
  { heb: 'בְּ',  eng: 'in-' },
  { heb: 'בַּ',  eng: 'in-the-' },
  { heb: 'בָּ',  eng: 'in-the-' },
  { heb: 'בִּ',  eng: 'in-' },
  { heb: 'בֵּ',  eng: 'in-' },
  { heb: 'לְ',   eng: 'to-' },
  { heb: 'לַ',   eng: 'to-the-' },
  { heb: 'לָ',   eng: 'to-the-' },
  { heb: 'לִ',   eng: 'to-' },
  { heb: 'מִ',   eng: 'from-' },
  { heb: 'מֵ',   eng: 'from-' },
  { heb: 'כְּ',  eng: 'as-' },
  { heb: 'כַּ',  eng: 'as-the-' },
  { heb: 'כָּ',  eng: 'as-the-' },
  { heb: 'כְ',   eng: 'as-' },
  // Relative/subordinating
  { heb: 'שֶׁ',  eng: 'that-' },
  { heb: 'שֶׁבְּ', eng: 'that-in-' },
];

// ============================================================
// 4. HEBREW SUFFIX DEFINITIONS
// ============================================================
const HEBREW_SUFFIXES = [
  // Pronominal suffixes on nouns (possessive) — longest first
  { heb: 'וֹתֵיהֶם', eng: '-their' },   // f-pl construct + their
  { heb: 'וֹתֵיהֶן', eng: '-their(f)' },
  { heb: 'וֹתֵינוּ', eng: '-our' },
  { heb: 'וֹתֶיךָ',  eng: '-your' },
  { heb: 'וֹתַי',    eng: '-my' },
  { heb: 'ֵיהֶם',   eng: '-their' },
  { heb: 'ֵיהֶן',   eng: '-their(f)' },
  { heb: 'ֵינוּ',   eng: '-our' },
  { heb: 'ֶיהָ',    eng: '-her' },
  { heb: 'ֶיךָ',    eng: '-your' },
  { heb: 'ָתָם',    eng: '-their' },
  { heb: 'וֹתָם',   eng: '-their' },
  { heb: 'תֵּיהֶם', eng: '-their' },
  { heb: 'ֵיכֶם',   eng: '-your(pl)' },
  { heb: 'ֵנוּ',    eng: '-our' },
  { heb: 'ָנוּ',    eng: '-us' },
  { heb: 'ָהּ',     eng: '-her' },
  { heb: 'ֹתָיו',   eng: '-his' },
  { heb: 'וֹתָיו',  eng: '-his' },
  { heb: 'ָתוֹ',    eng: '-his' },
  { heb: 'ָיו',     eng: '-his' },
  { heb: 'ָם',      eng: '-their' },
  { heb: 'הֶם',     eng: '-them' },
  { heb: 'כֶם',     eng: '-you(pl)' },
  { heb: 'ָךְ',     eng: '-your' },
  { heb: 'ְךָ',     eng: '-your' },
  { heb: 'ִי',      eng: '-my' },
  { heb: 'וֹ',      eng: '-his' },
  // Verbal suffixes
  { heb: 'וּם',     eng: '-them' },
  { heb: 'ֵם',      eng: '-them' },
  { heb: 'ֵנוּ',    eng: '-us' },
  { heb: 'ָנוּ',    eng: '-us' },
  // Plural/gender endings (not pronominal, but morphological)
  { heb: 'וֹת',     eng: '(f-pl)' },
  { heb: 'ִים',     eng: '(m-pl)' },
  { heb: 'ָה',      eng: '(f)' },
];

// ============================================================
// 5. COMPREHENSIVE HEBREW ROOT DICTIONARY
// ============================================================
// Maps Hebrew stems/roots to English meanings.
// Includes common Biblical Hebrew vocabulary found in the Book of Mormon.
const ROOT_DICTIONARY = {
  // --- VERY COMMON BOM VOCABULARY ---
  // Movement / Travel
  'הלך': 'walk',
  'בוא': 'come',
  'יצא': 'go-forth',
  'שׁוב': 'return',
  'עלה': 'ascend',
  'ירד': 'descend',
  'נסע': 'journey',
  'עבר': 'pass',
  'ברח': 'flee',
  'רדף': 'pursue',
  'נוס': 'flee',
  'רוץ': 'run',
  'צעד': 'march',
  'נדד': 'wander',

  // Speech / Communication
  'אמר': 'say',
  'דבר': 'speak',
  'קרא': 'call',
  'ספר': 'tell',
  'כתב': 'write',
  'שׁמע': 'hear',
  'נבא': 'prophesy',
  'הגד': 'declare',
  'צוה': 'command',
  'ענה': 'answer',
  'שׁבע': 'swear',
  'ברך': 'bless',
  'תפל': 'pray',
  'זעק': 'cry-out',
  'שׁיר': 'sing',

  // Knowledge / Perception
  'ידע': 'know',
  'ראה': 'see',
  'בין': 'understand',
  'חשׁב': 'think',
  'חכם': 'be-wise',
  'למד': 'learn',
  'שׁכל': 'have-understanding',
  'דרשׁ': 'seek',
  'בקשׁ': 'seek',
  'מצא': 'find',
  'זכר': 'remember',
  'שׁכח': 'forget',

  // Existence / Being
  'היה': 'be',
  'חיה': 'live',
  'מות': 'die',
  'ישׁב': 'dwell',
  'עמד': 'stand',
  'נפל': 'fall',
  'קום': 'rise',
  'שׁכב': 'lie-down',

  // Action / Doing
  'עשׂה': 'do',
  'פעל': 'work',
  'עבד': 'serve',
  'שׁמר': 'keep',
  'נתן': 'give',
  'לקח': 'take',
  'שׂים': 'set',
  'שׁלח': 'send',
  'נשׂא': 'bear',
  'אסף': 'gather',
  'בנה': 'build',
  'שׁבר': 'break',
  'כרת': 'cut-off',
  'פתח': 'open',
  'סגר': 'close',
  'מלא': 'fill',
  'כלה': 'finish',
  'חדל': 'cease',

  // Emotion / Will
  'אהב': 'love',
  'שׂנא': 'hate',
  'ירא': 'fear',
  'חפץ': 'desire',
  'שׂמח': 'rejoice',
  'אבל': 'mourn',
  'כעס': 'be-angry',
  'חמל': 'have-mercy',
  'רצה': 'be-willing',
  'קוה': 'hope',
  'בטח': 'trust',
  'אמן': 'believe',

  // Power / Authority
  'מלך': 'reign',
  'שׁפט': 'judge',
  'משׁל': 'rule',
  'פקד': 'appoint',
  'מנה': 'appoint',
  'נחל': 'inherit',
  'שׁלט': 'govern',

  // Conflict / War
  'לחם': 'fight',
  'הרג': 'slay',
  'מכה': 'smite',
  'נכה': 'strike',
  'שׁחת': 'destroy',
  'שׁמד': 'destroy',
  'כבשׁ': 'conquer',
  'נצל': 'deliver',
  'ישׁע': 'save',
  'גאל': 'redeem',
  'פדה': 'ransom',
  'הגן': 'defend',
  'צור': 'besiege',
  'מרד': 'rebel',
  'חרב': 'destroy',

  // Morality / Religion
  'חטא': 'sin',
  'עוה': 'do-iniquity',
  'רשׁע': 'be-wicked',
  'צדק': 'be-righteous',
  'טהר': 'be-pure',
  'טמא': 'defile',
  'קדשׁ': 'be-holy',
  'כפר': 'atone',
  'סלח': 'forgive',
  'תשׁוב': 'repent',
  'שׁוב': 'repent',

  // Physical world
  'אכל': 'eat',
  'שׁתה': 'drink',
  'לבשׁ': 'put-on',
  'רחץ': 'wash',
  'זרע': 'sow',
  'קצר': 'reap',
  'נטע': 'plant',
  'גדל': 'grow',

  // Miscellaneous common verbs
  'אבד': 'perish',
  'סבל': 'suffer',
  'ענה': 'afflict',
  'חרף': 'reproach',
  'בושׁ': 'be-ashamed',
  'כלם': 'be-put-to-shame',
  'יבשׁ': 'put-to-shame',
  'תמם': 'be-complete',
  'שׁלם': 'be-whole',
  'גלה': 'reveal',
  'סתר': 'hide',
  'פרשׂ': 'spread',
  'נטה': 'stretch-out',
  'שׁפך': 'pour-out',
  'מסר': 'deliver',
  'יסר': 'discipline',
  'יכח': 'reprove',
  'הוכ': 'reprove',
  'נחם': 'comfort',
  'רפא': 'heal',
  'פלט': 'escape',
  'חזק': 'strengthen',
  'רבה': 'multiply',
  'מעט': 'diminish',
  'סור': 'turn-aside',
  'הפך': 'overturn',
  'ערך': 'arrange',
  'כון': 'establish',
  'יסד': 'found',
  'בחר': 'choose',
  'חלק': 'divide',
  'קבץ': 'gather',
  'פוץ': 'scatter',
  'נוח': 'rest',
  'ישׁן': 'sleep',
  'קבר': 'bury',
  'חנן': 'be-gracious',
  'רחם': 'have-compassion',
  'נקם': 'avenge',
  'שׁאל': 'ask',
  'בחן': 'test',
  'נסה': 'try',
  'רומ': 'exalt',
  'שׁפל': 'humble',
  'כנע': 'humble',
  'גבר': 'prevail',
  'עזר': 'help',
  'סמך': 'support',
  'תמך': 'uphold',
  'חקק': 'engrave',
  'חתם': 'seal',

  // Nouns (common Biblical Hebrew nouns in BOM)
  'תולד': 'genealogy',
  'עצה': 'counsel',
  'ישׁר': 'upright',
  'מעגל': 'path',
  'תביע': 'claim',
  'דרור': 'liberty',
  'זכות': 'right',
  'זוהר': 'brightness',
  'עולם': 'eternal',
  'נצח': 'everlasting',
  'פשׁט': 'simple',
  'עוה': 'perverse',
  'חרב': 'desolate',
  'שׁמם': 'desolate',
  'פלג': 'division',
  'זנה': 'whoredom',
  'כזב': 'lie',
  'מרמ': 'deceit',
  'קהל': 'assembly',
  'עדה': 'congregation',
  'ברית': 'covenant',
  'חסד': 'mercy',
  'אמת': 'truth',
  'שׁלום': 'peace',
  'תקוה': 'hope',
  'אור': 'light',
  'חשׁך': 'darkness',
  'כבוד': 'glory',
  'תהלה': 'praise',
  'מזמור': 'psalm',
};

// ============================================================
// 6. DIRECT HEBREW-TO-ENGLISH MAPPING
// ============================================================
// For words where morphological analysis alone is insufficient,
// map specific Hebrew words directly to their correct glosses.
// This is the primary mechanism for fixing known placeholders.

const DIRECT_MAP = {
  // Alma 37 placeholders (discovered in analysis)
  'וְתוֹלְדוֹת':    'and-genealogy-of',
  'וּפְשׁוּטִים':   'and-simple(m-pl)',
  'עֲצוֹתָיו':      'His-counsels',
  'יָבִישׁ':        'puts-to-shame',
  'הַנֶּעֱוִים':    'the-perverted(m-pl)',
  'הֱבִיאוּם':      'they-brought-them',
  'יְדוּעָה':       'known(f)',
  'יְשָׁרוֹת':      'straight(f-pl)',
  'וּמַעְגָּלוֹ':   'and-His-path',
  'תְּבִיעָה':      'a-claim',
  'יִתְבַּע':       'claims',
  'וִיקַיֵּם':      'and-fulfill',
  'מֵבִיאָה':       'brings(f)',
  'מוּשָׁבִים':     'restored(m-pl)',
  'נוֹשָׁעִים':     'saved(m-pl)',
  'וְהָעוֹלָמִיּוֹת': 'and-the-eternal(f-pl)',
  'יַדְאִיגוּ':     'trouble',
  'וְיוֹרִידְךָ':   'and-bring-you-down',
  'וּבְיִשּׁוּב':   'and-in-soberness-of',

  // Alma 42 / doctrinal
  'וּגְאֻלָּתָם':   'and-their-redemption',
  'וְעׇנְיָם':     'and-their-affliction',
  'אׇבְדָנָם':     'their-destruction',

  // Alma 43 placeholders
  'לָנוּחַ':        'to-rest',
  'הַשֹּׁפְטִים':   'the-judges',
  'מִנָּה':         'appointed',
  'יְבִיאֵם':       'he-would-bring-them',
  'יַשִּׂיג':       'gain',
  'כִּרְצוֹנָם':    'according-to-their-desires',
  'לֹא יָפֵרוּ':    'not break',
  'יָפֵרוּ':        'they-would-break',
  'עָבִים':         'thick(m-pl)',
  'וְקַלְּעֵיהֶם':  'and-their-slings',
  'כַּוָּנָתָם':     'their-intent',
  'וּדְרוֹרָם':     'and-their-liberty',
  'וּקְהִלָּתָם':   'and-their-church',
  'וַיְמַסְּרוּ':   'and-they-delivered',
  'צוֹעֲדִים':      'marching(m-pl)',
  'וַיַּסְתִּירֵם':  'and-he-hid-them',
  'בְּגֵיא':        'in-the-valley',
  'וּמִשְׁפְּטֵיהֶם': 'and-their-rights',
  'כַּוָּנָתָם':     'their-design',

  // Alma 43:9 merged verse markers
  'כִּרְצוֹנָם׃י.': 'according-to-their-desires',
  'דָּם׃טו.':       'blood',
  'הַנֶּפִיִּים׃יח.': 'the-Nephites',
  'הַלָּמָנִים׃לא.': 'the-Lamanites',
  'הַשֹּׁפְטִים׃ד.': 'the-judges',

  // 3 Nephi placeholders
  'וַיַּחֲרִיבוּ':   'and-they-laid-waste',
  'וַיָּפִיצוּ':    'and-they-spread',
  'וַיִּמָּנוּ':    'and-they-were-numbered',
  'וַתּוּסַר':      'and-was-removed',
  'וּזְכֻיּוֹת':    'and-the-rights-of',
  'וּפִלּוּגֵיהֶם': 'and-their-dissensions',
  'וַלָּיְלָה':     'and-night',
  'יִפְקְדוּ':      'they-shall-visit',
  'בְּאׇבְדָן':     'with-destruction',
  'גָּמוּר':        'utter',
  'וְהִתְוַדְּעוּ':  'and-become-acquainted',
  'וּמַעֲשֶׂיהָ':   'and-its-works',
  'וְכוֹתֵב':       'and-I-write',
  'יָשִׁיבוּ':      'this-people-may-recover',
  'עַוְלָתָם':      'their-wrongs',
  'וַיִּשְׁתּוֹמֵם': 'and-he-was-astonished',
  'עַזּוּת':        'boldness-of',
  'בְּאַיְּמוֹ':    'in-threatening',
  'וּנְקֹמוֹ':      'and-avenge',
  'עֻוְּתוּ':       'done-wrong',
  'תְּבִיעוֹת':     'demands',
  'וְאִיּוּמֵי':    'and-the-threatenings-of',
  'שׁוֹדֵד':        'a-robber',
  'וּדְרוֹרְכֶם':   'and-your-liberty',
  'תּוּמְכוּ':      'you-were-supported',
  'וְהָעוֹלָמִית':  'and-the-eternal',
  'וְרֵקִים':       'and-vain',
  'רְדוּ':          'come-down',
  'יָחוּסוּ':       'they-shall-spare',
  'מִידֵי':         'out-of-the-hands-of',

  // Alma 26 (Ammon's speech) placeholders
  'גָּמַל':         'bestowed',
  'אֲפֵלָה':        'darkness',
  'נוֹדֶה':         'let-us-give-thanks',
  'זָרִים':         'strangers',
  'וַיּוֹכִיחֵנּוּ':  'and-he-rebuked-him',
  'בַסּוּפָה':       'by-the-storm',
  'בְבוֹא':         'when-comes',
  'יִנָּדְפוּ':      'they-shall-be-driven',
  'עַזּוֹת':        'fierce',
  'הִנָּם':         'behold-they-are',
  'יְקִימֵם':       'He-shall-raise-them',
  'מַגָּל':         'a-sickle',
  'עֲמָרֵיכֶם':     'your-sheaves',

  // Common verbal forms that become placeholders
  'הִשְׁלִיכוּ':    'they-cast',
  'הִתְנַפְּלוּ':   'they-fell-upon',
  'הִתְפַּלְּלוּ':  'they-prayed',
  'הִתְגַּלָּה':    'was-revealed',
  'הִתְחַזְּקוּ':   'they-strengthened-themselves',
  'הִתְקַדְּשׁוּ':  'they-sanctified-themselves',
  'הִשְׁמִידוּ':    'they-destroyed',
  'הִכְנִיעוּ':     'they-humbled',
  'נִשְׁמְדוּ':     'they-were-destroyed',
  'נֶאֶלְצוּ':      'they-were-compelled',
  'נִלְחֲמוּ':      'they-fought',
  'נִקְבְּצוּ':     'they-were-gathered',
  'נִשְׁבְּעוּ':    'they-swore',

  // Words with pronominal suffixes
  'מַעֲשֵׂיהֶם':    'their-works',
  'דַּרְכֵיהֶם':    'their-ways',
  'עֲוֺנוֹתֵיהֶם':  'their-iniquities',
  'חַטֹּאתֵיהֶם':   'their-sins',
  'אוֹיְבֵיהֶם':    'their-enemies',
  'בְּנוֹתֵיהֶם':   'their-daughters',
  'מִלְחֲמוֹתֵיהֶם': 'their-wars',
  'מַחְשְׁבוֹתָיו': 'his-designs',
  'צִבְאוֹתֵיהֶם':  'their-armies',
  'שִׁרְיוֹנֵיהֶם': 'their-armor',
  'חַרְבוֹתֵיהֶם':  'their-swords',
  'קַשְׁתוֹתֵיהֶם': 'their-bows',
  'אַבְנֵיהֶם':     'their-stones',
  'מִשְׁפְּטֵיהֶם': 'their-rights',
  'עֲוֺנוֹתֵיכֶם':  'your-iniquities',
  'חַטֹּאתֶיךָ':    'your-sins',
  'אַרְצוֹתֵיהֶם':  'their-lands',
  'אֶת־רוּחוֹתָיו': 'his-winds',
  'וְסַעֲרוֹתָיו':  'and-his-tempests',
  'סְבִיבוֹתֶיהָ':  'and-round-about',

  // Helaman 5 placeholders
  'וְסַמְכוּת':     'and-authority',
  'וְנוֹכְחוּ':     'and-were-convinced',
  'מָסוֹרוֹת':      'the-traditions-of',
  'בְּעַמּוּד':     'by-a-pillar-of',
  'אִלְּמִים':      'dumb(m-pl)',
  'נָפוֹץ':        'dispersed',
  'רָעָדוּ':        'did-shake',
  'לָזוּז':         'to-move',
  'פּוֹרְשִׁים':    'dissenters(m-pl)',
  'דַּק':           'soft',

  // Helaman 5:12 placeholders
  'הָעַזּוֹת':      'the-mighty',
  'בְּנוּיִים':     'built',
  'מוּסָד':         'a-foundation',
  'מוּסָּד':        'a-sure-foundation',
  'יִבְנוּ':        'they-build',
  'לִפֹּל':         'to-fall',

  // Helaman 6 / general placeholders
  'יִבֹּל':         'shall-fade',
  'תְּנָאֵי':       'the-conditions-of',
  'וַיִּזְכְּרוּ':   'and-they-did-remember',

  // Niphal / Hiphil / Hitpael forms often becoming placeholders
  'נוֹשָׁע':       'saved',
  'נִכְרָת':       'cut-off',
  'נִשְׁמָר':      'kept',
  'נִגְלָה':       'revealed',
  'נִבְרָא':       'created',
  'נִקְרָא':       'called',
  'מוּכָן':        'prepared',
  'מוּשָׁב':       'restored',

  // Participles that often appear as placeholders
  'נוֹתֵן':        'gives',
  'שׁוֹמֵר':       'keeps',
  'עוֹשֶׂה':       'does',
  'מֵבִיא':        'brings',
  'יוֹדֵעַ':       'knows',
  'יוֹשֵׁב':       'dwells',
  'עוֹלֶה':        'ascends',
  'יוֹרֵד':        'descends',
  'שׁוֹפֵט':       'judges',
  'מוֹשֵׁל':       'rules',
  'כּוֹתֵב':       'writes',
  'תּוֹבֵעַ':      'claims',
  'מְשִׁיבָה':     'restoring(f)',
  'מְבִיאָה':      'bringing(f)',

  // Common adjectives that may become placeholders
  'גָּדוֹל':       'great',
  'קָטֹן':        'small',
  'רַב':          'many',
  'חָזָק':        'strong',
  'חָכָם':        'wise',
  'צַדִּיק':      'righteous',
  'רָשָׁע':       'wicked',
  'טָהוֹר':       'pure',
  'טָמֵא':        'unclean',
  'קָדוֹשׁ':      'holy',
  'נֶאֱמָן':      'faithful',
  'יָשָׁר':       'upright',

  // Additional high-frequency BOM words
  'תְּשׁוּבָה':    'repentance',
  'יְשׁוּעָה':     'salvation',
  'כַּפָּרָה':     'atonement',
  'תְּחִיָּה':     'resurrection',
  'תּוֹרָה':       'law',
  'מִצְוָה':      'commandment',
  'בְּרִית':      'covenant',
  'חֵטְא':       'sin',
  'עָוֹן':        'iniquity',
  'חֶסֶד':       'mercy',
  'אֱמוּנָה':     'faith',
  'תִּקְוָה':     'hope',
  'אַהֲבָה':      'love',
  'שָׂמְחָה':     'joy',
  'שָׁלוֹם':      'peace',
  'בִּינָה':      'understanding',
  'חׇכְמָה':      'wisdom',
  'דַּעַת':       'knowledge',
  'כֹּחַ':        'power',
  'גְּבוּרָה':    'might',
  'כָּבוֹד':      'glory',
  'תְּהִלָּה':    'praise',
  'קְדֻשָּׁה':    'holiness',
};

// ============================================================
// 7. PLACEHOLDER DETECTION
// ============================================================

/**
 * Determines whether a gloss is a transliteration placeholder.
 *
 * Placeholders are:
 *  - Single capitalized words (no hyphens, no spaces)
 *  - Not known English words
 *  - Not known proper nouns
 *  - Not grammatical markers like [ACC], (f), (mp)
 *  - Look like Hebrew transliterations
 */
function isPlaceholder(gloss) {
  if (!gloss || gloss.length < 2) return false;

  // Skip empty, punctuation-only, or verse markers
  if (gloss === '' || gloss === '׃' || gloss === '') return false;

  // Skip anything with hyphens (already a proper compound gloss)
  if (gloss.includes('-')) return false;

  // Skip grammatical markers
  if (gloss.startsWith('[') || gloss.startsWith('(')) return false;

  // Skip if it contains spaces (multi-word glosses)
  if (gloss.includes(' ')) return false;

  // Skip lowercase words (these are proper English glosses)
  if (gloss[0] === gloss[0].toLowerCase()) return false;

  // Must start with uppercase
  if (!/^[A-Z]/.test(gloss)) return false;

  // Skip known proper nouns
  if (PROPER_NOUNS.has(gloss)) return false;

  // Skip known English words (case-insensitive check)
  if (ENGLISH_WORDS.has(gloss)) return false;

  // Skip very short words that are likely abbreviations
  if (gloss.length <= 2) return false;

  // If it ends with period + something, it may be a merged verse marker
  // e.g., "Hshptimd." — still treat as placeholder

  // At this point, it's likely a transliteration placeholder
  // Additional heuristic: contains patterns common in Hebrew transliteration
  // but not in English (like double vowels, 'sh', 'ts', 'kh', ending in 'im', 'ot', etc.)
  const transPatterns = /^[A-Z][a-z]*(sh|ts|kh|ch|zh|dh|th|gh|ph|tz|[aeiou]{2}|im$|ot$|om$|am$|em$|oh$|ah$|ih$|uh$)/i;

  // Even if it doesn't match transliteration patterns,
  // if it's not in our known word lists, it's probably a placeholder
  return true;
}

// ============================================================
// 8. HEBREW MORPHOLOGICAL ANALYZER
// ============================================================

/**
 * Strip niqqud (vowel points) from Hebrew text for root matching.
 */
function stripNiqqud(str) {
  // Remove all Unicode combining marks in the Hebrew block (U+0591-U+05C7)
  return str.replace(/[\u0591-\u05C7]/g, '');
}

/**
 * Attempt to parse a Hebrew word into prefix + stem + suffix
 * and generate a proper English gloss.
 */
function analyzeHebrew(hebrew) {
  // First check direct map
  if (DIRECT_MAP[hebrew]) {
    return DIRECT_MAP[hebrew];
  }

  // Strip maqaf-joined words (treat as single unit)
  let word = hebrew.replace(/־/g, '');

  // Try to match prefixes
  let engPrefix = '';
  let remaining = word;

  for (const pfx of HEBREW_PREFIXES) {
    if (remaining.startsWith(pfx.heb)) {
      engPrefix += pfx.eng;
      remaining = remaining.substring(pfx.heb.length);
      // After removing one prefix, try to match another
      // (e.g., וְהַ = and + the)
      for (const pfx2 of HEBREW_PREFIXES) {
        if (remaining.startsWith(pfx2.heb)) {
          // Avoid duplicate "and-and-" or "the-the-"
          if (!engPrefix.includes(pfx2.eng.replace(/-$/, ''))) {
            engPrefix += pfx2.eng;
            remaining = remaining.substring(pfx2.heb.length);
          }
          break;
        }
      }
      break;
    }
  }

  // Check if the remaining stem (with prefix stripped) is in the direct map
  // by looking up the full original word and also the remaining part
  if (DIRECT_MAP[remaining]) {
    return engPrefix + DIRECT_MAP[remaining];
  }

  // Try to match suffixes
  let engSuffix = '';
  let stem = remaining;

  for (const sfx of HEBREW_SUFFIXES) {
    if (stem.endsWith(sfx.heb) && stem.length > sfx.heb.length) {
      engSuffix = sfx.eng;
      stem = stem.substring(0, stem.length - sfx.heb.length);
      break;
    }
  }

  // Try to look up the stem in the root dictionary
  let stemConsonants = stripNiqqud(stem);

  // Try various root lookups
  let rootMeaning = null;

  // Direct consonantal root lookup
  if (ROOT_DICTIONARY[stemConsonants]) {
    rootMeaning = ROOT_DICTIONARY[stemConsonants];
  }

  // Try 3-letter root extraction (common in Semitic languages)
  if (!rootMeaning && stemConsonants.length >= 3) {
    // Try the first 3 consonants
    let threeRoot = stemConsonants.substring(0, 3);
    if (ROOT_DICTIONARY[threeRoot]) {
      rootMeaning = ROOT_DICTIONARY[threeRoot];
    }
  }

  // Try removing common stem prefixes (מ for participles, ת for nouns, etc.)
  if (!rootMeaning) {
    const stemPrefixes = ['מ', 'ת', 'נ', 'י', 'א', 'ה'];
    for (const sp of stemPrefixes) {
      if (stemConsonants.startsWith(sp) && stemConsonants.length > 3) {
        let inner = stemConsonants.substring(1);
        if (ROOT_DICTIONARY[inner]) {
          rootMeaning = ROOT_DICTIONARY[inner];
          break;
        }
        // Try first 3 of inner
        if (inner.length >= 3) {
          let innerThree = inner.substring(0, 3);
          if (ROOT_DICTIONARY[innerThree]) {
            rootMeaning = ROOT_DICTIONARY[innerThree];
            break;
          }
        }
      }
    }
  }

  if (rootMeaning) {
    let result = engPrefix + rootMeaning + engSuffix;
    // Clean up double hyphens
    result = result.replace(/--/g, '-');
    return result;
  }

  // Could not analyze — return null
  return null;
}

// ============================================================
// 9. MAIN PROCESSING
// ============================================================

function main() {
  console.log('=== fix_placeholders.js ===');
  console.log('Reading BOM.html...');

  let html = fs.readFileSync(BOM_PATH, 'utf8');

  // Find all ["Hebrew","Gloss"] pairs
  // Pattern: ["...","..."]  (inside word arrays)
  const pairRegex = /\["([^"]+)","([^"]*)"\]/g;

  let match;
  const allPairs = [];
  const placeholders = new Map(); // gloss -> Set of hebrew words
  const glossCounts = new Map();  // gloss -> count

  while ((match = pairRegex.exec(html)) !== null) {
    const heb = match[1];
    const gloss = match[2];
    allPairs.push({ hebrew: heb, gloss: gloss, fullMatch: match[0] });

    if (isPlaceholder(gloss)) {
      if (!placeholders.has(gloss)) {
        placeholders.set(gloss, new Set());
      }
      placeholders.get(gloss).add(heb);
      glossCounts.set(gloss, (glossCounts.get(gloss) || 0) + 1);
    }
  }

  console.log(`Found ${allPairs.length} total word pairs.`);
  console.log(`Found ${placeholders.size} unique placeholder glosses.`);
  console.log(`Found ${Array.from(glossCounts.values()).reduce((a,b) => a+b, 0)} total placeholder instances.`);
  console.log('');

  // Build replacement map: for each (hebrew, placeholder_gloss) -> new_gloss
  const replacements = new Map(); // "hebrew\tgloss" -> newGloss
  const unresolved = [];
  let resolvedCount = 0;
  let unresolvedCount = 0;

  for (const [gloss, hebrewSet] of placeholders) {
    for (const heb of hebrewSet) {
      const key = heb + '\t' + gloss;

      // Try to analyze
      const newGloss = analyzeHebrew(heb);

      if (newGloss) {
        replacements.set(key, newGloss);
        resolvedCount++;
      } else {
        unresolved.push({ hebrew: heb, placeholder: gloss });
        unresolvedCount++;
      }
    }
  }

  console.log(`Resolved: ${resolvedCount} placeholder types.`);
  console.log(`Unresolved: ${unresolvedCount} placeholder types.`);
  console.log('');

  // Apply replacements to HTML
  let changeCount = 0;
  let modifiedHtml = html;

  for (const [key, newGloss] of replacements) {
    const [heb, oldGloss] = key.split('\t');

    // Build the exact old string to find
    const oldStr = '["' + heb + '","' + oldGloss + '"]';
    const newStr = '["' + heb + '","' + newGloss + '"]';

    if (oldStr === newStr) continue;

    // Replace all occurrences of this specific pair
    let count = 0;
    let idx = modifiedHtml.indexOf(oldStr);
    while (idx !== -1) {
      modifiedHtml = modifiedHtml.substring(0, idx) + newStr + modifiedHtml.substring(idx + oldStr.length);
      count++;
      idx = modifiedHtml.indexOf(oldStr, idx + newStr.length);
    }

    if (count > 0) {
      changeCount += count;
      console.log(`  "${oldGloss}" -> "${newGloss}"  (${heb})  [${count} occurrence(s)]`);
    }
  }

  console.log('');
  console.log(`Total replacements made: ${changeCount}`);

  // Write modified HTML
  if (changeCount > 0) {
    fs.writeFileSync(BOM_PATH, modifiedHtml, 'utf8');
    console.log(`Wrote updated BOM.html`);
  } else {
    console.log('No changes to write.');
  }

  // Write log file
  let log = '=== fix_placeholders.js Log ===\n';
  log += `Date: ${new Date().toISOString()}\n`;
  log += `Total pairs: ${allPairs.length}\n`;
  log += `Unique placeholders: ${placeholders.size}\n`;
  log += `Resolved: ${resolvedCount}\n`;
  log += `Unresolved: ${unresolvedCount}\n\n`;

  log += '--- REPLACEMENTS ---\n';
  for (const [key, newGloss] of replacements) {
    const [heb, oldGloss] = key.split('\t');
    log += `${heb}\t"${oldGloss}" -> "${newGloss}"\n`;
  }

  log += '\n--- UNRESOLVED ---\n';
  for (const item of unresolved) {
    log += `${item.hebrew}\t"${item.placeholder}" (could not analyze)\n`;
  }

  log += '\n--- ALL PLACEHOLDER GLOSSES ---\n';
  const sortedPlaceholders = Array.from(placeholders.entries())
    .sort((a, b) => a[0].localeCompare(b[0]));
  for (const [gloss, hebrewSet] of sortedPlaceholders) {
    const count = glossCounts.get(gloss);
    const hebs = Array.from(hebrewSet).join(', ');
    const resolved = Array.from(hebrewSet).every(h => replacements.has(h + '\t' + gloss));
    log += `${resolved ? '[OK]' : '[??]'} "${gloss}" (${count}x) <- ${hebs}\n`;
  }

  fs.writeFileSync(LOG_PATH, log, 'utf8');
  console.log(`Wrote log to ${LOG_PATH}`);

  // Print unresolved for manual review
  if (unresolved.length > 0) {
    console.log('\n--- UNRESOLVED PLACEHOLDERS (need manual glosses) ---');
    for (const item of unresolved) {
      console.log(`  ${item.hebrew}  ->  "${item.placeholder}"`);
    }
  }

  console.log('\nDone.');
}

main();
