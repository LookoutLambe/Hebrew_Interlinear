const fs = require('fs');
let bom = fs.readFileSync('BOM.html', 'utf8');

// Last 2 genuinely bad transliterations
const fixes = [
  ['"what-Tchptsv"', '"what-you-desire"'],
  ['"and-do-not-Tdmv"', '"and-do-not-imagine"'],
];

let count = 0;
for (const [bad, good] of fixes) {
  while (bom.includes(bad)) {
    bom = bom.replace(bad, good);
    count++;
  }
}

console.log(`Fixed ${count}`);
fs.writeFileSync('BOM.html', bom, 'utf8');
console.log('Done');
