/**
 * add_tanakh_xrefs.js
 * Adds Tanakh (Hebrew Bible) cross-references to crossrefs.json
 * for verses containing key theological Hebrew roots.
 *
 * For each theological root, we define the top Tanakh parallels.
 * The script scans verse data for these roots and adds cross-refs
 * where they don't already exist.
 */
const fs = require('fs');

// Load crossrefs
const crossrefs = JSON.parse(fs.readFileSync('crossrefs.json', 'utf8'));

// Tanakh references by root — the most important parallels for each root
const tanakhByRoot = {
  'תמם': [
    { ref: 'Gen. 17:1', keyword: 'blameless', note: 'Walk before me and be blameless' },
    { ref: 'Deut. 18:13', keyword: 'blameless', note: 'Be blameless before the LORD' },
    { ref: 'Ps. 19:8', keyword: 'perfect', note: 'The law of the LORD is perfect' }
  ],
  'חסד': [
    { ref: 'Ex. 34:6–7', keyword: 'lovingkindness', note: 'Abounding in lovingkindness and truth' },
    { ref: 'Ps. 136:1', keyword: 'lovingkindness', note: 'His lovingkindness endures forever' },
    { ref: 'Mic. 6:8', keyword: 'kindness', note: 'Love kindness (chesed)' }
  ],
  'גאל': [
    { ref: 'Job 19:25', keyword: 'redeemer', note: 'I know that my Redeemer lives' },
    { ref: 'Isa. 44:6', keyword: 'redeemer', note: "Israel's King and Redeemer" },
    { ref: 'Isa. 43:1', keyword: 'redeemed', note: 'I have redeemed you' }
  ],
  'ישע': [
    { ref: 'Isa. 12:2', keyword: 'salvation', note: 'God is my salvation' },
    { ref: 'Ex. 14:13', keyword: 'salvation', note: 'See the salvation of the LORD' },
    { ref: 'Isa. 49:6', keyword: 'salvation', note: 'My salvation to the end of the earth' }
  ],
  'שלם': [
    { ref: 'Isa. 9:5', keyword: 'peace', note: 'Prince of Peace (Sar Shalom)' },
    { ref: '1 Kgs. 8:61', keyword: 'wholly', note: 'Heart wholly devoted to the LORD' },
    { ref: 'Num. 6:26', keyword: 'peace', note: 'The LORD give you peace' }
  ],
  'צדק': [
    { ref: 'Gen. 15:6', keyword: 'righteousness', note: 'Reckoned to him as righteousness' },
    { ref: 'Amos 5:24', keyword: 'righteousness', note: 'Righteousness like a mighty stream' },
    { ref: 'Isa. 32:17', keyword: 'righteousness', note: 'Work of righteousness shall be peace' }
  ],
  'ברית': [
    { ref: 'Gen. 17:7', keyword: 'covenant', note: 'An everlasting covenant' },
    { ref: 'Jer. 31:31', keyword: 'covenant', note: 'A new covenant' },
    { ref: 'Deut. 7:9', keyword: 'covenant', note: 'Faithful God who keeps covenant' }
  ],
  'כפר': [
    { ref: 'Lev. 16:30', keyword: 'atonement', note: 'Atonement shall be made for you' },
    { ref: 'Lev. 17:11', keyword: 'atonement', note: 'Blood makes atonement for the soul' },
    { ref: 'Isa. 6:7', keyword: 'atoned', note: 'Your sin is atoned for' }
  ],
  'קדש': [
    { ref: 'Lev. 11:44', keyword: 'holy', note: 'Be holy for I am holy' },
    { ref: 'Isa. 6:3', keyword: 'holy', note: 'Holy, holy, holy is the LORD' },
    { ref: 'Ex. 19:6', keyword: 'holy', note: 'A kingdom of priests and a holy nation' }
  ],
  'שוב': [
    { ref: 'Isa. 55:7', keyword: 'repent', note: 'Let the wicked return to the LORD' },
    { ref: 'Mal. 3:7', keyword: 'return', note: 'Return to me and I will return to you' },
    { ref: 'Joel 2:12–13', keyword: 'return', note: 'Return to me with all your heart' }
  ],
  'אמן': [
    { ref: 'Gen. 15:6', keyword: 'believed', note: 'Abram believed in the LORD' },
    { ref: 'Hab. 2:4', keyword: 'faith', note: 'The righteous shall live by faith' }
  ],
  'נביא': [
    { ref: 'Deut. 18:15', keyword: 'prophet', note: 'A prophet like me from among you' },
    { ref: 'Amos 3:7', keyword: 'prophets', note: 'He reveals counsel to his servants the prophets' }
  ],
  'רחם': [
    { ref: 'Isa. 49:15', keyword: 'compassion', note: 'Even these may forget, but I will not forget you' },
    { ref: 'Ps. 103:13', keyword: 'compassion', note: 'As a father has compassion on his children' }
  ],
  'טהר': [
    { ref: 'Ps. 51:12', keyword: 'clean', note: 'Create in me a clean heart' },
    { ref: 'Ezek. 36:25', keyword: 'clean', note: 'I will sprinkle clean water upon you' }
  ],
  'רשע': [
    { ref: 'Ps. 1:6', keyword: 'wicked', note: 'The way of the wicked shall perish' },
    { ref: 'Isa. 55:7', keyword: 'wicked', note: 'Let the wicked forsake his way' }
  ],
  'חטא': [
    { ref: 'Gen. 4:7', keyword: 'sin', note: 'Sin is crouching at the door' },
    { ref: 'Isa. 1:18', keyword: 'sins', note: 'Though your sins be as scarlet' }
  ],
  'עון': [
    { ref: 'Isa. 53:5', keyword: 'iniquities', note: 'Crushed for our iniquities' },
    { ref: 'Ex. 34:7', keyword: 'iniquity', note: 'Forgiving iniquity and transgression' }
  ]
};

// The rootMap — mapping surface Hebrew forms to roots
// (Loaded from generated_rootMap.js logic, but we'll define the key forms inline)
const rootMap = {
  // תמם
  'תָּמִים': 'תמם', 'תָמִים': 'תמם', 'תְּמִימִים': 'תמם', 'תְמִימִים': 'תמם',
  'וּתְמִימִים': 'תמם', 'תְּמִימָה': 'תמם', 'תְמִימָה': 'תמם', 'תָּמָה': 'תמם',
  'תָּם': 'תמם', 'תֹּם': 'תמם', 'בְּתֹם': 'תמם', 'כְּתֹם': 'תמם',
  // חסד
  'חֶסֶד': 'חסד', 'חַסְדּוֹ': 'חסד', 'חַסְדִּי': 'חסד', 'חַסְדְּךָ': 'חסד',
  'חֲסָדִים': 'חסד', 'בְּחֶסֶד': 'חסד', 'חַסְדֵי': 'חסד', 'וְחֶסֶד': 'חסד',
  'בְּחַסְדּוֹ': 'חסד', 'לְחַסְדּוֹ': 'חסד',
  // גאל
  'גֹּאֵל': 'גאל', 'גָּאַל': 'גאל', 'גְּאוּלָה': 'גאל', 'גָּאוּל': 'גאל',
  'הַגֹּאֵל': 'גאל', 'גְּאוּלִים': 'גאל', 'יִגְאַל': 'גאל', 'גְּאָלָם': 'גאל',
  'גֹּאֲלִי': 'גאל', 'נִגְאָל': 'גאל', 'נִגְאַלְנוּ': 'גאל',
  // ישע
  'יְשׁוּעָה': 'ישע', 'יֵשׁוּעַ': 'ישע', 'הוֹשִׁיעַ': 'ישע', 'יוֹשִׁיעַ': 'ישע',
  'מוֹשִׁיעַ': 'ישע', 'תְּשׁוּעָה': 'ישע', 'יֶשַׁע': 'ישע', 'הוֹשַׁע': 'ישע',
  'נוֹשַׁע': 'ישע', 'יִוָּשֵׁעוּ': 'ישע',
  // שלם
  'שָׁלוֹם': 'שלם', 'שָׁלֵם': 'שלם', 'שְׁלֵמָה': 'שלם', 'שֶׁלֶם': 'שלם',
  'הִשְׁלִים': 'שלם', 'שָׁלַם': 'שלם', 'שְׁלֵמִים': 'שלם',
  // צדק
  'צֶדֶק': 'צדק', 'צְדָקָה': 'צדק', 'צַדִּיק': 'צדק', 'צַדִּיקִים': 'צדק',
  'הַצַּדִּיק': 'צדק', 'צִדְקוֹ': 'צדק', 'צִדְקָתוֹ': 'צדק',
  // ברית
  'בְּרִית': 'ברית', 'בְּרִיתוֹ': 'ברית', 'בְּרִיתִי': 'ברית', 'הַבְּרִית': 'ברית',
  // כפר
  'כִּפֵּר': 'כפר', 'כַּפָּרָה': 'כפר', 'כִּפֻּרִים': 'כפר', 'יְכַפֵּר': 'כפר',
  'הַכִּפֻּרִים': 'כפר', 'כֹּפֶר': 'כפר',
  // קדש
  'קָדוֹשׁ': 'קדש', 'קֹדֶשׁ': 'קדש', 'קְדוֹשִׁים': 'קדש', 'מְקַדֵּשׁ': 'קדש',
  'הַקָּדוֹשׁ': 'קדש', 'קִדֵּשׁ': 'קדש', 'הִתְקַדֵּשׁ': 'קדש',
  // שוב
  'שׁוּב': 'שוב', 'שָׁב': 'שוב', 'יָשׁוּב': 'שוב', 'וַיָּשָׁב': 'שוב',
  'תְּשׁוּבָה': 'שוב', 'שׁוּבוּ': 'שוב',
  // אמן
  'אֱמוּנָה': 'אמן', 'הֶאֱמִין': 'אמן', 'נֶאֱמָן': 'אמן', 'אָמֵן': 'אמן',
  'הַאֲמִינוּ': 'אמן', 'מַאֲמִין': 'אמן', 'יַאֲמִין': 'אמן',
  // נביא
  'נָבִיא': 'נביא', 'נְבִיאִים': 'נביא', 'נְבִיאֵי': 'נביא', 'הַנָּבִיא': 'נביא',
  'נִבָּא': 'נביא', 'נְבוּאָה': 'נביא',
  // רחם
  'רַחֲמִים': 'רחם', 'רַחוּם': 'רחם', 'רִחַם': 'רחם', 'יְרַחֵם': 'רחם',
  // טהר
  'טָהוֹר': 'טהר', 'טַהֲרוּ': 'טהר', 'טְהוֹרִים': 'טהר', 'טִהֵר': 'טהר',
  'הִטַּהֵר': 'טהר',
  // רשע
  'רָשָׁע': 'רשע', 'רְשָׁעִים': 'רשע', 'הָרְשָׁעִים': 'רשע', 'רִשְׁעָה': 'רשע',
  // חטא
  'חֵטְא': 'חטא', 'חַטָּאת': 'חטא', 'חָטָא': 'חטא', 'חַטָּאתָם': 'חטא',
  'חַטָּאוֹת': 'חטא', 'חֲטָאֵיכֶם': 'חטא',
  // עון
  'עָוֹן': 'עון', 'עֲוֹנוֹתֵיכֶם': 'עון', 'עֲוֹנוֹתָם': 'עון', 'עֲוֹנִי': 'עון'
};

// Read BOM.html to extract verse data and find root matches
const bomHtml = fs.readFileSync('BOM.html', 'utf8');

// Extract all verse objects with their keys
// We look for patterns: data-verse-key="Book|ch|v" in the rendered HTML
// But actually, let's parse the JS arrays from the source

// Simpler approach: scan crossrefs.json keys, and for each key,
// look up the verse content in BOM.html to check for root words.
// The verse data is in JS arrays like: { num: "א", words: [["הע","gloss"],...] }

// Actually, the most reliable approach: extract from the BOM.html the verse arrays
// and check each word against our rootMap.

// Let's find all verse data by parsing the chapter definitions
// Pattern: verseKey is built as "Book|chapter|verseNumber"
// The verse arrays are named like ch1Verses, n2_ch1Verses, etc.

// For efficiency, let's just scan each existing crossrefs key's verse for root words
// by searching for the verse data near the key

console.log('Scanning for theological roots in BOM verses...');

// Build a reverse lookup: for each Hebrew word, what root?
function getRoot(hw) {
  if (rootMap[hw]) return rootMap[hw];
  // Strip common prefixes
  const prefixes = ['וְ','הַ','בְּ','לְ','מִ','כְּ','שֶׁ','וּ','בַּ','לַ','הָ','וַ','מֵ'];
  for (const p of prefixes) {
    if (hw.startsWith(p)) {
      const stripped = hw.slice(p.length);
      if (rootMap[stripped]) return rootMap[stripped];
    }
  }
  return null;
}

// For each verse in crossrefs.json, search BOM.html for its Hebrew words
// and determine which roots are present
let added = 0;
let scanned = 0;

// Get all verse keys from crossrefs
const verseKeys = Object.keys(crossrefs);
console.log(`Total verse keys in crossrefs: ${verseKeys.length}`);

// For each verse in crossrefs, find the verse data in BOM.html
// The verse key format is "Book|chapter|verse"
// Search BOM.html for the word arrays of that verse

// Strategy: For each verse, grep BOM.html for the Hebrew words near the verse
// Actually, let's take a different approach — scan ALL word arrays in BOM.html
// and build a map of verseKey -> set of roots present

// Parse verse arrays from BOM.html
// They appear as: { num: "HEBNUMBER", words: [["hw","gl"],...] }
// Within chapter panels that have data-verse-key attributes

// Actually the most reliable approach: extract word pairs from BOM.html
// The rendered HTML has: <span class="hw">WORD</span> inside <div class="verse" data-verse-key="X">
// But that's only generated at runtime.

// Instead, let's parse the JavaScript verse arrays.
// The verse data appears as JS objects like:
// { num: "א", words: [["הע","gl"],...] }
// within array definitions.

// Let's extract all ["HEBREW","gloss"] pairs from each verse entry
// and map them to verse keys using the chapter structure

// Parse the chapter mapping from the navTo function
const bookChapterMap = {
  'ch': { book: '1 Nephi', chapters: 22 },
  '2n-ch': { book: '2 Nephi', chapters: 33 },
  'jc-ch': { book: 'Jacob', chapters: 7 },
  'en-ch': { book: 'Enos', chapters: 1 },
  'jr-ch': { book: 'Jarom', chapters: 1 },
  'om-ch': { book: 'Omni', chapters: 1 },
  'wm-ch': { book: 'Words of Mormon', chapters: 1 },
  'mo-ch': { book: 'Mosiah', chapters: 29 },
  'al-ch': { book: 'Alma', chapters: 63 },
  'he-ch': { book: 'Helaman', chapters: 16 },
  '3n-ch': { book: '3 Nephi', chapters: 30 },
  '4n-ch': { book: '4 Nephi', chapters: 1 },
  'mm-ch': { book: 'Mormon', chapters: 9 },
  'et-ch': { book: 'Ether', chapters: 15 },
  'mr-ch': { book: 'Moroni', chapters: 10 }
};

// Hebrew number to Arabic mapping
const hebNums = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'יא': 11, 'יב': 12, 'יג': 13, 'יד': 14, 'טו': 15, 'טז': 16,
  'יז': 17, 'יח': 18, 'יט': 19, 'כ': 20, 'כא': 21, 'כב': 22, 'כג': 23,
  'כד': 24, 'כה': 25, 'כו': 26, 'כז': 27, 'כח': 28, 'כט': 29, 'ל': 30,
  'לא': 31, 'לב': 32, 'לג': 33, 'לד': 34, 'לה': 35, 'לו': 36, 'לז': 37,
  'לח': 38, 'לט': 39, 'מ': 40, 'מא': 41, 'מב': 42, 'מג': 43, 'מד': 44,
  'מה': 45, 'מו': 46, 'מז': 47, 'מח': 48, 'מט': 49, 'נ': 50, 'נא': 51,
  'נב': 52, 'נג': 53, 'נד': 54, 'נה': 55, 'נו': 56, 'נז': 57, 'נח': 58,
  'נט': 59, 'ס': 60, 'סא': 61, 'סב': 62, 'סג': 63, 'סד': 64, 'סה': 65,
  'סו': 66, 'סז': 67, 'סח': 68, 'סט': 69
};

// Extract verse arrays from BOM.html and all data files
const allFiles = [
  { path: 'BOM.html', content: bomHtml },
  { path: '_chapter_data/al_data.js', content: fs.readFileSync('_chapter_data/al_data.js', 'utf8') },
  { path: '_chapter_data/he_data.js', content: fs.readFileSync('_chapter_data/he_data.js', 'utf8') },
  { path: '_chapter_data/3n_data.js', content: fs.readFileSync('_chapter_data/3n_data.js', 'utf8') },
  { path: '_chapter_data/et_data.js', content: fs.readFileSync('_chapter_data/et_data.js', 'utf8') }
];

// For each verse key in crossrefs, find the verse's Hebrew words and check roots
// We need to determine what Hebrew words are in each verse.
//
// Approach: For each crossrefs key, search for the Hebrew word pairs in the
// BOM data by finding the verse's position based on its book/chapter/verse.
//
// Simpler approach for NOW: scan all word arrays and build a
// verseKey → roots map, then add Tanakh refs.

// Build map: extract all ["HEBREW","gloss"] from verse entries
// by regex-matching the verse array structure
const verseRoots = {}; // verseKey -> Set of roots

// Parse variable name to book/chapter mapping
const varPatterns = [
  { re: /^ch(\d+)Verses/, book: '1 Nephi' },
  { re: /^n2_ch(\d+)Verses/, book: '2 Nephi' },
  { re: /^jc_ch(\d+)/, book: 'Jacob' },
  { re: /^en_ch(\d+)/, book: 'Enos' },
  { re: /^jr_ch(\d+)/, book: 'Jarom' },
  { re: /^om_ch(\d+)/, book: 'Omni' },
  { re: /^wm_ch(\d+)/, book: 'Words of Mormon' },
  { re: /^mo_ch(\d+)/, book: 'Mosiah' },
  { re: /^al_ch(\d+)/, book: 'Alma' },
  { re: /^he_ch(\d+)/, book: 'Helaman' },
  { re: /^tn_ch(\d+)/, book: '3 Nephi' },
  { re: /^fn_ch(\d+)/, book: '4 Nephi' },
  { re: /^mm_ch(\d+)/, book: 'Mormon' },
  { re: /^et_ch(\d+)/, book: 'Ether' },
  { re: /^mr_ch(\d+)/, book: 'Moroni' }
];

// Extract verse data using regex on the combined source
const combinedSrc = allFiles.map(f => f.content).join('\n');

// Find all verse entries: { num: "X", words: [[...]] }
// Match pattern: { num: "HEBNUM", words: [...]  }
// We need to find each verse and its chapter context

// Strategy: find chapter array declarations, then parse verses within
// e.g., const ch1Verses = [ ... ];  or  var al_ch1 = [ ... ];

const chapterRe = /(?:const|var|let)\s+(\w+)\s*=\s*\[/g;
let chMatch;
while ((chMatch = chapterRe.exec(combinedSrc)) !== null) {
  const varName = chMatch[1];
  let bookName = null, chNum = null;

  for (const vp of varPatterns) {
    const m = varName.match(vp.re);
    if (m) {
      bookName = vp.book;
      chNum = parseInt(m[1], 10);
      break;
    }
  }
  if (!bookName) continue;

  // Find the matching closing bracket for this array
  const startIdx = chMatch.index + chMatch[0].length;
  let depth = 1;
  let endIdx = startIdx;
  while (depth > 0 && endIdx < combinedSrc.length) {
    if (combinedSrc[endIdx] === '[') depth++;
    if (combinedSrc[endIdx] === ']') depth--;
    endIdx++;
  }

  const arrayContent = combinedSrc.slice(startIdx, endIdx - 1);

  // Extract individual verse entries
  const verseRe = /num:\s*"([^"]+)".*?words:\s*\[((?:\[.*?\](?:\s*,\s*)?)*)\]/g;
  let vMatch;
  while ((vMatch = verseRe.exec(arrayContent)) !== null) {
    const hebNum = vMatch[1];
    const verseNum = hebNums[hebNum];
    if (!verseNum) continue;

    const verseKey = `${bookName}|${chNum}|${verseNum}`;
    const wordsStr = vMatch[2];

    // Extract Hebrew words from the word pairs
    const wordPairRe = /\["([^"]+)"/g;
    let wpMatch;
    const roots = new Set();
    while ((wpMatch = wordPairRe.exec(wordsStr)) !== null) {
      const hw = wpMatch[1];
      const root = getRoot(hw);
      if (root && tanakhByRoot[root]) {
        roots.add(root);
      }
    }

    if (roots.size > 0) {
      verseRoots[verseKey] = roots;
    }
  }
}

console.log(`Found ${Object.keys(verseRoots).length} verses with theological roots`);

// Now add Tanakh cross-references to crossrefs.json
for (const [verseKey, roots] of Object.entries(verseRoots)) {
  if (!crossrefs[verseKey]) {
    crossrefs[verseKey] = [];
  }

  const existing = crossrefs[verseKey];
  // Get existing ref strings to avoid duplicates
  const existingRefs = new Set();
  existing.forEach(entry => {
    if (entry.refs) entry.refs.forEach(r => existingRefs.add(r));
  });

  // Find next available marker letter
  const usedMarkers = new Set(existing.map(e => e.marker));
  const markers = 'abcdefghijklmnopqrstuvwxyz';
  let markerIdx = 0;
  function nextMarker() {
    while (markerIdx < markers.length && usedMarkers.has(markers[markerIdx])) {
      markerIdx++;
    }
    if (markerIdx >= markers.length) return null;
    const m = markers[markerIdx];
    usedMarkers.add(m);
    markerIdx++;
    return m;
  }

  for (const root of roots) {
    const tanakhRefs = tanakhByRoot[root];
    if (!tanakhRefs) continue;

    // Filter out refs that already exist
    const newRefs = tanakhRefs.filter(tr => !existingRefs.has(tr.ref));
    if (newRefs.length === 0) continue;

    // Find the best keyword to attach this to
    const keyword = newRefs[0].keyword;

    // Check if there's already an entry with a similar keyword
    let targetEntry = existing.find(e =>
      e.text && e.text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (targetEntry) {
      // Add refs to existing entry
      for (const nr of newRefs) {
        if (!existingRefs.has(nr.ref)) {
          targetEntry.refs.push(nr.ref);
          existingRefs.add(nr.ref);
          added++;
        }
      }
    } else {
      // Create new entry
      const marker = nextMarker();
      if (!marker) continue;

      const refStrings = newRefs.map(nr => nr.ref);
      refStrings.forEach(r => existingRefs.add(r));

      existing.push({
        marker: marker,
        text: keyword,
        refs: refStrings,
        category: 'hebrew-cross-ref'
      });
      added += refStrings.length;
    }
  }

  scanned++;
}

console.log(`Added ${added} Tanakh cross-references across ${scanned} verses`);

// Write updated crossrefs
fs.writeFileSync('crossrefs.json', JSON.stringify(crossrefs, null, 2), 'utf8');
console.log('Updated crossrefs.json');
