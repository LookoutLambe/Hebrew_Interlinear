// Re-apply all UI improvements that were lost when restoring from backup
// This script makes targeted replacements to restore:
// 1. CSS fixes (chevron styling, book-row-heb, start-reading-btn, controls bar)
// 2. Bottom bar HTML (two rows, English labels, remove English Only button)
// 3. Drawer HTML (dual Hebrew/English, Arabic numerals)
// 4. Landing page Start Reading button
// 5. JS functions (getChapterLabel, updateNavButtons, startReading, keyboard nav, etc.)

const fs = require('fs');
let html = fs.readFileSync('BOM.html', 'utf8');
let changes = 0;

function replace(old, newStr, desc) {
  if (html.includes(old)) {
    html = html.replace(old, newStr);
    changes++;
    console.log(`✓ ${desc}`);
  } else {
    console.log(`✗ SKIP: ${desc} (pattern not found)`);
  }
}

// ============================================================
// 1. CSS FIXES
// ============================================================

// Fix .arr chevron styling
replace(
`.arr {
  color: #555;
  font-size: 1.3em;
  font-style: normal;
  font-weight: bold;
  vertical-align: middle;
}`,
`.arr {
  display: inline-block;
  color: var(--accent);
  font-family: 'Crimson Pro', serif;
  font-size: 1.3em;
  font-style: normal;
  font-weight: normal;
  vertical-align: bottom;
  padding-bottom: 0;
  margin: 0;
  line-height: 1;
  opacity: 0.75;
  direction: ltr;
  unicode-bidi: isolate;
}
body.hide-gloss .arr { display: none; }`,
'CSS: .arr chevron styling'
);

// Add .book-row-heb CSS (after .book-row-name)
replace(
`.book-row-name {`,
`.book-row-heb {
  font-family: 'David Libre', serif;
  font-size: 0.78em;
  color: #7a7a9a;
  font-weight: 400;
  margin-left: 6px;
  direction: rtl;
  display: inline;
}
.book-row-name {`,
'CSS: .book-row-heb for dual labels'
);

// Fix controls bar to two rows
replace(
`.controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1e2233;
  color: #c8a84e;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  font-family: 'Crimson Pro', serif;
  font-size: 0.9em;
  z-index: 100;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.15);
}`,
`.controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1e2233;
  color: #c8a84e;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 12px 8px;
  font-family: 'Crimson Pro', serif;
  font-size: 0.9em;
  z-index: 100;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.15);
}`,
'CSS: controls bar two-row layout'
);

// Add #start-reading-btn CSS before </style>
replace(
`</style>`,
`#start-reading-btn {
  background: var(--accent);
  color: #1a1a2e;
  border: none;
  padding: 12px 32px;
  font-family: 'Crimson Pro', serif;
  font-size: 1.1em;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.5px;
}
#start-reading-btn:hover { filter: brightness(1.1); transform: scale(1.02); }
.nav-row {
  display: flex;
  align-items: center;
  gap: 12px;
  direction: ltr;
}
#nav-label {
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  min-width: 100px;
  text-align: center;
}
#nav-label:hover { text-decoration: underline; }
</style>`,
'CSS: start-reading-btn + nav-row + nav-label'
);

// Fix drawer direction to LTR
replace(
`#drawer {
  position: fixed;
  top: 0;
  right: 0;`,
`#drawer {
  position: fixed;
  top: 0;
  right: 0;
  direction: ltr;`,
'CSS: drawer direction LTR'
);

// Fix chapter-grid direction to LTR
replace(
`.chapter-grid {
  display: grid;`,
`.chapter-grid {
  direction: ltr;
  display: grid;`,
'CSS: chapter-grid direction LTR'
);

// Fix chapter brick font
replace(
`.ch-brick {
  background: transparent;
  border: 1px solid #3a3f55;
  color: #c8a84e;
  padding: 4px;
  border-radius: 3px;
  cursor: pointer;
  font-family: 'David Libre', serif;
  font-size: 0.85em;`,
`.ch-brick {
  background: transparent;
  border: 1px solid #3a3f55;
  color: #c8a84e;
  padding: 4px;
  border-radius: 3px;
  cursor: pointer;
  font-family: 'Crimson Pro', serif;
  font-size: 0.85em;`,
'CSS: chapter brick font to Crimson Pro'
);

// Increase page bottom padding for two-row bar
replace(
`  .page { padding: 20px 12px 80px; }`,
`  .page { padding: 20px 12px 95px; }`,
'CSS: page bottom padding for two-row bar'
);

// ============================================================
// 2. BOTTOM BAR HTML
// ============================================================

replace(
`<div class="controls">
  <button class="nav-next" id="nav-next" onclick="goNext()" disabled>→</button>
  <div class="center-group">
    <button id="btn-inter" class="active" onclick="setMode('inter')">Interlinear</button>
    <button id="btn-heb" onclick="setMode('heb')">Hebrew Only</button>
    <button id="btn-eng" onclick="setMode('eng')">English Only</button>
    <span style="color:#3a3f55">│</span>
    <label>Size <input type="range" id="sizeSlider" min="70" max="150" value="100" oninput="setSize(this.value)"></label>
  </div>
  <button class="nav-prev" id="nav-prev" onclick="goPrev()" disabled>←</button>
</div>`,
`<div class="controls">
  <div class="nav-row">
    <button class="nav-prev" id="nav-prev" onclick="goPrev()" disabled>←</button>
    <span id="nav-label" onclick="toggleDrawer()">Book of Mormon</span>
    <button class="nav-next" id="nav-next" onclick="goNext()" disabled>→</button>
  </div>
  <div class="center-group">
    <button id="btn-inter" class="active" onclick="setMode('inter')">Interlinear</button>
    <button id="btn-heb" onclick="setMode('heb')">Hebrew Only</button>
    <span style="color:#3a3f55">│</span>
    <label>Size <input type="range" id="sizeSlider" min="70" max="150" value="100" oninput="setSize(this.value)"></label>
  </div>
</div>`,
'HTML: bottom bar two-row layout with English label'
);

// ============================================================
// 3. DRAWER HTML — Header
// ============================================================

replace(
`      <div class="drawer-header-title">ספר מורמון</div>
      <div class="drawer-header-sub">מהדורה עברית</div>`,
`      <div class="drawer-header-title">Book of Mormon</div>
      <div class="drawer-header-sub">ספר מורמון · Hebrew Interlinear</div>`,
'HTML: drawer header dual language'
);

// Front matter links
replace(
`  <div class="drawer-section-label">הקדמות</div>
  <button class="drawer-link active" onclick="navTo('intro')">מבוא אנגלי</button>
  <button class="drawer-link" onclick="navTo('front-translator')">מבוא המתרגם</button>
  <button class="drawer-link" onclick="navTo('front-titlepage')">ספר מורמון</button>
  <button class="drawer-link" onclick="navTo('front-introduction')">מבוא</button>
  <button class="drawer-link" onclick="navTo('front-three')">עדות שלשת העדים</button>
  <button class="drawer-link" onclick="navTo('front-eight')">עדות שמונה עדים</button>
  <button class="drawer-link" onclick="navTo('front-js')">עדות יוסף סמית</button>
  <button class="drawer-link" onclick="navTo('front-brief')">ביאור קצר</button>`,
`  <div class="drawer-section-label">FRONT MATTER</div>
  <button class="drawer-link active" onclick="navTo('intro')">To the Reader · מבוא אנגלי</button>
  <button class="drawer-link" onclick="navTo('front-translator')">Translator's Preface · מבוא המתרגם</button>
  <button class="drawer-link" onclick="navTo('front-titlepage')">Title Page · ספר מורמון</button>
  <button class="drawer-link" onclick="navTo('front-introduction')">Introduction · מבוא</button>
  <button class="drawer-link" onclick="navTo('front-three')">Three Witnesses · עדות שלשת העדים</button>
  <button class="drawer-link" onclick="navTo('front-eight')">Eight Witnesses · עדות שמונה עדים</button>
  <button class="drawer-link" onclick="navTo('front-js')">Testimony of Joseph Smith · עדות יוסף סמית</button>
  <button class="drawer-link" onclick="navTo('front-brief')">Brief Explanation · ביאור קצר</button>`,
'HTML: front matter dual language'
);

// Section label
replace(
`  <div class="drawer-section-label">ספרים</div>`,
`  <div class="drawer-section-label">BOOKS</div>`,
'HTML: books section label'
);

// ============================================================
// 4. DRAWER — Book names (Hebrew → dual)
// ============================================================

const bookNames = [
  ['נפי א׳', '1 Nephi', 'נפי א׳'],
  ['נפי ב׳', '2 Nephi', 'נפי ב׳'],
  ['יעקב', 'Jacob', 'יעקב'],
  ['אנוש', 'Enos', 'אנוש'],
  ['ירום', 'Jarom', 'ירום'],
  ['עמני', 'Omni', 'עמני'],
  ['דברי מורמון', 'Words of Mormon', 'דברי מורמון'],
  ['מושיה', 'Mosiah', 'מושיה'],
  ['אלמא', 'Alma', 'אלמא'],
  ['הילמן', 'Helaman', 'הילמן'],
  ['נפי ג׳', '3 Nephi', 'נפי ג׳'],
  ['נפי ד׳', '4 Nephi', 'נפי ד׳'],
  ['מורמון', 'Mormon', 'מורמון'],
  ['אתר', 'Ether', 'אתר'],
  ['מורוני', 'Moroni', 'מורוני'],
];

for (const [heb, eng, hebDisplay] of bookNames) {
  replace(
    `<span class="book-row-name">${heb}</span>`,
    `<span class="book-row-name">${eng} <span class="book-row-heb">${hebDisplay}</span></span>`,
    `HTML: book name ${eng}`
  );
}

// ============================================================
// 5. DRAWER — Chapter bricks: Hebrew numerals → Arabic
// ============================================================

const hebrewNums = {
  'א': '1', 'ב': '2', 'ג': '3', 'ד': '4', 'ה': '5',
  'ו': '6', 'ז': '7', 'ח': '8', 'ט': '9', 'י': '10',
  'יא': '11', 'יב': '12', 'יג': '13', 'יד': '14', 'טו': '15',
  'טז': '16', 'יז': '17', 'יח': '18', 'יט': '19', 'כ': '20',
  'כא': '21', 'כב': '22', 'כג': '23', 'כד': '24', 'כה': '25',
  'כו': '26', 'כז': '27', 'כח': '28', 'כט': '29', 'ל': '30',
  'לא': '31', 'לב': '32', 'לג': '33', 'לד': '34', 'לה': '35',
  'לו': '36', 'לז': '37', 'לח': '38', 'לט': '39', 'מ': '40',
  'מא': '41', 'מב': '42', 'מג': '43', 'מד': '44', 'מה': '45',
  'מו': '46', 'מז': '47', 'מח': '48', 'מט': '49', 'נ': '50',
  'נא': '51', 'נב': '52', 'נג': '53', 'נד': '54', 'נה': '55',
  'נו': '56', 'נז': '57', 'נח': '58', 'נט': '59', 'ס': '60',
  'סא': '61', 'סב': '62', 'סג': '63',
};

// Replace chapter bricks: >א< → >1< etc. (within ch-brick buttons only)
let brickChanges = 0;
for (const [heb, arabic] of Object.entries(hebrewNums)) {
  // Match ch-brick content: >הnum<
  const pattern = new RegExp(`(class="ch-brick"[^>]*>)${heb}(<\\/button>)`, 'g');
  const before = html;
  html = html.replace(pattern, `$1${arabic}$2`);
  if (html !== before) brickChanges++;
}
console.log(`✓ HTML: ${brickChanges} chapter brick number conversions`);
changes += brickChanges;

// ============================================================
// 6. LANDING PAGE — Start Reading button
// ============================================================

// Add after the ornament div
replace(
`    <div class="ornament">`,
`    <div id="start-reading-wrap" style="text-align:center;margin:20px 0 10px;direction:ltr;">
      <button id="start-reading-btn" onclick="startReading()">Start Reading →</button>
    </div>
    <div class="ornament">`,
'HTML: Start Reading button'
);

// ============================================================
// 7. JS FUNCTIONS
// ============================================================

// Add getChapterLabel function + updated updateNavButtons + extras before </script>
replace(
`</script>
</body>`,
`
// === NAVIGATION ENHANCEMENTS ===

function getChapterLabel(id) {
  if (!id) return 'Book of Mormon';
  var bookMap = {
    'ch': '1 Nephi', '2n-ch': '2 Nephi', 'jc-ch': 'Jacob',
    'en-ch': 'Enos', 'jr-ch': 'Jarom', 'om-ch': 'Omni',
    'wm-ch': 'Words of Mormon', 'mo-ch': 'Mosiah', 'al-ch': 'Alma',
    'he-ch': 'Helaman', '3n-ch': '3 Nephi', '4n-ch': '4 Nephi',
    'mm-ch': 'Mormon', 'et-ch': 'Ether', 'mr-ch': 'Moroni'
  };
  var singleChapter = {'en-ch':1,'jr-ch':1,'om-ch':1,'wm-ch':1,'4n-ch':1};
  for (var prefix in bookMap) {
    if (id.indexOf(prefix) === 0) {
      var num = id.replace(prefix, '');
      if (singleChapter[prefix]) return bookMap[prefix];
      return bookMap[prefix] + ' ' + num;
    }
  }
  return id;
}

// Override updateNavButtons to show English label
(function() {
  var origUpdate = window.updateNavButtons;
  window.updateNavButtons = function() {
    if (origUpdate) origUpdate();
    var label = document.getElementById('nav-label');
    if (label && typeof currentChapterId !== 'undefined') {
      label.textContent = getChapterLabel(currentChapterId);
    }
  };
})();

function startReading() {
  var last = localStorage.getItem('bom-last-chapter');
  if (last && chapterOrder.indexOf(last) >= 0) {
    navTo(last);
  } else {
    navTo('ch1');
  }
}

// Save current chapter to localStorage on every navigation
(function() {
  var _nav = navTo;
  window.navTo = function(id) {
    _nav(id);
    if (id && !id.startsWith('front-') && id !== 'intro') {
      try { localStorage.setItem('bom-last-chapter', id); } catch(e) {}
    }
  };
})();

// Update Start Reading button text if there's a saved chapter
(function() {
  var last = localStorage.getItem('bom-last-chapter');
  var btn = document.getElementById('start-reading-btn');
  if (last && btn) {
    var label = typeof getChapterLabel === 'function' ? getChapterLabel(last) : last;
    btn.textContent = 'Continue Reading \\u2014 ' + label + ' \\u2192';
  }
})();

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowLeft') { goNext(); e.preventDefault(); }
  else if (e.key === 'ArrowRight') { goPrev(); e.preventDefault(); }
  else if (e.key === 'Escape') {
    var drawer = document.getElementById('drawer');
    if (drawer && drawer.classList.contains('open')) toggleDrawer();
  }
});

// Auto-expand current book in drawer when navigating
(function() {
  var bookPrefixMap = {
    'ch': 'nephi1', '2n-ch': 'nephi2', 'jc-ch': 'jacob',
    'mo-ch': 'mo', 'al-ch': 'al', 'he-ch': 'he',
    '3n-ch': '3n', 'mm-ch': 'mm', 'et-ch': 'et', 'mr-ch': 'mr'
  };
  var origUpdate2 = window.updateNavButtons;
  window.updateNavButtons = function() {
    if (origUpdate2) origUpdate2();
    if (typeof currentChapterId === 'undefined' || !currentChapterId) return;
    for (var prefix in bookPrefixMap) {
      if (currentChapterId.indexOf(prefix) === 0) {
        var grid = document.getElementById('grid-' + bookPrefixMap[prefix]);
        if (grid && grid.style.display === 'none') {
          toggleBook(bookPrefixMap[prefix]);
        }
        break;
      }
    }
  };
})();

// Fix setMode to scope button selection to center-group only
(function() {
  var origSetMode = window.setMode;
  if (!origSetMode) return;
  window.setMode = function(mode) {
    origSetMode(mode);
    // Re-scope active class to center-group buttons only
    var cg = document.querySelector('.center-group');
    if (cg) {
      cg.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
      var id = mode === 'inter' ? 'btn-inter' : mode === 'heb' ? 'btn-heb' : null;
      if (id) document.getElementById(id).classList.add('active');
    }
  };
})();

</script>
</body>`,
'JS: all navigation enhancement functions'
);

fs.writeFileSync('BOM.html', html);
console.log(`\nTotal changes applied: ${changes}`);
console.log('BOM.html updated with all UI improvements!');
