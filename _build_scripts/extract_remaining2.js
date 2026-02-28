const fs = require('fs');
const files = [
  { name: '3n_data.js', path: '_chapter_data/3n_data.js' },
  { name: 'et_data.js', path: '_chapter_data/et_data.js' },
  { name: 'he_data.js', path: '_chapter_data/he_data.js' },
];

files.forEach(f => {
  const content = fs.readFileSync(f.path, 'utf8');
  const re = /\["([^"]+)"\s*,\s*"\?\?\?"\]/g;
  const words = [];
  let m;
  while ((m = re.exec(content)) !== null) words.push(m[1]);
  const unique = [...new Set(words)];
  console.log(`\n=== ${f.name}: ${unique.length} unique remaining ===`);
  unique.slice(0, 200).forEach(w => console.log(w));
});
