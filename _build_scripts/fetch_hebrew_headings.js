// Fetch Hebrew chapter headings from the Church website
const https = require('https');

const books = [
  { slug: '1-ne', name: '1 Nephi', chapters: 22 },
  { slug: '2-ne', name: '2 Nephi', chapters: 33 },
  { slug: 'jacob', name: 'Jacob', chapters: 7 },
  { slug: 'enos', name: 'Enos', chapters: 1 },
  { slug: 'jarom', name: 'Jarom', chapters: 1 },
  { slug: 'omni', name: 'Omni', chapters: 1 },
  { slug: 'w-of-m', name: 'Words of Mormon', chapters: 1 },
  { slug: 'mosiah', name: 'Mosiah', chapters: 29 },
  { slug: 'alma', name: 'Alma', chapters: 63 },
  { slug: 'hel', name: 'Helaman', chapters: 16 },
  { slug: '3-ne', name: '3 Nephi', chapters: 30 },
  { slug: '4-ne', name: '4 Nephi', chapters: 1 },
  { slug: 'morm', name: 'Mormon', chapters: 9 },
  { slug: 'ether', name: 'Ether', chapters: 15 },
  { slug: 'moro', name: 'Moroni', chapters: 10 },
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const doRequest = (reqUrl) => {
      https.get(reqUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doRequest(res.headers.location);
          return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    };
    doRequest(url);
  });
}

function extractHeading(html) {
  let m = html.match(/<p[^>]*class="[^"]*study-summary[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  if (m) return m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  m = html.match(/<div[^>]*class="[^"]*studySummary[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (m) return m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return '';
}

async function main() {
  const result = {};
  for (const book of books) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      const url = `https://www.churchofjesuschrist.org/study/scriptures/bofm/${book.slug}/${ch}?lang=heb`;
      const key = `${book.name} ${ch}`;
      try {
        const html = await fetchUrl(url);
        const heading = extractHeading(html);
        result[key] = heading;
        if (heading) {
          process.stderr.write(`✓ ${key}\n`);
        } else {
          process.stderr.write(`✗ ${key} (no heading found)\n`);
        }
      } catch (e) {
        process.stderr.write(`✗ ${key} (${e.message})\n`);
        result[key] = '';
      }
      await new Promise(r => setTimeout(r, 250));
    }
  }
  console.log('var _chapterHeadingsHeb = ' + JSON.stringify(result, null, 2) + ';');
}

main();
