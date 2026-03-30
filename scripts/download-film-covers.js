/**
 * Download film poster images from TMDB.
 *
 * Usage:
 *   node scripts/download-film-covers.js [--force] [--title "Inception"]
 *
 * Requirements:
 *   TMDB_API_KEY environment variable (or in .env file)
 *
 * The script:
 *   1. Reads all markdown files with category: filmshelf
 *   2. For each film without a local poster (or --force), searches TMDB
 *   3. Downloads the poster to src/images/filmshelf/[slug].jpg
 *   4. Prints the filename to add to the filmCover frontmatter field
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
const filmshelfDir = path.join(__dirname, '..', 'src', 'images', 'filmshelf');

// CLI flags
const args = process.argv.slice(2);
const forceDownload = args.includes('--force');
const targetTitleIndex = args.findIndex(a => a === '--title');
const targetTitle = targetTitleIndex !== -1 ? args[targetTitleIndex + 1] : null;

// Load TMDB API key
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
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

if (!fs.existsSync(filmshelfDir)) {
  fs.mkdirSync(filmshelfDir, { recursive: true });
}

// Convert title to slug filename
function titleToFilename(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Collect all filmshelf markdown files
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
            files.push({ path: fullPath, data });
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

// Fetch JSON from a URL
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'scdotnetv3-shelf/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Download a binary file from URL
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'scdotnetv3-shelf/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadFile(res.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => fileStream.close(resolve));
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

// Search TMDB for a film and return the poster path
async function searchFilmPoster(title, year) {
  let url = `${TMDB_BASE}/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}&language=en-US`;
  if (year) url += `&year=${year}`;
  const json = await fetchJSON(url);
  if (!json.results || json.results.length === 0) return null;
  const result = json.results[0];
  return result.poster_path ? `${TMDB_IMG_BASE}${result.poster_path}` : null;
}

async function main() {
  const films = getFilmshelfFiles();
  console.log(`Found ${films.length} filmshelf entries.`);

  const toProcess = targetTitle
    ? films.filter(f => (f.data.title ?? '').toLowerCase().includes(targetTitle.toLowerCase()))
    : films;

  if (toProcess.length === 0) {
    console.log('No matching films found.');
    return;
  }

  for (const film of toProcess) {
    const title = film.data.title;
    if (!title) {
      console.log(`⚠️  Skipping entry without title: ${film.path}`);
      continue;
    }

    const slug = titleToFilename(title);
    const filename = `${slug}.jpg`;
    const outputPath = path.join(filmshelfDir, filename);

    if (fs.existsSync(outputPath) && !forceDownload) {
      console.log(`⏭️  ${title} — already exists (${filename})`);
      continue;
    }

    console.log(`🎬 Searching TMDB for: ${title}`);
    try {
      const posterUrl = await searchFilmPoster(title, film.data.year);
      if (!posterUrl) {
        console.log(`   ⚠️  No poster found on TMDB for "${title}"`);
        continue;
      }

      console.log(`   ⬇️  Downloading: ${posterUrl}`);
      await downloadFile(posterUrl, outputPath);
      const size = fs.statSync(outputPath).size;
      console.log(`   ✅ Saved: ${filename} (${(size / 1024).toFixed(1)} KB)`);
      console.log(`   📝 Add to frontmatter: filmCover: ${filename}`);
    } catch (err) {
      console.error(`   ❌ Failed for "${title}": ${err.message}`);
    }
  }

  console.log('\nDone! Run "node scripts/generate-film-covers.js" to update filmCovers.ts');
}

main().catch(console.error);
