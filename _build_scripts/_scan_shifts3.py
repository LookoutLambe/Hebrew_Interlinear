#!/usr/bin/env python3
"""Third pass: scan for more misgloss patterns."""
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

for line_idx, line in enumerate(lines):
    line_num = line_idx + 1
    cm = const_re.match(line.strip())
    if cm:
        prefix = cm.group(1) + '_'
        current_book = book_names.get(prefix)
        current_ch = cm.group(2) if current_book else None
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

        # === Pattern: Common word glossed as wrong proper name ===
        # Check for glosses that look like they belong to a different word

        # "His-power" for something that shouldn't have that gloss
        # "His-soul" for something else, etc.

        # === Pattern: Possessive suffix detached/shifted ===
        # Gloss ending with lone possessive like "-their" "-his" "-my"
        # when the Hebrew doesn't have that suffix

        # === Pattern: Check for specific known wrong glosses ===

        # "and-teacher(f)" - check if used for masculine form
        if gloss == 'and-teacher(f)' and 'וּמוֹרֶה' in heb:
            # מוֹרֶה is actually masculine (participle), not feminine
            # The feminine would be מוֹרָה
            pass  # This is a minor issue, skip

        # Check for "Hosts" used as standalone (should be "armies/hosts")
        # "of-Hosts" or "in-of-Hosts" - might be wrong parsing
        if 'Hosts' in gloss and heb not in ('צְבָאוֹת', 'יהוה'):
            if 'of-Hosts' in gloss and 'צבא' not in heb:
                issues.append(f"HOSTS {ref} line {line_num}: [{heb}={gloss}]")

        # Check for "His" capitalized (referring to God) on words that clearly aren't about God
        # This is hard to detect automatically, skip

        # === Pattern: Check for remaining "yoke" glosses ===
        if 'yoke' in gl and 'עֹל' not in heb and heb not in ('עֹל', 'עוֹל'):
            issues.append(f"YOKE {ref} line {line_num}: [{heb}={gloss}]")

        # === Pattern: Check for "again" as gloss for רוּח family ===
        if 'רוּח' in heb and gl == 'again':
            issues.append(f"RUACH-AGAIN {ref} line {line_num}: [{heb}={gloss}]")

        # === Pattern: Consecutive words with obviously wrong gloss order ===
        if i > 0:
            prev_heb, prev_gloss = pairs[i-1]
            # Check for cases where current gloss seems to match previous Hebrew better
            # E.g., prev_heb contains "עַל" but prev_gloss doesn't say "upon"
            # and current gloss says "upon" but current heb isn't a preposition

        # === Pattern: Empty glosses for non-punctuation ===
        if gloss == '' and heb != '׃' and heb != '—' and heb != '–':
            issues.append(f"EMPTY {ref} line {line_num}: [{heb}=(empty)]")

        # === Pattern: Very suspicious gloss/Hebrew mismatches ===
        # Words with ב prefix should have "in/with/by" in gloss
        if heb.startswith('בְּ') or heb.startswith('בַּ') or heb.startswith('בָּ') or heb.startswith('בִּ'):
            if gl and not any(p in gl for p in ['in', 'with', 'by', 'at', 'on', 'among', 'through', 'against', 'while']):
                # Might be wrong but many legitimate exceptions
                pass  # Too many false positives

        # === Pattern: ל prefix without "to/for/unto" ===
        # Too many legitimate exceptions

        # === Pattern: Gloss has word "pit" (often wrong for שַׁחַת which can mean pit or destruction) ===
        # Already fixed "from-pit" above

        # === Pattern: "spirit" for הָרוּחוֹת (the winds) ===
        if heb == 'הָרוּחוֹת' and 'wind' not in gl:
            issues.append(f"WINDS {ref} line {line_num}: [{heb}={gloss}] - should be 'the-winds'")

        # === Pattern: "and-they-met" for פגע in violent context ===
        if 'פְגְּעוּ' in heb and gl == 'and-they-met':
            issues.append(f"BEAT {ref} line {line_num}: [{heb}={gloss}] - should be 'and-beat-upon'")

# Deduplicate
seen = set()
unique = []
for i in issues:
    if i not in seen:
        seen.add(i)
        unique.append(i)

print(f"=== THIRD PASS SCAN RESULTS ===")
print(f"Issues found: {len(unique)}")
for i in unique:
    print(f"  {i}")
