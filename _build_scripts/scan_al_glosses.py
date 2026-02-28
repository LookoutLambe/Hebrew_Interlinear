import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('../_chapter_data/al_data.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# ===================================================================
# COMPREHENSIVE SCAN - Final version
# 3 categories:
#   A) ??? placeholders
#   B) Pure transliteration glosses (capitalized, non-name, non-English)
#   C) Garbled/wrong English glosses in hyphenated form
# ===================================================================

bom_names = {
    'Alma', 'Nephi', 'Moroni', 'Ammonihah', 'Zarahemla', 'Zeezrom', 'Amulek',
    'Gideon', 'Nehor', 'Mosiah', 'Helaman', 'Manti', 'Noah', 'Amlicite', 'Amlicites',
    'Limhi', 'Melek', 'Sidon', 'Aaron', 'Ammon', 'Lamanite', 'Lamanites',
    'Nephite', 'Nephites', 'Zoramite', 'Zoramites', 'Mulekite', 'Mulekites', 'Zoram',
    'Jershon', 'Antionah', 'Lehi', 'Laman', 'Lemuel', 'Ishmael', 'Jacob',
    'Joseph', 'Israel', 'Moses', 'Abraham', 'Adam', 'Eve', 'Christ', 'Jesus',
    'Messiah', 'Zion', 'Jerusalem', 'Egypt', 'Melchizedek', 'Enoch', 'Seth',
    'Corianton', 'Shiblon', 'Pahoran', 'Moriantum', 'Teancum',
    'Amalickiah', 'Amalekite', 'Amalekites', 'Lehonti', 'Antipas', 'Middoni',
    'Aminadab', 'Abinadi', 'Zeniff', 'Giddonah', 'Isabel', 'Hermounts',
    'Cumeni', 'Antiparah', 'Judea', 'Morianton', 'Nephihah', 'Kishkumen',
    'Gadianton', 'Coriantumr', 'Bountiful', 'Desolation', 'Omner', 'Himni',
    'Lamoni', 'Ammonites', 'Zerahemnah', 'Neas', 'Sheum',
    'Antipus', 'Helam', 'Amulon', 'Amulonites', 'Mulek', 'Minon', 'Gid',
    'Onidah', 'Rameumptom', 'Liahona', 'Irreantum',
    'Salem', 'Shem', 'Jordan', 'David', 'Bathsheba', 'Uriah', 'Solomon',
    'Sidom', 'Amnor', 'Mormon', 'Cumorah', 'Ammoron', 'Coriantor',
    'Shimnilon', 'Shilom', 'Shemlon',
    'Zenock', 'Zenos', 'Neum', 'Isaiah',
    'Rabbanah', 'Abish', 'Lachoneus', 'Lib', 'Shiz',
    'Ammonihahites', 'Amalickiahite', 'Amalickiahites', 'Lehites', 'Jacobites',
    'Josephites', 'Ishmaelites',
    'Gilgal', 'Gad', 'Dan', 'Manasseh', 'Ephraim', 'Reuben',
    'Simeon', 'Judah', 'Benjamin', 'Naphtali', 'Asher', 'Zebulun', 'Issachar',
    'Samuel', 'Ezekiel', 'Jeremiah', 'Daniel', 'Elijah', 'Elisha',
    'Seninah', 'Senom', 'Seon', 'Ezrom', 'Onti', 'Ontion', 'Anti',
    'Senomites', 'Aminadi', 'Muloki', 'Sebus', 'Midian', 'Amaleki',
    'Antionum', 'Riplah', 'Pachus', 'Moronihah', 'Shimnilom', 'Zeram',
    'Sheol', 'Yeshua', 'Isaac', 'Laban', 'Jared', 'Nahor',
}

legit_english_caps = {
    'I', 'A', 'O', 'D',
    'Thee', 'Thou', 'Thy', 'Himself', 'Almighty', 'Counselor', 'Christians',
    'Reeds', 'God', 'ACC', 'Captain',
}

all_legit_caps = bom_names | legit_english_caps

results_a = []  # ???
results_b = []  # Pure transliterations
results_c = []  # Garbled hyphenated

for line_num, line in enumerate(lines, 1):
    pairs = re.findall(r'\["([^"]*)","([^"]*)"\]', line)
    for hebrew, gloss in pairs:
        if not gloss or gloss == '':
            continue

        # A) ??? markers
        if '???' in gloss:
            results_a.append((line_num, hebrew, gloss))
            continue

        # B) Single capitalized word that is a transliteration placeholder
        if re.match(r'^[A-Z][a-zA-Z]*$', gloss) and gloss not in all_legit_caps:
            results_b.append((line_num, hebrew, gloss))
            continue

        # C) Garbled hyphenated glosses
        # C1: "the-PRONOUN-VERB" patterns (interrogative ha- misread as article)
        if re.match(r'^the-(you|he|she|they|we|I)-', gloss):
            results_c.append((line_num, hebrew, gloss, 'Interrogative ha- mistranslated as "the-"'))
            continue
        # C2: "the-also-you"
        if gloss == 'the-also-you':
            results_c.append((line_num, hebrew, gloss, 'Garbled morphological analysis'))
            continue
        # C3: "the-delivered-were", "the-seek"
        if re.match(r'^the-(delivered-were|seek$|rich-my)', gloss):
            results_c.append((line_num, hebrew, gloss, 'Garbled: article before verb/adjective'))
            continue
        # C4: Wrong prefix-verb combinations
        if re.match(r'^(in-fell-|from-judged-|burned-shall-|fine-work-our|visit-shall|as-the-if)', gloss):
            results_c.append((line_num, hebrew, gloss, 'Garbled prefix/verb combination'))
            continue
        # C5: and-to-PRONOUN-verb
        if re.search(r'and-to-(he|she|they|we|I)-', gloss):
            results_c.append((line_num, hebrew, gloss, 'Garbled: and-to-pronoun'))
            continue
        # C6: burned-shall-they-be
        if 'burned-shall-they-be' in gloss:
            results_c.append((line_num, hebrew, gloss, 'Garbled verb order'))
            continue
        # C7: Hyphenated glosses with embedded transliteration fragments
        parts = gloss.split('-')
        has_embedded = False
        translit_part = ''
        legit_hyph = {
            'Lord', 'God', 'Nephi', 'Alma', 'Moroni', 'Zarahemla', 'Lehi',
            'Ammonihah', 'Mosiah', 'Helaman', 'Messiah', 'Christ', 'Jesus',
            'Gideon', 'Aaron', 'Ammon', 'Israel', 'Egypt', 'Abraham', 'Moses',
            'Jacob', 'Joseph', 'Adam', 'Eve', 'Zion', 'Jerusalem', 'Noah',
            'Sidon', 'Bountiful', 'Desolation', 'Jared', 'Isaac', 'David',
            'Solomon', 'Laban', 'Limhi', 'Ishmael', 'Laman', 'Lemuel',
            'Melchizedek', 'Seth', 'Enoch', 'Isaiah', 'Jeremiah', 'Sheol',
            'Yeshua', 'Mulek', 'Mormon', 'Manti', 'Cumeni', 'Judea',
            'Riplah', 'Sebus', 'Lamoni', 'Muloki', 'Rabbanah', 'Abish',
            'Ammoron', 'Helam', 'Amulon', 'Antionum', 'Seninah', 'Seon',
            'Senom', 'Ezrom', 'Ontion', 'Shimnilom', 'Midian', 'Amaleki',
            'Hermounts', 'Melek', 'Jershon', 'Giddonah', 'Isabel', 'Himni',
            'Omner', 'Coriantor', 'Corianton', 'Shiblon', 'Pahoran',
            'Teancum', 'Amalickiah', 'Lehonti', 'Morianton', 'Nephihah',
            'Kishkumen', 'Gadianton', 'Coriantumr', 'Pachus', 'Moronihah',
            'Antipus', 'Antiparah', 'Onidah', 'Aminadi', 'Zenock', 'Zenos',
            'Neum', 'Abinadi', 'Zeniff', 'Eden', 'Zeram', 'Amnor', 'Minon',
            'Gid', 'Amnihu',
            'Amlicite', 'Amlicites', 'Ammonites', 'Lamanites', 'Nephites',
            'Zoramites', 'Amalekites', 'Amulonites', 'Amalickiahites',
            'Ammonihahites', 'Ishmaelites', 'Lehites', 'Jacobites',
            'Josephites', 'Mulekites', 'Egyptians', 'Senomites',
            'Spirit', 'Adversary', 'Begotten', 'Only', 'Prince', 'Peace',
            'Holy', 'Ghost', 'Creator', 'Eternal', 'Son', 'Thy', 'His', 'Her',
            'Our', 'Their', 'Him', 'Himself', 'Thee', 'Thou', 'Christians',
            'Reeds', 'Captain', 'Almighty', 'Counselor', 'Urim', 'Thummim',
            'One', 'Father', 'Hosts', 'Sam', 'You', 'Your', 'Maher',
            'Limher', 'Shiblom', 'Shelem', 'Emer',
            'He', 'She', 'It', 'We', 'They', 'Me', 'My', 'God',
        }
        for part in parts:
            if re.match(r'^[A-Z][a-z]+$', part) and len(part) >= 3 and part not in legit_hyph:
                vowels = sum(1 for c in part.lower() if c in 'aeiou')
                consonants = len(part) - vowels
                if consonants > vowels * 2 or (len(part) >= 4 and vowels <= 1):
                    has_embedded = True
                    translit_part = part
                    break

        if has_embedded:
            results_c.append((line_num, hebrew, gloss, f'Contains embedded transliteration "{translit_part}"'))

# Get chapter info
def get_chapter(line_num, lines):
    for i in range(line_num-1, -1, -1):
        m = re.search(r'ALMA.*Chapter\s+(\d+)', lines[i])
        if m:
            return int(m.group(1))
        m2 = re.search(r'const al_ch(\d+)Verses', lines[i])
        if m2:
            return int(m2.group(1))
    return 0

total = len(results_a) + len(results_b) + len(results_c)
print(f'TOTAL SUSPICIOUS GLOSSES: {total}')
print(f'  (A) ??? placeholders: {len(results_a)}')
print(f'  (B) Pure transliteration placeholders: {len(results_b)}')
print(f'  (C) Garbled/wrong English glosses: {len(results_c)}')
print()

# Merge and sort by line number
all_results = []
for r in results_a:
    all_results.append((r[0], r[1], r[2], 'Contains ??? placeholder'))
for r in results_b:
    all_results.append((r[0], r[1], r[2], 'Untranslated transliteration'))
for r in results_c:
    all_results.append((r[0], r[1], r[2], r[3]))
all_results.sort(key=lambda x: x[0])

# Count by chapter
chapter_counts = {}
for r in all_results:
    ch = get_chapter(r[0], lines)
    chapter_counts[ch] = chapter_counts.get(ch, 0) + 1

print('BY CHAPTER:')
for ch in sorted(chapter_counts.keys()):
    print(f'  Alma {ch}: {chapter_counts[ch]} suspicious glosses')

print()
print('=' * 80)
print('FULL LIST:')
print('=' * 80)

current_ch = 0
for r in all_results:
    ch = get_chapter(r[0], lines)
    if ch != current_ch:
        print(f'\n--- ALMA CHAPTER {ch} ---')
        current_ch = ch
    print(f'Line {r[0]}: ["{r[1]}","{r[2]}"] - {r[3]}')
