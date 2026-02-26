// Fix redundant pronouns: when a standalone pronoun word appears adjacent to a verb
// whose gloss starts with the same pronoun, strip it from the verb gloss.
// e.g. אָנוּ "we" + חָפֵצִים "we-are-desirous" → אָנוּ "we" + חָפֵצִים "are-desirous"

const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');

// Hebrew pronouns and their English gloss prefixes
const pronounMap = {
  // "I" pronouns
  'אֲנִי': ['I-', 'i-'],
  'אָנֹכִי': ['I-', 'i-'],
  // "we" pronouns
  'אֲנַחְנוּ': ['we-'],
  'אָנוּ': ['we-'],
  // "you" singular
  'אַתָּה': ['you-'],
  'אַתְּ': ['you-'],
  // "you" plural
  'אַתֶּם': ['you-'],
  // "he/it" pronouns
  'הוּא': ['he-', 'it-'],
  // "she/it" pronouns
  'הִיא': ['she-', 'it-'],
  // "they" pronouns
  'הֵם': ['they-'],
  'הֵמָּה': ['they-'],
  'הֵן': [],  // skip - הֵן means "behold" in BOM context more often
  'הֵנָּה': ['they-'],
};

// Step 1: Find all verse arrays in the HTML
// Verse arrays look like: [["word","gloss"],["word","gloss"],...]
// They appear in the data declarations

// Parse word pairs in context - find sequences where pronoun is next to a verb with matching prefix
const verseRegex = /\[\[("[^"]*","[^"]*"(?:,\d+)?)\](?:,\[("[^"]*","[^"]*"(?:,\d+)?)\])*\]/g;

// Actually, let's work differently: find pronoun words and check neighbors
// First, let's analyze the pattern

// Extract all verse data: each verse is an array of [hebrew, english] pairs
// They're on individual lines in the HTML

let totalFixes = 0;
let fixDetails = new Map(); // pronoun → count

// Strategy: Find patterns like ["pronoun","gloss"],["verb","PRONOUN-rest"]
// or ["verb","PRONOUN-rest"],["pronoun","gloss"]
// The pronoun could be before or after the verb (Hebrew word order varies)

// For each known pronoun, find cases where adjacent word has matching prefix
for (const [pronoun, prefixes] of Object.entries(pronounMap)) {
  if (prefixes.length === 0) continue;

  const escapedPron = pronoun.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const prefix of prefixes) {
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Pattern 1: pronoun THEN verb with prefix (pronoun comes first in array = later in Hebrew RTL)
    // ["pronoun","gloss"],["hebrewVerb","PREFIX-something"]
    const pat1 = new RegExp(
      `\\["${escapedPron}","[^"]*"\\],\\["([^"]+)","${escapedPrefix}([^"]+)"\\]`,
      'g'
    );

    let m;
    while ((m = pat1.exec(html)) !== null) {
      const verbHeb = m[1];
      const restOfGloss = m[2];
      // Don't strip if the rest would be empty or just punctuation
      if (restOfGloss.length < 2) continue;
      // Don't strip from proper names or if rest starts with capital
      if (restOfGloss[0] === restOfGloss[0].toUpperCase() && restOfGloss[0].match(/[A-Z]/)) continue;

      const oldPair = `["${verbHeb}","${prefix}${restOfGloss}"]`;
      const newPair = `["${verbHeb}","${restOfGloss}"]`;

      // Only do it if this is actually in the html at this position
      // (the regex already matched, so it is)
    }

    // Pattern 2: verb with prefix THEN pronoun
    // ["hebrewVerb","PREFIX-something"],["pronoun","gloss"]
    const pat2 = new RegExp(
      `\\["([^"]+)","${escapedPrefix}([^"]+)"\\],\\["${escapedPron}","[^"]*"\\]`,
      'g'
    );
  }
}

// Better approach: do a single pass through all verses
// Find verse arrays, process each one

console.log('=== ANALYZING REDUNDANT PRONOUN PATTERNS ===\n');

// Let's first just count and show examples
const pairArrayRegex = /\["([^"]+)","([^"]*)"\]/g;
const allPairs = [];
let pm;
while ((pm = pairArrayRegex.exec(html)) !== null) {
  allPairs.push({ heb: pm[1], eng: pm[2], pos: pm.index, full: pm[0] });
}

console.log(`Total word pairs: ${allPairs.length}`);

// Now scan for adjacent pronoun + verb-with-prefix patterns
const pronounWords = new Set(Object.keys(pronounMap));
let examples = [];
let fixCount = 0;

for (let i = 0; i < allPairs.length - 1; i++) {
  const curr = allPairs[i];
  const next = allPairs[i + 1];

  // Check if curr is a pronoun and next has matching prefix
  if (pronounMap[curr.heb]) {
    const prefixes = pronounMap[curr.heb];
    for (const prefix of prefixes) {
      if (next.eng.startsWith(prefix) && next.eng.length > prefix.length) {
        const rest = next.eng.slice(prefix.length);
        if (rest.length >= 2 && !rest[0].match(/[A-Z]/)) {
          fixCount++;
          if (examples.length < 20) {
            examples.push(`  ${curr.heb}("${curr.eng}") + ${next.heb}("${next.eng}") → "${rest}"`);
          }
        }
      }
    }
  }

  // Check if next is a pronoun and curr has matching prefix
  if (pronounMap[next.heb]) {
    const prefixes = pronounMap[next.heb];
    for (const prefix of prefixes) {
      if (curr.eng.startsWith(prefix) && curr.eng.length > prefix.length) {
        const rest = curr.eng.slice(prefix.length);
        if (rest.length >= 2 && !rest[0].match(/[A-Z]/)) {
          fixCount++;
          if (examples.length < 20) {
            examples.push(`  ${curr.heb}("${curr.eng}") + ${next.heb}("${next.eng}") → "${rest}"`);
          }
        }
      }
    }
  }
}

console.log(`\nRedundant pronoun patterns found: ${fixCount}`);
console.log('\nExamples:');
for (const ex of examples) {
  console.log(ex);
}

// Now actually apply the fixes
console.log('\n=== APPLYING FIXES ===\n');

let newHtml = html;
let applied = 0;

for (const [pronoun, prefixes] of Object.entries(pronounMap)) {
  if (prefixes.length === 0) continue;

  const escapedPron = pronoun.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const prefix of prefixes) {
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Pattern 1: ["pronoun","..."],["verb","PREFIX-rest"]
    // Replace the verb's gloss, removing the prefix
    const pat1 = new RegExp(
      `(\\["${escapedPron}","[^"]*"\\],\\["[^"]+",")${escapedPrefix}([a-z][^"]+")`,
      'g'
    );

    const before1 = newHtml;
    newHtml = newHtml.replace(pat1, (match, before, rest) => {
      // Don't strip if rest is too short
      if (rest.replace('"', '').length < 2) return match;
      applied++;
      return before + rest;
    });

    // Pattern 2: ["verb","PREFIX-rest"],["pronoun","..."]
    const pat2 = new RegExp(
      `(\\["[^"]+",")${escapedPrefix}([a-z][^"]*"\\],\\["${escapedPron}","[^"]*"\\])`,
      'g'
    );

    newHtml = newHtml.replace(pat2, (match, before, rest) => {
      if (rest.split('"')[0].length < 2) return match;
      applied++;
      return before + rest;
    });
  }
}

console.log(`Applied ${applied} redundant pronoun fixes`);

// Write result
fs.writeFileSync('BOM.html', newHtml);
console.log('BOM.html updated!');

// Show some verification
console.log('\n=== VERIFICATION: sample "we" patterns ===');
const verifyRegex2 = /\["אָנוּ","[^"]*"\],\["[^"]+","[^"]*"\]/g;
let vv;
const verifySamples = [];
while ((vv = verifyRegex2.exec(newHtml)) !== null) {
  verifySamples.push(vv[0]);
  if (verifySamples.length >= 10) break;
}
for (const s of verifySamples) {
  console.log('  ' + s);
}
