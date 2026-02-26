// Find all transliterated nonsense glosses in BOM.html
// These are glosses produced by the transliterate() function that are NOT real English
const fs = require('fs');
const bom = fs.readFileSync('BOM.html', 'utf8');

// A transliterated gloss matches this pattern:
// - Starts with uppercase letter
// - Contains only letters (no hyphens for English compound glosses)
// - Has very few vowels relative to length
// - Or contains Hebrew characters
// - Or is a hyphenated gloss where one segment is a transliteration

// Also catch: lowercase transliterations that snuck in

const re = /\["([^"]+)","([^"]*)"\]/g;
let m;
const badGlosses = {};
let total = 0;

// Known proper names that ARE transliterations but are CORRECT
const validTransliterations = new Set([
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
  'Teomner','Chemish','Abinadom','Amaron','Amaleki','ACC','YHWH','GOD',
]);

// Check if a word segment is a likely transliteration (not English)
function isTransliteration(word) {
  if (word.length < 2) return false;
  if (validTransliterations.has(word)) return false;

  // Contains Hebrew chars = definitely bad
  if (/[\u0590-\u05FF]/.test(word)) return true;

  // Pattern: starts uppercase, no vowels or very few
  // Transliterations from Hebrew look like: Btsdo, Oimsho, Hkitno, Tbshlo, etc.
  const lower = word.toLowerCase();

  // Count vowels
  const vowelCount = (lower.match(/[aeiou]/g) || []).length;
  const consonantCount = lower.length - vowelCount;

  // If 4+ chars and less than 20% vowels, it's a transliteration
  if (lower.length >= 4 && vowelCount / lower.length < 0.2) return true;

  // If has 4+ consecutive consonants, it's a transliteration
  if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(lower)) return true;

  // If starts with 3+ consonants (not English)
  if (/^[bcdfghjklmnpqrstvwxyz]{3}/i.test(lower) && lower.length >= 4) return true;

  // If ends with 3+ consonants that aren't common English endings
  if (/[bcdfghjkmnpqrtvwxyz]{3,}$/i.test(lower) &&
      !/(ght|nds|nts|rds|rns|rts|sts|lds|lts|mps|nks|sks|fts|lps|rps|pts)$/.test(lower)) return true;

  return false;
}

while ((m = re.exec(bom)) !== null) {
  const heb = m[1];
  const gloss = m[2];
  if (!gloss || gloss === '' || heb === '׃') continue;
  total++;

  let isBad = false;
  let reason = '';

  // Check the whole gloss first for Hebrew chars
  if (/[\u0590-\u05FF]/.test(gloss)) {
    isBad = true;
    reason = 'hebrew-in-gloss';
  }

  if (!isBad) {
    // Split by hyphens and check each segment
    const segments = gloss.split('-');
    for (const seg of segments) {
      if (!seg || seg.length < 3) continue;
      // Remove brackets and parens for checking
      const clean = seg.replace(/[\[\]()]/g, '');
      if (isTransliteration(clean)) {
        isBad = true;
        reason = `bad-segment: "${seg}"`;
        break;
      }
    }
  }

  if (isBad) {
    const key = heb + '||' + gloss;
    if (!badGlosses[key]) badGlosses[key] = { hebrew: heb, gloss, reason, count: 0 };
    badGlosses[key].count++;
  }
}

const sorted = Object.values(badGlosses).sort((a, b) => b.count - a.count);
const totalBad = sorted.reduce((s, e) => s + e.count, 0);

console.log('Total glosses scanned:', total);
console.log('Bad glosses found:', sorted.length, 'unique,', totalBad, 'total occurrences');
console.log('\n--- Top 100 bad glosses ---');
sorted.slice(0, 100).forEach(s => console.log(`  "${s.gloss}" ← ${s.hebrew} x${s.count} [${s.reason}]`));
console.log('\n--- Summary by count ranges ---');
const ranges = { '10+': 0, '5-9': 0, '2-4': 0, '1': 0 };
sorted.forEach(s => {
  if (s.count >= 10) ranges['10+']++;
  else if (s.count >= 5) ranges['5-9']++;
  else if (s.count >= 2) ranges['2-4']++;
  else ranges['1']++;
});
console.log(ranges);

fs.writeFileSync('bad_glosses.json', JSON.stringify(sorted, null, 2));
console.log('\nSaved bad_glosses.json');
