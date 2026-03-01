// Comprehensive Hebrew transliteration engine
// Ported from BOM.html _tlPointed() + transliterate()

interface Token {
  c: string;    // Hebrew consonant character
  dag: boolean; // has dagesh
  shin: boolean; // shin dot (true=shin, false=sin)
  vowel: string; // vowel character
}

interface Segment {
  c: string;     // transliterated consonant
  v: string;     // transliterated vowel
  ov: string;    // original vowel char
  hc: string;    // original Hebrew consonant
  dag: boolean;
  doubled?: boolean;
  furtive?: boolean;
  stress?: boolean;
}

// Known word transliteration dictionary
const _tlKnown: Record<string, string> = {
  'אב':'av','אח':'ach','אל':'el','אם':'em','אש':'esh','את':'et',
  'בן':'ben','גד':'gad','דם':'dam','חי':'chai','חן':'chen','יד':'yad',
  'ים':'yam','כל':'kol','כן':'ken','לב':'lev','עד':'ad','על':'al',
  'עם':'am','רב':'rav','שם':'shem','שר':'sar',
  'כי':'ki','לא':'lo','גם':'gam','מן':'min','אשר':'asher',
  'אבד':'avad','אדם':'adam','אהב':'ahav','אור':'or','אמר':'amar',
  'אנש':'enosh','ארץ':'erets','בוא':'bo','בית':'bayit','בנה':'banah',
  'ברא':'bara','ברך':'barakh','גדל':'gadal','גלה':'galah','דבר':'davar',
  'דרך':'derekh','הלך':'halakh','היה':'hayah','הלל':'halal','הנה':'hinneh',
  'זכר':'zakhar','זרע':'zera','חדש':'chadash','חזק':'chazaq','חטא':'chata',
  'חיה':'chayah','חכם':'chakham','חנן':'chanan','חסד':'chesed',
  'טוב':'tov','ידע':'yada','ידה':'yadah','יום':'yom','ילד':'yalad',
  'ירא':'yare','ירד':'yarad','ירש':'yarash','ישב':'yashav','ישע':'yasha',
  'ישר':'yashar','כון':'kun','כפר':'kafar','כרת':'karat',
  'כתב':'katav','לחם':'lacham','למד':'lamad','לקח':'laqach','מלא':'male',
  'מלך':'melekh','משח':'mashach','משל':'mashal','משפט':'mishpat','מות':'mut',
  'נבא':'nava','נגד':'nagad','נפל':'nafal','נשא':'nasa',
  'נתן':'natan','ספר':'sefer','עבד':'avad','עבר':'avar','עלה':'alah',
  'עמד':'amad','ענה':'anah','עשה':'asah','פקד':'paqad',
  'צבא':'tsava','צדק':'tsedek','צוה':'tsavah','קום':'qum',
  'קול':'qol','קרא':'qara','קרב':'qarav','ראה':'raah','ראש':'rosh',
  'רחם':'racham','שוב':'shuv','שלח':'shalach','שלם':'shalam',
  'שמע':'shama','שמר':'shamar','שפט':'shafat',
  'חכמה':'chokhmah','חכמת':'chokhmat','חפץ':'chofets','עז':'oz',
  'קדש':'qodesh','חק':'choq','חרב':'chorev','עלם':'olam',
  'אזן':'ozen','חפן':'chofen','קרבן':'qorban','שרש':'shoresh',
  'מוסר':'musar','אלהים':'elohim','יהוה':'Adonai','נביא':'navi',
  'תורה':'torah','שלום':'shalom','ברית':'berit','כהן':'kohen',
  'נפש':'nefesh','רוח':'ruach','משיח':'mashiach','תפלה':'tefilah',
  'אמונה':'emunah','תשובה':'teshuvah','גאולה':'geulah',
  'שופט':'shofet','מלכות':'malkhut','נחלה':'nachalah',
};

// Nikkud-aware transliteration with full Hebrew phonological rules
function _tlPointed(text: string): string {
  // Tetragrammaton
  const stripped = text.replace(/[\u0591-\u05C7]/g, '');
  if (stripped === '\u05D9\u05D4\u05D5\u05D4') return 'Adonai';

  const vmap: Record<string, string> = {
    '\u05B0':'e', '\u05B1':'\u0115', '\u05B2':'\u0103', '\u05B3':'\u014F',
    '\u05B4':'i', '\u05B5':'e', '\u05B6':'e', '\u05B7':'a',
    '\u05B8':'a', '\u05B9':'o', '\u05BA':'o', '\u05BB':'u',
  };
  const cmap: Record<string, string> = {
    'א':'\u02BE','ב':'v','ג':'g','ד':'d','ה':'h','ו':'v','ז':'z','ח':'\u1E25','ט':'t',
    'י':'y','כ':'kh','ך':'kh','ל':'l','מ':'m','ם':'m','נ':'n','ן':'n','ס':'s',
    'ע':'\u02BF','פ':'f','ף':'f','צ':'ts','ץ':'ts','ק':'k','ר':'r','ש':'sh','ת':'t',
  };
  const dmap: Record<string, string> = {'ב':'b','כ':'k','ך':'k','פ':'p','ף':'p'};

  // Parse into tokens
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    const code = ch.charCodeAt(0);
    if (code >= 0x05D0 && code <= 0x05EA) {
      const tok: Token = { c: ch, dag: false, shin: true, vowel: '' };
      i++;
      while (i < text.length) {
        const mc = text[i].charCodeAt(0);
        if (mc === 0x05BC) { tok.dag = true; i++; }
        else if (mc === 0x05C1) { tok.shin = true; i++; }
        else if (mc === 0x05C2) { tok.shin = false; i++; }
        else if (mc >= 0x05B0 && mc <= 0x05BB) { tok.vowel = text[i]; i++; }
        else if ((mc >= 0x0591 && mc <= 0x05AF) || mc === 0x05BD) { i++; }
        else break;
      }
      tokens.push(tok);
    } else { i++; }
  }

  const segments: Segment[] = [];
  const len = tokens.length;
  const bgdkpt = '\u05D1\u05D2\u05D3\u05DB\u05E4\u05EA';

  for (let t = 0; t < len; t++) {
    const tk = tokens[t];
    const isLast = t === len - 1;

    // Consonant transliteration
    let c: string;
    if (tk.c === '\u05E9') c = tk.shin ? 'sh' : 's';
    else if (tk.dag && dmap[tk.c]) c = dmap[tk.c];
    else c = cmap[tk.c] || '';

    // Shuruk: vav + dagesh + no vowel = 'u'
    if (tk.c === '\u05D5' && tk.dag && !tk.vowel) {
      if (segments.length > 0) segments[segments.length - 1].v = 'u';
      else segments.push({ c: '', v: 'u', ov: '', hc: tk.c, dag: false });
      continue;
    }
    // Cholam male: vav with cholam
    if (tk.c === '\u05D5' && tk.vowel === '\u05B9') {
      if (segments.length > 0) segments[segments.length - 1].v = 'o';
      else segments.push({ c: '', v: 'o', ov: '', hc: tk.c, dag: false });
      continue;
    }
    // Cholam male variant
    if (tk.c === '\u05D5' && !tk.vowel && !tk.dag && t > 0 && tokens[t - 1].vowel === '\u05B9') continue;
    // Final he without vowel = silent
    if (tk.c === '\u05D4' && isLast && !tk.vowel && !tk.dag) continue;
    // Chiriq male
    if (tk.c === '\u05D9' && !tk.vowel && t > 0 && tokens[t - 1].vowel === '\u05B4') continue;
    // Tsere-yod
    if (tk.c === '\u05D9' && !tk.vowel && t > 0 && tokens[t - 1].vowel === '\u05B5') continue;

    // Vowel
    let v = tk.vowel ? (vmap[tk.vowel] || '') : '';
    const prevVowel = t > 0 ? tokens[t - 1].vowel : '';
    const nextTok = t < len - 1 ? tokens[t + 1] : null;

    // Shva rules
    if (tk.vowel === '\u05B0') {
      if (isLast) v = '';
      else if (tk.dag && bgdkpt.indexOf(tk.c) < 0) v = 'e';
      else if (tk.dag && bgdkpt.indexOf(tk.c) >= 0 && t > 0 && prevVowel && prevVowel !== '\u05B0') v = 'e';
      else if (prevVowel === '\u05B9') v = '';
      else if (prevVowel === '\u05B4') v = '';
      else if (t > 0 && tokens[t - 1].c === '\u05D5' && tokens[t - 1].dag && !tokens[t - 1].vowel) v = '';
      else if (nextTok && bgdkpt.indexOf(nextTok.c) >= 0 && nextTok.dag) v = '';
      // Sheva before final consonant with no vowel = nach (closes syllable)
      // Standard for wayyiqtol III-ה verbs (e.g., וַיַּרְא vayyarʾ)
      else if (nextTok && (t + 1 === len - 1) && !nextTok.vowel) v = '';
      else if (prevVowel === '\u05B0') v = 'e';
      else v = 'e';
    }

    // Qamets qatan
    if (tk.vowel === '\u05B8' && !isLast) {
      const nxt = tokens[t + 1];
      const nxtIsLast = t + 1 === len - 1;
      const suffixLetters = '\u05DD\u05DF\u05DA';
      const qGadolMono = 'אב דם שם עד על עם רב יד חן ים';
      const twoC = tk.c + nxt.c;
      if (nxtIsLast && !nxt.vowel && nxt.c !== '\u05D4' && suffixLetters.indexOf(nxt.c) < 0) {
        let realVowels = 0;
        for (let rv = 0; rv < len; rv++) {
          if (tokens[rv].vowel && tokens[rv].vowel !== '\u05B0') realVowels++;
        }
        if (realVowels <= 1 && qGadolMono.indexOf(twoC) < 0) v = 'o';
      }
      if (!nxtIsLast && nxt.vowel === '\u05B0') {
        const nxt2 = t + 2 < len ? tokens[t + 2] : null;
        if (nxt2 && bgdkpt.indexOf(nxt2.c) >= 0 && nxt2.dag) v = 'o';
      }
    }

    // Dagesh forte: double the consonant
    const isDagForte = tk.dag && bgdkpt.indexOf(tk.c) < 0 && t > 0 && !!prevVowel;
    const isBgdkptForte = tk.dag && bgdkpt.indexOf(tk.c) >= 0 && t > 0 && !!prevVowel && prevVowel !== '\u05B0';
    if (isDagForte || isBgdkptForte) {
      segments.push({ c, v: '', ov: '', hc: tk.c, dag: false, doubled: true });
    }

    // Mappiq he: final הּ with dagesh = pronounced "h"
    if (tk.c === '\u05D4' && isLast && tk.dag && !tk.vowel) {
      segments.push({ c: 'h', v: '', ov: '', hc: tk.c, dag: true });
      continue;
    }

    segments.push({ c, v, ov: tk.vowel || '', hc: tk.c, dag: !!tk.dag });
  }

  // Patach furtivum
  const gutturals = '\u05D7\u05E2\u05D4';
  let hasFurtive = false;
  if (segments.length >= 2) {
    const last = segments[segments.length - 1];
    if (gutturals.indexOf(last.hc) >= 0 && last.ov === '\u05B7') {
      last.furtive = true;
      last.v = 'a';
      hasFurtive = true;
    }
  }

  // Determine stressed syllable
  const syllables: number[] = [];
  for (let s = 0; s < segments.length; s++) {
    if (segments[s].v && !segments[s].doubled && !segments[s].furtive) syllables.push(s);
  }
  const syllCount = syllables.length;
  let stressIdx = -1;
  if (syllCount > 1) {
    stressIdx = syllables[syllCount - 1];
    const lastOV = segments[syllables[syllCount - 1]].ov;
    if (syllCount === 2 && lastOV === '\u05B6') {
      const lastSeg = segments[syllables[syllCount - 1]];
      const isDagF = lastSeg.dag && bgdkpt.indexOf(lastSeg.hc) < 0;
      if (!isDagF) stressIdx = syllables[0];
    }
    if (hasFurtive && stressIdx === segments.length - 1) {
      stressIdx = syllables[syllCount - 1];
    }
  }

  // Apply stress marking
  const macron: Record<string, string> = {
    'a': '\u0101', 'e': '\u0113', 'i': '\u012B', 'o': '\u014D', 'u': '\u016B',
  };
  if (stressIdx >= 0 && syllCount > 1) {
    const sv = segments[stressIdx].v;
    if (macron[sv]) segments[stressIdx].v = macron[sv];
    segments[stressIdx].stress = true;
  }

  // Build result
  let result = '';
  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s];
    if (seg.stress && result.length > 0) result += '\u02B9';
    if (seg.furtive) {
      result += seg.v + seg.c;
    } else {
      result += seg.c + seg.v;
    }
  }
  return result;
}

// Top-level transliterate dispatcher
export function transliterate(heb: string): string {
  if (heb.indexOf(' ') >= 0) {
    return heb.split(' ').map(p => transliterate(p)).join(' ');
  }
  if (heb.indexOf('\u05BE') >= 0) {
    return heb.split('\u05BE').map(p => transliterate(p)).join('-');
  }
  const hasNikkud = /[\u05B0-\u05BB]/.test(heb);
  if (hasNikkud) return _tlPointed(heb);

  const clean = heb.replace(/[\u0591-\u05C7]/g, '');
  if (_tlKnown[clean]) return _tlKnown[clean];

  const cmap: Record<string, string> = {
    'א':'','ב':'v','ג':'g','ד':'d','ה':'h','ו':'v','ז':'z','ח':'ch','ט':'t',
    'י':'y','כ':'kh','ך':'kh','ל':'l','מ':'m','ם':'m','נ':'n','ן':'n',
    'ס':'s','ע':'','פ':'f','ף':'f','צ':'ts','ץ':'ts','ק':'q','ר':'r','ש':'sh','ת':'t',
  };
  const cc: string[] = [];
  for (let i = 0; i < clean.length; i++) {
    const x = cmap[clean[i]];
    if (x !== undefined) cc.push(x);
  }
  if (cc.length === 0) return '';
  let r = '';
  for (let j = 0; j < cc.length; j++) {
    r += cc[j];
    if (j < cc.length - 1 && cc[j] && cc[j + 1]) r += 'a';
  }
  return r;
}
