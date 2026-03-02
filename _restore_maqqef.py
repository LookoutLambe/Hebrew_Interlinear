"""
Restore maqqef-joined Hebrew forms in BOM verse JS files.
Reads the original Word document to find all maqqef-joined forms,
then scans verse files to rejoin split pairs.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import re
import json
import os
from docx import Document

MAQQEF = '\u05BE'  # ־
VERSES_DIR = r"C:\Users\chris\Desktop\Hebrew BOM\verses"
DOCX_PATH = r"C:\Users\chris\Desktop\Hebrew BOM\Hebrew_BOM_20_February_2026.docx"

# ─── Step 1: Extract all maqqef-joined forms from Word doc ───

print("Step 1: Reading Word document for maqqef forms...")
doc = Document(DOCX_PATH)

# Build a set of all maqqef-joined pairs/triples from the docx
# Store as tuples of the component parts
maqqef_set = set()
for para in doc.paragraphs:
    text = para.text
    for token in text.split():
        cleaned = token.strip('.,;:!? \t\n\r()[]{}')
        if MAQQEF in cleaned:
            parts = cleaned.split(MAQQEF)
            # Only keep if all parts have Hebrew chars
            heb_re = re.compile(r'[\u0590-\u05FF]')
            if all(heb_re.search(p) for p in parts if p):
                maqqef_set.add(tuple(parts))

print(f"  Found {len(maqqef_set)} unique maqqef-joined forms")

# Group by number of parts
by_len = {}
for form in maqqef_set:
    n = len(form)
    if n not in by_len:
        by_len[n] = []
    by_len[n].append(form)

for n in sorted(by_len):
    print(f"  {n}-part forms: {len(by_len[n])}")

# ─── Step 2: Build lookup for fast matching ───

# For each possible first word, store what continuations exist
# This allows us to scan word arrays and find matches
first_word_lookup = {}  # first_word -> list of (remaining_parts_tuple, full_form)
for form in maqqef_set:
    first = form[0]
    rest = form[1:]
    if first not in first_word_lookup:
        first_word_lookup[first] = []
    first_word_lookup[first].append((rest, form))

# Sort each entry by length (longest match first) for greedy matching
for key in first_word_lookup:
    first_word_lookup[key].sort(key=lambda x: -len(x[0]))

# ─── Step 3: Known idiom glosses ───

IDIOM_GLOSSES = {
    ('עַל', 'כֵּן'): 'therefore',
    ('וְעַל', 'כֵּן'): 'wherefore',
    ('אַף', 'עַל', 'פִּי', 'כֵן'): 'nevertheless',
    ('וְאַף', 'עַל', 'פִּי', 'כֵן'): 'nevertheless',
    ('אִם', 'לֹא'): 'except',
    ('וְאִם', 'לֹא'): 'and-if-not',
    ('עַל', 'פִּי'): 'according-to',
    ('עַל', 'פְּנֵי'): 'upon-the-face-of',
    ('עַל', 'יְדֵי'): 'by-the-hand-of',
    ('עַד', 'אֲשֶׁר'): 'until',
    ('מִן', 'הָאָרֶץ'): 'from-the-land',
}


def combine_glosses(parts_with_glosses):
    """
    Combine glosses when joining maqqef words.
    parts_with_glosses: list of (hebrew, gloss)
    """
    hebrew_parts = tuple(p[0] for p in parts_with_glosses)

    # Check idiom table
    if hebrew_parts in IDIOM_GLOSSES:
        return IDIOM_GLOSSES[hebrew_parts]

    # Filter out [ACC] glosses (accusative marker has no English equivalent)
    glosses = []
    for h, g in parts_with_glosses:
        if g == '[ACC]':
            continue
        glosses.append(g)

    if not glosses:
        return '[ACC]'

    if len(glosses) == 1:
        return glosses[0]

    # Concatenate remaining glosses
    return '-'.join(glosses)


# ─── Step 4: Parse and fix verse JS files ───

def strip_nikkud(s):
    """Remove vowel points for comparison."""
    return re.sub(r'[\u0591-\u05C7]', '', s)


def parse_verse_file(filepath):
    """Read verse JS file content."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def find_word_arrays(content):
    """
    Find all word arrays in the JS content.
    Each word is ["hebrew","gloss"].
    Returns list of (start_pos, end_pos, words_list) for each verse.
    """
    results = []
    # Pattern to find words arrays
    # words: [ ... ]
    pattern = re.compile(r'words:\s*\[')
    for m in pattern.finditer(content):
        start = m.end()
        # Find matching ]
        depth = 1
        pos = start
        while pos < len(content) and depth > 0:
            if content[pos] == '[':
                depth += 1
            elif content[pos] == ']':
                depth -= 1
            pos += 1
        end = pos - 1  # position of closing ]

        # Parse the words between start and end
        words_str = content[start:end]
        # Extract ["hebrew","gloss"] pairs
        word_pattern = re.compile(r'\["([^"]+)","([^"]+)"\]')
        words = [(wm.group(1), wm.group(2), wm.start() + start, wm.end() + start)
                 for wm in word_pattern.finditer(words_str)]
        results.append((m.start(), end + 1, words))

    return results


def process_file(filepath):
    """Process a single verse file to restore maqqef."""
    content = parse_verse_file(filepath)
    verse_arrays = find_word_arrays(content)

    total_joins = 0

    # Process from end to start so position offsets don't shift
    for verse_start, verse_end, words in reversed(verse_arrays):
        if not words:
            continue

        # Scan words for maqqef matches
        i = 0
        joins = []  # list of (start_idx, count, joined_hebrew, joined_gloss)

        while i < len(words):
            hebrew, gloss, wstart, wend = words[i]

            # Check if this word starts a maqqef sequence
            if hebrew in first_word_lookup:
                best_match = None
                best_len = 0

                for rest_parts, full_form in first_word_lookup[hebrew]:
                    match_len = len(rest_parts) + 1  # total words in match

                    if i + match_len > len(words):
                        continue

                    # Check if subsequent words match
                    matched = True
                    for j, expected in enumerate(rest_parts):
                        actual = words[i + 1 + j][0]
                        if actual != expected:
                            matched = False
                            break

                    if matched and match_len > best_len:
                        best_match = full_form
                        best_len = match_len

                if best_match and best_len > 1:
                    # Found a match! Record the join
                    parts_with_glosses = [(words[i + k][0], words[i + k][1])
                                         for k in range(best_len)]
                    joined_hebrew = MAQQEF.join(best_match)
                    joined_gloss = combine_glosses(parts_with_glosses)

                    # Check if already joined (skip if maqqef already present)
                    if MAQQEF not in hebrew:
                        joins.append((i, best_len, joined_hebrew, joined_gloss))

                    i += best_len
                    continue

            i += 1

        # Apply joins in reverse order
        for idx, count, joined_h, joined_g in reversed(joins):
            # Build the replacement string
            first_word = words[idx]
            last_word = words[idx + count - 1]

            # The text to replace: from first word's [ to last word's ]
            # We need to find the exact range in content
            replace_start = first_word[2]  # start of first ["
            replace_end = last_word[3]     # end of last "]

            # But we also need to remove the commas between words
            # Let's find the full span including any commas/spaces before next word
            old_text = content[replace_start:replace_end]
            new_text = f'["{joined_h}","{joined_g}"]'

            content = content[:replace_start] + new_text + content[replace_end:]
            total_joins += 1

    return content, total_joins


# ─── Step 5: Process all verse files ───

print("\nStep 2: Processing verse files...")

verse_files = [f for f in os.listdir(VERSES_DIR) if f.endswith('.js')]
verse_files.sort()

grand_total = 0
for filename in verse_files:
    filepath = os.path.join(VERSES_DIR, filename)

    # Count existing maqqef first
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    existing_maqqef = original.count(MAQQEF)

    new_content, join_count = process_file(filepath)

    if join_count > 0:
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        new_maqqef = new_content.count(MAQQEF)
        print(f"  {filename}: {join_count} joins ({existing_maqqef} → {new_maqqef} maqqef)")
        grand_total += join_count
    else:
        print(f"  {filename}: no changes needed ({existing_maqqef} maqqef)")

print(f"\nTotal joins made: {grand_total}")
