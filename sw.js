var CACHE_NAME = 'hebrew-bom-v19';

// Use relative paths resolved from service worker scope
var BASE = self.registration.scope;

var PRECACHE_FILES = [
  'BOM.html',
  'official_verses.js',
  'crossrefs.js',
  'roots_glossary.js',
  'chapter_headings.js',
  'chapter_headings_heb.js',
  'scripture_verses.js',
  'topical_guide.js',
  'verses/frontmatter.js',
  'verses/1nephi.js',
  'verses/2nephi.js',
  'verses/jacob.js',
  'verses/enos.js',
  'verses/jarom.js',
  'verses/omni.js',
  'verses/words_of_mormon.js',
  'verses/mosiah.js',
  'verses/alma.js',
  'verses/helaman.js',
  'verses/3nephi.js',
  'verses/4nephi.js',
  'verses/mormon.js',
  'verses/ether.js',
  'verses/moroni.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// Install: precache core assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('[SW] Precaching core assets');
      var urls = PRECACHE_FILES.map(function(f) { return new URL(f, BASE).href; });
      return cache.addAll(urls);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: network-first for HTML, cache-first for data files
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Network-first for HTML (so updates propagate quickly)
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache-first for JS data files, JSON, and images
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.json') || url.pathname.endsWith('.png')) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
    return;
  }
});
