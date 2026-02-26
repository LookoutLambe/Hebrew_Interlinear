// Fix all remaining ??? glosses in BOM.html
// These are maqaf-joined compound words where the base word needs a gloss
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\chris\\Desktop\\Hebrew BOM';
let bom = fs.readFileSync(path.join(baseDir, 'BOM.html'), 'utf8');
const dict = JSON.parse(fs.readFileSync(path.join(baseDir, 'gloss_dictionary.json'), 'utf8'));

// Strip niqqud (vowel points) from Hebrew for matching
function stripNiqqud(s) {
  return s.replace(/[\u0591-\u05C7]/g, '');
}

// Manual glosses for base words that appear after maqaf
const manualGlosses = {
  // Common words
  'מַמְלַכְתּוֹ': 'his-kingdom',
  'מִדְבַּר': 'wilderness',
  'הַמִּדְבָּר': 'the-wilderness',
  'שְׁפֹּךְ': 'shedding',
  'אִגַּרְתִּי': 'my-epistle',
  'אֶצְבַּע': 'finger',
  'כּוֹרִיַנְטוּם': 'Coriantumr',
  'יְהוָה': 'the-Lord',
  'זֹּאת': 'this',
  'עֶדְרֵיהֶם': 'their-flocks',
  'עֶשְׂרֵה': 'and-ten',
  'שְׁבוּיֵי': 'captives-of',
  'אֶפְרוֹחֶיהָ': 'her-chicks',
  'עֵמֶק': 'valley',
  'הַצְּלָב': 'the-cross',
  'עֵמֶר': 'Omer',
  'חֻלְשָׁתָם': 'their-weakness',
  'כּוֹרִיַנְטוּמְר': 'Coriantumr',
  'עַרְבוֹת': 'plains',
  'שֶׁקֶר': 'falsehood',
  'מַחֲנֵה': 'camp',
  'מִשְׂרַת': 'office-of',
  'מִצְוֺתַי': 'my-commandments',
  'בֵּיתְךָ': 'your-house',
  'צֶדֶק': 'righteousness',
  'מִשְׁפְּטֵיהֶם': 'their-judgments',
  'נִפֹּל': 'we-fall',
  'צְבָאוֹ': 'his-army',
  'מֵתֵי': 'dead-of',
  'אַלְפַּי': 'my-thousands',
  'אִשְׁתּוֹ': 'his-wife',
  'תִּדְאֲגוּ': 'you-worry',
  'הַקֵּיסָם': 'the-mote',
  'הַדִּבְרֵי': 'the-words-of',
  'יוֹרֵשׁ': 'inherits',
  'הַמָּיִם': 'the-waters',
  'הַחֹר': 'the-hole',
  'בָא': 'came',
  'עֹמֶר': 'Omer',
  'תָּבִיא': 'you-bring',
  'הַמַּגִּיד': 'the-one-who-declares',
  'הַשְּׁבוּעוֹת': 'the-oaths',
  'חֵת': 'Heth',
  'זִקְנָה': 'old-age',
  'שֵׂיבָה': 'gray-hairs',
  'צֶדֶק׃': 'righteousness',
  'בֹּאוֹ': 'his-coming',
  'אָהֳלָיו': 'his-tents',
  'אִגַּרְתּוֹ': 'his-epistle',
  'נַפְשְׁךָ': 'your-soul',
  'חַרְבוֹתֵיהֶם': 'their-swords',
  'מְלַאכְתָּם': 'their-work',
  'רֵעֵהוּ': 'his-neighbor',
  'אֲחֵיהֶם': 'their-brethren',
  'עִירֵנוּ': 'our-city',
  'הָאֱלֹהִים': 'God',
  'בֵּיתִי': 'my-house',
  'עֹרֶף': 'neck',
  'מַלְאָכוֹ': 'his-angel',
  'הָאֱלֹהִים': 'God',
  'מְזִמּוֹתֵיהֶם': 'their-plots',
  'חוֹבוֹ': 'his-debt',
  'רָעִים': 'evil',
  'הִקְשֵׁינוּ': 'we-hardened',
  'הַכְּרֻבִים': 'the-cherubim',
  'עֵדֶן': 'Eden',
  'מְנוּחָתִי': 'my-rest',
  'מְנוּחָתוֹ': 'his-rest',
  'הַכְּהֻנָּה': 'the-priesthood',
  'רַגְלֵיהֶם': 'their-feet',
  'הָעִיר': 'the-city',
  'מִטָּתוֹ': 'his-bed',
  'הַכִּכָּר': 'the-plain',
  'בַּנֶּפֶשׁ': 'in-the-soul',
  'חַרְבוֹתֵיהֶם': 'their-swords',
  'עַצְמָם': 'themselves',
  'עֲדָרֵינוּ': 'our-flocks',
  'מַקְלוֹ': 'his-staff',
  'זְרוֹעוֹתֵיהֶם': 'their-arms',
  'זְרוֹעֹתֵיהֶם': 'their-arms',
  'הַזְּרוֹעוֹת': 'the-arms',
  'מִרְעֵה': 'pasture',
  'הַגַּיְא': 'the-valley',
  'דִּמְכֶם': 'your-blood',
  'מִצְוֺתָי': 'my-commandments',
  'מְּהֵרָה': 'quickly',
  'דָּרוֹם': 'south',
  'דְּרוֹרָם': 'their-liberty',
  'רֶגֶל': 'foot',
  'הַמַּלְאָכוּת': 'the-embassy',
  'הַמְנַסֶּה': 'the-one-who-tries',
  'אַרְצוֹתָם': 'their-lands',
  'גְּאוֹנָם': 'their-pride',
  'צְבָאָם': 'their-army',
  'צְבָאוֹתָיו': 'his-armies',
  'נַפְשׁוֹתֵיהֶם': 'their-souls',
  'מוֹרוֹנִי': 'Moroni',
  'עֵדוּתוֹ': 'his-testimony',
  'אֲחוֹתוֹ': 'his-sister',
  'מַלְכּוּתוֹ': 'his-kingdom',
  'עַבְדּוֹ': 'his-servant',
  'דְּבָרָיו': 'his-words',
  'הַשֶּׁמֶשׁ': 'the-sun',
  'הָעָם': 'the-people',
  'נֶפֶשׁ': 'soul',
  'יָמִים': 'days',
  'הַחֶרֶב': 'the-sword',
  'הַלַּיְלָה': 'the-night',
  'הַבֹּקֶר': 'the-morning',
  'עֵינֵיהֶם': 'their-eyes',
  'עֵינָיו': 'his-eyes',
  'רֹאשׁוֹ': 'his-head',
  'חֵטְא': 'sin',
  'הַמִּלְחָמָה': 'the-war',
  'הַמָּקוֹם': 'the-place',
  'הַגּוֹיִם': 'the-nations',
  'פָּנָיו': 'his-face',
  'הַמֶּלֶךְ': 'the-king',
  'יָמָיו': 'his-days',
  'אֲבוֹתָם': 'their-fathers',
  'שְׁלֹשָׁה': 'three',
  'אַרְבָּעָה': 'four',
  'נַפְשׁוֹ': 'his-soul',
  'לֵבָם': 'their-heart',
  'לִבָּם': 'their-heart',
  'יְדֵיהֶם': 'their-hands',
  'יָדוֹ': 'his-hand',
  'רֵעֵיהֶם': 'their-neighbors',
  'אַחֶיהָ': 'her-brothers',
  'מִלְחֲמוֹתֵיהֶם': 'their-wars',
  'צִבְאוֹתָם': 'their-armies',
  'פְּנֵיהֶם': 'their-faces',
  'בֵּיתוֹ': 'his-house',
  'יְדֵי': 'hands-of',
  'פְנֵי': 'face-of',
  'שְׁנַיִם': 'two',
  'שָׁלוֹשׁ': 'three',
  'אַרְבַּע': 'four',
  'חָמֵשׁ': 'five',
  'שֵׁשׁ': 'six',
  'שֶׁבַע': 'seven',
  'שְׁמוֹנֶה': 'eight',
  'תֵּשַׁע': 'nine',
  'עֶשֶׂר': 'ten',
  'עֶשְׂרִים': 'twenty',
  'שְׁלשִׁים': 'thirty',
  'אַרְבָּעִים': 'forty',
  'חֲמִשִּׁים': 'fifty',
  'שִׁשִּׁים': 'sixty',
  'שִׁבְעִים': 'seventy',
  'שְׁמוֹנִים': 'eighty',
  'תִּשְׁעִים': 'ninety',
  'מֵאָה': 'hundred',
  'אֶלֶף': 'thousand',
  // Construct forms and suffixed nouns
  'מְלָאכָיו': 'his-angels',
  'מַלְאָכָיו': 'his-angels',
  'תִּקְצֹף': 'you-be-angry',
  'תִּתֵּן': 'you-give',
  'הַסֶּלַע': 'the-rock',
  'הַסְּפִינוֹת': 'the-ships',
  'צִוִּיתָנִי': 'you-commanded-me',
  'בְּרִיאַת': 'creation-of',
  'דְּבָרֵינוּ': 'our-words',
  'שְׂפָתָם': 'their-language',
  'רֵעֵיהֶם': 'their-friends',
  'מִקְנְךָ': 'your-livestock',
  'פַּחִים': 'snares',
  'הַמְּלֹאת': 'the-fullness',
  'יָדוֹן': 'strive',
  'תֶּחֶטְאוּ': 'you-sin',
  'נָא': 'I-pray',
  'חֶמְלָה': 'compassion',
  'בָאֲבָנִים': 'the-stones',
  'אֶצְבָּעֲךָ': 'your-finger',
  'אֶרֶץ': 'the-land',
  'מַחְשְׁבוֹתַי': 'my-thoughts',
  'הָאֲרָצוֹת': 'the-lands',
  // Proper names
  'לֶחִי': 'Lehi',
  'נִמְרוֹד': 'Nimrod',
  'אַמָּלִיקְיָה': 'Amalickiah',
  'אַמָּלִיקְיָהוּ': 'Amalickiah',
  'מוֹרוֹנִיהָה': 'Moronihah',
  'גִּדְעוֹנִי': 'Gidgiddoni',
  'נֶפִיהָה': 'Nephihah',
  'לְחוֹנְטִי': 'Lehonti',
  'זְרַחֶמְלָה': 'Zarahemla',
  'הֵילָמָן': 'Helaman',
  'מוֹרוֹנִי': 'Moroni',
  'לְחוֹנְטִי': 'Lehonti',
  'תְּאַנְכוּם': 'Teancum',
  'אַמָּלוֹן': 'Amulon',
  'גִּדְעוֹן': 'Gideon',
  'אַנְטִיאוֹנָה': 'Antiionah',
  'זִיזְרוֹם': 'Zeezrom',
  'אַמּוֹן': 'Ammon',
  'מוּלֵק': 'Mulek',
  'זֶרַח': 'Zerah',
  'שֵׁבֶט': 'tribe',
  // More common words
  'הַנָּהָר': 'the-river',
  'הָרָכִיל': 'the-gossip',
  'אֲדָמָתָם': 'their-ground',
  'נַחֲלָתָם': 'their-inheritance',
  'מִשְׁפְּחוֹתֵיהֶם': 'their-families',
  'זְקֵנֵיהֶם': 'their-elders',
  'חֵלֶק': 'portion',
  'עֲבוֹדָה': 'service',
  'נְשֵׁיהֶם': 'their-wives',
  'טַפָּם': 'their-children',
  'צֹאנָם': 'their-flocks',
  'בְּקָרָם': 'their-herds',
  'אַרְצָם': 'their-land',
  'חֶרְבָּם': 'their-sword',
  'עוֹלָמִים': 'forever',
  'הַמִּקְדָּשׁ': 'the-temple',
  'הַנָּחָשׁ': 'the-serpent',
  'הַכֹּהֵן': 'the-priest',
  'הַשֹּׁפֵט': 'the-judge',
  'מְלָכָיו': 'his-kings',
  'שׂוֹנְאֵיהֶם': 'their-enemies',
  'שׂוֹנְאֵיכֶם': 'your-enemies',
  'אֲבוֹתֵיכֶם': 'your-fathers',
  'אֲבוֹתֵינוּ': 'our-fathers',
  'דְרָכָיו': 'his-ways',
  'אֱמוּנָתָם': 'their-faith',
  'חַטֹּאתָם': 'their-sins',
  'עֲוֹנוֹתֵיהֶם': 'their-iniquities',
  'עֲוֹנוֹתֵיכֶם': 'your-iniquities',
  'מַעֲשֵׂיהֶם': 'their-deeds',
  'שְׁמוֹ': 'his-name',
  'הַשַּׁעַר': 'the-gate',
  'גִּלְגָּל': 'Gilgal',
  'הַיְּאוֹר': 'the-river',
  'הַדֶּרֶךְ': 'the-way',
  'הַשָּׂדֶה': 'the-field',
  'מִשְׁפָּחָה': 'family',
  'הַנְּעָרִים': 'the-young-men',
  'עֲבָדָיו': 'his-servants',
  'מַלְכָּם': 'their-king',
  'הָעִיר': 'the-city',
  'הַכֹּהֲנִים': 'the-priests',
  'צְדָקָה': 'righteousness',
  'מוֹרָשָׁה': 'an-inheritance',
  'חֲנִית': 'spear',
  'חֲנִיתוֹ': 'his-spear',
  'מֶלֶךְ': 'king',
  'נְבוּאוֹתֵיהֶם': 'their-prophecies',
  'הַשָּׁמַיִם': 'the-heavens',
  'עוּנוֹתֵיהֶם': 'their-iniquities',
  'תְפִלּוֹתֵיהֶם': 'their-prayers',
  'חַטֹּאתֵיהֶם': 'their-sins',
  'הֲרוּגֵיהֶם': 'their-slain',
  'מֻכֵּיהֶם': 'their-wounded',
  'שְׁמוֹתָם': 'their-names',
  'גְּבוּלֵיהֶם': 'their-borders',
  'עֲרֵיהֶם': 'their-cities',
  'לִבּוֹתֵיהֶם': 'their-hearts',
  'צִבְאוֹתֵיהֶם': 'their-armies',
  'עַבְדֵּיהֶם': 'their-servants',
  'בְּנוֹתֵיהֶם': 'their-daughters',
  'מִשְׁפְּחוֹתָם': 'their-families',
  'עֲוֹנוֹתָם': 'their-iniquities',
  'רֵעֵיהֶם׃': 'their-friends',
  'הַנָּשִׁים': 'the-women',
  'הַשֹּׁפְטִים': 'the-judges',
  'הַנְּבִיאִים': 'the-prophets',
  'הַזְּקֵנִים': 'the-elders',
  'הַכֹּהֲנִים': 'the-priests',
  'הָעֲבָדִים': 'the-servants',
  'הָאוֹיְבִים': 'the-enemies',
  'הָעֵינַיִם': 'the-eyes',
  'הָרָעָב': 'the-famine',
  'רָעָב': 'famine',
  'עִירוֹ': 'his-city',
  'צְבָאוֹ': 'his-army',
  'עַמּוֹ': 'his-people',
  'בְּנוֹ': 'his-son',
  'אָבִיו': 'his-father',
  'אִמּוֹ': 'his-mother',
  'אָחִיו': 'his-brother',
  'בִּתּוֹ': 'his-daughter',
  'תּוֹרָתוֹ': 'his-law',
  'דַּרְכּוֹ': 'his-way',
  // Military/political terms
  'הַמִּבְצָר': 'the-fortress',
  'הַמַּלְכוּת': 'the-kingdom',
  'הַמַּעֲרָכָה': 'the-battle',
  'הַבְּרִית': 'the-covenant',
  'הַמִּשְׁמָר': 'the-guard',
  'הַמִּגְדָּל': 'the-tower',
  'מְצוּדָה': 'fortress',
  'מִבְצָרָם': 'their-fortress',
  // Body/nature
  'לְבָבוֹ': 'his-heart',
  'לִבּוֹ': 'his-heart',
  'גּוּפוֹ': 'his-body',
  'דָּמוֹ': 'his-blood',
  'בְּשָׂרוֹ': 'his-flesh',
  'הָהָר': 'the-mountain',
  'הַיָּם': 'the-sea',
  'אֲנָשָׁיו': 'his-men',
  // Additional compound patterns
  'הַכִּסֵּא': 'the-throne',
  'הָרָעָה': 'the-evil',
  'הַטּוֹבָה': 'the-good',
  'הַגְּדוֹלָה': 'the-great',
  'הַקְּטַנָּה': 'the-small',
  'הָרִאשׁוֹן': 'the-first',
  'הָאַחֲרוֹן': 'the-last',
  'עָוֺן': 'iniquity',
};

// Build a more comprehensive lookup: strip niqqud from manual glosses
const strippedManual = {};
for (const [heb, eng] of Object.entries(manualGlosses)) {
  strippedManual[stripNiqqud(heb)] = eng;
}

// Also strip niqqud from the existing dictionary for matching
const strippedDict = {};
for (const [heb, eng] of Object.entries(dict)) {
  const stripped = stripNiqqud(heb);
  if (!strippedDict[stripped]) strippedDict[stripped] = eng;
}

// Hebrew-to-English transliteration table for proper nouns
const transTable = {
  'א': "'", 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
  'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
  'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
  'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': "'", 'פ': 'p',
  'ף': 'f', 'צ': 'ts', 'ץ': 'ts', 'ק': 'k', 'ר': 'r',
  'ש': 'sh', 'ת': 't'
};

function transliterate(word) {
  const clean = stripNiqqud(word).replace(/[׃:\.;,!?\u05BE]/g, '');
  let result = '';
  for (const ch of clean) {
    result += transTable[ch] || ch;
  }
  // Capitalize as proper noun
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function lookupWord(word) {
  // Clean punctuation
  const cleaned = word.replace(/[׃:\.;,!?]/g, '').trim();
  if (!cleaned) return null;

  // 1. Direct match in manual
  if (manualGlosses[cleaned]) return manualGlosses[cleaned];
  if (manualGlosses[word]) return manualGlosses[word];

  // 2. Direct match in dictionary
  if (dict[cleaned]) return dict[cleaned];
  if (dict[word]) return dict[word];

  // 3. Stripped niqqud match
  const stripped = stripNiqqud(cleaned);
  if (strippedManual[stripped]) return strippedManual[stripped];
  if (strippedDict[stripped]) return strippedDict[stripped];

  // 4. Try prefix stripping
  const prefixes = [
    { p: 'ה', g: 'the-' },
    { p: 'ב', g: 'in-' },
    { p: 'ל', g: 'to-' },
    { p: 'מ', g: 'from-' },
    { p: 'כ', g: 'as-' },
    { p: 'ש', g: 'that-' },
  ];

  for (const { p, g } of prefixes) {
    if (stripped.startsWith(p) && stripped.length > 2) {
      const rest = stripped.slice(1);
      if (strippedManual[rest]) return g + strippedManual[rest];
      if (strippedDict[rest]) return g + strippedDict[rest];
    }
  }

  return null;
}

// Find all ["Hebrew","...???..."] patterns and fix them
const re = /\["([^"]+)","([^"]*\?\?\?[^"]*)"\]/g;
let match;
let fixes = 0;
let unfixed = 0;
const stillUnknown = {};
const replacements = [];

while ((match = re.exec(bom)) !== null) {
  const fullHebrew = match[1];
  const oldGloss = match[2];

  // Split by maqaf to get base word(s)
  const parts = fullHebrew.split('\u05BE'); // maqaf

  if (parts.length >= 2) {
    // Compound word with maqaf
    // Try to gloss each part
    const glossParts = [];
    let allResolved = true;

    for (const part of parts) {
      const gloss = lookupWord(part);
      if (gloss) {
        glossParts.push(gloss);
      } else {
        // Try transliteration as last resort (likely proper noun)
        const stripped = stripNiqqud(part).replace(/[׃:\.;,!?]/g, '');
        if (stripped.length > 0) {
          // Check if it looks like a proper noun (appears in context of names)
          glossParts.push(transliterate(part));
        } else {
          allResolved = false;
        }
      }
    }

    if (glossParts.length > 0) {
      const newGloss = glossParts.join('-');
      replacements.push({
        original: match[0],
        replacement: `["${fullHebrew}","${newGloss}"]`
      });
      fixes++;
    } else {
      stillUnknown[fullHebrew] = oldGloss;
      unfixed++;
    }
  } else {
    // Single word with ???, try to look it up
    const gloss = lookupWord(fullHebrew);
    if (gloss) {
      replacements.push({
        original: match[0],
        replacement: `["${fullHebrew}","${gloss}"]`
      });
      fixes++;
    } else {
      // Transliterate as fallback
      const translit = transliterate(fullHebrew);
      replacements.push({
        original: match[0],
        replacement: `["${fullHebrew}","${translit}"]`
      });
      fixes++;
    }
  }
}

// Apply replacements
for (const { original, replacement } of replacements) {
  bom = bom.split(original).join(replacement);
}

fs.writeFileSync(path.join(baseDir, 'BOM.html'), bom, 'utf8');

// Check how many ??? remain
const remaining = (bom.match(/\?\?\?/g) || []).length;
console.log(`Fixed: ${fixes} patterns`);
console.log(`Remaining ???: ${remaining}`);
console.log(`Still unknown: ${Object.keys(stillUnknown).length}`);
if (Object.keys(stillUnknown).length > 0) {
  fs.writeFileSync(path.join(baseDir, 'still_unknown2.json'), JSON.stringify(stillUnknown, null, 2));
  console.log('Saved still_unknown2.json');
}
