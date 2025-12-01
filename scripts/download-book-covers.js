import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '..', 'src', 'content');
const bookshelfDir = path.join(__dirname, '..', 'src', 'images', 'bookshelf');

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

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadImage(response.headers.location, filepath)
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

// Get cover URL from Google Books
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
              resolve(coverUrl ? coverUrl.replace('http:', 'https:') : null);
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

// Main function
async function main() {
  console.log('🔍 Scanning for bookshelf entries...\n');

  const bookshelfFiles = findBookshelfFiles(contentDir);
  console.log(`Found ${bookshelfFiles.length} bookshelf entries\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

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

    // Check if cover already exists
    if (bookCover && fs.existsSync(path.join(bookshelfDir, bookCover))) {
      console.log(`✅ "${title}" - Cover already exists: ${bookCover}`);
      skipped++;
      continue;
    }

    if (!bookCover && fs.existsSync(coverPath)) {
      console.log(`📝 "${title}" - Cover exists but not referenced in frontmatter, updating...`);
      updateMarkdownWithCover(file.path, file.content, coverFilename);
      skipped++;
      continue;
    }

    console.log(`📚 Processing: "${title}" by ${author || 'Unknown Author'}`);

    try {
      // Try Open Library first
      console.log(`   🔎 Searching Open Library...`);
      const olBook = await searchOpenLibrary(title, author);

      let coverUrl = null;

      if (olBook && olBook.coverId) {
        coverUrl = getOpenLibraryCoverUrl(olBook.coverId);
        console.log(`   ✓ Found on Open Library`);
      }

      // If Open Library fails, try Google Books
      if (!coverUrl) {
        console.log(`   🔎 Searching Google Books...`);
        coverUrl = await searchGoogleBooks(title, author);
        if (coverUrl) {
          console.log(`   ✓ Found on Google Books`);
        }
      }

      if (coverUrl) {
        console.log(`   ⬇️  Downloading cover...`);
        await downloadImage(coverUrl, coverPath);
        console.log(`   ✅ Saved as: ${coverFilename}`);

        // Update markdown file with bookCover reference
        if (!bookCover) {
          updateMarkdownWithCover(file.path, file.content, coverFilename);
          console.log(`   📝 Updated markdown with bookCover reference`);
        }

        downloaded++;
      } else {
        console.log(`   ❌ No cover found`);
        failed++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      failed++;
    }

    console.log('');
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📊 Summary:');
  console.log(`   ✅ Downloaded: ${downloaded}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📚 Total: ${bookshelfFiles.length}`);
  console.log('═══════════════════════════════════════\n');

  if (downloaded > 0) {
    console.log('🔄 Running generate-book-covers.js to update TypeScript imports...\n');
    const { spawn } = await import('child_process');

    return new Promise((resolve) => {
      const child = spawn('node', ['scripts/generate-book-covers.js'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Book covers TypeScript file updated successfully!');
        }
        resolve();
      });
    });
  }
}

// Run the script
main().catch(console.error);
