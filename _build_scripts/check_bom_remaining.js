const fs = require('fs');
const c = fs.readFileSync('BOM.html', 'utf8');

// Count ??? entries
const qqq = (c.match(/"\?\?\?"/g) || []).length;
console.log('Total ??? in BOM.html:', qqq);

// Find ALL word-gloss pairs
const re = /\["([^"]+)","([^"]*?)"\]/g;
let m;

// Known proper nouns and correct English glosses to exclude
const knownProper = new Set([
  'Nephi','Alma','Israel','Moroni','Ammon','Yeshua','Lehi','Zarahemla','Jacob',
  'Mosiah','Jared','Jerusalem','Moses','Helaman','Mormon','Limhi','Amalickiah',
  'Laban','Ishmael','Laman','Joseph','Aaron','Coriantumr','Benjamin','Abinadi',
  'Lamoni','Noah','Amulek','Bountiful','Gideon','Sidon','Teancum','Isaiah',
  'Shiz','Lamanites','Ammoron','Holiness','Ammonihah','Jershon','Pahoran',
  'Judah','Abraham','Antipus','Sheol','Akish','Manti','Shule','Moronihah',
  'Kishkumen','Samuel','Lachoneus','Smith','Helam','Middoni','Zerahemnah',
  'Nephites','Nephite','Lamanite','Zoramites','Zoram','Zeniff','Anti',
  'Gidgiddoni','Amlici','Gadianton','Moriantum','Morianton','Lib','Omer',
  'Coriantor','Ether','Riplakish','Com','Amnigaddah','Heth','Shez','Kim',
  'Levi','Corom','Kib','Orihah','Corihor','Shared','Gilgal','Gilead',
  'Antipas','Gid','Cumeni','Shiblon','Corianton','Korihor','Nehor','Giddonah',
  'Zoramite','Amulon','Abish','Lamah','Muloki','Amulonites','Lehonti',
  'Omner','Himni','Limhah','Zeram','Aha','Aminadab','Seezoram','Cezoram',
  'Zemnarihah','Timothy','Jonas','Zedekiah','Mulek','Hagoth','Cumenihah',
  'Leahontai','Pachus','Moriantum','Nephihah','Lehontai',
  'ACC','Almighty','Amen','Selah','Jesus','Christ','Messiah','Zion',
  'Adam','Eve','David','Solomon','Elijah','Sarah','Isaac','Esau',
  'Egypt','Babylon','Jordan','Lebanon','Sinai','Gilead',
]);

// Find transliteration-like glosses that are NOT known proper nouns
const suspicious = [];
while ((m = re.exec(c)) !== null) {
  const word = m[1];
  const gloss = m[2];
  if (gloss === '???' || gloss === '' || gloss === '׃') continue;
  // Matches pattern of transliteration placeholder: capitalized, no hyphens/spaces
  if (/^[A-Z][a-zA-Z]{1,15}$/.test(gloss) && !knownProper.has(gloss)) {
    suspicious.push({ word, gloss });
  }
}

// Group and count
const counts = {};
suspicious.forEach(s => {
  const key = `${s.word} -> ${s.gloss}`;
  counts[key] = (counts[key] || 0) + 1;
});

const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
console.log(`\nSuspicious non-proper-noun transliteration glosses: ${suspicious.length}`);
console.log('Top entries:');
sorted.slice(0, 80).forEach(([k, v]) => console.log(`  ${k} (${v}x)`));
