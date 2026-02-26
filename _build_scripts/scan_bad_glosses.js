// Scan BOM.html for genuinely bad glosses:
// 1. Glosses containing Hebrew characters (broken encoding)
// 2. Transliterations that are not real English words or known proper names
const fs = require('fs');
const bom = fs.readFileSync('BOM.html', 'utf8');

// Known valid proper names and English words that look like transliterations
const validWords = new Set([
  // Proper names from Book of Mormon
  'Nephi','Moroni','Mormon','Mosiah','Alma','Helaman','Ether','Lehi','Jacob',
  'Enos','Jarom','Omni','Ammon','Aaron','Coriantumr','Limhi','Zeniff','Noah',
  'Abinadi','Gideon','Amulek','Zeezrom','Korihor','Pahoran','Teancum',
  'Lachoneus','Giddianhi','Gidgiddoni','Kishkumen','Gadianton','Amalickiah',
  'Lamoni','Abish','Jared','Nimrod','Omer','Heth','Shule','Riplakish',
  'Morianton','Lib','Shiz','Gilgal','Bountiful','Zarahemla','Melek',
  'Ammonihah','Jershon','Manti','Mulek','Cumorah','Desolation','Abundance',
  'Jerusalem','Eden','Sidon','Israel','Ishmael','Laman','Lemuel','Sam',
  'Sariah','Zoram','Hagoth','Shiblon','Corianton','Timothy','Jonas',
  'Mathoni','Mathonihah','Kumen','Kumenonhi','Jeremiah','Shemnon',
  'Zedekiah','Isaiah','Christ','Jesus','Mary','Joseph','Moses','Adam',
  'Eve','Abel','Cain','Enoch','David','Solomon','Elijah','Malachi',
  'Samuel','Abigail','Sarah','Abraham','Seth','Zion','Egypt','Babylon',
  'Lehonti','Nephihah','Moronihah','Amulon','Antiionah','Zerah',
  'Shared','Shez','Com','Gid','Anti','Rameumptom','Liahona','Irreantum',
  'Deseret','Shelem','Ablom','Akish','Comnor','Corihor','Esrom','Amnor',
  'Antipus','Chemish','Abinadom','Amaron','Amaleki','Aminadab',
  'Aminadi','Amnigaddah','Amlici','Amlicites','Amnor','Amnihu',
  'Antionah','Antionum','Antipas','Antiparah','Antum','Archeantus',
  'Bethabara','Boaz','Cezoram','Cohor','Coriantor','Coriantumr',
  'Cumeni','Cumenihah','Emron','Ether','Ethem','Ezias','Gad',
  'Gazelam','Gibeah','Giddonah','Gidgiddonah','Gimgimno','Gilead',
  'Gilgah','Hagoth','Hearthom','Hem','Hermounts','Heshlon',
  'Himni','Horeb','Isabel','Jacobugath','Jacom','Jeneum','Josh',
  'Judea','Kim','Kimnor','Kish','Kishkumen','Laban','Lamanite',
  'Lamah','Lamoni','Lehonti','Luram','Madmenah','Mahah',
  'Middoni','Midian','Minon','Moab','Mocum','Moriantum','Moron',
  'Muloki','Nahom','Neas','Nehor','Nephi','Neum','Ogath','Onidah',
  'Onihah','Orihah','Paanchi','Pachus','Pacumeni','Pagag',
  'Rameumptom','Ramath','Riplah','Riplakish','Ripliancum',
  'Seantum','Sebus','Shelem','Shem','Shemlon','Sherem',
  'Sherrizah','Shiblom','Shiblon','Shilom','Shim','Shimnilom',
  'Shiz','Shurr','Sidom','Sidon','Teomner','Tubaloth',
  'Zerahemnah','Zemnarihah','Zeezrom','Zenephi','Zenock','Zenos',
  'Zeram','Zoramite','Zoramites',
  // Valid English glosses that might look like transliterations
  'ACC','YHWH','GOD','LORD',
  'He','Him','His','She','Her','Thee','Thou','Thy',
  'Spirit','Ghost','Sheol','Smith','Almighty',
  'Shilom','Shared','Shez','Com','Gid',
  // Short valid words
  'Son','God','King','Lord','Man','One','Two',
]);

const re = /\["([^"]+)","([^"]*)"\]/g;
let m;
const badGlosses = {};
let total = 0;

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

  // 2. Check for transliteration patterns (not real English)
  if (!isBad) {
    // Extract individual parts from hyphenated glosses
    const parts = gloss.split('-');
    for (const part of parts) {
      if (!part || part.length < 2) continue;
      // Skip known prefixes/words
      if (['and','the','in','to','from','upon','with','for','of','or','not','that',
           'which','who','all','this','ACC','unto','lest','do','if','also','what',
           'until','above','like','as','shall','be','let','by','son','sons',
           'hand','every','over','without','being','about','how','you','we',
           'they','he','she','it','my','your','his','her','our','their',
           'us','them','me','him','I','a','an','no','was','were','is',
           'has','had','have','did','does','may','can','will','would',
           'should','must','might','O','yea','nay','lo','now','again',
           'against','among','before','after','between','behind','within',
           'around','through','across','beyond','under','beneath','near',
           'each','man','men','own','way','day','days','year','years',
           'much','many','more','most','great','good','evil','old','new',
           'first','last','other','same','another','one','two','three',
           'four','five','six','seven','eight','nine','ten','twenty',
           'thirty','forty','fifty','sixty','seventy','eighty','ninety',
           'hundred','thousand','people','land','city','king','lord',
           'god','word','words','house','name','son','daughter','father',
           'mother','brother','sister','wife','children','seed',
           'earth','heaven','heavens','water','waters','sea','fire',
           'blood','flesh','bone','heart','soul','spirit','body',
           'sword','war','battle','army','armies','camp','prison',
           'church','priest','judge','prophet','servant','enemy',
           'voice','law','commandment','commandments','covenant',
           'judgment','mercy','righteousness','iniquity','sin','death',
           'life','power','strength','faith','prayer','repentance',
           'baptism','resurrection','salvation','redemption',
           'wilderness','mountain','valley','plain','river','gate',
           'tower','wall','temple','throne','wilderness',
           'north','south','east','west','up','down',
           'face','feet','foot','head','eye','eyes','mouth','ear',
           'arm','arms','neck','back','side','right','left',
           'saying','said','came','went','went','go','come','give',
           'take','make','do','see','hear','know','speak','tell',
           'call','send','bring','put','set','turn','fall','rise',
           'stand','sit','walk','run','fight','kill','slay','die',
           'live','eat','drink','sleep','work','build','destroy',
           'burn','cut','break','open','close','begin','end',
           'love','hate','fear','desire','rejoice','mourn','weep',
           'cry','pray','praise','bless','curse','swear','remember',
           'forget','teach','learn','write','read','judge','rule',
           'reign','serve','worship','offer','sacrifice',
           'abomination','abominations','affliction','anger','appointed',
           'arise','art','awake','behalf','behold','cast','cause',
           'ceased','chapter','chose','compassion','continually',
           'consecrated','darkness','depart','desire','dwelling',
           'exceedingly','fierce','fullness','hither','holy','inheritance',
           'liberty','midst','mock','nigh','obtain','onward','pass',
           'possess','prosper','reign','remnant','rest','return',
           'scattered','sealed','sought','suffer','taught','thereof',
           'thus','transgression','treasure','tribes','tumult',
           'utterly','wicked','wickedness','wrath','wrought',
           'according','appearance','because','chosen','coming',
           'deliverance','destruction','favor','forever','gathered',
           'gladness','harden','inhabitants','liken','manner',
           'memorial','ministry','number','offering','overthrow',
           'possession','prepared','promise','provision','record',
           'remnant','repent','restore','scattered','service',
           'slain','stiff','surely','testimony','welfare','worthy',
           'ACC','YHWH','relinquished','march','appointed',
           'standing','division','astonished','matchless','change',
          ].includes(part.toLowerCase())) continue;

      // Check if it's a known proper name
      if (validWords.has(part)) continue;

      // Check if it looks like a transliteration (consonant-heavy, no English pattern)
      const lower = part.toLowerCase();
      // Real English words have vowels; transliterations often don't
      const vowelRatio = (lower.match(/[aeiou]/g) || []).length / lower.length;
      const hasConsonantCluster = /[bcdfghjklmnpqrstvwxyz]{4,}/.test(lower);

      if ((vowelRatio < 0.15 && lower.length > 3) || hasConsonantCluster) {
        isBad = true;
        reason = 'transliteration: ' + part;
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
console.log('\n--- Bad glosses (by frequency) ---');
sorted.forEach(s => console.log(`  "${s.gloss}" ← ${s.hebrew} x${s.count} [${s.reason}]`));

fs.writeFileSync('bad_glosses.json', JSON.stringify(sorted, null, 2));
console.log('\nSaved bad_glosses.json');
