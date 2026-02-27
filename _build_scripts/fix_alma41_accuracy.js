const fs = require('fs');
let c = fs.readFileSync('BOM.html', 'utf8');

// ALMA 41 — Comprehensive accuracy fixes
// Comparing every gloss against the actual English BOM text
// Going for 100% accuracy on sacred text

const fixes = [
  // === CRITICAL FIXES (clearly wrong glosses) ===

  // v7: הַנִּמְלָטִים = Niphal ptc mp of מלט = "the-ones-delivered" (NOT "the-cement-of(pl)")
  ['["הַנִּמְלָטִים","the-cement-of(pl)"]', '["הַנִּמְלָטִים","the-ones-delivered"]'],

  // v8: חֻקּוֹת = "decrees/statutes-of" (NOT "the-priestcrafts-of")
  // English: "the decrees of God are unalterable"
  ['["חֻקּוֹת","the-priestcrafts-of"]', '["חֻקּוֹת","the-decrees-of"]'],

  // v12: וּלְשׂוּמוֹ first occurrence = "and-to-place-it" (NOT "and-to-tread-them-down")
  // שׂום/שים = to place/put. English: "and place it in an unnatural state"
  ['["וּלְשׂוּמוֹ","and-to-tread-them-down"]', '["וּלְשׂוּמוֹ","and-to-place-it"]'],

  // v13: שֵׁדִי = "devilish" (NOT "Almighty")
  // שֵׁדִי (shedi, from שֵׁד demon) ≠ שַׁדַּי (Shaddai, Almighty)
  // English: "devilish for devilish"
  ['["שֵׁדִי","Almighty"]', '["שֵׁדִי","devilish"]'],

  // v15: מַצְדִּיקוֹ = Hiphil ptc of צדק + 3ms suffix = "justifies-him"
  // (NOT "from-righteous-his"). English: "justifieth him not at all"
  ['["מַצְדִּיקוֹ","from-righteous-his"]', '["מַצְדִּיקוֹ","justifies-him"]'],

  // v15: תִּשְׁלַח = "you-shall-send-forth" (typo: was "you-will-sent")
  ['["תִּשְׁלַח","you-will-sent"]', '["תִּשְׁלַח","you-shall-send-forth"]'],

  // === IMPORTANT FIXES (incorrect/misleading) ===

  // v4: יוּקַם = Hophal impf 3ms of קום = "shall-be-raised" (not "shall-be-established")
  // English: "mortality raised to immortality"
  ['["יוּקַם","shall-be-established"]', '["יוּקַם","shall-be-raised"]'],

  // v4: יוּקְמוּ = Hophal impf 3mp of קום = "shall-be-raised"
  ['["יוּקְמוּ","should-be-established"]', '["יוּקְמוּ","shall-be-raised"]'],

  // v5: אׇשְׁרוֹ = אֹשֶׁר + 3ms suffix = "his-happiness" (NOT "which-his")
  ['["אׇשְׁרוֹ","which-his"]', '["אׇשְׁרוֹ","his-happiness"]'],

  // v6: מֵחֲטָאָיו = from-sins-his (3ms suffix, not 3mp)
  // English: "repented of his sins"
  ['["מֵחֲטָאָיו","from-their-sins"]', '["מֵחֲטָאָיו","from-his-sins"]'],

  // v6: וְחָמַד = "and-desired" (not "and-he-coveted" — coveted has negative connotation)
  // English: "and desired righteousness"
  ['["וְחָמַד","and-he-coveted"]', '["וְחָמַד","and-desired"]'],

  // v7: הַמּוּצָאִים = Hophal ptc mp of יצא = "the-ones-taken-out"
  // English: "they who are taken out"
  ['["הַמּוּצָאִים","the-going-forth"]', '["הַמּוּצָאִים","the-ones-taken-out"]'],

  // v7: שֹׁפְטֵי = construct plural of שׁוֹפֵט = "judges-of"
  // English: "they are their own judges"
  ['["שֹׁפְטֵי","judged-my"]', '["שֹׁפְטֵי","judges-of"]'],

  // v8: נָכוֹנָה = "prepared" (not "sure")
  // English: "the way is prepared"
  ['["נָכוֹנָה","sure"]', '["נָכוֹנָה","prepared"]'],

  // v11: בְּרֹאשׁ = "in-the-gall-of" (ראש = gall/poison in this context)
  // English: "in the gall of bitterness"
  ['["בְּרֹאשׁ","at-the-head-of"]', '["בְּרֹאשׁ","in-the-gall-of"]'],

  // v14: רַחוּם = "merciful" (not "tender")
  // English: "see that you are merciful unto your brethren"
  ['["רַחוּם","tender"]', '["רַחוּם","merciful"]'],

  // v14: שְׂכָרֶךָ = "your-reward" (not "reward-your" — wrong word order)
  ['["שְׂכָרֶךָ","reward-your"]', '["שְׂכָרֶךָ","your-reward"]'],

  // v14: יוּשַׁב = Hophal of שׁוּב = "shall-be-restored" (not "was-settled")
  // English: "ye shall have mercy restored unto you again"
  ['["יוּשַׁב","was-settled"]', '["יוּשַׁב","shall-be-restored"]'],

  // v14: שְׁפֹט = imperative of שׁפט = "judge!" (not "judged")
  // English: "judge righteously"
  ['["שְׁפֹט","judged"]', '["שְׁפֹט","judge!"]'],

  // v15: יָשׁוּב = "shall-return" (not "repent" in this context)
  // English: "that which ye do send out shall return unto you again"
  // NOTE: Be careful — יָשׁוּב as "repent" may be correct in other contexts
  // Only fix the specific pairing if it's wrong everywhere
  // Actually let's skip this one — "repent" is a valid meaning of שׁוּב

  // v15: מַרְשִׁיעַ = Hiphil ptc of רשׁע = "condemns" (not just "condemning")
  // English: "more fully condemneth the sinner"
  ['["מַרְשִׁיעַ","condemning"]', '["מַרְשִׁיעַ","condemns"]'],

  // v1: וַיִּתְעוּ = vav-consecutive + impf 3mp of תעה = "and-they-went-astray"
  // (not "therefore-they-wandered" — no "therefore" in vayyiqtol)
  // English: "and have gone far astray"
  ['["וַיִּתְעוּ","therefore-they-wandered"]', '["וַיִּתְעוּ","and-they-went-astray"]'],

  // v12: הֲפֵרוּשׁ = "the-meaning-of" (not "the-interpretation-of")
  // English: "is the meaning of the word restoration"
  ['["הֲפֵרוּשׁ","the-interpretation-of"]', '["הֲפֵרוּשׁ","the-meaning-of"]'],

  // v9: סִכַּנְתָּ = Piel perfect 2ms of סכן = "you-risked" (not "danger-of")
  ['["סִכַּנְתָּ","danger-of"]', '["סִכַּנְתָּ","you-have-risked"]'],

  // v14: וַעֲשֵׂה = "and-do" (not "you-may-do")
  // English: "and do good continually"
  ['["וַעֲשֵׂה","you-may-do"]', '["וַעֲשֵׂה","and-do"]'],
];

let totalFixed = 0;
fixes.forEach(([search, replace]) => {
  const count = c.split(search).length - 1;
  if (count > 0) {
    c = c.split(search).join(replace);
    const newGloss = replace.split(',"')[1].replace('"]', '');
    const oldGloss = search.split(',"')[1].replace('"]', '');
    console.log(`FIXED: ${oldGloss} -> ${newGloss} (${count}x)`);
    totalFixed += count;
  } else {
    console.log(`NOT FOUND: ${search}`);
  }
});

console.log(`\nTotal fixes applied: ${totalFixed}`);
fs.writeFileSync('BOM.html', c, 'utf8');
console.log('BOM.html saved.');
