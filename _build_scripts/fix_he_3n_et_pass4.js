#!/usr/bin/env node
/**
 * fix_he_3n_et_pass4.js - Pass 4: Final sweep targeting remaining vocabulary
 * Military/siege, vision/revelation, sailing, body/creation terms
 */
const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', '_chapter_data', 'he_data.js'),
  path.join(__dirname, '..', '_chapter_data', '3n_data.js'),
  path.join(__dirname, '..', '_chapter_data', 'et_data.js'),
];

const glossMap = {

  // ═══════════════════════════════════════
  // 3 NEPHI - MILITARY / SIEGE
  // ═══════════════════════════════════════
  'שִׁרְיוֹן': 'armor',
  'שִׁרְיוֹנָם': 'their-armor',
  'מָגֵן': 'shield',
  'צִנָּה': 'large-shield',
  'כוֹבַע': 'helmet',
  'מָצוֹר': 'siege',
  'הַמָּצוֹר': 'the-siege',
  'מְנוּסָה': 'flight',
  'מְנוּסָתָם': 'their-flight',
  'לֶחִימָה': 'battle/fighting',
  'הֶרֶג': 'slaughter',
  'הַהֶרֶג': 'the-slaughter',
  'טֶבַח': 'slaughter',
  'הַטֶּבַח': 'the-slaughter',
  'גַּעֲרוֹת': 'rebukes',
  'שְׁבוּעוֹתָיו': 'his-oaths',
  'וּשְׁבוּעוֹתָיו': 'and-his-oaths',
  'שְׁבוּיֵיהֶם': 'their-captives',
  'רִצְחֵי': 'murders-of',
  'רְצֹחַ': 'murder',
  'מִדָּתוֹ': 'his-measure',
  'מִבְטַחָם': 'their-trust',
  'הַחִיצֹנִים': 'the-outer-ones',
  'צֵידָה': 'provisions',
  'הַצֵּידָה': 'the-provisions',
  'צַיִד': 'game/hunt',
  'הַצַּיִד': 'the-hunt',
  'מִבְצְרֵיהֶם': 'their-fortresses',
  'סוּסֵיהֶם': 'their-horses',
  'מַרְכְּבוֹתֵיהֶם': 'their-chariots',
  'קְרוּחִים': 'shaved/bald',
  'טְבוּלִים': 'dipped',
  'דְּמָעוֹת': 'tears',
  'מְפִיחִים': 'ones-spreading/fomenting',

  // Army/command
  'מְנַהִיגָם': 'their-leader',
  'וּמְנַהִיגָם': 'and-their-leader',
  'מְנַהִיגִים': 'leaders',
  'לְמַנְהִיגִים': 'as-leaders',
  'הַמְמֻנִּים': 'the-appointed-ones',
  'וְהַמְמֻנִּים': 'and-the-appointed-ones',
  'פְּקִידִים': 'officials',
  'וּפְקִידִים': 'and-officials',
  'סוֹחֲרִים': 'merchants',
  'עוֹרְכֵי': 'arrangers-of',
  'בּוֹעֲרִים': 'burning',

  // Battle verbs
  'הִתְקַבְּצוּ': 'they-gathered',
  'וַיְבַצְּרוּ': 'and-they-fortified',
  'וַיִּתְחַזְּקוּ': 'and-they-strengthened-themselves',
  'הִתְנַפְּלוּ': 'they-attacked',
  'נָסוֹגוּ': 'they-retreated',
  'קָרְבוּ': 'they-drew-near',
  'מִלְּאוּ': 'they-filled',
  'אָצְרוּ': 'they-stored-up',
  'כָרְתוּ': 'they-cut-off',
  'הוֹסִיפוּ': 'they-added/continued',
  'שֻׁלְּחוּ': 'they-were-sent',
  'נֶאֶשְׁמוּ': 'they-were-found-guilty',
  'קִוּוּ': 'they-hoped',
  'הוּמְתוּ': 'they-were-put-to-death',
  'נִמְלַט': 'he-escaped',
  'נִרְדַּף': 'was-pursued',
  'הֻשַּׂג': 'was-overtaken',
  'וַיּוּמָת': 'and-he-was-put-to-death',

  // Military vayyiqtol
  'וַיַּאַסְפוּ': 'and-they-gathered',
  'וַיַּצֵּב': 'and-he-stationed',
  'וַיִּפְגְּשׁוּם': 'and-they-met-them',
  'וַיִּתְלֻהוּ': 'and-they-hanged-him',
  'וַיַּפִּילוּ': 'and-they-cast-down',
  'וַיִּפְצְחוּ': 'and-they-burst-forth',
  'וַיִּרְחַב': 'and-it-expanded',
  'וַיַּשְׁלִיכוּ': 'and-they-cast',
  'וַיַּכְרִיתוּם': 'and-they-cut-them-off',
  'וַיִּמְעַט': 'and-it-decreased',
  'וַתַּעֲבֹרְנָה': 'and-they-passed(f)',
  'וַיְכוֹנְנוּ': 'and-they-established',
  'וַיִּסָּלְלוּ': 'and-they-paved',
  'וַיֵּעָשׂוּ': 'and-they-were-made',
  'וַתִּבָּנֶינָה': 'and-they-were-built(f)',

  // Imperfect military
  'יַצִּילֵם': 'he-shall-deliver-them',
  'וְיַצִּילֵם': 'and-he-shall-deliver-them',
  'יַכְרִיתוּ': 'they-shall-cut-off',
  'יִכְרְתוּ': 'they-shall-be-cut-off',
  'וְיָצוּרוּ': 'and-they-shall-besiege',
  'יַפִּילוּ': 'they-shall-cast-down',
  'יִתְּנֵנוּ': 'he-shall-give-us',
  'יִתְּנֵם': 'he-shall-give-them',

  // ═══════════════════════════════════════
  // 3 NEPHI - POLITICAL / SOCIAL
  // ═══════════════════════════════════════
  'הָחָזוֹן': 'the-vision',
  'גְלוּיָה': 'open/public(f)',
  'הַקְּבוּעָה': 'the-fixed/established(f)',
  'הַגְּבוּל': 'the-border',
  'הָהֵן': 'those(f)',
  'תְּלָאוּהוּ': 'they-hanged-him',
  'חָלִילָה': 'God-forbid!',
  'אַרְצוֹתֵינוּ': 'our-lands',
  'שְׁבַע': 'seven',
  'תְּשַׁע': 'nine',
  'הַתְּשַׁע': 'the-nine',
  'הַשִּׁשִּׁי': 'the-sixth',
  'נִפֹּל': 'we-shall-fall',
  'דֻּבָּר': 'was-spoken',
  'פֶּרֶץ': 'breach',
  'מַחְיָה': 'sustenance',
  'מְסִלּוֹת': 'highways',
  'יְשָׁנוֹת': 'old(fp)',
  'הַהֹלְכוֹת': 'the-ones-going(f)',
  'אֵימַת': 'terror-of',
  'נִכְזְבָה': 'was-proven-false(f)',
  'תִקְוָתָם': 'their-hope',
  'עַנְוָתָם': 'their-humility',
  'וְעַנְוָתָם': 'and-their-humility',
  'פִּקְפֵּק': 'he-doubted',
  'הוּפַל': 'was-cast-down',
  'הׇפְקַד': 'was-appointed',
  'אֶל־אַרְצוֹתָם': 'to-their-lands',
  'וַאֲחֻזּוֹתֵיהֶם': 'and-their-possessions',
  'בַּעֲמָלָם': 'in-their-labor',
  'מֵהַצְלִיחַ': 'from-prospering',
  'בְפֶשַׁע': 'in-transgression',
  'תְּקֻנּוּ': 'they-were-repaired',
  'כְּדֵי': 'in-order-to',
  'וְיָדָם': 'and-their-hand',
  'וְנִכְנָעִים': 'and-humble-ones',
  'מָטִים': 'declining',
  'וְחָפְצוּ': 'and-they-desired',
  'וְעֹשֶׁר': 'and-wealth',
  'הִטָּה': 'he-inclined',
  'לְהִבָּדֵל': 'to-separate',
  'לְהִתְפָּרֵק': 'to-break-apart',
  'הִתְפָּרְקָה': 'it-broke-apart(f)',
  'לֶאֱמוּנַת': 'to-the-faith-of',
  'וְאֵיתָנִים': 'and-strong/firm',
  'וּלְנַפְּחָם': 'and-to-inflate-them',
  'לְפַתּוֹתָם': 'to-entice-them',

  // Vayyiqtol / waw forms
  'וְנַשְׁמִידֵם': 'and-we-shall-destroy-them',
  'וְנֶאֱסֹף': 'and-we-shall-gather',
  'וְהַמִּדְבָּר': 'and-the-wilderness',
  'וְסוּסִים': 'and-horses',
  'וּמִקְנֶה': 'and-livestock',
  'וּבְמָגֵן': 'and-with-a-shield',
  'וּבְצִנָּה': 'and-with-a-large-shield',
  'וּבְגוּף': 'and-in-body',
  'בְּשִׁרְיוֹן': 'in-armor',
  'וּמִמִּבְצְרֵיהֶם': 'and-from-their-fortresses',
  'וּמִמְּקוֹמוֹת': 'and-from-places',
  'וְצַיִד': 'and-game',
  'וּלְהַשִּׂיג': 'and-to-obtain',
  'וּבִהְיוֹת': 'and-in-being',
  'וּבְשָׁמְרָם': 'and-in-their-guarding',
  'לְהִתְפַּשֵּׁט': 'to-spread-out',
  'וְלִרְבָבוֹת': 'and-to-tens-of-thousands',
  'בַדָּם': 'in-the-blood',
  'בַּדָּם': 'in-the-blood',
  'וְכוֹבַע־בַּרְזֶל': 'and-a-helmet-of-iron',
  'לִצְעֹק': 'to-cry-out',
  'בְּשִׂמְחָתָם': 'in-their-joy',
  'לָחוּס': 'to-spare',
  'יָחוּס': 'he-shall-spare',
  'וְנִלְחַם': 'and-he-fought',
  'בְּנוּסוֹ': 'in-his-fleeing',
  'וּבִהְיוֹתוֹ': 'and-in-his-being',
  'יָגֵעַ': 'weary',
  'לָצוּר': 'to-besiege',
  'מֵאַרְצוֹתָם': 'from-their-lands',
  'לְהַכְנִיעָם': 'to-subdue-them',
  'עַל־הַמָּצוֹר': 'concerning-the-siege',
  'לְיִתְרוֹן': 'to-advantage',
  'וּמֵחֹסֶר': 'and-from-lack-of',
  'מִן־הַמָּצוֹר': 'from-the-siege',
  'וּבְיָדְעוֹ': 'and-in-his-knowing',
  'מִפָּנִים': 'from-the-front',
  'בְּשִׁיר': 'in-song',
  'וּבִתְהִלָּה': 'and-in-praise',
  'לֵאלֹהֵיהֶם': 'to-their-God',
  'בְּשָׁמְרוֹ': 'in-his-guarding',
  'הוֹשַׁע־נָא': 'save-please!/Hosanna!',
  'לָאֵל': 'to-God',
  'עַד־רֶדֶת': 'until-the-descent-of',
  'רֶדֶת': 'descent-of',
  'וְגִדְיָנְהִי': 'and-Giddianhi',
  'גִדְיָנְהִי': 'Giddianhi',
  'נוֹחִיל': 'we-shall-possess',
  'וּבוֹא': 'and-come!',
  'הוֹרָאָתוֹ': 'his-instruction',
  'בָּאֲרָצוֹת': 'in-the-lands',
  'מִכָּל־מִשְׁפְּטֵיהֶם': 'from-all-their-judgments',
  'וְקֶשֶׁר': 'and-conspiracy',
  'וּבְקֹדֶשׁ': 'and-in-holiness',
  'לַחָפְשִׁי': 'to-freedom',

  // ═══════════════════════════════════════
  // ETHER - VISION / REVELATION
  // ═══════════════════════════════════════
  'אֶצְבַּע': 'finger',
  'אֶצְבָּעִי': 'my-finger',
  'צַלְמִי': 'my-image',
  'בְּצַלְמִי': 'in-my-image',
  'כִּדְמוּת': 'in-the-likeness-of',
  'וְכַדְּמוּת': 'and-in-the-likeness-of',
  'מָסַךְ': 'veil',
  'אֶת־מָסַךְ': '[ACC]-the-veil',
  'אֻרִים': 'Urim',
  'הָאֻרִים': 'the-Urim',
  'חֲזוֹנוֹתַי': 'my-visions',
  'פִּתְרוֹנָם': 'their-interpretation',
  'זִכְרוֹנִי': 'my-memorial',

  // Ether verb forms
  'אֶלְבַּשׁ': 'I-shall-clothe',
  'יָכֹלְתָּ': 'you-were-able',
  'הֲרָאִיתָ': 'did-you-see?',
  'הֵרָאֵה': 'he-was-shown',
  'תְּדַבֵּר': 'you-shall-speak',
  'יְדַעְתָּ': 'you-knew',
  'נִפְדֵּיתָ': 'you-were-redeemed',
  'הוּשַׁבְתָּ': 'you-were-returned',
  'הוּכַנְתִּי': 'I-was-prepared',
  'הֶרְאֵיתִי': 'I-showed',
  'נִבְרֵאתָ': 'you-were-created',
  'נִרְאֵיתִי': 'I-appeared',
  'אֵרָאֶה': 'I-shall-appear',
  'שֵׁרֵת': 'he-served/ministered',
  'נִמְנַע': 'was-prevented',
  'אֲכַבֵּד': 'I-shall-honor',
  'תִּצְפֹּן': 'you-shall-hide',
  'תַרְאֵם': 'you-shall-show-them',
  'תִּכְתְּבֵם': 'you-shall-write-them',
  'תִכְתְּבֵם': 'you-shall-write-them',
  'וְתַחְתֹּם': 'and-you-shall-seal',
  'לְפָרְשָׁם': 'to-interpret-them',
  'בָּלַלְתִּי': 'I-confused',
  'אֶגְרֹם': 'I-shall-cause',
  'יַגְדִּילוּ': 'they-shall-magnify',
  'וַיַּרְאֵהוּ': 'and-he-showed-him',
  'מָנַע': 'he-prevented',
  'לְהַרְאוֹתוֹ': 'to-show-him',
  'וְיֵרָאוּ': 'and-they-shall-be-seen',
  'וַחֲתֹם': 'and-seal!',
  'לַחְתֹּם': 'to-seal',
  'לְהַרְאוֹתָן': 'to-show-them(f)',
  'וַיֵּאָסְרוּ': 'and-they-were-bound',
  'מִלָּבוֹא': 'from-coming',
  'לְהַטְמִינָם': 'to-hide-them',
  'וּכְתַבְתִּים': 'and-I-wrote-them',
  'חָתַמְתִּי': 'I-sealed',
  'יִתְקַדְּשׁוּ': 'they-shall-be-sanctified',
  'אַגְלֶה': 'I-shall-reveal',
  'אֶפְרֹשׂ': 'I-shall-spread-out',
  'הַמְּכַחֵשׁ': 'the-one-denying',
  'וְהַמִּתְוַכֵּחַ': 'and-the-one-contending',
  'הַמְּדַבֵּר': 'the-one-speaking',
  'יָאָר': 'he-shall-shine',
  'יִפָּתְחוּ': 'they-shall-be-opened',
  'וְיִסָּגְרוּ': 'and-they-shall-be-shut',
  'אֶפְקְדֵהוּ': 'I-shall-visit-him',
  'צָפַן': 'he-hid',
  'תִּקְרְעוּ': 'you(pl)-shall-tear',
  'הַגּוֹרֵם': 'the-one-causing',
  'נִצְפְּנוּ': 'they-were-hidden',
  'יִפָּרְשׂוּ': 'they-shall-be-interpreted',
  'תִּפְתְּרוּ': 'you(pl)-shall-interpret',
  'יֻתַּן': 'it-shall-be-given',
  'יַעַזְרוּ': 'they-shall-help',
  'תֵּרָאֶה': 'it-shall-be-seen',
  'תִּרְאוּנִי': 'you(pl)-shall-see-me',
  'הֵאִירוּ': 'they-shone',
  'לְהָאִיר': 'to-illuminate',

  // Ether nouns
  'מַדְרֶכֶת': 'path/guide',
  'הַמַּדְרִיךְ': 'the-guide',
  'הַטְּמוּנָה': 'the-hidden(f)',
  'הַחַיִּים': 'the-life',
  'בָּאָב': 'in-the-Father',
  'הַשְּׁלֵמָה': 'the-complete(f)',
  'הַמּוּכָנִים': 'the-prepared(mp)',
  'בְּכָל־קָצֶה': 'in-every-end-of',
  'וְהַמַּעֲשֶׂה': 'and-the-deed',
  'וְלִשְׁלֹשָׁה': 'and-to-three',
  'בַּמַּמְלָכָה': 'in-the-kingdom',
  'לְשָׁבְרָם': 'to-break-them',
  'מִפְלֶצֶת': 'terror/monster',
  'תַנִּין': 'sea-creature',
  'סְעָרָה': 'storm',
  'הַסְּעָרוֹת': 'the-storms',
  'וְהַנּוֹרָאוֹת': 'and-the-terrible-ones(f)',
  'מֵעֹז': 'from-strength',
  'בַמְּצוּלָה': 'in-the-deep',
  'סְפִינוֹתֵיהֶם': 'their-ships',
  'כְּתֵבַת': 'inscription-of',
  'תְהִלּוֹת': 'praises',
  'זִמֵּר': 'he-sang',
  'יָכְלָה': 'she-was-able',
  'הֵנִיף': 'he-waved',
  'נִדְחֲפוּ': 'they-were-pushed',
  'דָּרְכוּ': 'they-trod',
  'חוֹפֵי': 'shores-of',
  'וְלְיֶרֶד': 'and-to-Jared',
  'יָקוֹם': 'he-shall-rise',
  'וְגִלְגָּה': 'and-Gilgah',
  'גִלְגָּה': 'Gilgah',
  'וּמָהָה': 'and-Mahah',
  'מָהָה': 'Mahah',
  'כְּעֶשְׂרִים': 'about-twenty',
  'מִמָּרוֹם': 'from-on-high',
  'נַקְהִילָה': 'let-us-assemble',
  'נִסְפֹּר': 'we-shall-count',
  'מָה־יִּשְׁאֲלוּ': 'what-they-shall-ask',
  'סְבָבוּם': 'they-surrounded-them',
  'וַיַּעֲלֵם': 'and-he-brought-them-up',
  'מִנְּשֹׁב': 'from-blowing',
  'וַיִּנָּהֲגוּ': 'and-they-were-driven',
  'וַיְהַלֵּל': 'and-he-praised',
  'מֵהַלֵּל': 'from-praising',
  'וַיְזַמְּרוּ': 'and-they-sang',
  'וַיִּטָּרְפוּ': 'and-they-were-tossed',
  'וַיִּפְקִידוּ': 'and-they-entrusted',
  'אֶל־סְפִינוֹתֵיהֶם': 'to-their-ships',
  'עַל־חוֹפֵי': 'upon-the-shores-of',
  'אֶל־הַקָּבֶר': 'to-the-grave',
  'לְהִתְפַּשֵּׁט': 'to-spread-out',
  'לְצֹאנָם': 'for-their-flocks',
  'וְלִבְקָרָם': 'and-for-their-cattle',
  'בְהֵמָה': 'livestock',

  // Ether misc
  'מִלִּרְאוֹת': 'from-seeing',
  'וּבִרְאוֹתוֹ': 'and-in-his-seeing',
  'וְשָׁמַעְתָּ': 'and-you-heard',
  'לֹא־בָא': 'he-did-not-come',
  'לְשַׁקֵּר': 'to-lie',
  'רִשְׁעֲכֶם': 'your(pl)-wickedness',
  'דַּעְתְּכֶם': 'your(pl)-knowledge',
  'בִּרְאוֹתְכֶם': 'in-your-seeing',
  'בְּקַבֶּלְכֶם': 'in-your-receiving',
  'בִּבְשׂוֹרָתִי': 'in-my-gospel',
  'לִשְׁמִי': 'for-my-name',
  'וּבִדְבָרִי': 'and-in-my-words',
  'וּבְמִצְוָתִי': 'and-in-my-commandments',
  'בְּתַלְמִידָי': 'in-my-disciples',
  'לַמַּאֲמִינִים': 'to-the-believers',
  'אֶל־מַלְכוּתוֹ': 'to-his-kingdom',
  'קָצֶה': 'end/edge',
  'נֶחְרַת': 'was-engraved',
  'נִקְרֵאתִי': 'I-was-called',
  'תַּלְמִיד': 'disciple',
  'מִן־הַחֶשְׁבּוֹנוֹת': 'from-the-accounts',
  'וְהוֹלֵךְ': 'and-going',
  'וְצֶאֱצָא': 'and-offspring',
  'לְלֶחִי': 'to-Lehi',
  'וּמוֹשִׁיעִי': 'and-my-savior',
  'וּלְעַמִּי': 'and-to-my-people',
  'וְכַחַי': 'and-as-my-life',
  'כַּחַי': 'as-my-life',
  'בְּמוֹעֲדוֹ': 'in-his-appointed-time',
  'וּבְקָרוֹ': 'and-his-cattle',
  'וּמִקְנֵהוּ': 'and-his-livestock',
  'וְכָל־חֲפָצֵיהֶם': 'and-all-their-desires',
  'וְשִׁבְעָה': 'and-seven',
  'וּמִשְׁפָּט': 'and-judgment',
  'אֶת־מִצְוֺתָיו': '[ACC]-his-commandments',
  'וּבִהְיוֹת': 'and-in-being',
  'אֲפִילוּ': 'even',
  'אֶת־סִפְרִי': '[ACC]-my-books',
  'יָכִיל': 'it-shall-contain',

  // Helaman remaining
  'הַשַּׁדַּי': 'the-Almighty',
  'אֶל־הַהֲמוֹנִים': 'to-the-multitudes',
  'עַל־הַשְׁחָתָתָם': 'concerning-their-destruction',
  'הַמּוֹפֵת': 'the-wonder',
  'בְּהַגִּידוֹ': 'in-his-telling',
  'גִּדְּפוּ': 'they-blasphemed',
  'נִלְקַח': 'was-taken',
  'לְהָמוֹן': 'to-the-multitude',
  'הָלָכָה': 'she-went',
  'הֻכְּתָה': 'was-struck(f)',
  'נָתְנָה': 'she-gave',
  'הַדָּגָן': 'the-grain',
  'דְּגָנָהּ': 'its-grain(f)',
  'הָרָאשִׁים': 'the-leaders',
  'וְיָסֵר': 'and-he-shall-chastise',
  'פֶּן־יִתְקַיְּמוּ': 'lest-they-be-fulfilled',
  'בַּשַׂקִּים': 'in-sackcloth',
  'תַּחְבּוּלוֹתֵיהֶם': 'their-schemes',
  'הֲבַעֲבוּר': 'is-it-because',
  'וְיִשָּׁכֵךְ': 'and-it-shall-subside',
  'בְּהַשְׁחָתַת': 'in-the-destruction-of',
  'חֲרוֹנְךָ': 'your-wrath',
  'וְתַשְׁבִּית': 'and-you-shall-cause-to-cease',
  'וְהוֹרֵד': 'and-bring-down!',
  'וּדְגָנָהּ': 'and-its-grain(f)',
  'בְּאָמְרִי': 'in-my-saying',
  'תִּשְׁבֹּת': 'it-shall-cease',
  'מַגֵּפַת': 'plague-of',
  'תַּקְשִׁיב': 'you-shall-listen',
  'וְחַסְתִּי': 'and-I-took-refuge',
  'הַדֶּבֶר': 'the-pestilence',
  'וְהַדֶּבֶר': 'and-the-pestilence',
  'הֲתָשִׁיב': 'will-you-return?',
  'וּתְנַסֶּה': 'and-you-shall-test',
  'אִם־יַעַבְדוּךָ': 'if-they-serve-you',
  'לְבָרְכָם': 'to-bless-them',
  'כִּדְבָרֶיךָ': 'according-to-your-words',
  'חָרְבוֹתֵיהֶם': 'their-swords',
  'וְלִפְרוֹץ': 'and-to-break-forth',
  'וְעַד־דָּרוֹם': 'and-unto-the-south',
  'מִיָּם': 'from-the-sea/west',
  'הַמִּזְרָח': 'the-east',
  'הִשְׁבִּיתוּ': 'they-ceased',
  'וַיּוּסְתוּ': 'and-they-were-incited',
  'וְאֶל־מְקוֹמוֹת': 'and-to-places',
  'עִם־אֲחֵיהֶם': 'with-their-brothers',
  'לְמִישׁוֹר': 'to-a-plain',
  'לִצְלֹחַ': 'to-prosper',
};

// PREFIX STRIPPING
function tryPrefixes(w) {
  let clean = w.replace(/׃$/, '');
  if (glossMap[clean]) return glossMap[clean];
  let m = clean.match(/^(וְ|וּ|וַ|וָ|וֶ)(.*)/);
  if (m) {
    let rest = m[2];
    if (glossMap[rest]) return 'and-' + glossMap[rest];
    let m2 = rest.match(/^(הַ|הָ|הֶ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'and-the-' + glossMap[m2[2]];
    let m3 = rest.match(/^(בְּ|בַּ|בִּ|בְ|בַ|בָּ)(.*)/);
    if (m3) {
      if (glossMap[m3[2]]) return 'and-in-' + glossMap[m3[2]];
      let m4 = m3[2].match(/^(הַ|הָ)(.*)/);
      if (m4 && glossMap[m4[2]]) return 'and-in-the-' + glossMap[m4[2]];
    }
    m3 = rest.match(/^(לְ|לַ|לִ|לָ|לֶ)(.*)/);
    if (m3) {
      if (glossMap[m3[2]]) return 'and-to-' + glossMap[m3[2]];
      let m4 = m3[2].match(/^(הַ|הָ)(.*)/);
      if (m4 && glossMap[m4[2]]) return 'and-to-the-' + glossMap[m4[2]];
    }
    m3 = rest.match(/^(מִ|מֵ|מְ)(.*)/);
    if (m3) {
      if (glossMap[m3[2]]) return 'and-from-' + glossMap[m3[2]];
      let m4 = m3[2].match(/^(הַ|הָ)(.*)/);
      if (m4 && glossMap[m4[2]]) return 'and-from-the-' + glossMap[m4[2]];
    }
    m3 = rest.match(/^(כְּ|כַּ|כְ|כַ)(.*)/);
    if (m3 && glossMap[m3[2]]) return 'and-as-' + glossMap[m3[2]];
  }
  m = clean.match(/^(בְּ|בַּ|בִּ|בָּ|בְ|בַ|בִ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'in-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'in-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^(לְ|לַ|לִ|לָ|לֶ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'to-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'to-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^(מִ|מֵ|מְ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'from-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'from-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^(כְּ|כַּ|כְ|כַ)(.*)/);
  if (m) {
    if (glossMap[m[2]]) return 'as-' + glossMap[m[2]];
    let m2 = m[2].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'as-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^(הַ|הָ|הֶ)(.*)/);
  if (m && glossMap[m[2]]) return 'the-' + glossMap[m[2]];
  m = clean.match(/^אֶת[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return '[ACC]-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return '[ACC]-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^אֶל[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'to-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'to-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^עַל[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'upon-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'upon-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^עִם[־](.*)/);
  if (m && glossMap[m[1]]) return 'with-' + glossMap[m[1]];
  m = clean.match(/^מִן[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'from-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'from-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^כָל[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'all-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'all-the-' + glossMap[m2[2]];
  }
  m = clean.match(/^בֶּן[־](.*)/);
  if (m && glossMap[m[1]]) return 'son-of-' + glossMap[m[1]];
  m = clean.match(/^בֵּן[־](.*)/);
  if (m && glossMap[m[1]]) return 'son-of-' + glossMap[m[1]];
  m = clean.match(/^אִם[־](.*)/);
  if (m && glossMap[m[1]]) return 'if-' + glossMap[m[1]];
  m = clean.match(/^פֶּן[־](.*)/);
  if (m && glossMap[m[1]]) return 'lest-' + glossMap[m[1]];
  m = clean.match(/^מַה[־](.*)/);
  if (m && glossMap[m[1]]) return 'what-' + glossMap[m[1]];
  m = clean.match(/^עַד[־](.*)/);
  if (m) {
    if (glossMap[m[1]]) return 'unto-' + glossMap[m[1]];
    let m2 = m[1].match(/^(הַ|הָ)(.*)/);
    if (m2 && glossMap[m2[2]]) return 'unto-the-' + glossMap[m2[2]];
  }
  return null;
}

// PROCESS
let totalFixed = 0;
let totalRemaining = 0;

files.forEach(file => {
  let data = fs.readFileSync(file, 'utf8');
  let fileFixed = 0;
  let fileTotal = 0;
  data = data.replace(/\["([^"]+)","(\?\?\?)"\]/g, function(match, hebrew) {
    fileTotal++;
    if (glossMap[hebrew]) { fileFixed++; return '["' + hebrew + '","' + glossMap[hebrew] + '"]'; }
    let clean = hebrew.replace(/׃$/, '');
    if (glossMap[clean]) { fileFixed++; return '["' + hebrew + '","' + glossMap[clean] + '"]'; }
    let gloss = tryPrefixes(hebrew);
    if (gloss) { fileFixed++; return '["' + hebrew + '","' + gloss + '"]'; }
    return match;
  });
  fs.writeFileSync(file, data, 'utf8');
  let remaining = (data.match(/"\?\?\?"/g) || []).length;
  console.log(`${path.basename(file)}: Fixed ${fileFixed} of ${fileTotal} ??? (remaining: ${remaining})`);
  totalFixed += fileFixed;
  totalRemaining += remaining;
});

console.log(`\nTotal: Fixed ${totalFixed}, Remaining: ${totalRemaining}`);
