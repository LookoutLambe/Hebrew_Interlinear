#!/usr/bin/env python3
"""
Fix Hebrew BOM verb glosses using Biblical Hebrew grammar rules
(Van Pelt / Pratico paradigms).

IMPERFECT (Yiqtol) prefix conjugation → future/modal "shall/will":
  Prefix vowels that identify IMPERFECT:
    Qal:     יִקְטֹל  (chiriq)
    Niphal:  יִקָּטֵל (chiriq + dagesh R1)
    Piel:    יְקַטֵּל (shva)
    Hiphil:  יַקְטִיל (patach)
    Hithpael:יִתְקַטֵּל (chiriq + tav)

  Person from prefix letter:
    ת = 2ms/3fs/2mp/3fp  (BOM default: "you")
    י = 3ms/3mp           (BOM default: "he")
    א = 1cs               ("I")
    נ = 1cp               ("we")

  Plural marker: suffix וּ

NOT IMPERFECT (skip):
  - וַ prefix (wayyiqtol = past narrative)
  - יָ prefix (qamats = Qal perfect of yod-root like ידע,ירד,ירא)
  - אָ prefix (qamats = Qal perfect of aleph-root like אמר,אכל)
  - Perfect suffixes: תִּי,תָּ,תֶּם,תֶּן,נוּ
  - Known non-verbs (nouns, particles, names)
"""
import re, os, sys, io, json, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

VERSES_DIR = os.path.join(os.path.dirname(__file__), 'verses')
FILE_ORDER = [
    '1nephi.js','2nephi.js','jacob.js','enos.js','jarom.js',
    'omni.js','words_of_mormon.js','mosiah.js','alma.js',
    'helaman.js','3nephi.js','4nephi.js','mormon.js','ether.js',
    'moroni.js','frontmatter.js'
]

def strip_nikkud(s):
    return re.sub(r'[\u0591-\u05C7]', '', s)

def strip_sof_pasuk(s):
    """Remove trailing sof pasuk and maqaf-connected sof pasuk."""
    return s.rstrip('׃').rstrip()

# ══════════════════════════════════════════════════════════════════════
# Van Pelt Rule 1: IMPERFECT PREFIX VOWELS
# ══════════════════════════════════════════════════════════════════════

IMPERFECT_PREFIX = re.compile(
    r'^(?:וְ|וּ)?'           # optional conjunctive vav
    r'(?:'
    r'תִּ|תַּ|תֵּ|תֶּ|תֹּ|תְּ'  # tav-prefix
    r'|יִ|יַ|יֵ|יֶ|יֹ|יְ'        # yod-prefix
    r'|אֶ|אֲ'                     # aleph-prefix (segol/hataf-patach = 1cs imperfect)
    r')'
)

# ══════════════════════════════════════════════════════════════════════
# Van Pelt Rule 2: NOT IMPERFECT
# ══════════════════════════════════════════════════════════════════════

WAYYIQTOL = re.compile(r'^וַ')
QAMATS_PREFIX = re.compile(r'^(?:וְ|וּ)?[יא]ָ')
PERFECT_SUFFIX = re.compile(
    r'תִּי$'
    r'|תָּ$'
    r'|תְּ$'
    r'|תֶּם$'
    r'|תֶּן$'
)
NIPHAL_PERF = re.compile(
    r'^(?:וְ|וּ)?נִ(?:'
    r'[בּגּדּכּפּתּקּצּטּשּׂשּׁ]'
    r'|לְ|רְ|מְ|סְ'
    r')'
)

# ══════════════════════════════════════════════════════════════════════
# Known non-verbs (particles, nouns, names, pronouns, adjectives)
# ══════════════════════════════════════════════════════════════════════
NON_VERBS = {
    # ── Particles / Conjunctions / Adverbs ──
    'אֲשֶׁר','אֶת','אֵת','אֶל','אִם','אֵין','אַיִן','אַךְ','אָכֵן',
    'אוּלַי','אוּלָם','אֵיךְ','אֵיכָה','אֵלֶּה','וְאֵלֶּה',
    'לֹא','וְלֹא','אַל','וְאַל',
    'וְגַם','גַם','אַף','וְאַף','כִּי','וְכִּי',
    'יַעַן','וְיַעַן',  # because, and-because
    'אֶלָּא',  # but-rather
    'אֲבָל',  # but/however
    'אֲפִלּוּ',  # even/also
    'אֶפֶס',  # save/except
    'אֶתְמוֹל',  # yesterday
    'יַחַד','יַחְדָּו',  # together
    'תָּמִיד',  # always

    # ── Pronouns ──
    'אֲנִי','אָנֹכִי','אַתָּה','אַתְּ','אַתֶּם','אַתֶּן','אֲנַחְנוּ',
    'אֵינוֹ','אֵינֶנּוּ','אֵינָם','אֵינֶנָּה',
    'אֶתְכֶם',  # you (acc)
    'אָנוּ',  # we

    # ── Prepositions with suffixes ──
    'אֲלֵיכֶם','אֲלֵיהֶם','אֵלָיו','אֵלֶיהָ','אֵלַי',
    'עֲלֵיכֶם','עֲלֵיהֶם',
    'תַּחַת',  # under
    'תַּחְתָּיו','תַּחְתֵּיהֶם','תַּחְתֶּיךָ',  # in his/their/your stead
    'אֶצְלוֹ',  # beside-it

    # ── Existential ──
    'יֵשׁ',  # there-is

    # ── Nouns starting with א ──
    'אֱלֹהִים','אֱלֹהֵי','אֲדֹנָי','אָדָם','אֶרֶץ','אָרֶץ','אִישׁ',
    'אֶבֶן','אֲבָנִים','אָב','אֲבוֹת',
    'אֲבוֹתַי','אֲבוֹתֵינוּ','אֲבוֹתֵיהֶם','אֲבוֹתֵיכֶם',
    'אֲבוֹתָיו','אֲבוֹתָם',
    'אֲבֹתַי','אֲבֹתֵינוּ','אֲבֹתָיו',
    'אֲבִי','אָבִי','אֲבִיהֶם','אֲבִיכֶם','אֲבִיר',
    'אָח','אֲחֵי','אֲחִי','אֲחִים','אַחִים','אֲחֵרִים','אֲחֵרוֹת',
    'אֲחֵיהֶם','אֲחֵיכֶם','אֲחִיכֶם',
    'אֶחָיו','וְאֶחָיו',  # his brethren
    'אֶחָד','אַחַת','אַחֲרֵי','אַחַר','אַחֲרוֹן','אַחֲרוֹנָה',
    'אֲחָדִים',  # a-few
    'אֹזֶן','אָזְנַיִם','אוֹר','אוֹת','אוֹתוֹת','אוֹיֵב','אוֹיְבִים',
    'אַהֲבָה','אֱמוּנָה','אֱמֶת','אָמֵן',
    'אַלְפֵי','אַלְפַּיִם','אֶלֶף',
    'אֲלָפִים','אֲלָפָיו',  # thousands
    'אַרְבַּע','אַרְבָּעָה','אַרְבַּעַת',
    'אַמָּה','אַמּוֹת','אֲרוֹן',
    'אֲדוֹן','אֲדֹנִי','אֲדֹנֵינוּ','אֲדֹנֵיכֶם','אֲדֹנָם','אֲדֹנָיו',
    'אֲנָשִׁים','אֲנָשָׁיו',  # men
    'אֲחֻזָּה','אֲחֻזָּתָם',  # possession
    'אֲרָצוֹת',  # lands
    'אֲרִיכֵי',  # long-of
    'אֲסוּרִים',  # bound/prisoners
    'אֲטוּמוֹת',  # sealed/closed
    'אֲרוּרִים',  # cursed
    'אֶמְצָעִי',  # means
    'אֲדָמָה',  # ground/earth
    'אֲוִיר',  # air
    'אֲסוּרוֹת',  # forbidden
    'אֲשֵׁמִים',  # guilty

    # ── Nouns starting with י ──
    'יוֹם','יָמִים','יָמַי','יָמָיו','יָמֵינוּ','יְמֵי',
    'יְמֵיהֶם','יְמֵיכֶם',  # their/your days
    'יָד','יַד','יָדַיִם','יָדוֹ','יָדִי','יְדֵי','יָדְךָ',
    'יְדֵיהֶם',  # their hands
    'יַם','יַעַר','יַעֲרוֹ',  # sea, forest, his-forest
    'יֶלֶד','יְלָדִים','יַיִן','יָמִין',
    'יַלְדֵיהֶן','וְיַלְדֵיהֶם','וְיַלְדֵינוּ',  # children
    'יוֹשֵׁב','יוֹשְׁבֵי','יוֹרֵשׁ',
    'יְהוּדִי','יְהוּדִית',
    'יִרְאַת',  # fear-of (noun construct)
    'יִרְאָתָם',  # their fear
    'יְשׁוּעָה','יְשׁוּעָתִי','יְשׁוּעַת','יְשׁוּעַתְכֶם',  # salvation
    'יְסוֹד',  # foundation
    'יְצוּר',  # creature
    'יְחִיד',  # Only-Begotten
    'יִתְרוֹן',  # advantage
    'יְגוֹנִי',  # my sorrow
    'יְדִידִי',  # my beloved
    'יְדִידִים',  # friendly
    'יְתֵרָה',  # exceeding
    'יְפֵי',  # fair-ones-of
    'יֶתֶר','וְיֶתֶר',  # remainder
    'יְחִידוֹ','יְחִידִי',  # Only-Begotten / only
    'יְרָחִים',  # moons
    'יֹפִי',  # beauty
    'יְדוּעוֹת',  # known-are
    'וְיֹלֶדֶת',  # and-bear (participle)

    # ── Adjectives starting with י ──
    'יָקָר','יְקָרִים','יְקָרוֹת','יְקָרָה',  # precious
    'יָשָׁר','יְשָׁרִים','יְשָׁרָה',  # upright/straight
    'יָפֶה','יְפַת',  # beautiful
    'יְגֵעִים',  # weary

    # ── Participles starting with י ──
    'יֹשֵׁב','יֹשְׁבֵי','יֹשְׁבִים',  # dwelling/inhabitants
    'יֹדֵעַ','יֹדְעֵי','יֹדְעִים',  # knowing
    'יֹרְדִים',  # descending
    'יְכוֹלִים',  # able

    # ── Nouns starting with ת ──
    'תּוֹרָה','תּוֹרַת','תְּפִלָּה','תְּפִלַּת','תְּפִלָּתִי',
    'תְּשׁוּבָה','תִּקְוָה','תְּהִלָּה','תְּהִלִּים','תְּהִלּוֹת',
    'תּוֹדָה','תּוֹעֲבָה','תּוֹעֲבוֹת','תְּהוֹם',
    'תְּחִלָּה','תְּחִלַּת','תְּבוּנָה','תְּשׁוּקָה','תְּשׁוּקַת',
    'תְּחִיַּת','תְּחִיָּה',  # resurrection
    'תְּקוּמַת','תְּקוּמָה',  # resurrection
    'תְּפִלּוֹת',  # prayers
    'תְּמוּרָה',  # change
    'תַּלְמִידֵי',  # disciples-of
    'תַּרְנְגֹלֶת',  # hen
    'תְּמִימָה',  # perfect(f)
    'תְּלוּיָה',  # hanging(f)
    'תַּרְדֵּמָה',  # deep-sleep
    'תַּרְבּוּת',  # tame
    'תֵּבֵל',  # world
    'תֵּשַׁע','תְּשַׁע',  # nine
    'תִּפְאֶרֶת',  # glory/bravery
    'תְּעוּדָה',  # testimony
    'תְּשׁוּעַת','תְּשׁוּעָה',  # salvation/deliverance
    'תַּאֲנָה',  # opportunity
    'תַּעֲרֹבֶת',  # mixture
    'תְּחִיָּתָם',  # resurrection-their
    'תְּשׁוּבַתְכֶם',  # return-of-you(pl)
    'תְּמִימִים',  # blameless

    # ── Nouns starting with נ ──
    'נֶפֶשׁ','נַפְשִׁי','נַפְשׁוֹ','נַפְשָׁם','נַפְשׁוֹת','נַפְשְׁכֶם',
    'נָבִיא','נְבִיאִים','נְבִיאֵי','נְבוּאָה','נְבוּאוֹת','נְבוּאָתִי',
    'נֶגֶד','נָהָר','נְהָרוֹת','נָשִׁים','נַעַר','נַעֲרָה',
    'נָכוֹן',  # established
    'נוֹרָא','נוֹרָאוֹת',  # awesome

    # ── Names (all prefix letters) ──
    'יְהוָה','יַעֲקֹב','יוֹסֵף','יְהוּדָה','יִשְׂרָאֵל','יִשְׁמָעֵאל',
    'יְשַׁעְיָהוּ','יְשַׁעְיָה','יִרְמְיָהוּ','יִרְמְיָה',
    'יְרוּשָׁלַיִם','יְרוּשָׁלִַם','יְרוּשָׁלָיִם','יְרוּשָׁלָיְמָה',
    'יְרוּשָׁלִָם',  # variant spellings
    'יֵשׁוּעַ','יֵשׁוּ','יָרֶד',
    'יִצְחָק',
    'יֶרֶד',  # Jared
    'יֶרְשׁוֹן',  # Jershon
    'יְהוִה',  # alternate Lord spelling
    'יַעֲקֹבִים',  # Jacobites
    'נֶפִי','נְפִי','נֹחַ','נַעֲמָן','נְחֶמְיָה','נְהוֹר',
    'אַלְמָא','אַבִינָדִי','אַמּוֹן','אַמּוֹנִי','אַמְלִיסִי',
    'אֲבִינָדָב','אַהֲרֹן','אַבְרָהָם','אֵלִיָּהוּ',
    'אֱלִישָׁע','אֶתֶר','אֲמָלֵק','אֲמָלֵקִי','אֲמוּלוֹן',
    'אַנְטִי','תּוֹמָס','תְּאַנְחוּם',
    'אֲבִינָדִי',  # Abinadi
    'אֶפְרַיִם',  # Ephraim
    'אֲרָם',  # Aram
    'וְיִשְׁמְעֵאלִים',  # Ishmaelites

    # ── Infinitive absolutes ──
    'הָיֹה','אָבֹד','שָׁמוֹר','זָכוֹר',

    # ── Misc that cause false positives ──
    'כֻּלְּכֶם','כֻּלָּם','כֻּלָּנוּ','כֹּל',
    'דִּבְרֵי','דְּבַר','דְּבָרִים',
    'בִּינָה','חָזוֹן',
    'תְּעִיתֶם',  # has perfect suffix, should be caught but just in case
}

# ══════════════════════════════════════════════════════════════════════
# GLOSS ANALYSIS
# ══════════════════════════════════════════════════════════════════════
MODAL_WORDS = {'shall','will','may','can','should','must','let','might','would','could'}
PERSON_RE = re.compile(
    r'^(He|She|It|They|You|Thou|Ye|I|We|One|he|she|it|they|you|thou|ye|we|one)-(.*)',
    re.DOTALL
)
PERSON_WORDS_SET = {'he','she','it','they','you','thou','ye','i','we','one'}

PERSON_MAP = {
    'you': 'you', 'you(pl)': 'you', 'you(f)': 'you',
    'he': 'he', 'they': 'they', 'they(f)': 'they',
    'I': 'I', 'we': 'we'
}

# Irregular past tenses — if gloss verb part starts with one of these, skip
IRREGULAR_PAST = {
    'were', 'was', 'had', 'did', 'came', 'went', 'saw', 'knew',
    'gave', 'took', 'made', 'found', 'told', 'brought', 'heard',
    'left', 'felt', 'became', 'kept', 'began', 'grew', 'wrote',
    'ran', 'spoke', 'broke', 'chose', 'fell', 'drove', 'ate',
    'drew', 'struck', 'swore', 'bore', 'rose', 'sang', 'sat',
    'stood', 'led', 'held', 'built', 'sent', 'spent', 'lost',
    'paid', 'met', 'set', 'put', 'read', 'hung', 'fled',
    'sought', 'caught', 'fought', 'bought', 'taught', 'thought',
    'turned', 'judged', 'founded', 'remembered', 'numbered',
    'covered', 'preserved', 'prevailed',
}

# ── Gloss non-verb patterns ──
# If the English gloss matches any of these, it's NOT a verb
GLOSS_NON_VERB = {
    # Pure pronouns
    'you', 'me', 'him', 'her', 'them', 'us', 'we', 'it', 'he', 'she', 'they',
    # Pure prepositions/conjunctions/adverbs
    'under', 'because', 'yesterday', 'together', 'oft', 'none',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'even/also', 'but/however', 'but-rather', 'save',
    # Nouns/adjectives that appear as bare glosses
    'men', 'women', 'children', 'salvation', 'resurrection', 'foundation',
    'creature', 'means', 'change', 'deep-sleep', 'hen', 'lands', 'possession',
    'precious', 'perfect(f)', 'straight', 'cursed', 'sealed/closed',
    'bound/prisoners', 'weary', 'dwelling', 'knowing', 'descending',
    'hanging(f)', 'exceeding', 'mightier', 'tame', 'a-tame',
    'advantage', 'world', 'pardonable', 'guilty', 'blameless',
    'friendly', 'forbidden', 'deliverance', 'mixture', 'beauty',
    'air', 'moons', 'ground/earth', 'only', 'resurrection-their',
}


def is_imperfect(heb):
    """Van Pelt rules: is this Hebrew word an imperfect verb form?"""
    # Strip sof pasuk for all checks
    clean = strip_sof_pasuk(heb)

    # Rule out wayyiqtol (past narrative)
    if WAYYIQTOL.match(clean):
        return False

    # Rule out known non-verbs (check multiple forms)
    stripped = re.sub(r'^(?:וְ|וּ|וֶ|וָ)', '', clean)
    # Check: full form, without vav, first part before maqqef
    first_part = clean.split('־')[0]
    first_stripped = re.sub(r'^(?:וְ|וּ|וֶ|וָ)', '', first_part)

    for form in (clean, stripped, first_part, first_stripped):
        if form in NON_VERBS:
            return False
        # Also check without sof pasuk (already done but belt-and-suspenders)
        if strip_sof_pasuk(form) in NON_VERBS:
            return False

    # Rule out וְאֶת / אֶת + maqqef compounds (accusative marker + noun)
    if re.match(r'^(?:וְ)?אֶת־', clean):
        return False

    # Rule out qamats under prefix (usually perfect)
    if QAMATS_PREFIX.match(clean):
        return False

    # Rule out perfect suffixes
    if PERFECT_SUFFIX.search(clean):
        return False

    # Rule out niphal perfect
    if NIPHAL_PERF.match(clean):
        return False

    # Check for imperfect prefix vowel pattern
    if IMPERFECT_PREFIX.match(clean):
        # Need at least 3 consonants (prefix + 2 root letters)
        bare = strip_nikkud(stripped if stripped != clean else clean)
        consonants = sum(1 for c in bare if c in 'אבגדהוזחטיכלמנסעפצקרשתךםןףץ')
        return consonants >= 3

    return False


def get_person(heb):
    """Determine person/number from imperfect prefix (Van Pelt Ch.16)."""
    clean = strip_sof_pasuk(heb)
    check = re.sub(r'^(?:וְ|וּ|וֶ|וָ)', '', clean)
    bare = strip_nikkud(check)

    prefix = check[0] if check else ''

    if prefix == 'ת':
        if bare.endswith('ו') or bare.endswith('ון'):
            return 'you(pl)'
        elif bare.endswith('נה'):
            return 'they(f)'
        elif bare.endswith('י') and len(bare) > 3:
            return 'you(f)'
        return 'you'
    elif prefix == 'י':
        if bare.endswith('ו') or bare.endswith('ון'):
            return 'they'
        return 'he'
    elif prefix == 'א':
        return 'I'
    elif prefix == 'נ':
        return 'we'
    return None


def is_past_tense(verb_str):
    """Check if English verb part is past tense (not passive)."""
    first = verb_str.split('-')[0].lower()
    if first in IRREGULAR_PAST:
        return True
    # Regular -ed past (but not in "be-X-ed" passive context, and not base verbs ending in -ed)
    ed_exceptions = {'need', 'seed', 'feed', 'weed', 'bleed', 'breed', 'speed', 'heed',
                     'deed', 'proceed', 'exceed', 'succeed', 'indeed', 'creed'}
    if first.endswith('ed') and first not in ed_exceptions and len(first) > 3:
        return True
    return False


def normalize_3s(verb_str):
    """Remove 3rd-person singular -s/-es from English verb for use with 'shall'."""
    parts = verb_str.split('-')
    v = parts[0]
    if len(v) <= 2:
        return verb_str
    # -ies → -y (cries → cry)
    if v.endswith('ies') and len(v) > 4:
        parts[0] = v[:-3] + 'y'
    # -s (not -ss, -us) → remove s (thinks → think, gives → give, receives → receive)
    elif v.endswith('s') and not v.endswith('ss') and not v.endswith('us') and len(v) > 2:
        parts[0] = v[:-1]
    return '-'.join(parts)


def is_non_verb_gloss(gloss):
    """Check if the English gloss indicates this is NOT a verb."""
    g = gloss.lower().strip()
    g_dehyphen = g.replace('-', ' ')

    # Known non-verb glosses
    if g in GLOSS_NON_VERB:
        return True

    # Proper name (single capitalized word, or multi-word name)
    if re.match(r'^[A-Z][a-z]+$', gloss):
        return True

    # Starts with article "the-" / "a-" / "an-" (noun phrase)
    if g.startswith('the-') or g.startswith('the ') or g.startswith('a-') or g.startswith('an-'):
        return True

    # Possessive prefix → noun (his-, their-, your-, my-, our-, its-, her-)
    if re.match(r'^(his|their|your|my|our|its|her)-', g):
        return True

    # Contains "-of" (construct state noun)
    if g.endswith('-of') or g.endswith(' of') or '-of-' in g or '-of(' in g:
        return True

    # Preposition phrase patterns
    if re.match(r'^(to|unto|from|upon|beside|in|for|with|at|between|through|against|before|after|over|beneath|as)-', g):
        return True

    # Number patterns
    if re.match(r'^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)', g_dehyphen):
        return True

    # Contains parenthetical gender marker like (f) or (m) — adjective/noun
    if '(f)' in g or '(m)' in g:
        return True

    # Participial -ing without person prefix (dwelling, knowing, etc.)
    if g.endswith('ing') and not re.match(r'^(he|she|it|they|you|we|i|one)-', g):
        return True

    # Starts with "and-the-", "and-his-", etc (noun phrase with conjunction)
    if re.match(r'^and-(the|his|their|your|my|our|its|her|a|an)-', g):
        return True

    # "there-is" / "there-are" existential
    if g.startswith('there-') or g.startswith('there '):
        return True

    # Just "and-" + name
    if re.match(r'^and-[A-Z][a-z]+$', gloss):
        return True

    # Contains "was" (past tense narrative, not imperfect)
    if '-was-' in g or g.startswith('was-'):
        return True

    # Ends with common noun/adjective suffixes
    if g.endswith('-are') or g.endswith('-their') or g.endswith('-ness'):
        return True

    return False


def fix_gloss(heb, gloss, person):
    """Generate the corrected gloss for an imperfect verb."""
    has_vav = bool(re.match(r'^(?:וְ|וּ|וֶ|וָ)', strip_sof_pasuk(heb)))
    eng_person = PERSON_MAP.get(person, person)

    # Strip leading "and-" from gloss to normalize
    base = gloss
    if base.startswith('and-'):
        base = base[4:]

    # Determine "and-" prefix from Hebrew, not from gloss
    and_prefix = 'and-' if has_vav else ''

    # ── Check if base already contains a modal word ANYWHERE ──
    base_words = set(base.lower().split('-'))
    if base_words & MODAL_WORDS:
        # Already has modal. Check if it also has person prefix
        m = PERSON_RE.match(base)
        if m:
            # Has person + modal → already fully correct
            return None

        # Starts with modal? → just add person prefix
        modal_start = re.match(
            r'^(shall|will|may|can|should|must|let|might|would|could)-(.*)',
            base, re.IGNORECASE
        )
        if modal_start:
            modal = modal_start.group(1)
            rest = modal_start.group(2)
            # Check if rest already starts with a person word (reversed order like "shall-He-spare")
            rest_person = re.match(r'^(He|She|It|They|You|Thou|Ye|I|We|One)-', rest, re.IGNORECASE)
            if rest_person:
                return None  # already has person+modal, just unusual order
            return f'{and_prefix}{eng_person}-{modal}-{rest}'

        # Modal in non-standard position (e.g., "given-be-shall") → skip
        return None

    # ── No modal word. Check for person prefix ──
    m = PERSON_RE.match(base)
    if m:
        existing_person = m.group(1)
        verb_part = m.group(2)

        # Skip if verb part is past tense
        if is_past_tense(verb_part):
            return None

        # Skip if verb part starts with "is-" / "are-" / "was-" / "were-" / "have-" / "has-" / "do-" / "does-"
        first_vword = verb_part.split('-')[0].lower()
        if first_vword in ('is', 'are', 'was', 'were', 'have', 'has', 'do', 'does', 'did'):
            return None

        # Normalize 3rd person -s
        verb_normalized = normalize_3s(verb_part)
        return f'{and_prefix}{existing_person}-shall-{verb_normalized}'

    # ── Bare word — add person-shall prefix ──
    # Extra validation: is this actually a verb gloss?
    if is_non_verb_gloss(base):
        return None

    # Skip if past tense
    if is_past_tense(base):
        return None

    # Skip single-word glosses that look like auxiliaries
    first_word = base.split('-')[0].lower()
    if first_word in ('is', 'are', 'was', 'were', 'have', 'has', 'do', 'does', 'did',
                       'not', 'no', 'nor', 'or', 'but', 'yet', 'so', 'for', 'than',
                       'when', 'where', 'how', 'what', 'why', 'which', 'who', 'whom',
                       'whose', 'that', 'this', 'these', 'those', 'such', 'same',
                       'all', 'both', 'each', 'every', 'either', 'neither',
                       'o', 'oh', 'lo', 'behold', 'amen', 'selah',
                       'yea', 'nay', 'verily'):
        return None

    base_normalized = normalize_3s(base)
    return f'{and_prefix}{eng_person}-shall-{base_normalized}'


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()

    print("=" * 80)
    print("VAN PELT GRAMMAR-BASED IMPERFECT VERB FIXER v2")
    print(f"Mode: {'APPLY' if args.apply else 'DRY RUN'}")
    print("=" * 80)

    # Load all pairs
    all_pairs = []
    for fname in FILE_ORDER:
        fpath = os.path.join(VERSES_DIR, fname)
        if not os.path.exists(fpath):
            continue
        text = open(fpath, 'r', encoding='utf-8').read()
        for heb, gloss in re.findall(r'\["([^"]+)","([^"]*)"\]', text):
            all_pairs.append((fname, heb, gloss))

    print(f"Total words: {len(all_pairs)}")

    # Find imperfect verbs needing fixes
    fixes = []
    skipped_reasons = collections.Counter()

    for fname, heb, gloss in all_pairs:
        if not gloss or gloss in ('', '׃', '[ACC]'):
            continue

        # Already has person-modal-verb pattern?
        if re.match(r'^(and-)?(He|She|It|They|You|Thou|Ye|I|We|One|he|she|it|they|you|thou|ye|we|one)-(shall|will|may|can|should|must|let|might|would|could)-', gloss, re.IGNORECASE):
            continue

        # Is this an imperfect verb?
        if not is_imperfect(heb):
            continue

        # Determine person
        person = get_person(heb)
        if not person:
            continue

        # Generate fix
        new_gloss = fix_gloss(heb, gloss, person)
        if new_gloss and new_gloss != gloss:
            fixes.append({
                'file': fname, 'hebrew': heb,
                'old': gloss, 'new': new_gloss, 'person': person
            })

    print(f"Fixes: {len(fixes)}")

    # Deduplicate: unique (hebrew, old_gloss) → new_gloss
    unique_fixes = {}
    for f in fixes:
        key = (f['hebrew'], f['old'])
        if key not in unique_fixes:
            unique_fixes[key] = f

    print(f"Unique form-gloss pairs: {len(unique_fixes)}")

    # Summary by person
    by_person = collections.Counter(f['person'] for f in fixes)
    for p, c in sorted(by_person.items(), key=lambda x: -x[1]):
        print(f"  {p}: {c}")

    # Summary by file
    by_file = collections.defaultdict(list)
    for f in fixes:
        by_file[f['file']].append(f)
    print("\nBy file:")
    for fn in FILE_ORDER:
        if fn in by_file:
            print(f"  {fn}: {len(by_file[fn])}")

    # Show fixes grouped by Hebrew form
    print(f"\nAll {len(unique_fixes)} unique fixes:")
    by_heb = collections.defaultdict(list)
    for f in fixes:
        by_heb[f['hebrew']].append(f)
    for heb in sorted(by_heb, key=lambda h: -len(by_heb[h])):
        items = by_heb[heb]
        s = items[0]
        m = PERSON_RE.match(s['old'].lstrip('and-'))
        ftype = 'add-shall' if m else 'add-person+shall'
        # Check if it was a modal-only add
        base = s['old']
        if base.startswith('and-'):
            base = base[4:]
        base_words = set(base.lower().split('-'))
        if base_words & MODAL_WORDS:
            ftype = 'add-person'
        print(f"  {len(items):3d}x  {heb}  \"{s['old']}\" => \"{s['new']}\" [{ftype}]")

    # Apply fixes
    if args.apply:
        print(f"\n{'─' * 80}")
        print("Applying...")
        total = 0
        for fn in FILE_ORDER:
            if fn not in by_file:
                continue
            fpath = os.path.join(VERSES_DIR, fn)
            text = open(fpath, 'r', encoding='utf-8').read()
            count = 0
            for fix in by_file[fn]:
                old = f'["{fix["hebrew"]}","{fix["old"]}"]'
                new = f'["{fix["hebrew"]}","{fix["new"]}"]'
                if old in text:
                    n = text.count(old)
                    text = text.replace(old, new)
                    count += n
            if count > 0:
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(text)
                print(f"  {fn}: {count}")
                total += count
        print(f"Total applied: {total}")

        # Also sync to Standard Works
        sw_dir = r'C:\Users\chris\Desktop\Standard Works Project\bom\verses'
        if os.path.exists(sw_dir):
            print("\nSyncing to Standard Works...")
            import shutil
            synced = 0
            for fn in FILE_ORDER:
                src = os.path.join(VERSES_DIR, fn)
                dst = os.path.join(sw_dir, fn)
                if os.path.exists(src) and os.path.exists(dst):
                    shutil.copy2(src, dst)
                    synced += 1
            print(f"  Synced {synced} files")

    with open('_morphology_fixes.json', 'w', encoding='utf-8') as f:
        json.dump(fixes, f, ensure_ascii=False, indent=2)

    if not args.apply:
        print("\nRun with --apply to apply")


if __name__ == '__main__':
    main()
