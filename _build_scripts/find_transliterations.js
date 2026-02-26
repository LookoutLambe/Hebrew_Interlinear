// Precise transliteration finder v3
// Only flags glosses that are CLEARLY phonetic Hebrew, not English
const fs = require('fs');
const path = require('path');
const BASE = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(BASE, 'BOM.html'), 'utf8');

// ALL known English words that could appear as single-word glosses
const english = new Set(`
a an the and or but if of to in on at by for from with as that this not no so yet
he she it they we you I me him her us them my his its our your their who whom which
is are was were be am have has had do does did will would shall should can could may
ACC Behold Indeed Creator Reeds Sinai He She They We You It
Selah Amen Hosanna Hallelujah Fire Water Earth Land City
`.trim().split(/\s+/).map(w => w));

// BOM proper nouns
const names = new Set(fs.readFileSync(path.join(BASE, 'BOM.html'), 'utf8')
  .match(/["']([A-Z][a-z]+(?:iah|ites?|ite|um|on|im|ah|am|hi|ni|el|om|er|ur|oz|th|sh|ph|lk|nk|ad|em|an|ai|ki|bi|gi|di|li|mi|ri|si|ti)?)["']/g)
  ?.map(m => m.replace(/['"]/g, '')) || []);

// Add explicit proper nouns
`Nephi Lehi Laman Lemuel Sam Sariah Ishmael Zoram Jacob Joseph Enos Jarom Omni
Mosiah Benjamin Zeniff Noah Abinadi Alma Amulek Zeezrom Ammon Aaron Omner Himni
Limhi Gideon Helaman Shiblon Corianton Moroni Mormon Ether Moronihah Zarahemla
Bountiful Desolation Jerusalem Melek Ammonihah Gid Mulek Jershon Manti Sidon
Teancum Pahoran Lachoneus Giddianhi Gidgiddoni Zemnarihah Kishkumen Gadianton
Cezoram Timothy Jonas Aminadab Coriantumr Shiz Lib Omer Jared Orihah Kib Shule
Cohor Nimrah Akish Ethem Moron Coriantor Pagag Morianton Kim Levi Riplakish
Hearthom Com Heth Shez Amnigaddah Coriantum Gilgal Shared Gilead Shiblom Seth Ahah
Amulon Lamoni Abish Amalickiah Ammoron Tubaloth Hagoth Samuel Lehonti Nephihah
Zerah Shilom Antipus Aminadi Amlici Cumeni Hermounts Isabel Kish Laban Ogath Onidah
Paanchi Pachus Pacumeni Riplah Ripliancum Seantum Sebus Shem Shemlon Sherem Shim
Sidom Zenephi Zenock Zenos Neas Judea Heshlon Boaz Nimrod Esrom Amnor Liahona
Deseret Shelem Ablom Comnor Corihor Korihor Antionah Cumorah Ramah Christ Jesus God
Lord Messiah Adam Eve Moses Abraham Israel David Solomon Elijah Mary Sarah Zion Egypt
Babylon Isaiah Jeremiah Zedekiah Malachi Emer Corom Rabbanah Yeshua Amaron Chemish
Abinadom Amaleki Middoni Neum Irreantum Muloki Mocum Nahom Bethabara Josh Minon Hem
Gad Emron Antum Ramath Teomner Luram Amnihu Sherrizah Shimnilom Shurr Gimgimno
Jacobugath Heshlon Moriantum Mathoni Mathonihah Kumen Kumenonhi Ammaron`.trim().split(/\s+/)
  .forEach(n => names.add(n));

function isRealTransliteration(gloss) {
  if (!gloss || gloss.length < 2 || gloss.length > 15) return false;
  if (gloss.includes('-') || gloss.includes(' ') || gloss.includes('[')) return false;
  if (gloss === '׃' || gloss === '') return false;
  // Must be all ASCII letters
  if (!/^[A-Za-z]+$/.test(gloss)) return false;
  // Must start uppercase
  if (gloss[0] !== gloss[0].toUpperCase()) return false;
  // Skip known names and English
  if (names.has(gloss) || english.has(gloss)) return false;
  // Skip common English words (case-insensitive)
  const lower = gloss.toLowerCase();
  const commonLower = ['creator','reeds','sinai','fire','water','earth','pillar','mute',
    'dispersed','trembled','built','declaring','chosen','shook','blazing','surrounded',
    'priests','precious','judgment','offering','foundation','treasure','wondrous',
    'mighty','eternal','faithful','terrible','glorious','wicked','righteous','ancient',
    'heavenly','according','therefore','nevertheless','exceedingly','notwithstanding',
    'inasmuch','insomuch','whosoever','whatsoever','prison','wilderness','together',
    'against','another','before','after','between','through','without','within',
    'toward','because','during','besides','beneath','beyond','above','below',
    'under','until','about','since','still','often','again','already','always',
    'never','here','there','also','even','very','truly','surely','indeed',
    'perhaps','maybe','quickly','slowly','greatly','clearly','plainly',
    'foreign','number','servant','brother','sister','daughter','father','mother',
    'captain','warrior','soldier','prophet','king','queen','child','people',
    'nation','temple','church','altar','throne','mountain','valley','river',
    'sword','weapon','armor','shield','arrow','covenant','promise','prophecy',
    'salvation','redemption','repentance','baptism','resurrection','atonement',
    'transgression','abomination','desolation','destruction','affliction',
    'tribulation','lamentation','bondage','captivity','inheritance','possession',
    'commandment','ordinance','testimony','scripture','generation','preparation',
    'corruption','abomination','whirlwind','earthquake','pestilence','famine',
    'slaughter','dominion','authority','government','tribunal','persecution'];
  if (commonLower.includes(lower)) return false;
  // Check vowel ratio - transliterations from Hebrew tend to be consonant-heavy
  const vowels = (lower.match(/[aeiou]/g) || []).length;
  const ratio = vowels / lower.length;
  // Very consonant-heavy (< 25% vowels for 4+ char words) = very likely transliteration
  if (gloss.length >= 4 && ratio < 0.25) return true;
  // Moderate consonant-heavy but also short and not recognizable
  if (gloss.length >= 3 && ratio < 0.35 && !/^(The|And|But|For|Not|All|One|Two|Now|Yet)/.test(gloss)) return true;
  // Even with vowels, if it contains unusual patterns for English
  // Like double consonants that don't occur in English, or Hebrew-typical clusters
  if (/[^aeiou]{4,}/i.test(gloss)) return true; // 4+ consonants in a row
  // Check for Hebrew transliteration markers: starts with common Hebrew prefix sounds
  // O = vav, H = he, I/Y = yod, V = vav, N = nun, L = lamed
  if (/^[OHIVNL][bcdfghjklmnpqrstvwxyz]/i.test(gloss) && gloss.length <= 10 && ratio < 0.4) return true;
  return false;
}

// Find all chapters
const chapterRe = /\/\/ (\w[\w\s–\-]+?) – Chapter (\d+)/g;
let chapters = [];
let cm;
while ((cm = chapterRe.exec(html)) !== null) {
  chapters.push({ book: cm[1].trim(), chapter: parseInt(cm[2]), pos: cm.index });
}

console.log(`Scanning ${chapters.length} total chapters...\n`);

let totalSuspect = 0;
const results = {};

for (let i = 0; i < chapters.length; i++) {
  const ch = chapters[i];
  const nextPos = (i + 1 < chapters.length) ? chapters[i + 1].pos : html.length;
  const chunk = html.substring(ch.pos, nextPos);

  const wordRe = /\["([^"]+)","([^"]*)"\]/g;
  const suspects = [];
  let wm;
  while ((wm = wordRe.exec(chunk)) !== null) {
    const hebrew = wm[1];
    const gloss = wm[2];
    if (hebrew === '׃' || !gloss) continue;
    if (isRealTransliteration(gloss)) {
      suspects.push({ hebrew, gloss });
    }
  }

  const key = `${ch.book} ${ch.chapter}`;
  if (suspects.length > 0) {
    results[key] = suspects;
    totalSuspect += suspects.length;
  }
}

// Print chapter by chapter
for (const [key, suspects] of Object.entries(results)) {
  console.log(`=== ${key} (${suspects.length}) ===`);
  for (const s of suspects) {
    console.log(`  ["${s.hebrew}","${s.gloss}"]`);
  }
}

console.log(`\nTotal transliterations: ${totalSuspect}`);
console.log(`Chapters with issues: ${Object.keys(results).length} / ${chapters.length}`);
fs.writeFileSync(path.join(BASE, '_build_scripts', 'transliterations.json'), JSON.stringify(results, null, 2));
