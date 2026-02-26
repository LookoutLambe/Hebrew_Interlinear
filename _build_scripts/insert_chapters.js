// Insert Helaman chapters 3 and 4 data into BOM.html
const fs = require('fs');

const bomPath = 'C:\\Users\\chris\\Desktop\\Hebrew BOM\\BOM.html';
const ch3Data = fs.readFileSync('C:\\Users\\chris\\Desktop\\Hebrew BOM\\he_ch3_data.js', 'utf8');
const ch4Data = fs.readFileSync('C:\\Users\\chris\\Desktop\\Hebrew BOM\\he_ch4_data.js', 'utf8');

let bom = fs.readFileSync(bomPath, 'utf8');

// Build the insertion block
const insertion = `

// HELAMAN – Chapter 3
// ═══════════════════════════════════════
${ch3Data}renderVerseSet(he_ch3Verses, 'he-ch3-verses');

// HELAMAN – Chapter 4
// ═══════════════════════════════════════
${ch4Data}renderVerseSet(he_ch4Verses, 'he-ch4-verses');
`;

// Insert after the he_ch2 render call, before the Mormon section
const marker = "renderVerseSet(he_ch2Verses, 'he-ch2-verses');";
const idx = bom.indexOf(marker);
if (idx === -1) {
  console.error('Could not find insertion point!');
  process.exit(1);
}
const insertPos = idx + marker.length;
bom = bom.slice(0, insertPos) + insertion + bom.slice(insertPos);

fs.writeFileSync(bomPath, bom, 'utf8');
console.log('Successfully inserted Helaman 3 and 4 data into BOM.html');
console.log(`New file size: ${(bom.length / 1024 / 1024).toFixed(2)} MB`);
