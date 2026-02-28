const fs = require('fs');
const c = fs.readFileSync('BOM.html', 'utf8');

// Find Alma 41 data
const start = c.indexOf('const al_ch41Verses');
const end = c.indexOf('const al_ch42Verses');
const section = c.substring(start, end);

// Extract verse by verse
const verseRe = /\{\s*num:\s*"([^"]+)",\s*words:\s*\[([\s\S]*?)\]\s*\}/g;
let m;
while ((m = verseRe.exec(section)) !== null) {
  const verseNum = m[1];
  const wordsStr = m[2];

  // Extract word pairs
  const pairRe = /\["([^"]+)","([^"]*)"\]/g;
  let p;
  const words = [];
  while ((p = pairRe.exec(wordsStr)) !== null) {
    words.push({ hebrew: p[1], gloss: p[2] });
  }

  console.log(`\n=== Verse ${verseNum} ===`);
  words.forEach((w, i) => {
    console.log(`  ${i+1}. ${w.hebrew} = "${w.gloss}"`);
  });
}
