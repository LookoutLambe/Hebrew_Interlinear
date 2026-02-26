#!/usr/bin/env python3
"""Content audit of BOM.html - checks which chapters have verse data vs empty stubs."""

import re

file_path = r'C:\Users\chris\Desktop\Hebrew BOM\BOM.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# =====================================================
# 1. Extract all navTo targets from the drawer (nav)
# =====================================================
nav_targets = re.findall(r"navTo\('([^']+)'\)", content)
seen = set()
nav_unique = []
for t in nav_targets:
    if t not in seen:
        seen.add(t)
        nav_unique.append(t)

# =====================================================
# 2. Extract all chapter-panel IDs from HTML
# =====================================================
panel_ids = re.findall(r'class="chapter-panel"[^>]*id="panel-([^"]+)"', content)
panel_set = set(panel_ids)

# =====================================================
# 3. Extract all verse container IDs
# =====================================================
verse_container_ids = re.findall(r'id="([^"]*-verses)"', content)
container_set = set(verse_container_ids)

# =====================================================
# 4. Extract all renderVerseSet calls
# =====================================================
render_calls = re.findall(r"renderVerseSet\((\w+),\s*'([^']+)'\)", content)
rendered_containers = {target: var for var, target in render_calls}

# =====================================================
# 5. Extract all const ...Verses declarations with verse counts
# =====================================================
verse_data_info = {}
for m in re.finditer(r'const\s+(\w+Verses)\s*=\s*\[', content):
    var_name = m.group(1)
    start_pos = m.end()
    bracket_depth = 1
    pos = start_pos
    while bracket_depth > 0 and pos < len(content):
        if content[pos] == '[':
            bracket_depth += 1
        elif content[pos] == ']':
            bracket_depth -= 1
        pos += 1
    array_content = content[start_pos:pos-1]
    verse_count = len(re.findall(r'\{\s*num:', array_content))
    verse_data_info[var_name] = verse_count

# Also count colophonWords (different pattern - it's a flat array of word pairs, not verses)
if 'colophonWords' in content:
    m = re.search(r'const\s+colophonWords\s*=\s*\[', content)
    if m:
        start_pos = m.end()
        bracket_depth = 1
        pos = start_pos
        while bracket_depth > 0 and pos < len(content):
            if content[pos] == '[':
                bracket_depth += 1
            elif content[pos] == ']':
                bracket_depth -= 1
            pos += 1
        array_content = content[start_pos:pos-1]
        word_count = len(re.findall(r'\["', array_content))
        # colophonWords is word pairs, not verse objects

# =====================================================
# DEFINE EXPECTED CHAPTERS PER BOOK
# =====================================================
books = [
    ('1 Nephi (1n)', 'ch', 22, 'ch'),
    ('2 Nephi (2n)', '2n-ch', 33, '2n-ch'),
    ('Jacob (jc)', 'jc-ch', 7, 'jc-ch'),
    ('Enos (en)', 'en-ch', 1, 'en-ch'),
    ('Jarom (jr)', 'jr-ch', 1, 'jr-ch'),
    ('Omni (om)', 'om-ch', 1, 'om-ch'),
    ('Words of Mormon (wm)', 'wm-ch', 1, 'wm-ch'),
    ('Mosiah (mo)', 'mo-ch', 29, 'mo-ch'),
    ('Alma (al)', 'al-ch', 63, 'al-ch'),
    ('Helaman (he)', 'he-ch', 16, 'he-ch'),
    ('3 Nephi (3n)', '3n-ch', 30, '3n-ch'),
    ('4 Nephi (4n)', '4n-ch', 1, '4n-ch'),
    ('Mormon (mm)', 'mm-ch', 9, 'mm-ch'),
    ('Ether (et)', 'et-ch', 15, 'et-ch'),
    ('Moroni (mr)', 'mr-ch', 10, 'mr-ch'),
]

def compress_ranges(nums):
    if not nums:
        return ''
    ranges = []
    start = nums[0]
    end = nums[0]
    for n in nums[1:]:
        if n == end + 1:
            end = n
        else:
            ranges.append(f'{start}-{end}' if start != end else str(start))
            start = end = n
    ranges.append(f'{start}-{end}' if start != end else str(start))
    return ', '.join(ranges)


print('=' * 80)
print('HEBREW BOOK OF MORMON -- CONTENT AUDIT REPORT')
print('=' * 80)
print()

total_with_content = 0
total_empty = 0
total_expected = 0

for book_name, prefix, num_chapters, nav_prefix in books:
    print(f'--- {book_name} ({num_chapters} chapters expected) ---')

    chapters_with_content = []
    chapters_empty = []

    for ch_num in range(1, num_chapters + 1):
        chapter_id = f'{prefix}{ch_num}'
        container_id = f'{chapter_id}-verses'
        panel_id = chapter_id

        has_panel = panel_id in panel_set
        has_container = container_id in container_set
        has_render = container_id in rendered_containers

        if has_render:
            var_name = rendered_containers[container_id]
            verse_count = verse_data_info.get(var_name, 0)
            status = f'CONTENT ({verse_count} verses, var={var_name})'
            chapters_with_content.append(ch_num)
            total_with_content += 1
        else:
            if has_panel and has_container:
                status = 'EMPTY STUB (panel+container exist, no verse data)'
            elif has_panel:
                status = 'EMPTY STUB (panel exists, no verse data)'
            elif has_container:
                status = 'EMPTY STUB (container exists, no verse data)'
            else:
                status = 'MISSING (no panel, no container, no data)'
            chapters_empty.append(ch_num)
            total_empty += 1

        has_nav = chapter_id in seen
        nav_status = 'in nav' if has_nav else 'NOT in nav'

        total_expected += 1
        print(f'  Ch {ch_num:>2}: {status} [{nav_status}]')

    print(f'  SUMMARY: {len(chapters_with_content)}/{num_chapters} with content, {len(chapters_empty)} empty')
    if chapters_empty:
        print(f'  EMPTY chapters: {compress_ranges(chapters_empty)}')
    print()

print('=' * 80)
print('OVERALL SUMMARY')
print('=' * 80)
print(f'Total expected chapters: {total_expected}')
print(f'Chapters WITH content:   {total_with_content}')
print(f'Chapters EMPTY/MISSING:  {total_empty}')
print()

# =====================================================
# NAV-TO-PANEL CROSS-REFERENCE
# =====================================================
print('=' * 80)
print('NAV-TO-PANEL CROSS-REFERENCE')
print('=' * 80)

chapter_nav = [n for n in nav_unique if not n.startswith('front-') and n != 'intro']
orphan_nav = []
for nav_id in chapter_nav:
    if nav_id not in panel_set:
        orphan_nav.append(nav_id)

if orphan_nav:
    print(f'Nav entries pointing to NON-EXISTENT panels ({len(orphan_nav)}):')
    for n in orphan_nav:
        print(f'  navTo("{n}") -> panel-{n} NOT FOUND')
else:
    print('All nav entries have matching panels.')

panel_chapters = [p for p in panel_ids if p != 'intro']
orphan_panels = [p for p in panel_chapters if p not in seen]
if orphan_panels:
    print(f'\nPanels with NO nav entry ({len(orphan_panels)}):')
    for p in orphan_panels:
        has_render_for = f'{p}-verses' in rendered_containers
        render_note = ' (HAS verse data)' if has_render_for else ' (no verse data)'
        print(f'  panel-{p} exists but has no navTo entry{render_note}')
else:
    print('All panels have matching nav entries.')

print()

# =====================================================
# COLOPHON STATUS
# =====================================================
print('=' * 80)
print('COLOPHON STATUS')
print('=' * 80)
print(f'  1 Nephi colophon: rendered via renderColophon() to "colophon-flow" (word pairs, not verses)')
print(f'  2 Nephi colophon: {"CONTENT" if "n2_colophonVerses" in verse_data_info else "EMPTY"} ({verse_data_info.get("n2_colophonVerses", 0)} verses)')
print(f'  Jacob colophon: {"CONTENT" if "jc_colophonVerses" in verse_data_info else "EMPTY"} ({verse_data_info.get("jc_colophonVerses", 0)} verses)')
print()

# =====================================================
# SPECIAL NOTES
# =====================================================
print('=' * 80)
print('SPECIAL NOTES')
print('=' * 80)

# 4 Nephi uses fn_ prefix
if 'fn_ch1Verses' in verse_data_info:
    print(f'4 Nephi: Uses JS variable "fn_ch1Verses" ({verse_data_info["fn_ch1Verses"]} verses)')
    print(f'  Rendered to container "4n-ch1-verses" -- mapping confirmed')

# Mosiah 28 out of order
mo28_pos = content.find('const mo_ch28Verses')
mo27_pos = content.find('const mo_ch27Verses')
mo29_pos = content.find('const mo_ch29Verses')
if mo28_pos > 0 and mo27_pos > 0 and mo29_pos > 0:
    if mo28_pos > mo29_pos:
        print(f'Mosiah 28: Data is declared AFTER Mosiah 29 (out of order in source)')
        print(f'  mo_ch27 at char {mo27_pos}, mo_ch29 at char {mo29_pos}, mo_ch28 at char {mo28_pos}')

print()

# =====================================================
# PER-BOOK COMPLETION TABLE
# =====================================================
print('=' * 80)
print('COMPLETION TABLE')
print('=' * 80)
print(f'{"Book":<25} {"Expected":>8} {"Content":>8} {"Empty":>8} {"Pct":>6}')
print('-' * 57)

for book_name, prefix, num_chapters, nav_prefix in books:
    content_count = 0
    for ch_num in range(1, num_chapters + 1):
        container_id = f'{prefix}{ch_num}-verses'
        if container_id in rendered_containers:
            content_count += 1
    empty_count = num_chapters - content_count
    pct = f'{100*content_count/num_chapters:.0f}%' if num_chapters > 0 else 'N/A'
    print(f'{book_name:<25} {num_chapters:>8} {content_count:>8} {empty_count:>8} {pct:>6}')

grand_total = sum(nc for _, _, nc, _ in books)
grand_content = total_with_content
grand_empty = total_empty
print('-' * 57)
print(f'{"TOTAL":<25} {grand_total:>8} {grand_content:>8} {grand_empty:>8} {100*grand_content/grand_total:.0f}%')
