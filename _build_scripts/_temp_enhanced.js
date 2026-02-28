// Enhanced transliteration finder - COMPREHENSIVE VERSION
// Catches ALL remaining transliterations including those with valid English phonotactics
//
// Rules:
// R1-R5: Phonotactic rules (high precision)
// R6: Non-English phonology (triple consonants, impossible starts)
// R8: Single-word capitalized gloss NOT in known words
// R9: Compound gloss segment that is capitalized, NOT in known words,
//     NOT in comprehensive English dictionary, and NOT a name variant

const fs = require('fs');
const content = fs.readFileSync(__dirname + '/../_chapter_data/al_data.js', 'utf8');
const lines = content.split('\n');

// ===================== BUILD KNOWN WORD SET FROM FREQUENCY =====================
const wordCounts = new Map();
const glossCounts = new Map(); // count full glosses too
const pairRe = /\["([^"]+)","([^"]*)"\]/g;
let pm;
while ((pm = pairRe.exec(content)) !== null) {
  const gloss = pm[2];
  if (!gloss) continue;
  glossCounts.set(gloss, (glossCounts.get(gloss) || 0) + 1);
  const clean = gloss.replace(/^\[ACC\]-?/, '').replace(/^\[ACC\] /, '');
  const parts = clean.split('-');
  for (const part of parts) {
    let p = part.replace(/[!?.:;,)]+$/, '').replace(/\([^)]*\)/g, '').replace(/'/g, '');
    if (p.length >= 2 && /^[A-Za-z]/.test(p)) {
      wordCounts.set(p, (wordCounts.get(p) || 0) + 1);
    }
  }
}
const knownWords = new Set();
for (const [word, count] of wordCounts) {
  if (count >= 3) knownWords.add(word);
}

// Rare but valid English words and proper names
const rareButValid = [
  'God','Lord','Holy','Spirit','Lamb','Begotten','Only','Most','High','Mighty',
  'Adversary','Christians','Reeds','Messiah','Christ','Jesus','Counselor',
  'Mary','Himself','Herself','Thee','Maher','Prince','Peace',
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
  // Additional BOM names
  'Gehenna','Eden','Urim','Thummim','Jesse','Shiblom','Lemuelites',
  'Ammonihahites','Ghost','Creator','Eternal','Savior',
  'One',
  'YHWH','ACC','LORD','GOD','Thy',
  'things','flocks','hungry','swords','slings','depths','brings','rights',
  'thirsty','myself','myself','holy','precious','thirty','ninth','sixth','fifth',
  'seventh','eighth','tenth','once','twice',
];
for (const w of rareButValid) knownWords.add(w);
// Also add possessive forms
for (const w of rareButValid) {
  if (/^[A-Z]/.test(w)) knownWords.add(w + "'s");
  if (/^[A-Z]/.test(w)) knownWords.add(w + "s");
}

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
  // Additional valid compound glosses
  'son-of-Gehenna','to-the-garden-of-Eden','the-Prince-of-Peace',
  'from-the-Ammonihahites','the-Holy-Ghost-led-them',
  'the-Creator-of','the-Eternal','a-Savior-of',
  'the-Urim','that-to-Jesse','and-the-Lemuelites',
  "Alma's","from-Alma's",
  'and-Shiblom','the-Shiblom',
]);

// ===================== PHONOTACTIC RULES =====================
function phonotacticCheck(word) {
  const vowels = (word.match(/[aeiouAEIOU]/g) || []).length;
  const len = word.length;
  const ratio = vowels / len;

  if (/^Oi[bcdfghjklmnpqrstvwxyz]/i.test(word) && len >= 4) {
    if (/^oil/i.test(word)) return false;
    return 'R1';
  }
  if (/^V[bcdfghjklmnpqrstvwxyz]/i.test(word) && len >= 3) {
    if (/^v[aeiou]/i.test(word)) return false;
    return 'R2';
  }
  if (len >= 3 && vowels === 0) {
    if (/^(YHWH|ACC|LORD|GOD|Mr|Mrs|Dr|Jr|Sr|St|Mt|Pt|Ft|pl|sg|etc|NB|cf|gym|hymn|lynx|myth|nymph|rhythm|tryst|crypt|glyph|psych|pygmy|synth|gypsy|dry|fly|fry|ply|pry|shy|sky|sly|spy|sty|try|why|thy|wry|cry)$/i.test(word)) return false;
    return 'R3';
  }
  if (/kh[aeiou]/i.test(word) && len >= 5 && ratio < 0.35) {
    if (/^(khaki|ankh|sheikh|sikh|backhand|blockhead)/i.test(word)) return false;
    return 'R4';
  }
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
  if (/[bcdfghjklmnpqrstvwxyz]{3}/.test(w)) return true;
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

// ===================== IS THIS A KNOWN WORD? =====================
function isKnownWord(word) {
  if (knownWords.has(word)) return true;
  // Check without possessive
  if (word.endsWith("'s")) {
    const base = word.slice(0, -2);
    if (knownWords.has(base)) return true;
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
      if (isKnownWord(p)) continue;
      const rule = phonotacticCheck(p);
      if (rule) {
        addResult(lineNum, hebrew, gloss, p, rule);
        found = true;
        break;
      }
    }
    if (found) continue;

    // PASS 2: Non-English phonology for capitalized unknown words
    for (const part of parts) {
      let p = part.replace(/[!?.:;,)]+$/, '').replace(/\([^)]*\)/g, '').replace(/'/g, '');
      if (p.length < 3) continue;
      if (isKnownWord(p)) continue;
      if (!/^[A-Z]/.test(p)) continue;
      if (hasNonEnglishPhonology(p)) {
        addResult(lineNum, hebrew, gloss, p, 'R6');
        found = true;
        break;
      }
    }
    if (found) continue;

    // PASS 3: Single-word capitalized gloss NOT in known words
    // Strip trailing period/punctuation for matching
    let gClean = g.replace(/[.!?;:)]+$/, '');
    if (/^[A-Z][a-zA-Z]*$/.test(gClean) && gClean.length >= 3 && !isKnownWord(gClean)) {
      addResult(lineNum, hebrew, gloss, gClean, 'R8');
      continue;
    }
    // PASS 3b: 2-letter capitalized glosses that are transliterations
    // These are full glosses (not compound) that are exactly 2 chars: Uppercase + lowercase
    // Exclude common English 2-letter words
    const english2Letter = new Set(['He','Me','We','My','So','Do','Go','Be','In','On','Up','An','At','By','If','It','Of','Or','Is','Am','As','Us','Hi','Oh','Ok','Ah','Ha','Lo']);
    if (/^[A-Z][a-z]$/.test(gClean) && !english2Letter.has(gClean) && !isKnownWord(gClean)) {
      addResult(lineNum, hebrew, gloss, gClean, 'R10');
      continue;
    }
    // PASS 3c: Single uppercase letter glosses that are transliterations
    // Valid single-letter English glosses: "I", "O", "A", "a"
    const validSingleLetter = new Set(['I','O','A','a']);
    if (/^[A-Z]$/.test(gClean) && !validSingleLetter.has(gClean)) {
      addResult(lineNum, hebrew, gloss, gClean, 'R11');
      continue;
    }

    // PASS 4: Compound gloss with transliteration segments (3+ chars)
    // Only flag if the segment is clearly NOT English (short, unusual patterns)
    // AND not a known name variant (ending in -ites, -ite, etc.)
    for (const part of parts) {
      let p = part.replace(/[!?.:;,)]+$/, '').replace(/\([^)]*\)/g, '').replace(/'/g, '');
      if (p.length < 3) continue;
      if (isKnownWord(p)) continue;
      if (!/^[A-Z]/.test(p)) continue;
      // Skip name variants (ending in common suffixes)
      if (/(?:ites?|ians?|ese|ish|ism|ist|ment|ness|able|ible|tion|sion|ous|ful|less|ling|ling|ary|ory|ery|ive|ure|ate|ize|ify|ence|ance)$/i.test(p)) continue;
      // Skip if it's a possessive of a known name
      if (p.endsWith("s") && isKnownWord(p.slice(0, -1))) continue;
      addResult(lineNum, hebrew, gloss, p, 'R9');
      found = true;
      break;
    }
    if (found) continue;

    // PASS 5: Compound gloss with 1-2 letter transliteration segments
    // Only flag capitalized 1-2 letter segments that are NOT common English words
    const validShortCompound = new Set(['I','O','A','a','He','Me','We','My','So','Do','Go','Be','In','On','Up','An','At','By','If','It','Of','Or','Is','Am','As','Us','Hi','Oh','Ok','Ah','Ha','Lo','No','To']);
    for (const part of parts) {
      let p = part.replace(/[!?.:;,)]+$/, '').replace(/\([^)]*\)/g, '').replace(/'/g, '');
      if (p.length < 1 || p.length > 2) continue;
      if (!(/^[A-Z][a-z]?$/.test(p))) continue;
      if (validShortCompound.has(p)) continue;
      if (isKnownWord(p)) continue;
      addResult(lineNum, hebrew, gloss, p, 'R12');
      found = true;
      break;
    }
  }
}

results.sort((a, b) => a.lineNum - b.lineNum);

// Output
console.log('ALL TRANSLITERATION PLACEHOLDERS IN al_data.js (COMPREHENSIVE)');
console.log('Total: ' + results.length);
console.log('='.repeat(90));

const ruleCounts = {};
for (const r of results) {
  ruleCounts[r.rule] = (ruleCounts[r.rule] || 0) + 1;
}
console.log('By rule: ' + JSON.stringify(ruleCounts));
console.log('='.repeat(90));

let ch = '';
results.forEach(r => {
  for (let j = r.lineNum - 2; j >= Math.max(0, r.lineNum - 50); j--) {
    const m = lines[j].match(/ALMA.*Chapter\s+(\d+)/i) || lines[j].match(/al_ch(\d+)Verses/);
    if (m) { if (m[1] !== ch) { ch = m[1]; console.log('\n--- ALMA CHAPTER ' + ch + ' ---'); } break; }
  }
  console.log('Line ' + String(r.lineNum).padStart(4) + ':  ' + r.hebrew.padEnd(28) + ' => ' + r.gloss.padEnd(40) + ' [' + r.rule + ']');
});
