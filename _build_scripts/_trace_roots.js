const fs = require("fs");
const files = ["BOM.html", "_chapter_data/al_data.js", "_chapter_data/he_data.js", "_chapter_data/3n_data.js", "_chapter_data/et_data.js"];

const roots = {
  "שׁלם": { pattern: /שְׁלֵמ|שָׁלֵם|שָׁלוֹם|שְׁלוֹם|שֶׁלֶם|תָּשְׁלוּם/, matches: [] },
  "גאל": { pattern: /גְּאֻל|גֹּאֵל|גָּאַל|גְּאוּל|גֹּאֲל/, matches: [] },
  "תמם": { pattern: /תָּמִים|תֻּמִּ|תָּמַם|תֹּם|תְּמִים/, matches: [] },
  "חסד": { pattern: /חֶסֶד|חַסְד|חֲסָד|חָסִיד|חֲסִיד/, matches: [] },
};

for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  const re = /\["([^"]+)","([^"]*)"\]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const heb = m[1];
    const gloss = m[2];
    if (!gloss) continue;
    for (const [rootName, rootInfo] of Object.entries(roots)) {
      if (rootInfo.pattern.test(heb)) {
        rootInfo.matches.push({ file: f.replace("_chapter_data/",""), heb, gloss });
      }
    }
  }
}

for (const [rootName, rootInfo] of Object.entries(roots)) {
  console.log("=== Root: " + rootName + " (" + rootInfo.matches.length + " total) ===");
  const unique = new Map();
  for (const m of rootInfo.matches) {
    const key = m.heb + "|" + m.gloss;
    if (!unique.has(key)) unique.set(key, { ...m, count: 0 });
    unique.get(key).count++;
  }
  for (const [k, v] of [...unique.entries()].sort((a,b) => b[1].count - a[1].count)) {
    console.log("  " + v.heb + " => " + v.gloss + " (" + v.count + "x) [" + v.file + "]");
  }
  console.log("");
}
