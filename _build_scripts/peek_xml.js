const fs = require('fs');
const xml = fs.readFileSync('C:/Users/chris/AppData/Local/Temp/dual_bom_extracted/word/document.xml', 'utf8');

// Find table structures
const hasTables = xml.includes('<w:tbl');
console.log('Has tables:', hasTables);
console.log('Table count:', (xml.match(/<w:tbl[ >]/g) || []).length);

// Find how paragraphs with RTL text look
const rtlMatch = xml.match(/<w:p [^>]*>[\s\S]{0,2000}?<w:rtl\/>[\s\S]{0,2000}?<\/w:p>/g);
console.log('RTL paragraphs (sample):', rtlMatch ? rtlMatch.length : 0);

// Extract a small section around "Nephi" to see verse structure
const nephiIdx = xml.indexOf('Nephi');
if (nephiIdx > -1) {
  // Find the enclosing paragraph
  let start = xml.lastIndexOf('<w:p ', nephiIdx);
  if (start === -1) start = xml.lastIndexOf('<w:p>', nephiIdx);
  let end = xml.indexOf('</w:p>', nephiIdx) + 6;
  console.log('\n=== Paragraph containing "Nephi" ===');
  const para = xml.substring(start, Math.min(end, start + 2000));
  // Pretty print by adding newlines before tags
  console.log(para.replace(/<w:/g, '\n<w:').substring(0, 2000));
}

// Find a verse number pattern
const verseMatch = xml.match(/<w:t[^>]*>\s*\d+\s*<\/w:t>/g);
console.log('\n\nVerse number elements (first 20):');
if (verseMatch) console.log(verseMatch.slice(0, 20).join('\n'));

// Check if content is in tables (columns) or sequential paragraphs
const tblIdx = xml.indexOf('<w:tbl');
if (tblIdx > -1) {
  console.log('\n=== First table structure (first 3000 chars) ===');
  const tblContent = xml.substring(tblIdx, tblIdx + 3000);
  console.log(tblContent.replace(/<w:/g, '\n<w:').substring(0, 3000));
}
