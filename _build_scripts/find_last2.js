const fs = require('fs');
const c = fs.readFileSync('_chapter_data/al_data.js', 'utf8');
const re = /\["([^"]+)","\?\?\?"\]/g;
let m;
while ((m = re.exec(c)) !== null) {
  // Find surrounding context to identify the chapter/verse
  const before = c.substring(Math.max(0, m.index - 200), m.index);
  const chMatch = before.match(/al_ch(\d+)/g);
  const ch = chMatch ? chMatch[chMatch.length - 1] : 'unknown';
  console.log(`Word: ${m[1]}`);
  console.log(`Chapter context: ${ch}`);
  console.log(`Full match: ${m[0]}`);
  console.log('---');
}
