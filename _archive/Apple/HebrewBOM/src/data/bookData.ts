export interface BookInfo {
  prefix: string;
  name: string;
  hebrewName: string;
  count: number;
  index: number;
}

export const BOOK_DATA: BookInfo[] = [
  { prefix: 'ch',    name: '1 Nephi',         hebrewName: 'נֶפִי א׳',           count: 22, index: 1 },
  { prefix: '2n-ch', name: '2 Nephi',         hebrewName: 'נֶפִי ב׳',           count: 33, index: 2 },
  { prefix: 'jc-ch', name: 'Jacob',           hebrewName: 'יַעֲקֹב',            count: 7,  index: 3 },
  { prefix: 'en-ch', name: 'Enos',            hebrewName: 'אֱנוֹשׁ',            count: 1,  index: 4 },
  { prefix: 'jr-ch', name: 'Jarom',           hebrewName: 'יָרוֹם',             count: 1,  index: 5 },
  { prefix: 'om-ch', name: 'Omni',            hebrewName: 'עָמְנִי',            count: 1,  index: 6 },
  { prefix: 'wm-ch', name: 'Words of Mormon', hebrewName: 'דִּבְרֵי מוֹרְמוֹן', count: 1,  index: 7 },
  { prefix: 'mo-ch', name: 'Mosiah',          hebrewName: 'מוֹשִׁיָּה',         count: 29, index: 8 },
  { prefix: 'al-ch', name: 'Alma',            hebrewName: 'אַלְמָא',           count: 63, index: 9 },
  { prefix: 'he-ch', name: 'Helaman',         hebrewName: 'הֵילָמָן',           count: 16, index: 10 },
  { prefix: '3n-ch', name: '3 Nephi',         hebrewName: 'נֶפִי ג׳',           count: 30, index: 11 },
  { prefix: '4n-ch', name: '4 Nephi',         hebrewName: 'נֶפִי ד׳',           count: 1,  index: 12 },
  { prefix: 'mm-ch', name: 'Mormon',          hebrewName: 'מוֹרְמוֹן',          count: 9,  index: 13 },
  { prefix: 'et-ch', name: 'Ether',           hebrewName: 'עֵתֶר',              count: 15, index: 14 },
  { prefix: 'mr-ch', name: 'Moroni',          hebrewName: 'מוֹרוֹנִי',          count: 10, index: 15 },
];

export const SINGLE_CHAPTER_BOOKS = new Set(['en-ch', 'jr-ch', 'om-ch', 'wm-ch', '4n-ch']);

export const BOOK_PREFIX_TO_NAME: Record<string, string> = {};
export const BOOK_NAME_TO_PREFIX: Record<string, string> = {};
BOOK_DATA.forEach(b => {
  BOOK_PREFIX_TO_NAME[b.prefix] = b.name;
  BOOK_NAME_TO_PREFIX[b.name] = b.prefix;
});

export function buildChapterOrder(): string[] {
  const order: string[] = [];
  for (const book of BOOK_DATA) {
    for (let i = 1; i <= book.count; i++) {
      order.push(book.prefix + i);
    }
  }
  return order;
}

export const CHAPTER_ORDER = buildChapterOrder();

export function getChapterLabel(chapterId: string): string {
  for (const book of BOOK_DATA) {
    if (chapterId.startsWith(book.prefix)) {
      const num = parseInt(chapterId.slice(book.prefix.length), 10);
      if (SINGLE_CHAPTER_BOOKS.has(book.prefix)) {
        return book.name;
      }
      return `${book.name} ${num}`;
    }
  }
  return chapterId;
}

export function getBookAndChapter(chapterId: string): { book: BookInfo; chapter: number } | null {
  for (const book of BOOK_DATA) {
    if (chapterId.startsWith(book.prefix)) {
      const num = parseInt(chapterId.slice(book.prefix.length), 10);
      return { book, chapter: num };
    }
  }
  return null;
}

export function toHebNum(n: number): string {
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  if (n <= 0) return '';
  if (n >= 100) return n.toString();
  const t = Math.floor(n / 10);
  const o = n % 10;
  let s = tens[t] + ones[o];
  if (s === 'יה') s = 'טו';
  if (s === 'יו') s = 'טז';
  return s + '׳';
}

// Scripture abbreviation maps for cross-references
export const BOM_ABBREVS_TO_BOOK: Record<string, string> = {
  '1 Ne.': '1 Nephi', '2 Ne.': '2 Nephi', '3 Ne.': '3 Nephi', '4 Ne.': '4 Nephi',
  'Jacob': 'Jacob', 'Enos': 'Enos', 'Jarom': 'Jarom', 'Omni': 'Omni',
  'W of M': 'Words of Mormon', 'Mosiah': 'Mosiah', 'Alma': 'Alma',
  'Hel.': 'Helaman', 'Morm.': 'Mormon', 'Ether': 'Ether', 'Moro.': 'Moroni',
};

export const ABBR_TO_FULL_BOOK: Record<string, string> = {
  'Gen.': 'Genesis', 'Ex.': 'Exodus', 'Lev.': 'Leviticus', 'Num.': 'Numbers',
  'Deut.': 'Deuteronomy', 'Josh.': 'Joshua', 'Judg.': 'Judges', 'Ruth': 'Ruth',
  '1 Sam.': '1 Samuel', '2 Sam.': '2 Samuel', '1 Kgs.': '1 Kings', '2 Kgs.': '2 Kings',
  '1 Chr.': '1 Chronicles', '2 Chr.': '2 Chronicles', 'Ezra': 'Ezra', 'Neh.': 'Nehemiah',
  'Esth.': 'Esther', 'Job': 'Job', 'Ps.': 'Psalms', 'Prov.': 'Proverbs',
  'Eccl.': 'Ecclesiastes', 'Isa.': 'Isaiah', 'Jer.': 'Jeremiah',
  'Lam.': 'Lamentations', 'Ezek.': 'Ezekiel', 'Dan.': 'Daniel', 'Hosea': 'Hosea',
  'Joel': 'Joel', 'Amos': 'Amos', 'Obad.': 'Obadiah', 'Jonah': 'Jonah',
  'Micah': 'Micah', 'Nahum': 'Nahum', 'Hab.': 'Habakkuk', 'Zeph.': 'Zephaniah',
  'Hag.': 'Haggai', 'Zech.': 'Zechariah', 'Mal.': 'Malachi',
  'Matt.': 'Matthew', 'Mark': 'Mark', 'Luke': 'Luke', 'John': 'John',
  'Acts': 'Acts', 'Rom.': 'Romans', '1 Cor.': '1 Corinthians', '2 Cor.': '2 Corinthians',
  'Gal.': 'Galatians', 'Eph.': 'Ephesians', 'Philip.': 'Philippians', 'Col.': 'Colossians',
  '1 Thes.': '1 Thessalonians', '2 Thes.': '2 Thessalonians',
  '1 Tim.': '1 Timothy', '2 Tim.': '2 Timothy', 'Titus': 'Titus', 'Philem.': 'Philemon',
  'Heb.': 'Hebrews', 'James': 'James', '1 Pet.': '1 Peter', '2 Pet.': '2 Peter',
  '1 Jn.': '1 John', '2 Jn.': '2 John', '3 Jn.': '3 John', 'Jude': 'Jude', 'Rev.': 'Revelation',
  'D&C': 'D&C', 'Moses': 'Moses', 'Abr.': 'Abraham', 'JS—H': 'JS-H', 'JS—M': 'JS-M', 'A of F': 'A-of-F',
};
