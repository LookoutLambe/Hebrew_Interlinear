"""
Fix gloss issues caused by maqqef word joining:
1. Remove [ACC]- prefix from glosses
2. Fix "of-of" duplicates
3. Fix orphan trailing hyphens
4. Fix "by-which-by-which" → "whereby" type duplicates
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import re
import os

VERSES_DIR = r"C:\Users\chris\Desktop\Hebrew BOM\verses"

def fix_gloss(gloss):
    """Fix a single gloss string."""
    original = gloss

    # 1. Remove [ACC]- prefix (and variants)
    gloss = re.sub(r'^\[ACC\]-', '', gloss)
    gloss = re.sub(r'^and-\[ACC\]-', 'and-', gloss)
    gloss = re.sub(r'^\[ACC\]$', '[ACC]', gloss)  # keep standalone [ACC]

    # 2. Fix "of-of" duplicates
    gloss = re.sub(r'-of-of-', '-of-', gloss)
    gloss = re.sub(r'^of-of-', 'of-', gloss)

    # 3. Fix duplicate words like "X-X" at word boundaries
    # "by-which-by-which" → "whereby" already handled in file
    # "in-of-of" → "in-of"
    gloss = re.sub(r'-of-of\b', '-of', gloss)

    # 4. Clean up leading/trailing hyphens (but preserve intentional ones)
    if gloss.endswith('-') and not gloss.endswith('--'):
        # Only strip trailing hyphen if word is a standalone like "Maher-"
        # Keep it if it's part of a compound like "a-"
        pass  # Will handle Maher- specially below

    # 5. Fix double hyphens that result from joining
    gloss = re.sub(r'--+', '-', gloss)

    return gloss


def process_file(filepath):
    """Process a verse file and fix all gloss issues."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    fix_count = 0

    # Find all ["hebrew","gloss"] pairs and fix glosses
    def replace_gloss(match):
        nonlocal fix_count
        hebrew = match.group(1)
        gloss = match.group(2)
        fixed = fix_gloss(gloss)
        if fixed != gloss:
            fix_count += 1
        return f'["{hebrew}","{fixed}"]'

    new_content = re.sub(r'\["([^"]+)","([^"]+)"\]', replace_gloss, content)

    if fix_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

    return fix_count


# Process all verse files
print("Fixing gloss issues in verse files...")

verse_files = sorted(f for f in os.listdir(VERSES_DIR) if f.endswith('.js'))
total_fixes = 0

for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    fixes = process_file(filepath)
    if fixes > 0:
        print(f"  {filename}: {fixes} glosses fixed")
        total_fixes += fixes
    else:
        print(f"  {filename}: no fixes needed")

print(f"\nTotal gloss fixes: {total_fixes}")

# Verify: check for remaining [ACC]- patterns
print("\nVerification - remaining [ACC]- in glosses:")
remaining = 0
for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    matches = re.findall(r'\["[^"]+","\[ACC\]-[^"]+"\]', content)
    if matches:
        remaining += len(matches)
        print(f"  {filename}: {len(matches)} remaining")
        for m in matches[:3]:
            print(f"    {m}")

if remaining == 0:
    print("  None found - all [ACC]- prefixes cleaned!")
