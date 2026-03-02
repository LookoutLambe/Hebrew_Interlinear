"""
Fix duplicate/repeated glosses in maqqef-joined words.
Also fix specific known patterns.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import re
import os

VERSES_DIR = r"C:\Users\chris\Desktop\Hebrew BOM\verses"

# Specific gloss fixes for known patterns
SPECIFIC_FIXES = {
    # Hebrew → (bad_gloss_pattern, correct_gloss)
    'עַד־כִּי': [('insomuch-that-that', 'insomuch-that'), ('that-that', 'until')],
    'שְׁנֵים־הֶעָשָׂר': [('the-twelve-twelve', 'the-twelve')],
    'אִישׁ־אִישׁ': [('man/each-man/each', 'each-man')],
    'וּבְנֵי־חוֹרִין': [('and-free-free', 'and-free')],
    'כְלֵי־נָשֶׁק': [('arms-arms', 'weapons')],
    'עַל־בָּמֳתֵי': [('upon-upon-small-numbers', 'upon-the-high-places-of')],
}


def fix_duplicate_gloss(gloss):
    """Remove word-word duplications from a gloss."""
    parts = gloss.split('-')
    if len(parts) < 2:
        return gloss

    # Remove consecutive duplicate words
    new_parts = [parts[0]]
    for i in range(1, len(parts)):
        if parts[i] != parts[i-1] or len(parts[i]) <= 2:
            new_parts.append(parts[i])

    result = '-'.join(new_parts)
    return result


def process_file(filepath):
    """Fix duplicate glosses in a verse file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    fix_count = 0

    def replace_word(match):
        nonlocal fix_count
        hebrew = match.group(1)
        gloss = match.group(2)
        new_gloss = gloss

        # Check specific fixes first
        if hebrew in SPECIFIC_FIXES:
            for bad, good in SPECIFIC_FIXES[hebrew]:
                if gloss == bad:
                    new_gloss = good
                    break

        # If no specific fix, try generic dedup
        if new_gloss == gloss:
            new_gloss = fix_duplicate_gloss(gloss)

        if new_gloss != gloss:
            fix_count += 1
            return f'["{hebrew}","{new_gloss}"]'
        return match.group(0)

    new_content = re.sub(r'\["([^"]+)","([^"]+)"\]', replace_word, content)

    if fix_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

    return fix_count


print("Fixing duplicate glosses...")

verse_files = sorted(f for f in os.listdir(VERSES_DIR) if f.endswith('.js'))
total = 0

for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    fixes = process_file(filepath)
    if fixes > 0:
        print(f"  {filename}: {fixes} fixes")
        total += fixes

print(f"\nTotal duplicate fixes: {total}")

# Verify
print("\nVerification - check for remaining duplicates:")
for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for m in re.finditer(r'\["([^"]+)","([^"]+)"\]', content):
        gloss = m.group(2)
        parts = gloss.split('-')
        for i in range(len(parts) - 1):
            if parts[i] == parts[i+1] and len(parts[i]) > 2:
                print(f"  {filename}: [{m.group(1)}] \"{gloss}\"")
                break
