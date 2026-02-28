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
function downloadImage(url, filepath, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...extraHeaders,
      },
    };

    protocol.get(options, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301 ||
          response.statusCode === 307 || response.statusCode === 308) {
        // Follow redirect, preserving extra headers
        response.resume();
        downloadImage(response.headers.location, filepath, extraHeaders)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
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
            // Extract the first book cover image src from search results.
            // Goodreads search rows use class="bookCover" on the img element.
            const match = html.match(/class="bookCover"[^>]*src="([^"]+)"/);
            if (!match) {
              resolve(null);
              return;
            }

            const rawUrl = match[1];

            // Goodreads CDN URLs embed a size indicator like "._SX98_." or "._SY160_."
            // between the base filename and the extension, e.g.:
            //   .../45154316._SX98_.jpg  →  .../45154316.jpg
            // Removing it gives the full-resolution original (same technique as kepano/bookcover-api).
            const fullResUrl = rawUrl.replace(/_[^_]*_\./g, '.');

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
    const url = `https://openlibrary.org/search.json?q=${query}&limit=1`;

    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.docs && result.docs.length > 0) {
            const book = result.docs[0];
            resolve({
              isbn: book.isbn ? book.isbn[0] : null,
              coverId: book.cover_i,
              title: book.title,
              author: book.author_name ? book.author_name[0] : null
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
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;

    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.items && result.items.length > 0) {
            const book = result.items[0];
            const imageLinks = book.volumeInfo.imageLinks;
            if (imageLinks) {
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
    console.log(`   ✓ Found on Goodreads (full-res)`);
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
