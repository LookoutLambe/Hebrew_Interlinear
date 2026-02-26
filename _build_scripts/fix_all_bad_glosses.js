/**
 * fix_all_bad_glosses.js
 *
 * Comprehensive script to fix all bad glosses in BOM.html.
 * Handles three categories:
 *   1. hebrew_in_gloss - glosses containing Hebrew characters
 *   2. transliterations - pure consonant nonsense glosses
 *   3. YHWH -> the-Lord replacements
 *
 * Strategy:
 *   - First try manual dictionary lookup (most reliable)
 *   - Then try morphological decomposition (strip prefixes/suffixes, look up root)
 *   - Finally, produce clean transliteration (no Hebrew chars)
 */

const fs = require('fs');
const path = require('path');

const BOM_PATH = path.join(__dirname, 'BOM.html');
const BAD_GLOSSES_PATH = path.join(__dirname, 'bad_glosses_final.json');

// ============================================================
// UTILITY: Strip Hebrew niqqud (vowel points) for matching
// ============================================================
function stripNiqqud(str) {
  // Remove all Hebrew niqqud/cantillation marks (U+0591-U+05C7) except letters (U+05D0-U+05EA)
  return str.replace(/[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4-\u05C7]/g, '');
}

// Strip niqqud and also remove sof-pasuq (׃) and maqaf (־)
function normalizeHebrew(str) {
  return stripNiqqud(str).replace(/[׃־]/g, '');
}

// ============================================================
// COMPREHENSIVE MANUAL FIXES DICTIONARY
// Maps normalized Hebrew (no niqqud) -> English gloss
// ============================================================
const manualFixes = {
  // =====================================================
  // COMMON NOUNS
  // =====================================================
  'עם': 'people',
  'העם': 'the-people',
  'עמו': 'his-people',
  'עמם': 'their-people',
  'עמנו': 'our-people',
  'עמי': 'my-people',
  'עמך': 'your-people',
  'עמכם': 'your-people',
  'לעם': 'to-the-people',
  'בעם': 'among-the-people',
  'ארץ': 'land',
  'הארץ': 'the-land',
  'ארצם': 'their-land',
  'ארצנו': 'our-land',
  'ארצות': 'lands',
  'ארצותיכם': 'your-lands',
  'בארץ': 'in-the-land',
  'לארץ': 'to-the-land',
  'מארץ': 'from-the-land',
  'יום': 'day',
  'היום': 'the-day',
  'ימים': 'days',
  'הימים': 'the-days',
  'ימי': 'days-of',
  'שנה': 'year',
  'שנים': 'years',
  'שנות': 'years-of',
  'מלך': 'king',
  'המלך': 'the-king',
  'מלכי': 'kings-of',
  'מלכים': 'kings',
  'למלך': 'to-the-king',
  'מלכם': 'their-king',
  'מלכו': 'his-king',
  'בית': 'house',
  'הבית': 'the-house',
  'בתים': 'houses',
  'ביתו': 'his-house',
  'ביתם': 'their-house',
  'לבית': 'to-the-house',
  'מבית': 'from-the-house',
  'מבית': 'from-the-house',
  'דבר': 'word',
  'הדבר': 'the-word',
  'דברי': 'words-of',
  'דברים': 'words',
  'הדברים': 'the-words',
  'דברו': 'his-word',
  'דברך': 'your-word',
  'דבריו': 'his-words',
  'דבריהם': 'their-words',
  'בדבר': 'by-the-word',
  'ובדבר': 'and-by-the-word',
  'הדברה': 'the-word',
  'אדם': 'man',
  'האדם': 'the-man',
  'אדמה': 'ground',
  'האדמה': 'the-ground',
  'אשה': 'woman',
  'נשים': 'women',
  'הנשים': 'the-women',
  'בן': 'son',
  'הבן': 'the-son',
  'בנו': 'his-son',
  'בני': 'sons-of',
  'בנים': 'sons',
  'הבנים': 'the-sons',
  'בנך': 'your-son',
  'בנם': 'their-son',
  'בנינו': 'our-sons',
  'בת': 'daughter',
  'בנות': 'daughters',
  'הבנות': 'the-daughters',
  'אב': 'father',
  'האב': 'the-father',
  'אבי': 'father-of',
  'אביו': 'his-father',
  'אבינו': 'our-father',
  'אבותם': 'their-fathers',
  'אבותינו': 'our-fathers',
  'אבות': 'fathers',
  'אח': 'brother',
  'אחי': 'brother-of',
  'אחיו': 'his-brother',
  'אחים': 'brothers',
  'אחיהם': 'their-brothers',
  'עיר': 'city',
  'העיר': 'the-city',
  'ערי': 'cities-of',
  'עריהם': 'their-cities',
  'ערים': 'cities',
  'בעיר': 'in-the-city',
  'לעיר': 'to-the-city',
  'מים': 'water',
  'המים': 'the-water',
  'במים': 'in-water',
  'שמים': 'heaven',
  'השמים': 'the-heavens',
  'חרב': 'sword',
  'החרב': 'the-sword',
  'חרבות': 'swords',
  'חרבותיהם': 'their-swords',
  'בחרבותיהם': 'with-their-swords',
  'בחרב': 'by-the-sword',
  'לב': 'heart',
  'הלב': 'the-heart',
  'לבי': 'my-heart',
  'לבו': 'his-heart',
  'לבם': 'their-heart',
  'לבכם': 'your-hearts',
  'לבות': 'hearts',
  'בלב': 'in-the-heart',
  'עין': 'eye',
  'עיני': 'eyes-of',
  'עינים': 'eyes',
  'עיניהם': 'their-eyes',
  'עיניך': 'your-eyes',
  'בעיני': 'in-the-eyes-of',
  'לעיני': 'before-the-eyes-of',
  'יד': 'hand',
  'היד': 'the-hand',
  'ידי': 'hands-of',
  'ידו': 'his-hand',
  'ידם': 'their-hand',
  'ידיו': 'his-hands',
  'ביד': 'in-the-hand-of',
  'רגל': 'foot',
  'רגלי': 'feet-of',
  'רגליו': 'his-feet',
  'רגליהם': 'their-feet',
  'פנים': 'face',
  'הפנים': 'the-face',
  'פני': 'face-of',
  'פניו': 'his-face',
  'פניהם': 'their-faces',
  'לפני': 'before',
  'נפש': 'soul',
  'הנפש': 'the-soul',
  'נפשי': 'my-soul',
  'נפשו': 'his-soul',
  'נפשם': 'their-souls',
  'נפשות': 'souls',
  'נפשך': 'your-soul',
  'נפשנו': 'our-souls',
  'רוח': 'spirit',
  'הרוח': 'the-Spirit',
  'רוחו': 'His-Spirit',
  'רוחי': 'my-spirit',
  'ורוח': 'and-the-Spirit',
  'ברוח': 'in-the-Spirit',
  'לרוח': 'unto-the-Spirit',
  'דם': 'blood',
  'הדם': 'the-blood',
  'דמי': 'blood-of',
  'דמם': 'their-blood',
  'בשר': 'flesh',
  'הבשר': 'the-flesh',
  'ראש': 'head',
  'הראש': 'the-head',
  'ראשי': 'heads-of',
  'ראשיהם': 'their-heads',
  'ראשים': 'heads',
  'הראשים': 'the-heads',
  'ראשך': 'your-head',
  'דרך': 'way',
  'הדרך': 'the-way',
  'דרכי': 'ways-of',
  'דרכיו': 'his-ways',
  'דרכיהם': 'their-ways',
  'בדרך': 'in-the-way',
  'תורה': 'law',
  'התורה': 'the-law',
  'תורתו': 'his-law',
  'ברית': 'covenant',
  'הברית': 'the-covenant',
  'בריתו': 'his-covenant',
  'בריתי': 'my-covenant',
  'כהן': 'priest',
  'הכהן': 'the-priest',
  'כהנים': 'priests',
  'הכהנים': 'the-priests',
  'כהנת': 'priesthood',
  'הכהנת': 'the-priesthood',
  'נביא': 'prophet',
  'הנביא': 'the-prophet',
  'נביאי': 'prophets-of',
  'נביאים': 'prophets',
  'הנביאים': 'the-prophets',
  'שופט': 'judge',
  'השופט': 'the-judge',
  'שופטים': 'judges',
  'השופטים': 'the-judges',
  'לשופטים': 'to-the-judges',
  'עבד': 'servant',
  'העבד': 'the-servant',
  'עבדי': 'servants-of',
  'עבדו': 'his-servant',
  'עבדים': 'servants',
  'העבדים': 'the-servants',
  'צבא': 'army',
  'הצבא': 'the-army',
  'צבאו': 'his-army',
  'צבאם': 'their-army',
  'צבאות': 'armies',
  'הצבאות': 'the-armies',
  'מצבאו': 'from-his-army',
  'מחנה': 'camp',
  'המחנה': 'the-camp',
  'מחנהו': 'his-camp',
  'כלי': 'vessel',
  'כלים': 'vessels',
  'הכלים': 'the-vessels',
  'ספר': 'book',
  'הספר': 'the-book',
  'ספרי': 'books-of',
  'ספרים': 'books',
  'לוח': 'plate',
  'לוחות': 'plates',
  'הלוחות': 'the-plates',
  'אבן': 'stone',
  'האבן': 'the-stone',
  'אבנים': 'stones',
  'אבני': 'stones-of',
  'אבניהם': 'their-stones',
  'באבניהם': 'with-their-stones',
  'זהב': 'gold',
  'הזהב': 'the-gold',
  'כסף': 'silver',
  'הכסף': 'the-silver',
  'נחשת': 'brass',
  'הנחשת': 'the-brass',
  'עץ': 'tree',
  'העץ': 'the-tree',
  'עצים': 'trees',
  'פרי': 'fruit',
  'הפרי': 'the-fruit',
  'פריו': 'its-fruit',
  'זרע': 'seed',
  'הזרע': 'the-seed',
  'זרעו': 'his-seed',
  'זרעי': 'seed-of',
  'זרעך': 'your-seed',
  'מזרעך': 'from-your-seed',
  'ענף': 'branch',
  'ענפים': 'branches',
  'הענפים': 'the-branches',
  'גפן': 'vine',
  'הגפן': 'the-vine',
  'כרם': 'vineyard',
  'הכרם': 'the-vineyard',
  'שדה': 'field',
  'השדה': 'the-field',
  'שדות': 'fields',
  'הר': 'mountain',
  'ההר': 'the-mountain',
  'הרים': 'mountains',
  'ההרים': 'the-mountains',
  'נהר': 'river',
  'הנהר': 'the-river',
  'נהרות': 'rivers',
  'ים': 'sea',
  'הים': 'the-sea',
  'מדבר': 'wilderness',
  'המדבר': 'the-wilderness',
  'במדבר': 'in-the-wilderness',
  'גוי': 'nation',
  'הגוי': 'the-nation',
  'גוים': 'nations',
  'הגוים': 'the-nations',
  'שבט': 'tribe',
  'השבט': 'the-tribe',
  'שבטים': 'tribes',
  'השבטים': 'the-tribes',
  'שבטי': 'tribes-of',
  'משפחה': 'family',
  'המשפחה': 'the-family',
  'משפחות': 'families',
  'משפחותיהם': 'their-families',

  // =====================================================
  // COMMON VERBS (various conjugations)
  // =====================================================
  // עשה = did/made
  'עשה': 'made',
  'עשו': 'made',
  'עשית': 'you-made',
  'עשיתי': 'I-made',
  'עשיתנו': 'you-made-us',
  'נעשה': 'we-will-make',
  'ונעשה': 'and-we-will-make',
  'יעשה': 'he-will-make',
  'יעשו': 'they-will-make',
  'תעשה': 'you-shall-make',
  'לעשות': 'to-do',
  'ויעש': 'and-he-made',
  'ויעשו': 'and-they-made',
  'העשירו': 'they-became-rich',
  // אמר = said
  'אמר': 'said',
  'אמרו': 'they-said',
  'אמרת': 'you-said',
  'אמרתי': 'I-said',
  'ויאמר': 'and-he-said',
  'ויאמרו': 'and-they-said',
  'לאמר': 'saying',
  'תאמר': 'you-say',
  'יאמר': 'he-says',
  'אומר': 'says',
  'אומרת': 'saying',
  'נאמר': 'it-was-said',
  // הלך = went
  'הלך': 'went',
  'הלכו': 'they-went',
  'הלכנו': 'we-went',
  'ילך': 'he-will-go',
  'ילכו': 'they-will-go',
  'ללכת': 'to-go',
  'וילך': 'and-he-went',
  'וילכו': 'and-they-went',
  'תלך': 'you-shall-go',
  'הולך': 'going',
  'הולכים': 'going',
  // בא = came
  'בא': 'came',
  'באו': 'they-came',
  'באה': 'she-came',
  'יבא': 'he-will-come',
  'יבאו': 'they-will-come',
  'לבא': 'to-come',
  'לבוא': 'to-come',
  'ויבא': 'and-he-came',
  'ויבאו': 'and-they-came',
  'תבא': 'you-shall-come',
  'תביא': 'you-will-bring',
  'תבאנה': 'they-shall-come',
  'הובאה': 'was-brought',
  'הבאתם': 'you-brought',
  // נתן = gave
  'נתן': 'gave',
  'נתנו': 'they-gave',
  'נתנה': 'she-gave',
  'יתן': 'he-will-give',
  'תתן': 'you-shall-give',
  'תתן': 'she-will-give',
  'לתת': 'to-give',
  'ויתן': 'and-he-gave',
  'ויתנו': 'and-they-gave',
  // לקח = took
  'לקח': 'took',
  'לקחו': 'they-took',
  'לקחנו': 'we-took',
  'יקח': 'he-will-take',
  'ויקח': 'and-he-took',
  'ויקחו': 'and-they-took',
  'לקחת': 'to-take',
  // ידע = knew
  'ידע': 'knew',
  'ידעו': 'they-knew',
  'ידעת': 'you-knew',
  'ידעתי': 'I-knew',
  'ידעתם': 'you-knew',
  'יודע': 'knows',
  'יודעים': 'knowing',
  'לדעת': 'to-know',
  'ויודע': 'and-he-made-known',
  'בידעו': 'in-his-knowing',
  'נודעה': 'was-made-known',
  'ויודעו': 'and-they-became-known',
  'הודיעם': 'he-made-known-to-them',
  // ראה = saw
  'ראה': 'saw',
  'ראו': 'they-saw',
  'ראית': 'you-saw',
  'ראיתי': 'I-saw',
  'ראתה': 'she-saw',
  'יראה': 'he-will-see',
  'לראות': 'to-see',
  'ויראו': 'and-they-saw',
  'הראית': 'have-you-seen',
  'כראותו': 'when-he-saw',
  'כראותם': 'when-they-saw',
  'בראותו': 'when-he-saw',
  'ובראותו': 'and-when-he-saw',
  'בראותכם': 'when-you-saw',
  'בראותם': 'when-they-saw',
  'הראשים': 'the-chiefs',
  'קוראים': 'calling',
  // שמע = heard
  'שמע': 'heard',
  'שמעו': 'they-heard',
  'שמעה': 'she-heard',
  'שמעת': 'you-heard',
  'שמעתי': 'I-heard',
  'ישמע': 'he-will-hear',
  'לשמע': 'to-hear',
  'לשמוע': 'to-hear',
  'וישמע': 'and-he-heard',
  'וישמעו': 'and-they-heard',
  'נשמע': 'was-heard',
  'נשמעו': 'they-were-heard',
  // דבר = spoke
  'דבר': 'spoke',
  'דברו': 'they-spoke',
  'דברת': 'you-spoke',
  'דברתי': 'I-spoke',
  'ידבר': 'he-will-speak',
  'לדבר': 'to-speak',
  'וידבר': 'and-he-spoke',
  'מדבר': 'speaking',
  'ודבר': 'and-the-word-of',
  'ודבר': 'and-spoke',
  'בדבר': 'in-the-word-of',
  // שלח = sent
  'שלח': 'sent',
  'שלחו': 'they-sent',
  'שלחנו': 'we-sent',
  'ישלח': 'he-will-send',
  'וישלח': 'and-he-sent',
  'וישלחו': 'and-they-sent',
  'לשלח': 'to-send',
  'שולח': 'sending',
  'נשלחו': 'they-were-sent',
  'משלח': 'sending',
  // ישב = sat/dwelt
  'ישב': 'dwelt',
  'ישבו': 'they-dwelt',
  'ישבת': 'you-dwelt',
  'וישב': 'and-he-dwelt',
  'וישבו': 'and-they-dwelt',
  'יושב': 'dwelling',
  'יושבים': 'dwelling',
  'יושבי': 'inhabitants-of',
  'לשבת': 'to-dwell',
  'יושב': 'was-settled',
  // עלה = went up
  'עלה': 'went-up',
  'עלו': 'they-went-up',
  'יעלה': 'he-will-go-up',
  'ויעל': 'and-he-went-up',
  'ויעלו': 'and-they-went-up',
  'לעלות': 'to-go-up',
  'עליך': 'upon-you',
  // ירד = went down
  'ירד': 'went-down',
  'ירדו': 'they-went-down',
  'וירד': 'and-he-went-down',
  'לרדת': 'to-go-down',
  // עמד = stood
  'עמד': 'stood',
  'עמדו': 'they-stood',
  'יעמד': 'he-will-stand',
  'ויעמד': 'and-he-stood',
  'ויעמדו': 'and-they-stood',
  'עומד': 'standing',
  'עומדים': 'standing',
  'העומדים': 'those-standing',
  'העמדו': 'stand',
  'לעמד': 'to-stand',
  'לעמוד': 'to-stand',
  // שוב = returned
  'שב': 'returned',
  'שבו': 'they-returned',
  'שבה': 'she-returned',
  'שבנו': 'we-returned',
  'ישוב': 'he-will-return',
  'וישב': 'and-he-returned',
  'וישובו': 'and-they-returned',
  'לשוב': 'to-return',
  'שובה': 'return',
  'נשובה': 'let-us-return',
  'השב': 'the-one-returning',
  'השבים': 'the-returning-ones',
  'שבים': 'returning',
  // יצא = went out
  'יצא': 'went-out',
  'יצאו': 'they-went-out',
  'ויצא': 'and-he-went-out',
  'ויצאו': 'and-they-went-out',
  'לצאת': 'to-go-out',
  'מוצא': 'going-forth',
  // נפל = fell
  'נפל': 'fell',
  'נפלו': 'they-fell',
  'נפלא': 'wonderful',
  'ויפל': 'and-he-fell',
  'ויפלו': 'and-they-fell',
  'לנפל': 'to-fall',
  // קרא = called
  'קרא': 'called',
  'קראו': 'they-called',
  'קראת': 'you-called',
  'ויקרא': 'and-he-called',
  'ויקראו': 'and-they-called',
  'לקרא': 'to-call',
  'נקרא': 'was-called',
  'נקראו': 'they-were-called',
  // כתב = wrote
  'כתב': 'wrote',
  'כתבו': 'they-wrote',
  'כתבתי': 'I-wrote',
  'ויכתב': 'and-he-wrote',
  'לכתב': 'to-write',
  'כתוב': 'written',
  'הכתוב': 'the-written',
  // מצא = found
  'מצא': 'found',
  'מצאו': 'they-found',
  'מצאת': 'you-found',
  'ימצא': 'he-will-find',
  'ימצאם': 'he-will-find-them',
  'וימצא': 'and-he-found',
  'וימצאו': 'and-they-found',
  'למצא': 'to-find',
  'נמצא': 'was-found',
  // שאל = asked
  'שאל': 'asked',
  'שאלו': 'they-asked',
  'ישאל': 'he-will-ask',
  'וישאל': 'and-he-asked',
  'לשאל': 'to-ask',
  // ברח = fled
  'ברח': 'fled',
  'ברחו': 'they-fled',
  'ויברח': 'and-he-fled',
  'לברח': 'to-flee',
  // נוס = fled
  'נס': 'fled',
  'נסו': 'they-fled',
  'ינוס': 'he-will-flee',
  'וינס': 'and-he-fled',
  'וינוסו': 'and-they-fled',
  'לנוס': 'to-flee',
  // מות = died
  'מת': 'died',
  'מתו': 'they-died',
  'ימות': 'he-will-die',
  'וימת': 'and-he-died',
  'וימתו': 'and-they-died',
  'למות': 'to-die',
  'מות': 'death',
  'המת': 'the-dead',
  'המות': 'the-death',
  // הרג = slew
  'הרג': 'slew',
  'הרגו': 'they-slew',
  'יהרג': 'he-will-slay',
  'ויהרג': 'and-he-slew',
  'ויהרגו': 'and-they-slew',
  'להרג': 'to-slay',
  'להרג': 'to-be-slain',
  'לההרג': 'to-be-slain',
  // לחם = fought
  'לחם': 'fought',
  'לחמו': 'they-fought',
  'ילחם': 'he-will-fight',
  'וילחם': 'and-he-fought',
  'וילחמו': 'and-they-fought',
  'להלחם': 'to-fight',
  'ואלחם': 'and-I-will-fight',
  'מלחמה': 'war',
  'המלחמה': 'the-war',
  'מלחמות': 'wars',
  'מלחמתנו': 'our-war',
  // שפט = judged
  'שפט': 'judged',
  'שפטו': 'they-judged',
  'ישפט': 'he-will-judge',
  'וישפט': 'and-he-judged',
  'לשפט': 'to-judge',
  'משפט': 'judgment',
  'המשפט': 'the-judgment',
  'משפטים': 'judgments',
  'משפטי': 'judgments-of',
  'משפטכם': 'your-judgment',
  'והשופט': 'and-the-judge',
  // מלך = reigned
  'מלך': 'reigned',
  'וימלך': 'and-he-reigned',
  'למלך': 'to-reign',
  'ממלכה': 'kingdom',
  'הממלכה': 'the-kingdom',
  // עבד = served
  'עבד': 'served',
  'עבדו': 'they-served',
  'יעבד': 'he-will-serve',
  'ויעבד': 'and-he-served',
  'ויעבדו': 'and-they-served',
  'לעבד': 'to-serve',
  'לעבוד': 'to-serve',
  // אכל = ate
  'אכל': 'ate',
  'אכלו': 'they-ate',
  'יאכל': 'he-will-eat',
  'ויאכל': 'and-he-ate',
  'ויאכלו': 'and-they-ate',
  'לאכל': 'to-eat',
  'לאכול': 'to-eat',
  // שתה = drank
  'שתה': 'drank',
  'שתו': 'they-drank',
  'ישתה': 'he-will-drink',
  'לשתות': 'to-drink',
  // חטא = sinned
  'חטא': 'sinned',
  'חטאו': 'they-sinned',
  'חטאי': 'sins-of',
  'חטאת': 'sin',
  'חטאתי': 'my-sins',
  'חטאים': 'sinners',
  'החוטא': 'the-sinner',
  'יחטאו': 'they-will-sin',
  // פעל = worked
  'פעל': 'worked',
  'פעלו': 'they-worked',
  'לפעל': 'to-work',
  'לפעול': 'to-work',
  // חשב = thought
  'חשב': 'thought',
  'חשבו': 'they-thought',
  'יחשב': 'he-will-think',
  'תחשב': 'you-will-think',
  'לחשב': 'to-think',
  'מחשבות': 'thoughts',
  // זעק = cried out
  'זעק': 'cried-out',
  'זעקו': 'they-cried-out',
  'ויזעק': 'and-he-cried-out',
  'ויזעקו': 'and-they-cried-out',
  'זועקים': 'crying-out',
  'לזעק': 'to-cry-out',
  'צעק': 'cried-out',
  'צעקו': 'they-cried-out',
  'ויצעק': 'and-he-cried-out',
  // נשא = carried
  'נשא': 'carried',
  'נשאו': 'they-carried',
  'נשאתי': 'I-carried',
  'ינשא': 'he-will-carry',
  'וישא': 'and-he-carried',
  'לנשא': 'to-carry',
  'נושאים': 'carrying',
  'תנשאו': 'you-will-be-lifted-up',
  // שמר = kept
  'שמר': 'kept',
  'שמרו': 'they-kept',
  'שמרת': 'you-kept',
  'שמרתי': 'I-kept',
  'ישמר': 'he-will-keep',
  'וישמר': 'and-he-kept',
  'וישמרו': 'and-they-kept',
  'לשמר': 'to-keep',
  'לשמור': 'to-keep',
  // גדל = grew
  'גדל': 'grew',
  'גדלו': 'they-grew',
  'גדול': 'great',
  'הגדול': 'the-great',
  'גדולה': 'great',
  'גדולים': 'great',
  // ברך = blessed
  'ברך': 'blessed',
  'ברכו': 'they-blessed',
  'ברכה': 'blessing',
  'ברכת': 'blessing-of',
  'וברכת': 'and-blessing-of',
  'ברכות': 'blessings',
  'אברכך': 'I-will-bless-you',
  'יברך': 'he-will-bless',
  'ויברך': 'and-he-blessed',
  // קדש = sanctified
  'קדש': 'sanctified',
  'קדשו': 'they-sanctified',
  'קדוש': 'holy',
  'הקדוש': 'the-Holy',
  'הקדש': 'the-holy',
  'קדושים': 'holy-ones',

  // =====================================================
  // ADDITIONAL VERBS FROM THE BAD GLOSSES
  // =====================================================
  // עבד forms
  'יעבד': 'he-will-serve',
  // ענה = afflicted/answered
  'ענה': 'answered',
  'עני': 'affliction',
  'עניכם': 'your-affliction',
  'ענים': 'afflicted-ones',
  'מעונים': 'afflicted',
  'מעני': 'from-my-affliction',
  // אסר = bound/imprisoned
  'אסר': 'bound',
  'אסורים': 'prisoners',
  'לאסר': 'to-bind',
  'ויאסרוהו': 'and-they-bound-him',
  // מלא = full/filled
  'מלא': 'full',
  'מלאו': 'they-were-filled',
  'נמלאו': 'they-were-filled',
  'תמלא': 'will-be-filled',
  'המלא': 'the-full',
  'מלאה': 'was-filled',
  // רעה = shepherded/evil
  'רעה': 'shepherd',
  'ורעה': 'and-shepherd',
  'רע': 'evil',
  'הרע': 'the-evil',
  'ברע': 'in-evil',
  'רעב': 'hungry',
  'רעים': 'evil-ones',
  'רעי': 'companions-of',
  'ורעיו': 'and-his-companions',
  // נבא = prophesied
  'נבא': 'prophesied',
  'ויתנבאו': 'and-they-prophesied',
  'התנבא': 'he-prophesied',
  'להתנבא': 'to-prophesy',
  // עצב = grieved
  'עצב': 'grief',
  'ויתעצב': 'and-he-was-grieved',
  'להתעצב': 'to-be-grieved',
  // שבע = swore/seven
  'שבע': 'seven',
  'שבועה': 'oath',
  'שבועות': 'oaths',
  'שבועותיהם': 'their-oaths',
  'השביע': 'he-made-swear',
  'נשבע': 'he-swore',
  'וישבעו': 'and-they-were-satisfied',
  'תשע': 'nine',
  'התשע': 'the-nine',
  // פגע = encountered
  'פגע': 'encountered',
  'ויפגעו': 'and-they-encountered',
  'נגע': 'touched',
  'ויגע': 'and-he-touched',
  'הנוגעים': 'those-touching',
  // נסע = traveled
  'נסע': 'traveled',
  'נסעו': 'they-traveled',
  'נוסעים': 'traveling',
  'מסע': 'journey',
  'מסענו': 'our-journey',
  // שכן = dwelt
  'שכן': 'dwelt',
  'אשכן': 'I-will-dwell',
  'ישכן': 'he-will-dwell',
  // אבל = but/mourning
  'אבל': 'but',
  // אבד = perished
  'אבד': 'perished',
  'אבדו': 'they-perished',
  'ויאבד': 'and-he-perished',
  'לאבד': 'to-perish',
  'אביתי': 'I-was-willing',
  // כרע = knelt
  'כרע': 'knelt',
  'כרעו': 'they-knelt',
  'ויכרע': 'and-he-knelt',
  'לכרע': 'to-kneel',
  // ישע = saved
  'ישע': 'salvation',
  'יושיע': 'he-will-save',
  'נושעו': 'they-were-saved',
  'הושיע': 'he-saved',
  // חמל = had-compassion
  'חמל': 'had-compassion',
  'אחמל': 'I-will-have-compassion',
  // קבל = received
  'קבל': 'received',
  'אקבל': 'I-will-receive',
  'ואקבל': 'and-I-received',
  'קבלו': 'they-received',
  'קבלוני': 'they-received-me',
  'תקבל': 'you-will-receive',
  // מער = west
  'מערב': 'west',
  'המערב': 'the-west',
  'במערב': 'in-the-west',
  // עמל = toiled
  'עמל': 'toil',
  'עמלם': 'their-toil',
  // רשע = wicked
  'רשע': 'wicked',
  'רשעים': 'wicked-ones',
  'הרשעים': 'the-wicked',
  'ירשיעונו': 'they-will-condemn-us',
  // כנע = humbled
  'כנע': 'humbled',
  'ויכנע': 'and-he-humbled',
  'תכנעו': 'you-will-be-humbled',
  'נכנעו': 'they-were-humbled',
  // פשע = transgressed
  'פשע': 'transgression',
  'פשעי': 'transgressions-of',
  'פשעיהם': 'their-transgressions',
  // שער = hair/gate
  'שער': 'gate',
  'שערה': 'hair',
  'שערים': 'gates',
  // אמן = faith/amen
  'אמון': 'faith',
  'אמונה': 'faith',
  'אמונת': 'faith-of',
  'באמונת': 'in-faith-of',
  'ואמונתכם': 'and-your-faith',
  'באמונתכם': 'in-your-faith',
  // תקע = blew (trumpet)
  'תקע': 'blew',
  'ויתקע': 'and-he-blew',
  // צע = wound
  'פצע': 'wound',
  'פצעים': 'wounds',
  // בצע = gain/profit
  'בצע': 'gain',
  'ובצע': 'and-profit',
  // גאון = pride
  'גאון': 'pride',
  'גאונם': 'their-pride',
  'בגאונם': 'in-their-pride',
  // עצם = bone/self
  'עצם': 'bone',
  'עצמות': 'bones',
  'עצמך': 'yourself',
  // עצר = restrained
  'עצר': 'restraint',
  'מעצור': 'restraint',
  // שבי = captivity
  'שבי': 'captivity',
  'שבויים': 'captives',
  'השבויים': 'the-captives',
  // גלה = revealed/exiled
  'גלה': 'revealed',
  'אגלה': 'I-will-reveal',
  'ויגל': 'and-he-revealed',
  // אחז = possessed
  'אחז': 'seized',
  'אחזה': 'possession',
  // אהב = loved
  'אהב': 'loved',
  'אהבו': 'they-loved',
  'אהבה': 'love',
  // ירא = feared
  'ירא': 'feared',
  'יראת': 'fear-of',
  'מיראת': 'from-fear-of',
  'יראה': 'fear',
  // אימה = terror
  'אימה': 'terror',
  'אימת': 'terror-of',
  // פלא = wonderful
  'פלא': 'wonder',
  'נפלא': 'wonderful',
  'נפלאות': 'wonders',
  // שמאל = left
  'שמאל': 'left',
  // רעש = earthquake/trembled
  'רעש': 'earthquake',
  'וירעשו': 'and-they-trembled',
  'רעשו': 'they-trembled',
  // עוף = bird/fowl
  'עוף': 'bird',
  'העוף': 'the-birds',
  // עמר = sheaf (Omer)
  'עמר': 'Emer',
  // עדר = flock
  'עדר': 'flock',
  'עדרים': 'flocks',
  'עדריהם': 'their-flocks',
  // טעם = tasted
  'טעם': 'tasted',
  'יטעמו': 'they-will-taste',
  // אויל = fool
  'אויל': 'fool',
  'אוילים': 'fools',
  // אטום = sealed
  'אטום': 'sealed',
  'אטומות': 'sealed',
  'אטומה': 'sealed',
  // על = yoke/upon
  'על': 'yoke',
  'עול': 'yoke',
  // ערמה = craftiness
  'ערמה': 'craftiness',
  'בערמה': 'with-craftiness',
  // רוצח = murderer
  'רוצח': 'murderer',
  'הרוצח': 'the-murderer',
  'רצח': 'murder',
  // גער = rebuked
  'גער': 'rebuked',
  'גערו': 'they-rebuked',
  'ויגער': 'and-he-rebuked',
  // צעד = marched
  'צעד': 'marched',
  'צעדו': 'they-marched',
  'יצעדו': 'they-will-march',
  // קרע = tore
  'קרע': 'tore',
  'הקרוע': 'the-torn',
  // אסף = gathered
  'אסף': 'gathered',
  'ויאספו': 'and-they-gathered',
  'אספו': 'they-gathered',
  // אלץ = compelled
  'אלץ': 'compelled',
  'ויאלצו': 'and-they-were-compelled',
  'נאלצו': 'they-were-compelled',
  // אחד = united
  'אחד': 'one',
  'ויתאחדו': 'and-they-united',
  'התאחדו': 'they-united',
  // עוד = testified/again
  'עוד': 'again',
  'יעיד': 'he-will-testify',
  'העיד': 'testified',
  // כלא = prison
  'כלא': 'prison',
  'מכלא': 'from-prison',
  'בכלא': 'in-prison',
  // שבע = satisfied
  'שבע': 'satisfied',
  'וישבעו': 'and-they-were-satisfied',
  // אור = light
  'אור': 'light',
  'האור': 'the-light',
  'ויאר': 'and-he-shone',
  // באר = well/explained
  'באר': 'well',
  'לבאר': 'to-explain',
  // אהל = tent
  'אהל': 'tent',
  'אהלים': 'tents',
  'באהלים': 'in-tents',
  // אויר = air
  'אויר': 'air',
  // מעמק = depth
  'מעמק': 'depth',
  'מעמקי': 'depths-of',
  'ממעמקי': 'from-the-depths-of',
  // אצבע = finger
  'אצבע': 'finger',
  'אצבעו': 'his-finger',
  'באצבעו': 'with-his-finger',
  // צאן = flock
  'צאן': 'flock',
  'הצאן': 'the-flock',
  // אלהים = God
  'אלהים': 'God',
  'אלהי': 'God-of',
  'אלהיהם': 'their-God',
  'לאלהיהם': 'to-their-God',
  'באלהים': 'in-God',
  // ועד = witness/testimony
  'עד': 'witness',
  'עדות': 'testimony',
  // חיה = lived
  'חיה': 'lived',
  'חי': 'living',
  'חיים': 'life',
  'תחיו': 'you-will-live',
  // רצה = wanted/was-pleased
  'רצה': 'desired',
  'רצון': 'will',
  // שרת = served/ministered
  'שרת': 'ministered',
  'לשרת': 'to-minister',
  'משרת': 'minister',
  // רבה = multiplied/great
  'רב': 'great',
  'רבו': 'they-multiplied',
  'רבים': 'many',
  'הרבה': 'much',
  // רשות = permission/authority
  'רשות': 'authority',
  // קבר = buried
  'קבר': 'buried',
  'נקברו': 'they-were-buried',
  'קברו': 'they-buried',
  // זקן = old/elder
  'זקן': 'elder',
  'זקנים': 'elders',
  'זקנתו': 'his-old-age',
  // לכד = captured
  'לכד': 'captured',
  'וילכד': 'and-he-captured',
  // גדף = blasphemed
  'גדף': 'blasphemed',
  'גדפו': 'they-blasphemed',
  // כלל = general/all
  'כלל': 'general',
  // משך = drew/pulled
  'משך': 'drew',
  'ותמשך': 'and-it-drew',
  'נמשכו': 'they-were-drawn',
  // חזק = strengthened/strong
  'חזק': 'strong',
  'חזקו': 'they-were-strong',
  'ויתחזקו': 'and-they-strengthened',
  'יחזק': 'he-will-strengthen',
  'חזק': 'strength',
  // שיג = overtook
  'הישג': 'overtook',
  'וישג': 'and-he-overtook',
  // הרס = destroyed
  'הרס': 'destruction',
  // שב = returned/dwelt
  'וישב': 'and-he-returned',
  // דרום = south
  'דרום': 'south',
  'בדרום': 'in-the-south',
  'הדרום': 'the-south',
  // גבול = border
  'גבול': 'border',
  'גבולות': 'borders',
  'לגבולות': 'to-the-borders',
  // חבל = pain/rope
  'חבל': 'pain',
  'חבלי': 'pains-of',
  'בחבלי': 'in-pains-of',
  // בטח = trusted
  'בטח': 'trusted',
  'ויבטחו': 'and-they-trusted',
  'בוטח': 'trusting',
  // יסף = added/continued
  'יסף': 'added',
  'הוסיף': 'added',
  'הוסיפו': 'they-continued',
  'התוסיפו': 'will-you-continue',
  // שקר = lied
  'שקר': 'falsehood',
  'שקרת': 'you-lied',
  // שחת = destroy/pit
  'שחת': 'pit',
  'לשחת': 'to-destroy',
  'השחתה': 'destruction',
  'להשחתה': 'to-destruction',
  'השחיתו': 'they-destroyed',
  // קשה = hard
  'קשה': 'hard',
  'יקשה': 'he-will-harden',
  'הקשה': 'he-hardened',
  // גזר = decreed/cut
  'גזר': 'decreed',
  'ויגזר': 'and-he-decreed',
  // ספק = enough
  'ספק': 'enough',
  'מספיק': 'sufficient',
  // מזרח = east
  'מזרח': 'east',
  'ממזרח': 'from-the-east',
  'המזרח': 'the-east',
  'במזרח': 'in-the-east',
  // חבר = companion
  'חבר': 'companion',
  'חברי': 'my-companions',
  // קצץ = cut-off
  'קצץ': 'cut-off',
  'ויקצץ': 'and-he-cut-off',
  // מתן = gift
  'מתן': 'gift',
  'ומתן': 'and-a-gift',
  // שלך = cast/threw
  'שלך': 'cast',
  'השליך': 'cast',
  'וישליכו': 'and-they-cast',
  'להשליכם': 'to-cast-them',
  'הושלכו': 'they-were-cast',
  // שכר = reward/wage
  'שכר': 'reward',
  'שכרם': 'their-reward',
  // תמהון = astonishment
  'תמהון': 'astonishment',
  'תמהונם': 'their-astonishment',
  'לתמהונם': 'to-their-astonishment',
  // נחם = comforted
  'נחם': 'comforted',
  'תנחם': 'you-will-comfort',
  'ינחם': 'he-will-comfort',
  // כרח = forced
  'כרח': 'forced',
  'הוכרחתם': 'you-were-forced',
  'הוכרחו': 'they-were-forced',
  // טבל = immersed/baptized
  'טבל': 'baptized',
  'ונטבל': 'and-he-was-baptized',
  'נטבל': 'was-baptized',
  'להטביל': 'to-baptize',
  // חותם = seal
  'חותם': 'seal',
  'חתום': 'sealed',
  // חכמה = wisdom
  'חכמה': 'wisdom',
  'חכמתו': 'his-wisdom',
  // סתר = secret/hidden
  'סתר': 'secret',
  'הסתר': 'the-secret',
  // למד = taught
  'למד': 'taught',
  'למדם': 'he-taught-them',
  'ללמד': 'to-teach',
  // תקף = strengthened/overpowered
  'תקף': 'overpowered',
  'להתקיף': 'to-overpower',
  // חפץ = desired
  'חפץ': 'desired',
  'נחפץ': 'we-desire',
  // ירש = inherited
  'ירש': 'inherited',
  'ויירש': 'and-he-inherited',
  'ירשה': 'inheritance',
  'יירשנה': 'he-will-inherit-it',
  'לירש': 'to-inherit',
  // חפש = freedom
  'חפש': 'freedom',
  'החפש': 'the-freedom',
  // מבצר = fortress
  'מבצר': 'fortress',
  'מבצרים': 'fortresses',
  'מבצריהם': 'their-fortresses',
  'במבצריהם': 'in-their-fortresses',
  // סוד = secret
  'סוד': 'secret',
  'סודי': 'secret',
  'הסודי': 'the-secret',
  // בקש = sought
  'בקש': 'sought',
  'המבקש': 'the-one-seeking',
  'נבקש': 'we-seek',
  'לבקש': 'to-seek',
  // מטמון = treasure
  'מטמון': 'treasure',
  'מטמונים': 'treasures',
  'מטמוניהם': 'their-treasures',
  // שמנה = eight
  'שמנה': 'eight',
  'שמונה': 'eight',
  // שלם = peace/complete
  'שלם': 'complete',
  'שלום': 'peace',
  'נשלמה': 'it-was-completed',
  'לשלם': 'to-pay',
  // קבץ = gathered
  'קבץ': 'gathered',
  'יתקבצו': 'they-will-gather',
  'התקבצו': 'they-gathered',
  'תקבץ': 'will-gather',
  // תמה = wonder/astonishment
  'תמה': 'wondered',
  // הפר = broke (covenant)
  'הפר': 'broke',
  'להפר': 'to-break',
  // חרפה = reproach
  'חרפה': 'reproach',
  // זכר = remembered
  'זכר': 'remembered',
  'זכרו': 'they-remembered',
  'לזכר': 'to-remember',
  // שמר = guarded
  'שמרו': 'they-guarded',
  // נצחון = victory
  'נצחון': 'victory',
  'נצחי': 'eternal',
  'נצחית': 'eternal',
  // פחד = fear
  'פחד': 'fear',
  'הפחד': 'the-fear',
  // פגש = met/encountered
  'פגש': 'met',
  // מרגל = spy
  'מרגל': 'spy',
  'מרגלים': 'spies',
  // שמח = joy
  'שמח': 'joy',
  'שמחה': 'joy',
  'שמחת': 'joy-of',
  // קרב = approached/battle
  'קרב': 'battle',
  'קרבה': 'drew-near',
  'מקרב': 'from-the-midst',
  'קרוב': 'near',
  'קרובים': 'near-ones',
  'קרוביהם': 'their-relatives',
  // חצ = urgent
  'נחוץ': 'urgent',
  // נחור = Nahor (proper name)
  'נחור': 'Nahor',
  // צדקה = righteousness
  'צדקה': 'righteousness',
  'הצדקה': 'the-righteousness',
  // הצלחה = success
  'הצלחה': 'success',
  // נפיחה = bellows (Jaredite)
  'נפיחה': 'bellows',
  // קצת = some
  'קצת': 'some',
  'קצתם': 'some-of-them',
  // פרכת = veil/curtain
  'פרכת': 'veil',
  'לפרכת': 'to-the-veil',
  // מרד = rebelled
  'מרד': 'rebelled',
  'וימרד': 'and-he-rebelled',
  // חסד = mercy/kindness
  'חסד': 'mercy',
  'חסדי': 'my-mercy',
  'חסדו': 'his-mercy',
  // גבור = mighty
  'גבור': 'mighty',
  'גבורים': 'mighty-ones',
  // נקם = vengeance
  'נקם': 'vengeance',
  'להנקם': 'to-take-vengeance',
  // שמד = destroyed
  'שמד': 'destroyed',
  'וישמידו': 'and-they-destroyed',
  'השמידו': 'they-destroyed',
  // חלה = sick
  'חלה': 'sick',
  'חולה': 'sick',
  // צפה = watched
  'צפה': 'watched',
  'לצפות': 'to-watch',
  // חגר = girded
  'חגר': 'girded',
  'חגרו': 'they-girded',
  // רמס = trampled
  'רמס': 'trampled',
  'ולרמס': 'and-to-trample',
  'לרמס': 'to-trample',
  // נסד = established
  'נוסד': 'established',
  'נוסדה': 'was-established',
  // ספינה = ship
  'ספינה': 'ship',
  'ספינות': 'ships',
  // פנה = turned
  'פנה': 'turned',
  // שלמה = complete/perfect
  'השלמה': 'the-complete',
  // כתב = written
  'כתוב': 'written',
  // גרש = drove-out
  'גרש': 'drove-out',
  'ויגרשוהו': 'and-they-drove-him-out',
  // שים = put/place
  'שים': 'put',
  // וכח = argued/debated
  'וכח': 'debated',
  'להתוכח': 'to-debate',
  // רחב = wide/broad
  'רחב': 'wide',
  'וירחב': 'and-he-expanded',
  // סבב = surrounded
  'סבב': 'surrounded',

  // =====================================================
  // BOOK OF MORMON PROPER NAMES (transliterated)
  // =====================================================
  'ישמעאל': 'Ishmael',
  'שאול': 'Sheol',
  'השאול': 'the-Sheol',
  'לשאול': 'to-Sheol',
  'משאול': 'from-Sheol',
  'ושאול': 'and-Sheol',
  'שאולה': 'to-Sheol',
  'בשאול': 'into-Sheol',
  'מצרים': 'Egypt',
  'ממצרים': 'from-Egypt',
  'המצרים': 'the-Egyptians',
  'כמצרים': 'like-Egypt',
  'אשור': 'Assyria',
  'מאשור': 'from-Assyria',
  'שיז': 'Shiz',
  'שולה': 'Shule',
  'בשולה': 'in-Shule',
  'קשקומן': 'Kishkumen',
  'סמית': 'Smith',
  'שילם': 'Shilom',
  'שילום': 'Shilom',
  'שרד': 'Shared',
  'שז': 'Shez',
  'שבלון': 'Shiblon',
  'שבלום': 'Shiblom',
  'שמלון': 'Shemlon',
  'רפלקיש': 'Riplakish',
  'שרם': 'Sherem',
  'כמיש': 'Chemish',
  'נהור': 'Nehor',
  'פכוס': 'Pahkoos',
  'זמנריהה': 'Zemnarihah',
  'נפיים': 'Nephites',
  'אנטיונום': 'Antionum',
  'אנטיפרה': 'Antiparah',
  'גדיאנטון': 'Gadianton',
  'אורהה': 'Orihah',
  'אורההי': 'Orihah',
  'עמולק': 'Amulek',
  'העמולונים': 'the-Amulonites',
  'והעמולונים': 'and-the-Amulonites',
  'עמינדב': 'Aminadab',
  'טאומנר': 'Teomner',
  'וטאומנר': 'and-Teomner',
  'אכיש': 'Akish',
  'לאכיש': 'to-Akish',
  'כוריינטום': 'Coriantumr',
  'כום': 'Com',
  'מלק': 'Melek',
  'אתנים': 'mighty-ones',
  'ארכי': 'long-of',
  'אריכי': 'long-of',
  // The Ishmaelites
  'הישמעאלים': 'the-Ishmaelites',
  'והישמעאלים': 'and-the-Ishmaelites',
  'ישמעאלים': 'Ishmaelites',
  'וישמעאלים': 'and-Ishmaelites',
  // Chaldeans
  'כשדים': 'Chaldeans',
  'הכשדים': 'the-Chaldeans',
  'מכשדים': 'from-Chaldeans',
  'בכשדים': 'among-Chaldeans',
  // Philistia
  'פלשת': 'Philistia',

  // =====================================================
  // ADDITIONAL WORDS FROM ANALYSIS
  // =====================================================
  // אפלו = even
  'אפלו': 'even',
  'ואפלו': 'and-even',
  // אשם = guilty
  'אשם': 'guilty',
  // מלאך = angel/messenger
  'מלאך': 'angel',
  'מלאכו': 'his-angel',
  'מלאכים': 'angels',
  'המלאך': 'the-angel',
  // בורא = Creator
  'בורא': 'Creator',
  'הבורא': 'the-Creator',
  'בוראם': 'their-Creator',
  'לבורא': 'to-the-Creator',
  // אוצר = treasure
  'אוצר': 'treasure',
  'אוצרות': 'treasures',
  // אהלי = Oh that/Would that
  'אהלי': 'would-that',
  // רחב = wide
  'רחב': 'wide',
  // מלכי צדק = Melchizedek
  'מלכיצדק': 'Melchizedek',
  // שר שלום = Prince of Peace
  'שרשלום': 'Prince-of-Peace',
  // יכל = was-able
  'יכל': 'was-able',
  'יכול': 'able',
  'הכל': 'the-Almighty',
  // קדש = holy
  'הקדש': 'the-Holy',
  'קדש': 'holy',

  // Additional frequent words from bad glosses
  'חק': 'statute',
  'חקים': 'statutes',
  'החקים': 'the-statutes',
  'תפלה': 'prayer',
  'תפלות': 'prayers',
  'שבועה': 'oath',
  'עבודה': 'labor',
  'העבודה': 'the-labor',
  'חכם': 'wise',
  'חכמים': 'wise-men',
  'גבורה': 'might',
  'רחמים': 'mercy',
  'ברחמים': 'with-mercy',
  'כבוד': 'glory',
  'הכבוד': 'the-glory',
  'כבודו': 'his-glory',
  'עולם': 'forever',
  'לעולם': 'forever',
  'מעולם': 'from-of-old',
  'שלום': 'peace',
  'השלום': 'the-peace',
  'בשלום': 'in-peace',
  'אמת': 'truth',
  'האמת': 'the-truth',
  'באמת': 'in-truth',
  'אמנם': 'indeed',
  'חסד': 'kindness',
  'משה': 'Moses',
  'למשה': 'to-Moses',
  'תשובה': 'repentance',
  'התשובה': 'the-repentance',
  'בתשובה': 'in-repentance',
  'כפרה': 'atonement',
  'הכפרה': 'the-atonement',
  'בכפרה': 'in-atonement',
  'תחיה': 'resurrection',
  'התחיה': 'the-resurrection',
  'גאולה': 'redemption',
  'הגאולה': 'the-redemption',
  'גואל': 'redeemer',
  'הגואל': 'the-Redeemer',
  'משיח': 'Messiah',
  'המשיח': 'the-Messiah',
  'למשיח': 'to-the-Messiah',
  'במשיח': 'in-the-Messiah',

  // Very common grammatical words with ayin/aleph
  'את': 'ACC',
  'אתם': 'you',
  'ואתם': 'and-you',
  'אל': 'to',
  'אלה': 'these',
  'האלה': 'these',
  'על': 'upon',
  'עד': 'until',
  'עם': 'with',
  'אם': 'if',
  'אשר': 'which',
  'אני': 'I',
  'אנחנו': 'we',
  'אתה': 'you',

  // More contextual words from the bad glosses
  'נביאו': 'his-prophet',
  'לנביא': 'to-the-prophet',
  'צדיק': 'righteous',
  'הצדיק': 'the-righteous',
  'צדיקים': 'righteous-ones',
  'רשע': 'wicked',
  'הרשע': 'the-wicked',
  'רשעה': 'wickedness',
  'הרשעה': 'the-wickedness',
  'ברשעה': 'in-wickedness',
  'חטאה': 'sin',
  'החטאה': 'the-sin',
  'בחטאה': 'in-sin',
  'עון': 'iniquity',
  'העון': 'the-iniquity',
  'עונות': 'iniquities',
  'עונותיהם': 'their-iniquities',

  // מצר = Egypt/distress
  'מצר': 'Egypt',
  'מצרים': 'Egypt',
  'מצרים': 'Egypt',
  'במצרים': 'in-Egypt',
  'ממצרים': 'from-Egypt',
  // שאר = remnant
  'שאר': 'remnant',
  'ושאר': 'and-remnant',

  // Commonly seen verb forms
  'ויהי': 'and-it-was',
  'היה': 'was',
  'יהיה': 'will-be',

  // =====================================================
  // WORDS SPECIFICALLY IN THE BAD GLOSSES FILE
  // =====================================================
  // From hebrew_in_gloss section - direct Hebrew word matches
  'אתרוחי': '[ACC]-the-Spirit-of',
  'אתרוח': '[ACC]-the-Spirit-of',
  'ממך': 'from-you',
  'בנך': 'your-Son',
  'נבקש': 'we-ask',
  'ישמעאל': 'Ishmael',
  'רוחו': 'His-Spirit',

  // Additional forms
  'חוק': 'statute',
  'חקי': 'statutes-of',
  'חקו': 'his-statute',
  'מלכות': 'kingdom',
  'המלכות': 'the-kingdom',

  // verb: תקן = established
  'תקן': 'established',
  'תקנו': 'they-established',
  // verb: נגד = told
  'נגד': 'told',
  'הגיד': 'told',
  'ויגד': 'and-he-told',
  // verb: שלט = ruled
  'שלט': 'ruled',
  'ממשלה': 'government',
  'הממשלה': 'the-government',
  // noun: צור = rock
  'צור': 'rock',
  'הצור': 'the-rock',
  // noun: אש = fire
  'אש': 'fire',
  'האש': 'the-fire',
  'באש': 'in-fire',
  // noun: קול = voice
  'קול': 'voice',
  'הקול': 'the-voice',
  'קולו': 'his-voice',
  'בקול': 'with-a-voice',
  // noun: עם = people
  'לעמים': 'to-the-peoples',
  'העמים': 'the-peoples',

  // More from the bad glosses
  'יעז': 'he-will-dare',
  'יעזו': 'they-will-dare',
  'ויודעו': 'and-they-became-known',
  'צעקו': 'they-cried-out',
  'ויצעקו': 'and-they-cried-out',
  'רוצחים': 'murderers',
  'כנעו': 'they-humbled',
  'חנם': 'free/for-nothing',
  'חיל': 'army',
  'כח': 'power',
  'הכח': 'the-power',
  'כחו': 'his-power',
  'בכח': 'with-power',
  'לחץ': 'oppression',
  'רגז': 'anger',
  'כעס': 'anger',
  'זכרון': 'remembrance',
  'הזכרון': 'the-remembrance',
  'חשך': 'darkness',
  'החשך': 'the-darkness',
  'בחשך': 'in-darkness',
  'נגב': 'south',
  'הנגב': 'the-south',
  'בנגב': 'in-the-south',
  'צפון': 'north',
  'הצפון': 'the-north',
  'בצפון': 'in-the-north',
  'מרכבה': 'chariot',
  'מרכבות': 'chariots',
  'חומה': 'wall',
  'החומה': 'the-wall',
  'חומות': 'walls',
  'שער': 'gate',
  'השער': 'the-gate',
  'שערים': 'gates',
  'כסא': 'throne',
  'הכסא': 'the-throne',
  'כתר': 'crown',
  'משפט': 'judgment',
  'צדק': 'righteousness',
  'הצדק': 'the-righteousness',
  'בצדק': 'in-righteousness',
  'כפר': 'atonement',

  // More frequent transliteration-style entries
  'התוכח': 'debated',
  'ויתוכחו': 'and-they-debated',
  'שפך': 'poured',
  'וישפך': 'and-he-poured',
  'ונשפך': 'and-it-was-poured',
  'נשפך': 'was-poured',
  'תרנגלת': 'hen',
  'סכנה': 'danger',
  'סכנת': 'danger-of',
  'בסכנת': 'in-danger-of',
};

// ============================================================
// MORPHOLOGICAL PREFIX/SUFFIX STRIPPING
// ============================================================

// Common prefixes (order matters: longest first for multi-char)
const prefixes = [
  { pat: 'וה', gloss: 'and-the-' },
  { pat: 'ול', gloss: 'and-to-' },
  { pat: 'וב', gloss: 'and-in-' },
  { pat: 'ומ', gloss: 'and-from-' },
  { pat: 'וכ', gloss: 'and-as-' },
  { pat: 'ול', gloss: 'and-to-' },
  { pat: 'ו', gloss: 'and-' },
  { pat: 'ה', gloss: 'the-' },
  { pat: 'ב', gloss: 'in-' },
  { pat: 'ל', gloss: 'to-' },
  { pat: 'מ', gloss: 'from-' },
  { pat: 'כ', gloss: 'as-' },
  { pat: 'ש', gloss: 'that-' },
];

// Common suffixes
const suffixes = [
  { pat: 'ותיהם', gloss: '-their' },
  { pat: 'ותיכם', gloss: '-your' },
  { pat: 'ותינו', gloss: '-our' },
  { pat: 'יהם', gloss: '-their' },
  { pat: 'יכם', gloss: '-your' },
  { pat: 'ינו', gloss: '-our' },
  { pat: 'יהן', gloss: '-their' },
  { pat: 'והו', gloss: '-him' },
  { pat: 'ונו', gloss: '-us' },
  { pat: 'הם', gloss: '-them' },
  { pat: 'כם', gloss: '-you' },
  { pat: 'נו', gloss: '-us' },
  { pat: 'הו', gloss: '-him' },
  { pat: 'ים', gloss: '' },  // plural
  { pat: 'ות', gloss: '' },  // plural feminine
  { pat: 'ו', gloss: '-his' },
  { pat: 'ה', gloss: '' },   // feminine
  { pat: 'י', gloss: '-my' },
  { pat: 'ך', gloss: '-your' },
  { pat: 'ם', gloss: '-their' },
  { pat: 'ן', gloss: '' },   // plural
];

// Root dictionary for morphological decomposition (normalized Hebrew -> English)
const rootDict = {};
// Populate from manualFixes
for (const [heb, eng] of Object.entries(manualFixes)) {
  rootDict[heb] = eng;
}

function tryMorphologicalLookup(normalizedHebrew) {
  // Direct lookup first
  if (rootDict[normalizedHebrew]) {
    return rootDict[normalizedHebrew];
  }

  // Try stripping prefixes
  for (const pf of prefixes) {
    if (normalizedHebrew.startsWith(pf.pat) && normalizedHebrew.length > pf.pat.length + 1) {
      const stem = normalizedHebrew.substring(pf.pat.length);
      if (rootDict[stem]) {
        return pf.gloss + rootDict[stem];
      }
      // Try stripping suffix from the stem
      for (const sf of suffixes) {
        if (stem.endsWith(sf.pat) && stem.length > sf.pat.length + 1) {
          const root = stem.substring(0, stem.length - sf.pat.length);
          if (rootDict[root]) {
            return pf.gloss + rootDict[root] + sf.gloss;
          }
        }
      }
    }
  }

  // Try stripping only suffixes
  for (const sf of suffixes) {
    if (normalizedHebrew.endsWith(sf.pat) && normalizedHebrew.length > sf.pat.length + 1) {
      const root = normalizedHebrew.substring(0, normalizedHebrew.length - sf.pat.length);
      if (rootDict[root]) {
        return rootDict[root] + sf.gloss;
      }
    }
  }

  // Try verb prefix patterns (imperfect: י/ת/א/נ + root)
  const verbPrefixes = [
    { pat: 'י', gloss: 'he-will-' },
    { pat: 'ת', gloss: 'you-will-' },
    { pat: 'א', gloss: 'I-will-' },
    { pat: 'נ', gloss: 'we-will-' },
    { pat: 'וי', gloss: 'and-he-' },
    { pat: 'ות', gloss: 'and-she-' },
  ];
  for (const vp of verbPrefixes) {
    if (normalizedHebrew.startsWith(vp.pat) && normalizedHebrew.length > vp.pat.length + 1) {
      const stem = normalizedHebrew.substring(vp.pat.length);
      if (rootDict[stem]) {
        return vp.gloss + rootDict[stem];
      }
      // Also try removing verb suffixes (ו = they, ה = she)
      for (const vs of [{ pat: 'ו', gloss: '' }, { pat: 'ה', gloss: '' }]) {
        if (stem.endsWith(vs.pat) && stem.length > vs.pat.length + 1) {
          const root = stem.substring(0, stem.length - vs.pat.length);
          if (rootDict[root]) {
            return vp.gloss + rootDict[root];
          }
        }
      }
    }
  }

  return null;
}

// ============================================================
// CLEAN TRANSLITERATION (fallback)
// ============================================================
const hebrewToLatin = {
  'א': '',    // aleph - silent
  'ב': 'v',
  'ג': 'g',
  'ד': 'd',
  'ה': 'h',
  'ו': 'o',
  'ז': 'z',
  'ח': 'ch',
  'ט': 't',
  'י': 'i',
  'כ': 'kh',
  'ך': 'kh',
  'ל': 'l',
  'מ': 'm',
  'ם': 'm',
  'נ': 'n',
  'ן': 'n',
  'ס': 's',
  'ע': '',    // ayin - silent
  'פ': 'f',
  'ף': 'f',
  'צ': 'ts',
  'ץ': 'ts',
  'ק': 'k',
  'ר': 'r',
  'שׁ': 'sh',
  'שׂ': 's',
  'ש': 'sh',
  'ת': 't',
};

function cleanTransliterate(hebrew) {
  // First strip niqqud
  let stripped = stripNiqqud(hebrew).replace(/[׃־]/g, '');
  let result = '';
  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];
    // Check for shin/sin with dot (already stripped by niqqud removal, so just ש)
    if (hebrewToLatin[ch] !== undefined) {
      result += hebrewToLatin[ch];
    } else if (/[\u05D0-\u05EA]/.test(ch)) {
      // Unknown Hebrew letter - transliterate as ?
      result += '?';
    } else {
      // Pass through non-Hebrew chars (like hyphens)
      result += ch;
    }
  }
  // Capitalize first letter
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  // If result is empty (e.g., all alephs/ayins), provide a placeholder
  if (result.replace(/[^a-zA-Z]/g, '').length === 0) {
    result = '(untranslatable)';
  }
  return result;
}

// ============================================================
// MAIN PROCESSING
// ============================================================

console.log('Reading BOM.html...');
let html = fs.readFileSync(BOM_PATH, 'utf8');

console.log('Reading bad_glosses_final.json...');
const badGlosses = JSON.parse(fs.readFileSync(BAD_GLOSSES_PATH, 'utf8'));

const allBadEntries = [
  ...badGlosses.hebrew_in_gloss,
  ...badGlosses.transliterations
];

console.log(`Total bad gloss entries: ${allBadEntries.length}`);
let totalOccurrences = 0;
allBadEntries.forEach(e => totalOccurrences += e.count);
console.log(`Total bad gloss occurrences: ${totalOccurrences}`);

// Build replacement map: exact string to replace -> new string
let fixedCount = 0;
let unfixedCount = 0;
let fixedOccurrences = 0;
let unfixedOccurrences = 0;
const replacements = []; // {from, to, count, hebrew}

for (const entry of allBadEntries) {
  const hebrew = entry.hebrew;
  const badGloss = entry.gloss;
  const count = entry.count;
  const normalized = normalizeHebrew(hebrew);

  // Try manual dictionary first
  let newGloss = manualFixes[normalized];

  // Try morphological analysis if not found
  if (!newGloss) {
    newGloss = tryMorphologicalLookup(normalized);
  }

  // If still not found, try some additional heuristics
  if (!newGloss) {
    // Check if the bad gloss already has some English content we can use
    // (like "the-Spirit", "Ishmael", etc. from the transliterations that are partially OK)
    if (/^[A-Za-z]/.test(badGloss) &&
        /[aeiou]/i.test(badGloss) &&
        !(/[א-ת]/.test(badGloss)) &&
        badGloss.length > 3 &&
        (badGloss.includes('-') || /^[A-Z][a-z]+$/.test(badGloss))) {
      // This looks like it might already be a reasonable English gloss
      // (proper name or compound like "the-Spirit")
      // Keep it as is
      newGloss = badGloss;
    }
  }

  // Final fallback: clean transliteration
  if (!newGloss) {
    newGloss = cleanTransliterate(hebrew);
  }

  // Only replace if the new gloss is different from the bad one
  if (newGloss !== badGloss) {
    // The exact string in the HTML is: ["hebrew","gloss"]
    const fromStr = `"${hebrew}","${badGloss}"`;
    const toStr = `"${hebrew}","${newGloss}"`;
    replacements.push({ from: fromStr, to: toStr, count, hebrew, badGloss, newGloss });
    fixedCount++;
    fixedOccurrences += count;
  } else {
    unfixedCount++;
    unfixedOccurrences += count;
  }
}

// Sort replacements by length of 'from' string (longest first) to avoid partial matches
replacements.sort((a, b) => b.from.length - a.from.length);

console.log(`\nFixed entries: ${fixedCount} (${fixedOccurrences} occurrences)`);
console.log(`Kept as-is: ${unfixedCount} (${unfixedOccurrences} occurrences)`);
console.log(`Fix rate: ${(fixedOccurrences / totalOccurrences * 100).toFixed(1)}%`);

// Apply replacements
console.log('\nApplying replacements to BOM.html...');
let replacementsMade = 0;

for (const rep of replacements) {
  const before = html;
  // Use split/join for global replacement (handles special regex chars in Hebrew)
  html = html.split(rep.from).join(rep.to);
  const diff = (before.length - html.length + rep.to.length * ((before.length - html.length) / (rep.from.length - rep.to.length || 1)));
  // Count actual replacements
  const actualCount = (before.split(rep.from).length - 1);
  if (actualCount > 0) {
    replacementsMade += actualCount;
  }
}

// Also replace all YHWH with the-Lord
console.log('\nReplacing YHWH with the-Lord...');
const yhwhBefore = html;
html = html.split('"YHWH"').join('"the-Lord"');
const yhwhCount = (yhwhBefore.split('"YHWH"').length - 1);
console.log(`Replaced ${yhwhCount} YHWH occurrences.`);
replacementsMade += yhwhCount;

console.log(`\nTotal replacements made in HTML: ${replacementsMade}`);

// Write the fixed HTML
const outputPath = BOM_PATH;
console.log(`\nWriting fixed BOM.html to: ${outputPath}`);
fs.writeFileSync(outputPath, html, 'utf8');

console.log('Done!');

// Print a sample of the fixes for verification
console.log('\n=== SAMPLE FIXES ===');
const samples = replacements.slice(0, 40);
for (const s of samples) {
  console.log(`  ${s.hebrew} : "${s.badGloss}" -> "${s.newGloss}" (${s.count}x)`);
}

// Print unfixed entries for review
console.log('\n=== ENTRIES KEPT AS-IS (already reasonable or proper names) ===');
const keptEntries = allBadEntries.filter(e => {
  const normalized = normalizeHebrew(e.hebrew);
  return !replacements.find(r => r.hebrew === e.hebrew);
});
keptEntries.slice(0, 30).forEach(e => {
  console.log(`  ${e.hebrew} : "${e.gloss}" (${e.count}x)`);
});
