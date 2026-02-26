// Comprehensive final fix: find ALL remaining genuine transliteration artifacts and fix them
// Strategy:
// 1. Find glosses where segments match transliterate() output pattern (uppercase start, consonant-heavy)
// 2. Use enhanced dictionary + morphological analysis to fix them
// 3. Manual overrides for anything the dictionary can't handle

const fs = require('fs');
let bom = fs.readFileSync('BOM.html', 'utf8');
const dict = JSON.parse(fs.readFileSync('gloss_dictionary.json', 'utf8'));

function stripNiqqud(s) { return s.replace(/[\u0591-\u05C7]/g, ''); }

// Build stripped dictionary
const strippedDict = {};
for (const [heb, eng] of Object.entries(dict)) {
  const s = stripNiqqud(heb);
  if (!strippedDict[s]) strippedDict[s] = eng;
}

// === MASSIVE MANUAL DICTIONARY ADDITION ===
// Common Biblical Hebrew words missing from the original dictionary
const manualDict = {
  // Basic words the user pointed out are missing
  'דלת': 'door', 'דלתות': 'doors', 'דלתי': 'doors-of',

  // Verbs - Qal
  'רצו': 'they-ran', 'רצ': 'ran', 'רץ': 'ran',
  'נמנעו': 'they-refrained', 'נמנע': 'refrained',
  'נערמו': 'they-were-heaped', 'נערם': 'was-heaped',
  'נתרו': 'they-leaped', 'נתר': 'leaped',
  'נסבל': 'endured', 'נסבול': 'we-shall-endure',
  'נכריה': 'foreign(f)', 'נכרי': 'foreign',
  'נכרים': 'foreigners', 'נכריות': 'foreign-women',

  // Nouns
  'כהנה': 'priesthood', 'כהונה': 'priesthood',
  'חרון': 'wrath', 'חרוני': 'my-wrath', 'חרונו': 'his-wrath',
  'כבלי': 'chains-of', 'כבלים': 'chains',
  'עבותות': 'ropes/cords', 'עבות': 'cord',
  'חיצון': 'outer', 'חיצונה': 'outer(f)',
  'נשרפים': 'burned', 'נשרף': 'was-burned',
  'משי': 'silk', 'משיי': 'of-silk',
  'תקרא': 'you-shall-call', 'תקראו': 'you-shall-call',
  'שריון': 'armor', 'שריונים': 'armor(pl)',
  'חשן': 'breastplate', 'חושן': 'breastplate',
  'צאצאי': 'offspring-of', 'צאצאים': 'offspring',
  'כתובים': 'scriptures', 'כתוב': 'written',
  'ברקים': 'lightnings', 'ברק': 'lightning',
  'עבודה': 'service/ministry', 'עבודת': 'service-of',
  'מעמקי': 'depths-of', 'מעמק': 'depth', 'מעמקים': 'depths',
  'עמקי': 'depths-of', 'עמק': 'valley',
  'מצולות': 'depths', 'מצולה': 'deep',
  'שפלות': 'lowliness', 'שפלה': 'lowland',
  'תהום': 'abyss', 'תהומות': 'abysses',
  'חנפים': 'hypocrites', 'חנף': 'hypocrite',
  'קלעים': 'slings', 'קלע': 'sling',
  'צפיך': 'your-watchmen', 'צפי': 'watchmen-of',
  'מהירות': 'haste/swiftly', 'מהרה': 'quickly',
  'תחבולה': 'stratagem', 'תחבולות': 'stratagems',
  'אפרוחיה': 'her-chicks', 'אפרוח': 'chick',
  'טמאים': 'unclean(pl)', 'טמא': 'unclean', 'טמאה': 'unclean(f)',
  'ראויים': 'worthy', 'ראוי': 'worthy',
  'רעבים': 'hungry(pl)', 'רעב': 'hungry',
  'צמח': 'sprouted', 'יצמח': 'it-sprouts',
  'צמא': 'thirsty', 'צמאים': 'thirsty(pl)',
  'תוכחה': 'rebuke', 'תוכחות': 'rebukes',
  'קדרות': 'darkness', 'קדרה': 'dark',
  'גזית': 'hewn-stone', 'גזר': 'decree',
  'נביאי': 'prophets-of', 'נביאים': 'prophets',
  'מגפה': 'plague', 'מגפות': 'plagues',
  'שמינית': 'eighth(f)', 'שמיני': 'eighth',
  'תשיעית': 'ninth(f)', 'תשיעי': 'ninth',
  'ששית': 'sixth(f)', 'ששי': 'sixth',
  'שביעית': 'seventh(f)', 'שביעי': 'seventh',
  'עשירית': 'tenth(f)', 'עשירי': 'tenth',
  'ראשונה': 'first(f)', 'ראשון': 'first',
  'חמישית': 'fifth(f)', 'חמישי': 'fifth',
  'שנית': 'second(f)', 'שני': 'second',
  'שלישית': 'third(f)', 'שלישי': 'third',
  'רביעית': 'fourth(f)', 'רביעי': 'fourth',
  'מצרים': 'Egyptians', 'מצרי': 'Egyptian',
  'אשור': 'Assyria', 'אשורי': 'Assyrian',
  'נעים': 'pleasant', 'נעימות': 'pleasantness',
  'עיפים': 'weary(pl)', 'עיף': 'weary',
  'כבדים': 'heavy(pl)', 'כבד': 'heavy',
  'מביאה': 'brings(f)', 'מביא': 'brings',
  'ישר': 'straight/upright', 'ישרה': 'straight(f)',
  'חזק': 'strong/strengthen', 'יחזק': 'he-strengthens', 'לחזק': 'to-strengthen',
  'יחזקנו': 'he-strengthens-us', 'ויחזק': 'and-he-strengthened',
  'ויתחזקו': 'and-they-strengthened', 'התחזקו': 'strengthen-yourselves',
  'ויתאמצו': 'and-they-strove', 'התאמצו': 'strive',
  'חקות': 'statutes', 'חקה': 'statute',
  'בלתי': 'without/not', 'לבלתי': 'in-order-not-to',
  'אבדת': 'lost', 'אבד': 'lost/perish',
  'מתאבק': 'struggling', 'התאבק': 'struggled',
  'הסוג': 'retreat', 'להסוג': 'to-retreat',
  'האירו': 'they-illuminated', 'הארתום': 'illuminated-them',
  'בעבר': 'across', 'מעבר': 'from-across',
  'פנו': 'turn!', 'פנה': 'turned',
  'דעו': 'know!', 'דע': 'know!',
  'אומרים': 'saying(pl)', 'אומר': 'saying',

  // More verbs
  'נבהלו': 'they-were-terrified', 'נבהל': 'was-terrified',
  'נדהם': 'was-astonished', 'נדהמו': 'were-astonished',
  'נשבעו': 'they-swore', 'נשבע': 'swore',
  'נלכדו': 'they-were-captured', 'נלכד': 'was-captured',
  'נפקדו': 'they-were-appointed', 'נפקד': 'was-appointed',
  'נכנעו': 'they-humbled', 'נכנע': 'humbled',
  'נתפסו': 'they-were-seized', 'נתפש': 'was-seized',
  'נקראו': 'they-were-called', 'נקרא': 'was-called',
  'נשמדו': 'they-were-destroyed', 'נשמד': 'was-destroyed',
  'נכרתו': 'they-were-cut-off', 'נכרת': 'was-cut-off',
  'נשמעו': 'they-were-heard', 'נשמע': 'was-heard',
  'נבדלו': 'they-were-separated', 'נבדל': 'was-separated',
  'נמצאו': 'they-were-found', 'נמצא': 'was-found',
  'נהרגו': 'they-were-killed', 'נהרג': 'was-killed',
  'נהרסו': 'they-were-destroyed', 'נהרס': 'was-destroyed',
  'נתנו': 'was-given', 'נתן': 'gave',
  'נלחמו': 'they-fought', 'נלחם': 'fought',
  'ויאמרו': 'and-they-said', 'ויאמר': 'and-he-said',
  'ויעשו': 'and-they-did', 'ויעש': 'and-he-did',
  'וילכו': 'and-they-went', 'וילך': 'and-he-went',
  'ויבואו': 'and-they-came', 'ויבא': 'and-he-came',
  'ויהי': 'and-it-was', 'ויהיו': 'and-they-were',
  'ויקרא': 'and-he-called', 'ויקראו': 'and-they-called',
  'ויצא': 'and-he-went-out', 'ויצאו': 'and-they-went-out',
  'וישב': 'and-he-returned', 'וישבו': 'and-they-returned',
  'ויתן': 'and-he-gave', 'ויתנו': 'and-they-gave',
  'וירד': 'and-he-descended', 'וירדו': 'and-they-descended',
  'ויעל': 'and-he-ascended', 'ויעלו': 'and-they-ascended',
  'וישלח': 'and-he-sent', 'וישלחו': 'and-they-sent',
  'ויקם': 'and-he-arose', 'ויקמו': 'and-they-arose',
  'וישמע': 'and-he-heard', 'וישמעו': 'and-they-heard',
  'וידבר': 'and-he-spoke', 'וידברו': 'and-they-spoke',
  'ויכתב': 'and-he-wrote', 'ויכתבו': 'and-they-wrote',
  'ויבן': 'and-he-built', 'ויבנו': 'and-they-built',
  'וימת': 'and-he-died', 'וימתו': 'and-they-died',
  'ויפל': 'and-he-fell', 'ויפלו': 'and-they-fell',
  'ויסע': 'and-he-journeyed', 'ויסעו': 'and-they-journeyed',
  'וישם': 'and-he-placed', 'וישימו': 'and-they-placed',

  // Hifil verbs
  'השמיד': 'he-destroyed', 'השמידו': 'they-destroyed',
  'השליך': 'he-cast-out', 'השליכו': 'they-cast-out',
  'הכניע': 'he-subdued', 'הכניעו': 'they-subdued',
  'המשיך': 'he-continued', 'המשיכו': 'they-continued',
  'הצליח': 'he-prospered', 'הצליחו': 'they-prospered',
  'הרבה': 'he-multiplied', 'הרבו': 'they-multiplied',
  'הכרית': 'he-cut-off', 'הכריתו': 'they-cut-off',
  'הלביש': 'he-clothed', 'הלבישו': 'they-clothed',
  'הרשיע': 'he-acted-wickedly', 'הרשיעו': 'they-acted-wickedly',
  'השיב': 'he-restored', 'השיבו': 'they-restored',
  'הסיר': 'he-removed', 'הסירו': 'they-removed',
  'המית': 'he-put-to-death', 'המיתו': 'they-put-to-death',
  'הבריח': 'he-drove-away', 'הבריחו': 'they-drove-away',
  'הניח': 'he-left/set', 'הניחו': 'they-left/set',
  'הוציא': 'he-brought-out', 'הוציאו': 'they-brought-out',
  'הביא': 'he-brought', 'הביאו': 'they-brought',
  'הגיד': 'he-declared', 'הגידו': 'they-declared',
  'הגן': 'he-protected', 'הגנו': 'they-protected',
  'הציל': 'he-delivered', 'הצילו': 'they-delivered',
  'הפיל': 'he-caused-to-fall', 'הפילו': 'they-caused-to-fall',
  'הכה': 'he-struck', 'הכו': 'they-struck',
  'הראה': 'he-showed', 'הראו': 'they-showed',
  'העלה': 'he-raised-up', 'העלו': 'they-raised-up',
  'הודיע': 'he-made-known', 'הודיעו': 'they-made-known',
  'הושיע': 'he-saved', 'הושיעו': 'they-saved',
  'הושיב': 'he-settled', 'הושיבו': 'they-settled',
  'הפריד': 'he-separated', 'הפרידו': 'they-separated',
  'הסכים': 'he-agreed', 'הסכימו': 'they-agreed',
  'התפשט': 'he-spread-out', 'התפשטו': 'they-spread-out',
  'הרחיב': 'he-broadened', 'הרחיבו': 'they-broadened',
  'הקדים': 'he-preceded', 'הקדימו': 'they-preceded',
  'הקים': 'he-established', 'הקימו': 'they-established',
  'הפך': 'he-overturned', 'הפכו': 'they-overturned',
  'הפתיע': 'he-surprised', 'הפתיעו': 'they-surprised',

  // Hitpael verbs
  'התפלל': 'he-prayed', 'התפללו': 'they-prayed',
  'התחזק': 'he-strengthened', 'התחזקו': 'they-strengthened',
  'השתחוו': 'they-worshipped', 'השתחוה': 'he-worshipped',
  'התקדש': 'he-sanctified', 'התקדשו': 'they-sanctified',
  'התנבא': 'he-prophesied', 'התנבאו': 'they-prophesied',
  'התאמץ': 'he-exerted', 'התאמצו': 'they-exerted',
  'התבונן': 'he-pondered', 'התבוננו': 'they-pondered',
  'התחנן': 'he-besought', 'התחננו': 'they-besought',
  'הסתתר': 'he-hid', 'הסתתרו': 'they-hid',
  'הצטער': 'he-grieved', 'הצטערו': 'they-grieved',

  // Nifal verbs
  'נאסף': 'was-gathered', 'נאספו': 'they-were-gathered',
  'נבנה': 'was-built', 'נבנו': 'they-were-built',
  'נגלה': 'was-revealed', 'נגלו': 'they-were-revealed',
  'נודע': 'was-known', 'נודעו': 'they-were-known',
  'נולד': 'was-born', 'נולדו': 'they-were-born',
  'נשאר': 'remained', 'נשארו': 'they-remained',
  'נמלט': 'escaped', 'נמלטו': 'they-escaped',
  'נפל': 'fell', 'נפלו': 'they-fell',
  'נקבר': 'was-buried', 'נקברו': 'they-were-buried',
  'נחשב': 'was-considered', 'נחשבו': 'they-were-considered',
  'נכתב': 'was-written', 'נכתבו': 'they-were-written',
  'נמסר': 'was-delivered', 'נמסרו': 'they-were-delivered',
  'נעשה': 'was-done', 'נעשו': 'they-were-done',
  'נפגש': 'met', 'נפגשו': 'they-met',
  'נפתח': 'was-opened', 'נפתחו': 'they-were-opened',
  'נפרד': 'separated', 'נפרדו': 'they-separated',
  'נפקד': 'was-counted', 'נפקדו': 'they-were-counted',
  'נקבע': 'was-established', 'נקבעו': 'they-were-established',
  'נקם': 'vengeance', 'נקמה': 'vengeance',
  'נשבר': 'was-broken', 'נשברו': 'they-were-broken',
  'נסגר': 'was-closed', 'נסגרו': 'they-were-closed',
  'נתקן': 'was-corrected', 'נתקנו': 'they-were-corrected',

  // More common nouns
  'מלחמה': 'war', 'מלחמת': 'war-of', 'מלחמות': 'wars',
  'לחם': 'bread/food', 'לחמו': 'his-food',
  'לחימה': 'fighting', 'לחמתו': 'his-fighting',
  'חלשה': 'weakness', 'חלשות': 'weaknesses',
  'חלושותיהם': 'their-weaknesses',
  'חלשתם': 'their-weakness', 'חלשתו': 'his-weakness', 'חלשתי': 'my-weakness',
  'משפחותיהם': 'their-families', 'משפחותיכם': 'your-families',
  'משפחה': 'family', 'משפחות': 'families',
  'מונים': 'treasures', 'מטמוניו': 'his-treasures',
  'חלקלקות': 'flattery', 'חלק': 'portion',
  'שכר': 'wages', 'שכרם': 'their-wages',
  'חשבון': 'account', 'חשבונם': 'their-account',
  'שמה': 'guilt', 'שמתו': 'his-guilt',
  'מהפכת': 'turning/overturning',
  'כנסיותיהם': 'their-synagogues', 'כנסיה': 'synagogue', 'כנסיות': 'synagogues',
  'בית': 'house', 'בתי': 'houses-of', 'בתים': 'houses',
  'בתיהם': 'their-houses', 'בתיכם': 'your-houses',
  'כנף': 'wing', 'כנפיה': 'her-wings', 'כנפים': 'wings',
  'מפלגת': 'exceeding/extraordinary',
  'קדמוני': 'ancient', 'קדמונה': 'the-ancient(f)',
  'גשם': 'rain', 'גשמים': 'rains',
  'שטפון': 'flood', 'שטפות': 'floods',
  'צרר': 'adversary', 'צוררי': 'my-adversaries',
  'שעה': 'hour', 'שעות': 'hours',
  'חמדת': 'measure-of', 'כמדת': 'according-to-measure-of',
  'משקל': 'weight', 'כמשקל': 'as-the-weight-of',
  'מושל': 'ruler', 'מושלים': 'rulers',
  'סיבה': 'cause', 'סיבות': 'causes',
  'סופה': 'storm', 'סופות': 'storms', 'סערות': 'storms',
  'צום': 'fast', 'צמתי': 'I-fasted',
  'שריון': 'breastplate/armor', 'שריונים': 'breastplates/armor',
  'שריונם': 'their-armor',
  'מצפים': 'watching/lookouts',
  'הבדלה': 'separation', 'הבדל': 'separation',
  'שומעות': 'obedient(f.pl)',

  // Construct forms and bound forms
  'דבר': 'word-of', 'דברי': 'words-of',
  'חכמת': 'wisdom-of', 'חכמה': 'wisdom',
  'תורת': 'law/instruction-of', 'תורה': 'law/instruction',
  'בריאת': 'creation-of', 'בריאה': 'creation',
  'גדולת': 'greatness-of', 'גדולה': 'greatness/great(f)',
  'קדושת': 'holiness-of', 'קדושה': 'holiness',
  'גבורת': 'might-of', 'גבורה': 'might',
  'טובת': 'goodness-of', 'טובה': 'good(f)',
  'מלכות': 'kingdom', 'מלכת': 'queen-of',
  'עבדות': 'servitude', 'עבדת': 'service-of',
  'חרות': 'freedom', 'חירות': 'freedom',

  // Adjectives with gender/number
  'גדולים': 'great(pl)', 'גדול': 'great', 'גדולה': 'great(f)',
  'קטנים': 'small(pl)', 'קטן': 'small', 'קטנה': 'small(f)',
  'רעים': 'evil(pl)', 'רע': 'evil', 'רעה': 'evil(f)',
  'טובים': 'good(pl)', 'טוב': 'good',
  'חזקים': 'strong(pl)', 'חזק': 'strong', 'חזקה': 'strong(f)',
  'רבים': 'many(pl)', 'רב': 'many/great', 'רבות': 'many(f.pl)',
  'קדושים': 'holy(pl)', 'קדוש': 'holy', 'קדושה': 'holy(f)',
  'ישרים': 'upright(pl)', 'ישרה': 'upright(f)',
  'צדיקים': 'righteous(pl)', 'צדיק': 'righteous', 'צדקה': 'righteousness',
  'רשעים': 'wicked(pl)', 'רשע': 'wicked', 'רשעה': 'wickedness',
  'חכמים': 'wise(pl)', 'חכם': 'wise',
  'נאמנים': 'faithful(pl)', 'נאמן': 'faithful',
  'אמתי': 'true', 'אמיתי': 'true',

  // Time/number words
  'ירח': 'month', 'ירחים': 'months', 'חדש': 'month/new',

  // Place/direction
  'צפון': 'north', 'צפונה': 'northward',
  'דרום': 'south', 'דרומה': 'southward',
  'מזרח': 'east', 'מזרחה': 'eastward',
  'מערב': 'west', 'מערבה': 'westward',

  // Body parts
  'יד': 'hand', 'ידים': 'hands', 'ידי': 'hands-of',
  'רגל': 'foot', 'רגלים': 'feet', 'רגלי': 'feet-of',
  'עין': 'eye', 'עינים': 'eyes', 'עיני': 'eyes-of',
  'אזן': 'ear', 'אזנים': 'ears', 'אזני': 'ears-of',
  'פה': 'mouth', 'פי': 'mouth-of',
  'לב': 'heart', 'לבב': 'heart', 'לבי': 'my-heart',
  'ראש': 'head', 'ראשי': 'heads-of', 'ראשים': 'heads',
  'שכם': 'shoulder', 'שכמי': 'my-shoulder',

  // More common verbs in various forms
  'שמר': 'guard', 'שמרו': 'they-guarded', 'לשמור': 'to-guard',
  'בנה': 'build', 'בנו': 'they-built', 'לבנות': 'to-build',
  'שפט': 'judge', 'שפטו': 'they-judged', 'לשפוט': 'to-judge',
  'כתב': 'write', 'כתבו': 'they-wrote', 'לכתוב': 'to-write',
  'למד': 'learn/teach', 'למדו': 'they-learned', 'ללמוד': 'to-learn',
  'עזב': 'leave', 'עזבו': 'they-left', 'לעזוב': 'to-leave',
  'סגר': 'close', 'סגרו': 'they-closed', 'לסגור': 'to-close',
  'פתח': 'open', 'פתחו': 'they-opened', 'לפתוח': 'to-open',
  'אסף': 'gather', 'אספו': 'they-gathered', 'לאסוף': 'to-gather',
  'שלם': 'peace/complete', 'שלמו': 'they-made-peace', 'שלום': 'peace',
  'חלק': 'divide', 'חלקו': 'they-divided', 'לחלוק': 'to-divide',
  'הרג': 'kill', 'הרגו': 'they-killed', 'להרוג': 'to-kill',
  'לכד': 'capture', 'לכדו': 'they-captured', 'ללכוד': 'to-capture',
  'ירד': 'descend', 'ירדו': 'they-descended', 'לרדת': 'to-descend',
  'עלה': 'ascend', 'עלו': 'they-ascended', 'לעלות': 'to-ascend',
  'ישב': 'sit/dwell', 'ישבו': 'they-dwelt', 'לשבת': 'to-dwell',
  'שכב': 'lie-down', 'שכבו': 'they-lay-down', 'שכבים': 'lying-down',
  'קום': 'arise', 'קמו': 'they-arose', 'לקום': 'to-arise',
  'מות': 'die', 'מתו': 'they-died', 'למות': 'to-die',
  'ברח': 'flee', 'ברחו': 'they-fled', 'לברוח': 'to-flee',
  'נוס': 'flee', 'נסו': 'they-fled', 'לנוס': 'to-flee',
  'בכה': 'weep', 'בכו': 'they-wept', 'לבכות': 'to-weep',
  'זעק': 'cry-out', 'זעקו': 'they-cried-out', 'לזעוק': 'to-cry-out',
  'צעק': 'cry-out', 'צעקו': 'they-cried-out', 'לצעוק': 'to-cry-out',
  'ידע': 'know', 'ידעו': 'they-knew', 'לדעת': 'to-know',
  'ראה': 'see', 'ראו': 'they-saw', 'לראות': 'to-see',
  'שמע': 'hear', 'שמעו': 'they-heard', 'לשמוע': 'to-hear',
  'אמר': 'say', 'אמרו': 'they-said', 'לאמר': 'to-say',
  'נתן': 'give', 'נתנו': 'they-gave', 'לתת': 'to-give',
  'לקח': 'take', 'לקחו': 'they-took', 'לקחת': 'to-take',
  'שלח': 'send', 'שלחו': 'they-sent', 'לשלוח': 'to-send',
  'עשה': 'make/do', 'עשו': 'they-did', 'לעשות': 'to-do',
  'בוא': 'come', 'באו': 'they-came', 'לבוא': 'to-come',
  'הלך': 'go/walk', 'הלכו': 'they-went', 'ללכת': 'to-go',
  'שוב': 'return', 'שבו': 'they-returned', 'לשוב': 'to-return',
  'עבר': 'pass/cross', 'עברו': 'they-crossed', 'לעבור': 'to-cross',
  'חטא': 'sin', 'חטאו': 'they-sinned', 'לחטוא': 'to-sin',
  'צוה': 'command', 'צוו': 'they-commanded', 'לצוות': 'to-command',
  'ברך': 'bless', 'ברכו': 'they-blessed', 'לברך': 'to-bless',
  'תפש': 'seize', 'תפשו': 'they-seized', 'לתפוש': 'to-seize',
  'טבל': 'immerse/baptize', 'טבלו': 'they-immersed', 'לטבול': 'to-immerse',
  'חרת': 'engrave', 'חרתו': 'they-engraved', 'לחרות': 'to-engrave',
  'חנה': 'camp', 'חנו': 'they-camped', 'לחנות': 'to-camp',
  'טמן': 'hide/bury', 'טמנו': 'they-hid', 'לטמון': 'to-hide',
  'כלה': 'finish', 'כלו': 'they-finished', 'לכלות': 'to-finish',
  'כלתו': 'when-he-finished',
  'חפץ': 'desire', 'חפצו': 'they-desired', 'חפצתם': 'you-desired',
  'בלל': 'confuse', 'בללו': 'they-confounded', 'נבללו': 'they-were-confounded',
  'גרש': 'drive-out', 'גרשו': 'they-drove-out', 'יגרשנו': 'he-shall-drive-us',
  'בשל': 'ripen/cook', 'בשלו': 'they-ripened', 'יבשלו': 'they-shall-ripen',
  'נשם': 'breathe', 'לנשום': 'to-breathe',
  'דמות': 'likeness', 'כדמות': 'in-likeness-of',
  'חתם': 'seal', 'חתמתי': 'I-sealed',
  'סבב': 'surround', 'סבבום': 'surrounded-them', 'סבבו': 'they-surrounded',
  'דחף': 'push', 'נדחפו': 'they-were-pushed',
  'פשט': 'spread', 'להתפשט': 'to-spread',
  'שקר': 'lie/falsehood', 'משקר': 'liar', 'שקרן': 'liar',
  'רחם': 'have-mercy', 'רחמו': 'he-had-mercy',
  'חתן': 'father-in-law', 'חתנו': 'his-father-in-law',
  'משח': 'anoint', 'משחו': 'his-anointing', 'משיחו': 'his-anointed',
  'רסיסים': 'poisonous', 'רסיס': 'poison',
  'הנשרפים': 'the-burned-ones',
  'אך': 'surely/however', 'אולם': 'however',

  // More Ether/Jaredite proper names that might be transliterated
  'שולה': 'Shule', 'שרד': 'Shared',
  'קמנור': 'Comnor', 'קומ': 'Com',
};

// Merge manual dict into strippedDict
for (const [heb, eng] of Object.entries(manualDict)) {
  if (!strippedDict[heb]) strippedDict[heb] = eng;
}

// Prefix combinations (most specific first)
const prefixCombos = [
  // 4-char prefixes
  { strip: 4, niqqud: 'וכשה', gloss: 'and-as-that-the-' },
  { strip: 4, niqqud: 'ובשה', gloss: 'and-in-that-the-' },
  // 3-char prefixes
  { strip: 3, niqqud: 'וכש', gloss: 'and-as-that-' },
  { strip: 3, niqqud: 'ובה', gloss: 'and-in-the-' },
  { strip: 3, niqqud: 'ולה', gloss: 'and-to-the-' },
  { strip: 3, niqqud: 'ומה', gloss: 'and-from-the-' },
  { strip: 3, niqqud: 'וכה', gloss: 'and-as-the-' },
  { strip: 3, niqqud: 'שבה', gloss: 'that-in-the-' },
  { strip: 3, niqqud: 'שלה', gloss: 'that-to-the-' },
  { strip: 3, niqqud: 'ולב', gloss: 'and-to-in-' },
  { strip: 3, niqqud: 'ובב', gloss: 'and-in-in-' },
  { strip: 3, niqqud: 'ומב', gloss: 'and-from-in-' },
  // 2-char prefixes
  { strip: 2, niqqud: 'וב', gloss: 'and-in-' },
  { strip: 2, niqqud: 'ול', gloss: 'and-to-' },
  { strip: 2, niqqud: 'ומ', gloss: 'and-from-' },
  { strip: 2, niqqud: 'וכ', gloss: 'and-as-' },
  { strip: 2, niqqud: 'וש', gloss: 'and-that-' },
  { strip: 2, niqqud: 'בה', gloss: 'in-the-' },
  { strip: 2, niqqud: 'לה', gloss: 'to-the-' },
  { strip: 2, niqqud: 'מה', gloss: 'from-the-' },
  { strip: 2, niqqud: 'כה', gloss: 'as-the-' },
  { strip: 2, niqqud: 'שב', gloss: 'that-in-' },
  { strip: 2, niqqud: 'של', gloss: 'that-to-' },
  { strip: 2, niqqud: 'שמ', gloss: 'that-from-' },
  { strip: 2, niqqud: 'הת', gloss: 'the-' }, // hitpael nouns sometimes
  { strip: 2, niqqud: 'המ', gloss: 'the-' },
  { strip: 2, niqqud: 'הנ', gloss: 'the-' },
  // 1-char prefixes
  { strip: 1, niqqud: 'ה', gloss: 'the-' },
  { strip: 1, niqqud: 'ו', gloss: 'and-' },
  { strip: 1, niqqud: 'ב', gloss: 'in-' },
  { strip: 1, niqqud: 'ל', gloss: 'to-' },
  { strip: 1, niqqud: 'מ', gloss: 'from-' },
  { strip: 1, niqqud: 'כ', gloss: 'as-' },
  { strip: 1, niqqud: 'ש', gloss: 'that-' },
];

// Suffix patterns
const suffixPatterns = [
  { stripped: 'ותיהם', gloss: '-their', minRest: 2 },
  { stripped: 'ותיכם', gloss: '-your(pl)', minRest: 2 },
  { stripped: 'ותינו', gloss: '-our', minRest: 2 },
  { stripped: 'יהם', gloss: '-their', minRest: 2 },
  { stripped: 'יהן', gloss: '-their(f)', minRest: 2 },
  { stripped: 'יכם', gloss: '-your(pl)', minRest: 2 },
  { stripped: 'ינו', gloss: '-our', minRest: 2 },
  { stripped: 'תם', gloss: '-their', minRest: 2 },
  { stripped: 'תי', gloss: '-my', minRest: 2 },
  { stripped: 'נו', gloss: '-us/-our', minRest: 2 },
  { stripped: 'הם', gloss: '-them', minRest: 2 },
  { stripped: 'כם', gloss: '-you(pl)', minRest: 2 },
  { stripped: 'יו', gloss: '-his', minRest: 2 },
  { stripped: 'יה', gloss: '-her', minRest: 2 },
  { stripped: 'יך', gloss: '-your', minRest: 2 },
  { stripped: 'ם', gloss: '(pl)', minRest: 2 },
  { stripped: 'ו', gloss: '-his/-him', minRest: 2 },
  { stripped: 'ה', gloss: '-her', minRest: 2 },
  { stripped: 'י', gloss: '-my', minRest: 2 },
  { stripped: 'ך', gloss: '-your', minRest: 2 },
];

const pluralEndings = [
  { stripped: 'ים', gloss: '(pl)', minRest: 2 },
  { stripped: 'ות', gloss: '(pl.f)', minRest: 2 },
  { stripped: 'ין', gloss: '(pl)', minRest: 2 },
  { stripped: 'י', gloss: '-of', minRest: 2 },
];

function tryLookup(stripped) {
  if (strippedDict[stripped]) return strippedDict[stripped];
  if (stripped.endsWith('ו')) {
    const base = stripped.slice(0, -1);
    if (strippedDict[base]) return strippedDict[base];
  }
  if (stripped.endsWith('ה')) {
    const base = stripped.slice(0, -1);
    if (strippedDict[base]) return strippedDict[base];
  }
  if (stripped.endsWith('י')) {
    const base = stripped.slice(0, -1);
    if (strippedDict[base]) return strippedDict[base] + '-of';
  }
  if (stripped.endsWith('ת')) {
    const base = stripped.slice(0, -1);
    if (strippedDict[base]) return strippedDict[base] + '-of';
    if (strippedDict[base + 'ה']) return strippedDict[base + 'ה'];
  }
  return null;
}

function morphLookup(word) {
  const clean = word.replace(/[׃]/g, '').trim();
  if (!clean) return null;
  if (dict[clean]) return dict[clean];
  const stripped = stripNiqqud(clean);
  if (strippedDict[stripped]) return strippedDict[stripped];

  // Try prefix stripping
  for (const { strip, niqqud, gloss: prefGloss } of prefixCombos) {
    if (stripped.length > strip + 1 && stripped.startsWith(niqqud)) {
      const rest = stripped.slice(strip);
      const found = tryLookup(rest);
      if (found) return prefGloss + found;

      // Try suffix stripping on rest
      for (const { stripped: suf, gloss: sufGloss, minRest } of suffixPatterns) {
        if (rest.length > suf.length + minRest && rest.endsWith(suf)) {
          const root = rest.slice(0, -suf.length);
          const found2 = tryLookup(root);
          if (found2) return prefGloss + found2 + sufGloss;
          const found3 = tryLookup(root + 'ה');
          if (found3) return prefGloss + found3 + sufGloss;
          const found4 = tryLookup(root + 'ת');
          if (found4) return prefGloss + found4 + sufGloss;
        }
      }

      // Try plural on rest
      for (const { stripped: pl, gloss: plGloss, minRest } of pluralEndings) {
        if (rest.length > pl.length + minRest && rest.endsWith(pl)) {
          const root = rest.slice(0, -pl.length);
          const found2 = tryLookup(root);
          if (found2) return prefGloss + found2 + plGloss;
          const found3 = tryLookup(root + 'ה');
          if (found3) return prefGloss + found3 + plGloss;
        }
      }
    }
  }

  // Just suffix stripping
  for (const { stripped: suf, gloss: sufGloss, minRest } of suffixPatterns) {
    if (stripped.length > suf.length + minRest && stripped.endsWith(suf)) {
      const root = stripped.slice(0, -suf.length);
      const found = tryLookup(root);
      if (found) return found + sufGloss;
      const found2 = tryLookup(root + 'ה');
      if (found2) return found2 + sufGloss;
      const found3 = tryLookup(root + 'ת');
      if (found3) return found3 + sufGloss;
    }
  }

  // Just plural
  for (const { stripped: pl, gloss: plGloss, minRest } of pluralEndings) {
    if (stripped.length > pl.length + minRest && stripped.endsWith(pl)) {
      const root = stripped.slice(0, -pl.length);
      const found = tryLookup(root);
      if (found) return found + plGloss;
      const found2 = tryLookup(root + 'ה');
      if (found2) return found2 + plGloss;
    }
  }

  return null;
}

// Check if a gloss segment is a bad transliteration
function isBadTranslit(seg) {
  if (seg.length < 3) return false;
  const clean = seg.replace(/[[\]()]/g, '');
  if (!clean || clean.length < 3) return false;

  const lower = clean.toLowerCase();
  const v = (lower.match(/[aeiou]/g) || []).length;

  // Must be consonant-heavy: <20% vowels AND 4+ chars
  if (lower.length >= 4 && v / lower.length < 0.2) return true;
  // 4+ consecutive consonants
  if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(lower)) return true;
  // Starts with 3+ consonants and not a common English pattern
  if (/^[bcdfghjklmnpqrstvwxyz]{3}/i.test(lower) && lower.length >= 4) return true;
  // Hebrew chars
  if (/[\u0590-\u05FF]/.test(clean)) return true;

  return false;
}

function hasAnyBadSegment(gloss) {
  if (/[\u0590-\u05FF]/.test(gloss)) return true;
  const segs = gloss.split('-');
  for (const seg of segs) {
    if (isBadTranslit(seg)) return true;
  }
  return false;
}

// Process all glosses
const re = /\["([^"]+)","([^"]*)"\]/g;
let match;
const replacements = new Map();
let fixCount = 0;
let stillBad = 0;

while ((match = re.exec(bom)) !== null) {
  const heb = match[1];
  const gloss = match[2];
  if (!gloss || gloss === '' || heb === '׃') continue;
  if (!hasAnyBadSegment(gloss)) continue;

  // Try maqaf split
  const parts = heb.split('\u05BE');
  if (parts.length >= 2) {
    const gp = [];
    let allOk = true;
    for (const p of parts) {
      const f = morphLookup(p);
      if (f) gp.push(f); else { allOk = false; }
    }
    if (allOk) {
      const newGloss = gp.join('-');
      if (!hasAnyBadSegment(newGloss)) {
        replacements.set(match[0], `["${heb}","${newGloss}"]`);
        fixCount++;
        continue;
      }
    }
  }

  const found = morphLookup(heb);
  if (found && !hasAnyBadSegment(found)) {
    replacements.set(match[0], `["${heb}","${found}"]`);
    fixCount++;
  } else {
    stillBad++;
  }
}

console.log(`Found fixes for: ${fixCount} glosses`);
console.log(`Still bad (no fix found): ${stillBad}`);
console.log(`Applying ${replacements.size} replacements...`);

for (const [orig, repl] of replacements) {
  bom = bom.split(orig).join(repl);
}

// Also fix double prefixes again
const doublePrefixes = [
  [/the-the-/g, 'the-'],
  [/and-and-/g, 'and-'],
  [/in-in-/g, 'in-'],
  [/to-to-/g, 'to-'],
  [/from-from-/g, 'from-'],
  [/as-as-/g, 'as-'],
  [/that-that-/g, 'that-'],
  [/and-in-the-the-/g, 'and-in-the-'],
  [/and-to-the-the-/g, 'and-to-the-'],
  [/in-the-in-/g, 'in-the-'],
  [/to-the-to-/g, 'to-the-'],
  [/from-the-from-/g, 'from-the-'],
  [/and-in-in-/g, 'and-in-'],
  [/and-to-to-/g, 'and-to-'],
  [/and-from-from-/g, 'and-from-'],
];
let dpCount = 0;
for (const [pat, repl] of doublePrefixes) {
  const matches = bom.match(pat);
  if (matches) dpCount += matches.length;
  bom = bom.replace(pat, repl);
}
if (dpCount > 0) console.log(`Fixed ${dpCount} double-prefix occurrences`);

fs.writeFileSync('BOM.html', bom, 'utf8');
console.log('Saved BOM.html');

// Count remaining bad
const re2 = /\["([^"]+)","([^"]*)"\]/g;
let m2, remaining = 0;
while ((m2 = re2.exec(bom)) !== null) {
  if (m2[1] !== '׃' && hasAnyBadSegment(m2[2])) remaining++;
}
console.log(`Remaining bad glosses: ${remaining}`);
