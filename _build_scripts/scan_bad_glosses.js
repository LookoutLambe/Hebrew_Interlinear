const fs = require('fs');
const path = require('path');

const files = [
  {name: 'al_data.js', path: path.join(__dirname, '..', '_chapter_data', 'al_data.js')},
  {name: 'he_data.js', path: path.join(__dirname, '..', '_chapter_data', 'he_data.js')},
  {name: '3n_data.js', path: path.join(__dirname, '..', '_chapter_data', '3n_data.js')},
  {name: 'et_data.js', path: path.join(__dirname, '..', '_chapter_data', 'et_data.js')}
];

// Known proper names in BOM that look like transliterations but are valid
const knownNames = new Set([
  'Nephi','Lehi','Alma','Mosiah','Moroni','Mormon','Ammon','Helaman',
  'Zarahemla','Gideon','Nehor','Manti','Amlicite','Amlicites','Limhi',
  'Sidon','Lamanites','Nephites','Coriantum','Coriantor','Ether','Jared',
  'Benjamin','Aaron','Laban','Moron','Ethem','Ahah','Seth','Shiblon',
  'Com','Kim','Kib','Orihah','Shule','Omer','Emer','Levi','Corom',
  'Kish','Lib','Hearthom','Amnigaddah','Riplakish','Shiz','Heth',
  'Morianton','Nimrod','Deseret','Cezoram','Mulek','Gid','Gadianton',
  'Aminadab','Amulek','Zeezrom','Ammonihah','Samuel','Lachoneus',
  'Zoramites','Bountiful','Jerusalem','Israel','Moses','Yeshua',
  'Messiah','God','Zion','ACC','LORD','YHWH','Cumorah','Desolation',
  'Hagoth','Teancum','Kishkumen','Pahoran','Pacumeni','Helaman',
  'Shiblon','Corianton','Antionah','Giddonah','Zerahemnah',
  'Lehonti','Amalickiah','Antipas','Moriantum','Morianton',
  'Nephihah','Pachus','Jacobugath','Gilgal','Onihah','Mocum',
  'Gimgimno','Gadiomnah','Jacob','Laman','Lemuel','Sam',
  'Ishmael','Zoram','Joseph','Zeniff','Noah','Abinadi',
  'Gidianhi','Zemnarihah','Lachoneus','Timothy','Jonas',
  'Mathoni','Mathonihah','Kumen','Kumenonhi','Jeremiah',
  'Shemnon','Zedekiah','Isaiah','Christ','Jesus',
  'Abrahamic','Jacobite','Josephite','Zoramite','Ishmaelite',
  'Lamanite','Nephite','Mulekite','Anti','Omner','Himni',
  'Ammonite','Ammonites','Lehite','Lehites','Gadiantonite',
  'Antionum','Onidah','Melek','Amnihu','Mniho','Middoni',
  'Lamoni','Abish','Rameumptom',
  'Hermounts','Minon','Antipus','Judea','Angola','David',
  'Solomon','Sarah','Eve','Adam','Abel','Cain','Enoch',
  'Melchizedek','Salem','Abraham','Isaac','Zenephi',
  'Antipara','Cumeni','Zerahemnah','Amalekite','Amalekites',
  'Shiblom','Shared','Gilead','Akish','Ripliancum',
  'Ogath','Ramah','Shurr','Corihor',
  'Neum','Zenos','Zenock','Ezias',
  'Liahona','Irreantum','Nahom','Shazer',
  'Seantum','Seezoram','Tubaloth','Coriantumr',
  'Ablom','Agosh','Shelem','Aha','Pacumeni',
  'Moronihah','Comnor','Shim','Sherrizah',
  'Gaddianton','Kishkumen','Gadianton',
  'Giddianhi','Zemnarihah'
]);

const legitimateEnglish = new Set([
  'Bountiful','Redeemer','Father','Son','Holy','Spirit','King','Lord',
  'Eternal','Ancient','Almighty','Creator','Heaven','Earth','Temple',
  'Gentile','Gentiles','Prophet','Prophets','Sabbath','Passover',
  'Egyptian','Hebrew','Chaldean','Greek','Roman',
  'Yod','Aleph','Beth','Gimel','Daleth','Tav',
  'Adversary','Alpha','Omega'
]);

function isLikelyTransliteration(gloss) {
  if (!gloss || gloss === '') return false;
  if (gloss.includes('-') || gloss.includes(' ')) return false;
  if (knownNames.has(gloss)) return false;
  if (legitimateEnglish.has(gloss)) return false;
  if (!/^[A-Za-z]+$/.test(gloss)) return false;
  if (!/^[A-Z]/.test(gloss)) return false;

  const lower = gloss.toLowerCase();

  // 3+ consonants in a row (after removing common English clusters)
  if (/[bcdfghjklmnpqrstvwxyz]{3,}/i.test(lower)) {
    const cleaned = lower.replace(/(str|ght|nch|tch|sch|chr|shr|thr|spl|spr|scr|nds|nts|sts|rth|lth|nth|ngth|ngs|ckn)/g, '');
    if (/[bcdfghjklmnpqrstvwxyz]{3,}/i.test(cleaned)) return true;
  }

  // Very short, no vowels
  if (lower.length <= 5 && !/[aeiou]/.test(lower)) return true;

  // Ends with unusual consonant pair for English
  if (/[bcdfghjklmnpqrstvwxyz]{2}$/.test(lower) && lower.length > 4) {
    const ending = lower.slice(-2);
    const commonEndings = new Set([
      'ng','nd','nt','st','ck','sh','th','ch','ly','ty','ry','ny','dy',
      'fy','gy','hy','ky','my','py','sy','wy','zy','lt','ft','pt','ct',
      'll','ss','ff','rn','wn','gn','mn','ld','rd','lf','rf','nk','sk',
      'lk','rk','rm','lm','mp','sp','lp','rp','rb','lb','rg','lg','dg',
      'ps','ts','ns','ms','ls','rs','ws','ks','bs','ds','gs','xt','wl',
      'wn','rl','rn','rt','rk','rp','rb','rd','rf','rg','rs','rz','lf',
      'lk','lp','lt','lm','ln','ls','lz','lf','ng','nk','nt','nd','ns',
      'nz','nc','nl','nx'
    ]);
    if (!commonEndings.has(ending)) return true;
  }

  return false;
}

function findTransliterationsInHyphenated(gloss) {
  if (!gloss || gloss === '') return false;
  const parts = gloss.split('-');
  for (const part of parts) {
    if (part.length < 3) continue;
    if (knownNames.has(part)) continue;
    if (legitimateEnglish.has(part)) continue;
    if (/^[A-Z][a-zA-Z]*$/.test(part)) {
      const lower = part.toLowerCase();
      if (/[bcdfghjklmnpqrstvwxyz]{3,}/i.test(lower)) {
        const cleaned = lower.replace(/(str|ght|nch|tch|sch|chr|shr|thr|spl|spr|scr|nds|nts|sts|rth|lth|nth|ngth|ngs|ckn)/g, '');
        if (/[bcdfghjklmnpqrstvwxyz]{3,}/i.test(cleaned)) return true;
      }
    }
  }
  return false;
}

for (const file of files) {
  const content = fs.readFileSync(file.path, 'utf8');
  const regex = /\["([^"]*)","([^"]*)"\]/g;
  let match;
  const translit = [];
  const hebrewInGloss = [];
  const questionMarks = [];
  let total = 0;

  while ((match = regex.exec(content)) !== null) {
    const hebrew = match[1];
    const gloss = match[2];
    total++;

    if (gloss.includes('???')) {
      const before = content.substring(0, match.index);
      const lineNum = before.split('\n').length;
      questionMarks.push({hebrew, gloss, line: lineNum});
    }

    if (/[\u0590-\u05FF]/.test(gloss)) {
      const before = content.substring(0, match.index);
      const lineNum = before.split('\n').length;
      hebrewInGloss.push({hebrew, gloss, line: lineNum});
    }

    if (isLikelyTransliteration(gloss) || findTransliterationsInHyphenated(gloss)) {
      const before = content.substring(0, match.index);
      const lineNum = before.split('\n').length;
      translit.push({hebrew, gloss, line: lineNum});
    }
  }

  console.log('========================================');
  console.log('FILE: ' + file.name);
  console.log('Total word pairs: ' + total);
  console.log('');
  console.log('  [1] ??? placeholders: ' + questionMarks.length);
  if (questionMarks.length > 0) {
    questionMarks.forEach(t => {
      console.log('      Line ' + t.line + ': [' + t.hebrew + ' => ' + t.gloss + ']');
    });
  }
  console.log('');
  console.log('  [2] Hebrew in gloss: ' + hebrewInGloss.length);
  if (hebrewInGloss.length > 0) {
    hebrewInGloss.forEach(h => {
      console.log('      Line ' + h.line + ': [' + h.hebrew + ' => ' + h.gloss + ']');
    });
  }
  console.log('');
  console.log('  [3] Transliteration suspects: ' + translit.length);
  if (translit.length > 0) {
    translit.forEach(t => {
      console.log('      Line ' + t.line + ': [' + t.hebrew + ' => ' + t.gloss + ']');
    });
  }
  console.log('');
}
