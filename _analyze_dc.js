const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Read file as buffer first, then pass to AdmZip
const filePath = path.join('C:', 'Users', 'chris', 'Desktop', 'Hebrew BOM', 'Doctrine and Covenants - Hebrew 2026.docx');
const buffer = fs.readFileSync(filePath);
const zip = new AdmZip(buffer);
const xml = zip.readAsText('word/document.xml');

// Parse paragraphs
const paraRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
const paragraphs = xml.match(paraRegex) || [];

console.log('Total paragraphs:', paragraphs.length);

// Extract text from each paragraph, noting bold runs
function extractParagraph(pXml) {
  const runs = pXml.match(/<w:r[\s>][\s\S]*?<\/w:r>/g) || [];
  let text = '';
  let hasBold = false;
  for (const run of runs) {
    const boldMatch = /<w:b[ />]/.test(run) || /<w:b\/>/.test(run);
    const textMatch = run.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatch) {
      const t = textMatch.map(m => m.replace(/<[^>]+>/g, '')).join('');
      text += t;
      if (boldMatch && t.trim()) hasBold = true;
    }
  }
  return { text: text.trim(), hasBold };
}

// Show first 100 paragraphs to understand structure
console.log('\n=== FIRST 100 PARAGRAPHS ===');
for (let i = 0; i < Math.min(100, paragraphs.length); i++) {
  const p = extractParagraph(paragraphs[i]);
  if (p.text) {
    console.log('[' + i + '] ' + (p.hasBold ? 'BOLD ' : '') + p.text.substring(0, 120));
  }
}

// Count sections/chapters by looking for patterns
console.log('\n=== SECTION HEADERS (bold paragraphs with "section" or numbers) ===');
let sectionCount = 0;
for (let i = 0; i < paragraphs.length; i++) {
  const p = extractParagraph(paragraphs[i]);
  if (p.hasBold && p.text && (p.text.match(/^(סעיף|Section|קלח|DC|D&C|\d{1,3}\s)/i) || p.text.match(/^[א-ת]{1,3}\s/) || p.text.length < 30)) {
    console.log('[' + i + '] ' + p.text.substring(0, 120));
    sectionCount++;
  }
}
console.log('Potential section headers:', sectionCount);

// Show last 20 paragraphs to see the ending
console.log('\n=== LAST 20 PARAGRAPHS ===');
for (let i = Math.max(0, paragraphs.length - 20); i < paragraphs.length; i++) {
  const p = extractParagraph(paragraphs[i]);
  if (p.text) {
    console.log('[' + i + '] ' + (p.hasBold ? 'BOLD ' : '') + p.text.substring(0, 120));
  }
}

// Count total non-empty paragraphs
let nonEmpty = 0;
let verseCount = 0;
for (let i = 0; i < paragraphs.length; i++) {
  const p = extractParagraph(paragraphs[i]);
  if (p.text) {
    nonEmpty++;
    if (/^\d+\s/.test(p.text)) verseCount++;
  }
}
console.log('\nNon-empty paragraphs:', nonEmpty);
console.log('Lines starting with a number (potential verses):', verseCount);
