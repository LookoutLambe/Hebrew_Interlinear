// Fix vocabulary consistency across all Hebrew word glosses
// Strategy: For each Hebrew word (with nikkud), the dominant gloss is almost always correct.
// Glosses appearing only 1-2 times are nearly always misalignment errors.
// Replace rare wrong glosses with the dominant correct gloss.

const fs = require('fs');
const html = fs.readFileSync('BOM.html', 'utf8');

// Step 1: Extract all word pairs and their positions
const pairRegex = /\["([^"]+)","([^"]*)"\]/g;
const wordMap = new Map(); // Hebrew → { gloss: count }
let match;

while ((match = pairRegex.exec(html)) !== null) {
  const heb = match[1];
  const eng = match[2];
  if (heb === '\u05C3' || eng === '') continue;
  if (!wordMap.has(heb)) wordMap.set(heb, new Map());
  const glosses = wordMap.get(heb);
  glosses.set(eng, (glosses.get(eng) || 0) + 1);
}

// Step 2: Build correction map
// For each Hebrew word, determine the correct gloss and which variants to fix
const corrections = new Map(); // Hebrew → Map(wrongGloss → correctGloss)
let totalCorrections = 0;
let wordsAffected = 0;

for (const [heb, glosses] of wordMap) {
  const total = [...glosses.values()].reduce((s, v) => s + v, 0);
  if (total < 3) continue; // skip very rare words
  if (glosses.size <= 1) continue; // no variants

  const sorted = [...glosses.entries()].sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const dominantCount = sorted[0][1];
  const dominantPct = dominantCount / total;

  // Only fix words where the dominant gloss is clearly dominant (>40%)
  if (dominantPct < 0.4) continue;

  // Threshold: replace glosses appearing <= threshold times
  // For common words (>100 occurrences), use higher absolute threshold
  let threshold;
  if (total > 500) threshold = Math.max(5, Math.floor(total * 0.005));
  else if (total > 100) threshold = 3;
  else if (total > 20) threshold = 2;
  else threshold = 1;

  // Also check: is the rare gloss plausibly related to the dominant?
  // If the rare gloss shares a key word with the dominant, it might be legit
  const dominantWords = new Set(dominant.split(/[-\/]/));

  const fixes = new Map();
  for (const [gloss, count] of sorted.slice(1)) {
    if (count > threshold) continue; // common enough to keep

    // Check if this looks like a legitimate variant
    const glossWords = gloss.split(/[-\/]/);
    const shared = glossWords.some(w => w.length > 2 && dominantWords.has(w));

    // If no shared words with dominant and it's rare, it's likely wrong
    if (!shared) {
      fixes.set(gloss, dominant);
      totalCorrections += count;
    }
  }

  if (fixes.size > 0) {
    corrections.set(heb, fixes);
    wordsAffected++;
  }
}

console.log(`Words with corrections needed: ${wordsAffected}`);
console.log(`Total individual corrections: ${totalCorrections}`);

// Step 3: Show a sample of corrections for review
console.log('\n=== SAMPLE CORRECTIONS ===\n');

// Show specific words the user mentioned
const showcase = ['אֲשֶׁר', 'כִּי', 'אֶת', 'לֹא', 'וַיְהִי', 'עַל', 'אֱלֹהִים', 'הָאָרֶץ'];
for (const heb of showcase) {
  if (corrections.has(heb)) {
    const fixes = corrections.get(heb);
    const glosses = wordMap.get(heb);
    const sorted = [...glosses.entries()].sort((a, b) => b[1] - a[1]);
    console.log(`${heb} → dominant: "${sorted[0][0]}" (${sorted[0][1]}x)`);
    console.log(`  Kept variants:`);
    for (const [g, c] of sorted.slice(1)) {
      if (!fixes.has(g)) console.log(`    ${c}x "${g}"`);
    }
    console.log(`  FIXING ${fixes.size} wrong glosses:`);
    let shown = 0;
    for (const [wrong, correct] of fixes) {
      if (shown < 10) {
        const cnt = glosses.get(wrong);
        console.log(`    ${cnt}x "${wrong}" → "${correct}"`);
      }
      shown++;
    }
    if (shown > 10) console.log(`    ... and ${shown - 10} more`);
    console.log('');
  }
}

// Step 4: Apply corrections to the HTML
console.log('\nApplying corrections...');

let newHtml = html;
let applied = 0;

for (const [heb, fixes] of corrections) {
  for (const [wrong, correct] of fixes) {
    // Match the exact pair in the HTML
    const escapedHeb = heb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedWrong = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\["${escapedHeb}","${escapedWrong}"\\]`, 'g');
    const replacement = `["${heb}","${correct}"]`;

    const before = newHtml;
    newHtml = newHtml.replace(pattern, replacement);
    if (newHtml !== before) {
      const count = (before.match(pattern) || []).length;
      applied += count;
    }
  }
}

console.log(`Applied ${applied} corrections`);

// Step 5: Write the fixed file
fs.writeFileSync('BOM.html', newHtml);
console.log('BOM.html updated successfully');

// Step 6: Verify
const verifyRegex = /\["([^"]+)","([^"]*)"\]/g;
const verifyMap = new Map();
let vm;
while ((vm = verifyRegex.exec(newHtml)) !== null) {
  const h = vm[1], e = vm[2];
  if (h === '\u05C3' || e === '') continue;
  if (!verifyMap.has(h)) verifyMap.set(h, new Map());
  verifyMap.get(h).set(e, (verifyMap.get(h).get(e) || 0) + 1);
}

let multiAfter = 0;
for (const [h, g] of verifyMap) {
  if (g.size > 1) multiAfter++;
}

console.log(`\nBefore: ${wordMap.size} unique Hebrew words, 3938 with multiple glosses`);
console.log(`After: ${verifyMap.size} unique Hebrew words, ${multiAfter} with multiple glosses`);
