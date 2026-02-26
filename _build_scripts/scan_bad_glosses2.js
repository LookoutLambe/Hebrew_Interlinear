// Scan for TRULY bad glosses only:
// 1. Contains Hebrew characters in the gloss
// 2. Pure transliterations (consonant-heavy nonsense like "Ttn", "Hshb", "Mkrb")
// NOT flagging: real English words, proper names, or gender-marked glosses
const fs = require('fs');
const bom = fs.readFileSync('BOM.html', 'utf8');

// Known Book of Mormon proper names (transliterations that are correct)
const knownNames = new Set([
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
  'Judea','Kim','Heshlon','Boaz','Minon','Pagag','Noah','Hem',
  'Esrom','Amnor','Amnihu','Luram','Gad','Emron','Antum','Ramath',
  'Teomner','Chemish','Abinadom','Amaron','Amaleki',
]);

// Common English words/glosses to NOT flag
const englishWords = new Set(fs.readFileSync('/dev/stdin', 'utf8').split('\n').map(w=>w.trim()).filter(Boolean));

const re = /\["([^"]+)","([^"]*)"\]/g;
let m;
const badGlosses = {};
let total = 0;

// Simple English word check - does this look like an English word?
function isEnglishLike(word) {
  if (word.length <= 1) return true;
  const lower = word.toLowerCase();
  // Has reasonable vowel distribution for English
  const vowels = (lower.match(/[aeiou]/g) || []).length;
  const ratio = vowels / lower.length;
  // English words typically have 25-60% vowels
  // Transliterations from Hebrew have very few vowels
  return ratio >= 0.2;
}

while ((m = re.exec(bom)) !== null) {
  const heb = m[1];
  const gloss = m[2];
  if (!gloss || gloss === '' || heb === '׃') continue;
  total++;

  let isBad = false;
  let reason = '';

  // 1. Contains Hebrew characters — definitely broken
  if (/[\u0590-\u05FF]/.test(gloss)) {
    isBad = true;
    reason = 'hebrew-in-gloss';
  }

  // 2. Pure transliteration check: look for words that are NOT English
  if (!isBad) {
    const parts = gloss.split('-');
    for (const part of parts) {
      if (!part || part.length < 3) continue;
      // Skip if contains parentheses (gender markers), slashes, brackets
      if (/[()\/\[\]]/.test(part)) continue;
      // Skip known proper names
      if (knownNames.has(part)) continue;
      // Skip if it starts with uppercase and looks like a name (has vowels)
      if (/^[A-Z][a-z]+$/.test(part) && isEnglishLike(part)) continue;
      // Skip if all lowercase and looks English
      if (/^[a-z]+$/.test(part) && isEnglishLike(part)) continue;

      // FLAG: Consonant-heavy words that don't look English
      const lower = part.toLowerCase();
      const vowels = (lower.match(/[aeiou]/g) || []).length;
      const ratio = vowels / lower.length;

      // Very low vowel ratio AND length > 3 = likely transliteration
      if (ratio < 0.15 && lower.length > 3) {
        isBad = true;
        reason = `transliteration: "${part}"`;
        break;
      }
      // Consonant cluster of 4+ = not English
      if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(lower)) {
        isBad = true;
        reason = `consonant-cluster: "${part}"`;
        break;
      }
      // Starts with multiple consonants in non-English way
      if (/^[bcdfghjklmnpqrstvwxyz]{3,}/i.test(lower) && lower.length > 3) {
        isBad = true;
        reason = `non-english-start: "${part}"`;
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
console.log('Genuinely bad glosses:', sorted.length, 'unique,', totalBad, 'total occurrences');
console.log('\n--- Bad glosses ---');
sorted.forEach(s => console.log(`  "${s.gloss}" ← ${s.hebrew} x${s.count} [${s.reason}]`));

fs.writeFileSync('bad_glosses.json', JSON.stringify(sorted, null, 2));
