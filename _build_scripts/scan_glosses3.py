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
    m = re.search(r'const (\w+)Verses\s*=\s*\[', line)
    if m:
        current_chapter = m.group(1)
    m2 = re.search(r'//\s*((?:1|2|3|4)?\s*(?:NEPHI|JACOB|ENOS|JAROM|OMNI|WORDS|MOSIAH|ALMA|HELAMAN|MORMON|ETHER|MORONI|Nephi|Alma|Mosiah|Helaman|Mormon|Ether|Moroni|Jacob|Enos|Jarom|Omni|Words)[^\n]*)', line, re.IGNORECASE)
    if m2:
        current_chapter = m2.group(1).strip()
    chapter_context[i] = current_chapter

# Comprehensive list of ALL legitimate proper names
legitimate_names = {
    # BOM proper names - be very thorough
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
    'Minon','Zeram','Amnor','Moriancumer',
    'Cain','Abel','Enoch','Methuselah','Lamech','Shem','Ham','Japheth',
    'Canaan','Moab','Edom','Tyre','Zidon','Philistines',
    # Legitimate single English words that appear capitalized
    'He','Him','Himself','Eternal','Almighty','John','Reeds',
    'Holiness','Hosts','Bible','Jew',
    'Lamanites','Nephites','Jacobites','Josephites','Zoramites','Lemuelites',
    'Gentiles','Gentile','Hebrew','Lamb','Israelites','Me',
    'She','Her','His','My','Our','Your','Their','Its',
    'One','Two','Three','Jaredites',
    'Adversary','Sabbath','Passover','Tabernacle','Temple',
}

def is_transliteration_placeholder(word):
    """Returns True if the word is clearly a rough Hebrew transliteration, not a name or English word."""
    if word in legitimate_names:
        return False

    lower = word.lower()

    # Skip very common English words
    common_english = {
        'the','and','of','to','in','for','with','on','at','by','from','or','an','as',
        'is','was','are','were','be','been','being','have','has','had','do','does','did',
        'will','would','shall','should','can','could','may','might','must',
        'not','no','but','if','when','then','than','so','up','out','about',
        'all','each','every','both','few','more','most','other','some','such',
        'only','same','just','also','very','often','still','already','always',
    }
    if lower in common_english:
        return False

    # Check vowel ratio - transliterations have very few vowels
    vowels = sum(1 for c in lower if c in 'aeiou')
    consonants = sum(1 for c in lower if c in 'bcdfghjklmnpqrstvwxyz')

    if consonants == 0:
        return False

    vowel_ratio = vowels / (vowels + consonants) if (vowels + consonants) > 0 else 0

    # Very low vowel ratio = likely transliteration
    if vowel_ratio < 0.15 and len(lower) >= 3:
        return True

    # No vowels at all in a 2+ char word
    if vowels == 0 and len(lower) >= 2:
        return True

    # Patterns that look distinctly like Hebrew consonantal transliterations
    # Starting with O + consonant (represents vav prefix transliterated as O)
    if re.match(r'^O[bcdfghjklmnpqrstvwxyz]{2}', word) and len(word) >= 4:
        return True

    # Words starting with H + consonant cluster (represents he prefix)
    if re.match(r'^H[bcdfghjklmnpqrstvwxyz]{2}', word) and word not in legitimate_names:
        if not re.match(r'^(He|Hi|Ho|Hu|Ha)', word):  # But not normal He-, Hi-, etc.
            return True

    # Words with characteristic transliteration endings that aren't English
    if re.search(r'(ihm|ihk|ihn|ihm|otm|otn|otk)$', lower):
        return True

    # Single vowel surrounded by consonant clusters
    if re.match(r'^[bcdfghjklmnpqrstvwxyz]{2,}[aeiou][bcdfghjklmnpqrstvwxyz]{2,}$', lower):
        return True

    # Short words (3-5 chars) with consonant-heavy patterns
    if len(lower) <= 5 and vowel_ratio < 0.25:
        # Check it's not a known abbreviation or word
        if lower not in {'mr','mrs','dr','jr','sr','st','mt','pt','ft','lb','oz','vs',
                         'am','pm','ad','bc','tv','ok','no','go','so','do','me','he',
                         'we','us','my','by','in','on','at','to','up','or','an','as',
                         'if','is','it','of','be','ph','pi','fo'}:
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

        # Pattern 2: Single capitalized word that is a transliteration placeholder
        elif re.match(r'^[A-Z][a-zA-Z]*$', gloss):
            if is_transliteration_placeholder(gloss):
                flagged = True
                reason = 'Transliteration placeholder'

        if flagged:
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
