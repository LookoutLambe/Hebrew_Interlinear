const fs = require('fs');
const xml = fs.readFileSync('C:/Users/chris/AppData/Local/Temp/dual_bom_extracted/word/document.xml', 'utf8');

// Extract ALL table rows and look at short text rows (headings)
const trRegex = /<w:tr[\s>][\s\S]*?<\/w:tr>/g;
let trMatch;
let rowIdx = 0;
const headings = [];

while ((trMatch = trRegex.exec(xml)) !== null) {
  const row = trMatch[0];
  const cells = [];
  const tcRegex = /<w:tc[\s>][\s\S]*?<\/w:tc>/g;
  let tcMatch;
  while ((tcMatch = tcRegex.exec(row)) !== null) {
    const cell = tcMatch[0];
    const texts = [];
    const tRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let tMatch;
    while ((tMatch = tRegex.exec(cell)) !== null) {
      if (tMatch[1].trim()) texts.push(tMatch[1].trim());
    }
    cells.push(texts.join(' '));
  }

  // Show rows with short content (likely headings)
  if (cells.length >= 2) {
    const heb = cells[0];
    const eng = cells[1];
    if ((eng.length < 80 && eng.length > 0) || (heb.length < 50 && heb.length > 0 && !eng)) {
      headings.push({ row: rowIdx, heb, eng });
    }
  }
  rowIdx++;
}

console.log(`Total rows: ${rowIdx}`);
console.log(`\n=== Short rows (likely headings) — first 80 ===`);
headings.slice(0, 80).forEach(h => {
  console.log(`Row ${h.row}: HEB="${h.heb}" | ENG="${h.eng}"`);
});
