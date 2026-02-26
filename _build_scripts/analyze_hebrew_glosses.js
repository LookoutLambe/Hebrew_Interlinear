// Analyze from the HEBREW side: for each Hebrew word, what English glosses are used?
// When the same Hebrew word is glossed differently in different verses,
// prefer the gloss that matches the official English vocabulary.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_FILE = path.resolve(__dirname, 'BOM_backup.html');
const OFFICIAL_FILE = path.resolve(__dirname, 'official_verses.json');

const html = fs.readFileSync(HTML_FILE, 'utf8');
const official = JSON.parse(fs.readFileSync(OFFICIAL_FILE, 'utf8'));

const officialMap = {};
for (const v of official) {
  officialMap[`${v.book} ${v.chapter}:${v.verse}`] = v.english;
}

const prefixToBook = [
  ['n2_ch', '2 Nephi'], ['jc_ch', 'Jacob'], ['en_ch', 'Enos'],
  ['jr_ch', 'Jarom'], ['om_ch', 'Omni'], ['wm_ch', 'Words of Mormon'],
  ['mo_ch', 'Mosiah'], ['al_ch', 'Alma'], ['he_ch', 'Helaman'],
  ['tn_ch', '3 Nephi'], ['fn_ch', '4 Nephi'], ['mm_ch', 'Mormon'],
  ['et_ch', 'Ether'], ['mr_ch', 'Moroni'], ['ch', '1 Nephi'],
];

function hebToNum(heb) {
  const map = {
    'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
    'י':10,'יא':11,'יב':12,'יג':13,'יד':14,'טו':15,'טז':16,'יז':17,'יח':18,'יט':19,
    'כ':20,'כא':21,'כב':22,'כג':23,'כד':24,'כה':25,'כו':26,'כז':27,'כח':28,'כט':29,
    'ל':30,'לא':31,'לב':32,'לג':33,'לד':34,'לה':35,'לו':36,'לז':37,'לח':38,'לט':39,
    'מ':40,'מא':41,'מב':42,'מג':43,'מד':44,'מה':45,'מו':46,'מז':47,'מח':48,'מט':49,
    'נ':50,'נא':51,'נב':52,'נג':53,'נד':54,'נה':55,'נו':56,'נז':57,'נח':58,'נט':59,
    'ס':60,'סא':61,'סב':62,'סג':63,'סד':64,'סה':65,'סו':66,
  };
  return map[heb] || -1;
}

function getBookChapter(varName) {
  for (const [prefix, book] of prefixToBook) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = varName.match(new RegExp(`^${escaped}(\\d+)Verses$`));
    if (m) return { book, chapter: parseInt(m[1]) };
  }
  return null;
}

function norm(w) { return w.toLowerCase().replace(/[^a-z']/g, ''); }

function tokenize(text) {
  return text.replace(/[–—]/g, ' ').replace(/[.,;:!?'"()\[\]{}]/g, ' ')
    .split(/\s+/).filter(w => w.length > 0);
}

// Strip vowel points (nikkud) from Hebrew to get the consonantal root
function stripNikkud(heb) {
  return heb.replace(/[\u0591-\u05C7]/g, '');
}

const universalWords = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by','from',
  'is','are','was','were','be','been','have','has','had','do','does','did',
  'will','shall','would','should','may','might','can','could',
  'not','no','nor','if','then','that','this','these','those','it','its',
  'he','she','him','her','his','my','your','our','their','me','you','us','them','we','they','i',
  'who','whom','which','what','where','when','how','why',
  'all','each','every','some','any','so','as','up','out','about',
  'also','even','yet','now','unto','upon','into',
]);

function extractVerseArrays(html) {
  const results = {};
  const declRegex = /const\s+(\w+Verses)\s*=\s*\[/g;
  let match;
  while ((match = declRegex.exec(html)) !== null) {
    const varName = match[1];
    const startIdx = match.index + match[0].length - 1;
    let depth = 1, i = startIdx + 1;
    while (i < html.length && depth > 0) {
      if (html[i] === '[') depth++;
      else if (html[i] === ']') depth--;
      i++;
    }
    if (depth !== 0) continue;
    try {
      const arr = vm.runInNewContext(`(${html.substring(startIdx, i)})`, {});
      results[varName] = arr;
    } catch (e) {}
  }
  return results;
}

console.log('Analyzing Hebrew word → English gloss patterns...');
const verseArrays = extractVerseArrays(html);

// Track for each Hebrew root: what English glosses are used, and which are "official"
// hebRoot -> { glosses: { "english-gloss": { total: N, official: N } } }
const hebGlossMap = {};

for (const [varName, verses] of Object.entries(verseArrays)) {
  const bc = getBookChapter(varName);
  if (!bc) continue;
  const { book, chapter } = bc;

  for (const verse of verses) {
    if (!verse || !verse.words) continue;
    const verseNum = hebToNum(verse.num);
    if (verseNum < 1) continue;

    const key = `${book} ${chapter}:${verseNum}`;
    const officialText = officialMap[key];
    if (!officialText) continue;

    const offTokens = tokenize(officialText);
    const vocabNorm = new Set(offTokens.map(w => norm(w)));

    for (const [heb, eng] of verse.words) {
      if (!eng || eng === '' || eng === '—' || heb === '׃') continue;

      const hebRoot = stripNikkud(heb);
      if (!hebRoot || hebRoot.length === 0) continue;

      // Clean the English gloss
      const cleaned = eng
        .replace(/\(f\)|\(m\)|\(pl\)|\(sg\)|\(du\)/gi, '')
        .replace(/\[ACC\]/gi, 'ACC').replace(/\[REL\]/gi, 'REL')
        .trim();

      if (!hebGlossMap[hebRoot]) hebGlossMap[hebRoot] = {};

      if (!hebGlossMap[hebRoot][cleaned]) {
        hebGlossMap[hebRoot][cleaned] = { total: 0, officialMatch: 0 };
      }
      hebGlossMap[hebRoot][cleaned].total++;

      // Check if the content words of this gloss are in the official text
      const parts = cleaned.split('-').map(p => norm(p)).filter(p => p.length > 1 && !universalWords.has(p) && p !== 'acc' && p !== 'rel');
      if (parts.length === 0) {
        hebGlossMap[hebRoot][cleaned].officialMatch++;
      } else {
        const allInOfficial = parts.every(p => vocabNorm.has(p));
        if (allInOfficial) hebGlossMap[hebRoot][cleaned].officialMatch++;
      }
    }
  }
}

// Find Hebrew words where there are BOTH official and non-official glosses
// These are candidates for vocabulary normalization
console.log('\n=== HEBREW WORDS WITH MIXED OFFICIAL/NON-OFFICIAL GLOSSES ===');
console.log('(Same Hebrew word glossed differently — can normalize to official version)\n');

const candidates = [];
for (const [hebRoot, glosses] of Object.entries(hebGlossMap)) {
  const entries = Object.entries(glosses);
  const hasOfficial = entries.some(([g, s]) => s.officialMatch > 0);
  const hasNonOfficial = entries.some(([g, s]) => s.officialMatch === 0 && s.total > 0);

  if (hasOfficial && hasNonOfficial) {
    const officialGlosses = entries.filter(([g, s]) => s.officialMatch > 0)
      .sort((a, b) => b[1].total - a[1].total);
    const nonOfficialGlosses = entries.filter(([g, s]) => s.officialMatch === 0)
      .sort((a, b) => b[1].total - a[1].total);

    const totalNonOfficial = nonOfficialGlosses.reduce((sum, [g, s]) => sum + s.total, 0);
    candidates.push({
      heb: hebRoot,
      official: officialGlosses.map(([g, s]) => ({ gloss: g, count: s.total })),
      nonOfficial: nonOfficialGlosses.map(([g, s]) => ({ gloss: g, count: s.total })),
      totalNonOfficial,
    });
  }
}

candidates.sort((a, b) => b.totalNonOfficial - a.totalNonOfficial);

console.log(`Found ${candidates.length} Hebrew words with normalization candidates\n`);

// Show top candidates
for (const c of candidates.slice(0, 80)) {
  const offStr = c.official.slice(0, 3).map(o => `"${o.gloss}"(x${o.count})`).join(', ');
  const nonStr = c.nonOfficial.slice(0, 3).map(o => `"${o.gloss}"(x${o.count})`).join(', ');
  console.log(`  ${c.heb} (${c.totalNonOfficial} fixable)`);
  console.log(`    Official: ${offStr}`);
  console.log(`    Non-official: ${nonStr}`);
}

// Build the substitution map: for each (hebRoot, nonOfficialGloss) -> preferredOfficialGloss
// Rules:
// 1. The official gloss must have the same number of hyphenated parts (same structure)
// 2. Pick the most frequently used official gloss with matching structure
// 3. If no structural match, try part-by-part substitution
const substitutions = [];

for (const c of candidates) {
  for (const no of c.nonOfficial) {
    const noParts = no.gloss.split('-');
    // Find official glosses with same part count
    const matchingOfficial = c.official.filter(o => o.gloss.split('-').length === noParts.length);
    if (matchingOfficial.length > 0) {
      substitutions.push({
        heb: c.heb,
        from: no.gloss,
        to: matchingOfficial[0].gloss,
        count: no.count,
        type: 'full-match'
      });
    } else {
      // Try part-by-part: find the best official gloss and do partial substitution
      // For now, skip these — they need more careful handling
    }
  }
}

substitutions.sort((a, b) => b.count - a.count);

console.log(`\n=== SUBSTITUTION MAP (${substitutions.length} entries, top 50) ===\n`);
for (const s of substitutions.slice(0, 50)) {
  console.log(`  ${s.heb}: "${s.from}" → "${s.to}" (x${s.count})`);
}

// Save
fs.writeFileSync(
  path.resolve(__dirname, 'hebrew_gloss_analysis.json'),
  JSON.stringify({ candidates: candidates.slice(0, 200), substitutions }, null, 2)
);
console.log(`\nSaved hebrew_gloss_analysis.json (${substitutions.length} substitutions)`);
