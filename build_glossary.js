/**
 * build_glossary.js
 *
 * Extracts all Hebrew words from BOM.html, groups by consonantal root,
 * and produces a root glossary data file for the interlinear app.
 *
 * Outputs: roots_glossary.js, roots_glossary.json
 * Usage: node build_glossary.js
 */
const fs = require('fs');

const BOM_PATH = 'C:\\Users\\chris\\Desktop\\Hebrew BOM\\BOM.html';
const OUT_JS   = 'C:\\Users\\chris\\Desktop\\Hebrew BOM\\roots_glossary.js';
const OUT_JSON = 'C:\\Users\\chris\\Desktop\\Hebrew BOM\\roots_glossary.json';

// ── Strip all Hebrew vowels/cantillation to get consonantal skeleton ──
function stripNikkud(w) {
  // Remove all combining marks: vowels (U+05B0-05BD), cantillation (U+0591-05AF),
  // shin/sin dots (U+05C1-05C2), dagesh (U+05BC), and other marks
  return w.replace(/[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g, '');
}

// ── Prefix stripping (ported from BOM.html) ──
const prefixPatterns = [
  /^וְ/, /^וַ/, /^וּ/, /^וָ/, /^וֶ/,
  /^הַ/, /^הָ/, /^הֶ/,
  /^בְּ/, /^בַּ/, /^בִּ/, /^בָּ/, /^בֶּ/, /^בְ/, /^בַ/, /^בִ/,
  /^לְ/, /^לַ/, /^לִ/, /^לָ/, /^לֶ/,
  /^מִ/, /^מֵ/, /^מְ/, /^מַ/,
  /^כְּ/, /^כַּ/, /^כְ/, /^כַ/,
  /^שֶׁ/, /^שֶ/
];

function stripPrefixes(w) {
  w = w.replace(/^.*־/, ''); // Remove maqaf-joined particles
  let stripped = w;
  for (const p of prefixPatterns) {
    if (p.test(stripped) && stripped.replace(p, '').length >= 2) {
      stripped = stripped.replace(p, '');
      break;
    }
  }
  for (const p of prefixPatterns) {
    if (p.test(stripped) && stripped.replace(p, '').length >= 2) {
      stripped = stripped.replace(p, '');
      break;
    }
  }
  return stripped;
}

// ── Consonantal prefix stripping (operates on already-stripped-nikkud text) ──
const consonantPrefixes = [
  /^ו/, /^ה/, /^ב/, /^ל/, /^מ/, /^כ/, /^ש/
];

function stripConsonantPrefixes(cons) {
  let s = cons;
  // Try stripping up to 2 consonantal prefixes
  for (let round = 0; round < 2; round++) {
    for (const p of consonantPrefixes) {
      if (p.test(s) && s.replace(p, '').length >= 2) {
        s = s.replace(p, '');
        break;
      }
    }
  }
  return s;
}

// ── Explicit root map (ported from BOM.html + expanded) ──
const rootMap = {
  // חסד
  'חֶסֶד':'חסד','חֲסִידָה':'חסד','חָסִיד':'חסד','חַסְדּוֹ':'חסד',
  'חֲסִידוֹ':'חסד','חֲסָדָיו':'חסד','חֲסָדֶיךָ':'חסד','חַסְדְּךָ':'חסד',
  'חַסְדִּי':'חסד','חֲסִידִים':'חסד','חֲסָדִים':'חסד',
  // אלהים
  'אֱלֹהִים':'אלהים','אֱלֹהֵיהֶם':'אלהים','אֱלֹהָיו':'אלהים',
  'אֱלֹהֵינוּ':'אלהים','אֱלֹהֶיךָ':'אלהים','אֱלֹהַי':'אלהים',
  'אֵלִים':'אלהים','אֱלֹהֵי':'אלהים',
  // יהוה
  'יְהוָה':'יהוה','יהוָה':'יהוה','יָהּ':'יהוה',
  // אמר
  'אָמַר':'אמר','אֹמֵר':'אמר','אֹמְרִים':'אמר','יֹּאמַר':'אמר',
  'יֹּאמְרוּ':'אמר','תֹּאמַר':'אמר','אָמְרוּ':'אמר','אָמַרְתִּי':'אמר',
  'אָמַרְתָּ':'אמר','לֵאמֹר':'אמר','נֶאֱמַר':'אמר','יֵאָמֵר':'אמר',
  // עשה
  'עָשָׂה':'עשה','עֹשֶׂה':'עשה','עֹשִׂים':'עשה','יַעֲשֶׂה':'עשה',
  'יַעֲשׂוּ':'עשה','עֲשׂוּ':'עשה','עָשׂוּ':'עשה','עָשִׂיתָ':'עשה',
  'עָשִׂיתִי':'עשה','תַּעֲשֶׂה':'עשה','תַּעֲשׂוּ':'עשה','נַעֲשֶׂה':'עשה',
  'מַעֲשֵׂה':'עשה','מַעֲשֶׂיהָ':'עשה','מַעֲשִׂים':'עשה','מַעֲשֵׂיהֶם':'עשה',
  // הלך
  'הָלַךְ':'הלך','הֹלֵךְ':'הלך','הֹלְכִים':'הלך','יֵלֵךְ':'הלך',
  'יֵלְכוּ':'הלך','לָלֶכֶת':'הלך','הָלְכוּ':'הלך','תֵּלֵךְ':'הלך',
  // נתן
  'נָתַן':'נתן','נֹתֵן':'נתן','נָתְנוּ':'נתן','יִתֵּן':'נתן',
  'נָתַתִּי':'נתן','נָתַתָּ':'נתן','תִּתֵּן':'נתן','תִּתְּנוּ':'נתן',
  // בוא
  'בָּא':'בוא','בָּאוּ':'בוא','יָבוֹא':'בוא','יָבֹאוּ':'בוא',
  'תָּבוֹא':'בוא','לָבוֹא':'בוא','הֵבִיא':'בוא','הֵבִיאוּ':'בוא','מֵבִיא':'בוא',
  // ידע
  'יָדַע':'ידע','יוֹדֵעַ':'ידע','יוֹדְעִים':'ידע','יֵדַע':'ידע',
  'יֵדְעוּ':'ידע','דַּעַת':'ידע','דַעְתּוֹ':'ידע','לָדַעַת':'ידע',
  // שמע
  'שָׁמַע':'שמע','שֹׁמֵעַ':'שמע','שָׁמְעוּ':'שמע','יִשְׁמַע':'שמע',
  'יִשְׁמְעוּ':'שמע','שִׁמְעוּ':'שמע','תִּשְׁמְעוּ':'שמע',
  // ראה
  'רָאָה':'ראה','רֹאֶה':'ראה','רָאוּ':'ראה','יִרְאֶה':'ראה',
  'יִרְאוּ':'ראה','רְאֵה':'ראה','מַרְאֶה':'ראה',
  // דבר
  'דָּבָר':'דבר','דְּבָרִים':'דבר','דִּבֵּר':'דבר','דִּבְרֵי':'דבר',
  'דְּבַר':'דבר','יְדַבֵּר':'דבר','דִּבְּרוּ':'דבר',
  // ארץ
  'אֶרֶץ':'ארץ','אַרְצוֹ':'ארץ','אַרְצָם':'ארץ','אַרְצֵנוּ':'ארץ','אֲרָצוֹת':'ארץ',
  // עם
  'עַם':'עם','עַמִּי':'עם','עַמּוֹ':'עם','עַמָּם':'עם','עַמִּים':'עם','עַמְּךָ':'עם',
  // מלך
  'מֶלֶךְ':'מלך','מַלְכוּת':'מלך','מָלַךְ':'מלך','מָלְכוּ':'מלך',
  'מְלָכִים':'מלך','מַלְכֵי':'מלך','יִמְלֹךְ':'מלך',
  // רוח
  'רוּחַ':'רוח','רוּחוֹ':'רוח','רוּחִי':'רוח','רוּחָם':'רוח',
  // לב
  'לֵב':'לב','לֵבָב':'לב','לִבִּי':'לב','לִבּוֹ':'לב',
  'לִבָּם':'לב','לְבַבְכֶם':'לב','לִבֵּנוּ':'לב',
  // ישע
  'יְשׁוּעָה':'ישע','יְשׁוּעַת':'ישע','יוֹשִׁיעַ':'ישע','הוֹשִׁיעַ':'ישע',
  'מוֹשִׁיעַ':'ישע','תְּשׁוּעָה':'ישע',
  // צדק
  'צַדִּיק':'צדק','צַדִּיקִים':'צדק','צֶדֶק':'צדק','צִדְקָתוֹ':'צדק','צְדָקָה':'צדק',
  // שפט
  'שָׁפַט':'שפט','שֹׁפֵט':'שפט','שֹׁפְטִים':'שפט','מִשְׁפָּט':'שפט',
  'מִשְׁפָּטִים':'שפט','יִשְׁפֹּט':'שפט',
  // אמן
  'אֱמוּנָה':'אמן','אֱמוּנָתוֹ':'אמן','אֱמוּנָתֵנוּ':'אמן','אֱמוּנָתָם':'אמן',
  'הֶאֱמִין':'אמן','הֶאֱמִינוּ':'אמן','יַאֲמִין':'אמן','יַאֲמִינוּ':'אמן',
  'נֶאֱמָן':'אמן','אָמֵן':'אמן',
  // חטא
  'חַטָּאת':'חטא','חֵטְא':'חטא','חָטָא':'חטא','חָטְאוּ':'חטא',
  'חַטָּאִים':'חטא','חֲטָאֵיהֶם':'חטא','חֲטָאֶיךָ':'חטא',
  // קדש
  'קֹדֶשׁ':'קדש','קָדוֹשׁ':'קדש','קְדוֹשִׁים':'קדש','מִקְדָּשׁ':'קדש',
  'קִדֵּשׁ':'קדש','קָדְשׁוֹ':'קדש',
  // שוב
  'שָׁב':'שוב','שָׁבוּ':'שוב','יָשׁוּב':'שוב','יָשׁוּבוּ':'שוב',
  'שׁוּבוּ':'שוב','תָּשׁוּב':'שוב','תְּשׁוּבָה':'שוב',
  // כתב
  'כָּתַב':'כתב','כֹּתֵב':'כתב','כָּתְבוּ':'כתב','כָּתוּב':'כתב',
  'כְּתָבִים':'כתב','יִכְתֹּב':'כתב','כְּתַבְתִּי':'כתב','כָּתַבְתִּי':'כתב',
  // מות
  'מוֹת':'מות','מָוֶת':'מות','מֵת':'מות','מֵתִים':'מות',
  'יָמוּת':'מות','יָמוּתוּ':'מות','הֵמִית':'מות','הֵמִיתוּ':'מות',
  // ישב
  'יָשַׁב':'ישב','יוֹשֵׁב':'ישב','יוֹשְׁבִים':'ישב','יוֹשְׁבֵי':'ישב',
  'יָשְׁבוּ':'ישב','יֵשֵׁב':'ישב','יֵשְׁבוּ':'ישב',
  // עין
  'עַיִן':'עין','עֵינַי':'עין','עֵינָיו':'עין','עֵינֵיהֶם':'עין','עֵינֶיךָ':'עין',
  // יד
  'יָד':'יד','יָדוֹ':'יד','יָדִי':'יד','יְדֵיהֶם':'יד',
  'יָדְךָ':'יד','יָדָם':'יד','יָדַיִם':'יד',
  // בן
  'בֵּן':'בן','בְּנוֹ':'בן','בְּנִי':'בן','בָּנָיו':'בן','בָּנִים':'בן','בְּנֵי':'בן',
  // אב
  'אָב':'אב','אָבִי':'אב','אָבִיו':'אב','אֲבוֹתָם':'אב',
  'אֲבוֹתֵיהֶם':'אב','אֲבוֹתֵינוּ':'אב','אֲבוֹתַי':'אב',
  // קרא
  'קָרָא':'קרא','קֹרֵא':'קרא','קָרְאוּ':'קרא','יִקְרָא':'קרא','נִקְרָא':'קרא','קְרָא':'קרא',
  // נפש
  'נֶפֶשׁ':'נפש','נַפְשׁוֹ':'נפש','נַפְשִׁי':'נפש','נַפְשָׁם':'נפש',
  'נַפְשְׁךָ':'נפש','נַפְשׁוֹת':'נפש','נַפְשׁוֹתֵיהֶם':'נפש',
  // שלח
  'שָׁלַח':'שלח','שֹׁלֵחַ':'שלח','שָׁלְחוּ':'שלח','יִשְׁלַח':'שלח','שְׁלָחוֹ':'שלח',
  // ברית
  'בְּרִית':'ברית','בְּרִיתוֹ':'ברית','בְּרִיתִי':'ברית',
  // תורה
  'תּוֹרָה':'תורה','תּוֹרַת':'תורה','תּוֹרָתוֹ':'תורה','תּוֹרוֹת':'תורה',
};

// ── Consonantal root map: consonant skeleton -> canonical root ──
// This maps the stripped-nikkud form to the display root
const consonantRootMap = {};
for (const [form, root] of Object.entries(rootMap)) {
  const cons = stripNikkud(form);
  consonantRootMap[cons] = root;
}

// ── Also add common particles/function words ──
const PARTICLES = {
  'כי':'כי','כ':'כי',
  'אשר':'אשר',
  'לא':'לא','לו':'לא',
  'את':'את',
  'הנה':'הנה',
  'כן':'כן',
  'על':'על',
  'אלה':'אלה',
  'גם':'גם',
  'עתה':'עתה',
  'הוא':'הוא',
  'הם':'הם','הן':'הם',
  'היא':'היא',
  'אני':'אני','אנכי':'אני',
  'אתה':'אתה',
  'אנחנו':'אנחנו',
  'זה':'זה','זאת':'זה',
  'כל':'כל','כלם':'כל',
  'אם':'אם',
  'עד':'עד',
  'אך':'אך',
  'פן':'פן',
  'כמו':'כמו',
  'אשׁר':'אשר',
  'יש':'יש',
  'אין':'אין',
  'מאד':'מאד',
  'עוד':'עוד',
  'רק':'רק',
  'טרם':'טרם',
  'למה':'למה',
  'איך':'איך',
  'מי':'מי',
  'מה':'מה',
  'נא':'נא',
};

// Merge particles into consonantRootMap
for (const [cons, root] of Object.entries(PARTICLES)) {
  consonantRootMap[cons] = root;
}

// ── Get root for a Hebrew word ──
function getRoot(hw) {
  // 1. Check explicit rootMap (vocalized)
  if (rootMap[hw]) return rootMap[hw];

  // 2. Strip vocalized prefixes and check
  const stripped = stripPrefixes(hw);
  if (rootMap[stripped]) return rootMap[stripped];

  // 3. Get consonantal form and check consonant map
  const cons = stripNikkud(hw);
  if (consonantRootMap[cons]) return consonantRootMap[cons];

  // 4. Strip consonantal prefixes and check
  const strippedCons = stripConsonantPrefixes(cons);
  if (consonantRootMap[strippedCons]) return consonantRootMap[strippedCons];

  // 5. Return consonantal stripped form as root key
  return strippedCons;
}

// ── Curated root definitions ──
const CURATED_DEFS = {
  'חסד':    { meaning: 'lovingkindness, mercy, covenant faithfulness', category: 'Theology' },
  'אלהים':  { meaning: 'God, gods, divine beings', category: 'Theology' },
  'יהוה':   { meaning: 'the LORD (YHWH)', category: 'Theology' },
  'אמר':    { meaning: 'to say, speak, declare', category: 'Speech' },
  'עשה':    { meaning: 'to do, make, accomplish', category: 'Action' },
  'הלך':    { meaning: 'to go, walk, journey', category: 'Motion' },
  'נתן':    { meaning: 'to give, set, appoint', category: 'Action' },
  'בוא':    { meaning: 'to come, enter, arrive', category: 'Motion' },
  'ידע':    { meaning: 'to know, perceive, understand', category: 'Cognition' },
  'שמע':    { meaning: 'to hear, listen, obey', category: 'Perception' },
  'ראה':    { meaning: 'to see, look, perceive', category: 'Perception' },
  'דבר':    { meaning: 'to speak; word, matter, thing', category: 'Speech' },
  'ארץ':    { meaning: 'land, earth, country', category: 'Nature' },
  'עם':     { meaning: 'people, nation, kinfolk', category: 'Society' },
  'מלך':    { meaning: 'king, to reign, kingdom', category: 'Society' },
  'רוח':    { meaning: 'spirit, wind, breath', category: 'Theology' },
  'לב':     { meaning: 'heart, mind, inner self', category: 'Person' },
  'ישע':    { meaning: 'to save, deliver; salvation', category: 'Theology' },
  'צדק':    { meaning: 'righteous, just; righteousness', category: 'Theology' },
  'שפט':    { meaning: 'to judge; judgment, justice', category: 'Society' },
  'אמן':    { meaning: 'to believe, trust; faith, amen', category: 'Theology' },
  'חטא':    { meaning: 'to sin, miss the mark; sin', category: 'Theology' },
  'קדש':    { meaning: 'holy, sacred; to sanctify', category: 'Theology' },
  'שוב':    { meaning: 'to return, repent, turn back', category: 'Theology' },
  'כתב':    { meaning: 'to write; writing, scripture', category: 'Action' },
  'מות':    { meaning: 'to die; death', category: 'Life' },
  'ישב':    { meaning: 'to dwell, sit, inhabit', category: 'Action' },
  'עין':    { meaning: 'eye, sight, appearance', category: 'Person' },
  'יד':     { meaning: 'hand, power, authority', category: 'Person' },
  'בן':     { meaning: 'son, child, descendant', category: 'Family' },
  'אב':     { meaning: 'father, ancestor, patriarch', category: 'Family' },
  'קרא':    { meaning: 'to call, proclaim, read', category: 'Speech' },
  'נפש':    { meaning: 'soul, self, life, appetite', category: 'Person' },
  'שלח':    { meaning: 'to send, stretch out, release', category: 'Action' },
  'ברית':   { meaning: 'covenant, treaty, agreement', category: 'Theology' },
  'תורה':   { meaning: 'law, instruction, teaching', category: 'Theology' },
  // Particles & function words
  'כי':     { meaning: 'that, because, for, when', category: 'Particle' },
  'אשר':    { meaning: 'which, that, who (relative)', category: 'Particle' },
  'לא':     { meaning: 'not, no', category: 'Particle' },
  'את':     { meaning: 'direct object marker; with', category: 'Particle' },
  'הנה':    { meaning: 'behold, here, look', category: 'Particle' },
  'כן':     { meaning: 'thus, so, therefore', category: 'Particle' },
  'על':     { meaning: 'upon, over, about, against', category: 'Particle' },
  'אלה':    { meaning: 'these', category: 'Particle' },
  'גם':     { meaning: 'also, even, moreover', category: 'Particle' },
  'עתה':    { meaning: 'now, at this time', category: 'Particle' },
  'הוא':    { meaning: 'he, it, that one', category: 'Particle' },
  'הם':     { meaning: 'they, them', category: 'Particle' },
  'היא':    { meaning: 'she, it', category: 'Particle' },
  'אני':    { meaning: 'I', category: 'Particle' },
  'אתה':    { meaning: 'you (masc. sg.)', category: 'Particle' },
  'אנחנו':  { meaning: 'we', category: 'Particle' },
  'זה':     { meaning: 'this, that', category: 'Particle' },
  'כל':     { meaning: 'all, every, each', category: 'Particle' },
  'אם':     { meaning: 'if, whether', category: 'Particle' },
  'עד':     { meaning: 'until, as far as; witness', category: 'Particle' },
  'אך':     { meaning: 'surely, only, but', category: 'Particle' },
  'כמו':    { meaning: 'like, as', category: 'Particle' },
  'יש':     { meaning: 'there is, there are', category: 'Particle' },
  'אין':    { meaning: 'there is not, nothing', category: 'Particle' },
  'מאד':    { meaning: 'very, exceedingly', category: 'Particle' },
  'עוד':    { meaning: 'still, yet, again, more', category: 'Particle' },
  'נא':     { meaning: 'please, I pray', category: 'Particle' },
  // Additional common roots
  'היה':    { meaning: 'to be, become, happen', category: 'Action' },
  'יהי':    { meaning: 'and it was / came to pass', category: 'Action' },
  'עלה':    { meaning: 'to go up, ascend, offer', category: 'Motion' },
  'ירד':    { meaning: 'to go down, descend', category: 'Motion' },
  'יצא':    { meaning: 'to go out, come forth', category: 'Motion' },
  'שים':    { meaning: 'to put, set, place', category: 'Action' },
  'לקח':    { meaning: 'to take, receive, get', category: 'Action' },
  'שמר':    { meaning: 'to keep, guard, observe', category: 'Action' },
  'עבד':    { meaning: 'to serve, work; servant', category: 'Action' },
  'נשא':    { meaning: 'to lift, carry, bear', category: 'Action' },
  'חיה':    { meaning: 'to live, be alive; life', category: 'Life' },
  'אכל':    { meaning: 'to eat, consume, devour', category: 'Life' },
  'ילד':    { meaning: 'to bear, give birth; child', category: 'Family' },
  'אח':     { meaning: 'brother', category: 'Family' },
  'בת':     { meaning: 'daughter', category: 'Family' },
  'אשה':    { meaning: 'woman, wife', category: 'Family' },
  'איש':    { meaning: 'man, person, husband', category: 'Person' },
  'שם':     { meaning: 'name; there', category: 'Person' },
  'פנה':    { meaning: 'face, presence; to turn', category: 'Person' },
  'טוב':    { meaning: 'good, pleasant, well', category: 'Quality' },
  'רע':     { meaning: 'evil, bad, wicked', category: 'Quality' },
  'גדל':    { meaning: 'great, large; to grow', category: 'Quality' },
  'רב':     { meaning: 'much, many, great', category: 'Quality' },
  'חזק':    { meaning: 'strong, mighty; to strengthen', category: 'Quality' },
  'יום':    { meaning: 'day, time', category: 'Time' },
  'שנה':    { meaning: 'year; to change', category: 'Time' },
  'עולם':   { meaning: 'forever, eternity, world', category: 'Time' },
  'מים':    { meaning: 'water, waters', category: 'Nature' },
  'שמים':   { meaning: 'heaven, sky', category: 'Nature' },
  'עיר':    { meaning: 'city, town', category: 'Society' },
  'בית':    { meaning: 'house, household, temple', category: 'Society' },
  'חרב':    { meaning: 'sword; to destroy', category: 'Society' },
  'מלחמה':  { meaning: 'war, battle', category: 'Society' },
  'צבא':    { meaning: 'army, host; to serve', category: 'Society' },
  'כהן':    { meaning: 'priest', category: 'Theology' },
  'נביא':   { meaning: 'prophet', category: 'Theology' },
  'נבא':    { meaning: 'to prophesy', category: 'Theology' },
  'תפלה':   { meaning: 'prayer', category: 'Theology' },
  'פלל':    { meaning: 'to pray, intercede', category: 'Theology' },
  'ברך':    { meaning: 'to bless; blessing, knee', category: 'Theology' },
  'גאל':    { meaning: 'to redeem, deliver', category: 'Theology' },
  'כפר':    { meaning: 'to atone, cover, forgive', category: 'Theology' },
  'עון':    { meaning: 'iniquity, guilt, punishment', category: 'Theology' },
  'תשובה':  { meaning: 'repentance, answer', category: 'Theology' },
  'נחם':    { meaning: 'to comfort, repent, relent', category: 'Theology' },
  'סלח':    { meaning: 'to forgive, pardon', category: 'Theology' },
  'קום':    { meaning: 'to rise, stand up, establish', category: 'Action' },
  'שכב':    { meaning: 'to lie down, sleep', category: 'Action' },
  'בנה':    { meaning: 'to build, construct', category: 'Action' },
  'נפל':    { meaning: 'to fall, fall down', category: 'Motion' },
  'שבע':    { meaning: 'to swear; seven', category: 'Action' },
  'זכר':    { meaning: 'to remember; male', category: 'Cognition' },
  'שכח':    { meaning: 'to forget', category: 'Cognition' },
  'חכם':    { meaning: 'wise, wisdom', category: 'Cognition' },
  'בין':    { meaning: 'to understand, discern; between', category: 'Cognition' },
  'ירא':    { meaning: 'to fear, revere; afraid', category: 'Perception' },
  'אהב':    { meaning: 'to love; love', category: 'Perception' },
  'שנא':    { meaning: 'to hate', category: 'Perception' },
  'שמח':    { meaning: 'to rejoice, be glad; joy', category: 'Perception' },
  'בכה':    { meaning: 'to weep, cry', category: 'Perception' },
  'כעס':    { meaning: 'anger, vexation', category: 'Perception' },
  'אף':     { meaning: 'anger, nose; also, even', category: 'Perception' },
  'דרך':    { meaning: 'way, road, path; manner', category: 'Nature' },
  'עבר':    { meaning: 'to pass over, cross; beyond', category: 'Motion' },
  'סור':    { meaning: 'to turn aside, depart', category: 'Motion' },
  'נוס':    { meaning: 'to flee, escape', category: 'Motion' },
  'רדף':    { meaning: 'to pursue, chase, persecute', category: 'Motion' },
  'לחם':    { meaning: 'to fight, battle; bread', category: 'Society' },
  'נצל':    { meaning: 'to deliver, rescue, save', category: 'Action' },
  'כרת':    { meaning: 'to cut, cut off; make a covenant', category: 'Action' },
  'אסף':    { meaning: 'to gather, collect, assemble', category: 'Action' },
  'פקד':    { meaning: 'to visit, appoint, number', category: 'Action' },
  'שבת':    { meaning: 'to cease, rest; Sabbath', category: 'Theology' },
};

// Merge curated consonant forms into consonantRootMap
for (const root of Object.keys(CURATED_DEFS)) {
  consonantRootMap[root] = root;
}

// ── Category auto-detection from glosses ──
function guessCategory(glosses) {
  const all = Object.keys(glosses).join(' ').toLowerCase();
  if (/\bgod\b|lord|holy|spirit|covenant|faith|pray|worship|repent|sin\b|salvation|redeem|atone|bless|prophet|priest/i.test(all)) return 'Theology';
  if (/king|judge|rule|people|nation|tribe|army|war|fight|captain|chief|city/i.test(all)) return 'Society';
  if (/say\b|speak|word|voice|call|tell|declare|command|cry|answer|mouth/i.test(all)) return 'Speech';
  if (/see\b|hear|know|understand|think|remember|forget|wise|wisdom|perceive/i.test(all)) return 'Cognition';
  if (/\bgo\b|come|walk|run|send|bring|flee|return|journey|ascend|descend|cross/i.test(all)) return 'Motion';
  if (/father|mother|son|daughter|brother|sister|child|wife|husband|family|born/i.test(all)) return 'Family';
  if (/hand|eye|face|head|heart|mouth|blood|bone|body|flesh|soul/i.test(all)) return 'Person';
  if (/land|earth|sea|water|mountain|tree|field|river|stone|heaven|way|path/i.test(all)) return 'Nature';
  if (/give|take|make|do\b|build|break|cut|set|put|keep|write|serve|work/i.test(all)) return 'Action';
  if (/day|night|year|time|old|new|begin|end|forever|eternal|now/i.test(all)) return 'Time';
  if (/great|good|evil|strong|mighty|many|all|much|true|right/i.test(all)) return 'Quality';
  if (/die|live|eat|drink|sleep|dwell|sit|stand|rise|rest/i.test(all)) return 'Life';
  if (/fear|love|hate|joy|glad|weep|anger|comfort|trust/i.test(all)) return 'Perception';
  return 'Uncategorized';
}

// ── Main ──
console.log('=== Building Root Glossary ===\n');

const bom = fs.readFileSync(BOM_PATH, 'utf8');
const pairRegex = /\["([^"]+)","([^"]*?)"\]/g;
const roots = {};
let totalPairs = 0;
let match;

while ((match = pairRegex.exec(bom)) !== null) {
  const hebrew = match[1];
  const english = match[2];
  if (hebrew === '\u05C3' || hebrew === '׃') continue;
  if (!english || english === '׃') continue;

  totalPairs++;
  const root = getRoot(hebrew);

  if (!roots[root]) roots[root] = { forms: {}, glosses: {}, count: 0 };
  roots[root].count++;
  roots[root].forms[hebrew] = (roots[root].forms[hebrew] || 0) + 1;
  roots[root].glosses[english] = (roots[root].glosses[english] || 0) + 1;
}

// Build glossary entries (only roots with 2+ occurrences for the JS file)
const glossary = {};
const sortedRoots = Object.entries(roots).sort((a, b) => b[1].count - a[1].count);

for (const [root, data] of sortedRoots) {
  // Get top gloss as auto-meaning
  let topGloss = '', topCount = 0;
  for (const [g, c] of Object.entries(data.glosses)) {
    if (c > topCount) { topCount = c; topGloss = g; }
  }
  const autoMeaning = topGloss
    .replace(/^(and-|the-|to-|in-|from-|as-|that-|by-|for-|with-|a-|an-)+/g, '')
    .replace(/-/g, ' ');

  const curated = CURATED_DEFS[root];
  glossary[root] = {
    meaning: curated ? curated.meaning : autoMeaning,
    category: curated ? curated.category : guessCategory(data.glosses),
  };
}

// Write roots_glossary.js (only entries with 2+ occurrences to keep file manageable)
const filteredGlossary = {};
for (const [root, data] of sortedRoots) {
  if (data.count >= 2) {
    filteredGlossary[root] = glossary[root];
  }
}
const jsContent = 'window._rootGlossaryData = ' + JSON.stringify(filteredGlossary, null, 2) + ';\n';
fs.writeFileSync(OUT_JS, jsContent, 'utf8');

// Write roots_glossary.json (full data for review, all roots)
const fullData = {};
for (const [root, data] of sortedRoots) {
  fullData[root] = {
    root,
    meaning: glossary[root].meaning,
    category: glossary[root].category,
    count: data.count,
    uniqueForms: Object.keys(data.forms).length,
    topForms: Object.entries(data.forms).sort((a,b) => b[1]-a[1]).slice(0,5).map(([f,c]) => `${f}(${c})`),
  };
}
fs.writeFileSync(OUT_JSON, JSON.stringify(fullData, null, 2), 'utf8');

// Stats
const totalRoots = Object.keys(glossary).length;
const filteredCount = Object.keys(filteredGlossary).length;
const curatedCount = Object.keys(filteredGlossary).filter(r => CURATED_DEFS[r]).length;
const categorized = Object.values(filteredGlossary).filter(g => g.category !== 'Uncategorized').length;
const jsSizeKB = (Buffer.byteLength(jsContent, 'utf8') / 1024).toFixed(1);

console.log(`Total word pairs: ${totalPairs}`);
console.log(`Unique roots (all): ${totalRoots}`);
console.log(`Roots with 2+ occurrences: ${filteredCount}`);
console.log(`Curated definitions: ${curatedCount}`);
console.log(`Categorized (curated + auto): ${categorized}`);
console.log(`Uncategorized: ${filteredCount - categorized}`);
console.log(`\nOutput: ${OUT_JS} (${jsSizeKB} KB)`);

console.log('\nTop 30 roots by frequency:');
sortedRoots.slice(0, 30).forEach(([root, data], i) => {
  const g = glossary[root];
  const tag = CURATED_DEFS[root] ? '*' : ' ';
  console.log(`  ${tag}${(i+1+'').padStart(2)}. ${root.padEnd(8)} (${(data.count+'').padStart(5)}x) — ${g.meaning.substring(0,40)} [${g.category}]`);
});
