/**
 * Download game cover images from RAWG.io.
 *
 * Usage:
 *   node scripts/download-game-covers.js [--force] [--title "Hades"]
 *
 * RAWG has a generous free tier (20,000 requests/month) that works without
 * an API key for basic searches. For higher limits, add RAWG_API_KEY to .env.
 *
 * The script:
 *   1. Reads all markdown files with category: gameshelf
 *   2. For each game without a local cover (or --force), searches RAWG
 *   3. Downloads the background image to src/images/gameshelf/[slug].jpg
 *   4. Updates the gameCover field in the markdown frontmatter automatically
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
const gameshelfDir = path.join(__dirname, '..', 'src', 'images', 'gameshelf');

// CLI flags
const args = process.argv.slice(2);
const forceDownload = args.includes('--force');
const targetTitleIndex = args.findIndex(a => a === '--title');
const targetTitle = targetTitleIndex !== -1 ? args[targetTitleIndex + 1] : null;

// Optional RAWG API key (not required for basic use)
let rawgApiKey = process.env.RAWG_API_KEY;
if (!rawgApiKey) {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
    const match = envFile.match(/^RAWG_API_KEY\s*=\s*(.+)$/m);
    if (match) rawgApiKey = match[1].trim().replace(/^["']|["']$/g, '');
  } catch {
    // .env not found — fine, RAWG works without a key
  }
}

const RAWG_BASE = 'https://api.rawg.io/api';

if (!fs.existsSync(gameshelfDir)) {
  fs.mkdirSync(gameshelfDir, { recursive: true });
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

function getGameshelfFiles() {
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
          if (data.category === 'gameshelf') {
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
  data.gameCover = coverFilename;
  const newContent = matter.stringify(bodyContent, data);
  fs.writeFileSync(filePath, newContent, 'utf8');
}

async function searchGameCover(title) {
  let url = `${RAWG_BASE}/games?search=${encodeURIComponent(title)}&page_size=1`;
  if (rawgApiKey) url += `&key=${rawgApiKey}`;
  const json = await fetchJSON(url);
  if (!json.results || json.results.length === 0) return null;
  const result = json.results[0];
  // RAWG provides background_image as the main cover art
  return result.background_image || null;
}

async function main() {
  const games = getGameshelfFiles();
  console.log(`Found ${games.length} gameshelf entries.`);

  const toProcess = targetTitle
    ? games.filter(g => (g.data.title ?? '').toLowerCase().includes(targetTitle.toLowerCase()))
    : games;

  if (toProcess.length === 0) {
    console.log('No matching games found.');
    return;
  }

  for (const game of toProcess) {
    const title = game.data.title;
    if (!title) {
      console.log(`⚠️  Skipping entry without title: ${game.path}`);
      continue;
    }

    const slug = titleToFilename(title);
    const filename = `${slug}.jpg`;
    const outputPath = path.join(gameshelfDir, filename);

    if (fs.existsSync(outputPath) && !forceDownload) {
      if (!game.data.gameCover) {
        updateMarkdownWithCover(game.path, game.content, filename);
        console.log(`📝 ${title} — image exists, updated frontmatter (${filename})`);
      } else {
        console.log(`⏭️  ${title} — already exists (${filename})`);
      }
      continue;
    }

    console.log(`🎮 Searching RAWG for: ${title}`);
    try {
      const coverUrl = await searchGameCover(title);
      if (!coverUrl) {
        console.log(`   ⚠️  No cover found on RAWG for "${title}"`);
        continue;
      }

      console.log(`   ⬇️  Downloading: ${coverUrl}`);
      await downloadFile(coverUrl, outputPath);
      const size = fs.statSync(outputPath).size;
      updateMarkdownWithCover(game.path, game.content, filename);
      console.log(`   ✅ Saved: ${filename} (${(size / 1024).toFixed(1)} KB) — frontmatter updated`);
    } catch (err) {
      console.error(`   ❌ Failed for "${title}": ${err.message}`);
    }
  }

  console.log('\nDone! Run "node scripts/generate-game-covers.js" to update gameCovers.ts.');
;
}

main().catch(console.error);
