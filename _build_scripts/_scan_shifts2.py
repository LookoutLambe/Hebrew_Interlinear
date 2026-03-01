#!/usr/bin/env python3
"""Deeper scan for misapplied glosses across Alma-Moroni."""
import re, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

with open('BOM.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

book_names = {
    'al_': 'Alma', 'he_': 'Helaman', 'tn_': '3Nephi',
    'fn_': '4Nephi', 'mm_': 'Mormon', 'et_': 'Ether', 'mr_': 'Moroni'
}

pair_re = re.compile(r'\["([^"]+)","([^"]*?)"\]')
const_re = re.compile(r'^const\s+(\w+)_ch(\d+)Verses\s*=')
verse_num_re = re.compile(r'num:\s*"([^"]+)"')

issues = []
current_book = None
current_ch = None

# Known misgloss patterns to scan for
known_bad = {
    # Hebrew word -> wrong gloss substring -> correct gloss
    'אֲדֹנִי': {'bad': ['king', 'O-king'], 'correct': 'my-Lord'},
    'הָאָוֶן': {'bad': ['Hon', 'hon'], 'correct': 'iniquity'},
    'אָוֶן': {'bad': ['Hon', 'hon'], 'correct': 'iniquity'},
    'עַל': {'bad': ['yoke'], 'correct': 'upon/over/about'},
    'וְעַל': {'bad': ['yoke'], 'correct': 'and-upon'},
    'מֵעַל': {'bad': ['yoke'], 'correct': 'from-upon'},
    'רוּחִי': {'bad': ['again', 'yoke'], 'correct': 'my-spirit'},
}

for line_idx, line in enumerate(lines):
    line_num = line_idx + 1

    cm = const_re.match(line.strip())
    if cm:
        prefix = cm.group(1) + '_'
        if prefix in book_names:
            current_book = book_names[prefix]
            current_ch = cm.group(2)
        else:
            current_book = None
        continue

    if current_book is None:
        continue

    vm = verse_num_re.search(line)
    verse_num = vm.group(1) if vm else '?'
    ref = f"{current_book} {current_ch}:{verse_num}"

    pairs = pair_re.findall(line)
    if not pairs:
        continue

    for i, (heb, gloss) in enumerate(pairs):
        gl = gloss.lower()

        # Check known bad patterns
        if heb in known_bad:
            for bad in known_bad[heb]['bad']:
                if bad.lower() in gl:
                    issues.append(f"KNOWN-BAD {ref} line {line_num}: [{heb}={gloss}] -> should be '{known_bad[heb]['correct']}'")

        # Check for glosses that look like shifted proper names on common Hebrew words
        # Common Hebrew words that should NEVER be glossed as proper names
        common_words = {
            'אֶת', 'אֲשֶׁר', 'כִּי', 'לֹא', 'הִנֵּה', 'גַּם', 'עַתָּה',
            'עוֹד', 'אַף', 'רַק', 'כֵּן', 'כֹּה', 'הֲלֹא', 'אַל',
            'כָּל', 'מִי', 'מָה', 'אֵיךְ', 'לָמָּה', 'אֵיפֹה',
            'שָׁם', 'פֹּה', 'הֵנָּה', 'מִשָּׁם', 'אָנָה',
            'אָז', 'עַד', 'כַּאֲשֶׁר', 'בְּטֶרֶם', 'אַחֲרֵי',
            'הָיָה', 'יִהְיֶה', 'אָמַר', 'בָּא', 'הָלַךְ', 'נָתַן',
            'יָדַע', 'רָאָה', 'שָׁמַע', 'עָשָׂה', 'לָקַח',
        }

        if heb in common_words:
            # Check if gloss looks like a proper name (starts with uppercase, no hyphens, short)
            if gloss and gloss[0].isupper() and '-' not in gloss and len(gloss) < 15:
                # Exclude known legitimate proper name glosses
                legit = {'God', 'Israel', 'Christ', 'Jesus', 'Lord', 'Amen',
                         'Nephi', 'Mormon', 'Moroni', 'Alma', 'Mosiah',
                         'Lehi', 'Helaman', 'Ammon', 'Gideon', 'Adam',
                         'Jerusalem', 'Zarahemla', 'Zion', 'Eden',
                         'ACC', 'Spirit', 'Holy', 'Messiah'}
                if gloss not in legit:
                    issues.append(f"SUSPECT-NAME {ref} line {line_num}: [{heb}={gloss}] - common word glossed as name?")

        # Check for clearly shifted patterns:
        # If current word is a preposition but glossed as a noun, or vice versa
        prepositions = {'בְּ', 'לְ', 'מִ', 'כְּ', 'עַל', 'אֶל', 'מִן', 'בֵּין', 'תַּחַת', 'אַחֲרֵי', 'לִפְנֵי', 'עִם'}

        # Check for consecutive identical Hebrew words with different glosses (possible shift)
        if i > 0:
            prev_heb, prev_gloss = pairs[i-1]
            if heb == prev_heb and gloss != prev_gloss and heb != '׃':
                # Same Hebrew word, different gloss - might indicate a problem
                if len(gloss) > 2 and len(prev_gloss) > 2:
                    issues.append(f"DIFF-GLOSS-SAME-WORD {ref} line {line_num}: [{heb}] has [{prev_gloss}] then [{gloss}]")

        # Check for English words appearing in Hebrew position (data corruption)
        if heb and all(c.isascii() for c in heb) and len(heb) > 2 and heb != '׃':
            issues.append(f"ASCII-HEBREW {ref} line {line_num}: [{heb}={gloss}] - Hebrew field contains ASCII")

        # Check for Hebrew in gloss position (reversed pair)
        if gloss and any('\u0590' <= c <= '\u05FF' for c in gloss):
            issues.append(f"HEBREW-IN-GLOSS {ref} line {line_num}: [{heb}={gloss}] - gloss contains Hebrew")

        # Check for "charmed" as gloss for נשב root (should be "blew")
        if 'נְשְׁבוּ' in heb or 'נִשְׁבוּ' in heb or 'יִנְשְׁבוּ' in heb:
            if 'charm' in gl:
                issues.append(f"CHARM-BLOW {ref} line {line_num}: [{heb}={gloss}] -> should be 'blew'")

# Deduplicate and print
seen = set()
unique = []
for i in issues:
    if i not in seen:
        seen.add(i)
        unique.append(i)

print(f"=== TARGETED SCAN RESULTS ===")
print(f"Issues found: {len(unique)}")

for itype in ['KNOWN-BAD', 'SUSPECT-NAME', 'DIFF-GLOSS-SAME-WORD', 'ASCII-HEBREW', 'HEBREW-IN-GLOSS', 'CHARM-BLOW']:
    typed = [i for i in unique if i.startswith(itype)]
    if typed:
        print(f"\n--- {itype} ({len(typed)}) ---")
        for i in typed:
            print(f"  {i}")
