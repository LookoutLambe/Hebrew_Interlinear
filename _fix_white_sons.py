"""
Fix the white/sons mismatch: לְבָנִים and לִבְנוֹת glossed as "white"
when they should mean "sons"/"daughters" or "to build".

Key distinction:
- לָבָן (lavan) = white (adj) → Strong's H3836
- בָּנִים (banim) = sons → Strong's H1121
- בָּנוֹת (banot) = daughters → Strong's H1323
- לִבְנוֹת (livnot) = to build (inf. construct of בנה) → Strong's H1129

When prefixed with ל (le-):
- לְבָנִים = "to/for sons" (le + banim)
- לְבָנוֹת = "to/for daughters" (le + banot)

The script must check CONTEXT to decide: does BOM English say "white" or "sons/daughters/build"?
We'll check each verse's surrounding words for context clues.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import re
import os
import json

VERSES_DIR = r"C:\Users\chris\Desktop\Hebrew BOM\verses"
MAQQEF = '\u05BE'

# Load official_verses.json for English text context
OFFICIAL_PATH = r"C:\Users\chris\Desktop\Hebrew BOM\official_verses.json"

print("Loading official verses for English context...")
try:
    with open(OFFICIAL_PATH, 'r', encoding='utf-8') as f:
        official_data = json.load(f)
    print(f"  Loaded {len(official_data)} verses")
except:
    print("  Could not load official_verses.json")
    official_data = []


def find_mismatched_white(filepath):
    """Find all instances of לבנים/לבנות glossed as white."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    issues = []

    # Track verse context
    current_verse = "?"
    current_chapter_var = ""

    for line_num, line in enumerate(content.split('\n'), 1):
        # Track chapter variable names
        ch_match = re.match(r'var (\w+)Verses', line)
        if ch_match:
            current_chapter_var = ch_match.group(1)

        # Track verse numbers
        v_match = re.search(r'num:\s*"([^"]+)"', line)
        if v_match:
            current_verse = v_match.group(1)

        # Find words with "white" gloss that might be sons/daughters
        for m in re.finditer(r'\["([^"]+)","([^"]*white[^"]*)"\]', line, re.IGNORECASE):
            hebrew = m.group(1)
            gloss = m.group(2)

            # Check if the Hebrew contains forms of בנים/בנות with ל prefix
            # or plain forms that look like they could be sons/daughters
            bare = re.sub(r'[\u0591-\u05C7]', '', hebrew)
            parts = bare.split(MAQQEF)

            for part in parts:
                bare_part = re.sub(r'[\u0591-\u05C7]', '', part)
                # לבנים, לבנות, בנים, בנות with various prefix combinations
                if bare_part in ['לבנים', 'ולבנות', 'לבנות', 'ולבנים']:
                    issues.append({
                        'line': line_num,
                        'chapter_var': current_chapter_var,
                        'verse': current_verse,
                        'hebrew': hebrew,
                        'gloss': gloss,
                        'start': m.start(),
                        'end': m.end(),
                        'match_text': m.group(0)
                    })

    return issues


def determine_correct_gloss(hebrew, gloss, verse_context=""):
    """
    Determine if this should be "white" or "sons/daughters".
    Uses English verse text for context.
    """
    bare = re.sub(r'[\u0591-\u05C7]', '', hebrew)

    # Check if the English context suggests "white" or "sons/daughters"
    verse_lower = verse_context.lower()

    # If English says "white" near this position, keep "white"
    if 'white' in verse_lower and ('white and delightsome' in verse_lower or
        'white fruit' in verse_lower or 'white garment' in verse_lower or
        'white robe' in verse_lower or 'white stone' in verse_lower or
        'exceedingly white' in verse_lower or 'pure white' in verse_lower or
        'white and fair' in verse_lower or 'white' in verse_lower):

        # Check if English ALSO says "sons" or "daughters" or "build" or "children"
        has_family = any(w in verse_lower for w in ['sons', 'daughters', 'children', 'build'])

        if not has_family and 'white' in verse_lower:
            return gloss  # Keep "white" - it's correct

    # If Hebrew is clearly ל + בנים (sons) pattern
    if bare in ['לבנים', 'ולבנים']:
        if 'sons' in verse_lower or 'children' in verse_lower:
            return 'sons'  # or His-sons
        elif 'build' in verse_lower:
            return 'to-build'

    if bare in ['לבנות', 'ולבנות']:
        if 'daughters' in verse_lower:
            return 'daughters'  # or His-daughters
        elif 'build' in verse_lower:
            return 'to-build'

    # Default: if we can't determine from context, leave as-is
    return gloss


# Process all files
print("\nScanning for white/sons mismatches...")

verse_files = sorted(f for f in os.listdir(VERSES_DIR) if f.endswith('.js'))

all_issues = []
for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    issues = find_mismatched_white(filepath)
    if issues:
        all_issues.extend([(filename, i) for i in issues])

print(f"Found {len(all_issues)} potential white/sons mismatches\n")

# For now, just report them with context so we can decide
for filename, issue in all_issues:
    print(f"  [{filename}] {issue['chapter_var']} verse {issue['verse']}:")
    print(f"    Hebrew: {issue['hebrew']} → Gloss: \"{issue['gloss']}\"")
    print()
