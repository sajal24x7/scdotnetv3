/**
 * Enrich gameshelf entries with developer, genre, year, and platform from
 * RAWG.io, with IGDB as fallback.
 *
 * Usage:
 *   node scripts/enrich-game-metadata.js [--force] [--title "Hades"]
 *
 * Requirements:
 *   RAWG_API_KEY is optional (RAWG's free tier works keyless, at a lower
 *   rate limit). TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET are optional and
 *   enable the IGDB fallback for titles RAWG can't match — same credentials
 *   the game cover downloader uses.
 *
 * The script:
 *   1. Reads all markdown files with category: gameshelf
 *   2. For each game missing developer/genre/year/platform (or --force),
 *      searches RAWG's game details endpoint, then IGDB if RAWG has nothing
 *   3. Updates the frontmatter — never touches fields that already have a
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

function postText(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
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
    const req = https.request(options, (res) => {
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

// --- RAWG ---

async function searchGameRawg(title) {
  let url = `${RAWG_BASE}/games?search=${encodeURIComponent(title)}&page_size=1`;
  if (rawgApiKey) url += `&key=${rawgApiKey}`;
  const json = await fetchJSON(url);
  if (!json.results || json.results.length === 0) return null;
  return json.results[0];
}

async function getGameDetailsRawg(id) {
  let url = `${RAWG_BASE}/games/${id}`;
  if (rawgApiKey) url += `?key=${rawgApiKey}`;
  return fetchJSON(url);
}

async function fetchFromRawg(title) {
  const result = await searchGameRawg(title);
  if (!result) return null;
  const details = await getGameDetailsRawg(result.id);
  return {
    developer: details.developers && details.developers.length > 0 ? details.developers[0].name : null,
    genre: details.genres && details.genres.length > 0 ? details.genres[0].name.toLowerCase() : null,
    year: details.released ? parseInt(details.released.slice(0, 4), 10) : null,
    platform: details.platforms && details.platforms.length > 0 ? details.platforms[0].platform.name : null,
  };
}

// --- IGDB ---

async function getIgdbToken() {
  if (!igdbClientId || !igdbClientSecret) return null;
  const url = `${TWITCH_TOKEN_URL}?client_id=${igdbClientId}&client_secret=${igdbClientSecret}&grant_type=client_credentials`;
  const json = await postText(url, '');
  return json.access_token || null;
}

async function fetchFromIgdb(token, title) {
  if (!token || !igdbClientId) return null;

  const safeTitle = title.replace(/"/g, '');
  const games = await postText(
    `${IGDB_BASE}/games`,
    `fields name, first_release_date, genres.name, involved_companies.company.name, involved_companies.developer, platforms.name; search "${safeTitle}"; limit 1;`,
    { 'Client-ID': igdbClientId, 'Authorization': `Bearer ${token}` }
  );
  if (!Array.isArray(games) || games.length === 0) return null;
  const game = games[0];

  const developerCompany = (game.involved_companies || []).find(c => c.developer);
  const developer = developerCompany?.company?.name || null;
  const genre = game.genres && game.genres.length > 0 ? game.genres[0].name.toLowerCase() : null;
  const year = game.first_release_date ? new Date(game.first_release_date * 1000).getUTCFullYear() : null;
  const platform = game.platforms && game.platforms.length > 0 ? game.platforms[0].name : null;

  return { developer, genre, year, platform };
}

function updateMarkdown(filePath, originalContent, updates) {
  const { data, content: bodyContent } = matter(originalContent);
  Object.assign(data, updates);
  const newContent = matter.stringify(bodyContent, data);
  fs.writeFileSync(filePath, newContent, 'utf8');
}

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

  let toProcess = targetTitle
    ? games.filter(g => (g.data.title ?? '').toLowerCase().includes(targetTitle.toLowerCase()))
    : games;

  if (!force) {
    toProcess = toProcess.filter(g => !g.data.developer || !g.data.genre || !g.data.year || !g.data.platform);
  }

  console.log(`Processing ${toProcess.length} game(s).`);

  let updated = 0;
  let notFound = 0;

  for (const game of toProcess) {
    const title = game.data.title;
    if (!title) {
      console.log(`⚠️  Skipping entry without title: ${game.path}`);
      continue;
    }

    try {
      let result = await fetchFromRawg(title).catch(() => null);
      await sleep(REQUEST_DELAY_MS);
      let source = result ? 'RAWG' : null;

      if ((!result || Object.values(result).every(v => !v)) && igdbToken) {
        result = await fetchFromIgdb(igdbToken, title).catch(() => null);
        source = result ? 'IGDB' : null;
        await sleep(REQUEST_DELAY_MS);
      }

      if (!result) {
        console.log(`⚠️  No match for "${title}" on RAWG${igdbToken ? ' or IGDB' : ''}`);
        notFound++;
        continue;
      }

      const updates = {};
      if ((force || !game.data.developer) && result.developer) updates.developer = result.developer;
      if ((force || !game.data.genre) && result.genre) updates.genre = result.genre;
      if ((force || !game.data.year) && result.year) updates.year = result.year;
      if ((force || !game.data.platform) && result.platform) updates.platform = result.platform;

      if (Object.keys(updates).length === 0) {
        console.log(`⏭️  ${title} — nothing new from ${source}`);
        continue;
      }

      updateMarkdown(game.path, game.content, updates);
      console.log(`✅ ${title} (${source}) — ${JSON.stringify(updates)}`);
      updated++;
    } catch (err) {
      console.error(`❌ Failed for "${title}": ${err.message}`);
    }
  }

  console.log(`\nDone! Updated ${updated} game(s), ${notFound} not found.`);
}

main().catch(console.error);
