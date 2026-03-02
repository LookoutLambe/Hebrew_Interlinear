// Strip Hebrew diacritics (nikkud/cantillation) to get consonantal form
export function stripNikkud(s: string): string {
  return s.replace(/[\u0591-\u05C7]/g, '');
}

// Normalize final letters to medial forms
export function normFinals(s: string): string {
  return s
    .replace(/ך/g, 'כ')
    .replace(/ם/g, 'מ')
    .replace(/ן/g, 'נ')
    .replace(/ף/g, 'פ')
    .replace(/ץ/g, 'צ');
}

// Strip Hebrew grammatical prefixes (vav, article, prepositions)
export function stripPrefixes(w: string): string {
  w = w.replace(/^.*־/, '');
  const prefixes = [
    /^וְ/, /^וַ/, /^וּ/, /^וָ/, /^וֶ/,
    /^הַ/, /^הָ/, /^הֶ/,
    /^בְּ/, /^בַּ/, /^בִּ/, /^בָּ/, /^בֶּ/, /^בְ/, /^בַ/, /^בִ/,
    /^לְ/, /^לַ/, /^לִ/, /^לָ/, /^לֶ/,
    /^מִ/, /^מֵ/, /^מְ/, /^מַ/,
    /^כְּ/, /^כַּ/, /^כְ/, /^כַ/,
    /^שֶׁ/, /^שֶ/,
  ];
  let stripped = w;
  for (const p of prefixes) {
    if (p.test(stripped) && stripped.replace(p, '').length >= 2) {
      stripped = stripped.replace(p, '');
      break;
    }
  }
  for (const p of prefixes) {
    if (p.test(stripped) && stripped.replace(p, '').length >= 2) {
      stripped = stripped.replace(p, '');
      break;
    }
  }
  return stripped;
}

// Morphological 3-letter root extraction (5-pass algorithm)
export function extractRoot(cons: string): string {
  let s = normFinals(cons);
  if (s.length <= 3) return s;
  if (s.length === 0) return cons;

  // Pass 1: strip suffixes (longest first)
  const sufs = [
    'תיהם', 'ותיהם', 'ותינו',
    'יהם', 'יהן', 'ותם', 'ותן', 'תיו', 'תיה', 'תנו',
    'כם', 'כן', 'נו', 'תי', 'תם', 'תן', 'ים', 'ות', 'ון', 'ין', 'הם', 'הן',
    'ה', 'ו', 'ם', 'ן', 'י', 'ת', 'כ',
  ];
  let stem = s;
  for (const suf of sufs) {
    if (stem.length > suf.length + 2 && stem.endsWith(suf)) {
      stem = stem.slice(0, -suf.length);
      break;
    }
  }
  if (stem.length === 3) return stem;

  // Pass 2: strip verbal prefixes
  if (stem.length >= 5 && (stem.slice(0, 2) === 'הת' || stem.slice(0, 2) === 'מת')) {
    stem = stem.slice(2);
  } else if (stem.length >= 4 && /^[היתאנמ]/.test(stem)) {
    stem = stem.slice(1);
  }
  if (stem.length === 3) return stem;

  // Pass 3: doubled middle consonant (Piel/Pual)
  if (stem.length === 4 && stem[1] === stem[2]) {
    return stem[0] + stem[1] + stem[3];
  }

  // Pass 4: try suffix strip again
  for (const suf of sufs) {
    if (stem.length > suf.length + 2 && stem.endsWith(suf)) {
      stem = stem.slice(0, -suf.length);
      break;
    }
  }
  if (stem.length === 3) return stem;

  // Pass 5: try prefix strip again
  if (stem.length >= 4 && /^[היתאנמ]/.test(stem)) {
    stem = stem.slice(1);
  }
  if (stem.length === 3) return stem;

  if (stem.length === 4 && stem[1] === stem[2]) {
    return stem[0] + stem[1] + stem[3];
  }

  return stem.length > 3 ? stem.slice(0, 3) : stem;
}

// Hebrew alphabetical sort comparator
const ALEPH_BET = 'אבגדהוזחטיכלמנסעפצקרשת';

export function hebrewSort(a: string, b: string): number {
  const ac = normFinals(stripNikkud(a));
  const bc = normFinals(stripNikkud(b));
  for (let i = 0; i < Math.min(ac.length, bc.length); i++) {
    const ai = ALEPH_BET.indexOf(ac[i]);
    const bi = ALEPH_BET.indexOf(bc[i]);
    if (ai !== bi) return ai - bi;
  }
  return ac.length - bc.length;
}

// Get first Hebrew letter (for section grouping)
export function hebrewFirstLetter(s: string): string {
  const stripped = normFinals(stripNikkud(s));
  return stripped.length > 0 ? stripped[0] : '';
}

// Feminine construct ה→ת swap
export function fixFemConstruct(root: string): string {
  if (root.length === 3 && root[2] === 'ת') {
    return root.slice(0, 2) + 'ה';
  }
  return root;
}
