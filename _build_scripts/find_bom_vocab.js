// Find cases where Hebrew glosses use generic translations
// instead of official Book of Mormon vocabulary
// Cross-reference with official_verses.json

const fs = require('fs');
const html = fs.readFileSync('BOM.html', 'utf8');
const official = JSON.parse(fs.readFileSync('official_verses.json', 'utf8'));

// Step 1: Build a frequency map of English words in official BOM text
const officialWordFreq = new Map();
for (const v of official) {
  const words = v.english.toLowerCase().replace(/[^\w\s'-]/g, '').split(/\s+/);
  for (const w of words) {
    officialWordFreq.set(w, (officialWordFreq.get(w) || 0) + 1);
  }
}

// Step 2: Extract all Hebrew→gloss pairs from BOM.html
const pairRegex = /\["([^"]+)","([^"]*)"\]/g;
const wordMap = new Map(); // Hebrew → Map(gloss → count)
let match;
while ((match = pairRegex.exec(html)) !== null) {
  const heb = match[1], eng = match[2];
  if (heb === '\u05C3' || eng === '') continue;
  if (!wordMap.has(heb)) wordMap.set(heb, new Map());
  wordMap.get(heb).set(eng, (wordMap.get(heb).get(eng) || 0) + 1);
}

// Step 3: Known BOM-specific vocabulary swaps
// These are cases where a generic Hebrew translation should use the BOM-specific English word
// Format: currentGloss → bomGloss (only where Hebrew supports both meanings)
const bomVocabSwaps = {
  // Governance terms
  'to-rule': 'to-reign',
  'ruled': 'reigned',
  'ruling': 'reigning',
  'rule': 'reign',
  'ruler': 'ruler', // keep - BOM uses both

  // Religious terms
  'anointed': 'Christ',  // only for המשיח
  'anointed-one': 'Messiah',
  'the-anointed': 'the-Messiah',
  'the-anointed-one': 'the-Messiah',
  'messenger': 'angel',
  'messengers': 'angels',
  'the-messenger': 'the-angel',
  'assembly': 'church',
  'assemblies': 'churches',
  'the-assembly': 'the-church',
  'immerse': 'baptize',
  'immersed': 'baptized',
  'immersion': 'baptism',
  'to-immerse': 'to-baptize',
  'teaching': 'doctrine',
  'teachings': 'doctrines',

  // Common BOM terms
  'transgression': 'iniquity',  // actually both are BOM words, check context
  'slaughter': 'destruction',
  'kindness': 'mercy',
  'loving-kindness': 'mercy',
  'lovingkindness': 'mercy',
  'agreement': 'covenant',
  'cut': 'covenant', // כרת ברית
  'command': 'commandment',
  'commands': 'commandments',
  'prediction': 'prophecy',
  'predictions': 'prophecies',
  'predicted': 'prophesied',
  'predict': 'prophesy',

  // Movement/action terms
  'went-down': 'descended',
  'went-up': 'ascended',
  'go-out': 'depart',
  'went-out': 'departed',
  'going-out': 'departing',

  // People terms
  'nation': 'people',
  'settlement': 'city',
};

// Step 4: Check which swaps actually apply in our data
console.log('=== BOM VOCABULARY ANALYSIS ===\n');

// First, let's see what glosses exist for key Hebrew words
const keyWords = [
  ['לִמְשֹׁל', 'to-rule/reign'],
  ['הַשֹּׁפְטִים', 'the-judges'],
  ['הַמָּשִׁיחַ', 'the-Messiah/Christ'],
  ['מַלְאָךְ', 'angel/messenger'],
  ['הַמַּלְאָךְ', 'the-angel'],
  ['קְהִלָּה', 'church/assembly'],
  ['קְהִלּוֹת', 'churches'],
  ['טָבַל', 'baptize/immerse'],
  ['בְּרִית', 'covenant'],
  ['מִצְוָה', 'commandment'],
  ['מִצְוֹת', 'commandments'],
  ['נָבִיא', 'prophet'],
  ['נְבוּאָה', 'prophecy'],
  ['נְבוּאוֹת', 'prophecies'],
  ['חֶסֶד', 'mercy/kindness'],
  ['תְּשׁוּבָה', 'repentance'],
  ['גְּאֻלָּה', 'redemption'],
  ['יֵשׁוּעַ', 'Jesus/Yeshua'],
  ['עִיר', 'city'],
  ['מָשַׁל', 'rule/reign'],
];

for (const [heb, desc] of keyWords) {
  if (wordMap.has(heb)) {
    const glosses = [...wordMap.get(heb).entries()].sort((a,b) => b[1]-a[1]);
    console.log(`${heb} (${desc}):`);
    for (const [g, c] of glosses) {
      console.log(`  ${c}x "${g}"`);
    }
    console.log('');
  }
}

// Step 5: Find all glosses that could be swapped to BOM vocabulary
console.log('\n=== PROPOSED SWAPS ===\n');
let totalSwaps = 0;

for (const [heb, glosses] of wordMap) {
  for (const [gloss, count] of glosses) {
    // Check each word in the hyphenated gloss
    const parts = gloss.split('-');
    for (const swap in bomVocabSwaps) {
      if (gloss === swap || gloss.includes(swap)) {
        const bomWord = bomVocabSwaps[swap];
        const newGloss = gloss.replace(swap, bomWord);
        if (newGloss !== gloss) {
          if (totalSwaps < 50) {
            console.log(`${heb}: "${gloss}" (${count}x) → "${newGloss}"`);
          }
          totalSwaps += count;
        }
      }
    }
  }
}
console.log(`\nTotal proposed swaps: ${totalSwaps}`);

// Step 6: Also find glosses where the root word doesn't appear in official BOM at all
// These might be non-BOM vocabulary
console.log('\n=== GLOSSES WITH NON-BOM VOCABULARY (top 30) ===\n');
const nonBom = [];
for (const [heb, glosses] of wordMap) {
  const total = [...glosses.values()].reduce((s,v) => s+v, 0);
  if (total < 5) continue;
  for (const [gloss, count] of glosses) {
    if (count < 3) continue;
    const mainWord = gloss.replace(/^(the-|a-|to-|and-|in-|of-|from-|by-|for-|with-)/, '');
    if (mainWord.length > 3 && !officialWordFreq.has(mainWord) && !officialWordFreq.has(mainWord + 's')) {
      nonBom.push({ heb, gloss, count, mainWord });
    }
  }
}
nonBom.sort((a,b) => b.count - a.count);
for (let i = 0; i < Math.min(30, nonBom.length); i++) {
  const { heb, gloss, count, mainWord } = nonBom[i];
  console.log(`${count}x ${heb} → "${gloss}" (word "${mainWord}" not in official BOM)`);
}
