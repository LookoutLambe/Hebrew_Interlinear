// Advanced morphological analysis to fix remaining bad transliterations
// Strategy: strip prefixes + suffixes, match root against dictionary, reconstruct gloss
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

// Prefix combinations (most specific first)
const prefixCombos = [
  // 3-char prefixes
  { strip: 3, niqqud: 'וכש', gloss: 'and-as-that-' },
  { strip: 3, niqqud: 'ובה', gloss: 'and-in-the-' },
  { strip: 3, niqqud: 'ולה', gloss: 'and-to-the-' },
  { strip: 3, niqqud: 'ומה', gloss: 'and-from-the-' },
  { strip: 3, niqqud: 'וכה', gloss: 'and-as-the-' },
  { strip: 3, niqqud: 'שבה', gloss: 'that-in-the-' },
  { strip: 3, niqqud: 'שלה', gloss: 'that-to-the-' },
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
  // 1-char prefixes
  { strip: 1, niqqud: 'ה', gloss: 'the-' },
  { strip: 1, niqqud: 'ו', gloss: 'and-' },
  { strip: 1, niqqud: 'ב', gloss: 'in-' },
  { strip: 1, niqqud: 'ל', gloss: 'to-' },
  { strip: 1, niqqud: 'מ', gloss: 'from-' },
  { strip: 1, niqqud: 'כ', gloss: 'as-' },
  { strip: 1, niqqud: 'ש', gloss: 'that-' },
];

// Suffix patterns (stripped niqqud) -> English meaning
const suffixPatterns = [
  // Possessive suffixes on nouns
  { stripped: 'יהם', gloss: '-their', minRest: 2 },
  { stripped: 'יהן', gloss: '-their(f)', minRest: 2 },
  { stripped: 'יכם', gloss: '-your(pl)', minRest: 2 },
  { stripped: 'יכן', gloss: '-your(f.pl)', minRest: 2 },
  { stripped: 'ינו', gloss: '-our', minRest: 2 },
  { stripped: 'יהם', gloss: '-their', minRest: 2 },
  { stripped: 'ותם', gloss: '-their', minRest: 2 },
  { stripped: 'ותי', gloss: '-my', minRest: 2 },
  { stripped: 'ותיו', gloss: '-his', minRest: 2 },
  { stripped: 'תם', gloss: '-their', minRest: 2 },
  { stripped: 'תי', gloss: '-my', minRest: 2 },
  { stripped: 'נו', gloss: '-our/-us', minRest: 2 },
  { stripped: 'הם', gloss: '-them', minRest: 2 },
  { stripped: 'כם', gloss: '-you(pl)', minRest: 2 },
  { stripped: 'ם', gloss: '(pl)', minRest: 2 },
  { stripped: 'ו', gloss: '-his', minRest: 2 },
  { stripped: 'ה', gloss: '-her', minRest: 2 },
  { stripped: 'י', gloss: '-my', minRest: 2 },
  { stripped: 'ך', gloss: '-your', minRest: 2 },
  // Verbal suffixes
  { stripped: 'תם', gloss: '-you(pl)', minRest: 2 },
  { stripped: 'תי', gloss: '-I', minRest: 2 },
  { stripped: 'ו', gloss: '-they', minRest: 2 },
];

// Plural endings
const pluralEndings = [
  { stripped: 'ים', gloss: '(pl)', minRest: 2 },
  { stripped: 'ות', gloss: '(pl.f)', minRest: 2 },
  { stripped: 'ין', gloss: '(pl)', minRest: 2 },
];

function tryLookup(stripped) {
  if (strippedDict[stripped]) return strippedDict[stripped];
  // Try with common letter variations
  // ו and ו can be consonantal or mater lectionis
  if (stripped.endsWith('ו')) {
    const base = stripped.slice(0, -1);
    if (strippedDict[base]) return strippedDict[base];
  }
  if (stripped.endsWith('ה')) {
    const base = stripped.slice(0, -1);
    if (strippedDict[base]) return strippedDict[base];
  }
  return null;
}

function morphLookup(word) {
  const clean = word.replace(/[׃]/g, '').trim();
  if (!clean) return null;

  // Direct lookup
  if (dict[clean]) return dict[clean];
  const stripped = stripNiqqud(clean);
  if (strippedDict[stripped]) return strippedDict[stripped];

  // Try prefix stripping
  for (const { strip, niqqud, gloss: prefGloss } of prefixCombos) {
    if (stripped.length > strip + 2 && stripped.startsWith(niqqud)) {
      const rest = stripped.slice(strip);
      // Direct match on rest
      const found = tryLookup(rest);
      if (found) return prefGloss + found;

      // Try suffix stripping on rest
      for (const { stripped: suf, gloss: sufGloss, minRest } of suffixPatterns) {
        if (rest.length > suf.length + minRest && rest.endsWith(suf)) {
          const root = rest.slice(0, -suf.length);
          const found2 = tryLookup(root);
          if (found2) return prefGloss + found2 + sufGloss;
          // Try with ה added (construct form)
          const found3 = tryLookup(root + 'ה');
          if (found3) return prefGloss + found3 + sufGloss;
          const found4 = tryLookup(root + 'ת');
          if (found4) return prefGloss + found4 + sufGloss;
        }
      }

      // Try plural endings
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

  // Try just suffix stripping (no prefix)
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

  // Try plural
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

// Check if a gloss is a bad transliteration
function isBadTranslit(gloss) {
  const segs = gloss.split('-');
  for (const seg of segs) {
    if (seg.length < 3) continue;
    if (/^[A-Z][a-z]+$/.test(seg)) {
      const l = seg.toLowerCase();
      const v = (l.match(/[aeiou]/g)||[]).length;
      if (l.length >= 4 && v/l.length < 0.2) return true;
      if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(l)) return true;
      if (/^[bcdfghjklmnpqrstvwxyz]{3}/i.test(l) && l.length >= 4) return true;
    }
  }
  if (/[\u0590-\u05FF]/.test(gloss)) return true;
  return false;
}

// Process all bad glosses
const re = /\["([^"]+)","([^"]*)"\]/g;
let match;
const replacements = new Map();
let fixCount = 0;

while ((match = re.exec(bom)) !== null) {
  const heb = match[1];
  const gloss = match[2];
  if (!gloss || gloss === '' || heb === '׃') continue;
  if (!isBadTranslit(gloss)) continue;

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
      replacements.set(match[0], `["${heb}","${gp.join('-')}"]`);
      fixCount++;
      continue;
    }
  }

  const found = morphLookup(heb);
  if (found) {
    replacements.set(match[0], `["${heb}","${found}"]`);
    fixCount++;
  }
}

console.log(`Morphological analysis fixed: ${fixCount} glosses`);
console.log(`Applying ${replacements.size} replacements...`);

for (const [orig, repl] of replacements) {
  bom = bom.split(orig).join(repl);
}

fs.writeFileSync('BOM.html', bom, 'utf8');
console.log('Done!');

// Count remaining
const re2 = /\["([^"]+)","([^"]*)"\]/g;
let m2, remaining = 0;
while ((m2 = re2.exec(bom)) !== null) {
  if (m2[1] !== '׃' && isBadTranslit(m2[2])) remaining++;
}
console.log(`Remaining bad transliterations: ${remaining}`);
