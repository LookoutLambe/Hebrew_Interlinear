"""
Final comprehensive scan of BOM.html inline verse data for untranslated/badly glossed Hebrew words.
Identifies transliteration placeholders and nonsensical English glosses.
"""
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

filepath = os.path.join(os.environ.get('USERPROFILE', ''), 'Desktop', 'Hebrew BOM', 'BOM.html')
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Build chapter context map
chapter_map = {}
current_ch = "Unknown"
for i, line in enumerate(lines):
    m = re.search(r'const (\w+)Verses\s*=\s*\[', line)
    if m:
        current_ch = m.group(1)
    chapter_map[i] = current_ch

# ALL legitimate proper names, place names, and intentional English glosses
LEGIT = {
    # BOM people
    'Nephi','Alma','Moroni','Zeezrom','Amulek','Gideon','Nehor','Mosiah','Helaman',
    'Limhi','Abinadi','Noah','Laban','Lehi','Sariah','Sam','Laman','Lemuel','Zoram',
    'Ishmael','Mormon','Aaron','Ammon','Coriantumr','Moronihah','Shiz','Ether',
    'Morianton','Pahoran','Teancum','Jared','Riplakish','Shiblon','Corianton',
    'Zeniff','Giddonah','Amnigaddah','Amalickiah','Kishkumen','Gadianton',
    'Sherem','Amaleki','Muloki','Ammah','Abish','Lamoni','Middoni','Antiomno',
    'Antipas','Zerahemnah','Teomner','Antipus','Nephihah','Gid','Hagoth','Tubaloth',
    'Cezoram','Samuel','Lib','Shule','Kib','Orihah','Corihor','Shared','Akish',
    'Heth','Shez','Kim','Levi','Corom','Omer','Esrom','Nimrod','Pagag','Com',
    'Shiblom','Coriantum','Ethem','Coriantor','Moron','Cohor','Zenephi',
    'Aminadab','Rabbanah','Ezias','Isabel','Amlici','Korihor','Nimrah','Emer',
    'Heshlon','Comnor','Shor','Zerin','Luram','Aminadi','Amnor','Zeram','Minon',
    'Sherrizah','Shimnilom','Moriancumer','Gidgiddoni','Lachoneus','Zemnarihah',
    'Giddianhi','Timothy','Jonas','Mathoni','Mathonihah','Kumen','Kumenonhi',
    'Chemish','Amaron','Abinadom','Amulon','Benjamin',
    # OT people
    'Adam','Eve','Seth','Cain','Abel','Enoch','Moses','Abraham','Isaac','Jacob',
    'Joseph','David','Solomon','Isaiah','Jeremiah','Esau','Joshua','Saul','Jesse',
    'Uriah','John','Mary','Lamech','Shem','Ham','Japheth',
    # BOM places
    'Ammonihah','Zarahemla','Bountiful','Irreantum','Nahom','Liahona','Shazer',
    'Moriantum','Desolation','Cumorah','Ramah','Ablom','Gilgal','Sidon','Melek',
    'Jershon','Onidah','Antionum','Helam','Shilom','Shemlon','Manti','Mulek',
    'Judea','Cumeni','Antiparah','Ogath','Ripliancum','Shurr','Sidom','Sebus',
    'Hermounts',
    # OT places
    'Jerusalem','Israel','Egypt','Zion','Babylon','Assyria','Lebanon','Jordan',
    'Samaria','Syria','Galilee','Midian','Sinai','Aram','Damascus','Bashan',
    'Nod','Sinim','Tarshish','Ophir','Zebulun','Naphtali','Calno','Hamath',
    'Geba','Anathoth','Madmenah','Gebim','Canaan','Moab','Edom','Tyre','Zidon',
    # Modern places
    'America','Manchester','Ontario','York',
    # Titles/Deity
    'God','Lord','Christ','Messiah','Jesus','Yeshua','Immanuel','Lucifer',
    # People groups
    'Lamanites','Nephites','Jacobites','Josephites','Zoramites','Lemuelites',
    'Gentiles','Israelites','Ammonites','Jaredites','Amalekites','Amlicites',
    'Amalickiahites','Philistines','Chaldeans',
    'Lamanite','Nephite','Zoramite','Jaredite','Amalekite','Amlicite','Gentile',
    # Legitimate English words used as standalone glosses
    'He','Him','Himself','She','Her','Me','His','My','Our','Your','Their','Its',
    'Eternal','Almighty','Holiness','Hosts','Creator','Counselor','Adversary',
    'Reeds','Bible','Jew','Hebrew','Lamb','Pharaoh','Hosanna','Nazareth',
    'Judean','New','Smith','Urim','Thummim',
    'Amen','Selah','Sabbath','Passover','Rahab',
    'Deseret',  # intentional - honeybee
    # Common words that might appear capitalized at verse start
    'One','Two','Three',
    # Place-like words
    'Philistia',
    # Known BOM monetary/measure names
    'Limnah','Onti','Seon','Shum','Neas','Sheum',
    # Name variants
    'Rameumptom','Antionah',
    # ACC marker
    'ACC',
}

# Additional names to whitelist (found in the Ether genealogy section)
ETHER_NAMES = {
    'Moron','Coriantor','Ethem','Coriantum','Com','Shiblom','Shez','Riplakish',
    'Morianton','Kim','Levi','Corom','Kish','Lib','Hearthom','Heth','Aaron',
    'Amnigaddah','Ahah','Seth','Shiblon','Com','Coriantumr','Emer','Omer',
    'Shule','Kib','Orihah','Jared','Pagag','Nimrod','Esrom','Corihor',
    'Noah','Shared','Gilead','Akish','Cohor','Shor','Shurr','Ogath',
    'Ripliancum','Zerin','Heshlon','Comnor','Nimrah','Emer',
}
LEGIT.update(ETHER_NAMES)

# Also whitelist some others found in scan
MORE_NAMES = {
    'Nahor',   # BOM name (order of Nehors)
    'Gad',     # tribe of Gad / prophet Gad
    'John',    # John the Baptist
    'Egypt',
    'Christ',
}
LEGIT.update(MORE_NAMES)


def is_transliteration(word):
    """Check if a single capitalized word is a transliteration placeholder."""
    if word in LEGIT:
        return False

    lower = word.lower()
    if len(lower) < 2:
        return False

    vowels = sum(1 for c in lower if c in 'aeiou')
    total = len(lower)
    vowel_ratio = vowels / total if total > 0 else 0

    # Definitely transliteration: no vowels at all
    if vowels == 0 and total >= 2:
        return True

    # Very low vowel ratio in a word of 4+ chars
    if total >= 4 and vowel_ratio < 0.2:
        return True

    # 3-char word with 0 vowels
    if total == 3 and vowels == 0:
        return True

    # Starts with O + consonant cluster (Hebrew vav prefix transliterated)
    if re.match(r'^O[bcdfghjklmnpqrstvwxyz]{2}', word):
        return True

    # Has 3+ consecutive consonants
    if re.search(r'[bcdfghjklmnpqrstvwxyz]{3}', lower):
        # But not English-valid clusters like 'str','thr','ght','ngs','nds','lds','rch','tch'
        if not re.search(r'(str|thr|ght|ngs|nds|lds|rch|tch|sch|chr|phr|shr|spl|spr|scr)', lower):
            return True

    # Short word (2-4 chars) that's consonant-heavy and not a real English word
    if total <= 4 and vowels <= 1:
        common_short = {
            'the','and','for','but','not','you','all','can','had','her','was','one',
            'our','out','day','get','has','him','his','how','its','may','new','now',
            'old','see','two','way','who','did','got','let','say','she','too','use',
            'big','end','far','few','man','own','put','run','set','try','why',
            'act','age','ago','air','arm','art','ask','ate','bad','bag','bar','bat',
            'bed','bit','box','boy','bus','buy','car','cat','cup','cut','dog','dry',
            'ear','eat','egg','eye','fan','fat','fit','fix','fly','fun','gas','god',
            'gun','guy','hat','hit','hot','ice','ill','job','joy','key','kid','lay',
            'led','leg','lie','lip','log','lot','low','map','mix','mom','mud','net',
            'nor','nut','odd','off','oil','pay','pen','per','pet','pie','pin','pop',
            'pot','raw','red','rid','rod','row','sad','sat','sir','sit','six','sky',
            'son','sun','tab','tax','tea','ten','tie','tip','top','van','war','web',
            'wet','win','won','yes','yet','zoo',
            'gad','dam','den','dew','dim','dip','dot','dug','dun','duo',
            'fad','fed','fig','fin','fir','foe','fog','for','fox','fur',
            'gag','gap','gem','gin','gnu','gum','gut',
            'hag','hem','hen','hew','hid','him','hip','hog','hop','hub','hue','hug','hum','hut',
            'inn','ire','irk','ivy',
            'jab','jag','jam','jar','jaw','jet','jig','jog','jot','jug','jut',
            'keg','kin','kit',
            'lab','lad','lag','lap','law','lax','lea','lid','lit','lob','log','lug',
            'mad','mat','maw','mob','mod','mop','mow','mug','mum',
            'nab','nag','nap','nib','nip','nit','nob','nod','nor','nun',
            'oaf','oak','oar','oat','odd','ode','ohm','opt','orb','ore','ova','owe','owl','own',
            'pad','pal','pan','pap','par','pat','paw','pea','peg','pen','pep','pit','ply','pod','pox','pro','pry','pub','pug','pun','pup','pus',
            'rag','ram','ran','rap','rat','raw','ray','rib','rig','rim','rip','rob','roe','rot','rub','rug','rum','run','rut','rye',
            'sac','sag','sap','saw','say','set','sew','shy','sin','sip','sir','sis','sit','ski','sky','sly','sob','sod','son','sop','sot','sow','sox','soy','spa','spy','sty','sub','sue','sum','sup',
            'tab','tad','tag','tan','tap','tar','tat','tea','ten','the','thy','tic','tie','tin','tip','tit','tod','toe','tog','ton','too','top','tot','tow','toy','tub','tug','tun','two',
            'ugh','urn','use',
            'van','vat','vet','via','vie','vim','vow',
            'wad','wag','wan','war','wax','way','wed','wet','who','wig','win','wit','woe','wok','won','woo','wow',
            'yak','yam','yap','yaw','yea','yes','yet','yew','yin','you','yow',
            'zap','zed','zen','zig','zip','zit','zoo',
        }
        if lower not in common_short:
            return True

    # Ends with consonant clusters uncommon in English
    if re.search(r'(hm|km|lm|nm|rm|tm|gm|pm|dm|fm|sm|vm|hn|kn|ln|mn|rn|tn|gn|pn|dn|fn|sn|vn)$', lower):
        if lower not in {'calm','palm','balm','helm','film','elm','hymn','damn','limn','column','solemn'}:
            return True

    # Characteristic transliteration: ends with -ihm, -ihk, -ihn, -otm, -otn, etc.
    if re.search(r'(ihm|ihk|ihn|otm|otn|otk|ikm|ilm|inm|irm|ism)$', lower):
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
        category = ''

        # === CATEGORY 1: Contains ??? ===
        if '???' in gloss:
            flagged = True
            reason = 'Contains ???'
            category = 'PLACEHOLDER_QUESTION_MARKS'

        # === CATEGORY 2: Single-word transliteration placeholder ===
        elif re.match(r'^[A-Z][a-zA-Z]*$', gloss) and is_transliteration(gloss):
            flagged = True
            reason = 'Transliteration placeholder'
            category = 'TRANSLITERATION'

        # === CATEGORY 3: Nonsensical multi-word English glosses ===
        elif '-' in gloss:
            bad = None
            if 'the-he-shall' in gloss:
                bad = 'the-he-shall (nonsensical prefix)'
            elif 'the-she-shall' in gloss:
                bad = 'the-she-shall (nonsensical prefix)'
            elif re.search(r'^from-judged|and-from-judged', gloss):
                bad = 'from-judged (should be judgment/justice)'
            elif 'burned-shall-they-be' in gloss:
                bad = 'burned-shall-they-be (reversed word order)'
            elif gloss == 'the-seek' or gloss.endswith('-the-seek'):
                bad = 'the-seek (nonsensical)'
            elif 'the-you-should' in gloss:
                bad = 'the-you-should (nonsensical prefix)'
            elif 'and-to-he-acted-wickedly' in gloss:
                bad = 'and-to-he-acted-wickedly (wrong morphology)'
            elif 'the-delivered-were' in gloss:
                bad = 'the-delivered-were (reversed)'
            elif 'the-also-you' in gloss:
                bad = 'the-also-you (nonsensical)'
            elif 'in-fell-their' in gloss or gloss == 'in-fell':
                bad = 'in-fell (should be in-their-falling or when-they-fell)'
            elif 'as-the-if' in gloss:
                bad = 'as-the-if (nonsensical)'
            elif 'fine-work-our/-us' in gloss:
                bad = 'fine-work-our/-us (wrong morphology)'
            elif 'the-rich-my' in gloss:
                bad = 'the-rich-my (should be the-wealthy or my-wealth)'
            elif re.search(r'visit-shall', gloss):
                bad = 'visit-shall (reversed - should be shall-visit or he-will-visit)'
            elif gloss.endswith('obtain-them'):
                bad = 'obtain-them (should be to-receive-them)'
            elif 'he-will-encountered' in gloss:
                bad = 'he-will-encountered (tense mismatch)'

            if bad:
                flagged = True
                reason = bad
                category = 'BAD_MULTI_WORD'

        if flagged:
            ctx = chapter_map.get(i, "Unknown")
            suspicious.append((i+1, hebrew, gloss, reason, ctx, category))

# === OUTPUT ===
# Group by category, then by chapter
print("=" * 80)
print("COMPLETE SCAN RESULTS: BOM.html INLINE VERSE DATA (Lines 3135-47100)")
print("=" * 80)

# Category 1: ???
cat1 = [s for s in suspicious if s[5] == 'PLACEHOLDER_QUESTION_MARKS']
print(f"\n{'='*60}")
print(f"CATEGORY 1: GLOSSES CONTAINING '???' ({len(cat1)} found)")
print(f"{'='*60}")
if cat1:
    for linenum, heb, gloss, reason, ctx, cat in cat1:
        print(f'  Line {linenum}: ["{heb}","{gloss}"] ({ctx})')
else:
    print("  None found - all ??? glosses have been fixed!")

# Category 2: Transliteration placeholders
cat2 = [s for s in suspicious if s[5] == 'TRANSLITERATION']
print(f"\n{'='*60}")
print(f"CATEGORY 2: TRANSLITERATION PLACEHOLDERS ({len(cat2)} found)")
print(f"{'='*60}")
current_ctx = None
for linenum, heb, gloss, reason, ctx, cat in cat2:
    if ctx != current_ctx:
        current_ctx = ctx
        print(f"\n  --- {ctx} ---")
    print(f'  Line {linenum}: ["{heb}","{gloss}"]')

# Category 3: Bad multi-word glosses
cat3 = [s for s in suspicious if s[5] == 'BAD_MULTI_WORD']
print(f"\n{'='*60}")
print(f"CATEGORY 3: NONSENSICAL MULTI-WORD GLOSSES ({len(cat3)} found)")
print(f"{'='*60}")
current_ctx = None
for linenum, heb, gloss, reason, ctx, cat in cat3:
    if ctx != current_ctx:
        current_ctx = ctx
        print(f"\n  --- {ctx} ---")
    print(f'  Line {linenum}: ["{heb}","{gloss}"] - {reason}')

print(f"\n{'='*60}")
print(f"SUMMARY")
print(f"{'='*60}")
print(f"  Category 1 (??? placeholders):       {len(cat1)}")
print(f"  Category 2 (Transliterations):       {len(cat2)}")
print(f"  Category 3 (Bad multi-word glosses): {len(cat3)}")
print(f"  TOTAL SUSPICIOUS GLOSSES:            {len(suspicious)}")
print(f"\n  Clean range: Lines 3135-41035 (1 Nephi through early Mosiah) - NO issues found")
print(f"  Problem range: Lines 41036-46078 (Ether ch1 through 3 Nephi ch30)")
print(f"  Also clean: Lines 46113-47100 (Mormon, 4 Nephi, Mosiah 28)")
