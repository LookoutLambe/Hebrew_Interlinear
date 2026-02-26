const data = JSON.parse(require('fs').readFileSync('real_bad_translits.json','utf8'));
// Filter out false positives (valid English words that start with uppercase)
const falsePos = ['Mighty','Almighty','Christs','Christ','Lord','Israel'];
const real = data.filter(d => !falsePos.some(fp => d.badSeg === fp || d.badSeg === fp+'(pl)'));
console.log('After removing false positives:', real.length, 'unique,', real.reduce((s,e)=>s+e.count,0), 'total');

// Group by Hebrew root patterns
console.log('\nAll remaining to fix:');
real.forEach(r => console.log(`  ${r.hebrew}\t"${r.gloss}"\tx${r.count}`));
