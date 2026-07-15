/**
 * Enrich filmshelf entries with genre, director, and year from TMDB.
 *
 * Usage:
 *   node scripts/enrich-film-metadata.js [--force] [--title "Inception"]
 *
 * Requirements:
 *   TMDB_API_KEY environment variable (or in .env file)
 *
 * The script:
 *   1. Reads all markdown files with category: filmshelf
 *   2. For each film missing genre/director (or --force), searches TMDB
 *   3. Fetches genres and year from /movie/{id}, director(s) from /movie/{id}/credits
 *   4. Updates the frontmatter — never touches fields that already have a value
 *      unless --force is passed
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '..', 'src', 'content');

const args = process.argv.slice(2);
const force = args.includes('--force');
const targetTitleIndex = args.findIndex(a => a === '--title');
const targetTitle = targetTitleIndex !== -1 ? args[targetTitleIndex + 1] : null;

let tmdbApiKey = process.env.TMDB_API_KEY;
if (!tmdbApiKey) {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
    const match = envFile.match(/^TMDB_API_KEY\s*=\s*(.+)$/m);
    if (match) tmdbApiKey = match[1].trim().replace(/^["']|["']$/g, '');
  } catch {
    // .env not found
  }
}

if (!tmdbApiKey) {
  console.error('❌ TMDB_API_KEY not set. Add it to .env or pass as environment variable.');
  console.error('   Get a free key at: https://www.themoviedb.org/settings/api');
  process.exit(1);
}

const TMDB_BASE = 'https://api.themoviedb.org/3';
// Rate-limit friendly: TMDB allows ~50 req/s but we're polite given the volume.
const REQUEST_DELAY_MS = 250;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'scdotnetv3-shelf/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function getFilmshelfFiles() {
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
          if (data.category === 'filmshelf') {
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

async function searchMovie(title, year) {
  let url = `${TMDB_BASE}/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}&language=en-US`;
  if (year) url += `&year=${year}`;
  const json = await fetchJSON(url);
  return json.results && json.results.length > 0 ? json.results[0] : null;
}

async function getMovieDetails(id) {
  const url = `${TMDB_BASE}/movie/${id}?api_key=${tmdbApiKey}&language=en-US`;
  return fetchJSON(url);
}

async function getMovieDirectors(id) {
  const url = `${TMDB_BASE}/movie/${id}/credits?api_key=${tmdbApiKey}&language=en-US`;
  const json = await fetchJSON(url);
  if (!json.crew) return [];
  return json.crew.filter(c => c.job === 'Director').map(c => c.name);
}

function updateMarkdown(filePath, originalContent, updates) {
  const { data, content: bodyContent } = matter(originalContent);
  Object.assign(data, updates);
  const newContent = matter.stringify(bodyContent, data);
  fs.writeFileSync(filePath, newContent, 'utf8');
}

async function main() {
  const films = getFilmshelfFiles();
  console.log(`Found ${films.length} filmshelf entries.`);

  let toProcess = targetTitle
    ? films.filter(f => (f.data.title ?? '').toLowerCase().includes(targetTitle.toLowerCase()))
    : films;

  if (!force) {
    toProcess = toProcess.filter(f => !f.data.genre || !f.data.director);
  }

  console.log(`Processing ${toProcess.length} film(s).`);

  let updated = 0;
  let notFound = 0;

  for (const film of toProcess) {
    const title = film.data.title;
    if (!title) {
      console.log(`⚠️  Skipping entry without title: ${film.path}`);
      continue;
    }

    try {
      const result = await searchMovie(title, film.data.year);
      await sleep(REQUEST_DELAY_MS);
      if (!result) {
        console.log(`⚠️  No TMDB match for "${title}"`);
        notFound++;
        continue;
      }

      const details = await getMovieDetails(result.id);
      await sleep(REQUEST_DELAY_MS);
      const directors = await getMovieDirectors(result.id);
      await sleep(REQUEST_DELAY_MS);

      const updates = {};
      if ((force || !film.data.genre) && details.genres && details.genres.length > 0) {
        updates.genre = details.genres[0].name.toLowerCase();
      }
      if ((force || !film.data.director) && directors.length > 0) {
        updates.director = directors;
      }
      if ((force || !film.data.year) && details.release_date) {
        updates.year = parseInt(details.release_date.slice(0, 4), 10);
      }

      if (Object.keys(updates).length === 0) {
        console.log(`⏭️  ${title} — nothing new from TMDB`);
        continue;
      }

      updateMarkdown(film.path, film.content, updates);
      console.log(`✅ ${title} — ${JSON.stringify(updates)}`);
      updated++;
    } catch (err) {
      console.error(`❌ Failed for "${title}": ${err.message}`);
    }
  }

  console.log(`\nDone! Updated ${updated} film(s), ${notFound} not found on TMDB.`);
}

main().catch(console.error);
