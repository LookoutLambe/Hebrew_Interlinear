const fs = require('fs');

// ═══════════════════════════════════════════════════════════
// MORPHOLOGICAL BOOTSTRAP GLOSSER
// Strategy: Build dictionary from ALL existing glossed words,
// then for each ??? word, try prefix/suffix stripping and
// look up the stem in the existing dictionary.
// ═══════════════════════════════════════════════════════════

// ── STEP 1: Build dictionary from ALL existing glossed words ──
// Collect from both BOM.html and external chapter data files

const allSources = [
  'BOM.html',
  '_chapter_data/al_data.js',
  '_chapter_data/he_data.js',
  '_chapter_data/3n_data.js',
  '_chapter_data/et_data.js',
];

const glossDict = new Map(); // hebrew → gloss (first non-??? occurrence wins)
const glossCounts = new Map(); // hebrew → count of non-??? occurrences

allSources.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const re = /\["([^"]+)","([^"]*?)"\]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const word = m[1];
    const gloss = m[2];
    if (gloss && gloss !== '???' && gloss !== '׃' && gloss !== '') {
      if (!glossDict.has(word)) {
        glossDict.set(word, gloss);
        glossCounts.set(word, 1);
      } else {
        glossCounts.set(word, glossCounts.get(word) + 1);
      }
    }
  }
});

console.log(`Built dictionary: ${glossDict.size} unique glossed Hebrew words`);

// ── STEP 2: Define prefix patterns ──
// Ordered from longest to shortest to match greedily
const PREFIXES = [
  // Triple compound prefixes
  { pattern: /^וּכְשֶׁ/, gloss: 'and-as-that-' },
  { pattern: /^וּבְכָל/, gloss: 'and-in-all-' },
  // Double compound prefixes
  { pattern: /^וּבַ/, gloss: 'and-in-the-' },
  { pattern: /^וּבְ/, gloss: 'and-in-' },
  { pattern: /^וּלְ/, gloss: 'and-to-' },
  { pattern: /^וּמִ/, gloss: 'and-from-' },
  { pattern: /^וּמֵ/, gloss: 'and-from-' },
  { pattern: /^וּכְ/, gloss: 'and-as-' },
  { pattern: /^וְהַ/, gloss: 'and-the-' },
  { pattern: /^וְהָ/, gloss: 'and-the-' },
  { pattern: /^וְלַ/, gloss: 'and-to-the-' },
  { pattern: /^וְלָ/, gloss: 'and-to-the-' },
  { pattern: /^וְלִ/, gloss: 'and-to-' },
  { pattern: /^וּלַ/, gloss: 'and-to-the-' },
  { pattern: /^וְבַ/, gloss: 'and-in-the-' },
  { pattern: /^וְבְ/, gloss: 'and-in-' },
  { pattern: /^וְבָ/, gloss: 'and-in-the-' },
  { pattern: /^וְבִ/, gloss: 'and-in-' },
  { pattern: /^וְכַ/, gloss: 'and-as-the-' },
  { pattern: /^וְכָ/, gloss: 'and-as-the-' },
  { pattern: /^וְכְ/, gloss: 'and-as-' },
  { pattern: /^וּמַ/, gloss: 'and-from-the-' },
  { pattern: /^וְמִ/, gloss: 'and-from-' },
  { pattern: /^וְמֵ/, gloss: 'and-from-' },
  { pattern: /^וּלְהַ/, gloss: 'and-to-the-' },
  { pattern: /^בְּהַ/, gloss: 'in-the-' },
  { pattern: /^בַּהַ/, gloss: 'in-the-' },
  { pattern: /^לְהַ/, gloss: 'to-the-' },
  { pattern: /^לַהַ/, gloss: 'to-the-' },
  { pattern: /^מֵהַ/, gloss: 'from-the-' },
  { pattern: /^מֵהָ/, gloss: 'from-the-' },
  { pattern: /^כְּהַ/, gloss: 'as-the-' },
  { pattern: /^שֶׁבְ/, gloss: 'that-in-' },
  { pattern: /^שֶׁלְ/, gloss: 'that-to-' },
  { pattern: /^שֶׁהַ/, gloss: 'that-the-' },
  { pattern: /^שֶׁהָ/, gloss: 'that-the-' },
  // Single prefixes
  { pattern: /^וְ/, gloss: 'and-' },
  { pattern: /^וּ/, gloss: 'and-' },
  { pattern: /^וָ/, gloss: 'and-' },
  { pattern: /^וֶ/, gloss: 'and-' },
  { pattern: /^וִ/, gloss: 'and-' },
  { pattern: /^הַ/, gloss: 'the-' },
  { pattern: /^הָ/, gloss: 'the-' },
  { pattern: /^הֶ/, gloss: 'the-' },
  { pattern: /^בְּ/, gloss: 'in-' },
  { pattern: /^בַּ/, gloss: 'in-the-' },
  { pattern: /^בָּ/, gloss: 'in-the-' },
  { pattern: /^בִּ/, gloss: 'in-' },
  { pattern: /^לְ/, gloss: 'to-' },
  { pattern: /^לַ/, gloss: 'to-the-' },
  { pattern: /^לָ/, gloss: 'to-the-' },
  { pattern: /^לִ/, gloss: 'to-' },
  { pattern: /^מִ/, gloss: 'from-' },
  { pattern: /^מֵ/, gloss: 'from-' },
  { pattern: /^מַ/, gloss: 'from-the-' },
  { pattern: /^כְּ/, gloss: 'as-' },
  { pattern: /^כַּ/, gloss: 'as-the-' },
  { pattern: /^כָּ/, gloss: 'as-the-' },
  { pattern: /^כִּ/, gloss: 'as-' },
  { pattern: /^שֶׁ/, gloss: 'that-' },
];

// ── STEP 3: Maqaf compound handler ──
// Handle words with maqaf (־) by looking up each part
function tryMaqafCompound(word) {
  if (!word.includes('־') && !word.includes('-')) return null;
  const sep = word.includes('־') ? '־' : '-';
  const parts = word.split(sep);
  if (parts.length !== 2) return null;

  const [first, second] = parts;
  const firstGloss = glossDict.get(first);
  const secondGloss = glossDict.get(second);

  if (firstGloss && secondGloss) {
    return `${firstGloss}-${secondGloss}`;
  }
  // Try with just the second part having the gloss
  if (secondGloss) {
    // Common first parts
    const firstMap = {
      'אֶת': '[ACC]', 'אֶל': 'to', 'עַל': 'upon', 'מִן': 'from',
      'בֶּן': 'son-of', 'בַּת': 'daughter-of', 'כָל': 'all',
      'כׇּל': 'all', 'כׇל': 'all', 'לֹא': 'not', 'אֵין': 'no',
    };
    if (firstMap[first]) return `${firstMap[first]}-${secondGloss}`;
    if (firstGloss) return `${firstGloss}-${secondGloss}`;
  }
  if (firstGloss) {
    // Try prefix-stripping on second part
    const secondResult = tryPrefixStrip(second);
    if (secondResult) return `${firstGloss}-${secondResult}`;
  }

  return null;
}

// ── STEP 4: Prefix stripping + dictionary lookup ──
function tryPrefixStrip(word) {
  // First try direct lookup
  if (glossDict.has(word)) return glossDict.get(word);

  // Try stripping sof-pasuk
  const noSofPasuk = word.replace(/׃$/, '');
  if (noSofPasuk !== word && glossDict.has(noSofPasuk)) {
    return glossDict.get(noSofPasuk);
  }

  // Try prefix stripping
  for (const p of PREFIXES) {
    if (p.pattern.test(word)) {
      const stem = word.replace(p.pattern, '');
      if (stem.length >= 2) {
        // Direct lookup of stem
        if (glossDict.has(stem)) {
          return p.gloss + glossDict.get(stem);
        }
        // Try stem without sof-pasuk
        const stemClean = stem.replace(/׃$/, '');
        if (stemClean !== stem && glossDict.has(stemClean)) {
          return p.gloss + glossDict.get(stemClean);
        }
      }
    }
  }

  return null;
}

// ── STEP 5: Process all ??? entries ──
const dataFiles = [
  '_chapter_data/al_data.js',
  '_chapter_data/he_data.js',
  '_chapter_data/3n_data.js',
  '_chapter_data/et_data.js',
];

let grandTotal = 0;
const unfixed = [];

dataFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = 0;

  // Find all ??? entries
  const re = /\["([^"]+)","(\?\?\?)"\]/g;
  const matches = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    matches.push({ word: m[1], full: m[0], index: m.index });
  }

  for (const match of matches) {
    const word = match.word;
    let gloss = null;

    // Try maqaf compound first
    gloss = tryMaqafCompound(word);

    // Try prefix stripping
    if (!gloss) gloss = tryPrefixStrip(word);

    // Try stripping sof-pasuk then prefix stripping
    if (!gloss) {
      const clean = word.replace(/׃$/, '');
      if (clean !== word) {
        gloss = tryPrefixStrip(clean);
      }
    }

    if (gloss) {
      const search = `["${word}","???"]`;
      const replace = `["${word}","${gloss}"]`;
      content = content.split(search).join(replace);
      fileFixed++;
    } else {
      unfixed.push({ word, file: filePath });
    }
  }

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  console.log(`${filePath}: Fixed ${fileFixed} of ${matches.length} ??? entries`);
  grandTotal += fileFixed;
});

console.log(`\nTotal bootstrap fixes: ${grandTotal}`);

// Count remaining
let remaining = 0;
dataFiles.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const count = (c.match(/"\?\?\?"/g) || []).length;
  remaining += count;
  console.log(`  ${f}: ${count} ??? remaining`);
});
console.log(`Total ??? remaining: ${remaining}`);

// Show unique unfixed words count
const uniqueUnfixed = [...new Set(unfixed.map(u => u.word))];
console.log(`\nUnique unfixed words: ${uniqueUnfixed.length}`);

// Show sample of unfixed words by pattern
console.log('\nSample unfixed by pattern:');
const vyq = uniqueUnfixed.filter(w => /^וַ/.test(w));
console.log(`  Vayyiqtol (וַ): ${vyq.length} — e.g. ${vyq.slice(0,5).join(', ')}`);
const nif = uniqueUnfixed.filter(w => /^נִ/.test(w));
console.log(`  Niphal (נִ): ${nif.length} — e.g. ${nif.slice(0,5).join(', ')}`);
const hif = uniqueUnfixed.filter(w => /^הִ/.test(w) && w.length > 4);
console.log(`  Hifil (הִ): ${hif.length} — e.g. ${hif.slice(0,5).join(', ')}`);
const hit = uniqueUnfixed.filter(w => /^הִתְ|^מִתְ/.test(w));
console.log(`  Hitpael: ${hit.length} — e.g. ${hit.slice(0,5).join(', ')}`);
const impf = uniqueUnfixed.filter(w => /^יִ|^תִ|^אֶ|^נִ/.test(w) && !/^נִפ|^נִשׁ|^נִכ|^נִל|^נִמ|^נִת/.test(w));
console.log(`  Imperfect prefix: ${impf.length}`);
const plain = uniqueUnfixed.filter(w => !/^וַ|^נִ|^הִ|^יִ|^תִ|^אֶ/.test(w));
console.log(`  Other/plain: ${plain.length}`);
