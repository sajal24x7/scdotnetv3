# Book Cover Downloader

Automatically downloads and manages book covers for your bookshelf.

## Overview

The book cover downloader scans all bookshelf entries (markdown files under
`src/content/bookshelf/` with `category: bookshelf`) and automatically
downloads missing covers, picking the largest/highest-quality image found
across four sources.

This is one of four shelf cover downloaders that share the same GitHub
Actions workflow — see [Related Scripts](#related-scripts) for the
film/TV/game equivalents.

## Features

- ✅ **Automatic Discovery**: Recursively scans `src/content/` for markdown files with `category: bookshelf`
- 🔍 **Four-Source Search**: Queries Bookshop.org, Goodreads, Open Library, and Google Books in parallel, then keeps whichever result downloads as the largest file
- 🎯 **Title/Author Matching**: Scores each candidate result against the book's `title`/`author` (weighted 65/35) and filters out summaries, study guides, and SparkNotes-style results
- 📝 **Auto-Update Frontmatter**: Adds the `cover` field to the markdown file once a cover is saved
- 🎯 **Smart Filename Generation**: Converts book titles to proper filenames (lowercase, hyphens)
- 🔄 **Idempotent**: Skips books that already have a cover file on disk
- 🩹 **Low-Res Replacement**: Optional mode re-downloads covers under 40KB (`--replace-low-res`)
- 📊 **Detailed Reporting**: Shows exactly what was downloaded, skipped, or failed

## Usage

### Automatic Execution via GitHub Actions

The book cover downloader runs as part of the shared `Download Covers`
workflow, which is **manual-dispatch only** (the old daily/weekly schedules
were removed to save Actions minutes — day-to-day covers are fetched by the
push-triggered `enrich-shelf-metadata.yml` workflow instead):
- ✅ Triggered **manually via GitHub Actions UI**, choosing a shelf (`all`/`book`/`film`/`tv`/`game`) and mode (`normal`/`force`/`refresh-low-res`)
- ✅ Downloads missing covers and commits them back to `main`

**Workflow file:** `.github/workflows/download-covers.yml`

### How It Works

1. **You add a new bookshelf entry** — normally via the [Obsidian publishing shortcut](../content/publishing-shortcut.md), which lands the note in `src/content/inbox/` and the publish pipeline sorts it into `src/content/bookshelf/` on `main` (that push triggers `enrich-shelf-metadata.yml`, which fetches the cover for the new entry automatically). For backfills, trigger `Download Covers` manually.
2. **The workflow downloads the missing cover** from whichever of the four sources returns the best match.
3. **The workflow commits the cover image and updated frontmatter (`cover: <filename>.webp`) back to `main`.**
4. **Pull the changes** to get the new cover locally.

This ensures book covers are committed to the repository and available for all builds (including Cloudflare Pages) — the build itself never makes network calls to fetch covers.

### Manual Execution Locally

You can also run it manually locally for testing:

```bash
npm run download-covers                    # normal: skip books that already have a cover
npm run download-covers:force               # re-download every cover
npm run download-covers:refresh-low-res     # replace only covers under 40KB
```

Or invoke the script directly for single-book runs:

```bash
node scripts/download-book-covers.js --book "The Great Mental Models"
```

This will:
1. Scan all bookshelf entries under `src/content/bookshelf/`
2. Check which books are missing a cover file
3. Query Bookshop.org, Goodreads, Open Library, and Google Books in parallel
4. Download every candidate, keep the largest file, and discard the rest
5. Save the cover to `src/images/bookshelf/`
6. Add the `cover` field to the markdown frontmatter if it wasn't already set

**Note:** After running locally, you should commit the downloaded covers and updated files to git.

### Manual GitHub Actions Trigger

You can also trigger the workflow manually from GitHub:
1. Go to **Actions** tab in your repository
2. Select **Download Covers** workflow
3. Click **Run workflow**, choose shelf `book` (or `all`) and a mode
4. Wait for it to complete and commit changes

### When to Run Manually

Run this script manually locally when:
- You're testing cover downloads for new books locally before committing
- You want to see detailed download logs
- You need to download covers immediately without dispatching the workflow

## How It Works

### 1. File Discovery

The script recursively scans `src/content/` looking for markdown files with:
```yaml
---
category: bookshelf
title: "Book Title"
author: "Author Name"
---
```

### 2. Cover Search Strategy

For each book without a resolvable cover file, the script queries all four
sources **in parallel**, downloads every candidate it gets a URL for, and
keeps whichever download is the largest file (a reasonable proxy for image
quality):

- **Bookshop.org** — scrapes the search results page for a product cover image (Open Graph `og:image` or a matching `<img>`)
- **Goodreads** — scrapes search results, scores candidates against the target title/author, then strips the CDN size suffix (e.g. `._SX50_.jpg` → `.jpg`) to get the original full-resolution image
- **Open Library** — `openlibrary.org/search.json`, no API key required
- **Google Books** — `googleapis.com/books/v1/volumes`, no API key required

Across all sources, results whose title matches `summary|study guide|sparknotes|cliffsnotes|gradesaver|analysis|review|synopsis|workbook|companion guide` are filtered out so a study-guide cover doesn't win over the real book. Downloads smaller than 1KB are treated as failed (usually an error page, not a cover).

### 3. Filename Convention

Book titles are converted to filenames using this logic:
```javascript
"The Quick Python Book" → "the-quick-python-book.webp"
"Chambers, Becky - The Galaxy, and the Ground Within" → "the-galaxy-and-the-ground-within.webp"
```

Rules:
- Lowercase
- Spaces → hyphens
- Remove special characters
- Remove `Author Name - ` prefix if present

### 4. Frontmatter Update

If a book doesn't already have a `cover` field, the script adds it once the download succeeds:

**Before:**
```yaml
---
title: "The Quick Python Book"
author: "Naomi Ceder"
category: bookshelf
status: finished
---
```

**After:**
```yaml
---
title: "The Quick Python Book"
author: "Naomi Ceder"
category: bookshelf
status: finished
cover: "the-quick-python-book.webp"
---
```

## Output Example

```
🔍 Scanning for bookshelf entries...

Found 169 bookshelf entries

✅ "Black box thinking" — cover exists (52.3KB): black-box-thinking.webp
📚 Processing: "New Book Title" by Author Name
   🔎 Searching Bookshop.org, Goodreads, Open Library, Google Books in parallel...
   ✓ Found on Goodreads (2 URL candidate(s))
   ✓ Found on Open Library
   ⬇️  Downloading 3 candidate(s) in parallel...
   📊 Goodreads: 84.2KB
   📊 Open Library: 61.0KB
   🏆 Best: Goodreads (84.2KB)
   ✅ Saved as: new-book-title.webp (84.2KB)
   📝 Updated markdown with cover reference

═══════════════════════════════════════
📊 Summary:
   ✅ Downloaded: 1
   ⏭️  Skipped: 168
   ❌ Failed: 0
   📚 Total processed: 169
═══════════════════════════════════════
```

## Configuration

### Directory Structure

The script expects this structure:
```
scdotnetv3/
├── src/
│   ├── content/
│   │   ├── bookshelf/    # Markdown files (category: bookshelf), scanned recursively
│   │   ├── filmshelf/
│   │   └── ...
│   └── images/
│       └── bookshelf/    # Book cover images
└── scripts/
    └── download-book-covers.js
```

### Image Format

- Format: WebP (`.webp`) — the winning source's download (JPEG/PNG/etc.) is converted with `sharp`
- Size: whatever the winning source served (typically 300–900px width; the script always keeps the largest file it downloaded, then converts it)
- Location: `src/images/bookshelf/`

## Troubleshooting

### No cover found for a book

If the script can't find a cover, try:

1. **Check the title and author**: Make sure they're spelled correctly in the markdown frontmatter
2. **Manual search**: Visit [Open Library](https://openlibrary.org/), [Google Books](https://books.google.com/), [Goodreads](https://www.goodreads.com/), or [Bookshop.org](https://bookshop.org/) to verify the book exists
3. **Manual download**: Download the cover manually, place it in `src/images/bookshelf/`, and set the `cover` field in the markdown frontmatter to match the filename

### Rate limiting

Each of the four searches runs in parallel per book, with a 500ms delay
between books. If you have many books, the script may take a few minutes to
complete.

### Permission errors

Make sure the script has write access to:
- `src/images/bookshelf/` (for saving covers)
- `src/content/bookshelf/` (for updating frontmatter)

## Advanced Usage

### Running manually with Node

```bash
node scripts/download-book-covers.js
node scripts/download-book-covers.js --force               # re-download every cover
node scripts/download-book-covers.js --replace-low-res      # replace covers under 40KB
node scripts/download-book-covers.js --book "Some Title"    # only process books whose title matches
```

### Checking what will be downloaded (dry run)

Currently there's no dry-run mode, but the script is safe to run multiple times as it skips books that already have a resolvable cover file (unless `--force` or `--replace-low-res` is passed).

## Integration with Build Process

The book cover downloader runs as a **separate GitHub Actions workflow**, not as part of the build:

### Workflow Triggers

```yaml
on:
  workflow_dispatch:
    inputs:
      shelf: { default: all, options: [all, book, film, game, tv] }
      mode:  { default: normal, options: [normal, force, refresh-low-res] }
```

### Why Separate from Build?

1. **Book covers need to be committed** to the repository for Cloudflare Pages to access them
2. **Avoids network calls during builds** — covers are already in the repo
3. **Faster builds** — downloads happen asynchronously
4. **Better failure handling** — download failures don't break builds

### Workflow Steps

1. Checkout repository
2. Install dependencies (`npm ci`)
3. Run `node scripts/download-book-covers.js` (or `--replace-low-res` in that mode)
4. Run `node scripts/generate-book-covers.js` to regenerate TypeScript imports
5. Commit changes (covers + frontmatter updates), rebasing onto `main` before pushing to avoid racing other automation (syndication, content publishing)

### Rate Limiting Considerations

Each book's four source queries run in parallel with a 500ms pause between books. For large numbers of new books, the workflow may take a few minutes to complete.

## API Sources

### Bookshop.org
- URL: https://bookshop.org/
- No API key required (scrapes search result pages)

### Goodreads
- URL: https://www.goodreads.com/
- No API key required (scrapes search result pages; strips the CDN size suffix for full resolution)

### Open Library
- URL: https://openlibrary.org/
- Docs: https://openlibrary.org/dev/docs/api/covers
- No API key required

### Google Books
- URL: https://developers.google.com/books
- Docs: https://developers.google.com/books/docs/v1/using
- Rate limit: 1000 requests/day (free tier)
- No API key required for basic use

## Related Scripts

- `generate-book-covers.js` — Generates TypeScript imports for book covers (automatically called after download)
- `download-film-covers.js`, `download-tv-covers.js`, `download-game-covers.js` — Same pattern for the other three shelves, run weekly by the same `download-covers.yml` workflow. Film/TV covers use TMDB (`TMDB_API_KEY`), game covers use RAWG and IGDB/Twitch (`RAWG_API_KEY`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`) as additional sources.
- `generate-film-covers.js`, `generate-tv-covers.js`, `generate-game-covers.js` — TypeScript import generators for the other shelves
- `cache-nordletter-images.js` — Caches newsletter images (unrelated, but runs in the same `npm run dev`/`build` pipeline)

## Examples

### Adding a New Book

The normal way to add a book is through the [Obsidian publishing shortcut](../content/publishing-shortcut.md): create a note with `category: bookshelf` and the fields you know (`author`, `status`, `rating`, etc.), and the publish pipeline sorts it into `src/content/bookshelf/` on `main` for you.

If you're adding a file directly instead:

1. Create a new markdown file in `src/content/bookshelf/`:
```markdown
---
title: "New Book Title"
author: "Author Name"
category: bookshelf
status: finished
created: 2026-07-15T10:00:00+03:00
---

Your notes about the book...
```

2. Commit and push to `main`:
```bash
git add .
git commit -m "Add new book: New Book Title"
git push origin main
```

3. **Option A - Let the enrichment workflow handle it** (automatic):
   - The push triggers `enrich-shelf-metadata.yml`, which downloads the
     cover for the new entry and commits it back
   - Pull the changes:
   ```bash
   git pull origin main
   ```

4. **Option B - Trigger Download Covers manually** (bulk/backfill):
   - Go to GitHub → Actions → Download Covers → Run workflow → shelf `book`
   - Wait for completion, then pull:
   ```bash
   git pull origin main
   ```

Your book cover is now in the repository and ready to use!

**Alternative (Manual Local):** Run `npm run download-covers` locally before committing, then commit both the markdown file and the downloaded cover together.

### Bulk Adding Books

If you add multiple books at once:

1. Create all your markdown files under `src/content/bookshelf/`
2. Commit and push to `main`
3. Trigger the `Download Covers` workflow manually (Actions → Download Covers → Run workflow)
4. The workflow processes all missing covers in a single run
5. Pull the changes

Or run `npm run download-covers` locally to download all at once before committing.

## Maintenance

### Updating TypeScript Imports

After downloading covers, the script automatically runs `generate-book-covers.js` to update:
- `src/utils/bookCovers.ts` — TypeScript imports and type definitions

This ensures your Astro components can import and display the new covers.

### Cleaning Up

To remove unused covers:
```bash
# This is manual - no automated script yet
# Check which covers are referenced in markdown
# Remove any orphaned files from src/images/bookshelf/
```

## Future Improvements

Potential enhancements:
- [ ] Dry-run mode to preview what will be downloaded
- [ ] ISBN-based search option
- [ ] Batch mode with progress bar
- [ ] Cleanup orphaned covers
