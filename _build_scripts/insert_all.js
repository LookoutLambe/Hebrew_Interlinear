// Insert all generated chapter data into BOM.html
const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\chris\\Desktop\\Hebrew BOM';
let bom = fs.readFileSync(path.join(baseDir, 'BOM.html'), 'utf8');

// Read generated data files
const alData = fs.readFileSync(path.join(baseDir, 'al_data.js'), 'utf8');
const heData = fs.readFileSync(path.join(baseDir, 'he_data.js'), 'utf8');
const tnData = fs.readFileSync(path.join(baseDir, '3n_data.js'), 'utf8');
const etData = fs.readFileSync(path.join(baseDir, 'et_data.js'), 'utf8');

// Each data file contains const declarations + renderVerseSet calls
// We need to split them: constants go before render calls

function splitDataAndRenders(data) {
  const lines = data.split('\n');
  const constLines = [];
  const renderLines = [];
  for (const line of lines) {
    if (line.startsWith('renderVerseSet(')) {
      renderLines.push(line);
    } else {
      constLines.push(line);
    }
  }
  return {
    constants: constLines.join('\n'),
    renders: renderLines.join('\n')
  };
}

// 1. INSERT ALMA DATA
// Goes after Mosiah and before Helaman
// Find the insertion point: after the last Mosiah render call, before Helaman section
const alParts = splitDataAndRenders(alData);
const alInsert = `\n${alParts.constants}\n${alParts.renders}\n`;

// Look for the marker just before Helaman chapter 1 data
const helamanStartMarker = "const he_ch1Verses";
const helamanIdx = bom.indexOf(helamanStartMarker);
if (helamanIdx === -1) {
  console.error('Could not find Helaman ch1 data marker!');
  process.exit(1);
}
// Find the line before it (should be a comment or blank line)
const beforeHelaman = bom.lastIndexOf('\n', helamanIdx - 1);
bom = bom.slice(0, beforeHelaman) + alInsert + bom.slice(beforeHelaman);
console.log('Inserted Alma data (63 chapters)');

// 2. INSERT HELAMAN 5-16 DATA
// Goes after Helaman ch4 render call, before Mormon section
const heParts = splitDataAndRenders(heData);
const heInsert = `\n${heParts.constants}\n${heParts.renders}\n`;

const mormonMarker = "// MORMON";
const mormonIdx = bom.indexOf(mormonMarker);
if (mormonIdx === -1) {
  console.error('Could not find Mormon section marker!');
  process.exit(1);
}
const beforeMormon = bom.lastIndexOf('\n', mormonIdx - 1);
bom = bom.slice(0, beforeMormon) + heInsert + bom.slice(beforeMormon);
console.log('Inserted Helaman 5-16 data (12 chapters)');

// 3. INSERT 3 NEPHI DATA
// Goes after 4 Nephi data, but we need to find right spot
// 3 Nephi should go between Helaman (now includes 5-16) and 4 Nephi
// Actually: book order is ... Helaman, 3 Nephi, 4 Nephi, Mormon, Ether, Moroni
// The existing BOM.html has: Helaman (1-2) → Mormon → Moroni
// We need 3 Nephi after Helaman, before 4 Nephi
// But 4 Nephi data uses fn_ch1Verses

// Find 4 Nephi data
const fourNephiMarker = "const fn_ch1Verses";
let fnIdx = bom.indexOf(fourNephiMarker);
if (fnIdx === -1) {
  // Try alternative: look for 4 Nephi comment
  const fnComment = "4 NEPHI";
  fnIdx = bom.indexOf(fnComment);
}

// Actually the book order in the JS might not match canonical order
// Let me find where Mormon data starts and insert 3 Nephi before it
const tnParts = splitDataAndRenders(tnData);
const tnInsert = `\n${tnParts.constants}\n${tnParts.renders}\n`;

// Insert 3 Nephi before the Mormon section (which we already located)
// Since we already inserted Helaman data before Mormon, find Mormon marker again
const mormonMarker2 = "// MORMON";
const mormonIdx2 = bom.indexOf(mormonMarker2);
const beforeMormon2 = bom.lastIndexOf('\n', mormonIdx2 - 1);
bom = bom.slice(0, beforeMormon2) + tnInsert + bom.slice(beforeMormon2);
console.log('Inserted 3 Nephi data (30 chapters)');

// 4. INSERT ETHER DATA
// Goes after Mormon, before Moroni
// Find Moroni section
const etParts = splitDataAndRenders(etData);
const etInsert = `\n${etParts.constants}\n${etParts.renders}\n`;

// Find the Moroni data section
const moroniMarker = "const mr_ch1Verses";
let mrIdx = bom.indexOf(moroniMarker);
if (mrIdx === -1) {
  // Try MORONI comment
  const mrComment = "// MORONI";
  mrIdx = bom.indexOf(mrComment);
}
if (mrIdx === -1) {
  console.error('Could not find Moroni section!');
  // Try to find any Moroni reference
  const mrAlt = bom.indexOf("mr_ch1Verses");
  console.log('  Found mr_ch1Verses at:', mrAlt);
} else {
  const beforeMoroni = bom.lastIndexOf('\n', mrIdx - 1);
  bom = bom.slice(0, beforeMoroni) + etInsert + bom.slice(beforeMoroni);
  console.log('Inserted Ether data (14 chapters)');
}

// Write the updated BOM.html
fs.writeFileSync(path.join(baseDir, 'BOM.html'), bom, 'utf8');
const sizeMB = (Buffer.byteLength(bom, 'utf8') / 1024 / 1024).toFixed(2);
console.log(`\nBOM.html updated successfully!`);
console.log(`New file size: ${sizeMB} MB`);
console.log(`Total lines: ${bom.split('\n').length}`);
