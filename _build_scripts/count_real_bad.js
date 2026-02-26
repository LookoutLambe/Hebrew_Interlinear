// Count ONLY genuinely bad transliteration artifacts - the Hshlko/Nbchro type
// NOT English words, NOT proper names, NOT gender markers
const fs = require('fs');
const bom = fs.readFileSync('BOM.html', 'utf8');

// Known BOM proper names
const properNames = new Set([
  'Nephi','Moroni','Mormon','Mosiah','Alma','Helaman','Ether','Lehi','Jacob',
  'Enos','Jarom','Omni','Ammon','Aaron','Coriantumr','Limhi','Zeniff','Noah',
  'Abinadi','Gideon','Amulek','Zeezrom','Korihor','Pahoran','Teancum',
  'Lachoneus','Giddianhi','Gidgiddoni','Kishkumen','Gadianton','Amalickiah',
  'Lamoni','Abish','Jared','Nimrod','Omer','Heth','Shule','Riplakish',
  'Morianton','Lib','Shiz','Gilgal','Bountiful','Zarahemla','Melek',
  'Ammonihah','Jershon','Manti','Mulek','Cumorah','Jerusalem','Eden',
  'Sidon','Israel','Ishmael','Laman','Lemuel','Sam','Sariah','Zoram',
  'Hagoth','Shiblon','Corianton','Timothy','Jonas','Zedekiah','Isaiah',
  'Christ','Jesus','Mary','Joseph','Moses','Adam','Eve','Abel','Cain',
  'Enoch','David','Solomon','Elijah','Malachi','Samuel','Abraham','Seth',
  'Zion','Egypt','Babylon','Lehonti','Nephihah','Moronihah','Amulon',
  'Zerah','Shared','Shez','Com','Gid','Anti','Liahona','Irreantum',
  'Deseret','Shelem','Ablom','Akish','Comnor','Corihor','Rameumptom',
  'Shilom','Smith','Antipus','Aminadab','Aminadi','Amlici','Cezoram',
  'Coriantor','Cumeni','Ethem','Gimgimno','Hearthom','Hermounts',
  'Himni','Isabel','Jacobugath','Kish','Laban','Middoni','Mocum',
  'Moron','Muloki','Nahom','Nehor','Ogath','Onidah','Orihah',
  'Paanchi','Pachus','Pacumeni','Riplah','Ripliancum','Seantum',
  'Sebus','Shem','Shemlon','Sherem','Sherrizah','Shiblom','Shim',
  'Shimnilom','Shurr','Sidom','Tubaloth','Zerahemnah','Zemnarihah',
  'Zenephi','Zenock','Zenos','Zeram','Neas','Bethabara','Josh',
  'Judea','Kim','Heshlon','Boaz','Minon','Pagag','Hem','Nimrod',
  'Esrom','Amnor','Amnihu','Luram','Gad','Emron','Antum','Ramath',
  'Teomner','Chemish','Abinadom','Amaron','Amaleki','Sheol',
  'Yeshua','Benjamin','Messiah','Snum',
  'ACC','YHWH','GOD','LORD',
  // Demonyms
  'Lamanite','Lamanites','Nephite','Nephites','Amalekite','Amalekites',
  'Zoramite','Zoramites','Mulekite','Mulekites','Jaredite','Jaredites',
  'Gentile','Gentiles','Ammonite','Ammonites','Ishmaelite','Ishmaelites',
  'Jacobite','Josephite','Lemuelite','Egyptian','Egyptians','Assyria','Assyrian',
]);

// Is this segment a transliterate() output? (NOT English, NOT a name)
// transliterate() output has these characteristics:
// 1. Starts with uppercase (always), rest lowercase
// 2. Uses specific Hebrew→English mappings: B,G,D,H,O,Z,Ch,T,I,K,L,M,N,S,O,P/F,Ts,K,R,Sh,T
// 3. Very consonant-heavy because Hebrew is written mostly with consonants
// 4. Does NOT look like any English word

function isTransliterateOutput(seg) {
  if (seg.length < 3) return false;
  // Remove brackets/parens
  const clean = seg.replace(/[[\]()]/g, '');
  if (!clean || clean.length < 2) return false;

  // Must start with uppercase
  if (!/^[A-Z]/.test(clean)) return false;

  // Must be all letters (transliterate outputs are pure letters)
  if (!/^[A-Za-z]+$/.test(clean)) return false;

  // Skip proper names
  if (properNames.has(clean)) return false;

  const lower = clean.toLowerCase();
  const vowelCount = (lower.match(/[aeiou]/g) || []).length;
  const ratio = vowelCount / lower.length;

  // Very consonant-heavy = transliterate output
  // Hebrew transliterations typically have < 20% vowels
  if (lower.length >= 4 && ratio < 0.2) return true;

  // 4+ consecutive consonants = not English
  if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(lower)) return true;

  // Starts with 3+ consonants (very rare in English)
  if (/^[bcdfghjklmnpqrstvwxyz]{3}/i.test(lower) && lower.length >= 4) return true;

  return false;
}

function hasHebrewChars(s) {
  return /[\u0590-\u05FF]/.test(s);
}

const re = /\["([^"]+)","([^"]*)"\]/g;
let m;
const badTranslits = {};
const hebrewInGloss = {};
let total = 0;

while ((m = re.exec(bom)) !== null) {
  const heb = m[1];
  const gloss = m[2];
  if (!gloss || gloss === '' || heb === '׃') continue;
  total++;

  // Check Hebrew chars in gloss
  if (hasHebrewChars(gloss)) {
    const key = heb + '||' + gloss;
    if (!hebrewInGloss[key]) hebrewInGloss[key] = { hebrew: heb, gloss, count: 0 };
    hebrewInGloss[key].count++;
    continue;
  }

  // Check for transliterate() output segments
  const segs = gloss.split('-');
  for (const seg of segs) {
    if (isTransliterateOutput(seg)) {
      const key = heb + '||' + gloss;
      if (!badTranslits[key]) badTranslits[key] = { hebrew: heb, gloss, badSeg: seg, count: 0 };
      badTranslits[key].count++;
      break;
    }
  }
}

const hebSorted = Object.values(hebrewInGloss).sort((a, b) => b.count - a.count);
const hebTotal = hebSorted.reduce((s, e) => s + e.count, 0);

const badSorted = Object.values(badTranslits).sort((a, b) => b.count - a.count);
const badTotal = badSorted.reduce((s, e) => s + e.count, 0);

console.log('Total glosses:', total);
console.log('\n=== Hebrew chars in gloss ===');
console.log('Unique:', hebSorted.length, ' Total:', hebTotal);
if (hebSorted.length > 0) {
  console.log('Top 20:');
  hebSorted.slice(0, 20).forEach(s => console.log(`  "${s.gloss}" ← ${s.hebrew} x${s.count}`));
}

console.log('\n=== Transliterate() output artifacts ===');
console.log('Unique:', badSorted.length, ' Total:', badTotal);
console.log('\nTop 100:');
badSorted.slice(0, 100).forEach(s => console.log(`  "${s.gloss}" [bad: ${s.badSeg}] ← ${s.hebrew} x${s.count}`));

console.log('\n--- Distribution ---');
const ranges = { '10+': 0, '5-9': 0, '2-4': 0, '1': 0 };
badSorted.forEach(s => {
  if (s.count >= 10) ranges['10+']++;
  else if (s.count >= 5) ranges['5-9']++;
  else if (s.count >= 2) ranges['2-4']++;
  else ranges['1']++;
});
console.log(ranges);

// Save for fixing
fs.writeFileSync('real_bad_translits.json', JSON.stringify(badSorted, null, 2));
console.log('\nSaved real_bad_translits.json');
