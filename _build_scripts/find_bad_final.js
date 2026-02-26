// Find truly bad glosses: transliterations from resolve_all_unknowns.js
// and glosses still containing Hebrew characters
// These produced patterns like "Btsdo", "Oimsho", "Hkitno", "Tbshlo"
const fs = require('fs');
const bom = fs.readFileSync('BOM.html', 'utf8');

const re = /\["([^"]+)","([^"]*)"\]/g;
let m;
const results = { hebrew_in_gloss: [], transliterations: [] };

while ((m = re.exec(bom)) !== null) {
  const heb = m[1];
  const gloss = m[2];
  if (!gloss || gloss === '' || heb === '׃') continue;

  // 1. Contains Hebrew characters — definitely broken
  if (/[\u0590-\u05FF]/.test(gloss)) {
    const key = heb + '|' + gloss;
    if (!results.hebrew_in_gloss.find(x => x.key === key)) {
      results.hebrew_in_gloss.push({ key, hebrew: heb, gloss, count: 1 });
    } else {
      results.hebrew_in_gloss.find(x => x.key === key).count++;
    }
    continue;
  }

  // 2. Check for transliteration patterns
  // The transliterate() function produces: Capitalized string from Hebrew consonants
  // Pattern: ב→b, ג→g, ד→d, ה→h, ו→v, ז→z, ח→ch, ט→t, י→y,
  //          כ/ך→k, ל→l, מ/ם→m, נ/ן→n, ס→s, פ/ף→p/f, צ/ץ→ts, ק→k, ר→r, ש→sh, ת→t
  //          א/ע → ' (apostrophe) or א/ע kept as Hebrew chars

  // Split gloss into segments
  const segments = gloss.split('-');
  for (const seg of segments) {
    if (!seg || seg.length < 3) continue;

    // Check if this segment matches transliteration output pattern:
    // Only contains: b,g,d,h,v,z,ch,t,y,k,l,m,n,s,p,f,ts,r,sh + vowels from coincidental matches
    // Key indicators: unusual consonant patterns NOT found in English

    // Quick check: does it look like a capitalized transliteration?
    if (/^[A-Z][a-z]+$/.test(seg)) {
      const lower = seg.toLowerCase();

      // These patterns are VERY unlikely in English but common in Hebrew transliterations:
      const hebrewPatterns = [
        /^[bcdfghklmnprstvyz]{2,}[aeiou]/,  // starts with 2+ consonants (Hebrew-style)
        /[bcdfghklmnprstvyz]{4,}/,  // 4+ consecutive consonants
        /tsh[^aeiou]/,  // tsh cluster
        /shm|shn|shp|shk|sht|shl/,  // sh + consonant (common in Hebrew)
        /chm|chn|chk|cht|chl|chv|chb|chd|chg|chr|chsh/,  // ch + consonant
        /tsb|tsd|tsg|tsk|tsl|tsm|tsn|tsp|tsr|tsv/,  // ts + consonant
        /^[bcdfghklmnprstvyz]{3}/,  // starts with 3 consonants
        /[bcdfghklmnprstvyz]{3}$/,  // ends with 3 uncommon consonant combo
      ];

      let isTranslit = false;
      for (const pat of hebrewPatterns) {
        if (pat.test(lower)) {
          // But exclude common English patterns
          if (!/^(str|spr|scr|spl|thr|chr|ght|nds|nts|ngs|rds|rns|rts|sts|lds|lts|mps|nks|sks|fts)/.test(lower.match(pat)?.[0] || '')) {
            isTranslit = true;
            break;
          }
        }
      }

      // Also check vowel ratio: Hebrew transliterations have very few vowels
      if (!isTranslit) {
        const vowels = (lower.match(/[aeiou]/g) || []).length;
        if (lower.length >= 5 && vowels / lower.length < 0.15) {
          isTranslit = true;
        }
      }

      if (isTranslit) {
        const key = heb + '|' + gloss;
        if (!results.transliterations.find(x => x.key === key)) {
          results.transliterations.push({ key, hebrew: heb, gloss, badSegment: seg, count: 1 });
        } else {
          results.transliterations.find(x => x.key === key).count++;
        }
        break;
      }
    }
  }
}

// Deduplicate and sort
const hebrewInGloss = {};
for (const item of results.hebrew_in_gloss) {
  if (!hebrewInGloss[item.key]) hebrewInGloss[item.key] = item;
  else hebrewInGloss[item.key].count += item.count;
}

const translits = {};
for (const item of results.transliterations) {
  if (!translits[item.key]) translits[item.key] = item;
  else translits[item.key].count += item.count;
}

const sortedHebrew = Object.values(hebrewInGloss).sort((a, b) => b.count - a.count);
const sortedTranslit = Object.values(translits).sort((a, b) => b.count - a.count);

const totalHeb = sortedHebrew.reduce((s, e) => s + e.count, 0);
const totalTrans = sortedTranslit.reduce((s, e) => s + e.count, 0);

console.log('=== GLOSSES WITH HEBREW CHARACTERS ===');
console.log(`${sortedHebrew.length} unique, ${totalHeb} total`);
sortedHebrew.forEach(s => console.log(`  "${s.gloss}" ← ${s.hebrew} x${s.count}`));

console.log('\n=== TRANSLITERATIONS (nonsense English) ===');
console.log(`${sortedTranslit.length} unique, ${totalTrans} total`);
sortedTranslit.forEach(s => console.log(`  "${s.gloss}" [${s.badSegment}] ← ${s.hebrew} x${s.count}`));

console.log(`\n=== TOTAL BAD: ${sortedHebrew.length + sortedTranslit.length} unique, ${totalHeb + totalTrans} occurrences ===`);

fs.writeFileSync('bad_glosses_final.json', JSON.stringify({
  hebrew_in_gloss: sortedHebrew,
  transliterations: sortedTranslit
}, null, 2));
