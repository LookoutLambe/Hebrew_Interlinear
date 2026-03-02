"""
Fix לִבְנוֹת (livnot) = "to build" (infinitive construct of בנה H1129).
This form with chirik under lamed is unambiguously "to build", NOT "white".

Also fix וְלִבְנוֹת = "and-to-build".

For לְבָנִים/לְבָנוֹת (shva under lamed), need context check for each.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import re
import os
import json

VERSES_DIR = r"C:\Users\chris\Desktop\Hebrew BOM\verses"

# Load official verses for English context
OFFICIAL_PATH = r"C:\Users\chris\Desktop\Hebrew BOM\official_verses.json"
with open(OFFICIAL_PATH, 'r', encoding='utf-8') as f:
    official = json.load(f)

# Build English lookup by book/chapter/verse
eng_lookup = {}
for v in official:
    key = f"{v['book']}|{v['chapter']}|{v['verse']}"
    eng_lookup[key] = v['english']


def process_file(filepath):
    """Fix livnot/levanim glosses."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    fix_count = 0

    def fix_word(match):
        nonlocal fix_count
        hebrew = match.group(1)
        gloss = match.group(2)

        # Unambiguous: לִבְנוֹת = "to build" (chirik under lamed)
        if hebrew == 'לִבְנוֹת' and gloss == 'white':
            fix_count += 1
            return f'["{hebrew}","to-build"]'

        if hebrew == 'וְלִבְנוֹת' and gloss == 'and-white':
            fix_count += 1
            return f'["{hebrew}","and-to-build"]'

        # Ambiguous: לְבָנוֹת could be "white (f.pl)" or "to daughters"
        # Keep as white unless in a clearly "build/sons/daughters" context
        # (These are checked manually below)

        return match.group(0)

    new_content = re.sub(r'\["([^"]+)","([^"]+)"\]', fix_word, content)

    if fix_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

    return fix_count


print("Fixing לִבְנוֹת (livnot) → 'to-build'...")

verse_files = sorted(f for f in os.listdir(VERSES_DIR) if f.endswith('.js'))
total = 0

for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    fixes = process_file(filepath)
    if fixes > 0:
        print(f"  {filename}: {fixes} fixes")
        total += fixes

print(f"\nTotal livnot fixes: {total}")

# Now check remaining ambiguous cases
print("\nRemaining ambiguous 'white' glosses (need manual context check):")
for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    for m in re.finditer(r'\["([^"]+)","([^"]*white[^"]*)"\]', content, re.IGNORECASE):
        hebrew = m.group(1)
        gloss = m.group(2)
        bare = re.sub(r'[\u0591-\u05C7]', '', hebrew)
        # Only report forms that could be sons/daughters vs white
        if any(x in bare for x in ['לבנים', 'לבנות', 'ולבנים', 'ולבנות']):
            print(f"  [{filename}] {hebrew} → \"{gloss}\"")
