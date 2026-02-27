// Extract all remaining transliteration glosses from data files
const fs = require('fs');

const files = [
  '_chapter_data/al_data.js',
  '_chapter_data/he_data.js',
  '_chapter_data/3n_data.js',
  '_chapter_data/et_data.js'
];

// Known proper names to skip (these are correct as-is)
const goodNames = new Set([
  'Jershon','Ammon','Alma','Moroni','Mormon','Ether','Mosiah','Jacob','Helaman','Gideon',
  'Zarahemla','Bountiful','Coriantumr','Gadianton','Kishkumen','Amulek','Zeezrom',
  'Egypt','Lamanite','Lamanites','Nephite','Nephites',
  'Ishmaelite','Ishmaelites','Amalekite','Amalekites','Zoramite','Zoramites',
  'Amlicite','Amlicites','Amulonite','Amulonites','Mulekite','Mulekites',
  'Aaron','Abinadi','Korihor','Nehor','Zeniff','Noah','Benjamin','Limhi',
  'Giddianhi','Lachoneus','Shiz','Lib','Akish','Jared','Nimrod','Shule',
  'Cohor','Coriantor','Orihah','Emer','Heth','Riplakish','Morianton','Kim',
  'Levi','Amnigaddah','Anti','Pachus','Teancum','Pahoran','Amalickiah',
  'Ammoron','Hagoth','Shiblon','Corianton','Cumeni','Antipus','Antiparah',
  'Alpha','Omega','Melchizedek','Salem','Zion','Israel','Nephi','Lehi',
  'Laman','Lemuel','Christ','Jesus','Messiah','Abraham','Isaac','Moses',
  'David','Solomon','Isaiah','Adam','Eve','Ephraim','Manasseh',
  'Jerusalem','Sidon','Melek','Gid','Omner','Ishmael','Middoni',
  'Antionum','Manti','Judea','Cumorah','Moronihah','Zerahemnah',
  'Amulon','Lehonti','Lamoni','Abish','Seantum','Seezoram','Cezoram',
  'Gidgiddoni','Zemnarihah','Timothy','Jonas','Mathoni','Mathonihah',
  'Shelem','Pagag','Omer','Shared','Gilead','Heshlon','Moriantum',
  'Helorum','Shiblom','Cumenihah','Lehi','Nephihah','Antipara',
  'Teomner','Laman','Ammonihah','Amlici','Ablom','Agosh',
  'Commnor','Corihor','Coriantum','Ethem','Gilgal','Gilgah',
  'Hearthom','Heshlon','Jacom','Kib','Luram','Moriancumer',
  'Moron','Nehor','Nimrah','Noah','Ogath','Onidah','Ramah',
  'Riplakish','Shez','Shurr','Com','Lib','Seth','Ahah',
  'Gazelem','Zelph','Shelem','Ripliancum','Cumoms','Cureloms',
  'Neas','Sheum','Deseret',
]);

// Common English gloss words/segments (lowercase)
const englishWords = new Set([
  'the','a','an','and','or','but','not','in','on','upon','to','of','from','for',
  'with','by','at','my','your','his','her','its','our','their','them','him',
  'us','me','you','we','they','he','she','it','is','was','were','are','be',
  'been','being','have','has','had','do','did','does','shall','will','may',
  'can','must','should','would','could','might','all','every','each','some',
  'any','no','many','much','more','most','few','less','least','this','that',
  'these','those','which','who','whom','whose','what','where','when','how',
  'why','if','then','than','as','so','too','also','only','just','even',
  'still','yet','already','up','down','out','off','over','under','through',
  'into','unto','before','after','between','among','against','without','within',
  'about','above','below','around','across','along','behind','beside','beyond',
  'great','good','evil','holy','righteous','wicked','mighty','strong','true',
  'false','new','old','young','first','second','last','other','another','same',
  'own','such','like','people','land','city','word','words','things','thing',
  'man','men','woman','women','children','son','sons','daughter','daughters',
  'father','mother','brother','brothers','sister','king','lord','god','gods',
  'heart','hearts','hand','hands','eye','eyes','face','earth','heaven','heavens',
  'day','days','night','year','years','time','times','house','houses','name',
  'names','way','ways','place','places','part','parts','side','end','midst',
  'came','come','coming','went','go','going','gone','went','said','say','saying',
  'says','spoke','spoken','speak','give','gave','given','take','took','taken',
  'make','made','making','know','knew','known','see','saw','seen','hear','heard',
  'sent','send','found','find','put','set','told','tell','brought','bring',
  'began','begin','kept','keep','called','call','pass','passed','destroy',
  'destroyed','cast','fell','fall','risen','rise','slain','slay','smite','smitten',
  'flee','fled','fight','fought','dwell','dwelt','build','built','done','done',
  'became','become','left','turned','returned','gathered','driven','led',
  'according','because','therefore','yea','nay','behold','verily','thus',
  'hath','doth','ye','thee','thou','thy','thine','hast','art','wilt','shalt',
  'again','now','again','here','there','forth','away',
  'war','peace','battle','sword','army','armies','death','blood','power',
  'authority','commandment','commandments','law','judgment','mercy','grace',
  'faith','repentance','baptism','sin','sins','iniquity','wickedness',
  'righteousness','truth','light','darkness','joy','sorrow','cursed','blessed',
  'covenant','promise','oath','testimony','record','plates','scriptures',
  'church','synagogue','prison','wilderness','valley','hill','mountain','river',
  'waters','sea','east','west','north','south',
  'priest','priests','priesthood','prophet','prophets','teacher','teachers',
  'servant','servants','captain','captains','judge','judges','chief',
  'prisoner','prisoners','captive','captives','remnant',
  'food','wine','grain','fruit','flocks','herds','gold','silver','iron','copper',
  'hunted','robbers','band','bands','secret','combination','combinations',
]);

let total = 0;
const allBad = {};

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const re = /\["([^"]+)","([^"]*)"\]/g;
  let m;
  const found = [];

  while ((m = re.exec(content)) !== null) {
    const heb = m[1];
    const gloss = m[2];
    if (!gloss || heb === '׃') continue;

    // Check each segment of the gloss
    const segs = gloss.split('-');
    let isBad = false;

    for (const seg of segs) {
      if (seg.length < 3) continue;
      if (goodNames.has(seg)) continue;
      if (englishWords.has(seg.toLowerCase())) continue;
      // Skip [ACC], [REL] etc
      if (/^\[/.test(seg)) continue;
      // Skip parenthetical
      if (/^\(/.test(seg)) continue;

      // Check: Capitalized word not in our dictionaries
      if (/^[A-Z][a-z]+$/.test(seg) && seg.length >= 4) {
        // Check if it ends like a proper name (-iah, -ites, -ians, -iel)
        if (/(?:iah|ites|ians|iel|ites)$/i.test(seg)) continue;
        // It's suspicious
        isBad = true;
        break;
      }
    }

    if (isBad) {
      found.push([heb, gloss]);
    }
  }

  // Deduplicate
  const unique = new Map();
  for (const [heb, gloss] of found) {
    const key = heb + '|' + gloss;
    if (!unique.has(key)) unique.set(key, { heb, gloss, count: 0 });
    unique.get(key).count++;
  }

  const sorted = [...unique.values()].sort((a, b) => b.count - a.count);
  allBad[file] = sorted;
  total += found.length;
  console.log(`${file}: ${found.length} occurrences, ${sorted.length} unique`);
}

console.log(`\nTotal: ${total} occurrences`);

// Output structured data
let output = '';
for (const [file, items] of Object.entries(allBad)) {
  output += `\n=== ${file} (${items.length} unique) ===\n`;
  for (const item of items) {
    output += `  "${item.heb}"|"${item.gloss}"|${item.count}\n`;
  }
}

fs.writeFileSync('_build_scripts/remaining_bad_glosses.txt', output, 'utf8');
console.log('\nSaved to _build_scripts/remaining_bad_glosses.txt');
