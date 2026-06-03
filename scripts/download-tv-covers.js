/**
 * Download TV show poster images from TMDB.
 *
 * Usage:
 *   node scripts/download-tv-covers.js [--force] [--title "Breaking Bad"]
 *
 * Requirements:
 *   TMDB_API_KEY environment variable (or in .env file)
 *
 * The script:
 *   1. Reads all markdown files with category: tvshelf
 *   2. Groups by showTitle (or title) — downloads one poster per unique show
 *   3. Searches TMDB TV endpoint for each show
 *   4. Downloads the poster to src/images/tvshelf/[show-slug].jpg
 *   5. Updates cover in the frontmatter of all entries for that show
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
const tvshelfDir = path.join(__dirname, '..', 'src', 'images', 'tvshelf');

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

if (!fs.existsSync(tvshelfDir)) {
  fs.mkdirSync(tvshelfDir, { recursive: true });
}

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

function getTVshelfFiles() {
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
          if (data.category === 'tvshelf') {
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

function updateMarkdownWithCover(filePath, originalContent, coverFilename) {
  const { data, content: bodyContent } = matter(originalContent);
  data.cover = coverFilename;
  const newContent = matter.stringify(bodyContent, data);
  fs.writeFileSync(filePath, newContent, 'utf8');
}

async function searchTVPoster(showTitle, year) {
  let url = `${TMDB_BASE}/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(showTitle)}&language=en-US`;
  if (year) url += `&first_air_date_year=${year}`;
  const json = await fetchJSON(url);
  if (!json.results || json.results.length === 0) return null;
  const result = json.results[0];
  return result.poster_path ? `${TMDB_IMG_BASE}${result.poster_path}` : null;
}

async function main() {
  const allFiles = getTVshelfFiles();
  console.log(`Found ${allFiles.length} tvshelf entries.`);

  // Group by showTitle (or title) — one poster per unique show, all files tracked
  const showMap = new Map();
  for (const file of allFiles) {
    const showTitle = file.data.showTitle ?? file.data.title ?? 'Unknown';
    if (!showMap.has(showTitle)) {
      showMap.set(showTitle, { data: file.data, showTitle, files: [] });
    }
    showMap.get(showTitle).files.push(file);
  }

  console.log(`Found ${showMap.size} unique TV shows.`);

  const toProcess = targetTitle
    ? Array.from(showMap.values()).filter(s => s.showTitle.toLowerCase().includes(targetTitle.toLowerCase()))
    : Array.from(showMap.values());

  for (const show of toProcess) {
    const { showTitle } = show;
    const slug = titleToFilename(showTitle);
    const filename = `${slug}.jpg`;
    const outputPath = path.join(tvshelfDir, filename);

    if (fs.existsSync(outputPath) && !forceDownload) {
      const missing = show.files.filter(f => !f.data.cover);
      if (missing.length > 0) {
        for (const f of missing) updateMarkdownWithCover(f.path, f.content, filename);
        console.log(`📝 ${showTitle} — image exists, updated ${missing.length} frontmatter file(s) (${filename})`);
      } else {
        console.log(`⏭️  ${showTitle} — already exists (${filename})`);
      }
      continue;
    }

    console.log(`📺 Searching TMDB for TV show: ${showTitle}`);
    try {
      const posterUrl = await searchTVPoster(showTitle, show.data.year);
      if (!posterUrl) {
        console.log(`   ⚠️  No poster found on TMDB for "${showTitle}"`);
        continue;
      }

      console.log(`   ⬇️  Downloading: ${posterUrl}`);
      await downloadFile(posterUrl, outputPath);
      const size = fs.statSync(outputPath).size;
      for (const f of show.files) updateMarkdownWithCover(f.path, f.content, filename);
      console.log(`   ✅ Saved: ${filename} (${(size / 1024).toFixed(1)} KB) — updated ${show.files.length} frontmatter file(s)`);
    } catch (err) {
      console.error(`   ❌ Failed for "${showTitle}": ${err.message}`);
    }
  }

  console.log('\nDone! Run "node scripts/generate-tv-covers.js" to update tvCovers.ts.');;
}

main().catch(console.error);
