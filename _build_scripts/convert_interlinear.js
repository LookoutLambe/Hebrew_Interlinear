// Convert standalone interlinear HTML files to BOM.html JavaScript array format
const fs = require('fs');

function convertFile(inputPath, varName) {
  const html = fs.readFileSync(inputPath, 'utf8');

  const verses = [];
  // Match each verse-block
  const verseBlockRegex = /<div class="verse-block">([\s\S]*?)<\/div>\s*(?=<div class="verse-block">|<\/body>)/g;
  let blockMatch;

  while ((blockMatch = verseBlockRegex.exec(html)) !== null) {
    const block = blockMatch[1];

    // Extract verse number (Hebrew numeral)
    const numMatch = block.match(/<span class="verse-num">([^<]+)/);
    const verseNum = numMatch ? numMatch[1].trim() : '?';

    // Extract word pairs
    const words = [];
    const wordPairRegex = /<span class="word-pair"><span class="hw">([^<]+)<\/span><span class="gl">([^<]+)<\/span><\/span>/g;
    let wpMatch;
    while ((wpMatch = wordPairRegex.exec(block)) !== null) {
      words.push([wpMatch[1], wpMatch[2]]);
    }

    // Check for verse-end sof pasuk marker
    if (block.includes('class="verse-end"')) {
      words.push(['\u05C3', '']);
    }

    verses.push({ num: verseNum, words });
  }

  // Build JavaScript output
  let output = `const ${varName} = [\n`;
  verses.forEach((v, i) => {
    const wordsStr = v.words.map(([h, e]) => {
      // Escape any quotes in the strings
      const hEsc = h.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const eEsc = e.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `["${hEsc}","${eEsc}"]`;
    }).join(',');
    output += `  { num: "${v.num}", words: [${wordsStr}] }`;
    output += (i < verses.length - 1) ? ',\n' : '\n';
  });
  output += '];\n';

  return { output, verseCount: verses.length };
}

// Convert Helaman 3
const h3 = convertFile(
  'C:\\Users\\chris\\Desktop\\Hebrew BOM\\helaman3_interlinear.html',
  'he_ch3Verses'
);
fs.writeFileSync('C:\\Users\\chris\\Desktop\\Hebrew BOM\\he_ch3_data.js', h3.output, 'utf8');
console.log(`Helaman 3: ${h3.verseCount} verses converted`);

// Convert Helaman 4
const h4 = convertFile(
  'C:\\Users\\chris\\Desktop\\Hebrew BOM\\helaman4_interlinear.html',
  'he_ch4Verses'
);
fs.writeFileSync('C:\\Users\\chris\\Desktop\\Hebrew BOM\\he_ch4_data.js', h4.output, 'utf8');
console.log(`Helaman 4: ${h4.verseCount} verses converted`);
