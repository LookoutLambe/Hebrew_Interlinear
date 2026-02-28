const fs = require('fs');
const path = require('path');
const crossrefs = JSON.parse(fs.readFileSync('crossrefs.json', 'utf8'));

// Collect all D&C, Moses, Abraham, JS-H references
const needed = { 'D&C': new Map(), 'Moses': new Map(), 'Abraham': new Map(), 'JS-H': new Map() };

for (const [verseKey, entries] of Object.entries(crossrefs)) {
  let lastBook = null;
  for (const entry of entries) {
    if (!entry.refs) continue;
    for (const r of entry.refs) {
      let book = null, ch = null, vs = null;

      if (r.startsWith('D&C')) {
        const m = r.substring(3).trim().match(/^(\d+):(\d+)/);
        if (m) { book = 'D&C'; ch = parseInt(m[1]); vs = parseInt(m[2]); }
      } else if (r.startsWith('Moses')) {
        const m = r.substring(5).trim().match(/^(\d+):(\d+)/);
        if (m) { book = 'Moses'; ch = parseInt(m[1]); vs = parseInt(m[2]); }
      } else if (r.startsWith('Abr.')) {
        const m = r.substring(4).trim().match(/^(\d+):(\d+)/);
        if (m) { book = 'Abraham'; ch = parseInt(m[1]); vs = parseInt(m[2]); }
      } else if (/^JS[—\-]H/.test(r)) {
        const m = r.match(/(\d+):(\d+)/);
        if (m) { book = 'JS-H'; ch = parseInt(m[1]); vs = parseInt(m[2]); }
      }

      // Handle continuation refs (just "number:number")
      if (!book && /^\d+:\d+/.test(r.trim()) && lastBook) {
        const m = r.trim().match(/^(\d+):(\d+)/);
        if (m && needed[lastBook]) {
          book = lastBook;
          ch = parseInt(m[1]);
          vs = parseInt(m[2]);
        }
      }

      if (book && ch && vs) {
        if (!needed[book].has(ch)) needed[book].set(ch, new Set());
        needed[book].get(ch).add(vs);
        lastBook = book;
      }
    }
  }
}

let totalVerses = 0;
for (const [book, chapters] of Object.entries(needed)) {
  const chList = [...chapters.entries()].sort((a, b) => a[0] - b[0]);
  let bookTotal = 0;
  chList.forEach(([ch, verses]) => bookTotal += verses.size);
  totalVerses += bookTotal;
  console.log(`\n${book}: ${chapters.size} chapters, ${bookTotal} verses`);
  chList.forEach(([ch, verses]) => {
    const vList = [...verses].sort((a, b) => a - b);
    console.log(`  Ch ${ch}: ${vList.join(', ')}`);
  });
}
console.log(`\nTotal verses needed: ${totalVerses}`);

// Also list unique D&C chapters (largest)
const dcChapters = [...needed['D&C'].keys()].sort((a, b) => a - b);
console.log(`\nD&C chapters needed: ${dcChapters.length}`);
console.log(dcChapters.join(', '));
