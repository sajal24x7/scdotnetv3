import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '..', 'src', 'content');
const bookshelfDir = path.join(__dirname, '..', 'src', 'images', 'bookshelf');

// CLI flags
const args = process.argv.slice(2);
const forceDownload = args.includes('--force');
const replaceLowRes = args.includes('--replace-low-res');
const targetBookIndex = args.findIndex(a => a === '--book');
const targetBook = targetBookIndex !== -1 ? args[targetBookIndex + 1] : null;

// Low-res threshold: files smaller than this are considered low quality
const LOW_RES_THRESHOLD_BYTES = 20 * 1024; // 20 KB

// Ensure bookshelf directory exists
if (!fs.existsSync(bookshelfDir)) {
  console.log('📁 Creating bookshelf directory...');
  fs.mkdirSync(bookshelfDir, { recursive: true });
}

// Convert book title to filename format
function titleToFilename(title, author = '') {
  // Clean the title - remove author name if it's at the start
  let cleanTitle = title;

  // Remove common prefixes like "Author Name - "
  cleanTitle = cleanTitle.replace(/^[^-]+-\s*/, '');

  // Convert to lowercase and replace spaces/special chars with hyphens
  const filename = cleanTitle
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens

  return filename;
}

// Check if an existing cover image is low resolution (small file size)
function isLowRes(filepath) {
  try {
    const stats = fs.statSync(filepath);
    return stats.size < LOW_RES_THRESHOLD_BYTES;
  } catch {
    return false;
  }
}

// Download image from URL, with optional extra request headers (e.g. Referer for Goodreads CDN)
function downloadImage(url, filepath, extraHeaders = {}, _redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const parsedUrl = new URL(url);
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      ...extraHeaders,
    };
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: requestHeaders,
    };

    console.log(`   🌐 [DEBUG] GET ${url}`);
    console.log(`   🌐 [DEBUG] Request headers: ${JSON.stringify(requestHeaders)}`);

    protocol.get(options, (response) => {
      console.log(`   🌐 [DEBUG] Response status: ${response.statusCode}`);
      console.log(`   🌐 [DEBUG] Response headers: ${JSON.stringify(response.headers)}`);

      if (response.statusCode === 302 || response.statusCode === 301 ||
          response.statusCode === 307 || response.statusCode === 308) {
        // Follow redirect, preserving extra headers
        const location = response.headers.location;
        const nextUrl = location.startsWith('http')
          ? location
          : `${parsedUrl.protocol}//${parsedUrl.hostname}${location}`;
        console.log(`   🌐 [DEBUG] Redirect ${response.statusCode} → ${nextUrl}`);
        response.resume();
        downloadImage(nextUrl, filepath, extraHeaders, _redirectCount + 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        // Drain the body so we can log any error message from the server
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
          if (body.length > 0 && body.length < 2000) {
            console.log(`   🌐 [DEBUG] Response body: ${body}`);
          }
          reject(new Error(`Failed to download: ${response.statusCode} from ${url}`));
        });
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if error
        reject(err);
      });
    }).on('error', reject);
  });
}

// Keywords that identify non-original books (summaries, study guides, etc.)
const SUMMARY_KEYWORDS = /\b(summary|summaries|study guide|sparknotes|cliffsnotes|gradesaver|analysis|review|synopsis|workbook|companion guide)\b/i;

// Normalize a title for comparison: lowercase, strip punctuation and articles
function normalizeTitle(s) {
  return s.toLowerCase()
    .replace(/^(a |an |the )/i, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

// Score how well a candidate title matches the target title (0–1, higher is better)
function titleScore(candidateTitle, targetTitle) {
  const cNorm = normalizeTitle(candidateTitle);
  const tNorm = normalizeTitle(targetTitle);
  if (cNorm === tNorm) return 1;
  if (cNorm.startsWith(tNorm) || tNorm.startsWith(cNorm)) return 0.9;
  if (cNorm.includes(tNorm) || tNorm.includes(cNorm)) return 0.7;
  // Word overlap score
  const cWords = new Set(cNorm.split(/\s+/));
  const tWords = tNorm.split(/\s+/);
  const overlap = tWords.filter(w => cWords.has(w)).length;
  return overlap / Math.max(tWords.length, 1) * 0.5;
}

// Combined score weighing title (65%) and author (35%) when author is available
function combinedScore(candidateTitle, candidateAuthor, targetTitle, targetAuthor) {
  const ts = titleScore(candidateTitle, targetTitle);
  if (!targetAuthor || !candidateAuthor) return ts;
  const as = titleScore(candidateAuthor, targetAuthor);
  return ts * 0.65 + as * 0.35;
}

// Search for book cover on Goodreads (scrapes HTML search results)
// Uses the same technique as https://github.com/kepano/bookcover-api:
// strips the Goodreads size indicator (e.g. "._SX98_.") from the CDN URL
// to get the full-resolution original image.
async function searchGoodreads(title, author) {
  return new Promise((resolve) => {
    const query = encodeURIComponent(`${title} ${author || ''}`.trim());

    function makeRequest(urlStr, redirectCount = 0) {
      if (redirectCount > 5) {
        resolve(null);
        return;
      }

      const parsedUrl = new URL(urlStr);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        }
      };

      https.get(options, (response) => {
        // Follow redirects (Cloudflare/Goodreads often redirects before serving content)
        if (response.statusCode === 301 || response.statusCode === 302 ||
            response.statusCode === 307 || response.statusCode === 308) {
          const location = response.headers.location;
          response.resume(); // consume to free socket
          if (!location) { resolve(null); return; }
          const nextUrl = location.startsWith('http')
            ? location
            : `https://${parsedUrl.hostname}${location}`;
          makeRequest(nextUrl, redirectCount + 1);
          return;
        }

        if (response.statusCode !== 200) {
          console.log(`   ⚠️  Goodreads returned HTTP ${response.statusCode}`);
          response.resume();
          resolve(null);
          return;
        }

        // Decompress response if needed (we sent Accept-Encoding, server may compress)
        const encoding = response.headers['content-encoding'];
        let stream = response;
        if (encoding === 'gzip') {
          stream = response.pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
          stream = response.pipe(zlib.createInflate());
        } else if (encoding === 'br') {
          stream = response.pipe(zlib.createBrotliDecompress());
        }

        let html = '';
        stream.on('data', (chunk) => { html += chunk; });
        stream.on('end', () => {
          try {
            // Split the HTML on Goodreads book-result rows (<tr itemscope itemtype="...Book">).
            // Parsing each row segment gives us the full book title and author — not just the
            // img alt, which for summary books often just echoes the original title.
            const bookSplit = html.split(/<tr\b[^>]*\bitemsco\b/i);
            const candidates = [];

            for (let i = 1; i < bookSplit.length; i++) {
              const seg = bookSplit[i];

              // Must contain a bookCover img
              const imgTagMatch = seg.match(/<img\b[^>]+\bclass="bookCover"[^>]*/i);
              if (!imgTagMatch) continue;
              const srcMatch = imgTagMatch[0].match(/\bsrc="([^"]+)"/);
              if (!srcMatch) continue;

              // Full book title: prefer bookTitle anchor span, then itemprop=name, then img alt
              const fullTitleMatch =
                seg.match(/<a\b[^>]*\bbookTitle\b[^>]*>\s*<span[^>]*>\s*([^<]+?)\s*<\/span>/i) ||
                seg.match(/<span\b[^>]*\bitemprop="name"[^>]*>\s*([^<]+?)\s*<\/span>/i);
              const imgLabel = imgTagMatch[0].match(/\b(?:alt|title)="([^"]+)"/);
              const fullTitle = fullTitleMatch
                ? fullTitleMatch[1].trim()
                : (imgLabel ? imgLabel[1] : '');

              // Author: prefer authorName anchor, then itemprop=author
              const authorMatch =
                seg.match(/<a\b[^>]*\bauthorName\b[^>]*>\s*(?:<span[^>]*>)?\s*([^<]+?)\s*(?:<\/span>)?\s*<\/a>/i);
              const fullAuthor = authorMatch ? authorMatch[1].trim() : '';

              candidates.push({ src: srcMatch[1], title: fullTitle, author: fullAuthor });
            }

            if (candidates.length === 0) {
              resolve(null);
              return;
            }

            console.log(`   🌐 [DEBUG] Goodreads found ${candidates.length} candidate(s)`);

            // Filter out summary/study-guide/SparkNotes books by full title
            const genuine = candidates.filter(c => !SUMMARY_KEYWORDS.test(c.title));
            const pool = genuine.length > 0 ? genuine : candidates;

            // Pick the candidate whose title+author best matches our target
            let best = pool[0];
            let bestScore = combinedScore(pool[0].title, pool[0].author, title, author);
            for (const c of pool.slice(1)) {
              const s = combinedScore(c.title, c.author, title, author);
              if (s > bestScore) {
                bestScore = s;
                best = c;
              }
            }

            console.log(`   🌐 [DEBUG] Best match: "${best.title}" by "${best.author}" (score=${bestScore.toFixed(2)}`);
            console.log(`   🌐 [DEBUG] Goodreads raw cover URL: ${best.src}`);

            // Goodreads CDN URLs embed a size indicator like "_SX50_" or "_SY160_"
            // between the base filename and the extension, e.g.:
            //   .../45154316._SX50_.jpg  →  .../45154316._SX300_.jpg
            // Using a larger size indicator gives a high-quality image that the CDN will serve.
            // Stripping the size entirely (e.g. .../45154316.jpg) results in a 403 from CloudFront.
            const fullResUrl = best.src.replace(/_S[XY]\d+_/g, '_SX300_');
            console.log(`   🌐 [DEBUG] Enhanced URL (SX300): ${fullResUrl}`);

            resolve(fullResUrl);
          } catch {
            resolve(null);
          }
        });
        stream.on('error', () => resolve(null));
      }).on('error', () => resolve(null));
    }

    makeRequest(`https://www.goodreads.com/search?q=${query}&search_type=books`);
  });
}

// Search for book on Open Library
async function searchOpenLibrary(title, author) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(`${title} ${author || ''}`.trim());
    const url = `https://openlibrary.org/search.json?q=${query}&limit=10`;

    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.docs && result.docs.length > 0) {
            // Filter out summary/study-guide results, then pick best title match
            const genuine = result.docs.filter(b => !SUMMARY_KEYWORDS.test(b.title || ''));
            const pool = genuine.length > 0 ? genuine : result.docs;

            // Among results with a cover, pick best title match
            const withCover = pool.filter(b => b.cover_i);
            const candidates = withCover.length > 0 ? withCover : pool;

            let best = candidates[0];
            let bestScore = combinedScore(candidates[0].title || '', candidates[0].author_name?.[0] || '', title, author);
            for (const b of candidates.slice(1)) {
              const s = combinedScore(b.title || '', b.author_name?.[0] || '', title, author);
              if (s > bestScore) { bestScore = s; best = b; }
            }

            resolve({
              isbn: best.isbn ? best.isbn[0] : null,
              coverId: best.cover_i,
              title: best.title,
              author: best.author_name ? best.author_name[0] : null
            });
          } else {
            resolve(null);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Get cover URL from Open Library
function getOpenLibraryCoverUrl(coverId, size = 'L') {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

// Search for book cover on Google Books.
// Manipulates the thumbnail URL to remove zoom/curl parameters for a larger image.
async function searchGoogleBooks(title, author) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(`${title} ${author || ''}`.trim());
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`;

    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.items && result.items.length > 0) {
            // Filter out summary/study-guide results, then pick best title match
            const genuine = result.items.filter(b => !SUMMARY_KEYWORDS.test(b.volumeInfo.title || ''));
            const pool = genuine.length > 0 ? genuine : result.items;

            // Among results with an image, pick best title match
            const withImage = pool.filter(b => b.volumeInfo.imageLinks);
            const candidates = withImage.length > 0 ? withImage : pool;

            let best = candidates[0];
            let bestScore = combinedScore(candidates[0].volumeInfo.title || '', candidates[0].volumeInfo.authors?.[0] || '', title, author);
            for (const b of candidates.slice(1)) {
              const s = combinedScore(b.volumeInfo.title || '', b.volumeInfo.authors?.[0] || '', title, author);
              if (s > bestScore) { bestScore = s; best = b; }
            }

            const imageLinks = best.volumeInfo.imageLinks;
            if (!imageLinks) {
              resolve(null);
              return;
            }

            // Prefer larger images
            const coverUrl = imageLinks.extraLarge || imageLinks.large ||
                             imageLinks.medium || imageLinks.small ||
                             imageLinks.thumbnail;
            if (!coverUrl) {
              resolve(null);
              return;
            }
            // Enhance resolution: remove zoom restriction and edge curl artifact
            // e.g. "zoom=1&edge=curl" → higher-res image from Google Books CDN
            const enhancedUrl = coverUrl
              .replace('http:', 'https:')
              .replace(/&zoom=\d+/, '&zoom=0')
              .replace(/&edge=curl/, '');
            resolve(enhancedUrl);
          } else {
            resolve(null);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Find all bookshelf markdown files
function findBookshelfFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findBookshelfFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(content);

        if (data.category === 'bookshelf') {
          files.push({
            path: fullPath,
            data: data,
            content: content
          });
        }
      } catch (err) {
        console.error(`Error reading ${fullPath}:`, err.message);
      }
    }
  }

  return files;
}

// Update markdown file with bookCover field
function updateMarkdownWithCover(filePath, originalContent, coverFilename) {
  const { data, content: bodyContent } = matter(originalContent);

  // Add or update bookCover field
  data.bookCover = coverFilename;

  // Recreate the frontmatter
  const newContent = matter.stringify(bodyContent, data);
  fs.writeFileSync(filePath, newContent, 'utf8');
}

// Try all sources in priority order: Goodreads → Open Library → Google Books
// Returns { url, headers } so callers can supply extra request headers (e.g. Referer for Goodreads CDN).
async function fetchCoverUrl(title, author) {
  // 1. Goodreads (highest quality — full-res via size-suffix removal)
  console.log(`   🔎 Searching Goodreads...`);
  const goodreadsUrl = await searchGoodreads(title, author);
  if (goodreadsUrl) {
    console.log(`   ✓ Found on Goodreads (SX300)`);
    return { url: goodreadsUrl, headers: { 'Referer': 'https://www.goodreads.com/' } };
  }

  // 2. Open Library
  console.log(`   🔎 Searching Open Library...`);
  const olBook = await searchOpenLibrary(title, author);
  if (olBook && olBook.coverId) {
    const olUrl = getOpenLibraryCoverUrl(olBook.coverId);
    console.log(`   ✓ Found on Open Library`);
    return { url: olUrl, headers: {} };
  }

  // 3. Google Books (zoom-enhanced)
  console.log(`   🔎 Searching Google Books...`);
  const gbUrl = await searchGoogleBooks(title, author);
  if (gbUrl) {
    console.log(`   ✓ Found on Google Books (zoom-enhanced)`);
    return { url: gbUrl, headers: {} };
  }

  return null;
}

// Main function
async function main() {
  if (forceDownload) {
    console.log('⚡ Force mode: re-downloading all covers\n');
  } else if (replaceLowRes) {
    console.log(`🔍 Replace low-res mode: replacing covers under ${LOW_RES_THRESHOLD_BYTES / 1024}KB\n`);
  } else if (targetBook) {
    console.log(`🎯 Single book mode: "${targetBook}"\n`);
  }

  console.log('🔍 Scanning for bookshelf entries...\n');

  let bookshelfFiles = findBookshelfFiles(contentDir);
  console.log(`Found ${bookshelfFiles.length} bookshelf entries\n`);

  // Filter to a single book if --book flag is set
  if (targetBook) {
    bookshelfFiles = bookshelfFiles.filter(f =>
      f.data.title && f.data.title.toLowerCase().includes(targetBook.toLowerCase())
    );
    if (bookshelfFiles.length === 0) {
      console.log(`❌ No bookshelf entry found matching: "${targetBook}"`);
      process.exit(1);
    }
    console.log(`🎯 Matched ${bookshelfFiles.length} book(s): ${bookshelfFiles.map(f => f.data.title).join(', ')}\n`);
  }

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let replaced = 0;

  for (const file of bookshelfFiles) {
    const { title, author, bookCover } = file.data;

    if (!title) {
      console.log(`⚠️  Skipping file without title: ${path.basename(file.path)}`);
      skipped++;
      continue;
    }

    // Generate expected filename
    const expectedFilename = titleToFilename(title, author);
    const coverFilename = `${expectedFilename}.jpg`;
    const coverPath = path.join(bookshelfDir, coverFilename);
    const existingCoverPath = bookCover ? path.join(bookshelfDir, bookCover) : null;
    const resolvedCoverPath = existingCoverPath && fs.existsSync(existingCoverPath)
      ? existingCoverPath
      : (fs.existsSync(coverPath) ? coverPath : null);

    // Skip logic (unless a flag overrides it)
    if (!forceDownload && !targetBook) {
      if (resolvedCoverPath) {
        if (replaceLowRes && isLowRes(resolvedCoverPath)) {
          const sizeKb = (fs.statSync(resolvedCoverPath).size / 1024).toFixed(1);
          console.log(`📚 "${title}" — low-res cover (${sizeKb}KB), replacing...`);
          fs.unlinkSync(resolvedCoverPath);
        } else if (!replaceLowRes) {
          const sizeKb = (fs.statSync(resolvedCoverPath).size / 1024).toFixed(1);
          console.log(`✅ "${title}" — cover exists (${sizeKb}KB): ${bookCover || coverFilename}`);
          skipped++;
          continue;
        } else {
          const sizeKb = (fs.statSync(resolvedCoverPath).size / 1024).toFixed(1);
          console.log(`✅ "${title}" — cover is fine (${sizeKb}KB), skipping`);
          skipped++;
          continue;
        }
      } else if (bookCover) {
        // Cover referenced in frontmatter but file missing — re-download
        console.log(`📚 Processing: "${title}" — referenced cover missing, re-downloading...`);
      } else if (fs.existsSync(coverPath)) {
        console.log(`📝 "${title}" — cover exists but not referenced, updating frontmatter...`);
        updateMarkdownWithCover(file.path, file.content, coverFilename);
        skipped++;
        continue;
      }
    } else if (!forceDownload && targetBook && resolvedCoverPath) {
      // --book flag: always re-download the targeted book
      console.log(`🎯 "${title}" — forcing refresh for targeted book`);
      fs.unlinkSync(resolvedCoverPath);
    }

    console.log(`📚 Processing: "${title}" by ${author || 'Unknown Author'}`);

    try {
      const coverResult = await fetchCoverUrl(title, author);

      if (coverResult) {
        const { url: coverUrl, headers: coverHeaders } = coverResult;
        console.log(`   ⬇️  Downloading cover...`);
        await downloadImage(coverUrl, coverPath, coverHeaders);

        const downloadedSizeKb = (fs.statSync(coverPath).size / 1024).toFixed(1);
        console.log(`   ✅ Saved as: ${coverFilename} (${downloadedSizeKb}KB)`);

        if (!bookCover) {
          updateMarkdownWithCover(file.path, file.content, coverFilename);
          console.log(`   📝 Updated markdown with bookCover reference`);
        }

        if (replaceLowRes || (targetBook && resolvedCoverPath)) {
          replaced++;
        } else {
          downloaded++;
        }
      } else {
        console.log(`   ❌ No cover found`);
        failed++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      failed++;
    }

    console.log('');
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📊 Summary:');
  if (replaced > 0) console.log(`   🔄 Replaced (low-res/refresh): ${replaced}`);
  if (downloaded > 0) console.log(`   ✅ Downloaded: ${downloaded}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📚 Total processed: ${bookshelfFiles.length}`);
  console.log('═══════════════════════════════════════\n');

  if (downloaded > 0 || replaced > 0) {
    console.log('💡 Note: New covers downloaded. TypeScript imports will be updated by generate-covers script.\n');
  }
}

// Run the script
main().catch(console.error);
