const fs = require('fs');

// Check BOM.html
const bom = fs.readFileSync('BOM.html', 'utf8');
const bomRe = /\["([^"]+)","([^"]*?)"\]/g;
let m;
const bomWords = [];
while ((m = bomRe.exec(bom)) !== null) {
  bomWords.push({ word: m[1], gloss: m[2] });
}

// Check external chapter data files
const extFiles = [
  '_chapter_data/he_data.js',
  '_chapter_data/3n_data.js',
  '_chapter_data/et_data.js',
  '_chapter_data/al_data.js',
];

const extWords = [];
extFiles.forEach(f => {
  try {
    const content = fs.readFileSync(f, 'utf8');
    const re = /\["([^"]+)","([^"]*?)"\]/g;
    let m2;
    while ((m2 = re.exec(content)) !== null) {
      extWords.push({ word: m2[1], gloss: m2[2], file: f });
    }
  } catch(e) {}
});

console.log('=== BOM.html ===');
console.log('Total word pairs:', bomWords.length);
const bomQQQ = bomWords.filter(w => w.gloss === '???');
console.log('??? entries:', bomQQQ.length);

// Count unique Hebrew words with ???
const bomQQQUnique = [...new Set(bomQQQ.map(w => w.word))];
console.log('Unique ??? words:', bomQQQUnique.length);

console.log('\n=== External chapter data ===');
console.log('Total word pairs:', extWords.length);
const extQQQ = extWords.filter(w => w.gloss === '???');
console.log('??? entries:', extQQQ.length);

// By file
const byFile = {};
extQQQ.forEach(w => {
  byFile[w.file] = (byFile[w.file] || 0) + 1;
});
Object.entries(byFile).forEach(([f, count]) => {
  console.log(`  ${f}: ${count} ???`);
});

const extQQQUnique = [...new Set(extQQQ.map(w => w.word))];
console.log('Unique ??? words:', extQQQUnique.length);

// Combined unique ??? words
const allQQQWords = [...new Set([...bomQQQUnique, ...extQQQUnique])];
console.log('\n=== COMBINED ===');
console.log('Total ??? entries:', bomQQQ.length + extQQQ.length);
console.log('Unique ??? Hebrew words:', allQQQWords.length);

// Show frequency distribution of unique ??? words
// How many appear 1x, 2x, 3x, etc.
const allQQQ = [...bomQQQ, ...extQQQ];
const freq = {};
allQQQ.forEach(w => {
  freq[w.word] = (freq[w.word] || 0) + 1;
});
const freqDist = {};
Object.values(freq).forEach(count => {
  freqDist[count] = (freqDist[count] || 0) + 1;
});
console.log('\nFrequency distribution of ??? words:');
Object.entries(freqDist).sort((a,b) => Number(a[0]) - Number(b[0])).forEach(([count, numWords]) => {
  console.log(`  Appears ${count}x: ${numWords} unique words`);
});

// Show top 50 most frequent ??? words
const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]);
console.log('\nTop 50 most frequent ??? words:');
sorted.slice(0, 50).forEach(([word, count]) => {
  console.log(`  ${word} (${count}x)`);
});
