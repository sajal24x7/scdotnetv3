import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '..', 'src', 'content');
const filmshelfDir = path.join(__dirname, '..', 'src', 'images', 'filmshelf');

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

if (!TMDB_API_KEY) {
  console.error('❌ Error: TMDB_API_KEY environment variable is not set.');
  console.error('');
  console.error('To get a TMDB API key:');
  console.error('1. Create an account at https://www.themoviedb.org/signup');
  console.error('2. Go to Settings > API > Create > Developer');
  console.error('3. Fill out the form and get your API key');
  console.error('4. Set it as an environment variable or GitHub secret');
  console.error('');
  console.error('For local development:');
  console.error('  export TMDB_API_KEY=your_api_key_here');
  console.error('');
  console.error('For GitHub Actions:');
  console.error('  Add TMDB_API_KEY to your repository secrets');
  process.exit(1);
}

// Ensure filmshelf directory exists
if (!fs.existsSync(filmshelfDir)) {
  console.log('📁 Creating filmshelf directory...');
  fs.mkdirSync(filmshelfDir, { recursive: true });
}

// Convert title to filename format
function titleToFilename(title, season = null) {
  let cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens

  if (season !== null && season !== undefined) {
    cleanTitle = `${cleanTitle}-s${season}`;
  }

  return cleanTitle;
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
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

// Make TMDB API request
function tmdbRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;

    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success === false) {
            reject(new Error(result.status_message || 'TMDB API error'));
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Search for a movie on TMDB
async function searchMovie(title) {
  const query = encodeURIComponent(title);
  const result = await tmdbRequest(`/search/movie?query=${query}`);

  if (result.results && result.results.length > 0) {
    const movie = result.results[0];
    return {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      type: 'movie'
    };
  }

  return null;
}

// Search for a TV show on TMDB
async function searchTV(title) {
  const query = encodeURIComponent(title);
  const result = await tmdbRequest(`/search/tv?query=${query}`);

  if (result.results && result.results.length > 0) {
    const show = result.results[0];
    return {
      id: show.id,
      title: show.name,
      posterPath: show.poster_path,
      releaseDate: show.first_air_date,
      type: 'tv'
    };
  }

  return null;
}

// Get TV season details (for season-specific poster)
async function getTVSeasonDetails(showId, seasonNumber) {
  try {
    const result = await tmdbRequest(`/tv/${showId}/season/${seasonNumber}`);
    return {
      posterPath: result.poster_path,
      releaseDate: result.air_date
    };
  } catch (err) {
    return null;
  }
}

// Get poster URL
function getPosterUrl(posterPath) {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}

// Find all film/tv markdown files
function findFilmshelfFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findFilmshelfFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(content);

        if (data.category === 'film' || data.category === 'tv') {
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

// Update markdown file with poster and releaseDate fields
function updateMarkdownWithMetadata(filePath, originalContent, posterFilename, releaseDate) {
  const { data, content: bodyContent } = matter(originalContent);

  // Add or update fields
  if (posterFilename) {
    data.poster = posterFilename;
  }
  if (releaseDate && !data.releaseDate) {
    data.releaseDate = releaseDate;
  }

  // Recreate the frontmatter
  const newContent = matter.stringify(bodyContent, data);
  fs.writeFileSync(filePath, newContent, 'utf8');
}

// Main function
async function main() {
  console.log('🎬 Scanning for film/TV entries...\n');

  const filmshelfFiles = findFilmshelfFiles(contentDir);
  console.log(`Found ${filmshelfFiles.length} film/TV entries\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let metadataUpdated = 0;

  for (const file of filmshelfFiles) {
    const { title, category, poster, season, releaseDate: existingReleaseDate } = file.data;

    if (!title) {
      console.log(`⚠️  Skipping file without title: ${path.basename(file.path)}`);
      skipped++;
      continue;
    }

    const isTV = category === 'tv';

    // Generate expected filename
    const expectedFilename = titleToFilename(title, isTV ? season : null);
    const posterFilename = `${expectedFilename}.jpg`;
    const posterPath = path.join(filmshelfDir, posterFilename);

    // Check if poster already exists
    if (poster && fs.existsSync(path.join(filmshelfDir, poster))) {
      console.log(`✅ "${title}"${isTV && season ? ` S${season}` : ''} - Poster already exists: ${poster}`);
      skipped++;
      continue;
    }

    if (!poster && fs.existsSync(posterPath)) {
      console.log(`📝 "${title}"${isTV && season ? ` S${season}` : ''} - Poster exists but not referenced in frontmatter, updating...`);
      updateMarkdownWithMetadata(file.path, file.content, posterFilename, null);
      skipped++;
      continue;
    }

    console.log(`🎬 Processing: "${title}"${isTV && season ? ` Season ${season}` : ''} (${category})`);

    try {
      let searchResult = null;
      let posterUrl = null;
      let fetchedReleaseDate = null;

      if (isTV) {
        // Search for TV show
        console.log(`   🔎 Searching TMDB for TV show...`);
        searchResult = await searchTV(title);

        if (searchResult) {
          console.log(`   ✓ Found: "${searchResult.title}"`);
          fetchedReleaseDate = searchResult.releaseDate;

          // Try to get season-specific poster
          if (season && searchResult.id) {
            console.log(`   🔎 Looking for Season ${season} poster...`);
            const seasonDetails = await getTVSeasonDetails(searchResult.id, season);
            if (seasonDetails && seasonDetails.posterPath) {
              posterUrl = getPosterUrl(seasonDetails.posterPath);
              if (seasonDetails.releaseDate) {
                fetchedReleaseDate = seasonDetails.releaseDate;
              }
              console.log(`   ✓ Found season poster`);
            } else {
              // Fall back to show poster
              posterUrl = getPosterUrl(searchResult.posterPath);
              console.log(`   ℹ Using show poster (no season poster found)`);
            }
          } else {
            posterUrl = getPosterUrl(searchResult.posterPath);
          }
        }
      } else {
        // Search for movie
        console.log(`   🔎 Searching TMDB for movie...`);
        searchResult = await searchMovie(title);

        if (searchResult) {
          console.log(`   ✓ Found: "${searchResult.title}" (${searchResult.releaseDate?.slice(0, 4) || 'N/A'})`);
          posterUrl = getPosterUrl(searchResult.posterPath);
          fetchedReleaseDate = searchResult.releaseDate;
        }
      }

      if (posterUrl) {
        console.log(`   ⬇️  Downloading poster...`);
        await downloadImage(posterUrl, posterPath);
        console.log(`   ✅ Saved as: ${posterFilename}`);

        // Update markdown file
        const needsReleaseDate = !existingReleaseDate && fetchedReleaseDate;
        updateMarkdownWithMetadata(file.path, file.content, posterFilename, needsReleaseDate ? fetchedReleaseDate : null);
        console.log(`   📝 Updated markdown with poster${needsReleaseDate ? ' and release date' : ''}`);

        downloaded++;
        if (needsReleaseDate) metadataUpdated++;
      } else {
        console.log(`   ❌ No poster found`);
        failed++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));

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
  console.log(`   📅 Release dates added: ${metadataUpdated}`);
  console.log(`   🎬 Total: ${filmshelfFiles.length}`);
  console.log('═══════════════════════════════════════\n');

  if (downloaded > 0) {
    console.log('💡 Note: New posters downloaded. TypeScript imports will be updated by generate-film-posters script.\n');
  }
}

// Run the script
main().catch(console.error);
