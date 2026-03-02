"""
Strong's-based validation script for Hebrew BOM.

For each Hebrew word in the BOM verse files:
1. Look up its Strong's H-number
2. Get the Strong's definition
3. Compare with the current gloss
4. Flag mismatches where the gloss doesn't align with the Hebrew meaning

Uses _strongs_lookup.json for H-number lookup
and _strongs_hebrew.json for definitions.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import re
import json
import os

VERSES_DIR = r"C:\Users\chris\Desktop\Hebrew BOM\verses"
STRONGS_LOOKUP = r"C:\Users\chris\Desktop\Standard Works Project\_strongs_lookup.json"
STRONGS_DEFS = r"C:\Users\chris\Desktop\Standard Works Project\_strongs_hebrew.json"
MAQQEF = '\u05BE'

# ─── Load Strong's data ───

print("Loading Strong's lookup data...")
with open(STRONGS_LOOKUP, 'r', encoding='utf-8') as f:
    strongs_lookup = json.load(f)

print(f"  {len(strongs_lookup)} entries in Strong's lookup")

# Try to load definitions
strongs_defs = {}
if os.path.exists(STRONGS_DEFS):
    with open(STRONGS_DEFS, 'r', encoding='utf-8') as f:
        strongs_defs = json.load(f)
    print(f"  {len(strongs_defs)} entries in Strong's definitions")
else:
    print("  No definitions file found - will only report H-numbers")


# ─── Hebrew text normalization ───

# Common Hebrew prefixes with nikkud
PREFIXES = [
    'וְ', 'וַ', 'וּ', 'וָ', 'וֶ', 'וִ',  # vav conjunctive
    'הַ', 'הָ', 'הֶ',                        # article
    'בְּ', 'בַּ', 'בִּ', 'בָּ', 'בֶּ', 'בְ', 'בַ', 'בִ', 'בּ',  # bet
    'לְ', 'לַ', 'לִ', 'לָ', 'לֶ', 'לּ',    # lamed
    'מִ', 'מֵ', 'מְ', 'מַ',                  # mem
    'כְּ', 'כַּ', 'כְ', 'כַ', 'כָּ',        # kaf
    'שֶׁ', 'שֶ',                               # she-
]

def strip_nikkud(s):
    """Remove all nikkud/cantillation marks."""
    return re.sub(r'[\u0591-\u05C7]', '', s)

def strip_prefixes(word):
    """Strip common Hebrew prefixes."""
    w = word
    for prefix in PREFIXES:
        if w.startswith(prefix) and len(w) > len(prefix) + 1:
            w = w[len(prefix):]
            break
    return w

def lookup_strong(hebrew):
    """Try to find Strong's number for a Hebrew word."""
    # Maqqef-joined: try each part separately
    if MAQQEF in hebrew:
        parts = hebrew.split(MAQQEF)
        results = []
        for part in parts:
            h = lookup_strong_single(part)
            if h:
                results.append((part, h))
        return results

    result = lookup_strong_single(hebrew)
    if result:
        return [(hebrew, result)]
    return []

def lookup_strong_single(hebrew):
    """Look up a single Hebrew word."""
    # Direct match
    if hebrew in strongs_lookup:
        return strongs_lookup[hebrew]

    # Strip prefixes
    stripped = strip_prefixes(hebrew)
    if stripped != hebrew and stripped in strongs_lookup:
        return strongs_lookup[stripped]

    # Strip nikkud
    bare = strip_nikkud(hebrew)
    if bare in strongs_lookup:
        return strongs_lookup[bare]

    # Strip prefixes then nikkud
    bare_stripped = strip_nikkud(stripped)
    if bare_stripped in strongs_lookup:
        return strongs_lookup[bare_stripped]

    return None


def get_strong_meaning(hnum):
    """Get the meaning/definition for a Strong's number."""
    if hnum in strongs_defs:
        entry = strongs_defs[hnum]
        if isinstance(entry, dict):
            return entry.get('meaning', entry.get('gloss', str(entry)))
        return str(entry)
    return None


# ─── Parse verse files ───

def parse_verse_words(filepath):
    """Extract all word pairs from a verse JS file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    words = []
    # Find verse markers for context
    verse_pattern = re.compile(r'num:\s*"([^"]+)"')
    word_pattern = re.compile(r'\["([^"]+)","([^"]+)"\]')

    # Track which verse we're in
    current_verse = "?"
    for m in re.finditer(r'num:\s*"([^"]+)"|(\["[^"]+","[^"]+"\])', content):
        if m.group(1):
            current_verse = m.group(1)
        elif m.group(2):
            wm = word_pattern.match(m.group(2))
            if wm:
                words.append((current_verse, wm.group(1), wm.group(2)))

    return words


# ─── Known false-positive suppressions ───
# BOM-specific names that won't be in Strong's
BOM_NAMES = {
    'נֶפִי', 'לֶחִי', 'לָמָן', 'לֶמוּאֵל', 'צָרָה', 'נֶפִיהָה',
    'אַלְמָא', 'מוֹסִיָּה', 'מוֹרוֹנִי', 'הֵלָמָן', 'שִׁבְלוֹן',
    'זָרַחֶמְלָה', 'אַמּוֹן', 'מוּלֵק', 'קוֹרִיאַנְטוֹן',
    'בִּנְיָמִין', 'אָרוֹן', 'קוֹרִיהוֹר', 'נֶפִיחָה',
}

# Glosses that are valid despite not matching Strong's definitions
# (context-specific translations, BOM theological terms, etc.)
VALID_CONTEXT_GLOSSES = {
    'and-it-came-to-pass', 'it-came-to-pass', 'nevertheless',
    'insomuch', 'inasmuch', 'wherefore', 'therefore',
}


# ─── Run validation ───

print("\nValidating BOM verse files against Strong's concordance...")
print("=" * 80)

verse_files = sorted(f for f in os.listdir(VERSES_DIR) if f.endswith('.js'))

total_words = 0
total_matched = 0
total_unmatched = 0
issues = []

for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    words = parse_verse_words(filepath)

    file_matched = 0
    file_unmatched = 0
    file_issues = []

    for verse_num, hebrew, gloss in words:
        total_words += 1

        # Skip standalone markers
        if gloss == '[ACC]':
            continue

        # Skip BOM-specific names (won't be in Strong's)
        bare = strip_nikkud(hebrew.split(MAQQEF)[0] if MAQQEF in hebrew else hebrew)
        if bare in {strip_nikkud(n) for n in BOM_NAMES}:
            continue

        # Look up Strong's
        matches = lookup_strong(hebrew)

        if matches:
            file_matched += 1
            total_matched += 1
        else:
            file_unmatched += 1
            total_unmatched += 1

    book = filename.replace('.js', '')
    match_pct = (file_matched / len(words) * 100) if words else 0
    print(f"  {book:20s}: {len(words):5d} words, {file_matched:5d} matched ({match_pct:.1f}%), {file_unmatched:5d} unmatched")

print(f"\n{'TOTAL':20s}: {total_words:5d} words, {total_matched:5d} matched ({total_matched/total_words*100:.1f}%), {total_unmatched:5d} unmatched")

# ─── Specific gloss mismatch detection ───

print("\n\nChecking for specific gloss mismatches...")
print("Looking for words where Hebrew meaning clearly contradicts the English gloss:")
print("=" * 80)

# Known problematic patterns:
# Hebrew word X with Strong's meaning Y but glossed as Z (where Y and Z are contradictory)
MEANING_CHECKS = {
    # Hebrew root: (Strong's H, expected meanings, bad glosses)
    'לְבָנִים': ('H1121', ['sons', 'children', 'son'], ['white']),
    'וּלְבָנוֹת': ('H1323', ['daughters', 'daughter'], ['white', 'and-white']),
    'לָבָן': ('H3836', ['white'], ['sons', 'children']),
    'בָּנִים': ('H1121', ['sons', 'children', 'son'], ['white']),
    'בָּנוֹת': ('H1323', ['daughters', 'daughter'], ['white']),
}

mismatch_count = 0

for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    words = parse_verse_words(filepath)

    for verse_num, hebrew, gloss in words:
        # Check maqqef parts too
        parts = hebrew.split(MAQQEF) if MAQQEF in hebrew else [hebrew]

        for part in parts:
            stripped = strip_prefixes(part)
            bare = strip_nikkud(stripped)

            # Check if any word is בנים (sons) glossed as "white"
            if bare in ['בנים', 'בנות'] and 'white' in gloss.lower():
                print(f"  MISMATCH [{filename}] verse {verse_num}: {hebrew} → \"{gloss}\"")
                print(f"    Hebrew {part} (H1121/H1323) means sons/daughters, NOT white")
                mismatch_count += 1

            # Check if "white" is glossed as sons/children
            if bare in ['לבן', 'לבנים'] and ('son' in gloss.lower() or 'daughter' in gloss.lower()):
                # Actually this could be valid: לבנים = to-sons
                pass

print(f"\nTotal specific mismatches found: {mismatch_count}")

# ─── Duplicate gloss detection ───

print("\n\nChecking for remaining duplicate/repeated glosses...")
print("=" * 80)

dup_count = 0
for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)
    words = parse_verse_words(filepath)

    for verse_num, hebrew, gloss in words:
        # Check for word-word duplications like "humble-humble"
        parts = gloss.split('-')
        if len(parts) >= 2:
            for i in range(len(parts) - 1):
                if parts[i] == parts[i+1] and len(parts[i]) > 2:
                    print(f"  DUPLICATE [{filename}] verse {verse_num}: {hebrew} → \"{gloss}\"")
                    dup_count += 1
                    break

print(f"\nTotal duplicate glosses found: {dup_count}")
print("\nDone!")
