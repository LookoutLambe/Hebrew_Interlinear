import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('C:/Users/chris/Desktop/Hebrew BOM/_chapter_data/he_data.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

pair_pattern = re.compile(r'\["([^"]+)","([^"]*)"\]')

results = []

proper_names = {
    'Nephi', 'Lehi', 'Helaman', 'God', 'Cezoram', 'Gid', 'Mulek',
    'Ammon', 'Limhi', 'Aminadab', 'Alma', 'Amulek', 'Zeezrom',
    'Ammonihah', 'Zarahemla', 'Jerusalem', 'Benjamin', 'Yeshua',
    'Samuel', 'Abraham', 'Gideon', 'Seantum', 'Moses', 'Adam',
    'Messiah', 'Israel', 'Christ', 'Jesus', 'Gadianton', 'Kishkumen',
    'Moronihah', 'Coriantumr', 'Shiblon', 'Corianton', 'Moroni',
    'Mormon', 'Ether', 'Jared', 'Aaron', 'Mosiah', 'Noah', 'Abinadi',
    'Zeniff', 'Laman', 'Lemuel', 'Sam', 'Jacob', 'Joseph', 'Ishmael',
    'Zoram', 'Gidgiddoni', 'Lachoneus', 'Zemnarihah', 'Pahoran',
    'Teancum', 'Bountiful', 'Desolation', 'Lamanite', 'Nephite',
    'Lamanites', 'Nephites', 'Cumorah', 'Shiz', 'Lib', 'Gilgal',
    'Sidon', 'Manti', 'Melek', 'Middoni', 'Midian',
    'Antionum', 'Jershon', 'Rameumptom', 'Liahona', 'Irreantum',
    'Nahom', 'Sariah', 'Laban', 'Cain', 'Gehenna',
    'Zedekiah', 'Joram', 'Zenos', 'Zenock', 'Ezias', 'Isaiah',
    'Jeremiah', 'Egypt', 'Lamanite',
}

legit_english = {
    'I', 'O', 'His', 'Him', 'Her', 'He', 'She', 'It', 'We', 'You', 'My',
    'Your', 'Me', 'Our', 'Their', 'Himself', 'Myself', 'Yourself',
    'ACC', 'Adversary', 'Almighty', 'Mighty', 'Bible', 'Hosts', 'Red',
}

for line_num, line in enumerate(lines, 1):
    pairs = pair_pattern.findall(line)
    for hebrew, gloss in pairs:
        if not gloss or gloss == '':
            continue

        reason = None
        category = None

        # 1. ???
        if '???' in gloss:
            reason = 'contains ???'
            category = 'PLACEHOLDER'

        # 2. Single-word transliterations
        elif re.match(r'^[A-Z][a-z]*$', gloss):
            if gloss not in proper_names and gloss not in legit_english:
                reason = 'untranslated (transliteration)'
                category = 'TRANSLITERATION'

        # 3. Transliterations in compounds
        if not reason:
            parts = gloss.split('-')
            for p in parts:
                if re.match(r'^[A-Z][a-z]*$', p) and len(p) >= 2:
                    if p not in proper_names and p not in legit_english:
                        reason = 'contains transliteration "' + p + '"'
                        category = 'TRANSLITERATION'
                        break

        # 4. [compound] placeholders
        if not reason and '[compound]' in gloss:
            reason = 'unresolved [compound] placeholder'
            category = 'PLACEHOLDER'

        # 5. Garbled verb forms
        if not reason:
            garbled_verbs = [
                ('he-will-they-trembled', 'should be: they-tremble'),
                ('we-will-had-compassion', 'should be: it-was-spared'),
                ('you-will-drove-out', 'should be: you-shall-cast-out'),
                ('you-will-they-cried-out', 'should be: you-shall-cry-out'),
                ('you-will-they-found', 'should be: you-shall-find'),
                ('you-will-be-lifted-up-him', 'should be: you-shall-lift-him-up'),
                ('you-will-darkness', 'should be: shall-be-darkened'),
                ('we-will-remnant', 'should be: remained'),
                ('we-will-they-saw', 'should be: appeared'),
                ('shall-fall-his', 'should be: you-shall-fall'),
                ('and-she-wondered', 'should be: and-you-shall-wonder'),
                ('and-she-sought', 'should be: and-you-seek'),
                ('the-serpent-his', 'should be: they-guessed'),
                ('and-he-will-think-his', 'should be: and-they-were-considered'),
                ('and-the-men-of-Gideon-told-them', 'should be: and-they-declared'),
            ]
            for pattern, fix in garbled_verbs:
                if pattern in gloss:
                    reason = 'garbled verb: "' + pattern + '" (' + fix + ')'
                    category = 'GARBLED'
                    break

        # 6. Wrong glosses
        if not reason:
            wrong_glosses = [
                ('daughter-your', 'should be: your-houses (batteikhem)'),
                ('above-all-your-sins', 'should be: from-all-your-sins'),
                ('from-died-their', 'should be: from-their-dead'),
                ('in-drew-near', 'should be: in-her-midst (beqirbah)'),
                ('in-battle', 'should be: in-their-midst (beqirban)'),
                ('to-the-His-counsels', 'garbled double article'),
                ('in-are-privileged-of-his/-him', 'should be: by-his-merit'),
                ('from-gold-you', 'should be: from-your-gold'),
                ('that-from-to-molten', 'garbled: should be your-desolation'),
                ('in-spoke-you', 'should be: when-you-speak'),
                ('and-from-drove-out', 'should be: and-cast-them-out'),
                ('hearken!-their', 'should be: you-hearkened'),
                ('and-they-were-translated', 'should be: and-you-stone'),
                ('and-in-one-half-of-them', 'should be: and-with-their-arrows'),
                ('in-a-work-my', 'should be: by-angels-of'),
                ('and-how-from-other', 'should be: and-how-slow'),
                ('what-from-other', 'should be: how-slow'),
                ('in-might-come-of', 'should be: in-the-produce-of'),
                ('and-to-which-their', 'should be: and-for-their-happiness'),
                ('doing', 'should be: in-two (lishnayim)'),
            ]
            for pattern, fix in wrong_glosses:
                if gloss == pattern or (len(pattern) > 5 and pattern in gloss):
                    reason = 'wrong gloss: "' + pattern + '" (' + fix + ')'
                    category = 'WRONG'
                    break

        # 7. Special
        if not reason:
            if gloss == 'Bn-Helaman':
                reason = 'Bn is transliteration of ben (should be: son-of-Helaman)'
                category = 'TRANSLITERATION'
            elif gloss == 'the-Abarah':
                reason = 'Abarah is transliteration (should be: which-was-handed-down)'
                category = 'TRANSLITERATION'
            elif 'if-Yg' in gloss:
                reason = 'contains transliteration fragment'
                category = 'TRANSLITERATION'

        if reason:
            results.append((line_num, hebrew, gloss, reason, category))

# Deduplicate
seen = set()
unique = []
for r in results:
    key = (r[0], r[1], r[2])
    if key not in seen:
        seen.add(key)
        unique.append(r)

unique.sort(key=lambda x: x[0])

categories = {'PLACEHOLDER': [], 'TRANSLITERATION': [], 'GARBLED': [], 'WRONG': []}
for r in unique:
    categories[r[4]].append(r)

total = len(unique)
print('=== TOTAL SUSPICIOUS GLOSSES: ' + str(total) + ' ===')
print()

for cat_name, cat_label in [
    ('PLACEHOLDER', '??? AND [compound] PLACEHOLDERS'),
    ('TRANSLITERATION', 'UNTRANSLATED TRANSLITERATIONS'),
    ('GARBLED', 'GARBLED VERB FORMS'),
    ('WRONG', 'WRONG/INCORRECT GLOSSES'),
]:
    items = categories[cat_name]
    if items:
        print('--- ' + cat_label + ' (' + str(len(items)) + ' entries) ---')
        for r in items:
            print('Line ' + str(r[0]) + ': ["' + r[1] + '","' + r[2] + '"] - ' + r[3])
        print()
