const fs = require('fs');
const c = fs.readFileSync('BOM.html', 'utf8');

// Find ALL word-gloss pairs in BOM.html
const re = /\["([^"]+)","([^"]*?)"\]/g;
let m;
const common = new Set(['I','He','God','Lo','Do','Go','In','On','It','No','We','Be','So','At','My','Up','Or','As','If','All','And','But','For','Not','The','His','Her','You','Who','Was','Has','Had','Can','Did','One','Two','Say','See','Set','Now','May','Let','Put','Get','Got','Man','Men','Day','Way','New','Old','Yet','Too','Son','Own','End','Far','Few','Big','Bad','Hot','Nor','Woe','Out','Yea','Nay','Run','Cut','Eat','Die','Lie','Sit','Win','Arm','Eye','Ear','Age','Air','Boy','Cry','Fly','Joy','Law','Lot','Low','Map','Nor','Red','Sea','Sin','Six','Ten','Top','Try','War','Wet','Why','Bow','Cup','Fit','Gap','Hit','Key','Mix','Net','Odd','Pay','Pin','Raw','Row','Sum','Sun','Tie','Tip','Use','Van','Via','Wet']);

const suspicious = [];
while ((m = re.exec(c)) !== null) {
  const word = m[1];
  const gloss = m[2];
  if (gloss === '???' || gloss === '' || gloss === '׃') continue;
  // Looks like a transliteration: short, mixed case, no hyphens/spaces, not a common English word
  if (/^[A-Z][a-zA-Z]{0,12}$/.test(gloss) && !common.has(gloss)) {
    suspicious.push({ word, gloss, pos: m.index });
  }
}

// Group by gloss
const byGloss = {};
suspicious.forEach(s => {
  const key = s.word + ' -> ' + s.gloss;
  if (!byGloss[key]) byGloss[key] = 0;
  byGloss[key]++;
});

console.log('Total suspicious transliteration-like glosses:', suspicious.length);
console.log('\nUnique word->gloss pairs:');
Object.entries(byGloss).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(`  ${k} (${v}x)`);
});

// Also count total ???
const qqq = (c.match(/"\?\?\?"/g) || []).length;
console.log('\nTotal ??? in BOM.html:', qqq);
