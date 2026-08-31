/**
 * Re-runnable conversion: convert every non-WebP cover image under
 * src/images/{bookshelf,filmshelf,tvshelf,gameshelf} to WebP, then update
 * the `cover:` frontmatter field of any markdown entry that referenced the
 * old filename so it points at the new one.
 *
 * Handy after manually dropping a JPG/PNG cover into one of those folders
 * (e.g. a book the downloader couldn't find) — run this to convert it and
 * fix up the frontmatter reference, same as the automated downloaders do.
 *
 * Usage:
 *   node scripts/convert-covers-to-webp.js                # all 4 shelves
 *   node scripts/convert-covers-to-webp.js --dir <path>    # one folder only
 *
 * --dir accepts an absolute path or one relative to the current working
 * directory. If the folder's basename matches a known shelf
 * (bookshelf/filmshelf/tvshelf/gameshelf), matching content entries under
 * src/content/<shelf>/ still get their `cover:` frontmatter updated;
 * otherwise the images are converted but no frontmatter is touched.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { convertFileToWebp } from './lib/webp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '..', 'src', 'content');
const imagesDir = path.join(__dirname, '..', 'src', 'images');

const SHELVES = ['bookshelf', 'filmshelf', 'tvshelf', 'gameshelf'];

// CLI flags
const args = process.argv.slice(2);
const dirIndex = args.findIndex(a => a === '--dir');
const targetDir = dirIndex !== -1 ? args[dirIndex + 1] : null;

if (dirIndex !== -1 && !targetDir) {
  console.error('❌ --dir requires a folder path, e.g. --dir src/images/bookshelf');
  process.exit(1);
}

function findShelfFiles(dir, category, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findShelfFiles(fullPath, category, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(content);
      if (data.category === category) {
        files.push({ path: fullPath, data, content });
      }
    }
  }
  return files;
}

function updateCoverReference(entry, oldFilename, newFilename) {
  const { data, content: bodyContent } = matter(entry.content);
  data.cover = newFilename;
  fs.writeFileSync(entry.path, matter.stringify(bodyContent, data), 'utf8');
  console.log(`   📝 Updated frontmatter: ${path.basename(entry.path)} (${oldFilename} → ${newFilename})`);
}

async function migrateFolder(imgDir, category, label) {
  if (!fs.existsSync(imgDir)) {
    console.log(`\n=== ${label} ===`);
    console.log(`   ⚠️  Folder does not exist: ${imgDir}`);
    return;
  }

  console.log(`\n=== ${label} ===`);

  // Only match frontmatter against content entries when we know which
  // shelf category this folder belongs to (the default 4 shelves, or a
  // --dir path whose basename happens to match one of them).
  const entries = category ? findShelfFiles(path.join(contentDir, category), category) : [];
  if (!category) {
    console.log(`   ℹ️  Not a recognized shelf folder — converting images only, frontmatter won't be updated`);
  }

  // Map referenced cover filename -> entries that reference it
  const referencedBy = new Map();
  for (const entry of entries) {
    if (entry.data.cover) {
      const list = referencedBy.get(entry.data.cover) ?? [];
      list.push(entry);
      referencedBy.set(entry.data.cover, list);
    }
  }

  const imageFiles = fs.readdirSync(imgDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  // Group by basename (without extension) to detect collisions, e.g.
  // "foo.jpg" and "foo.jpeg" both present on disk.
  const byBasename = new Map();
  for (const file of imageFiles) {
    const base = file.slice(0, file.length - path.extname(file).length);
    const list = byBasename.get(base) ?? [];
    list.push(file);
    byBasename.set(base, list);
  }

  for (const [base, candidates] of byBasename) {
    const webpFilename = `${base}.webp`;
    const webpPath = path.join(imgDir, webpFilename);

    if (fs.existsSync(webpPath)) {
      console.log(`   ⏭️  ${webpFilename} already exists, skipping ${candidates.join(', ')}`);
      continue;
    }

    let toConvert = candidates[0];
    if (candidates.length > 1) {
      // Prefer whichever variant is actually referenced in frontmatter;
      // any other is an orphaned duplicate and gets dropped rather than
      // silently overwriting the converted file.
      const referenced = candidates.find(c => referencedBy.has(c));
      toConvert = referenced ?? candidates[0];
      console.log(`   ⚠️  Multiple files for "${base}": ${candidates.join(', ')} — converting ${toConvert}, discarding the rest`);
      for (const c of candidates) {
        if (c !== toConvert) fs.unlinkSync(path.join(imgDir, c));
      }
    }

    const inputPath = path.join(imgDir, toConvert);
    await convertFileToWebp(inputPath, webpPath);
    fs.unlinkSync(inputPath);
    const size = (fs.statSync(webpPath).size / 1024).toFixed(1);
    console.log(`   ✅ ${toConvert} → ${webpFilename} (${size}KB)`);

    for (const entry of referencedBy.get(toConvert) ?? []) {
      updateCoverReference(entry, toConvert, webpFilename);
    }
  }
}

async function main() {
  if (targetDir) {
    const imgDir = path.resolve(process.cwd(), targetDir);
    const basename = path.basename(imgDir);
    const category = SHELVES.includes(basename) ? basename : null;
    await migrateFolder(imgDir, category, targetDir);
  } else {
    for (const shelf of SHELVES) {
      await migrateFolder(path.join(imagesDir, shelf), shelf, shelf);
    }
  }
  console.log('\nDone! Run "npm run generate-covers" (and the film/tv/game equivalents) to refresh the generated *Covers.ts files.');
}

main().catch(console.error);
