"""
Extract all maqqef-joined Hebrew words from the Word document.
Compare with verse JS files to find where maqqef was stripped.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import re
import json
from docx import Document

docx_path = r"C:\Users\chris\Desktop\Hebrew BOM\Hebrew_BOM_20_February_2026.docx"

# Hebrew Unicode ranges
HEB_RE = re.compile(r'[\u0590-\u05FF\uFB1D-\uFB4F]+')
MAQQEF = '\u05BE'  # ־

print("Reading Word document...")
doc = Document(docx_path)

# Collect all maqqef-joined tokens
maqqef_tokens = {}
total_maqqef = 0

for para in doc.paragraphs:
    text = para.text
    # Find Hebrew tokens containing maqqef
    # Split by spaces, then check each token
    for token in text.split():
        if MAQQEF in token:
            # Clean: strip non-Hebrew chars from edges
            cleaned = token.strip('.,;:!? \t\n\r()[]{}')
            if HEB_RE.search(cleaned) and MAQQEF in cleaned:
                total_maqqef += 1
                if cleaned not in maqqef_tokens:
                    maqqef_tokens[cleaned] = 0
                maqqef_tokens[cleaned] += 1

print(f"\nTotal maqqef tokens found in docx: {total_maqqef}")
print(f"Unique maqqef-joined forms: {len(maqqef_tokens)}")

# Sort by frequency
sorted_tokens = sorted(maqqef_tokens.items(), key=lambda x: -x[1])

print("\nTop 50 maqqef-joined forms:")
for token, count in sorted_tokens[:50]:
    parts = token.split(MAQQEF)
    print(f"  {token}  ({' + '.join(parts)})  x{count}")

# Save full list to JSON
output = {
    "total_maqqef_tokens": total_maqqef,
    "unique_forms": len(maqqef_tokens),
    "forms": {k: v for k, v in sorted_tokens}
}

out_path = r"C:\Users\chris\Desktop\Hebrew BOM\_maqqef_forms.json"
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\nFull list saved to {out_path}")
