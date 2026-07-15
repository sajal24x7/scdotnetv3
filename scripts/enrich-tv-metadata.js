/**
 * Enrich tvshelf entries with genre, creator, and year from TMDB.
 *
 * Usage:
 *   node scripts/enrich-tv-metadata.js [--force] [--title "Breaking Bad"]
 *
 * Requirements:
 *   TMDB_API_KEY environment variable (or in .env file)
 *
 * The script:
 *   1. Reads all markdown files with category: tvshelf
 *   2. Groups by showTitle (or title) — one TMDB lookup per unique show
 *   3. Fetches genres, creators (created_by), and first-air year from /tv/{id}
 *   4. Updates every season file for that show — never touches fields that
 *      already have a value unless --force is passed
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

async function searchTVShow(showTitle, year) {
  let url = `${TMDB_BASE}/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(showTitle)}&language=en-US`;
  if (year) url += `&first_air_date_year=${year}`;
  const json = await fetchJSON(url);
  return json.results && json.results.length > 0 ? json.results[0] : null;
}

async function getTVDetails(id) {
  const url = `${TMDB_BASE}/tv/${id}?api_key=${tmdbApiKey}&language=en-US`;
  return fetchJSON(url);
}

function updateMarkdown(filePath, originalContent, updates) {
  const { data, content: bodyContent } = matter(originalContent);
  Object.assign(data, updates);
  const newContent = matter.stringify(bodyContent, data);
  fs.writeFileSync(filePath, newContent, 'utf8');
}

async function main() {
  const allFiles = getTVshelfFiles();
  console.log(`Found ${allFiles.length} tvshelf entries.`);

  const showMap = new Map();
  for (const file of allFiles) {
    const showTitle = file.data.showTitle ?? file.data.title ?? 'Unknown';
    if (!showMap.has(showTitle)) {
      showMap.set(showTitle, { data: file.data, showTitle, files: [] });
    }
    showMap.get(showTitle).files.push(file);
  }
  console.log(`Found ${showMap.size} unique TV shows.`);

  let toProcess = targetTitle
    ? Array.from(showMap.values()).filter(s => s.showTitle.toLowerCase().includes(targetTitle.toLowerCase()))
    : Array.from(showMap.values());

  if (!force) {
    toProcess = toProcess.filter(s => s.files.some(f => !f.data.genre || !f.data.creator));
  }

  console.log(`Processing ${toProcess.length} show(s).`);

  let updated = 0;
  let notFound = 0;

  for (const show of toProcess) {
    const { showTitle } = show;
    try {
      const result = await searchTVShow(showTitle, show.data.year);
      await sleep(REQUEST_DELAY_MS);
      if (!result) {
        console.log(`⚠️  No TMDB match for "${showTitle}"`);
        notFound++;
        continue;
      }

      const details = await getTVDetails(result.id);
      await sleep(REQUEST_DELAY_MS);

      const genre = details.genres && details.genres.length > 0 ? details.genres[0].name.toLowerCase() : null;
      const creators = (details.created_by || []).map(c => c.name);
      const year = details.first_air_date ? parseInt(details.first_air_date.slice(0, 4), 10) : null;

      let filesUpdated = 0;
      for (const f of show.files) {
        const updates = {};
        if ((force || !f.data.genre) && genre) updates.genre = genre;
        if ((force || !f.data.creator) && creators.length > 0) updates.creator = creators;
        if ((force || !f.data.year) && year) updates.year = year;
        if (Object.keys(updates).length === 0) continue;
        updateMarkdown(f.path, f.content, updates);
        filesUpdated++;
      }

      if (filesUpdated === 0) {
        console.log(`⏭️  ${showTitle} — nothing new from TMDB`);
        continue;
      }
      console.log(`✅ ${showTitle} — genre=${genre ?? '-'} creator=${creators.join(', ') || '-'} year=${year ?? '-'} (${filesUpdated} file(s))`);
      updated += filesUpdated;
    } catch (err) {
      console.error(`❌ Failed for "${showTitle}": ${err.message}`);
    }
  }

  console.log(`\nDone! Updated ${updated} file(s), ${notFound} show(s) not found on TMDB.`);
}

main().catch(console.error);
