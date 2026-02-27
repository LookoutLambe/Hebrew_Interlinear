const fs = require('fs');
const files = ['_chapter_data/al_data.js','_chapter_data/he_data.js','_chapter_data/3n_data.js','_chapter_data/et_data.js'];
const good = new Set(['Isaac','Isaiah','Orihah','Onihah','Only-Begotten','Ishmael','Egypt','Onidah','Isabel','Omer','Ogath']);
for (const file of files) {
  const content = fs.readFileSync(file,'utf8');
  const re = /\["([^"]+)","([^"]*)"\]/g;
  let m;
  const found = [];
  while ((m = re.exec(content)) !== null) {
    const gloss = m[2];
    if (!gloss || m[1] === '\u05C3') continue;
    // Detect transliteration patterns
    let isBad = false;
    if (/^Oi[a-z]/.test(gloss)) isBad = true;
    if (/^O[bcdfghjklmnpqrstvwxyz][a-z]/.test(gloss)) isBad = true;
    if (/^I[bcdfghjklmnpqrstvwxyz][a-z]*$/.test(gloss) && gloss.length >= 3) isBad = true;
    if (/^[A-Z][a-z]{1,4}$/.test(gloss) && !/^(the|and|for|but|all|our|may|who|him|her|let|has|was|had|did|own|say|set|put|ran|got|God|not)$/i.test(gloss)) {
      // Short capitalized word - check if it looks like transliteration
      if (/[bcdfghjklmnpqrstvwxyz]{3}/.test(gloss.toLowerCase())) isBad = true;
    }
    // Skip known good
    if (/^(Other|Over|Order|Out|Into|Israel|Iron|Ishi)/.test(gloss)) isBad = false;
    if (good.has(gloss)) isBad = false;

    if (isBad) {
      const key = m[1]+'|'+gloss;
      if (!found.find(f => f[2] === key)) found.push([m[1], gloss, key]);
    }
  }
  if (found.length > 0) {
    console.log('--- ' + file + ' (' + found.length + ' unique) ---');
    for (const [h,g] of found) console.log('  "'+h+'" => "'+g+'"');
  }
}
