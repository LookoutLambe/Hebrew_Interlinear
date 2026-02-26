// STRICT scanner: only find glosses that are actual transliterate() output
// The transliterate() function maps Hebrew consonants to English:
// ב→B, ג→G, ד→D, ה→H, ו→O/V, ז→Z, ח→Ch, ט→T, י→I, כ→K, ל→L,
// מ→M, נ→N, ס→S, ע→O, פ→P/F, צ→Ts, ק→K, ר→R, ש→Sh, ת→T
// So transliterations look like: Btsdo, Oimsho, Hshlko, Nbchro, Oiptch
// Key features:
// 1. Start with uppercase letter
// 2. Rest is lowercase
// 3. Very consonant-heavy (Hebrew has few written vowels)
// 4. Use specific transliteration digraphs: Ch, Sh, Ts, Th
// 5. NOT real English words or proper names

const fs = require('fs');
const bom = fs.readFileSync('BOM.html', 'utf8');

// Comprehensive English word list (lowercase)
const englishWords = new Set(`
a abandon able about above absence absent absorb accept access accident
accomplish according account accurate accuse achieve acknowledge acquire
across act action active actual add address adequate adjust administer
admit adopt advance advantage advice affair affect afford afraid after
afternoon again against age agency agent ago agree agreement ahead aid
aim air alive all allow almost alone along already also alter although
always amaze among amount amuse ancient and angel anger angry animal
announce annual another answer anticipate anxiety any anybody anyone
anything anyway apart appeal appear apple apply approach appropriate
approve area argue argument arise arm army around arrange arrest arrive
art article as ask asleep assembly assert assign assist associate assume
assure at atmosphere attach attack attempt attend attention attitude
attract audience authority available avoid awake award aware away awful

back background backward bad badly bag balance ball band bank bar bare
barely base basic basis basket bath battle be bear beat beautiful because
become bed before began begin beginning behalf behave behavior behind
being belief believe belong below beneath benefit beside besides best
better between beyond big bind bird birth bit bite black blade blame
blast blaze bleed bless blind block blood blow blue board boat body
bold bone book border bore born both bother bottom bound boundary bow
box boy brain branch brave bread break breath breed bridge brief bright
bring broad broke brother brought brown build building burden burn burst
bury bus business busy but buy by

call calm came camp can capable capacity capital captain capture car
care careful carry case cast catch cattle cause cease center central
certain chain chair challenge champion chance change chapter character
charge chief child children choice choose church circle circumstance
citizen city civil claim class clean clear climb close cloth clothe
cloud coast cold collect color column combine come comfort command
commander commence comment commit common community companion company
compare compel complain complete concern condemn condition conduct
confess confidence confirm conflict confound confront confuse connect
conquer conscience consider consist constant construct consume contain
content continue contract control convert convict convince cook cool
copy corner correct corruption cost could council count country couple
courage course court cover create creature cross crowd cruel cry cup
curious current curse custom cut

daily damage dance danger dangerous dare dark darkness daughter dawn day
dead deal dear death debate debt decay decide decision declare decline
decrease decree deed deep defeat defend defense define degree delay
deliberate delight deliver demand demonstrate deny depart depend
deposit deprive derive describe desert deserve desire desolation despise
destroy destruction detail determine develop device devote did die
difference different difficult dig diligent dinner direct direction
disappear discover discovery discuss disease dismiss display distance
distant distinguish distribute district divide division do doctor
document does dog domestic done door doubt down drag draw dream dress
drink drive drop dry due during dust duty dwell dwelling

each eager ear early earn earth ease east eastern easy eat edge
education effect effective effort egg eight eighteen eighty either
elder elect element eliminate else elsewhere embrace emerge emotion
emperor emphasis empire employ empty enable encounter encourage end
endure enemy energy enforce engage engine enjoy enormous enough
ensure enter entire entrance entry environment equal escape especially
essential establish estate eternal even evening event eventually ever
every everybody everyone everything everywhere evidence evil exact
examine example exceed exceedingly excellent except exchange excite
exclude execute exercise exist expect expedition expense experience
experiment expert explain explanation explore export expose extend
extent external extra extraordinary extreme eye

face fact fail failure faith faithful fall false fame familiar family
famine far farm fast fat fate father fault favor fear feast feature
feel feet fell fellow female few field fierce fifteen fifty fight
figure fill final finally find fine finger finish fire firm first
fish fit five fix flag flame flat flee flesh flew flight float flock
floor flow flower fly follow food fool foot for force foreign forest
forever forget forgive form former forth fortune forty forward found
foundation four fourteen fourth free freedom fresh friend from front
fruit fuel full fully function fund fundamental further future

gain game garden gate gather gave general generation gentle get ghost
gift girl give given glad glory go goal god goes gold gone good gospel
got govern government governor grace grain grand grant grass grave great
greatly green grew ground group grow growth guard guess guide guilty

had hair half hall hand handle hang happen happy hard hardly harm has
haste hat hate have he head heal health hear heard heart heat heaven
heavy held help her here herself hide high hill him himself his
history hit hold hole holy home honest honor hope horse host hot hour
house how however huge human humble hundred hunger hunt husband

ice idea identify if ignorant ill image imagine immediate immediately
impact implement importance important impose impossible impress improve
in incident include increase incredible indeed independent indicate
individual industry infant influence inform inherit initial injure
inner innocent inside insist inspect inspire install instance instead
institution instruct instrument insult insurance intend intense
intention interest internal interpret introduce invade invest
investigate investment invisible invite involve iron island isolate
issue it item its itself

join joint journey joy judge judgment jump just justice justify

keen keep key kill kind king kingdom knee knew knock know knowledge

labor lack lady laid lake lamb land language large last late later
latter laugh launch law lay lead leader leaf league lean learn least
leather leave left legal lend length less lesson let letter level
liberty library lie life lift light like likely limit line link lip
list listen little live local locate long look lord lose loss lost
lot loud love low loyal luck

machine mad made magic main maintain major majority make male man
manage manner many march mark market marriage marry mass master match
material matter may me meal mean measure meat medicine meet meeting
member memory men mental mention merchant mercy merely message metal
method middle might mighty military mind mine minister minor minute
miracle mirror miss mission mistake mix model modern moment money
month mood moon moral more moreover morning most mother motion mount
mountain mouth move movement much multiple murder music must mutual
my myself mystery

name narrow nation natural nature near nearby nearly neat necessary
neck need neither never nevertheless new news next nice night nine
nineteen ninety no noble nobody none nor normal north northern nose
not note nothing notice notion now nowhere number numerous nurse

object observe obtain obvious occasion occupy occur ocean odd of off
offer office officer official often oil old on once one only onto open
operate opinion opportunity oppose opposite option or order ordinary
organization organize origin other otherwise ought our ourselves out
outcome outer outside over overall overcome own owner

package page paid pain pair palace pale panel paper parent part
particular partly partner party pass passage past path patience
patient pattern pause pay peace people per percent perfect perform
perhaps period permission permit person phase philosophy physical
pick picture piece pile place plain plan plant plate play player
please pleasure plenty plot plus point poison political pool poor
popular population port portion position positive possess possession
possible post potential pour poverty power powerful practical practice
pray prayer prefer prepare presence present preserve president press
pressure pretend pretty prevent previous price pride priest primary
prince principal principle prior prison prisoner private prize problem
procedure proceed process produce product production profession
professor program progress project promise promote proof proper
property prophet proposal propose prospect protect protection proud
prove provide provision public pull punishment pure purpose pursue push
put

qualify quality quarter queen question quick quickly quiet quite quote

race rain raise range rank rapid rare rate rather reach react read
ready real reality realize really reason reasonable rebel receive
recent recognize recommend record recover red reduce refer reflect
reform refuse regard region regular reject relate release relief
religion religious reluctant rely remain remark remember remind remote
remove repeat replace reply report represent republic reputation
request require rescue research reserve resist resolve resource
respect respond response rest restore result retain retire return
reveal revenue review revolution rich ride right ring rise risk river
road rock role roll roof room root rope rough round route row royal
ruin rule run rural rush

sacred sacrifice safe safety said sake salt same sample sand satisfy
save saw say scale scene schedule school science scientist score sea
search season seat second secret secretary section secure security see
seed seek seem seen select sell send senior sense sentence separate
sequence series serious serve service session set settle seven
seventeen seventy several severe shadow shake shall shape share sharp
she shed sheep sheet shelter shift shine ship shock shoot shore short
shot should shoulder shout show shut side sight sign signal silence
silent silver similar simple simply since sing sir sister sit
situation six sixteen sixty size skill skin sky slave sleep slide
slight slow slowly small smell smile smoke smooth snake snow so social
society soft soil soldier solution some somebody somehow someone
something sometimes somewhat somewhere son soon sorry sort soul sound
source south southern space speak special specific speech speed spend
spirit spot spread spring square stable staff stage stand standard
star start state station status stay steady steal steel step stick
still stock stomach stone stood stop store storm story straight
strange stranger strategy street strength stretch strict strike string
strip strong structure struggle student study stuff stupid subject
submit succeed success such sudden suffer sufficient suggest suit
suitable summer sun supply support suppose sure surely surface surprise
surround survive suspect sweet swim sword symbol sympathy system

table tail take tale talent talk tall task taste tax teach team tear
technology tell temperature temple ten tend tension term terrible test
testimony text than thank that the their them themselves then theory
there therefore these they thick thin thing think third thirteen
thirty this those though thought thousand threat three throat throne
through throughout throw thus tie till time tiny title to today
together tomorrow tone tonight too tool top total touch tough toward
tower town track trade tradition train transfer transform transport
travel treasure treat treatment tree trial tribe trick trip troop
trouble true truly trust truth try turn twelve twenty twice two type
typical

ugly ultimate unable uncle under understand union unique unit unite
unity universe university unless unlike unlikely until up upon upper
urban urge us use used useful user usual usually

valley valuable value variety various vast version very victim victory
view village violence virtually virtue vision visit visitor vital
voice volume voluntary vote

wage wait wake walk wall want war warm warn wash waste watch water
wave way we weak wealth weapon wear weather week weekend weight
welcome well went were west western what whatever wheat when whenever
where whereas wherever whether which while whisper white who whole
whom whose why wide widely wife wild will willing win wind window wine
wing winter wire wisdom wise wish with withdraw within without witness
woman women wonder wood word work worker world worry worse worship
worst worth worthy would wound write writer writing wrong

yard year yellow yes yesterday yet you young your yourself youth
`.trim().split(/\s+/));

// Add more words commonly found in BOM glosses
const bomWords = `
abide abomination abominations abound abundant acc according accusation
acknowledge acquainted administered afflict affliction afterlife afterward
almighty altar amen ancestor ancestry angel angels anguish anointed
anoint apostle arm armament armor arose assembly atonement atone
authority avenge

baptism baptize battle beast beauteous begat began beget behalf believing
beloved beneath beseech bestow betray between bitter bless blessing
blood bond bondage borne bosom bounty brass breadth brethren brightness
broad brotherhood build burial burn burnt

captain captive captivity carnal case cease centurion chambers champion
chaos charge chariot chief circumcise cleanse cliff coast cometh
comfort commanded commandment commander commence compassion compel
compound concubine confine confound conquer consecrate constellation
consume contend contention continual convert convict corner corruption
council counsel countenance covenant create creation creature crucify
cubit curse cursed

darkness deal deceit deceive declare decree deeds deep deeper
deliverance deliver deliverance departed deprived descendant descend
desert desolate despised destroy destruction device devour diligent
diminish disappoint disciple discover disobedience disobey disperse
displease disposition dispute distress diverse divide divine dominion
doorway downfall dragon dread dreamed dried drink drove drought drunk
dry dust dwell dwelling

earnest earthquake eighth elder elect eleventh embrace empire enemy
enmity enormous enter envoy ephod epistle equal err escape establish
eternal eternity even everlasting evidence evil exalt examine exceed
exceedingly exchange exile exhort exist expedition expel extend
extol extreme

faithful famine fast fasting feast feeble fellowship ferocious
fertile field fierce fifteenth fifth fight fire firmament firstborn
fish flame fled flight flock flood food foolish footstool forbid
foreign foreknowledge forever forgive forgiveness forsake forth
fortress foundation fountain four fourteenth fourth fowl fragrant
free freedom fulfil fullness furnace fury

gain gall garment gate gathered generation gentile gift glad gladness
glory glorify goat gold goodness govern governor grace grain grass
grave great greed grief grievous ground grove grow growth guard guide
guilt guilty

harden harvest hate haven healing hearken heap heart heavenly heir
heritage hidden high hill hinder holiness holy honor horsemen host
hostile household humble humility hunger

idol idolatry image immerse immersion immortal impure incense increase
indignation infant inhabit inheritance iniquity innocent inquire
inscription inspire instruct intent intercede interpret iron island

jealous join journey joy jubilee judge judgment just justice justify

keep kindle kindred king kingdom kinsman knee kneel knew knowledge

labor lad lamentation lamp land language large law lawless lead
leaf league leave lend liberty life light likeness linen lion lip
live loathe lodge longing lord loss love lust

maiden maintain majesty make malice manna manner mantle march mark
marriage marry marvel matter meadow measure medicine memorial mercy
merit messenger midst mighty military mind miracle mischief misery
mock mocking model modest mole month moon mourn mourning multitude
murder murmur mystery

nation native naught near neighbor neither new night ninth noble
north northern nourish number numerous

oath obedience obey observe obtain offering olive omen one
onward oppress oracle ordain order ordinance orphan otherwise ought
ourselves outcry outer overcome overflow overthrow overturn own

palm paradise pardon part pasture path patience patriarch peace
penetrate people perceive perform perish permit perpetual persecute
persist pestilence petition pierce pillar pit plague plain plan
plead pledge plentiful plunder poison pollute poor portion possess
possession posterity pour poverty power powerful praise prayer preach
precious prepare presence preserve prevail prevent price pride priest
priesthood prince princess prison prisoner proclaim profane promise
prophecy prophesy prophet prosper prosperity prostrate protect
protection provoke prudent psalm punish pure purify pursue

queen quickly quiet

rage rain raise ransom ravage reach realm reap rebel rebellion
rebuke reckon recompense reconcile record redeem redemption
refine refuse reign reject rejoice release relent rely remain
remainder remedy remember remission remnant remove renew repay
repent repentance reproach require rescue resemble residue resist
resolve rest restore resurrection retribution return reveal revelation
revenge reverence revile revolt reward rich righteous righteousness
rise river robe rock rod royal ruin rule ruler

sabbath sacred sacrifice salvation sanctify sanctuary satan save
savior scepter scoff scorn scribe scroll seal search season secret
secure seed seek seize send separate serpent servant serve service
settle seventh shame shatter shed shepherd shield shine shoe shout
siege sight sign silver sin sincere sinful sister sit slaughter
slave slay slew slumber smite snare sojourn soldier solemn son
song sorrow soul south sovereign sow spare spear spirit spoil
spread spring staff stagger stand star statute steadfast steal
stone storm stranger strength stretch strong stumble submit
substance succeed suffer sufficiently summon sun supplicate
support supreme surely surpass surround survive sustain swallow
swear sweet sword swore synagogue

tabernacle tablet take tale teach tear temple ten tender tent
tenth territory terror test testify testimony thank thankful
thanksgiving theft thick thief thirst thorn throne thus tidings
timber today together toll tomb tongue torment tower tradition
train transgress transgression translate trap travel treasure
treaty tree tremble trial tribe tribute trouble trumpet trust truth
tumult turn twelve twentieth twenty two tyrant

unclean under understand unfaithful unite unjust unleavened unless
until uphold upper upright urge utter

vain valley vanish vanity veil vengeance verify vessel victory
vigilant village vine vineyard violence virgin virtue vision vow

wage walk wall wander war warning warrior watch watchman water
wave way weak wealth weapon wept west wheat whole wicked
wickedness widow wife wild wilderness wind wine wing wisdom
wise withdraw witness woe woman wonder wood word world worry
worship worthy wound wrath write

yea year yield yoke young youth

zeal zealous
`.trim().split(/\s+/);
bomWords.forEach(w => englishWords.add(w.toLowerCase()));

// BOM proper names
const properNames = new Set([
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
  'Judea','Kim','Heshlon','Boaz','Minon','Pagag','Hem','Nimrod',
  'Esrom','Amnor','Amnihu','Luram','Gad','Emron','Antum','Ramath',
  'Teomner','Chemish','Abinadom','Amaron','Amaleki','Sheol',
  'Yeshua','Benjamin','Messiah','Lamanite','Lamanites','Nephite','Nephites',
  'Nephite\'s','Lamanite\'s','Amalekite','Amalekites','Zoramite','Zoramites',
  'Mulekite','Mulekites','Jaredite','Jaredites','Gentile','Gentiles',
  'Ammonite','Ammonites','Ishmaelite','Ishmaelites','Jacobite','Jacobites',
  'Josephite','Josephites','Lemuelite','Lemuelites','Samite','Samites',
  'Amalickiahite','Nephites\'','Lamanites\'','Adamites',
  'ACC','YHWH','GOD','LORD','Snum',
]);

function isGenuinelyBadTranslit(seg) {
  if (seg.length < 3) return false;
  const clean = seg.replace(/[[\]()]/g, '').replace(/\([a-z]+\)/gi, '');
  if (!clean || clean.length < 3) return false;
  if (properNames.has(clean)) return false;

  const lower = clean.toLowerCase();

  // Check English word list (including with common suffixes)
  if (englishWords.has(lower)) return false;
  // Plurals
  if (lower.endsWith('s') && englishWords.has(lower.slice(0, -1))) return false;
  if (lower.endsWith('es') && englishWords.has(lower.slice(0, -2))) return false;
  if (lower.endsWith('ies') && englishWords.has(lower.slice(0, -3) + 'y')) return false;
  // Past tense / adjective forms
  if (lower.endsWith('ed') && (englishWords.has(lower.slice(0, -2)) || englishWords.has(lower.slice(0, -2) + 'e'))) return false;
  if (lower.endsWith('ing') && (englishWords.has(lower.slice(0, -3)) || englishWords.has(lower.slice(0, -3) + 'e'))) return false;
  if (lower.endsWith('er') && (englishWords.has(lower.slice(0, -2)) || englishWords.has(lower.slice(0, -2) + 'e'))) return false;
  if (lower.endsWith('est') && (englishWords.has(lower.slice(0, -3)) || englishWords.has(lower.slice(0, -3) + 'e'))) return false;
  if (lower.endsWith('ly') && (englishWords.has(lower.slice(0, -2)) || englishWords.has(lower.slice(0, -2) + 'e'))) return false;
  if (lower.endsWith('ness') && (englishWords.has(lower.slice(0, -4)) || englishWords.has(lower.slice(0, -4) + 'e'))) return false;
  if (lower.endsWith('ment') && (englishWords.has(lower.slice(0, -4)) || englishWords.has(lower.slice(0, -4) + 'e'))) return false;
  if (lower.endsWith('tion') && (englishWords.has(lower.slice(0, -4)) || englishWords.has(lower.slice(0, -4) + 'e') || englishWords.has(lower.slice(0, -4) + 'ate'))) return false;
  if (lower.endsWith('ful') && englishWords.has(lower.slice(0, -3))) return false;
  if (lower.endsWith('less') && englishWords.has(lower.slice(0, -4))) return false;
  if (lower.endsWith('ous') && (englishWords.has(lower.slice(0, -3)) || englishWords.has(lower.slice(0, -3) + 'e'))) return false;
  if (lower.endsWith('ive') && (englishWords.has(lower.slice(0, -3)) || englishWords.has(lower.slice(0, -3) + 'e'))) return false;
  if (lower.endsWith('al') && (englishWords.has(lower.slice(0, -2)) || englishWords.has(lower.slice(0, -2) + 'e'))) return false;
  if (lower.endsWith('ity') && (englishWords.has(lower.slice(0, -3)) || englishWords.has(lower.slice(0, -3) + 'e'))) return false;
  if (lower.endsWith('ance') && (englishWords.has(lower.slice(0, -4)) || englishWords.has(lower.slice(0, -4) + 'e'))) return false;
  if (lower.endsWith('ence') && (englishWords.has(lower.slice(0, -4)) || englishWords.has(lower.slice(0, -4) + 'e') || englishWords.has(lower.slice(0, -4) + 'ent'))) return false;
  if (lower.endsWith('ward') && englishWords.has(lower.slice(0, -4))) return false;
  if (lower.endsWith('wards') && englishWords.has(lower.slice(0, -5))) return false;
  if (lower.endsWith('dom') && englishWords.has(lower.slice(0, -3))) return false;
  if (lower.endsWith('ship') && englishWords.has(lower.slice(0, -4))) return false;
  if (lower.endsWith('able') && (englishWords.has(lower.slice(0, -4)) || englishWords.has(lower.slice(0, -4) + 'e'))) return false;
  if (lower.endsWith('ible') && (englishWords.has(lower.slice(0, -4)) || englishWords.has(lower.slice(0, -4) + 'e'))) return false;

  // Gender/number markers are OK: "(m)", "(f)", "(pl)", "(mp)", "(fp)"
  // Slash alternatives are OK: "things/words", "return/repent"
  if (/^[a-z]+\/[a-z]+$/i.test(clean)) {
    const parts = clean.split('/');
    if (parts.every(p => englishWords.has(p.toLowerCase()) || p.length <= 2)) return false;
  }

  // NOW check for transliteration patterns
  // The transliterate() function produces specific patterns
  const vowelCount = (lower.match(/[aeiou]/g) || []).length;
  const ratio = vowelCount / lower.length;

  // Consonant-heavy (< 20% vowels) and 4+ chars = very likely transliteration
  if (ratio < 0.2 && lower.length >= 4) return true;

  // 4+ consecutive consonants
  if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(lower)) return true;

  // Starts with 3+ consonants (non-English pattern)
  if (/^[bcdfghjklmnpqrstvwxyz]{3}/i.test(lower) && lower.length >= 4) return true;

  // Contains Hebrew characters
  if (/[\u0590-\u05FF]/.test(clean)) return true;

  return false;
}

const re = /\["([^"]+)","([^"]*)"\]/g;
let match;
const badGlosses = {};
let total = 0;

while ((match = re.exec(bom)) !== null) {
  const heb = match[1];
  const gloss = match[2];
  if (!gloss || gloss === '' || heb === '׃') continue;
  total++;

  let isBad = false;
  let badSeg = '';

  // Check for Hebrew chars in gloss
  if (/[\u0590-\u05FF]/.test(gloss)) {
    isBad = true;
    badSeg = 'HEBREW-IN-GLOSS';
  }

  if (!isBad) {
    const segments = gloss.split('-');
    for (const seg of segments) {
      if (isGenuinelyBadTranslit(seg)) {
        isBad = true;
        badSeg = seg;
        break;
      }
    }
  }

  if (isBad) {
    const key = heb + '||' + gloss;
    if (!badGlosses[key]) badGlosses[key] = { hebrew: heb, gloss, badSegment: badSeg, count: 0 };
    badGlosses[key].count++;
  }
}

const sorted = Object.values(badGlosses).sort((a, b) => b.count - a.count);
const totalBad = sorted.reduce((s, e) => s + e.count, 0);

console.log('Total glosses scanned:', total);
console.log('Genuinely bad transliterations:', sorted.length, 'unique,', totalBad, 'total occurrences');
console.log('\n--- Top 100 (by frequency) ---');
sorted.slice(0, 100).forEach(s => console.log(`  "${s.gloss}" ← ${s.hebrew} x${s.count} [bad: "${s.badSegment}"]`));
console.log('\n--- Count distribution ---');
const ranges = { '10+': 0, '5-9': 0, '2-4': 0, '1': 0 };
sorted.forEach(s => {
  if (s.count >= 10) ranges['10+']++;
  else if (s.count >= 5) ranges['5-9']++;
  else if (s.count >= 2) ranges['2-4']++;
  else ranges['1']++;
});
console.log(ranges);

fs.writeFileSync('bad_glosses_strict.json', JSON.stringify(sorted, null, 2));
console.log('\nSaved bad_glosses_strict.json');
