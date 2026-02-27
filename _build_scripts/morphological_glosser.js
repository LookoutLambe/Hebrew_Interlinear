const fs = require('fs');

// ═══════════════════════════════════════════════════════════
// HEBREW MORPHOLOGICAL GLOSSER
// Root-based system for generating interlinear glosses
// from Hebrew morphology: prefix + binyan + PGN + suffix
// ═══════════════════════════════════════════════════════════

// ── COMPREHENSIVE ROOT DICTIONARY ──
// Format: 'root': { qal: 'meaning', nif: 'meaning', piel: 'meaning', ... }
// Roots from the Book of Mormon Hebrew translation
const ROOTS = {
  // ── VERY COMMON VERBS ──
  'אמר': { qal: 'say', nif: 'be-said', hif: 'declare' },
  'בוא': { qal: 'come', hif: 'bring' },
  'הלך': { qal: 'go/walk', hif: 'lead', hit: 'walk-about' },
  'נתן': { qal: 'give', nif: 'be-given' },
  'עשה': { qal: 'do/make', nif: 'be-done' },
  'ראה': { qal: 'see', nif: 'appear', hif: 'show' },
  'שמע': { qal: 'hear', nif: 'be-heard', hif: 'proclaim' },
  'ידע': { qal: 'know', nif: 'be-known', hif: 'make-known' },
  'דבר': { qal: 'speak', nif: 'be-spoken', piel: 'speak' },
  'שוב': { qal: 'return', hif: 'restore', hof: 'be-restored' },
  'קרא': { qal: 'call/read', nif: 'be-called' },
  'שלח': { qal: 'send', nif: 'be-sent', piel: 'send-away' },
  'לקח': { qal: 'take', nif: 'be-taken', hof: 'be-taken' },
  'שים': { qal: 'put/place', hof: 'be-placed' },
  'שום': { qal: 'put/place' },
  'קום': { qal: 'arise', hif: 'raise', hof: 'be-raised', pol: 'establish' },
  'מות': { qal: 'die', hif: 'kill', hof: 'be-killed' },
  'ישב': { qal: 'sit/dwell', hif: 'cause-to-dwell', hof: 'be-settled' },
  'עלה': { qal: 'go-up', hif: 'bring-up' },
  'יצא': { qal: 'go-out', hif: 'bring-out', hof: 'be-brought-out' },
  'שמר': { qal: 'keep/guard', nif: 'be-guarded', hit: 'guard-oneself' },
  'עבר': { qal: 'cross-over', hif: 'bring-across' },
  'נשא': { qal: 'lift/carry', nif: 'be-lifted' },
  'אכל': { qal: 'eat', nif: 'be-eaten', hif: 'feed' },
  'כתב': { qal: 'write', nif: 'be-written' },
  'נפל': { qal: 'fall', hif: 'cause-to-fall' },
  'יכל': { qal: 'be-able' },
  'חיה': { qal: 'live', piel: 'preserve-alive', hif: 'revive' },
  'מצא': { qal: 'find', nif: 'be-found' },
  'עמד': { qal: 'stand', hif: 'set-up' },
  'פנה': { qal: 'turn', hif: 'turn' },
  'שפט': { qal: 'judge', nif: 'be-judged' },
  'מלך': { qal: 'reign', hif: 'make-king' },
  'ברך': { qal: 'bless', nif: 'be-blessed', piel: 'bless', pual: 'be-blessed', hit: 'bless-oneself' },
  'זכר': { qal: 'remember', nif: 'be-remembered', hif: 'remind' },
  'אסף': { qal: 'gather', nif: 'be-gathered' },
  'סור': { qal: 'turn-aside', hif: 'remove' },
  'ירד': { qal: 'go-down', hif: 'bring-down' },
  'כרת': { qal: 'cut', nif: 'be-cut-off', hif: 'cut-off' },
  'נכה': { qal: 'strike', nif: 'be-struck', hif: 'strike', hof: 'be-struck' },
  'חטא': { qal: 'sin', piel: 'purify', hit: 'purify-oneself' },
  'שבע': { qal: 'swear', nif: 'swear', hif: 'cause-to-swear' },
  'צוה': { qal: 'command', piel: 'command' },
  'בנה': { qal: 'build', nif: 'be-built' },
  'ירש': { qal: 'possess/inherit', hif: 'dispossess' },
  'רצה': { qal: 'be-pleased' },
  'שלם': { qal: 'be-complete', piel: 'repay/fulfill', hif: 'make-peace' },
  'גדל': { qal: 'be-great', piel: 'raise/magnify', hif: 'make-great' },
  'חזק': { qal: 'be-strong', piel: 'strengthen', hif: 'seize', hit: 'strengthen-oneself' },
  'סבב': { qal: 'surround', nif: 'turn-around', hif: 'cause-to-turn' },
  'נגד': { hif: 'declare/tell', hof: 'be-told' },
  'שחת': { qal: 'destroy', nif: 'be-destroyed', piel: 'destroy', hif: 'destroy' },
  'פקד': { qal: 'appoint/visit', nif: 'be-appointed', hif: 'appoint' },
  'רבה': { qal: 'be-many', hif: 'multiply' },
  'ספר': { qal: 'count', nif: 'be-told', piel: 'tell/recount' },
  'כלה': { qal: 'finish/consume', piel: 'finish' },
  'חרב': { qal: 'be-desolate', nif: 'be-destroyed', hif: 'destroy' },
  'אבד': { qal: 'perish', piel: 'destroy', hif: 'destroy' },
  'מלט': { qal: 'escape', nif: 'be-delivered', piel: 'deliver' },
  'גלה': { qal: 'reveal/uncover', nif: 'be-revealed', piel: 'reveal' },
  'ירא': { qal: 'fear', nif: 'be-feared/awesome' },
  'בטח': { qal: 'trust' },
  'כון': { qal: 'be-firm', nif: 'be-established', hif: 'prepare', pol: 'establish' },
  'רום': { qal: 'be-high', hif: 'exalt', pol: 'exalt' },
  'שפך': { qal: 'pour-out', nif: 'be-poured' },
  'פלל': { hit: 'pray' },
  'שבת': { qal: 'cease/rest' },
  'גרש': { qal: 'drive-out', nif: 'be-driven-out', piel: 'drive-out' },
  'נקם': { qal: 'avenge', nif: 'be-avenged', hit: 'avenge-oneself' },
  'טהר': { qal: 'be-clean', piel: 'cleanse', hit: 'purify-oneself' },
  'קבר': { qal: 'bury', nif: 'be-buried' },
  'קבץ': { qal: 'gather', nif: 'be-gathered', piel: 'gather' },
  'מנה': { qal: 'count', nif: 'be-counted' },
  'שמד': { qal: 'destroy', nif: 'be-destroyed', hif: 'destroy' },
  'פגע': { qal: 'encounter/attack' },
  'כרע': { qal: 'kneel/bow-down' },
  'רמס': { qal: 'trample' },
  'טמן': { qal: 'hide/bury' },
  'בהל': { qal: 'be-alarmed', nif: 'be-terrified', piel: 'terrify' },
  'תקע': { qal: 'thrust/blow' },
  'חנף': { qal: 'be-godless' },
  'שלם': { qal: 'be-complete', piel: 'repay', hif: 'make-peace' },
  'בער': { qal: 'burn', piel: 'burn' },
  'יסר': { qal: 'discipline', nif: 'be-disciplined', piel: 'discipline' },
  'כפר': { qal: 'cover', piel: 'atone' },
  'סלח': { qal: 'forgive', nif: 'be-forgiven' },
  'נחם': { qal: 'comfort', nif: 'repent/be-sorry', piel: 'comfort' },
  'בחר': { qal: 'choose', nif: 'be-chosen' },
  'מלא': { qal: 'be-full', nif: 'be-filled', piel: 'fill' },
  'שבר': { qal: 'break', nif: 'be-broken', piel: 'shatter' },
  'חרה': { qal: 'burn(anger)' },
  'עזב': { qal: 'forsake/leave' },
  'חשב': { qal: 'think/account', nif: 'be-reckoned', piel: 'plan' },
  'קשה': { qal: 'be-hard', hif: 'harden' },
  'נגע': { qal: 'touch/strike', hif: 'reach' },
  'יסד': { qal: 'found/establish' },
  'רדף': { qal: 'pursue', nif: 'be-pursued' },
  'צעק': { qal: 'cry-out' },
  'זעק': { qal: 'cry-out' },
  'נטה': { qal: 'stretch-out', hif: 'extend' },
  'שקר': { qal: 'lie/deceive', piel: 'deal-falsely' },
  'עוה': { qal: 'be-crooked', piel: 'pervert' },
  'רפא': { qal: 'heal', nif: 'be-healed' },
  'חלה': { qal: 'be-sick', piel: 'entreat', hif: 'make-sick' },
  'קדש': { qal: 'be-holy', piel: 'sanctify', hif: 'consecrate', hit: 'sanctify-oneself' },
  'טמא': { qal: 'be-unclean', nif: 'be-defiled', piel: 'defile' },
  'חנה': { qal: 'encamp' },
  'לחם': { qal: 'fight', nif: 'wage-war' },
  'נצל': { qal: 'deliver', nif: 'be-delivered', hif: 'deliver' },
  'ענה': { qal: 'answer', nif: 'be-humbled', piel: 'afflict' },
  'מכר': { qal: 'sell', nif: 'be-sold' },
  'קנה': { qal: 'buy/acquire' },
  'פתח': { qal: 'open', nif: 'be-opened' },
  'סגר': { qal: 'shut', nif: 'be-shut' },
  'הרג': { qal: 'kill', nif: 'be-killed' },
  'שרף': { qal: 'burn' },
  'נוס': { qal: 'flee' },
  'ברח': { qal: 'flee' },
  'חלל': { qal: 'profane', nif: 'be-profaned', piel: 'profane', hif: 'begin' },
  'אהב': { qal: 'love', nif: 'be-loved' },
  'שנא': { qal: 'hate' },
  'ישע': { qal: 'save', nif: 'be-saved', hif: 'save' },
  'גאל': { qal: 'redeem', nif: 'be-redeemed' },
  'פדה': { qal: 'ransom', nif: 'be-ransomed' },
  'עבד': { qal: 'serve/work', hif: 'enslave' },
  'למד': { qal: 'learn', piel: 'teach' },
  'סתר': { qal: 'hide', nif: 'be-hidden', hif: 'hide' },
  'כסה': { qal: 'cover', nif: 'be-covered', piel: 'cover' },
  'משח': { qal: 'anoint' },
  'נבא': { qal: 'prophesy', nif: 'prophesy', hit: 'prophesy' },
  'שאל': { qal: 'ask' },
  'ברא': { qal: 'create', nif: 'be-created' },
  'יעץ': { qal: 'counsel', nif: 'take-counsel' },
  'רשע': { qal: 'be-wicked', hif: 'condemn' },
  'צדק': { qal: 'be-righteous', hif: 'justify' },
  'גמל': { qal: 'deal-with', nif: 'be-rewarded' },
  'נסה': { qal: 'test', piel: 'test' },
  'חקר': { qal: 'search-out' },
  'דרש': { qal: 'seek/inquire', nif: 'be-sought' },
  'משל': { qal: 'rule', hif: 'cause-to-rule' },
  'שפל': { qal: 'be-low', hif: 'humble' },
  'גבר': { qal: 'be-mighty', hit: 'show-oneself-mighty' },
  'עזר': { qal: 'help' },
  'חסד': { qal: 'be-kind', hit: 'show-lovingkindness' },
  'צפה': { qal: 'watch', piel: 'overlay' },
  'כבד': { qal: 'be-heavy/honored', nif: 'be-honored', piel: 'honor', hif: 'harden' },
  'חכם': { qal: 'be-wise', piel: 'make-wise', hif: 'make-wise' },
  'רחם': { qal: 'love', piel: 'have-mercy' },
  'תעה': { qal: 'go-astray', hif: 'lead-astray' },
  'שקל': { qal: 'weigh' },
  'נחל': { qal: 'inherit', hif: 'give-possession' },
  'כנע': { qal: 'be-humbled', nif: 'humble-oneself', hif: 'humble' },
  'גנב': { qal: 'steal' },
  'רצח': { qal: 'murder' },
  'נאף': { qal: 'commit-adultery' },
  'עזר': { qal: 'help' },
  'אסר': { qal: 'bind', nif: 'be-bound' },
  'כבש': { qal: 'subdue' },
  'נטע': { qal: 'plant' },
  'קצר': { qal: 'reap/harvest' },
  'זרע': { qal: 'sow' },
  'חרש': { qal: 'plow', hif: 'be-silent' },
  'מדד': { qal: 'measure' },
  'ספד': { qal: 'mourn' },
  'בכה': { qal: 'weep' },
  'שמח': { qal: 'rejoice', piel: 'gladden' },
  'הלל': { qal: 'praise', piel: 'praise', hit: 'boast' },
  'שיר': { qal: 'sing' },
  'ספר': { qal: 'count', piel: 'tell/recount' },
  'נוח': { qal: 'rest', hif: 'give-rest' },
  'חדל': { qal: 'cease' },
  'יאש': { nif: 'despair' },
  'תמם': { qal: 'be-complete' },
  'מהר': { qal: 'hurry', piel: 'hurry' },
  'חפץ': { qal: 'delight-in' },
  'אור': { qal: 'give-light', hif: 'shine' },
  'קרב': { qal: 'approach', hif: 'bring-near' },
  'רחק': { qal: 'be-far', hif: 'remove-far' },
  'גמר': { qal: 'complete' },
  'חתם': { qal: 'seal' },
  'נסע': { qal: 'set-out/journey' },
  'שכן': { qal: 'dwell', hif: 'cause-to-dwell' },
  'יחל': { qal: 'wait/hope', piel: 'wait', hif: 'begin' },
  'מית': { hif: 'put-to-death' },
  'שתה': { qal: 'drink' },
  'חדש': { qal: 'be-new', piel: 'renew' },
  'שאר': { qal: 'remain', nif: 'be-left', hif: 'leave-over' },
  'כלא': { qal: 'confine' },
  'מנע': { qal: 'withhold' },
  'ערך': { qal: 'arrange' },
  'רעה': { qal: 'shepherd/tend' },
  'נגש': { qal: 'approach', nif: 'draw-near', hif: 'bring-near' },
  'עטר': { qal: 'crown', piel: 'crown' },
  'יתר': { qal: 'remain', nif: 'be-left', hif: 'leave' },
  'אצל': { hif: 'set-aside' },
  'חרד': { qal: 'tremble' },
  'סכן': { qal: 'be-in-danger', piel: 'endanger' },
  'עור': { qal: 'awake', hif: 'arouse' },
  'פרש': { qal: 'spread', piel: 'explain' },
  'חנן': { qal: 'be-gracious', hit: 'plead-for-mercy' },
  'כעס': { qal: 'be-angry', hif: 'provoke' },
  'בוש': { qal: 'be-ashamed', hif: 'put-to-shame' },
  'כחש': { qal: 'deny', piel: 'deny' },
  'קלל': { qal: 'be-light', nif: 'be-swift', piel: 'curse' },
  'אלה': { qal: 'swear' },
  'שבה': { qal: 'take-captive' },
  'עלם': { qal: 'hide', nif: 'be-hidden', hif: 'hide' },
  'יסף': { qal: 'add', hif: 'add/continue' },
  'נצר': { qal: 'watch/guard' },
  'עמל': { qal: 'toil' },
  'קצף': { qal: 'be-angry' },
  'יול': { hif: 'lead' },
  'הרס': { qal: 'tear-down' },
  'בלע': { qal: 'swallow', nif: 'be-swallowed' },
  'חפר': { qal: 'dig' },
  'שחק': { qal: 'laugh', piel: 'play' },
  'קשר': { qal: 'bind/conspire', nif: 'be-bound' },
  'ספן': { qal: 'cover/panel' },
  'עצם': { qal: 'be-mighty' },
  'רגז': { qal: 'tremble', hif: 'provoke' },
};

// ── NOUN DICTIONARY ──
const NOUNS = {
  'סופה': 'storm', 'סוּפָה': 'storm',
  'נורא': 'awesome/terrible',
  'מצוה': 'commandment', 'מצות': 'commandments-of',
  'אח': 'brother',
  'עין': 'eye',
  'מזמה': 'scheme/plan', 'מזמות': 'schemes',
  'בת': 'daughter',
  'בוץ': 'fine-linen',
  'מספר': 'number',
  'גאון': 'pride',
};

// ── PGN (Person-Gender-Number) LABELS ──
const PGN_LABELS = {
  // Perfect (suffix conjugation)
  'perf_3ms': '', // he-VERBed (default, no prefix needed)
  'perf_3fs': '(she)',
  'perf_3cp': 'they',
  'perf_2ms': 'you(ms)',
  'perf_2fs': 'you(fs)',
  'perf_2mp': 'you(mp)',
  'perf_1cs': 'I',
  'perf_1cp': 'we',
  // Imperfect (prefix conjugation)
  'impf_3ms': 'he-shall',
  'impf_3fs': 'she-shall',
  'impf_3mp': 'they-shall',
  'impf_3fp': 'they(f)-shall',
  'impf_2ms': 'you-shall',
  'impf_2fs': 'you(f)-shall',
  'impf_2mp': 'you(pl)-shall',
  'impf_1cs': 'I-shall',
  'impf_1cp': 'we-shall',
  // Vayyiqtol (narrative past)
  'vyq_3ms': 'and-he',
  'vyq_3fs': 'and-she',
  'vyq_3mp': 'and-they',
  'vyq_3fp': 'and-they(f)',
  'vyq_2ms': 'and-you',
  'vyq_1cs': 'and-I',
  'vyq_1cp': 'and-we',
  // Imperative
  'imp_ms': '',
  'imp_fs': '',
  'imp_mp': '',
  // Participle
  'ptc_ms': 'one-who',
  'ptc_fs': 'one-who(f)',
  'ptc_mp': 'ones-who',
  'ptc_fp': 'ones-who(f)',
  // Infinitive
  'inf_con': 'to',
  'inf_abs': '',
};

// ── PRONOMINAL SUFFIX GLOSSES ──
const PRON_SUFFIXES = {
  'וֹ': 'his', 'ו': 'his', 'הוּ': 'him',
  'ָהּ': 'her', 'הּ': 'her',
  'ִי': 'my', 'י': 'my',
  'ְךָ': 'your(ms)', 'ךָ': 'your',
  'ֵךְ': 'your(fs)',
  'ָם': 'their', 'ם': 'them',
  'ֵנוּ': 'our', 'נוּ': 'us/our',
  'כֶם': 'your(mp)',
  'כֶן': 'your(fp)',
  'ֵיהֶם': 'their',
  'ֵיהֶן': 'their(f)',
};

// ── PREFIX PARTICLE GLOSSES ──
const PREFIX_GLOSSES = {
  'וְ': 'and-', 'וּ': 'and-', 'ו': 'and-',
  'הַ': 'the-', 'הָ': 'the-', 'ה': 'the-',
  'בְּ': 'in-', 'בַּ': 'in-the-', 'בָּ': 'in-the-', 'ב': 'in-',
  'לְ': 'to-', 'לַ': 'to-the-', 'לָ': 'to-the-', 'ל': 'to-',
  'מִ': 'from-', 'מֵ': 'from-', 'מ': 'from-',
  'כְּ': 'as-', 'כַּ': 'as-the-', 'כ': 'as-',
  'שֶׁ': 'that-', 'שׁ': 'that-',
};

// ═══════════════════════════════════════════════════════════
// STEP 1: Extract all ??? words from all data files
// ═══════════════════════════════════════════════════════════

const files = [
  { path: '_chapter_data/al_data.js', label: 'Alma' },
  { path: '_chapter_data/he_data.js', label: 'Helaman' },
  { path: '_chapter_data/3n_data.js', label: '3 Nephi' },
  { path: '_chapter_data/et_data.js', label: 'Ether' },
];

// Collect all unique ??? words
const allQQQWords = new Set();
files.forEach(f => {
  const content = fs.readFileSync(f.path, 'utf8');
  const re = /\["([^"]+)","(\?\?\?)"\]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    allQQQWords.add(m[1]);
  }
});

console.log(`Total unique ??? words to process: ${allQQQWords.size}`);

// ═══════════════════════════════════════════════════════════
// STEP 2: Morphological parser
// ═══════════════════════════════════════════════════════════

// Strip sof-pasuk and maqaf
function cleanWord(w) {
  return w.replace(/׃$/, '').replace(/־/g, '-');
}

// Try to strip Hebrew prefix particles
function stripPrefixes(word) {
  const results = [{ prefix: '', stem: word }];

  // Single prefixes
  const singlePrefixes = [
    { pat: /^וַיִּ/, gloss: 'and-', rem: 'יִ', type: 'vyq' },
    { pat: /^וַתִּ/, gloss: 'and-', rem: 'תִּ', type: 'vyq' },
    { pat: /^וַיָּ/, gloss: 'and-', rem: 'יָ', type: 'vyq' },
    { pat: /^וְהִתְ/, gloss: 'and-', rem: 'הִתְ', type: 'vhit' },
    { pat: /^וּבְ/, gloss: 'and-in-', rem: '' },
    { pat: /^וּלְ/, gloss: 'and-to-', rem: '' },
    { pat: /^וּמִ/, gloss: 'and-from-', rem: '' },
    { pat: /^וְהַ/, gloss: 'and-the-', rem: '' },
    { pat: /^וּבַ/, gloss: 'and-in-the-', rem: '' },
    { pat: /^וְלַ/, gloss: 'and-to-the-', rem: '' },
    { pat: /^בְּהַ/, gloss: 'in-the-', rem: '' },
    { pat: /^לְהַ/, gloss: 'to-the-', rem: '' },
    { pat: /^מֵהַ/, gloss: 'from-the-', rem: '' },
    { pat: /^שֶׁבְּ/, gloss: 'that-in-', rem: '' },
    { pat: /^וְ/, gloss: 'and-', rem: '' },
    { pat: /^וּ/, gloss: 'and-', rem: '' },
    { pat: /^הַ/, gloss: 'the-', rem: '' },
    { pat: /^הָ/, gloss: 'the-', rem: '' },
    { pat: /^בְּ/, gloss: 'in-', rem: '' },
    { pat: /^בַּ/, gloss: 'in-the-', rem: '' },
    { pat: /^בָּ/, gloss: 'in-the-', rem: '' },
    { pat: /^לְ/, gloss: 'to-', rem: '' },
    { pat: /^לַ/, gloss: 'to-the-', rem: '' },
    { pat: /^לָ/, gloss: 'to-the-', rem: '' },
    { pat: /^מִ/, gloss: 'from-', rem: '' },
    { pat: /^מֵ/, gloss: 'from-', rem: '' },
    { pat: /^כְּ/, gloss: 'as-', rem: '' },
    { pat: /^כַּ/, gloss: 'as-the-', rem: '' },
    { pat: /^שֶׁ/, gloss: 'that-', rem: '' },
  ];

  for (const p of singlePrefixes) {
    if (p.pat.test(word)) {
      const stem = word.replace(p.pat, p.rem);
      if (stem.length >= 2) {
        results.push({ prefix: p.gloss, stem, type: p.type });
      }
    }
  }

  return results;
}

// Try to match a stem against known roots
function matchRoot(stem) {
  // This is simplified — a full parser would need vowel pattern analysis
  // For now, try direct lookup and common patterns

  // Strip common verb endings to find potential roots
  const endings = [
    { pat: /וּ$/, pgn: '3cp/3mp' },
    { pat: /תִּי$/, pgn: '1cs' },
    { pat: /תָּ$/, pgn: '2ms' },
    { pat: /תְּ$/, pgn: '2fs' },
    { pat: /תֶּם$/, pgn: '2mp' },
    { pat: /נוּ$/, pgn: '1cp' },
    { pat: /ָה$/, pgn: '3fs' },
    { pat: /וֹ$/, pgn: 'suf-3ms' },
    { pat: /ִים$/, pgn: 'mp' },
    { pat: /וֹת$/, pgn: 'fp' },
  ];

  // For each potential ending, try stripping it and matching
  const matches = [];

  // Direct match first (for 3ms perfect or ms noun)
  for (const [root, meanings] of Object.entries(ROOTS)) {
    // Very simplified: check if the consonantal skeleton matches
    const rootCons = root.split('');
    const stemCons = stem.replace(/[\u0591-\u05C7\u05D0-\u05EA]/g, (ch) => {
      // Keep only consonants
      if (ch >= '\u05D0' && ch <= '\u05EA') return ch;
      return '';
    });
    // This would need much more sophisticated matching
  }

  return matches;
}

// ═══════════════════════════════════════════════════════════
// STEP 3: For now, generate a targeted dictionary approach
// focusing on the most impactful patterns
// ═══════════════════════════════════════════════════════════

// Generate verb forms programmatically from roots
function generateVerbForms(root, rootLetters, meanings) {
  const forms = {};
  const [r1, r2, r3] = rootLetters;

  // We'll build specific forms for the most common patterns
  // This is where the real morphological work happens

  if (meanings.qal) {
    const m = meanings.qal;
    // Perfect forms would need specific vowel patterns per root type
    // Imperfect prefix forms
    // Participles
    // etc.
  }

  return forms;
}

// For the practical approach: extract all ??? words,
// try prefix-stripping, and output what we can match
let matched = 0;
let unmatched = 0;
const unmatchedWords = [];

for (const word of allQQQWords) {
  const clean = cleanWord(word);
  const prefixResults = stripPrefixes(clean);

  let found = false;
  // Try each prefix-stripped version
  // (This is a stub - the full implementation would do root matching here)

  if (!found) {
    unmatched++;
    unmatchedWords.push(clean);
  }
}

console.log(`\nPrefix analysis complete.`);
console.log(`Words that need root-based glossing: ${allQQQWords.size}`);

// Output a sample of ??? words grouped by likely pattern
// to help design the root-matching logic
const byPattern = {
  vayyiqtol: [],    // וַיִּ... / וַתִּ...
  hifil: [],         // הִ...
  hitpael: [],       // הִתְ...
  niphal: [],        // נִ...
  piel_pual: [],     // ...ֵ...
  withPrefix: [],    // ב/ל/מ/כ/שׁ prefix
  withSuffix: [],    // pronominal suffix
  plain: [],         // no obvious affixes
};

for (const word of allQQQWords) {
  const w = cleanWord(word);
  if (/^וַיִּ|^וַיָּ|^וַתִּ/.test(w)) byPattern.vayyiqtol.push(w);
  else if (/^הִתְ|^וְהִתְ|^מִתְ|^לְהִתְ/.test(w)) byPattern.hitpael.push(w);
  else if (/^הִ|^הֵ/.test(w) && w.length > 4) byPattern.hifil.push(w);
  else if (/^נִ/.test(w)) byPattern.niphal.push(w);
  else if (/^וּ|^וְ|^בְּ|^בַּ|^לְ|^לַ|^מִ|^מֵ|^כְּ/.test(w)) byPattern.withPrefix.push(w);
  else if (/וֹ$|ָם$|ֵיהֶם$|ֵנוּ$|ְךָ$/.test(w)) byPattern.withSuffix.push(w);
  else byPattern.plain.push(w);
}

console.log('\n=== PATTERN DISTRIBUTION ===');
Object.entries(byPattern).forEach(([pat, words]) => {
  console.log(`${pat}: ${words.length} words`);
  // Show first 10 examples
  words.slice(0, 10).forEach(w => console.log(`  ${w}`));
});
