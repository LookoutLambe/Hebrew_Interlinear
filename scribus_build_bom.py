# -*- coding: utf-8 -*-
"""
Hebrew Book of Mormon — Scribus Typesetting Script
===================================================
Run inside Scribus 1.6+ via  Script > Execute Script.

Produces a 6x9-inch, two-column RTL Hebrew edition modeled after
the official LDS English Book of Mormon layout.

Data files expected in the working directory:
  - official_verses.json
  - crossrefs.json
  - chapter_headings_heb.js
  - front_matter.json

Font: David (the Windows built-in Hebrew font, NOT David Libre)
"""

from __future__ import unicode_literals
import sys, os, json, re, math, traceback

# ---------------------------------------------------------------------------
# 0.  Scribus sanity check
# ---------------------------------------------------------------------------
try:
    import scribus
except ImportError:
    print("ERROR: This script must be run inside Scribus "
          "(Script > Execute Script).")
    sys.exit(1)

# ---------------------------------------------------------------------------
# 1.  CONSTANTS  (all measurements in points; 1 inch = 72 pt)
# ---------------------------------------------------------------------------
INCH = 72.0
PAGE_W = 6.0 * INCH            # 432 pt
PAGE_H = 9.0 * INCH            # 648 pt

# Margins
MARGIN_TOP     = 0.65 * INCH   # room for running header
MARGIN_BOTTOM  = 0.55 * INCH
MARGIN_INSIDE  = 0.75 * INCH   # gutter (binding side)
MARGIN_OUTSIDE = 0.55 * INCH

COLUMN_GAP     = 0.2  * INCH   # gap between body columns
HEADER_Y       = 0.35 * INCH   # running-header top
FOOTNOTE_SEP   = 8.0           # vertical space above footnotes
FOOTNOTE_RULE_W = 1.5 * INCH   # width of separator rule

# Derived
TEXT_AREA_W = PAGE_W - MARGIN_INSIDE - MARGIN_OUTSIDE
TEXT_AREA_H = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM
COL_W = (TEXT_AREA_W - COLUMN_GAP) / 2.0

# Font names — Scribus often needs the PostScript / internal name.
# We will attempt auto-detection at startup and fall back to these.
FONT_BODY          = "David"
FONT_BODY_BOLD     = "David Bold"
FONT_BODY_ITALIC   = "David Italic"
FONT_BODY_BOLDITAL = "David Bold Italic"

# Sizes (points)
FONT_SIZE_BODY       = 13.0
FONT_SIZE_VERSE_NUM  = 13.0    # bold verse numeral
FONT_SIZE_HEADER     = 9.0     # running header
FONT_SIZE_FN         = 7.5     # footnote body
FONT_SIZE_FN_MARKER  = 7.0     # superscript ref marker in body text
FONT_SIZE_CH_LABEL   = 18.0    # "פרק א"
FONT_SIZE_CH_HEADING = 10.0    # italic heading summary

LINE_SPACING_BODY = 16.0       # leading for body text
LINE_SPACING_FN   = 9.0        # leading for footnotes

COLOR_BLACK = "Black"

# Footnote columns
FN_COLUMNS = 3

# ---------------------------------------------------------------------------
# 2.  DATA DIRECTORY
# ---------------------------------------------------------------------------
DATA_DIR = "C:/Users/chris/Desktop/Hebrew BOM"

# ---------------------------------------------------------------------------
# 3.  HEBREW NUMERAL CONVERSION
# ---------------------------------------------------------------------------
_ONES = ["", "\u05D0", "\u05D1", "\u05D2", "\u05D3",
         "\u05D4", "\u05D5", "\u05D6", "\u05D7", "\u05D8"]
_TENS = ["", "\u05D9", "\u05DB", "\u05DC", "\u05DE",
         "\u05E0", "\u05E1", "\u05E2", "\u05E4", "\u05E6"]
_HUNDREDS = ["", "\u05E7", "\u05E8", "\u05E9", "\u05EA"]

def int_to_heb(n):
    """Convert integer 1-999 to Hebrew numeral string.
    Special: 15=\u05D8\u05D5  16=\u05D8\u05D6  (avoids spelling divine names)."""
    if n <= 0 or n > 999:
        return str(n)
    parts = []
    h = n // 100
    if h > 4:
        parts.append("\u05EA")   # 400
        h -= 4
    if h > 0:
        parts.append(_HUNDREDS[h])
    r = n % 100
    if r == 15:
        parts.append("\u05D8\u05D5")
    elif r == 16:
        parts.append("\u05D8\u05D6")
    else:
        t = r // 10
        u = r % 10
        if t:
            parts.append(_TENS[t])
        if u:
            parts.append(_ONES[u])
    return "".join(parts)


# Footnote marker: a->aleph .. t->tav  (22 Hebrew letters)
_MARKER_HEB = list(
    "\u05D0\u05D1\u05D2\u05D3\u05D4\u05D5\u05D6\u05D7\u05D8"
    "\u05D9\u05DB\u05DC\u05DE\u05E0\u05E1\u05E2\u05E4\u05E6"
    "\u05E7\u05E8\u05E9\u05EA")

def marker_to_heb(letter):
    idx = ord(letter.lower()) - ord('a')
    if 0 <= idx < len(_MARKER_HEB):
        return _MARKER_HEB[idx]
    return letter

# ---------------------------------------------------------------------------
# 4.  BOOK NAME MAPS
# ---------------------------------------------------------------------------
BOOK_HEB = {
    "1 Nephi":         "\u05E0\u05E4\u05D9 \u05D0\u05F3",
    "2 Nephi":         "\u05E0\u05E4\u05D9 \u05D1\u05F3",
    "Jacob":           "\u05D9\u05E2\u05E7\u05D1",
    "Enos":            "\u05D0\u05E0\u05D5\u05E9",
    "Jarom":           "\u05D9\u05E8\u05D5\u05DD",
    "Omni":            "\u05E2\u05DE\u05E0\u05D9",
    "Words of Mormon": "\u05D3\u05D1\u05E8\u05D9 \u05DE\u05D5\u05E8\u05DE\u05D5\u05DF",
    "Mosiah":          "\u05DE\u05D5\u05E9\u05D9\u05D4",
    "Alma":            "\u05D0\u05DC\u05DE\u05D0",
    "Helaman":         "\u05D4\u05D9\u05DC\u05DE\u05DF",
    "3 Nephi":         "\u05E0\u05E4\u05D9 \u05D2\u05F3",
    "4 Nephi":         "\u05E0\u05E4\u05D9 \u05D3\u05F3",
    "Mormon":          "\u05DE\u05D5\u05E8\u05DE\u05D5\u05DF",
    "Ether":           "\u05D0\u05EA\u05E8",
    "Moroni":          "\u05DE\u05D5\u05E8\u05D5\u05E0\u05D9",
}

BOOK_HEB_FULL = {
    "1 Nephi":         "\u05E1\u05E4\u05E8 \u05E0\u05E4\u05D9 \u05D4\u05E8\u05D0\u05E9\u05D5\u05DF",
    "2 Nephi":         "\u05E1\u05E4\u05E8 \u05E0\u05E4\u05D9 \u05D4\u05E9\u05E0\u05D9",
    "Jacob":           "\u05E1\u05E4\u05E8 \u05D9\u05E2\u05E7\u05D1",
    "Enos":            "\u05E1\u05E4\u05E8 \u05D0\u05E0\u05D5\u05E9",
    "Jarom":           "\u05E1\u05E4\u05E8 \u05D9\u05E8\u05D5\u05DD",
    "Omni":            "\u05E1\u05E4\u05E8 \u05E2\u05DE\u05E0\u05D9",
    "Words of Mormon": "\u05D3\u05D1\u05E8\u05D9 \u05DE\u05D5\u05E8\u05DE\u05D5\u05DF",
    "Mosiah":          "\u05E1\u05E4\u05E8 \u05DE\u05D5\u05E9\u05D9\u05D4",
    "Alma":            "\u05E1\u05E4\u05E8 \u05D0\u05DC\u05DE\u05D0",
    "Helaman":         "\u05E1\u05E4\u05E8 \u05D4\u05D9\u05DC\u05DE\u05DF",
    "3 Nephi":         "\u05E1\u05E4\u05E8 \u05E0\u05E4\u05D9 \u05D4\u05E9\u05DC\u05D9\u05E9\u05D9",
    "4 Nephi":         "\u05E1\u05E4\u05E8 \u05E0\u05E4\u05D9 \u05D4\u05E8\u05D1\u05D9\u05E2\u05D9",
    "Mormon":          "\u05E1\u05E4\u05E8 \u05DE\u05D5\u05E8\u05DE\u05D5\u05DF",
    "Ether":           "\u05E1\u05E4\u05E8 \u05D0\u05EA\u05E8",
    "Moroni":          "\u05E1\u05E4\u05E8 \u05DE\u05D5\u05E8\u05D5\u05E0\u05D9",
}

# ---------------------------------------------------------------------------
# 5.  LOAD DATA FILES
# ---------------------------------------------------------------------------
def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)

def load_chapter_headings():
    """Parse chapter_headings_heb.js  — a JS var assignment wrapping JSON."""
    path = os.path.join(DATA_DIR, "chapter_headings_heb.js")
    with open(path, "r", encoding="utf-8") as fh:
        raw = fh.read()
    raw = raw.strip()
    # Strip everything up to and including the first '{'
    idx = raw.index('{')
    raw = raw[idx:]
    # Strip trailing semicolons
    raw = raw.rstrip().rstrip(';').rstrip()
    # Fix JS trailing commas that are invalid JSON
    raw = re.sub(r',(\s*})', r'\1', raw)
    return json.loads(raw)

# ---------------------------------------------------------------------------
# 6.  FONT AUTO-DETECTION
# ---------------------------------------------------------------------------
def detect_fonts():
    """Try to find the Scribus-internal names for the David font family.
    Falls back to common naming conventions."""
    global FONT_BODY, FONT_BODY_BOLD, FONT_BODY_ITALIC, FONT_BODY_BOLDITAL
    try:
        all_fonts = scribus.getFontNames()
    except Exception:
        print("  Warning: could not enumerate fonts; using defaults.")
        return

    # Build a lookup: lower-cased -> real name
    lc = {f.lower(): f for f in all_fonts}

    # Collect all David variants for diagnostics
    david_fonts = [f for f in all_fonts if "david" in f.lower()
                   and "libre" not in f.lower()]
    print(f"  David fonts found in Scribus: {david_fonts}")

    # Candidates for each weight / style (ordered by preference)
    candidates_regular = [
        "David", "David Regular",
    ]
    candidates_bold = [
        "David Bold", "David-Bold",
    ]
    candidates_italic = [
        "David Italic", "David-Italic",
        "David Oblique", "David-Oblique",
    ]
    candidates_boldital = [
        "David Bold Italic", "David-BoldItalic",
        "David Bold Oblique",
    ]

    def _find(cands, style_keywords, fallback):
        """Match by exact candidate name first, then by keyword in David fonts."""
        for c in cands:
            if c.lower() in lc:
                return lc[c.lower()]
        # Keyword search among David fonts
        for f in david_fonts:
            fl = f.lower()
            if all(kw in fl for kw in style_keywords):
                return f
        # Final fallback: if looking for regular, any David font without
        # bold/italic/oblique qualifiers
        if not style_keywords:
            for f in david_fonts:
                fl = f.lower()
                if ("bold" not in fl and "italic" not in fl
                        and "oblique" not in fl):
                    return f
        return fallback

    FONT_BODY        = _find(candidates_regular,  [],                  FONT_BODY)
    FONT_BODY_BOLD   = _find(candidates_bold,     ["bold"],            FONT_BODY_BOLD)
    FONT_BODY_ITALIC = _find(candidates_italic,   ["italic"],          FONT_BODY_ITALIC)
    # If no italic found, try oblique
    if FONT_BODY_ITALIC == "David Italic":
        alt = _find([], ["oblique"], FONT_BODY_ITALIC)
        if alt != FONT_BODY_ITALIC:
            FONT_BODY_ITALIC = alt
    FONT_BODY_BOLDITAL = _find(candidates_boldital, ["bold", "italic"], FONT_BODY_BOLDITAL)

    print(f"  Using: body={FONT_BODY}  bold={FONT_BODY_BOLD}  "
          f"italic={FONT_BODY_ITALIC}")

# ---------------------------------------------------------------------------
# 7.  UNIQUE FRAME NAME GENERATOR
# ---------------------------------------------------------------------------
_frame_ctr = 0
def _fn(prefix="frm"):
    global _frame_ctr
    _frame_ctr += 1
    return f"{prefix}_{_frame_ctr}"

# ---------------------------------------------------------------------------
# 8.  PAGE GEOMETRY
# ---------------------------------------------------------------------------
def page_margins(page_num):
    """Return (left_margin, right_margin) accounting for recto / verso."""
    if page_num % 2 == 1:          # recto
        return (MARGIN_INSIDE, MARGIN_OUTSIDE)
    else:                           # verso
        return (MARGIN_OUTSIDE, MARGIN_INSIDE)

def body_rect(page_num, fn_h=0):
    ml, _ = page_margins(page_num)
    return (ml, MARGIN_TOP, TEXT_AREA_W, TEXT_AREA_H - fn_h)

def fn_rect(page_num, fn_h):
    ml, _ = page_margins(page_num)
    return (ml, PAGE_H - MARGIN_BOTTOM - fn_h, TEXT_AREA_W, fn_h)

# ---------------------------------------------------------------------------
# 9.  SCRIBUS FRAME BUILDERS
# ---------------------------------------------------------------------------
def set_rtl(name):
    """Set a text frame to RTL direction (safe for older Scribus builds)."""
    try:
        scribus.setTextDirection(scribus.DIRECTION_RTL, name)
    except AttributeError:
        try:
            scribus.setTextDirection(1, name)  # fallback constant
        except Exception:
            pass

def make_body_frame(page_num, fn_h=0):
    """Two-column RTL body text frame.  Returns frame name."""
    x, y, w, h = body_rect(page_num, fn_h)
    name = _fn("body")
    scribus.createText(x, y, w, h, name)
    scribus.setColumns(2, name)
    scribus.setColumnGap(COLUMN_GAP, name)
    set_rtl(name)
    scribus.setFont(FONT_BODY, name)
    scribus.setFontSize(FONT_SIZE_BODY, name)
    scribus.setLineSpacing(LINE_SPACING_BODY, name)
    scribus.setTextAlignment(scribus.ALIGN_RIGHT, name)
    return name

def make_fn_frame(page_num, fn_h):
    """Three-column footnote text frame.  Returns frame name."""
    x, y, w, h = fn_rect(page_num, fn_h)
    name = _fn("foot")
    scribus.createText(x, y, w, h, name)
    scribus.setColumns(FN_COLUMNS, name)
    scribus.setColumnGap(COLUMN_GAP * 0.6, name)
    set_rtl(name)
    scribus.setFont(FONT_BODY, name)
    scribus.setFontSize(FONT_SIZE_FN, name)
    scribus.setLineSpacing(LINE_SPACING_FN, name)
    scribus.setTextAlignment(scribus.ALIGN_RIGHT, name)
    return name

def make_fn_rule(page_num, fn_h):
    """Draw thin horizontal separator above footnotes."""
    ml, _ = page_margins(page_num)
    rule_y = PAGE_H - MARGIN_BOTTOM - fn_h - FOOTNOTE_SEP * 0.4
    # For RTL: rule starts from the right edge of text area
    rule_x = ml + TEXT_AREA_W - FOOTNOTE_RULE_W
    name = _fn("rule")
    scribus.createLine(rule_x, rule_y, rule_x + FOOTNOTE_RULE_W, rule_y, name)
    scribus.setLineWidth(0.5, name)
    scribus.setLineColor(COLOR_BLACK, name)
    return name

def make_header(page_num, book_heb, vrange_heb):
    """Running header: book name on one side, verse range on the other.
    Odd (recto): book name RIGHT, verse range LEFT.
    Even (verso): swapped."""
    ml, _ = page_margins(page_num)
    hw = TEXT_AREA_W
    hy = HEADER_Y - 2
    hh = 14.0

    # We create two overlapping frames — one right-aligned, one left-aligned.
    r_name = _fn("hdr")
    scribus.createText(ml, hy, hw, hh, r_name)
    scribus.setFont(FONT_BODY, r_name)
    scribus.setFontSize(FONT_SIZE_HEADER, r_name)
    scribus.setLineSpacing(FONT_SIZE_HEADER + 2, r_name)
    set_rtl(r_name)

    l_name = _fn("hdr")
    scribus.createText(ml, hy, hw, hh, l_name)
    scribus.setFont(FONT_BODY, l_name)
    scribus.setFontSize(FONT_SIZE_HEADER, l_name)
    scribus.setLineSpacing(FONT_SIZE_HEADER + 2, l_name)
    set_rtl(l_name)

    if page_num % 2 == 1:
        # Recto: book name right, verse range left
        scribus.setTextAlignment(scribus.ALIGN_RIGHT, r_name)
        scribus.insertText(book_heb, 0, r_name)
        scribus.setTextAlignment(scribus.ALIGN_LEFT, l_name)
        scribus.insertText(vrange_heb, 0, l_name)
    else:
        # Verso: book name left, verse range right
        scribus.setTextAlignment(scribus.ALIGN_LEFT, r_name)
        scribus.insertText(book_heb, 0, r_name)
        scribus.setTextAlignment(scribus.ALIGN_RIGHT, l_name)
        scribus.insertText(vrange_heb, 0, l_name)

# ---------------------------------------------------------------------------
# 10.  SUPERSCRIPT SUPPORT  (via character style)
# ---------------------------------------------------------------------------
_SUPER_STYLE_CREATED = False
SUPER_STYLE_NAME = "_bom_superscript"

def ensure_super_style():
    """Create a character style with superscript feature (once)."""
    global _SUPER_STYLE_CREATED
    if _SUPER_STYLE_CREATED:
        return
    try:
        scribus.createCharStyle(
            name=SUPER_STYLE_NAME,
            font=FONT_BODY,
            fontsize=FONT_SIZE_FN_MARKER,
            features="superscript"
        )
        _SUPER_STYLE_CREATED = True
        print(f"  Superscript character style '{SUPER_STYLE_NAME}' created.")
    except Exception as e:
        print(f"  Warning: could not create superscript char style: {e}")
        _SUPER_STYLE_CREATED = True   # don't retry

def apply_superscript(frame, start, length):
    """Apply superscript styling to a range of characters."""
    ensure_super_style()
    scribus.selectText(start, length, frame)
    try:
        scribus.setCharacterStyle(SUPER_STYLE_NAME, frame)
    except Exception:
        # Fallback: just make it smaller
        scribus.setFontSize(FONT_SIZE_FN_MARKER, frame)

# ---------------------------------------------------------------------------
# 11.  VERSE TEXT INSERTION
# ---------------------------------------------------------------------------
def insert_verse_text(frame, vobj, xrefs, pos):
    """Insert one verse into *frame* starting at character *pos*.

    Format (continuous-flow, same as official LDS edition):
      <bold verse-numeral><space><verse text><superscript markers><space>

    Returns the new position after the inserted text.
    """
    v_num = int_to_heb(vobj["verse"])
    heb   = vobj["hebrew"]

    # Collect footnote marker letters
    fn_chars = []
    if xrefs:
        for x in xrefs:
            fn_chars.append(marker_to_heb(x.get("marker", "a")))

    # Build plain text
    num_str = v_num + " "                 # verse number + space
    body_str = heb.rstrip()               # verse body (strip trailing ws)
    marker_str = "".join(fn_chars) if fn_chars else ""
    # Join: numStr + bodyStr + optional(" " + markers) + trailing space
    if marker_str:
        full = num_str + body_str + " " + marker_str + " "
    else:
        full = num_str + body_str + " "

    # Insert
    scribus.insertText(full, pos, frame)
    start = pos

    # --- Style: verse number (bold) ---
    scribus.selectText(start, len(num_str), frame)
    scribus.setFont(FONT_BODY_BOLD, frame)
    scribus.setFontSize(FONT_SIZE_VERSE_NUM, frame)

    # --- Style: body text (regular) ---
    body_start = start + len(num_str)
    body_len   = len(body_str)
    scribus.selectText(body_start, body_len, frame)
    scribus.setFont(FONT_BODY, frame)
    scribus.setFontSize(FONT_SIZE_BODY, frame)

    # --- Style: footnote markers (superscript, smaller) ---
    if marker_str:
        m_start = body_start + body_len + 1   # +1 for space
        m_len   = len(marker_str)
        apply_superscript(frame, m_start, m_len)

    return start + len(full)


def insert_chapter_heading(frame, book_eng, ch_num, pos):
    """Insert chapter label + heading summary at *pos*.

    Layout:
        (centered, bold, large)    \u05E4\u05E8\u05E7 <numeral>
        (italic, smaller)          heading text ...
        (blank line)

    Returns new position.
    """
    ch_heb = int_to_heb(ch_num)

    # --- "פרק X" label ---
    label = "\u05E4\u05E8\u05E7 " + ch_heb + "\n"
    scribus.insertText(label, pos, frame)
    scribus.selectText(pos, len(label) - 1, frame)
    scribus.setFont(FONT_BODY_BOLD, frame)
    scribus.setFontSize(FONT_SIZE_CH_LABEL, frame)
    scribus.setTextAlignment(scribus.ALIGN_CENTER, frame)
    pos += len(label)

    # --- Heading summary (italic) ---
    key = f"{book_eng} {ch_num}"
    heading = CHAPTER_HEADINGS.get(key, "")
    if heading:
        heading = heading.strip() + "\n"
        scribus.insertText(heading, pos, frame)
        scribus.selectText(pos, len(heading) - 1, frame)
        scribus.setFont(FONT_BODY_ITALIC, frame)
        scribus.setFontSize(FONT_SIZE_CH_HEADING, frame)
        scribus.setTextAlignment(scribus.ALIGN_RIGHT, frame)
        pos += len(heading)

    # blank line separator
    scribus.insertText("\n", pos, frame)
    pos += 1
    return pos

# ---------------------------------------------------------------------------
# 12.  FOOTNOTE BUILDER
# ---------------------------------------------------------------------------
def build_footnote_text(page_verses):
    """Build the complete footnote string and style metadata for one page.

    page_verses = [(verse_obj, xref_list), ...]

    Returns (fn_text, style_runs)
      style_runs = [(start, length, font, size), ...]
    """
    parts = []
    runs  = []
    pos   = 0

    for vobj, xrefs in page_verses:
        if not xrefs:
            continue
        v_heb = int_to_heb(vobj["verse"])
        for entry in xrefs:
            m_heb   = marker_to_heb(entry.get("marker", "a"))
            keyword = entry.get("text", "")
            refs    = entry.get("refs", [])

            # --- Verse+marker label (bold) ---
            lbl = v_heb + m_heb + " "
            parts.append(lbl)
            runs.append((pos, len(lbl), FONT_BODY_BOLD, FONT_SIZE_FN))
            pos += len(lbl)

            # --- Keyword (italic) ---
            if keyword:
                kw = keyword + ". "
                parts.append(kw)
                runs.append((pos, len(kw), FONT_BODY_ITALIC, FONT_SIZE_FN))
                pos += len(kw)

            # --- References (regular) ---
            ref_strs = []
            for r in refs:
                if r.startswith("TG "):
                    ref_strs.append("\u05E0\u05F4\u05DE " + r[3:])  # נ״מ
                else:
                    ref_strs.append(r)
            ref_line = "; ".join(ref_strs) + ".\n"
            parts.append(ref_line)
            runs.append((pos, len(ref_line), FONT_BODY, FONT_SIZE_FN))
            pos += len(ref_line)

    return "".join(parts), runs


def measure_fn_height(fn_text, fn_runs, page_num):
    """Measure ACTUAL footnote height by placing in a real Scribus frame
    and growing until textOverflows() is False.

    Returns the exact height needed (including separator space), or 0.0
    if there are no footnotes.
    """
    if not fn_text or not fn_text.strip():
        return 0.0

    ml, _ = page_margins(page_num)
    x = ml
    w = TEXT_AREA_W

    # Start with a small height and grow until no overflow.
    # Use line-count as a rough starting point to avoid many iterations.
    line_count = max(fn_text.count('\n'), 1)
    col_lines  = math.ceil(line_count / FN_COLUMNS)
    h = col_lines * LINE_SPACING_FN + FOOTNOTE_SEP + 8

    # Minimum height
    h = max(h, LINE_SPACING_FN * 2 + FOOTNOTE_SEP)
    max_h = TEXT_AREA_H * 0.55

    for _ in range(30):  # safety cap
        y = PAGE_H - MARGIN_BOTTOM - h
        tname = _fn("fnmeasure")
        scribus.createText(x, y, w, h, tname)
        scribus.setColumns(FN_COLUMNS, tname)
        scribus.setColumnGap(COLUMN_GAP * 0.6, tname)
        set_rtl(tname)
        scribus.setFont(FONT_BODY, tname)
        scribus.setFontSize(FONT_SIZE_FN, tname)
        scribus.setLineSpacing(LINE_SPACING_FN, tname)
        scribus.setTextAlignment(scribus.ALIGN_RIGHT, tname)
        apply_fn_styles(tname, fn_text, fn_runs)

        overflows = scribus.textOverflows(tname)
        scribus.deleteObject(tname)

        if not overflows:
            break
        h += LINE_SPACING_FN * 1.5
        if h >= max_h:
            h = max_h
            break

    return h

def apply_fn_styles(fname, fn_text, fn_runs):
    """Insert footnote text into frame and apply all style runs."""
    scribus.insertText(fn_text, 0, fname)
    for (s, l, f, sz) in fn_runs:
        if s + l <= len(fn_text):
            scribus.selectText(s, l, fname)
            scribus.setFont(f, fname)
            scribus.setFontSize(sz, fname)

# ---------------------------------------------------------------------------
# 13.  RUNNING HEADER TEXT
# ---------------------------------------------------------------------------
def header_texts(book_eng, ch1, v1, ch2, v2):
    """Return (book_heb, verse_range_heb) for the running header."""
    bk = BOOK_HEB.get(book_eng, book_eng)
    if ch1 == ch2:
        ch = int_to_heb(ch1)
        if v1 == v2:
            vr = ch + ":" + int_to_heb(v1)
        else:
            vr = ch + ":" + int_to_heb(v1) + "\u2013" + int_to_heb(v2)
    else:
        vr = (int_to_heb(ch1) + ":" + int_to_heb(v1) +
              "\u2013" +
              int_to_heb(ch2) + ":" + int_to_heb(v2))
    return bk, vr

# ---------------------------------------------------------------------------
# 14.  FRONT MATTER
# ---------------------------------------------------------------------------
def generate_front_matter(fm_data):
    """Lay out front-matter pages (title, translator intro, witnesses,
    brief explanation, table of contents)."""

    for idx, fm in enumerate(fm_data):
        if idx > 0:
            scribus.newPage(-1)
        pg = scribus.pageCount()
        scribus.gotoPage(pg)

        ml, _ = page_margins(pg)
        x, y, w, h = ml, MARGIN_TOP, TEXT_AREA_W, TEXT_AREA_H
        header = fm.get("header", "")
        body   = fm.get("body", "")

        # ---- Title pages (0, 1): centered, large ----
        if idx <= 1:
            name = _fn("fm")
            scribus.createText(x, y + h * 0.2, w, h * 0.6, name)
            set_rtl(name)
            p = 0
            if header:
                ht = header + "\n\n"
                scribus.insertText(ht, p, name)
                scribus.selectText(p, len(header), name)
                scribus.setFont(FONT_BODY_BOLD, name)
                scribus.setFontSize(28.0, name)
                scribus.setTextAlignment(scribus.ALIGN_CENTER, name)
                p += len(ht)
            if body:
                scribus.insertText(body, p, name)
                scribus.selectText(p, len(body), name)
                scribus.setFont(FONT_BODY, name)
                scribus.setFontSize(16.0, name)
                scribus.setTextAlignment(scribus.ALIGN_CENTER, name)

        # ---- TOC (last item, idx 9) ----
        elif idx == 9:
            name = _fn("toc")
            scribus.createText(x, y, w, h, name)
            set_rtl(name)
            p = 0
            if header:
                ht = header + "\n\n"
                scribus.insertText(ht, p, name)
                scribus.selectText(p, len(header), name)
                scribus.setFont(FONT_BODY_BOLD, name)
                scribus.setFontSize(18.0, name)
                scribus.setTextAlignment(scribus.ALIGN_CENTER, name)
                p += len(ht)
            if body:
                scribus.insertText(body, p, name)
                scribus.selectText(p, len(body), name)
                scribus.setFont(FONT_BODY, name)
                scribus.setFontSize(14.0, name)
                scribus.setTextAlignment(scribus.ALIGN_RIGHT, name)

        # ---- Regular front-matter pages ----
        else:
            name = _fn("fm")
            scribus.createText(x, y, w, h, name)
            set_rtl(name)
            p = 0
            if header:
                ht = header + "\n\n"
                scribus.insertText(ht, p, name)
                scribus.selectText(p, len(header), name)
                scribus.setFont(FONT_BODY_BOLD, name)
                scribus.setFontSize(18.0, name)
                scribus.setTextAlignment(scribus.ALIGN_CENTER, name)
                p += len(ht)
            if body:
                scribus.insertText(body, p, name)
                scribus.selectText(p, len(body), name)
                scribus.setFont(FONT_BODY, name)
                scribus.setFontSize(FONT_SIZE_BODY, name)
                scribus.setLineSpacing(LINE_SPACING_BODY, name)
                scribus.setTextAlignment(scribus.ALIGN_RIGHT, name)

    print(f"  Front matter: {len(fm_data)} pages created.")

# ---------------------------------------------------------------------------
# 15.  BOOK TITLE PAGE
# ---------------------------------------------------------------------------
def create_book_title_page(book_eng):
    scribus.newPage(-1)
    pg = scribus.pageCount()
    scribus.gotoPage(pg)
    ml, _ = page_margins(pg)

    title = BOOK_HEB_FULL.get(book_eng,
                               BOOK_HEB.get(book_eng, book_eng))
    name = _fn("bktitle")
    bx = ml
    by = MARGIN_TOP + TEXT_AREA_H * 0.25
    bw = TEXT_AREA_W
    bh = TEXT_AREA_H * 0.3
    scribus.createText(bx, by, bw, bh, name)
    set_rtl(name)
    scribus.insertText(title, 0, name)
    scribus.selectText(0, len(title), name)
    scribus.setFont(FONT_BODY_BOLD, name)
    scribus.setFontSize(24.0, name)
    scribus.setTextAlignment(scribus.ALIGN_CENTER, name)
    scribus.setLineSpacing(30.0, name)

# ---------------------------------------------------------------------------
# 16.  CORE TYPESETTING ENGINE  (body-driven)
# ---------------------------------------------------------------------------
def _fill_body(bname, verses, crossrefs, vi_start, cur_book):
    """Insert verses into body frame until it overflows or we run out.

    Returns (pv, vi_next)
      pv = [(vobj, xrefs), ...]  — verses that fit on this page
      vi_next = next verse index to process
    """
    total = len(verses)
    vi    = vi_start
    ipos  = 0
    pv    = []
    first_on_page = True

    while vi < total:
        v  = verses[vi]
        bk = v["book"]
        ch = v["chapter"]
        vn = v["verse"]

        # Stop at book boundary
        if bk != cur_book:
            break

        # Chapter heading before verse 1
        heading_start = ipos
        if vn == 1:
            if not first_on_page:
                ipos = insert_chapter_heading(bname, bk, ch, ipos)
                if scribus.textOverflows(bname):
                    scribus.selectText(heading_start,
                                       ipos - heading_start, bname)
                    scribus.deleteText(bname)
                    ipos = heading_start
                    break
            else:
                ipos = insert_chapter_heading(bname, bk, ch, ipos)

        # Cross-references for this verse
        rk = f"{bk}|{ch}|{vn}"
        xr = crossrefs.get(rk, [])

        # Insert verse
        saved = ipos
        ipos = insert_verse_text(bname, v, xr, ipos)

        if scribus.textOverflows(bname):
            if first_on_page:
                # Must keep at least one verse
                pv.append((v, xr))
                vi += 1
                break
            else:
                # Undo and stop — revert to before the heading if one was added
                undo_from = heading_start if (vn == 1) else saved
                scribus.selectText(undo_from, ipos - undo_from, bname)
                scribus.deleteText(bname)
                ipos = undo_from
                break

        pv.append((v, xr))
        vi += 1
        first_on_page = False

    return pv, vi


def typeset_scripture(verses, crossrefs):
    """Flow every verse onto pages.  Body text is the SINGLE SOURCE
    OF TRUTH: it drives the running header AND the footnotes.

    Per-page algorithm (iterative convergence):
      1. Guess footnote height (start at 0).
      2. Create body frame (full height minus fn_h), fill with verses.
      3. Build footnotes for those verses; measure ACTUAL fn height.
      4. If actual fn height differs from guess, update guess,
         delete frame, and go back to step 2.
      5. Once converged, place final footnote frame, header, and rule.
    """
    total    = len(verses)
    vi       = 0          # global verse index
    cur_book = None
    pages    = 0
    report   = 200

    while vi < total:
        v    = verses[vi]
        book = v["book"]

        # ---------- new book? ----------
        if book != cur_book:
            cur_book = book
            print(f"\n  [{vi}/{total}] Book: {book}  "
                  f"({BOOK_HEB.get(book, book)})")
            create_book_title_page(book)

        # ---------- new content page ----------
        scribus.newPage(-1)
        pages += 1
        pg = scribus.pageCount()
        scribus.gotoPage(pg)

        # === ITERATIVE CONVERGENCE LOOP ===
        fn_h_guess = 0.0          # start assuming no footnotes
        final_pv   = None
        final_bname = None
        final_fn_h  = 0.0
        final_fn_text = ""
        final_fn_runs = []
        converged  = False

        for iteration in range(8):  # safety cap
            # --- Step 2: create body frame and fill ---
            bname = make_body_frame(pg, fn_h_guess)
            pv, vi_next = _fill_body(bname, verses, crossrefs,
                                      vi, cur_book)

            if not pv:
                scribus.deleteObject(bname)
                break

            # --- Step 3: build footnotes, measure actual height ---
            fn_text, fn_runs = build_footnote_text(pv)
            actual_fn_h = measure_fn_height(fn_text, fn_runs, pg)

            # --- Step 4: check convergence ---
            # Converged if the actual footnote height matches our guess
            # (within a small tolerance to prevent infinite oscillation).
            tolerance = LINE_SPACING_FN * 0.5
            if abs(actual_fn_h - fn_h_guess) <= tolerance:
                final_pv      = pv
                final_bname   = bname
                final_fn_h    = actual_fn_h
                final_fn_text = fn_text
                final_fn_runs = fn_runs
                vi = vi_next
                converged = True
                break

            # Not converged — clean up and retry with better guess.
            scribus.deleteObject(bname)

            # Use the actual measured height as next guess.
            # To avoid oscillation, if this is iteration 2+ and we're
            # bouncing, use the larger of the two values (conservative).
            if iteration >= 2:
                fn_h_guess = max(fn_h_guess, actual_fn_h)
            else:
                fn_h_guess = actual_fn_h

        # Fallback if we didn't converge (shouldn't happen normally)
        if not converged:
            if final_pv is None:
                # Create body with whatever we have
                bname = make_body_frame(pg, fn_h_guess)
                pv, vi_next = _fill_body(bname, verses, crossrefs,
                                          vi, cur_book)
                if not pv:
                    scribus.deleteObject(bname)
                    if vi < total:
                        vi += 1
                    continue
                fn_text, fn_runs = build_footnote_text(pv)
                actual_fn_h = measure_fn_height(fn_text, fn_runs, pg)

                final_pv      = pv
                final_bname   = bname
                final_fn_h    = actual_fn_h
                final_fn_text = fn_text
                final_fn_runs = fn_runs
                vi = vi_next

        pv    = final_pv
        bname = final_bname
        fn_h  = final_fn_h

        # Safety: skip empty pages
        if not pv:
            if vi < total:
                vi += 1
            continue

        # === FINAL: resize body to exact footnote height ===
        if fn_h > 0:
            bx, by, bw, bh = body_rect(pg, fn_h)
            scribus.sizeObject(bw, bh, bname)
            scribus.moveObjectAbs(bx, by, bname)

        # === PLACE FOOTNOTES ===
        if final_fn_text.strip():
            fname = make_fn_frame(pg, fn_h)
            apply_fn_styles(fname, final_fn_text, final_fn_runs)

            # Final safety: if still overflowing, grow and adjust body
            retries = 0
            while scribus.textOverflows(fname) and retries < 6:
                retries += 1
                scribus.deleteObject(fname)
                fn_h += LINE_SPACING_FN
                if fn_h > TEXT_AREA_H * 0.55:
                    fn_h = TEXT_AREA_H * 0.55
                fname = make_fn_frame(pg, fn_h)
                apply_fn_styles(fname, final_fn_text, final_fn_runs)
                # Also shrink body
                bx, by, bw, bh = body_rect(pg, fn_h)
                scribus.sizeObject(bw, bh, bname)
                scribus.moveObjectAbs(bx, by, bname)
                if fn_h >= TEXT_AREA_H * 0.55:
                    break

            # Separator rule
            make_fn_rule(pg, fn_h)

        # === RUNNING HEADER (driven by body content) ===
        if pv:
            f_v = pv[0][0]
            l_v = pv[-1][0]
            bk_heb, vr_heb = header_texts(
                f_v["book"],
                f_v["chapter"], f_v["verse"],
                l_v["chapter"], l_v["verse"])
            make_header(pg, bk_heb, vr_heb)

        if vi % report < 20 and vi > 0:
            print(f"    {vi}/{total}  ({100*vi//total}%)")

    print(f"\n  Scripture typesetting done. {pages} content pages.")
    return pages

# ---------------------------------------------------------------------------
# 17.  MAIN
# ---------------------------------------------------------------------------
def main():
    scribus.statusMessage("Hebrew Book of Mormon \u2014 loading data ...")
    scribus.progressTotal(100)

    try:
        print("=" * 60)
        print("  Hebrew Book of Mormon \u2014 Scribus Typesetter")
        print("=" * 60)

        # ---- Load data ----
        print("\nLoading data files ...")
        verses       = load_json("official_verses.json")
        crossrefs    = load_json("crossrefs.json")
        front_matter = load_json("front_matter.json")
        global CHAPTER_HEADINGS
        CHAPTER_HEADINGS = load_chapter_headings()
        print(f"  {len(verses)} verses, {len(crossrefs)} cross-ref entries, "
              f"{len(CHAPTER_HEADINGS)} chapter headings, "
              f"{len(front_matter)} front-matter pages.")
        scribus.progressSet(5)

        # ---- Existing document? ----
        if scribus.haveDoc():
            reply = scribus.valueDialog(
                "Hebrew BOM",
                "A document is already open.\n"
                "Type YES to close it and create a new one,\n"
                "or anything else to abort.",
                "YES")
            if reply.strip().upper() != "YES":
                print("Aborted.")
                return
            scribus.closeDoc()

        # ---- Create document ----
        print("\nCreating 6\u00d79 document ...")
        scribus.newDocument(
            (PAGE_W, PAGE_H),
            (MARGIN_TOP, MARGIN_BOTTOM, MARGIN_INSIDE, MARGIN_OUTSIDE),
            scribus.PORTRAIT, 1, scribus.UNIT_POINTS,
            scribus.PAGE_1, 0, 1)
        scribus.setUnit(scribus.UNIT_POINTS)
        scribus.progressSet(8)

        # ---- Detect fonts ----
        detect_fonts()
        scribus.progressSet(10)

        # ---- Front matter ----
        print("\nGenerating front matter ...")
        generate_front_matter(front_matter)
        scribus.progressSet(15)

        # ---- Scripture body ----
        print("\nTypesetting scripture text ...")
        typeset_scripture(verses, crossrefs)
        scribus.progressSet(95)

        # ---- Save SLA ----
        save_path = os.path.join(DATA_DIR, "Hebrew_BOM_Scribus.sla")
        try:
            scribus.saveDocAs(save_path)
            print(f"\nSaved SLA: {save_path}")
        except Exception as e:
            print(f"Auto-save failed ({e}); please save manually.")
            save_path = "(not saved)"

        # ---- Export PDF ----
        pdf_path = "C:/Users/chris/Desktop/Hebrew_BOM_Scripture.pdf"
        print(f"\nExporting PDF to {pdf_path} ...")
        try:
            pdf = scribus.PDFfile()
            pdf.file   = pdf_path
            pdf.pages  = list(range(1, scribus.pageCount() + 1))
            pdf.quality = 0        # max quality
            pdf.fontEmbedding = 0  # embed all fonts
            pdf.version = 14       # PDF 1.4
            pdf.resolution = 300
            pdf.embedPDF = True
            pdf.save()
            print(f"  PDF exported: {pdf_path}")
        except Exception as e:
            print(f"  PDF export failed ({e}); export manually via "
                  f"File > Export > Save as PDF.")

        scribus.progressSet(100)
        scribus.progressReset()

        total_pg = scribus.pageCount()
        scribus.statusMessage("Hebrew BOM \u2014 complete!")
        scribus.messageBox(
            "Hebrew BOM",
            f"Typesetting complete!\n\n"
            f"Pages: {total_pg}\n"
            f"Verses: {len(verses)}\n\n"
            f"SLA: {save_path}\n"
            f"PDF: {pdf_path}",
            scribus.ICON_INFORMATION)

    except Exception as exc:
        tb = traceback.format_exc()
        print(f"\nFATAL: {exc}\n{tb}")
        try:
            scribus.messageBox(
                "Hebrew BOM \u2014 Error",
                f"Error:\n{exc}\n\nSee console for traceback.",
                scribus.ICON_CRITICAL)
        except Exception:
            pass
    finally:
        scribus.progressReset()
        scribus.statusMessage("")

# ---- Kick it off ----
CHAPTER_HEADINGS = {}   # will be populated in main()
main()
