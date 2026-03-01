#!/usr/bin/env python3
"""Scan BOM.html verse data for shifted/misapplied glosses."""
import re, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

with open('BOM.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Book prefixes for Alma through Moroni (scriptural order)
book_names = {
    'al_': 'Alma', 'he_': 'Helaman', 'tn_': '3Nephi',
    'fn_': '4Nephi', 'mm_': 'Mormon', 'et_': 'Ether', 'mr_': 'Moroni'
}

# Common glosses that CAN legitimately repeat consecutively
ok_dupes = {
    'and', 'the', 'of', 'to', 'in', 'that', 'who/which/that', 'for',
    'not', 'is', 'was', 'be', 'a', 'an', 'it', 'he', 'she', 'they', 'them',
    'his', 'her', 'my', 'your', 'our', 'their', 'from', 'with', 'unto',
    'upon', 'by', 'all', 'also', 'shall', 'will', '[acc]', 'i',
    'god', 'the-lord', 'jesus', 'christ', 'nephi', 'moroni', 'mormon',
    'alma', 'helaman', 'ammon', 'mosiah', 'lehi', 'man/each',
    'said', 'came-to-pass', 'and-it-came-to-pass', 'yea', 'nay',
    '', 'behold', 'therefore', 'but/surely', 'this', 'these', 'those',
    'which', 'who', 'great', 'many', 'much', 'righteousness',
    'and-also', 'and-behold', 'and-now', 'even', 'or',
    'lord', 'among', 'before', 'after', 'over', 'against',
    'according-to', 'on', 'land', 'people',
}

pair_re = re.compile(r'\["([^"]+)","([^"]*?)"\]')
const_re = re.compile(r'^const\s+(\w+)_ch(\d+)Verses\s*=')
verse_num_re = re.compile(r'num:\s*"([^"]+)"')

issues = []
total_words = 0
current_book = None
current_ch = None

for line_idx, line in enumerate(lines):
    line_num = line_idx + 1

    # Check if this is a const declaration
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

    # Extract verse number
    vm = verse_num_re.search(line)
    verse_num = vm.group(1) if vm else '?'

    # Extract word pairs
    pairs = pair_re.findall(line)
    if not pairs:
        continue

    total_words += len(pairs)

    # === DETECTION 1: Consecutive duplicate glosses ===
    for i in range(1, len(pairs)):
        prev_heb, prev_gloss = pairs[i-1]
        curr_heb, curr_gloss = pairs[i]
        pg = prev_gloss.lower().strip('-')
        cg = curr_gloss.lower().strip('-')
        if pg == cg and pg not in ok_dupes and len(pg) > 2:
            issues.append(('DUPE', f"{current_book} {current_ch}:{verse_num}",
                          f"[{prev_heb}={prev_gloss}] [{curr_heb}={curr_gloss}]",
                          line_num))

    # === DETECTION 2: Known Hebrew words with wrong glosses ===
    for heb, gloss in pairs:
        gl = gloss.lower().strip('-')

        # עַל should be "upon/over/about/against/for" not "yoke"
        if heb in ('עַל', 'וְעַל', 'מֵעַל') and 'yoke' in gl:
            issues.append(('YOKE', f"{current_book} {current_ch}:{verse_num}",
                          f"[{heb}={gloss}]", line_num))

        # רוּחַ should be "spirit" not "again" or other wrong glosses
        if heb == 'רוּחַ' and gl not in ('spirit', 'spirit-of', 'the-spirit', 'wind', 'breath'):
            if 'spirit' not in gl and 'wind' not in gl and 'breath' not in gl:
                issues.append(('RUACH', f"{current_book} {current_ch}:{verse_num}",
                              f"[{heb}={gloss}]", line_num))

        # רוּחִי should be "my-spirit"
        if heb == 'רוּחִי' and 'spirit' not in gl.lower():
            issues.append(('RUCHI', f"{current_book} {current_ch}:{verse_num}",
                          f"[{heb}={gloss}]", line_num))

        # אֲשֶׁר commonly misglossed when shifted
        if heb == 'אֲשֶׁר' and gl not in ('who/which/that', 'who', 'which', 'that', 'where', 'whom', 'whose', 'what'):
            issues.append(('ASHER', f"{current_book} {current_ch}:{verse_num}",
                          f"[{heb}={gloss}]", line_num))

        # כִּי should be "that/because/for/when/if/surely/indeed"
        if heb == 'כִּי' and gl not in ('that', 'because', 'for', 'when', 'if', 'surely', 'indeed', 'but', 'since', 'although', 'yea', 'even', 'truly', 'except', 'unless', 'however'):
            issues.append(('KI', f"{current_book} {current_ch}:{verse_num}",
                          f"[{heb}={gloss}]", line_num))

        # הִנֵּה should be "behold"
        if heb == 'הִנֵּה' and 'behold' not in gl:
            issues.append(('HINEH', f"{current_book} {current_ch}:{verse_num}",
                          f"[{heb}={gloss}]", line_num))

        # לֹא should be "not/no"
        if heb == 'לֹא' and gl not in ('not', 'no', 'neither', 'nor', 'never', 'without', 'cannot'):
            issues.append(('LO', f"{current_book} {current_ch}:{verse_num}",
                          f"[{heb}={gloss}]", line_num))

        # גַּם should be "also/even/both"
        if heb == 'גַּם' and gl not in ('also', 'even', 'both', 'too', 'likewise', 'indeed', 'yet', 'moreover'):
            issues.append(('GAM', f"{current_book} {current_ch}:{verse_num}",
                          f"[{heb}={gloss}]", line_num))

    # === DETECTION 3: Gloss looks like it belongs to neighboring word ===
    # Check for cases where gloss of word[i] matches the Hebrew of word[i+1] or word[i-1]
    for i in range(len(pairs)):
        heb, gloss = pairs[i]
        # If gloss contains a proper name that matches a different Hebrew word nearby
        # This is harder to autodetect, skip for now

    # === DETECTION 4: Empty or single-char glosses (not punctuation markers) ===
    for heb, gloss in pairs:
        if heb == '׃' or heb == '—':
            continue
        if len(gloss) == 0 and heb != '׃':
            issues.append(('EMPTY', f"{current_book} {current_ch}:{verse_num}",
                          f"[{heb}=(empty)]", line_num))

    # === DETECTION 5: Gloss identical to Hebrew (copy error) ===
    for heb, gloss in pairs:
        if heb == gloss and len(heb) > 2 and heb != '׃':
            issues.append(('COPY', f"{current_book} {current_ch}:{verse_num}",
                          f"[{heb}={gloss}]", line_num))

print(f"=== GLOSS SCAN: Alma through Moroni ===")
print(f"Total words scanned: {total_words}")
print(f"Total issues found: {len(issues)}")

# Group and print
for itype in ['DUPE', 'YOKE', 'RUACH', 'RUCHI', 'ASHER', 'KI', 'HINEH', 'LO', 'GAM', 'EMPTY', 'COPY']:
    typed = [i for i in issues if i[0] == itype]
    if typed:
        print(f"\n--- {itype} ({len(typed)}) ---")
        for _, ref, detail, ln in typed:
            print(f"  {ref} (line {ln}): {detail}")
