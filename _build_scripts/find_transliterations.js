// Comprehensive transliteration finder for al_data.js - DEFINITIVE FINAL VERSION
//
// Strategy: Multi-rule approach
// R1-R5: High-precision phonotactic rules (from earlier iterations)
// R6: Single-word gloss with non-English phonology (triple consonants, bad starts/ends)
// R7: Capitalized word NOT in comprehensive word list AND low vowel ratio + short
//
// The word list is built from: all words appearing 3+ times in glosses (=definitely English/names)
// PLUS a manual list of rare but valid English words that appear in BOM glosses.

const fs = require('fs');
const content = fs.readFileSync(__dirname + '/../_chapter_data/al_data.js', 'utf8');
const lines = content.split('\n');

// ===================== BUILD KNOWN WORD SET FROM FREQUENCY =====================
// Step 1: Count all word segments
const wordCounts = new Map();
const pairRe = /\["([^"]+)","([^"]*)"\]/g;
let pm;
while ((pm = pairRe.exec(content)) !== null) {
  const gloss = pm[2];
  if (!gloss) continue;
  const clean = gloss.replace(/^\[ACC\]-?/, '').replace(/^\[ACC\] /, '');
  const parts = clean.split('-');
  for (const part of parts) {
    let p = part.replace(/[!?.:;,)]+$/, '').replace(/\([^)]*\)/g, '').replace(/'/g, '');
    if (p.length >= 2 && /^[A-Za-z]/.test(p)) {
      wordCounts.set(p, (wordCounts.get(p) || 0) + 1);
    }
  }
}

// Step 2: Words appearing 3+ times are known-good (English or proper names)
const knownWords = new Set();
for (const [word, count] of wordCounts) {
  if (count >= 3) knownWords.add(word);
}

// Step 3: Add manual list of rare but VALID English words that appear in BOM glosses
// These are words that occur only 1-2 times but are definitely English, not transliterations
const rareButValid = [
  // Religious/BOM terms
  'God','Lord','Holy','Spirit','Lamb','Begotten','Only','Most','High','Mighty',
  'Adversary','Christians','Reeds','Messiah','Christ','Jesus','Counselor',
  'Mary','Himself','Herself','Thee','Maher',
  // All proper names (comprehensive)
  'Nephi','Mosiah','Alma','Gideon','Nehor','Manti','Zarahemla','Sidon',
  'Hermounts','Ammon','Jershon','Coriantumr','Egypt','Aaron','Limhi','Minon',
  'Zeram','Amnor','Limher','Noah','Amulon','Abinadi','Moroni','Mulek',
  'Helaman','Shiblon','Corianton','Zeezrom','Antionah','Melchizedek','Salem',
  'Abraham','Isaac','Jacob','Israel','Ammonihah','Amulek','Zoram','Zoramites',
  'Lamoni','Lehonti','Middoni','Ishmael','Ishmaelites','Gid','Teancum',
  'Pahoran','Laman','Lemuel','Lehi','Zeniff','Abish','Rabbanah','Sebus',
  'Antipus','Cumeni','Morianton','Zerahemnah','Amalickiah','Nephihah','Melek',
  'Onidah','Rameumptom','Antionum','Judea','Kishkumen','Gadianton','Mormon',
  'Ether','Shiz','Moronihah','Korihor','Omner','Himni','Ontion','Senine',
  'Seon','Shum','Limnah','Ezrom','Neas','Sheum','Antion','Anti','Helam',
  'Bountiful','Onti','Mniho','Giddonah','Jerusalem','Antiparah','Ammoron',
  'Cumorah','Riplah','Hagoth','Liahona','Lachoneus','Gidgiddoni','Zemnarihah',
  'Amlici','Antipas','Gdonh','Amlicite','Almighty','Hosts','Zion','Adam','Eve',
  'Moses','Amen','Ammonites','Lamanites','Nephites','Amalekites','Amulonites',
  'Zoramites','Amlicites','Ishmaelites','Ozzrom','Desolation','Egyptians',
  'Judah','Jordan','Jeremiah','Elijah','Joseph','Zenock','Sheol','Shelem',
  'Laban','Nephite','Manasseh','Sidom','Seninah','Senomites','Jared',
  'Coriantor','Shilom','Shemlon','Shimnilom','Sherem','Siron','Zenos',
  'Pachus','Yeshua','Aminadi','Midian','Isabel','Muloki','Amaleki',
  'Lamanite','Kidon','Zormi','Snum','Sam','Nahor',
  // English words that might appear only 1-2 times
  'YHWH','ACC','LORD','GOD','Thy',
  'things','flocks','hungry','swords','slings','depths','brings','rights',
  'thirsty','myself','myself','holy','precious','thirty','ninth','sixth','fifth',
  'seventh','eighth','tenth','once','twice',
];
for (const w of rareButValid) knownWords.add(w);

// ===================== VALID FULL GLOSSES TO SKIP =====================
const validFullGlosses = new Set([
  'after-the-order-of','as-the-order-of','their-order',
  'and-he-ordained','and-they-were-ordained','I-ordain',
  'from-opposite','in-opposition',
  'you-shall-oppose','should-be-oppressed','they-oppressed',
  'and-he-oppression',
  '[ACC] my-commandments','[ACC]-their-oppressing',
  'the-Only-Begotten','the-Only-Begotten-of',
  'in-Lamb-of','the-Lamb','the-Most-High','Most-High',
  'the-Mighty','son-of-Joseph','and-Joseph','Joseph',
  'the-Jews','Christians','Reeds',
  'that-against-Lamb-of(pl)','that-Lamb-of',
]);

// ===================== PHONOTACTIC RULES =====================
function phonotacticCheck(word) {
  const vowels = (word.match(/[aeiouAEIOU]/g) || []).length;
  const len = word.length;
  const ratio = vowels / len;

  // R1: Starts with 'Oi' + consonant (Hebrew וי prefix)
  if (/^Oi[bcdfghjklmnpqrstvwxyz]/i.test(word) && len >= 4) {
    if (/^oil/i.test(word)) return false;
    return 'R1';
  }
  // R2: V + consonant start (not va/ve/vi/vo/vu)
  if (/^V[bcdfghjklmnpqrstvwxyz]/i.test(word) && len >= 3) {
    if (/^v[aeiou]/i.test(word)) return false;
    return 'R2';
  }
  // R3: Zero vowels, 3+ chars
  if (len >= 3 && vowels === 0) {
    if (/^(YHWH|ACC|LORD|GOD|Mr|Mrs|Dr|Jr|Sr|St|Mt|Pt|Ft|pl|sg|etc|NB|cf|gym|hymn|lynx|myth|nymph|rhythm|tryst|crypt|glyph|psych|pygmy|synth|gypsy|dry|fly|fry|ply|pry|shy|sky|sly|spy|sty|try|why|thy|wry|cry)$/i.test(word)) return false;
    return 'R3';
  }
  // R4: 'kh' + vowel with low vowel ratio
  if (/kh[aeiou]/i.test(word) && len >= 5 && ratio < 0.35) {
    if (/^(khaki|ankh|sheikh|sikh|backhand|blockhead)/i.test(word)) return false;
    return 'R4';
  }
  // R5: O + impossible consonant combos
  if (len >= 4 && /^O/i.test(word)) {
    const cc = word.substring(1, 3).toLowerCase();
    const impossibleStarts = new Set([
      'bk','bm','bn','bp','bv','dk','dl','dm','dn','dp','dr','ds','dt','dv',
      'gb','gd','gf','gk','gn','gp','gr','gs','gt','gv','gz',
      'hb','hd','hf','hg','hj','hk','hl','hm','hn','hp','hr','hs','ht','hv','hw','hz',
      'kb','kc','kd','kf','kg','kk','kl','km','kn','kp','kr','ks','kt','kv',
      'lb','lc','ld','lf','lg','lh','lk','lm','ln','lp','lr','ls','lt','lv','lz',
      'mb','mc','md','mf','mg','mh','mk','ml','mm','mn','mp','mr','ms','mt','mv',
      'nb','nc','nd','nf','ng','nh','nj','nk','nm','nn','np','nr','ns','nt','nv','nz',
      'pb','pc','pd','pf','pg','pk','pl','pm','pn','pp','pr','ps','pt','pv',
      'rb','rc','rd','rf','rg','rk','rl','rm','rn','rp','rr','rs','rt','rv','rz',
      'sf','sg','sj','sk','sl','sm','sn','sq','sr','ss','sv','sz',
      'tb','tc','td','tf','tg','tj','tk','tl','tm','tn','tp','tr','ts','tv','tw','tz',
      'zh','zn','zr','zt','zz',
    ]);
    if (impossibleStarts.has(cc)) return 'R5';
  }
  return false;
}

// ===================== NON-ENGLISH PHONOLOGY CHECK =====================
function hasNonEnglishPhonology(word) {
  const w = word.toLowerCase();

  // Triple+ consecutive consonants
  if (/[bcdfghjklmnpqrstvwxyz]{3}/.test(w)) return true;

  // Starts with consonant combo impossible in English
  if (/^[bcdfghjklmnpqrstvwxyz]{2}/.test(w)) {
    const cc = w.substring(0, 2);
    const validStarts = new Set([
      'bl','br','ch','cl','cr','dr','dw','fl','fr','gh','gl','gn','gr',
      'kn','ph','pl','pr','ps','qu','sc','sh','sk','sl','sm','sn','sp',
      'sq','st','sw','th','tr','tw','wh','wr',
    ]);
    if (!validStarts.has(cc)) return true;
  }

  return false;
}

// ===================== MAIN SCAN =====================
const results = [];
const resultKeys = new Set();

function addResult(lineNum, hebrew, gloss, badSeg, rule) {
  const key = lineNum + ':' + hebrew;
  if (!resultKeys.has(key)) {
    resultKeys.add(key);
    results.push({ lineNum, hebrew, gloss, badSeg, rule });
  }
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  const pairRegex = /\["([^"]+)","([^"]*)"\]/g;
  let match;
  while ((match = pairRegex.exec(line)) !== null) {
    const hebrew = match[1];
    const gloss = match[2];
    if (!gloss || gloss === '' || gloss === '\u05C3') continue;
    if (validFullGlosses.has(gloss)) continue;

    let g = gloss.replace(/^\[ACC\]-?/, '').replace(/^\[ACC\] /, '');
    const parts = g.split('-');
    let found = false;

    // PASS 1: Phonotactic rules R1-R5 (high precision)
    for (const part of parts) {
      let p = part.replace(/[!?.:;,)]+$/, '').replace(/\([^)]*\)/g, '').replace(/'/g, '');
      if (p.length < 3) continue;
      if (knownWords.has(p)) continue;

      const rule = phonotacticCheck(p);
      if (rule) {
        addResult(lineNum, hebrew, gloss, p, rule);
        found = true;
        break;
      }
    }
    if (found) continue;

    // PASS 2: Check for capitalized words NOT in known word list
    // that have non-English phonological features
    for (const part of parts) {
      let p = part.replace(/[!?.:;,)]+$/, '').replace(/\([^)]*\)/g, '').replace(/'/g, '');
      if (p.length < 3) continue;
      if (knownWords.has(p)) continue;
      if (!/^[A-Z]/.test(p)) continue;

      if (hasNonEnglishPhonology(p)) {
        addResult(lineNum, hebrew, gloss, p, 'R6');
        found = true;
        break;
      }
    }
    if (found) continue;

    // PASS 3: Single-word gloss that is NOT in known words and has non-English phonology
    if (/^[A-Z][a-zA-Z]*$/.test(g) && g.length >= 3 && !knownWords.has(g)) {
      if (hasNonEnglishPhonology(g)) {
        addResult(lineNum, hebrew, gloss, g, 'R7');
      }
    }
  }
}

results.sort((a, b) => a.lineNum - b.lineNum);

// Output
console.log('ALL TRANSLITERATION PLACEHOLDERS IN al_data.js');
console.log('Total: ' + results.length);
console.log('='.repeat(90));
let ch = '';
results.forEach(r => {
  for (let j = r.lineNum - 2; j >= Math.max(0, r.lineNum - 50); j--) {
    const m = lines[j].match(/ALMA.*Chapter\s+(\d+)/i) || lines[j].match(/al_ch(\d+)Verses/);
    if (m) { if (m[1] !== ch) { ch = m[1]; console.log('\n--- ALMA CHAPTER ' + ch + ' ---'); } break; }
  }
  console.log('Line ' + String(r.lineNum).padStart(4) + ':  ' + r.hebrew.padEnd(28) + ' => ' + r.gloss);
});
