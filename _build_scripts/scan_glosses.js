// Scan BOM.html for incorrectly glossed words (transliterations instead of English)
const fs = require('fs');
const bom = fs.readFileSync('BOM.html', 'utf8');

const re = /\["([^"]+)","([^"]*)"\]/g;
let m;
const suspicious = [];
let total = 0;

while ((m = re.exec(bom)) !== null) {
  const heb = m[1];
  const gloss = m[2];
  if (!gloss || gloss === '' || gloss === '׃') continue;
  total++;

  // Skip sof pasuk marker
  if (heb === '׃') continue;

  // Check if gloss contains Hebrew characters (definitely wrong)
  if (/[\u0590-\u05FF]/.test(gloss)) {
    suspicious.push({ hebrew: heb, gloss, reason: 'contains-hebrew-chars' });
    continue;
  }

  // Skip known good English patterns
  // Real glosses use lowercase-hyphenated like "and-it-was", "the-land", etc.
  // Or proper names like "Nephi", "Moroni"
  // Or prefix patterns like "[ACC]-the-word"

  // Transliterations are typically: capitalized, no hyphens, contain consonant clusters
  // like "Ohthlko", "Bhtbonno", "Nchlko", "Tbshlo", etc.
  // They come from the transliterate() function which capitalizes first letter

  // Check for likely transliteration patterns:
  // 1. Starts with uppercase, rest is lowercase, no hyphens, and has unusual consonant clusters
  const isSimpleTranslit = /^[A-Z][a-z]+$/.test(gloss) &&
    !/^(Nephi|Moroni|Mormon|Mosiah|Alma|Helaman|Ether|Lehi|Jacob|Enos|Jarom|Omni|Ammon|Aaron|Coriantumr|Limhi|Zeniff|Noah|Abinadi|Gideon|Amulek|Zeezrom|Korihor|Pahoran|Teancum|Lachoneus|Giddianhi|Gidgiddoni|Kishkumen|Gadianton|Amalickiah|Lamoni|Abish|Jared|Nimrod|Omer|Heth|Shule|Riplakish|Morianton|Lib|Shiz|Gilgal|Bountiful|Zarahemla|Melek|Ammonihah|Gideon|Jershon|Manti|Mulek|Cumorah|Desolation|Abundance|Jerusalem|Eden|Sidon|Israel|Ishmael|Laman|Lemuel|Sam|Sariah|Zoram|Hagoth|Shiblon|Corianton|Timothy|Jonas|Mathoni|Mathonihah|Kumen|Kumenonhi|Jeremiah|Shemnon|Zedekiah|Nephi|Isaiah|Christ|Jesus|Mary|Joseph|Moses|Adam|Eve|Abel|Cain|Enoch|David|Solomon|Elijah|Malachi|Samuel|Abigail|Sarah|Abraham|Seth|God|Lord|Zion|Egypt|Babylon)$/.test(gloss);

  if (isSimpleTranslit) {
    // Further check: does it have consonant clusters unlikely in English?
    // English proper names don't usually have "tsh", "khl", "shm", "dch", etc.
    const lower = gloss.toLowerCase();
    const hasWeirdCluster = /[bcdfghjklmnpqrstvwxyz]{4,}/.test(lower) ||
      /^[bcdfghjklmnpqrstvwxyz]{2}[aeiou]/.test(lower) ||
      /tsh|khl|shm|dch|tsb|bsh|nbl|gvr|mkh|shp|shk|shl|tbl|tkh|pkl|sht/.test(lower);
    if (hasWeirdCluster || lower.length <= 4) {
      suspicious.push({ hebrew: heb, gloss, reason: 'likely-transliteration' });
      continue;
    }
  }

  // 2. Mixed case in middle (like "Oitbonn", "Bhtbonno")
  if (/^[A-Z][a-z]*[A-Z]/.test(gloss) && !gloss.includes('-')) {
    suspicious.push({ hebrew: heb, gloss, reason: 'mixed-case-transliteration' });
    continue;
  }

  // 3. Hyphenated but contains a transliteration segment
  // e.g., "and-Nchlko" or "[ACC]-Tbshlo"
  const parts = gloss.split(/[-]/);
  for (const part of parts) {
    if (/^[A-Z][a-z]+$/.test(part) && part.length >= 3) {
      const lower = part.toLowerCase();
      const hasWeirdCluster = /[bcdfghjklmnpqrstvwxyz]{4,}/.test(lower) ||
        /tsh|khl|shm|dch|tsb|bsh|nbl|gvr|mkh|shp|shk|tbl|tkh|pkl/.test(lower);
      if (hasWeirdCluster) {
        suspicious.push({ hebrew: heb, gloss, reason: 'contains-transliterated-part' });
        break;
      }
    }
  }
}

// Deduplicate by gloss
const glossMap = {};
for (const s of suspicious) {
  const key = s.gloss;
  if (!glossMap[key]) glossMap[key] = { hebrew: s.hebrew, gloss: s.gloss, reason: s.reason, count: 0 };
  glossMap[key].count++;
}

const sorted = Object.values(glossMap).sort((a, b) => b.count - a.count);
console.log('Total glosses scanned:', total);
console.log('Suspicious/incorrect glosses found:', sorted.length, 'unique,', suspicious.length, 'total occurrences');
console.log('\n--- All suspicious glosses ---');
sorted.forEach(s => console.log(`  ${s.gloss} (${s.hebrew}) x${s.count} [${s.reason}]`));

fs.writeFileSync('suspicious_glosses.json', JSON.stringify(sorted, null, 2));
