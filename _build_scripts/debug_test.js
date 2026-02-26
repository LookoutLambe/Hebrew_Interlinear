function stripNiqqud(str) {
  return str.replace(/[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4-\u05C7]/g, '');
}
function normalizeHebrew(str) {
  return stripNiqqud(str).replace(/[׃־]/g, '');
}

const tests = [
  { hebrew: 'פַּחַד', gloss: 'Pchd' },
  { hebrew: 'שִׂמְחַת', gloss: 'Shmcht' },
  { hebrew: 'הַדִּבְרָה', gloss: 'Hdbrh' },
  { hebrew: 'מֶלֶק', gloss: 'Mlk' },
  { hebrew: 'קָרוּ', gloss: 'Kro' },
  { hebrew: 'הֶרֶס', gloss: 'Hrs' },
  { hebrew: 'שִׁיז', gloss: 'Shiz' },
  { hebrew: 'שׁוּלֶה', gloss: 'Shule' },
  { hebrew: 'קִישְׁקוּמֶן', gloss: 'Kishkumen' },
];

tests.forEach(t => {
  const g = t.gloss;
  const hasHebrew = /[\u05D0-\u05EA]/.test(g);
  const hasVowels = /[aeiou]/i.test(g);
  const startsLatin = /^[A-Za-z]/.test(g);
  const longEnough = g.length > 3;
  const hasHyphen = g.includes('-');
  const isProperName = /^[A-Z][a-z]+$/.test(g);
  const isReasonable = startsLatin && hasVowels && (hasHebrew === false) && longEnough && (hasHyphen || isProperName);
  console.log(t.gloss, '| hasVowels:', hasVowels, '| longEnough:', longEnough, '| isProperName:', isProperName, '| isReasonable:', isReasonable);
});
