#!/usr/bin/env node
/**
 * migrate-to-categories.mjs
 *
 * One-time migration script that moves all markdown files from the old
 * year-based folder structure (src/content/2025/note.md) to the new
 * flat category-based structure (src/content/til/note.md).
 *
 * Each file's `category` frontmatter field determines the destination folder.
 * Files with missing or unknown categories are moved to src/content/inbox/
 * so nothing is silently lost.
 *
 * Usage:
 *   node scripts/migrate-to-categories.mjs          # dry run (no changes)
 *   node scripts/migrate-to-categories.mjs --apply  # apply changes
 */

import { readdir, readFile, rename, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const APPLY = process.argv.includes('--apply');
const CONTENT_DIR = join(process.cwd(), 'src', 'content');

const KNOWN_CATEGORIES = new Set([
  'til', 'blog', 'micro', 'photo', 'nordletter',
  'story', 'poem', 'bookshelf', 'filmshelf', 'tvshelf',
  'gameshelf', 'now', 'colophon', 'evergreen',
]);

// Extract the value of a frontmatter field from raw file content.
function extractFrontmatterField(content, field) {
  const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

// Returns true if the directory name looks like a year (4 digits).
function isYearDir(name) {
  return /^\d{4}$/.test(name);
}

async function run() {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true });
  const yearDirs = entries
    .filter(e => e.isDirectory() && isYearDir(e.name))
    .map(e => e.name)
    .sort();

  if (yearDirs.length === 0) {
    console.log('No year directories found — nothing to migrate.');
    return;
  }

  console.log(`Found year directories: ${yearDirs.join(', ')}`);
  if (!APPLY) {
    console.log('\nDRY RUN — pass --apply to move files.\n');
  }

  const stats = { moved: 0, inbox: 0, skipped: 0, errors: 0 };

  for (const year of yearDirs) {
    const yearDir = join(CONTENT_DIR, year);
    let files;
    try {
      files = await readdir(yearDir);
    } catch {
      continue;
    }

    for (const file of files) {
      if (extname(file) !== '.md') continue;

      const src = join(yearDir, file);
      let raw;
      try {
        raw = await readFile(src, 'utf-8');
      } catch (err) {
        console.error(`  ERROR reading ${year}/${file}: ${err.message}`);
        stats.errors++;
        continue;
      }

      const category = extractFrontmatterField(raw, 'category');
      const dest_dir = KNOWN_CATEGORIES.has(category) ? category : 'inbox';
      const dest = join(CONTENT_DIR, dest_dir, file);

      if (!KNOWN_CATEGORIES.has(category)) {
        const reason = category ? `unknown category "${category}"` : 'no category field';
        console.log(`  INBOX  ${year}/${file}  (${reason})`);
        stats.inbox++;
      } else {
        console.log(`  MOVE   ${year}/${file}  →  ${dest_dir}/${file}`);
        stats.moved++;
      }

      if (APPLY) {
        try {
          await mkdir(join(CONTENT_DIR, dest_dir), { recursive: true });
          await rename(src, dest);
        } catch (err) {
          console.error(`  ERROR moving ${year}/${file}: ${err.message}`);
          stats.errors++;
        }
      }
    }
  }

  console.log(`\nSummary:`);
  console.log(`  To move to category folders : ${stats.moved}`);
  console.log(`  To move to inbox/           : ${stats.inbox}`);
  console.log(`  Errors                      : ${stats.errors}`);
  if (!APPLY) {
    console.log('\nRe-run with --apply to perform the migration.');
  } else {
    console.log('\nMigration complete. Year folders are now empty — remove them manually after verifying the build.');
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
