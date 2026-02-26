// Full pipeline: Generate interlinear JS data for all missing chapters
// Uses dictionary + maqaf splitting + proper name transliteration
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\chris\\Desktop\\Hebrew BOM';
const dict = JSON.parse(fs.readFileSync(path.join(baseDir, 'gloss_dictionary.json'), 'utf8'));
const fullDict = JSON.parse(fs.readFileSync(path.join(baseDir, 'gloss_dictionary_full.json'), 'utf8'));
const verses = JSON.parse(fs.readFileSync(path.join(baseDir, 'extracted_verses.json'), 'utf8'));

// ═══════════════════════════════════════
// PROPER NAME DICTIONARY
// ═══════════════════════════════════════
const properNames = {
  // Major characters
  'אַמָלִיקְיָה': 'Amalickiah', 'לְאַמָלִיקְיָה': 'to-Amalickiah', 'אַמָלִיקְיָהוּ': 'Amalickiah',
  'כוֹרִיַנְטוּמְר': 'Coriantumr', 'לְכוֹרִיַנְטוּמְר': 'to-Coriantumr',
  'לָמוֹנִי': 'Lamoni', 'וְלָמוֹנִי': 'and-Lamoni', 'לְלָמוֹנִי': 'to-Lamoni',
  'עֲמוּלֶק': 'Amulek', 'וַעֲמוּלֶק': 'and-Amulek', 'לַעֲמוּלֶק': 'to-Amulek',
  'טֵאַנְקוּם': 'Teancum', 'וּטֵאַנְקוּם': 'and-Teancum', 'לְטֵאַנְקוּם': 'to-Teancum',
  'זִיזְרוֹם': 'Zeezrom', 'וְזִיזְרוֹם': 'and-Zeezrom', 'לְזִיזְרוֹם': 'to-Zeezrom',
  'עַמּוֹנִיחָה': 'Ammonihah', 'בְּעַמּוֹנִיחָה': 'in-Ammonihah', 'מֵעַמּוֹנִיחָה': 'from-Ammonihah',
  'יֶרְשׁוֹן': 'Jershon', 'בְּיֶרְשׁוֹן': 'in-Jershon',
  'מוֹרִיאַנְטוֹן': 'Morianton', 'וּמוֹרִיאַנְטוֹן': 'and-Morianton',
  'אַנְטִיפּוּס': 'Antipus', 'וְאַנְטִיפּוּס': 'and-Antipus',
  'מַנְטִי': 'Manti', 'בְּמַנְטִי': 'in-Manti', 'לְמַנְטִי': 'to-Manti',
  'שִׁיז': 'Shiz', 'וְשִׁיז': 'and-Shiz',
  'הַזּוֹרָמִים': 'the-Zoramites', 'זוֹרָמִים': 'Zoramites', 'הַזּוֹרָמִי': 'the-Zoramite',
  'לָכוֹנֵאוּס': 'Lachoneus', 'וְלָכוֹנֵאוּס': 'and-Lachoneus',
  'שׁוּלֶה': 'Shared', // context-dependent, could be other names
  'מִדּוֹנִי': 'Middoni', 'בְּמִדּוֹנִי': 'in-Middoni',
  'זֶרַהֶמְנָה': 'Zerahemnah', 'וְזֶרַהֶמְנָה': 'and-Zerahemnah', 'לְזֶרַהֶמְנָה': 'to-Zerahemnah',
  'מוּלֵק': 'Mulek', 'בְּמוּלֵק': 'in-Mulek',
  'קוֹרִיהוֹר': 'Korihor', 'וְקוֹרִיהוֹר': 'and-Korihor', 'לְקוֹרִיהוֹר': 'to-Korihor',
  'אָכִישׁ': 'Akish', 'וְאָכִישׁ': 'and-Akish',
  'גִּדְעוֹנִי': 'Giddianhi', 'וְגִדְעוֹנִי': 'and-Giddianhi',
  'גָּדִיאַנְטוֹן': 'Gadianton',
  'נֵפִיהָה': 'Nephihah', 'בְּנֵפִיהָה': 'in-Nephihah',
  'הֲלָם': 'Helam', 'בַּהֲלָם': 'in-Helam',
  'סִידֹן': 'Sidon', 'סִידוֹן': 'Sidon',
  'לִימְחָי': 'Limhah', 'וְלִימְחָי': 'and-Limhah',
  'גִּדְגִּדּוֹנִי': 'Gidgiddoni', 'וְגִדְגִּדּוֹנִי': 'and-Gidgiddoni',
  'אַנְטִיוֹנוּם': 'Antionum', 'בְּאַנְטִיוֹנוּם': 'in-Antionum',
  'מוֹרוֹנִי': 'Moroni', 'וּמוֹרוֹנִי': 'and-Moroni', 'לְמוֹרוֹנִי': 'to-Moroni',
  'פָּהוֹרָן': 'Pahoran', 'וּפָהוֹרָן': 'and-Pahoran', 'לְפָהוֹרָן': 'to-Pahoran',
  'הֵילָמָן': 'Helaman', 'וְהֵילָמָן': 'and-Helaman', 'לְהֵילָמָן': 'to-Helaman',
  'מוֹרוֹנִיחָה': 'Moronihah', 'וּמוֹרוֹנִיחָה': 'and-Moronihah',
  'אַמּוֹן': 'Ammon', 'וְאַמּוֹן': 'and-Ammon', 'לְאַמּוֹן': 'to-Ammon',
  'אַנְטִי': 'Anti', 'לְאַנְטִי': 'to-Anti',
  'גִּדְאוֹנִי': 'Gideonihah',
  'צֵמַנָרִיחָה': 'Zemnarihah', 'וְצֵמַנָרִיחָה': 'and-Zemnarihah',
  'לֶחִי': 'Lehi', 'וְלֶחִי': 'and-Lehi',
  'אֱלִיהוּ': 'Elijah',
  'יַעֲרֶד': 'Jared', 'וְיַעֲרֶד': 'and-Jared',
  'אֶת־נֶפִי': 'ACC-Nephi',
  'אֶת־אַלְמָא': 'ACC-Alma',
  'שֶׁפַע': 'Bountiful', 'בְּשֶׁפַע': 'in-Bountiful', 'לְשֶׁפַע': 'to-Bountiful', 'מִשֶּׁפַע': 'from-Bountiful',
  'צָרַהֶמְלָה': 'Zarahemla', 'בְּצָרַהֶמְלָה': 'in-Zarahemla', 'מִצָּרַהֶמְלָה': 'from-Zarahemla',
  'גִּדֹּן': 'Gideon', 'בְּגִּדֹּן': 'in-Gideon',
  'נוֹחַ': 'Noah',
  'אָרוֹן': 'Aaron', 'וְאָרוֹן': 'and-Aaron', 'לְאָרוֹן': 'to-Aaron',
  'יִשְׁמָעֵאל': 'Ishmael', 'בְּיִשְׁמָעֵאל': 'in-Ishmael',
  'מוֹשִׁיָּה': 'Mosiah',
  'לִב': 'Lib', 'וְלִב': 'and-Lib',
  'קוֹם': 'Com', 'וְקוֹם': 'and-Com',
  'רִיפְּלָקִישׁ': 'Riplakish', 'וְרִיפְּלָקִישׁ': 'and-Riplakish',
  'מוֹרִיאַנְטוֹמֶר': 'Moriancumer',
  'שׁוּלֶם': 'Shule', 'וְשׁוּלֶם': 'and-Shule',
  'עוֹמֶר': 'Omer', 'וְעוֹמֶר': 'and-Omer',
  'נִמְרוֹד': 'Nimrod',
  'אֶמֶר': 'Emer', 'וְאֶמֶר': 'and-Emer',
};

// ═══════════════════════════════════════
// ADDITIONAL COMMON WORDS not in dictionary
// ═══════════════════════════════════════
const extraGlosses = {
  'וַיּוֹלֶד': 'and-he-begat', 'וְאַף־עַל־פִּי־כֵן': 'and-nevertheless',
  'אַף־עַל־פִּי־כֵן': 'nevertheless', 'הַשֹּׁפֵט': 'the-judge',
  'עֵצַת': 'counsel-of', 'מַאֲמִין': 'believing', 'שָׂרֵי': 'captains-of',
  'צֵידָה': 'provisions', 'כָּל־מִינֵי': 'all-manner-of', 'הַמַּלְכָּה': 'the-queen',
  'כָּל־אִישׁ': 'every-man', 'בִּרְאוֹתוֹ': 'when-he-saw', 'נַאֲמִין': 'we-believe',
  'בֶּן־הָאֱלֹהִים': 'Son-of-God', 'לְמִמְשַׁל': 'to-govern',
  'שִׁלְטוֹן': 'government', 'הַדְּרוֹר': 'the-freedom',
  'וַתִּכְלֶה': 'and-ended(f)', 'לְהַצְלִיחַ': 'to-prosper',
  'וַיִּכָּנְעוּ': 'and-they-humbled', 'בְּמַחֲנֶה': 'in-camp',
  'מִלְחֲמוֹתֵיהֶם': 'their-wars', 'וַיִּשָּׁבְעוּ': 'and-they-swore',
  'בָּאוּ': 'they-came', 'יֵרֵד': 'Jared',
  'יָרְדוּ': 'they-came-down', 'הִתְאַסְּפוּ': 'they-gathered',
  'לְהִלָּחֵם': 'to-fight', 'הֶחָפְשִׁי': 'free/freedom',
  'לָשׁוּב': 'to-return/repent', 'מֵחַטֹּאתֵיהֶם': 'from-their-sins',
  'הַנִּשְׁאָרִים': 'the-remaining', 'הֵסִיתוּ': 'incited',
  'צָבָא': 'army', 'לְצָבָא': 'to-army', 'צִבְאוֹת': 'armies',
  'צִבְאוֹתָיו': 'his-armies', 'צִבְאוֹתֵיהֶם': 'their-armies',
  'הַמְּבַצְּרִים': 'the-fortifications',
  'מִבְצָרִים': 'fortifications', 'וְלָכְדוּ': 'and-they-captured',
  'הַבְּרִית': 'the-covenant', 'בְּרִיתוֹ': 'his-covenant',
  'שׁוּבוּ': 'return/repent', 'וְשָׁבוּ': 'and-they-returned/repented',
  'וַיֵּדְעוּ': 'and-they-knew', 'וַתָּבוֹא': 'and-it-came(f)',
  'הָרִאשׁוֹנָה': 'the-first(f)', 'הַשִּׁשִּׁית': 'the-sixth(f)',
  'הַשְּׁבִיעִית': 'the-seventh(f)', 'הַשְּׁמִינִית': 'the-eighth(f)',
  'הַתְּשִׁיעִית': 'the-ninth(f)', 'הָעֲשִׂירִית': 'the-tenth(f)',
  'הַכ': 'the-', 'מִצְוַת': 'commandments-of', 'תּוֹרַת': 'law-of',
  'אֶת־הָנְּבִיאִים': 'ACC-the-prophets', 'אֶת־הַנְּבִיאִים': 'ACC-the-prophets',
  'בְּשָׁנָה': 'in-the-year', 'כָּל־מַלְכֵי': 'all-kings-of',
  'הִצְלִיחוּ': 'they-prospered', 'נִלְחֲמוּ': 'they-fought',
  'וַיַּרְגְשׁוּ': 'and-they-raged',
  'מַחֲנוֹת': 'camps', 'מַחֲנֵיהֶם': 'their-camps',
  'וַיֵּצְאוּ': 'and-they-went-out', 'בְּשָׁנָה': 'in-year',
  'נָפְלוּ': 'fell', 'בַּחֶרֶב': 'by-the-sword',
  'הַמִּדְבָּר': 'the-wilderness', 'בַּמִּדְבָּר': 'in-the-wilderness',
  'הָאֲסִירִים': 'the-prisoners', 'אֲסִירִים': 'prisoners',
  'אֲסִירֵיהֶם': 'their-prisoners',
  'נְשֵׁיהֶם': 'their-wives', 'וִילָדֵיהֶם': 'and-their-children',
  'נַפְשׁוֹתֵיהֶם': 'their-souls', 'נַפְשָׁם': 'their-soul',
  'עֲווֹנוֹתֵיהֶם': 'their-iniquities', 'עֲווֹנָם': 'their-iniquity',
  'חַטֹּאתֵיהֶם': 'their-sins', 'חַטֹּאתָם': 'their-sins',
  'וּנְבוּאוֹת': 'and-prophecies', 'נְבוּאוֹת': 'prophecies',
  'הָרַב': 'the-chief/great', 'הֶכֹּהֵן': 'the-priest',
  'הַכֹּהֵן': 'the-priest', 'הַגָּדוֹל': 'the-great/high',
  'אֲרָצוֹת': 'lands', 'אַרְצוֹתֵיהֶם': 'their-lands',
  'מַעֲשֵׂיהֶם': 'their-works', 'מַעֲשֵׂי': 'works-of',
  'וְתַחְבּוּלוֹת': 'and-wiles', 'תַּחְבּוּלוֹת': 'wiles',
  'הַכֹּהֲנִים': 'the-priests', 'כֹּהֲנֵיהֶם': 'their-priests',
  'הַגְּדוֹלִים': 'the-high/great', 'הַמּוֹרִים': 'the-teachers',
  'הִתְמוֹטֵט': 'collapsed', 'וַיִּתְמוֹטֵט': 'and-he-collapsed',
  'נוֹדָע': 'was-known', 'יִוָּדַע': 'shall-be-known',
  'וַיָּמָת': 'and-he-died', 'מֵתוּ': 'died', 'מֵת': 'dead/died',
  'וַיַּהַרְגוּ': 'and-they-slew', 'הָרַג': 'slew',
  'וַיֵּהָרְגוּ': 'and-were-slain', 'נֶהֶרְגוּ': 'were-slain',
  'וַיִּפְּלוּ': 'and-they-fell', 'נָפַל': 'fell',
  'בְּקוֹלוֹ': 'in-his-voice', 'קוֹלוֹ': 'his-voice',
  'שׁוֹדְדֵי': 'robbers-of', 'שׁוֹדְדִים': 'robbers',
  'וַיַּצְלִיחוּ': 'and-they-succeeded',
  'תְּשׁוּבָתָם': 'their-repentance', 'וְתְשׁוּבָה': 'and-repentance',
  'אַחֲרֵי': 'after', 'וְאַחֲרֵי': 'and-after',
  'מִפְּנֵי': 'because-of', 'וּמִפְּנֵי': 'and-because-of',
  'בַּעֲבוּר': 'because-of', 'בַּעֲבוּרָם': 'because-of-them',
};

// Load extra glosses from JSON file
const extraGlossesFile = JSON.parse(fs.readFileSync(path.join(baseDir, 'extra_glosses.json'), 'utf8'));

// Merge all sources into working dictionary
const workDict = { ...dict, ...extraGlosses, ...properNames, ...extraGlossesFile };

// ═══════════════════════════════════════
// MAQAF SPLITTING LOGIC
// ═══════════════════════════════════════
function lookupGloss(word) {
  // 1. Direct match
  if (workDict[word]) return { hebrew: word, gloss: workDict[word] };

  // 2. Strip trailing sof pasuk
  const cleaned = word.replace(/[׃]/g, '');
  if (cleaned && workDict[cleaned]) return { hebrew: word, gloss: workDict[cleaned] };

  // 3. If word contains maqaf (־), try splitting and glossing each part
  if (word.includes('־')) {
    const parts = word.split('־');
    const glossParts = [];
    let allFound = true;
    for (const p of parts) {
      if (workDict[p]) {
        glossParts.push(workDict[p]);
      } else {
        allFound = false;
        glossParts.push(p); // keep Hebrew as placeholder
      }
    }
    if (allFound) {
      // Join glosses with hyphens, but avoid double hyphens
      const joined = glossParts.join('-').replace(/--+/g, '-');
      return { hebrew: word, gloss: joined };
    }
    // Even if not all found, if we got most parts, use it
    if (glossParts.filter((_, i) => workDict[parts[i]]).length > parts.length / 2) {
      const joined = glossParts.map((g, i) => workDict[parts[i]] || '???').join('-');
      return { hebrew: word, gloss: joined };
    }
  }

  // 4. Not found
  return null;
}

// Tokenize
function tokenize(text) {
  return text.split(/\s+/).filter(w => w.length > 0);
}

// ═══════════════════════════════════════
// GENERATE JS DATA FOR ALL MISSING CHAPTERS
// ═══════════════════════════════════════
const missingChapters = {
  'al': { chapters: Array.from({length: 63}, (_, i) => i + 1), varPrefix: 'al_ch' },
  'he': { chapters: Array.from({length: 12}, (_, i) => i + 5), varPrefix: 'he_ch' },
  '3n': { chapters: Array.from({length: 30}, (_, i) => i + 1), varPrefix: 'tn_ch' },
  'et': { chapters: Array.from({length: 15}, (_, i) => i + 1), varPrefix: 'et_ch' },
};

let totalWords = 0;
let matchedWords = 0;
let missedWords = {};

for (const [bookCode, config] of Object.entries(missingChapters)) {
  const bookData = verses[bookCode];
  if (!bookData) continue;

  let jsOutput = '';
  let renderCalls = '';
  let bookName = '';
  switch(bookCode) {
    case 'al': bookName = 'ALMA'; break;
    case 'he': bookName = 'HELAMAN'; break;
    case '3n': bookName = '3 NEPHI'; break;
    case 'et': bookName = 'ETHER'; break;
  }

  for (const chapterNum of config.chapters) {
    const chapterVerses = bookData[chapterNum];
    if (!chapterVerses || chapterVerses.length === 0) {
      console.log(`  WARNING: ${bookCode} ch${chapterNum} has no verses in DOCX`);
      continue;
    }

    const varName = `${config.varPrefix}${chapterNum}Verses`;
    const containerId = `${bookCode === '3n' ? '3n' : bookCode}-ch${chapterNum}-verses`;

    jsOutput += `\n// ${bookName} \u2013 Chapter ${chapterNum}\n`;
    jsOutput += `// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n`;
    jsOutput += `const ${varName} = [\n`;

    for (let vi = 0; vi < chapterVerses.length; vi++) {
      const verse = chapterVerses[vi];
      const words = tokenize(verse.text);
      const wordPairs = [];

      for (const word of words) {
        totalWords++;
        const result = lookupGloss(word);
        if (result) {
          matchedWords++;
          wordPairs.push([result.hebrew, result.gloss]);
        } else {
          missedWords[word] = (missedWords[word] || 0) + 1;
          // Fallback: use the word itself as gloss placeholder
          wordPairs.push([word, '???']);
        }
      }

      // Add sof pasuk at end
      wordPairs.push(['\u05C3', '']);

      const wordsStr = wordPairs.map(([h, e]) => {
        const hEsc = h.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const eEsc = e.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `["${hEsc}","${eEsc}"]`;
      }).join(',');

      jsOutput += `  { num: "${verse.num}", words: [${wordsStr}] }`;
      jsOutput += vi < chapterVerses.length - 1 ? ',\n' : '\n';
    }

    jsOutput += `];\n`;
    renderCalls += `renderVerseSet(${varName}, '${containerId}');\n`;
  }

  // Write book data file
  const outputPath = path.join(baseDir, `${bookCode}_data.js`);
  fs.writeFileSync(outputPath, jsOutput + '\n' + renderCalls, 'utf8');
  console.log(`${bookCode}: wrote ${outputPath}`);
}

const pct = ((matchedWords/totalWords)*100).toFixed(1);
console.log(`\nFinal coverage: ${matchedWords}/${totalWords} (${pct}%)`);
console.log(`Remaining unmatched unique words: ${Object.keys(missedWords).length}`);

// Save remaining unmatched for review
const sortedMissed = Object.entries(missedWords).sort((a, b) => b[1] - a[1]);
fs.writeFileSync(
  path.join(baseDir, 'remaining_unmatched.json'),
  JSON.stringify(sortedMissed.slice(0, 500), null, 2),
  'utf8'
);

console.log('\nTop 30 remaining unmatched:');
sortedMissed.slice(0, 30).forEach(([w, c]) => console.log(`  ${w} (${c}x)`));
