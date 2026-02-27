const fs = require('fs');
let c = fs.readFileSync('BOM.html', 'utf8');

// Fixes for Alma 41 transliteration placeholders
// Each: [search_pair, replacement_pair]
const fixes = [
  ['["עִוְּתוּ","Oto"]',      '["עִוְּתוּ","they-perverted"]'],
  ['["עֻוְּתוּ","Oto"]',      '["עֻוְּתוּ","they-perverted"]'],
  ['["נִדְאַג","Ndg"]',       '["נִדְאַג","was-troubled"]'],
  ['["גְּוִיָּתָהּ","Goith"]',  '["גְּוִיָּתָהּ","her-body"]'],
  ['["אֵבֶר","Vr"]',          '["אֵבֶר","limb"]'],
  ['["תְּכוּנָתוֹ","Tkonto"]', '["תְּכוּנָתוֹ","its-nature"]'],
  ['["לַטּוֹב","Ltob"]',       '["לַטּוֹב","to-the-good"]'],
  ['["טוּבוֹ","Tobo"]',        '["טוּבוֹ","his-goodness"]'],
  ['["רָעָתוֹ","Rto"]',        '["רָעָתוֹ","his-evil"]'],
  ['["יִגָּמֶל","Igml"]',      '["יִגָּמֶל","he-shall-be-rewarded"]'],
  ['["גְּאוּלֵי","Goli"]',     '["גְּאוּלֵי","redeemed-ones-of"]'],
  ['["מִלֵּיל","Mlil"]',       '["מִלֵּיל","from-the-night-of"]'],
  ['["וְנוֹשָׁע׃","Onosh"]',   '["וְנוֹשָׁע׃","and-be-saved"]'],
  ['["תּוֹסֵף","Tosf"]',       '["תּוֹסֵף","you-shall-add"]'],
  ['["תּוּשַׁב","Toshb"]',     '["תּוּשַׁב","you-shall-be-restored"]'],
  ['["בַּטֶּבַע","Vtv"]',      '["בַּטֶּבַע","in-the-nature"]'],
  ['["וּבְמוֹסְרוֹת","Obmosrot"]', '["וּבְמוֹסְרוֹת","and-in-the-bonds-of"]'],
  ['["טֶבַע","Tv"]',           '["טֶבַע","nature"]'],
  ['["וְיִגָּמֶל","Oigml"]',   '["וְיִגָּמֶל","and-shall-be-rewarded"]'],
  ['["וְנוֹשָׁב","Onoshb"]',   '["וְנוֹשָׁב","and-restored"]'],
];

let totalFixed = 0;
fixes.forEach(([search, replace]) => {
  const count = c.split(search).length - 1;
  if (count > 0) {
    c = c.split(search).join(replace);
    console.log(`Fixed: ${search} -> ${replace.split(',"')[1].replace('"]','')} (${count}x)`);
    totalFixed += count;
  } else {
    console.log(`NOT FOUND: ${search}`);
  }
});

console.log(`\nTotal fixes: ${totalFixed}`);
fs.writeFileSync('BOM.html', c, 'utf8');
console.log('BOM.html saved.');
