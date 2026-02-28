const fs = require('fs');
const files = ['BOM.html','_chapter_data/al_data.js','_chapter_data/he_data.js','_chapter_data/3n_data.js','_chapter_data/et_data.js'];
const forms = new Map();
for (const f of files) {
  const c = fs.readFileSync(f,'utf8');
  const re = /"([^"]*Yeshua[^"]*)"/g;
  let m;
  while ((m = re.exec(c)) !== null) {
    const g = m[1];
    forms.set(g, (forms.get(g)||0) + 1);
  }
}
for (const [k,v] of [...forms.entries()].sort((a,b)=>b[1]-a[1])) console.log(v + 'x  ' + k);
