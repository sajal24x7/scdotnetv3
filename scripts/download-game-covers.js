/**
 * Download game cover images from RAWG.io, with IGDB as fallback.
 *
 * Usage:
 *   node scripts/download-game-covers.js [--force] [--title "Hades"]
 *
 * Sources (tried in order):
 *   1. RAWG.io — free tier, no key required (RAWG_API_KEY optional for higher limits)
 *   2. IGDB   — Twitch-powered database; requires TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET
 *              (free at dev.twitch.tv). Used automatically when RAWG has no image.
 *
 * The script:
 *   1. Reads all markdown files with category: gameshelf
 *   2. For each game without a local cover (or --force), searches RAWG then IGDB
 *   3. Downloads the cover to src/images/gameshelf/[slug].jpg
 *   4. Updates the cover field in the markdown frontmatter automatically
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

// Read .env file once for any missing env vars
let envFileContent = '';
try {
  envFileContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
} catch {
  // .env not found — fine
}

function readEnvVar(name) {
  if (process.env[name]) return process.env[name];
  const match = envFileContent.match(new RegExp(`^${name}\\s*=\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
}

const rawgApiKey = readEnvVar('RAWG_API_KEY');
const igdbClientId = readEnvVar('TWITCH_CLIENT_ID');
const igdbClientSecret = readEnvVar('TWITCH_CLIENT_SECRET');

const RAWG_BASE = 'https://api.rawg.io/api';
const IGDB_BASE = 'https://api.igdb.com/v4';
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';

if (!fs.existsSync(gameshelfDir)) {
  fs.mkdirSync(gameshelfDir, { recursive: true });
}

function titleToFilename(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

function postJSON(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(bodyStr),
        'User-Agent': 'scdotnetv3-shelf/1.0',
        ...headers,
      },
    };
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
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

// --- RAWG ---

async function searchGameCoverRawg(title) {
  let url = `${RAWG_BASE}/games?search=${encodeURIComponent(title)}&page_size=1`;
  if (rawgApiKey) url += `&key=${rawgApiKey}`;
  const json = await fetchJSON(url);
  if (!json.results || json.results.length === 0) return null;
  return json.results[0].background_image || null;
}

// --- IGDB ---

async function getIgdbToken() {
  if (!igdbClientId || !igdbClientSecret) return null;
  const url = `${TWITCH_TOKEN_URL}?client_id=${igdbClientId}&client_secret=${igdbClientSecret}&grant_type=client_credentials`;
  const json = await postJSON(url, '');
  return json.access_token || null;
}

async function searchGameCoverIgdb(token, title) {
  if (!token || !igdbClientId) return null;

  const safeTitle = title.replace(/"/g, '');
  const gamesJson = await postJSON(
    `${IGDB_BASE}/games`,
    `fields cover; search "${safeTitle}"; limit 1;`,
    { 'Client-ID': igdbClientId, 'Authorization': `Bearer ${token}` }
  );

  if (!Array.isArray(gamesJson) || gamesJson.length === 0 || !gamesJson[0].cover) return null;

  const coversJson = await postJSON(
    `${IGDB_BASE}/covers`,
    `fields image_id; where id = ${gamesJson[0].cover};`,
    { 'Client-ID': igdbClientId, 'Authorization': `Bearer ${token}` }
  );

  if (!Array.isArray(coversJson) || coversJson.length === 0 || !coversJson[0].image_id) return null;

  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${coversJson[0].image_id}.jpg`;
}

// --- Main ---

async function main() {
  const games = getGameshelfFiles();
  console.log(`Found ${games.length} gameshelf entries.`);

  // Acquire IGDB token once upfront (used as fallback for all games)
  let igdbToken = null;
  if (igdbClientId && igdbClientSecret) {
    try {
      igdbToken = await getIgdbToken();
      if (igdbToken) {
        console.log('IGDB token acquired — available as fallback source.');
      } else {
        console.log('⚠️  IGDB credentials set but token fetch returned no access_token.');
      }
    } catch (err) {
      console.log(`⚠️  IGDB token fetch failed: ${err.message}`);
    }
  }

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
      if (!game.data.cover) {
        updateMarkdownWithCover(game.path, game.content, filename);
        console.log(`📝 ${title} — image exists, updated frontmatter (${filename})`);
      } else {
        console.log(`⏭️  ${title} — already exists (${filename})`);
      }
      continue;
    }

    console.log(`🎮 Searching for cover: ${title}`);
    try {
      let coverUrl = null;
      let source = '';

      console.log(`   🔍 Trying RAWG...`);
      coverUrl = await searchGameCoverRawg(title);
      if (coverUrl) {
        source = 'RAWG';
      }

      if (!coverUrl && igdbToken) {
        console.log(`   🔍 Trying IGDB...`);
        coverUrl = await searchGameCoverIgdb(igdbToken, title);
        if (coverUrl) source = 'IGDB';
      }

      if (!coverUrl) {
        console.log(`   ⚠️  No cover found on RAWG${igdbToken ? ' or IGDB' : ''} for "${title}"`);
        continue;
      }

      console.log(`   ⬇️  Downloading from ${source}: ${coverUrl}`);
      await downloadFile(coverUrl, outputPath);
      const size = fs.statSync(outputPath).size;
      updateMarkdownWithCover(game.path, game.content, filename);
      console.log(`   ✅ Saved: ${filename} (${(size / 1024).toFixed(1)} KB) — frontmatter updated`);
    } catch (err) {
      console.error(`   ❌ Failed for "${title}": ${err.message}`);
    }
  }

  console.log('\nDone! Run "node scripts/generate-game-covers.js" to update gameCovers.ts.');
}

main().catch(console.error);
