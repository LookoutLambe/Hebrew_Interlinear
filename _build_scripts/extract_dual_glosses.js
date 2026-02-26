// Extract Hebrew-English ruby gloss pairs from the dual BOM document.xml
const fs = require('fs');

const docXml = fs.readFileSync('C:\\Users\\chris\\AppData\\Local\\Temp\\dual_bom_extracted\\word\\document.xml', 'utf8');
console.log(`Document XML: ${(docXml.length/1024/1024).toFixed(1)}MB`);

function stripNiqqud(s) { return s.replace(/[\u0591-\u05C7]/g, ''); }

// Check for ruby annotations
const rubyCount = (docXml.match(/<w:ruby>/g) || []).length;
console.log(`Ruby annotations: ${rubyCount}`);

// Extract ruby pairs
const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
const rubyRegex = /<w:ruby>([\s\S]*?)<\/w:ruby>/g;
const glossMap = {};
let rm;
let pairs = 0;

while ((rm = rubyRegex.exec(docXml)) !== null) {
  const rubyContent = rm[1];
  const rtMatch = rubyContent.match(/<w:rt>([\s\S]*?)<\/w:rt>/);
  const baseMatch = rubyContent.match(/<w:rubyBase>([\s\S]*?)<\/w:rubyBase>/);

  if (rtMatch && baseMatch) {
    const rtTexts = [];
    const baseTexts = [];
    let t;

    tRegex.lastIndex = 0;
    while ((t = tRegex.exec(rtMatch[1])) !== null) rtTexts.push(t[1]);
    tRegex.lastIndex = 0;
    while ((t = tRegex.exec(baseMatch[1])) !== null) baseTexts.push(t[1]);

    const gloss = rtTexts.join('').trim();
    const hebrew = baseTexts.join('').trim();

    if (gloss && hebrew) {
      const stripped = stripNiqqud(hebrew);
      if (!glossMap[stripped]) {
        glossMap[stripped] = { gloss, original: hebrew };
        pairs++;
      }
    }
  }
}

console.log(`Extracted ${pairs} unique ruby gloss pairs`);

// Also check paragraph structure for non-ruby interlinear
// Look for adjacent Hebrew and English text segments
const paraRegex = /<w:p[ >]([\s\S]*?)<\/w:p>/g;
let pm;
let sampleParas = 0;
const hebrewParas = [];
const englishParas = [];

while ((pm = paraRegex.exec(docXml)) !== null) {
  const texts = [];
  tRegex.lastIndex = 0;
  let t;
  while ((t = tRegex.exec(pm[1])) !== null) texts.push(t[1]);
  const text = texts.join('').trim();
  if (!text) continue;

  if (/[\u0590-\u05FF]/.test(text)) {
    hebrewParas.push(text);
  } else if (/^[A-Za-z]/.test(text) && text.length > 10) {
    englishParas.push(text);
  }
}

console.log(`Hebrew paragraphs: ${hebrewParas.length}`);
console.log(`English paragraphs: ${englishParas.length}`);

// Show samples
if (pairs > 0) {
  console.log('\n=== Sample Ruby Gloss Pairs ===');
  const entries = Object.entries(glossMap);
  entries.slice(0, 50).forEach(([stripped, {gloss, original}]) =>
    console.log(`  ${original} (${stripped}) -> "${gloss}"`)
  );

  // Save full map
  const simpleMap = {};
  for (const [stripped, {gloss}] of Object.entries(glossMap)) {
    simpleMap[stripped] = gloss;
  }
  fs.writeFileSync('dual_bom_glosses.json', JSON.stringify(simpleMap, null, 2));
  console.log(`\nSaved ${Object.keys(simpleMap).length} glosses to dual_bom_glosses.json`);
} else {
  console.log('\nNo ruby annotations found. Checking other structures...');
  // Show sample paragraphs
  console.log('\nSample Hebrew paragraphs:');
  hebrewParas.slice(0, 5).forEach((p, i) => console.log(`  ${i}: ${p.substring(0, 200)}`));
  console.log('\nSample English paragraphs:');
  englishParas.slice(0, 5).forEach((p, i) => console.log(`  ${i}: ${p.substring(0, 200)}`));
}
