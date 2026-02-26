const html = require('fs').readFileSync('BOM.html', 'utf8');

function findRemaining(pattern, label) {
  const re = new RegExp('\\["([^"]+)","([^"]*' + pattern + '[^"]*)"\\]', 'g');
  const map = new Map();
  let m;
  while ((m = re.exec(html)) !== null) {
    const key = m[1] + '|' + m[2];
    map.set(key, (map.get(key) || 0) + 1);
  }
  console.log('=== Remaining "' + label + '" ===');
  for (const [k, c] of [...map.entries()].sort((a,b) => b[1] - a[1])) {
    const [heb, eng] = k.split('|');
    console.log(`  ${c}x  ["${heb}","${eng}"]`);
  }
  console.log('');
}

findRemaining('went-out', 'went-out');
findRemaining('went-up', 'went-up');
findRemaining('went-down', 'went-down');
findRemaining('congregation', 'congregation');
findRemaining('charity\\/covenant-love', 'charity/covenant-love');
findRemaining('go-out', 'go-out');
findRemaining('go-up', 'go-up');
findRemaining('go-down', 'go-down');
findRemaining('teaching', 'teaching');
