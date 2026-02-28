import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

filepath = os.path.join(os.environ.get('USERPROFILE', ''), 'Desktop', 'Hebrew BOM', 'BOM.html')
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Build a map of line -> chapter context
chapter_context = {}
current_chapter = "Unknown"
for i, line in enumerate(lines):
    # Detect chapter markers
    m = re.search(r'const (\w+)Verses\s*=\s*\[', line)
    if m:
        varname = m.group(1)
        current_chapter = varname
    m2 = re.search(r'//\s*([\w\s\-\'\(\)]+(?:Chapter|CHAPTER|VERSES|VERSE DATA|Colophon|COLOPHON)[\w\s\-\'\(\)]*)', line)
    if m2:
        current_chapter = m2.group(1).strip()
    chapter_context[i] = current_chapter

# Comprehensive list of ALL legitimate proper names in the BOM and OT
# This needs to be very thorough to avoid false positives
legitimate_names = {
    # Standard BOM names
    'Nephi','Alma','Moroni','Ammonihah','Zarahemla','Zeezrom','Amulek','Gideon',
    'Nehor','Mosiah','Helaman','Limhi','Abinadi','Noah','Laban','Lehi','Sariah',
    'Sam','Laman','Lemuel','Jerusalem','Israel','Moses','Aaron','Zoram','Ishmael',
    'Christ','Messiah','God','Lord','Zion','Joseph','Egypt','Jacob','Esau','David',
    'Solomon','Isaiah','Judah','Benjamin','Zedekiah','Isaac','Abraham','Bountiful',
    'Irreantum','Nahom','Liahona','Shazer','Coriantumr','Moronihah','Shiz','Ether',
    'Morianton','Pahoran','Teancum','Moriantum','Desolation','Cumorah','Ramah',
    'Ablom','Jared','Gilgal','Seth','Adam','Eve','Riplakish','Shiblon','Corianton',
    'Zeniff','Giddonah','Sidon','Melek','Jershon','Antionah','Zoramite','Rameumptom',
    'Onidah','Antionum','Amnigaddah','Amalickiah','Mormon','Amen','Selah','Joshua',
    'Gilead','Assyria','Babylon','Lebanon','Jordan','Samaria','Syria','Ephraim',
    'Manasseh','Rezin','Ahaz','Immanuel','Lucifer','Galilee','Midian','Nod','Bashan',
    'Jesus','Yeshua','Smith','America','Manchester','Ontario','New','York','Urim',
    'Thummim','Pharaoh','Hosanna','Nazareth','Counselor','Creator','Jeremiah',
    'Abarah','Judean','Enos','Jarom','Omni','Chemish','Amaron','Abinadom',
    'Helam','Shilom','Shemlon','Amulon','Sinim','Tarshish','Ophir','Chaldeans',
    'Philistia','Sheol','Uzziah','Aram','Damascus','Uriah','Jeberechiah',
    'Zebulun','Naphtali','Calno','Hamath','Oreb','Geba','Saul','Anathoth',
    'Madmenah','Gebim','Jesse','Coriantor','Moron','Sherem','Mary','Sinai',
    'Zenock','Neum','Zenos','Ammonites','Lamanite','Nephite','Zoramite',
    'Gidgiddoni','Lachoneus','Zemnarihah','Giddianhi','Kishkumen','Gadianton',
    'Timothy','Jonas','Mathoni','Mathonihah','Kumen','Kumenonhi',
    'Amaleki','Muloki','Ammah','Abish','Lamoni','Middoni','Antiomno',
    'Anti','Antipas','Zerahemnah',
    'Teomner','Antipus','Mulek','Judea','Cumeni','Antiparah','Manti',
    'Nephihah','Gid','Amalekites','Amalickiahites',
    'Hagoth','Tubaloth','Cezoram','Samuel','Lib','Shule','Kib','Orihah',
    'Corihor','Shared','Akish','Heth','Shez','Kim','Levi','Corom',
    'Omer','Esrom','Nimrod','Pagag','Com','Shiblom',
    'Coriantum','Ethem','Ogath','Ripliancum','Shurr','Cohor',
    'Jaredite','Zenephi','Neas','Sheum','Rahab','Ammon',
    'Rabbanah','Sebus','Aminadab','Limnah','Onti','Seon','Shum',
    'Ezias','Isabel','Hermounts',
    'Amlici','Amlicite','Amlicites','Nahor','Sidom',
    'Korihor','Deseret','Nimrah','Emer','Heshlon','Comnor',
    'Shor','Zerin','Sherrizah','Luram','Shimnilom','Aminadi',
    'Amalickiahite','Moriancumer','Moronihah',
    'Minon','Zeram','Amnor',
    # OT names
    'Cain','Abel','Enoch','Methuselah','Lamech','Shem','Ham','Japheth',
    'Canaan','Moab','Edom','Tyre','Zidon','Philistines',
    # Titles and single legitimate English words
    'He','Him','Himself','Eternal','Almighty','John','Reeds',
    'Holiness','Hosts','Bible','Jew',
    'Lamanites','Nephites','Jacobites','Josephites','Zoramites','Lemuelites',
    'Gentiles','Gentile','Hebrew','Lamb','Israelites','Me',
    'She','Her','His','My','Our','Your','Their','Its',
    'One','Two','Three','Jaredites',
    'Adversary',  # legitimate for Satan
    'Sabbath','Passover','Tabernacle','Temple',
}

# Pattern to identify obvious transliteration placeholders
# These are characterized by:
# 1. Being short (usually 2-6 chars) with heavy consonant clusters
# 2. Having no recognizable English morphology
# 3. Starting with consonant combos not found in English names
# 4. Missing vowels in ways that suggest consonant-only transliteration

def is_likely_transliteration(word):
    """Returns True if the word looks like a rough Hebrew transliteration placeholder."""
    if word in legitimate_names:
        return False

    lower = word.lower()

    # Very short words (2-3 chars) with no vowels = definitely transliteration
    if len(lower) <= 3 and not re.search(r'[aeiou]', lower):
        return True

    # Words with no vowels at all
    if not re.search(r'[aeiou]', lower) and len(lower) > 1:
        return True

    # Words starting with unusual consonant clusters for English
    if re.match(r'^(vk|vn|vg|vl|vr|vh|bt|bk|bg|bn|bp|bv|dk|dg|dm|dn|dp|gv|gd|gn|gp|hk|hl|hm|hn|hp|hr|hs|ht|hv|ik|il|im|in|ir|is|it|iv|kd|kh|km|kn|kp|kr|ks|kt|lk|ln|mk|ml|mn|mp|ms|mt|nk|nm|np|nr|ns|nt|ok|om|on|op|or|ot|ov|pk|pn|rk|rm|rn|rp|rs|rt|sk|sm|sn|sp|sr|st|sv|tk|tl|tm|tn|tp|tr|ts|tv|vd|vm|vt|zd|zg|zm|zn|zr)', lower):
        # Exception: some real English/name patterns
        if not re.match(r'^(bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|sc|sh|sk|sl|sm|sn|sp|st|sw|th|tr|tw|wr|ch|ph)', lower):
            return True

    # Ending patterns typical of transliteration: -hm, -km, -lm, -nm, -rm, -sm, -tm
    if re.search(r'[bcdfghjklmnpqrstvwxyz]{3}$', lower):
        return True

    # Very characteristic transliteration patterns
    if re.search(r'(ihm|ihk|ihm|ihn|oho|ilo|imo|ino|iro|ono|iko|iko|otm|otk|otn)', lower):
        return True

    # Patterns with 'o' used as a schwa/placeholder vowel between consonant clusters
    if re.search(r'^[A-Z][bcdfghjklmnpqrstvwxyz]o[bcdfghjklmnpqrstvwxyz]{2}', word):
        return True

    return False

suspicious = []

for i in range(3134, min(47100, len(lines))):
    line = lines[i]
    pairs = re.findall(r'\["([^"]*?)","([^"]*?)"\]', line)
    for hebrew, gloss in pairs:
        if not gloss or gloss == '':
            continue

        flagged = False
        reason = ''

        # Pattern 1: Contains "???"
        if '???' in gloss:
            flagged = True
            reason = 'Contains ???'

        # Pattern 2: Single capitalized word transliteration
        elif re.match(r'^[A-Z][a-zA-Z]*$', gloss) and is_likely_transliteration(gloss):
            flagged = True
            reason = 'Transliteration placeholder'

        # Pattern 3: Hyphenated glosses with nonsensical English
        # These have patterns like "the-he-shall-X", reversed morphology, etc.
        elif '-' in gloss:
            # Check for characteristic bad patterns
            bad_patterns = [
                # "the-" prefix followed by pronoun subject
                r'^the-(he|she|they|you|we|I)-',
                # "and-to-he" pattern
                r'and-to-(he|she|they)-',
                # "-shall-they-be-" with wrong word order
                r'-shall-(they|he|she|we|you)-be-',
                # "from-judged" type (passive where active expected)
                r'^from-(judged|delivered|burned|fell)',
                # "in-fell" type
                r'^in-(fell|judged|burned)',
                # "the-delivered-were"
                r'the-(delivered|burned|judged|fell)-(were|was)',
                # "the-also-you"
                r'the-also-(you|he|she|they)',
                # "as-the-if"
                r'as-the-if',
                # "visit-shall-his"
                r'(visit|obtain|encounter)-shall-(his|her|their)',
                # "he-will-encountered" (tense mismatch)
                r'he-will-(encountered|delivered|judged)',
                # Gloss ending with transliterated word
                r'-[A-Z][a-z]*[^a-z]?$',
            ]
            for pat in bad_patterns:
                if re.search(pat, gloss):
                    flagged = True
                    reason = f'Nonsensical gloss pattern'
                    break

        if flagged:
            # Get chapter context
            ctx = chapter_context.get(i, "Unknown")
            suspicious.append((i+1, hebrew, gloss, reason, ctx))

# Print results organized by chapter
current_ctx = None
for linenum, heb, gloss, reason, ctx in sorted(suspicious):
    if ctx != current_ctx:
        current_ctx = ctx
        print(f'\n=== {ctx} ===')
    print(f'Line {linenum}: ["{heb}","{gloss}"] - {reason}')

print(f'\n\nTOTAL SUSPICIOUS GLOSSES: {len(suspicious)}')
