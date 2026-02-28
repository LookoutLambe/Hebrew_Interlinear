const fs = require('fs');
const c = fs.readFileSync('BOM.html', 'utf8');

// Count total ??? in BOM.html
const total = (c.match(/"\?\?\?"/g) || []).length;
console.log('Total ??? in BOM.html:', total);

// Find Alma 41 section bounds
const start41 = c.indexOf('panel-al-ch41');
const start42 = c.indexOf('panel-al-ch42');
console.log('Alma 41 section: char', start41, 'to', start42);

const section41 = c.substring(start41, start42);
const q41 = (section41.match(/"\?\?\?"/g) || []).length;
console.log('??? in Alma 41:', q41);

// Find ALL word-gloss pairs in Alma 41
const re = /\["([^"]+)","([^"]+)"\]/g;
let m;
const allGlosses = [];
while ((m = re.exec(section41)) !== null) {
  allGlosses.push([m[1], m[2]]);
}
console.log('Total word pairs in Alma 41:', allGlosses.length);

// Find ??? entries
const qqqEntries = allGlosses.filter(([w, g]) => g === '???');
console.log('\n=== ??? entries in Alma 41 ===');
qqqEntries.forEach(([w, g]) => console.log(w, '->', g));

// Find suspicious short transliteration-like glosses
const suspicious = allGlosses.filter(([w, g]) => {
  if (g === '???') return false;
  // Short (1-6 chars), starts uppercase, no hyphens - likely transliteration not gloss
  if (/^[A-Z][a-z]{0,5}$/.test(g)) {
    const common = ['I','He','God','Lo','Do','Go','In','On','It','No','We','Be','So','At','My','Up','Or','As','If','All','And','But','For','Not','The','His','Her','You','Who','Was','Has','Had','Can','Did','One','Two','Say','See','Set','Now','May','Let','Put','Get','Got','Man','Men','Day','Way','New','Old','Yet','Too','Son','Own','End','Far','Few','Big','Bad','Hot','Nor'];
    return !common.includes(g);
  }
  return false;
});
console.log('\n=== Suspicious transliteration glosses in Alma 41 ===');
suspicious.forEach(([w, g]) => console.log(w, '->', g));
