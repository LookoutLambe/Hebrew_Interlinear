// Extract Hebrew-English glosses from the Dual BOM DOCX file
// to fix remaining bad transliterations
const fs = require('fs');
const { execSync } = require('child_process');

// First, let's extract text from the DOCX to find Hebrew-English pairs
// The dual BOM has both English and Hebrew text side by side

// Use mammoth or just unzip and parse the XML
const AdmZip = require('adm-zip');

try {
  const zip = new AdmZip('7x10_Dual_BOM_KDP_v3.docx');
  const docXml = zip.readAsText('word/document.xml');

  // Find all text runs - Hebrew words and their English glosses
  // In a dual interlinear, the pattern is typically:
  // Hebrew word followed by English gloss in brackets or parentheses

  // Extract all text content
  const textRuns = [];
  const runRegex = /<w:r[^>]*>([\s\S]*?)<\/w:r>/g;
  let m;
  while ((m = runRegex.exec(docXml)) !== null) {
    const textMatch = m[1].match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatch) {
      for (const t of textMatch) {
        const text = t.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
        if (text.trim()) textRuns.push(text.trim());
      }
    }
  }

  console.log(`Extracted ${textRuns.length} text runs from DOCX`);

  // Look for patterns: Hebrew text followed by English text
  // Or Ruby annotations (interlinear glosses)

  // Check for ruby annotations in the XML
  const rubyCount = (docXml.match(/<w:ruby>/g) || []).length;
  console.log(`Ruby annotations found: ${rubyCount}`);

  // Extract ruby pairs (base = Hebrew, text = English gloss)
  const rubyRegex = /<w:ruby>([\s\S]*?)<\/w:ruby>/g;
  const glossPairs = [];
  let rm;
  while ((rm = rubyRegex.exec(docXml)) !== null) {
    const rubyContent = rm[1];
    // Ruby text (gloss) is in w:rubyBase and w:rt
    const rtMatch = rubyContent.match(/<w:rt>([\s\S]*?)<\/w:rt>/);
    const baseMatch = rubyContent.match(/<w:rubyBase>([\s\S]*?)<\/w:rubyBase>/);

    if (rtMatch && baseMatch) {
      const rtTexts = [];
      const baseTexts = [];

      const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let t;
      while ((t = tRegex.exec(rtMatch[1])) !== null) rtTexts.push(t[1]);
      tRegex.lastIndex = 0;
      while ((t = tRegex.exec(baseMatch[1])) !== null) baseTexts.push(t[1]);

      const rtText = rtTexts.join('');
      const baseText = baseTexts.join('');

      if (rtText && baseText) {
        glossPairs.push({ hebrew: baseText, gloss: rtText });
      }
    }
  }

  console.log(`Extracted ${glossPairs.length} ruby gloss pairs`);
  if (glossPairs.length > 0) {
    console.log('Sample pairs:');
    glossPairs.slice(0, 20).forEach(p => console.log(`  ${p.hebrew} -> ${p.gloss}`));
  }

  // Also look for inline annotations like [Hebrew] (English) or Hebrew = English
  // Search for Hebrew characters followed by English text
  const hebrewEnglishPairs = [];
  for (let i = 0; i < textRuns.length - 1; i++) {
    const current = textRuns[i];
    const next = textRuns[i + 1];
    // If current has Hebrew and next has English
    if (/[\u0590-\u05FF]/.test(current) && /^[a-zA-Z]/.test(next)) {
      hebrewEnglishPairs.push({ hebrew: current, english: next });
    }
  }

  console.log(`\nFound ${hebrewEnglishPairs.length} Hebrew-English adjacent pairs`);
  if (hebrewEnglishPairs.length > 0) {
    console.log('Samples:');
    hebrewEnglishPairs.slice(0, 20).forEach(p => console.log(`  ${p.hebrew} -> ${p.english}`));
  }

  // Save all extracted data
  const output = { glossPairs, hebrewEnglishPairs: hebrewEnglishPairs.slice(0, 1000) };
  fs.writeFileSync('dual_bom_glosses.json', JSON.stringify(output, null, 2));
  console.log('\nSaved to dual_bom_glosses.json');

} catch(e) {
  console.error('Error:', e.message);
  // Try alternative: just extract all text
  console.log('\nTrying simpler extraction...');
  try {
    const zip = new AdmZip('7x10_Dual_BOM_KDP_v3.docx');
    const entries = zip.getEntries();
    console.log('DOCX entries:');
    entries.forEach(e => {
      if (e.entryName.startsWith('word/')) console.log('  ' + e.entryName);
    });
  } catch(e2) {
    console.error('Also failed:', e2.message);
  }
}
