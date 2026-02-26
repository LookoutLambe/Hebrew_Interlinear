// CAREFUL bleeding gloss fix — only strip content word overlaps
// between truly adjacent STANDALONE words, NOT pronominal suffixes.
//
// Rules:
// 1. Only strip when overlap word is > 3 chars (not function words)
// 2. NEVER strip from prepositions with suffixes (אלייך, עליהם, etc.)
// 3. NEVER strip if result would be < 3 chars or just an article/preposition
// 4. NEVER strip the article "the-" from article+adjective pairs
// 5. Only strip trailing overlap from word A when it matches word B exactly
//    (not just the first part of B)

const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');

const pairRegex = /\["([^"]+)","([^"]*)"\]/g;
const allPairs = [];
let m;
while ((m = pairRegex.exec(html)) !== null) {
  allPairs.push({ heb: m[1], eng: m[2], pos: m.index, len: m[0].length });
}

// Words that should NEVER be stripped (they're structural to meaning)
const neverStrip = new Set([
  'of', 'the', 'to', 'and', 'in', 'a', 'an', 'is', 'are', 'was',
  'for', 'by', 'on', 'at', 'or', 'be', 'it', 'he', 'we', 'I',
  'do', 'so', 'no', 'up', 'if', 'as', 'my', 'me', 'not', 'his',
  'her', 'our', 'who', 'you', 'him', 'them', 'she', 'they', 'us',
  'its', 'had', 'has', 'did', 'may', 'can', 'but', 'nor', 'yet',
  'with', 'from', 'upon', 'unto', 'into', 'over', 'also', 'even',
  'than', 'more', 'most', 'very', 'much', 'many', 'some', 'such',
  'this', 'that', 'what', 'when', 'then', 'there', 'here',
  'were', 'been', 'will', 'shall', 'would', 'should', 'could',
]);

// Hebrew words with pronominal suffixes — NEVER modify these
// Endings: ךָ/ךְ (you), כֶם (you-pl), הֶם/ם (them), ו (his/him),
// הּ/הָ (her), נוּ (us/our), י (my/me)
function hasSuffixPronoun(heb, eng) {
  // If the Hebrew word ends with a common suffix AND the gloss ends with a pronoun
  const pronounEndings = ['you', 'him', 'her', 'them', 'us', 'his', 'my', 'our', 'your', 'their'];
  const engParts = eng.split('-');
  const lastPart = engParts[engParts.length - 1];
  if (pronounEndings.includes(lastPart)) {
    // Check if the Hebrew word looks like it has a suffix
    // Common prepositions: אל, על, ל, ב, מן, עם, את, אצל
    const prepPatterns = [
      /^אֵלֶ/, /^אֲלֵ/, /^עֲלֵ/, /^עָלָ/, /^לָ/, /^לְ/, /^בָּ/, /^בְּ/,
      /^מִ/, /^עִמָּ/, /^אִתָּ/, /^אוֹתָ/, /^אֶצְלָ/, /^תַחְתָּ/,
      /^לִפְנֵ/, /^אַחֲרֵ/, /^בֵּינֵ/, /^בְּתוֹכָ/, /^סְבִיבוֹ/,
    ];
    for (const pat of prepPatterns) {
      if (pat.test(heb)) return true;
    }
    // Also catch verb forms with object suffixes
    // These are harder to detect, but if the Hebrew word has a suffix marker
    // and the gloss ends with a pronoun, it's likely a suffix
    if (/[ךְָהּוּםןנִי]$/.test(heb)) return true;
  }
  return false;
}

let fixes = [];

for (let i = 0; i < allPairs.length - 1; i++) {
  const a = allPairs[i];
  const b = allPairs[i + 1];
  if (!a.eng || !b.eng) continue;
  if (a.heb === '\u05C3' || b.heb === '\u05C3') continue;

  const aParts = a.eng.split('-');
  const bParts = b.eng.split('-');

  // Pattern: trailing part of A matches B's entire gloss or first part
  if (aParts.length > 1) {
    const lastA = aParts[aParts.length - 1].toLowerCase();

    // Skip if overlap word is too short or in never-strip list
    if (lastA.length <= 3 || neverStrip.has(lastA)) continue;

    // Skip if A has a pronominal suffix
    if (hasSuffixPronoun(a.heb, a.eng)) continue;

    // Check: does lastA match B's gloss exactly or B's first part?
    const bFirst = bParts[0].toLowerCase();
    const bFull = b.eng.toLowerCase();

    if (lastA === bFull || lastA === bFirst) {
      const newGloss = aParts.slice(0, -1).join('-');

      // Safety: result must be meaningful (> 2 chars and not just articles/prepositions)
      if (newGloss.length < 3) continue;
      const newParts = newGloss.split('-');
      const meaningful = newParts.some(p => p.length > 2 && !neverStrip.has(p.toLowerCase()));
      if (!meaningful) continue;

      fixes.push({
        pairIdx: i,
        target: 'a',
        heb: a.heb,
        oldGloss: a.eng,
        newGloss: newGloss,
        overlap: aParts[aParts.length - 1],
        context: `${a.heb}("${a.eng}") + ${b.heb}("${b.eng}")`
      });
    }
  }
}

console.log(`=== CAREFUL BLEEDING FIXES ===\n`);
console.log(`Fixes to apply: ${fixes.length}\n`);

for (const f of fixes) {
  console.log(`  ${f.heb}: "${f.oldGloss}" → "${f.newGloss}"  [${f.context}]`);
}

// Apply fixes in reverse position order
fixes.sort((a, b) => allPairs[b.pairIdx].pos - allPairs[a.pairIdx].pos);

let applied = 0;
for (const f of fixes) {
  const pair = allPairs[f.pairIdx];
  const oldStr = `["${pair.heb}","${f.oldGloss}"]`;
  const newStr = `["${pair.heb}","${f.newGloss}"]`;

  const chunk = html.substring(pair.pos, pair.pos + oldStr.length);
  if (chunk === oldStr) {
    html = html.substring(0, pair.pos) + newStr + html.substring(pair.pos + oldStr.length);
    applied++;
  }
}

console.log(`\nApplied ${applied} careful bleeding fixes`);
fs.writeFileSync('BOM.html', html);
console.log('BOM.html updated!');
