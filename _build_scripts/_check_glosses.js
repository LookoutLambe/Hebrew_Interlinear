const fs = require('fs');
const path = require('path');

const bomPath = path.join(__dirname, '..', 'BOM.html');
const html = fs.readFileSync(bomPath, 'utf8');
const lines = html.split('\n');

const wordPairs = [];
const pairRe = /\["([^"]+)","([^"]*)"\]/g;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m;
  pairRe.lastIndex = 0;
  while ((m = pairRe.exec(line)) !== null) {
    const heb = m[1];
    const eng = m[2];
    if (eng === '') continue;
    wordPairs.push({ heb, eng, lineNum: i + 1 });
  }
}

console.log('Total word pairs extracted: ' + wordPairs.length + '\n');

// Build frequency map
const glossMap = new Map();

for (const { heb, eng, lineNum } of wordPairs) {
  if (!glossMap.has(heb)) glossMap.set(heb, new Map());
  const glosses = glossMap.get(heb);
  if (!glosses.has(eng)) glosses.set(eng, { count: 0, lineNums: [] });
  const entry = glosses.get(eng);
  entry.count++;
  if (entry.lineNums.length < 15) entry.lineNums.push(lineNum);
}

function normalizeGloss(g) {
  return g.toLowerCase().replace(/[-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function glossesEquivalent(a, b) {
  return normalizeGloss(a) === normalizeGloss(b);
}

function glossesVeryDifferent(a, b) {
  const na = normalizeGloss(a);
  const nb = normalizeGloss(b);
  if (na === nb) return false;
  if (na.includes(nb) || nb.includes(na)) return false;
  const wa = new Set(na.split(' '));
  const wb = new Set(nb.split(' '));
  const common = [...wa].filter(w => wb.has(w) && w.length > 2).length;
  const maxLen = Math.max(wa.size, wb.size);
  return common / maxLen < 0.3;
}

const suspicious = [];

for (const [heb, glosses] of glossMap) {
  if (glosses.size < 2) continue;

  const sorted = [...glosses.entries()].sort((a, b) => b[1].count - a[1].count);
  const totalOccurrences = sorted.reduce((s, e) => s + e[1].count, 0);
  const topCount = sorted[0][1].count;
  const topGloss = sorted[0][0];

  if (totalOccurrences < 4) continue;

  const significantGlosses = sorted.filter(e => e[1].count >= 3).length;
  if (significantGlosses >= 4) continue;

  for (const [minGloss, minData] of sorted.slice(1)) {
    const ratio = topCount / minData.count;
    if (ratio < 5) continue;
    if (minData.count > 3) continue;
    if (glossesEquivalent(topGloss, minGloss)) continue;

    const normTop = normalizeGloss(topGloss);
    const normMin = normalizeGloss(minGloss);
    const topWC = normTop.split(' ').length;
    const minWC = normMin.split(' ').length;
    if (normMin.includes(normTop) && minWC > topWC + 2) continue;
    if (normTop.includes(normMin) && topWC > minWC + 2) continue;

    const veryDiff = glossesVeryDifferent(topGloss, minGloss);
    let score = ratio * Math.log2(topCount + 1);
    if (veryDiff) score *= 2;

    suspicious.push({
      heb, topGloss, topCount, minGloss,
      minCount: minData.count,
      minLineNums: minData.lineNums,
      totalOccurrences,
      numDistinctGlosses: glosses.size,
      ratio, score, veryDiff
    });
  }
}

suspicious.sort((a, b) => b.score - a.score);

const sep = '='.repeat(100);
const hsep = '#'.repeat(100);

console.log(sep);
console.log('SUSPICIOUS GLOSS INCONSISTENCIES');
console.log('Showing: minority gloss 1-3x, majority gloss 5x+ more frequent');
console.log(sep);

const realErrors = suspicious.filter(s => s.veryDiff && s.ratio >= 10 && s.topCount >= 5);
const possibleErrors = suspicious.filter(s =>
  !realErrors.includes(s) && s.ratio >= 10 && s.topCount >= 10
);

function printItems(items, limit) {
  const byWord = new Map();
  for (const s of items) {
    if (!byWord.has(s.heb)) byWord.set(s.heb, []);
    byWord.get(s.heb).push(s);
  }
  let printed = 0;
  for (const [heb, entries] of byWord) {
    if (printed >= limit) {
      console.log('  ... and ' + (byWord.size - printed) + ' more words');
      break;
    }
    const top = entries[0];
    console.log('  ' + heb + '  --  majority: "' + top.topGloss + '" (' + top.topCount + 'x / ' + top.totalOccurrences + ' total)');
    for (const e of entries) {
      const lineStr = e.minLineNums.slice(0, 5).join(', ');
      console.log('    OUTLIER: "' + e.minGloss + '" (' + e.minCount + 'x) -- lines: ' + lineStr);
    }
    console.log();
    printed++;
  }
  return byWord.size;
}

const tier1Count = new Set(realErrors.map(s => s.heb)).size;
console.log('\n' + hsep);
console.log('# TIER 1: VERY DIFFERENT MEANINGS -- likely errors (' + realErrors.length + ' items, ' + tier1Count + ' words)');
console.log(hsep + '\n');
printItems(realErrors, 150);

const tier2Count = new Set(possibleErrors.map(s => s.heb)).size;
console.log('\n' + hsep);
console.log('# TIER 2: HIGH-RATIO OUTLIERS -- worth checking (' + possibleErrors.length + ' items, ' + tier2Count + ' words)');
console.log(hsep + '\n');
printItems(possibleErrors, 150);

console.log('\n' + sep);
console.log('SUMMARY');
console.log(sep);
console.log('  Unique Hebrew words: ' + glossMap.size);
console.log('  Words with 1 gloss: ' + [...glossMap.values()].filter(g => g.size === 1).length);
console.log('  Words with 2+ glosses: ' + [...glossMap.values()].filter(g => g.size >= 2).length);
console.log('  Tier 1 (very different meanings): ' + tier1Count + ' words');
console.log('  Tier 2 (high-ratio outliers): ' + tier2Count + ' words');

console.log('\n' + sep);
console.log('TOP 30 MOST FREQUENT HEBREW WORDS');
console.log(sep);
const byFreq = [...glossMap.entries()]
  .map(function(pair) {
    const heb = pair[0];
    const glosses = pair[1];
    return {
      heb: heb,
      total: [...glosses.values()].reduce(function(s, v) { return s + v.count; }, 0),
      glosses: [...glosses.entries()].sort(function(a, b) { return b[1].count - a[1].count; })
    };
  })
  .sort(function(a, b) { return b.total - a.total; })
  .slice(0, 30);

for (const w of byFreq) {
  const glossStrs = w.glosses.slice(0, 6).map(function(pair) {
    return ' + pair[0] + (' + pair[1].count + ')';
  }).join(', ');
  const more = w.glosses.length > 6 ? ' +' + (w.glosses.length - 6) + ' more' : '';
  console.log('  ' + w.heb + ' (' + w.total + 'x): ' + glossStrs + more);
}

console.log('\nDone.');
