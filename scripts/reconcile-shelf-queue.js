/**
 * Delete a shelf's `status: todo` queue stub once the "real" note for the
 * same title arrives from the inbox — the Obsidian-first promotion path.
 * See planning/shelf-queue-design.md §4.
 *
 * Usage:
 *   node scripts/reconcile-shelf-queue.js
 *
 * Wired into content-publish.yml immediately after `sort-inbox`: for every
 * shelf note sort-inbox just moved out of src/content/inbox/ (still
 * untracked at this point in the run — detected via `git ls-files
 * --others`), look for an existing `status: todo` entry in the same
 * category whose normalized title matches (normalized `showTitle`, for
 * TV — the same normalization computeWatchNumbers() uses for rewatch
 * grouping, in src/utils/shelfUtils.ts), or whose main title matches when
 * only one of the two carries a subtitle ("Inside the Box: How Constraints
 * Make Us Better" vs "Inside the Box"). If found, carry the stub's
 * `cover` over to the arriving note (if the arriving note doesn't already
 * have one) and delete the stub — the arriving note is the canonical entry
 * from here on.
 *
 * Matching only ever targets `todo` entries (never started/paused/
 * finished), so a second "Wool" read never deletes the finished first
 * read. Beyond the subtitle rule this is deliberately exact-match only — a
 * title that differs otherwise ("Wool" vs "Wool (Silo, #1)") leaves the
 * stub in place; it's
 * reported as a near-miss so it's easy to spot and remove by hand rather
 * than risking a fuzzy match deleting the wrong note.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, '..');
const contentDir = path.join(repoRoot, 'src', 'content');

const SHELF_CATEGORIES = ['bookshelf', 'filmshelf', 'tvshelf', 'gameshelf'];

// Same normalization computeWatchNumbers() uses in src/utils/shelfUtils.ts,
// so a stub and its promoted note are recognised as the same title.
function normalizeTitle(title) {
  return String(title ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// "Title: Subtitle" → "Title". Only the first colon splits, so a title
// without one is returned whole.
function splitSubtitle(title) {
  const raw = String(title ?? '');
  const i = raw.indexOf(':');
  return i === -1 ? { main: raw, hasSubtitle: false } : { main: raw.slice(0, i), hasSubtitle: true };
}

// Subtitle-tolerant match: same main title, and at most one side has a
// subtitle. Two different subtitles ("Dune: Part One" vs "Dune: Part Two")
// never match.
function mainTitleMatches(a, b) {
  const sa = splitSubtitle(a);
  const sb = splitSubtitle(b);
  if (sa.hasSubtitle && sb.hasSubtitle) return false;
  const key = normalizeTitle(sa.main);
  return key !== '' && key === normalizeTitle(sb.main);
}

function matchTitle(data) {
  return data.category === 'tvshelf' ? (data.showTitle ?? data.title) : data.title;
}

function readPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);
  return { path: filePath, data };
}

function walkCategory(category) {
  const dir = path.join(contentDir, category);
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.md')) {
        try {
          files.push(readPost(fullPath));
        } catch {
          // skip unparsable files
        }
      }
    }
  };
  walk(dir);
  return files;
}

// Newly-arrived shelf notes: files sort-inbox just moved out of
// src/content/inbox/, still untracked in this checkout.
function findArrivedFiles() {
  const dirs = SHELF_CATEGORIES.map(c => path.join('src', 'content', c));
  // -z keeps paths unquoted: `git status --porcelain` wraps any path with a
  // space in quotes, which is every "YYYYMMDDHHMM Title.md" note.
  const output = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z', '--', ...dirs], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  return output
    .split('\0')
    .filter(p => p.endsWith('.md'))
    .map(p => path.join(repoRoot, p));
}

// Similarity score for flagging near-misses only — never used to match (a
// stub is only ever deleted on an exact normalized-title match, above).
// Prefix/substring containment scores high so "Wool" vs "Wool (Silo, #1)"
// gets flagged; otherwise falls back to word overlap.
function similarity(a, b) {
  const aNorm = normalizeTitle(a).replace(/^(a |an |the )/, '');
  const bNorm = normalizeTitle(b).replace(/^(a |an |the )/, '');
  if (!aNorm || !bNorm) return 0;
  if (aNorm === bNorm) return 1;
  if (aNorm.startsWith(bNorm) || bNorm.startsWith(aNorm)) return 0.9;
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return 0.7;
  const aWords = new Set(aNorm.split(' ').filter(Boolean));
  const bWords = bNorm.split(' ').filter(Boolean);
  const overlap = bWords.filter(w => aWords.has(w)).length;
  return overlap / Math.max(aWords.size, bWords.length, 1) * 0.5;
}

function main() {
  let arrived;
  try {
    arrived = findArrivedFiles();
  } catch (err) {
    console.error(`❌ Could not determine newly-arrived shelf notes: ${err.message}`);
    process.exit(1);
  }

  if (arrived.length === 0) {
    console.log('No newly-arrived shelf notes to reconcile.');
    return;
  }

  console.log(`Found ${arrived.length} newly-arrived shelf note(s).`);

  let reconciled = 0;
  const nearMisses = [];

  for (const filePath of arrived) {
    // Already deleted by an earlier iteration this run (it was itself a
    // `todo` stub some other arriving note just matched against).
    if (!fs.existsSync(filePath)) continue;

    let post;
    try {
      post = readPost(filePath);
    } catch (err) {
      console.error(`❌ Failed to read ${filePath}: ${err.message}`);
      continue;
    }

    const { data } = post;
    if (!SHELF_CATEGORIES.includes(data.category) || !data.title) continue;
    // The arriving note is never itself a reconcile target — only a
    // `todo` stub already sitting on the shelf can be deleted.
    if (data.status === 'todo') continue;

    const key = normalizeTitle(matchTitle(data));
    if (!key) continue;

    const stubs = walkCategory(data.category).filter(f => f.data.status === 'todo' && f.path !== filePath);
    let exact = stubs.find(s => normalizeTitle(matchTitle(s.data)) === key);
    if (!exact) {
      // Only take a subtitle match when it's unambiguous.
      const bySubtitle = stubs.filter(s => mainTitleMatches(matchTitle(data), matchTitle(s.data)));
      if (bySubtitle.length === 1) exact = bySubtitle[0];
    }

    if (exact) {
      if (exact.data.cover && !data.cover) {
        const arrivedContent = fs.readFileSync(filePath, 'utf8');
        const parsed = matter(arrivedContent);
        parsed.data.cover = exact.data.cover;
        fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data));
        console.log(`   Carried over cover "${exact.data.cover}" from queue stub to arriving note.`);
      }
      fs.unlinkSync(exact.path);
      console.log(`✅ Reconciled: deleted queue stub "${exact.data.title}" (${path.relative(repoRoot, exact.path)}) — matched arriving note "${data.title}"`);
      reconciled++;
      continue;
    }

    const arrivedTitle = matchTitle(data);
    for (const stub of stubs) {
      const stubTitle = matchTitle(stub.data);
      const score = similarity(arrivedTitle, stubTitle);
      if (score >= 0.5) {
        nearMisses.push({ arrived: arrivedTitle, stub: stubTitle, stubPath: path.relative(repoRoot, stub.path), score });
      }
    }
  }

  console.log(`\nDone! Reconciled ${reconciled} queue stub(s).`);

  if (nearMisses.length > 0) {
    console.log(`\n⚠️  ${nearMisses.length} near-miss pair(s) — titles differ enough that no stub was auto-deleted. Review and remove by hand if these are the same item:`);
    for (const m of nearMisses) {
      console.log(`   "${m.stub}" (${m.stubPath}) vs. arriving "${m.arrived}" (similarity ${(m.score * 100).toFixed(0)}%)`);
    }
  }
}

main();
