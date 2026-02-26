// Extract Hebrew-English glosses from the Dual BOM DOCX file
// DOCX is a ZIP file - use built-in Node.js to extract
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Unzip the DOCX to a temp directory
const tmpDir = path.join(__dirname, '_docx_temp');
try { fs.rmSync(tmpDir, { recursive: true }); } catch(e) {}
fs.mkdirSync(tmpDir, { recursive: true });

// Use PowerShell to extract the ZIP
execSync(`powershell -command "Expand-Archive -Path '${path.join(__dirname, '7x10_Dual_BOM_KDP_v3.docx')}' -DestinationPath '${tmpDir}' -Force"`, { maxBuffer: 50*1024*1024 });

console.log('Extracted DOCX');

// Read the main document XML
const docPath = path.join(tmpDir, 'word', 'document.xml');
const docXml = fs.readFileSync(docPath, 'utf8');
console.log(`Document XML size: ${(docXml.length/1024/1024).toFixed(1)}MB`);

// Check for ruby annotations
const rubyCount = (docXml.match(/<w:ruby>/g) || []).length;
console.log(`Ruby annotations: ${rubyCount}`);

// Extract ruby pairs
const rubyRegex = /<w:ruby>([\s\S]*?)<\/w:ruby>/g;
const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
const glossMap = {};
let rubyPairs = 0;
let rm;

while ((rm = rubyRegex.exec(docXml)) !== null) {
  const rubyContent = rm[1];
  const rtMatch = rubyContent.match(/<w:rt>([\s\S]*?)<\/w:rt>/);
  const baseMatch = rubyContent.match(/<w:rubyBase>([\s\S]*?)<\/w:rubyBase>/);

  if (rtMatch && baseMatch) {
    const rtTexts = [];
    const baseTexts = [];
    let t;

    tRegex.lastIndex = 0;
    while ((t = tRegex.exec(rtMatch[1])) !== null) rtTexts.push(t[1]);
    tRegex.lastIndex = 0;
    while ((t = tRegex.exec(baseMatch[1])) !== null) baseTexts.push(t[1]);

    const gloss = rtTexts.join('').trim();
    const hebrew = baseTexts.join('').trim();

    if (gloss && hebrew && /[\u0590-\u05FF]/.test(hebrew)) {
      const stripped = hebrew.replace(/[\u0591-\u05C7]/g, '');
      if (!glossMap[stripped]) {
        glossMap[stripped] = gloss;
        rubyPairs++;
      }
    }
  }
}

console.log(`Extracted ${rubyPairs} unique ruby gloss pairs`);

// Also look at paragraphs for interlinear structure
// The dual BOM likely has English on one line and Hebrew below (or vice versa)
const paraRegex = /<w:p[ >]([\s\S]*?)<\/w:p>/g;
let pm;
const paragraphs = [];
while ((pm = paraRegex.exec(docXml)) !== null) {
  const texts = [];
  tRegex.lastIndex = 0;
  let t;
  while ((t = tRegex.exec(pm[1])) !== null) texts.push(t[1]);
  const text = texts.join('').trim();
  if (text) paragraphs.push(text);
}

console.log(`Total paragraphs: ${paragraphs.length}`);

// Show sample paragraphs that contain Hebrew
const hebrewParas = paragraphs.filter(p => /[\u0590-\u05FF]/.test(p));
console.log(`Paragraphs with Hebrew: ${hebrewParas.length}`);
console.log('\nSample Hebrew paragraphs:');
hebrewParas.slice(0, 10).forEach((p, i) => console.log(`  ${i}: ${p.substring(0, 200)}`));

// Save the gloss map
fs.writeFileSync('dual_bom_glosses.json', JSON.stringify(glossMap, null, 2));
console.log(`\nSaved ${Object.keys(glossMap).length} glosses to dual_bom_glosses.json`);

// Show sample glosses
console.log('\nSample glosses:');
Object.entries(glossMap).slice(0, 30).forEach(([h, e]) => console.log(`  ${h} -> ${e}`));

// Cleanup
try { fs.rmSync(tmpDir, { recursive: true }); } catch(e) {}
