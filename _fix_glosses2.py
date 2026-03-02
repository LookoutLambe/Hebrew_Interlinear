"""
Fix remaining gloss issues:
1. [ACC] space-separated: "[ACC] the-words" → "the-words"
2. "and-[ACC] X" → "and-X"
3. Duplicate word patterns like "by-which-by-which"
4. Other space-based [ACC] variants
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

    # [ACC] with space separator
    gloss = re.sub(r'^\[ACC\] ', '', gloss)
    gloss = re.sub(r'^and-\[ACC\] ', 'and-', gloss)

    # Fix word-word duplication patterns
    # "by-which-by-which" → "whereby"
    gloss = re.sub(r'^by-which-by-which$', 'whereby', gloss)
    gloss = re.sub(r'^which-by-which$', 'whereby', gloss)

    # "upon-is-to-come" → "upon-that-which-is-to-come"
    # (actually leave as-is, it's comprehensible)

    # "that-whosoever-does" is fine
    # "that-whosoever-who" → "whosoever"
    gloss = re.sub(r'^that-whosoever-who$', 'whosoever', gloss)

    return gloss


def process_file(filepath):
    """Process a verse file and fix all gloss issues."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    fix_count = 0

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


print("Fixing remaining gloss issues...")

verse_files = sorted(f for f in os.listdir(VERSES_DIR) if f.endswith('.js'))
total_fixes = 0

for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    fixes = process_file(filepath)
    if fixes > 0:
        print(f"  {filename}: {fixes} glosses fixed")
        total_fixes += fixes

print(f"\nTotal additional fixes: {total_fixes}")

# Verify
print("\nVerification - remaining [ACC] in glosses (should be standalone only):")
for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find [ACC] that's NOT standalone
    bad = re.findall(r'\["[^"]+","\[ACC\][- ][^"]+"\]', content)
    if bad:
        print(f"  {filename}: {len(bad)} remaining")
        for m in bad[:3]:
            print(f"    {m}")

print("Done!")
