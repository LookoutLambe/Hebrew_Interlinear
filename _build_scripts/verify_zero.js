const fs = require('fs');
const files = [
  'BOM.html',
  '_chapter_data/al_data.js',
  '_chapter_data/he_data.js',
  '_chapter_data/3n_data.js',
  '_chapter_data/et_data.js',
];
let total = 0;
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const count = (c.match(/"\?\?\?"/g) || []).length;
  total += count;
  console.log(`${f}: ${count} ???`);
});
console.log(`\nTOTAL ??? REMAINING: ${total}`);
