const fs = require('fs');
const c = fs.readFileSync('BOM.html', 'utf8');

// Find Alma 41 data section
const start = c.indexOf('const al_ch41Verses');
const end = c.indexOf('const al_ch42Verses');
if (start === -1 || end === -1) {
  console.log('Could not find al_ch41Verses or al_ch42Verses');
  process.exit(1);
}

const section = c.substring(start, end);
console.log('Section length:', section.length, 'chars');

// Find ALL word-gloss pairs
const re = /\["([^"]+)","([^"]*?)"\]/g;
let m;
const allPairs = [];
while ((m = re.exec(section)) !== null) {
  allPairs.push({ word: m[1], gloss: m[2], full: m[0] });
}
console.log('Total word pairs:', allPairs.length);

// Find ??? entries
const qqq = allPairs.filter(p => p.gloss === '???');
console.log('\n=== ??? entries:', qqq.length, '===');
qqq.forEach(p => console.log(p.word, '->', p.gloss));

// Find suspicious: short, no hyphens, looks like transliteration
const common = new Set(['I','He','God','Lo','Do','Go','In','On','It','No','We','Be','So','At','My','Up','Or','As','If','All','And','But','For','Not','The','His','Her','You','Who','Was','Has','Had','Can','Did','One','Two','Say','See','Set','Now','May','Let','Put','Get','Got','Man','Men','Day','Way','New','Old','Yet','Too','Son','Own','End','Far','Few','Big','Bad','Hot','Nor','Woe','Out','Yea','Nay']);
const suspicious = allPairs.filter(p => {
  if (p.gloss === '???' || p.gloss === '' || p.gloss === '׃') return false;
  // Looks like a transliteration: short capitalized, no hyphens or spaces
  if (/^[A-Z][a-zA-Z]{0,10}$/.test(p.gloss) && !common.has(p.gloss)) return true;
  return false;
});
console.log('\n=== Suspicious transliteration glosses:', suspicious.length, '===');
suspicious.forEach(p => console.log(p.word, '->', p.gloss));
