const fs = require('fs');
const bom = fs.readFileSync('C:\\Users\\chris\\Desktop\\Hebrew BOM\\BOM.html', 'utf8');
const re = /\["([^"]+)","\?\?\?"\]/g;
const words = {};
let m;
while ((m = re.exec(bom)) !== null) {
  words[m[1]] = (words[m[1]] || 0) + 1;
}
const sorted = Object.entries(words).sort((a, b) => b[1] - a[1]);
fs.writeFileSync('C:\\Users\\chris\\Desktop\\Hebrew BOM\\all_unknown_words.json', JSON.stringify(sorted, null, 2), 'utf8');
console.log('Total unique unknown words:', sorted.length);
console.log('Total ??? occurrences:', sorted.reduce((s, e) => s + e[1], 0));
console.log('Words appearing 5+ times:', sorted.filter(e => e[1] >= 5).length);
console.log('Words appearing 3+ times:', sorted.filter(e => e[1] >= 3).length);
console.log('Words appearing 2+ times:', sorted.filter(e => e[1] >= 2).length);
console.log('Words appearing 1 time:', sorted.filter(e => e[1] === 1).length);
