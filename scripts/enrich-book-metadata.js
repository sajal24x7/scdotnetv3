/**
 * Enrich bookshelf entries with author, genre, year, and series from Open
 * Library and Google Books (both keyless).
 *
 * Usage:
 *   node scripts/enrich-book-metadata.js [--force] [--title "The Dispossessed"]
 *
 * The script:
 *   1. Reads all markdown files with category: bookshelf
 *   2. For each book missing author/genre/year/series (or --force), queries
 *      Open Library and Google Books in parallel
 *   3. Fills author (Open Library, falling back to Google Books), year
 *      (Open Library's first-publish year, falling back to Google Books'
 *      publishedDate), genre (Google Books categories — Open Library has no
 *      clean equivalent), and series/seriesNumber (parsed from a trailing
 *      "(Series Name, #N)" in the matched title, when present)
 *   4. Updates the frontmatter — never touches fields that already have a
 *      value unless --force is passed
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '..', 'src', 'content');

const args = process.argv.slice(2);
const force = args.includes('--force');
const targetTitleIndex = args.findIndex(a => a === '--title');
const targetTitle = targetTitleIndex !== -1 ? args[targetTitleIndex + 1] : null;

const REQUEST_DELAY_MS = 250;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'scdotnetv3-shelf/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function getBookshelfFiles() {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const { data } = matter(content);
          if (data.category === 'bookshelf') {
            files.push({ path: fullPath, data, content });
          }
        } catch {
          // skip
        }
      }
    }
  };
  walk(contentDir);
  return files;
}

function firstAuthor(author) {
  return Array.isArray(author) ? author[0] : author;
}

// Same filter the book cover downloader uses, so enrichment doesn't pick up
// SparkNotes-style summaries as the match.
const SUMMARY_KEYWORDS = /\b(summary|summaries|study guide|sparknotes|cliffsnotes|gradesaver|analysis|review|synopsis|workbook|companion guide)\b/i;

function normalizeTitle(s) {
  return String(s ?? '').toLowerCase()
    .replace(/^(a |an |the )/i, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function titleScore(candidateTitle, targetTitle) {
  const cNorm = normalizeTitle(candidateTitle);
  const tNorm = normalizeTitle(targetTitle);
  if (cNorm === tNorm) return 1;
  if (cNorm.startsWith(tNorm) || tNorm.startsWith(cNorm)) return 0.9;
  if (cNorm.includes(tNorm) || tNorm.includes(cNorm)) return 0.7;
  const cWords = new Set(cNorm.split(/\s+/));
  const tWords = tNorm.split(/\s+/);
  const overlap = tWords.filter(w => cWords.has(w)).length;
  return overlap / Math.max(tWords.length, 1) * 0.5;
}

function bestMatch(candidates, getTitle, targetTitle) {
  let best = candidates[0];
  let bestScore = titleScore(getTitle(candidates[0]), targetTitle);
  for (const c of candidates.slice(1)) {
    const s = titleScore(getTitle(c), targetTitle);
    if (s > bestScore) { bestScore = s; best = c; }
  }
  return best;
}

// Parse a trailing "(Series Name, #N)" or "(Series Name #N)" off a title —
// the format Open Library and Goodreads both use for series entries.
function parseSeries(title) {
  const match = String(title || '').match(/\(([^,()]+?)(?:,)?\s*#(\d+(?:\.\d+)?)\)\s*$/);
  if (!match) return null;
  return { series: match[1].trim(), seriesNumber: parseFloat(match[2]) };
}

async function searchOpenLibrary(title, author) {
  const query = encodeURIComponent(`${title} ${author || ''}`.trim());
  const json = await fetchJSON(`https://openlibrary.org/search.json?q=${query}&limit=10&fields=title,author_name,first_publish_year`);
  if (!json.docs || json.docs.length === 0) return null;
  const genuine = json.docs.filter(b => !SUMMARY_KEYWORDS.test(b.title || ''));
  const pool = genuine.length > 0 ? genuine : json.docs;
  const best = bestMatch(pool, b => b.title || '', title);
  return {
    title: best.title,
    author: best.author_name ? best.author_name[0] : null,
    year: best.first_publish_year || null,
  };
}

async function searchGoogleBooks(title, author) {
  const query = encodeURIComponent(`${title} ${author || ''}`.trim());
  const json = await fetchJSON(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`);
  if (!json.items || json.items.length === 0) return null;
  const genuine = json.items.filter(b => !SUMMARY_KEYWORDS.test(b.volumeInfo.title || ''));
  const pool = genuine.length > 0 ? genuine : json.items;
  const best = bestMatch(pool, b => b.volumeInfo.title || '', title);
  const info = best.volumeInfo;
  const year = info.publishedDate ? parseInt(info.publishedDate.slice(0, 4), 10) : null;
  // Google Books categories look like "Fiction / Science Fiction / General" — take the leaf.
  const genre = info.categories && info.categories.length > 0
    ? info.categories[0].split('/').pop().trim().toLowerCase()
    : null;
  return {
    title: info.title,
    author: info.authors ? info.authors[0] : null,
    year,
    genre,
  };
}

function updateMarkdown(filePath, originalContent, updates) {
  const { data, content: bodyContent } = matter(originalContent);
  Object.assign(data, updates);
  const newContent = matter.stringify(bodyContent, data);
  fs.writeFileSync(filePath, newContent, 'utf8');
}

async function main() {
  const books = getBookshelfFiles();
  console.log(`Found ${books.length} bookshelf entries.`);

  let toProcess = targetTitle
    ? books.filter(b => (b.data.title ?? '').toLowerCase().includes(targetTitle.toLowerCase()))
    : books;

  if (!force) {
    toProcess = toProcess.filter(b =>
      !b.data.author || !b.data.genre || !b.data.year || !b.data.series || b.data.series === 'none'
    );
  }

  console.log(`Processing ${toProcess.length} book(s).`);

  let updated = 0;
  let notFound = 0;

  for (const book of toProcess) {
    const title = book.data.title;
    if (!title) {
      console.log(`⚠️  Skipping entry without title: ${book.path}`);
      continue;
    }
    const author = firstAuthor(book.data.author);

    try {
      const [ol, gb] = await Promise.all([
        searchOpenLibrary(title, author).catch(() => null),
        searchGoogleBooks(title, author).catch(() => null),
      ]);
      await sleep(REQUEST_DELAY_MS);

      if (!ol && !gb) {
        console.log(`⚠️  No match for "${title}" on Open Library or Google Books`);
        notFound++;
        continue;
      }

      const updates = {};
      const matchedTitle = ol?.title || gb?.title || title;

      if ((force || !book.data.author) && (ol?.author || gb?.author)) {
        updates.author = ol?.author || gb?.author;
      }
      if ((force || !book.data.genre) && gb?.genre) {
        updates.genre = gb.genre;
      }
      if ((force || !book.data.year) && (ol?.year || gb?.year)) {
        updates.year = ol?.year || gb?.year;
      }
      if (force || !book.data.series || book.data.series === 'none') {
        const series = parseSeries(matchedTitle);
        if (series) {
          updates.series = series.series;
          updates.seriesNumber = series.seriesNumber;
        }
      }

      if (Object.keys(updates).length === 0) {
        console.log(`⏭️  ${title} — nothing new`);
        continue;
      }

      updateMarkdown(book.path, book.content, updates);
      console.log(`✅ ${title} — ${JSON.stringify(updates)}`);
      updated++;
    } catch (err) {
      console.error(`❌ Failed for "${title}": ${err.message}`);
    }
  }

  console.log(`\nDone! Updated ${updated} book(s), ${notFound} not found.`);
}

main().catch(console.error);
