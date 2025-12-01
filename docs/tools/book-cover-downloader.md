# Book Cover Downloader

Automatically downloads and manages book covers for your bookshelf.

## Overview

The book cover downloader scans all your bookshelf entries (markdown files with `category: bookshelf`) and automatically downloads missing book covers from Open Library and Google Books APIs.

## Features

- ✅ **Automatic Discovery**: Scans all markdown files in `src/content/` for bookshelf entries
- 🔍 **Multi-Source Search**: Searches Open Library first, falls back to Google Books
- 📝 **Auto-Update Frontmatter**: Automatically adds `bookCover` field to markdown files
- 🎯 **Smart Filename Generation**: Converts book titles to proper filenames (lowercase, hyphens)
- 🔄 **Idempotent**: Skips books that already have covers
- 📊 **Detailed Reporting**: Shows exactly what was downloaded, skipped, or failed

## Usage

### Basic Usage

```bash
npm run download-covers
```

This will:
1. Scan all bookshelf entries in `src/content/`
2. Check which books are missing covers
3. Search for covers using Open Library and Google Books APIs
4. Download covers to `src/images/bookshelf/`
5. Update markdown frontmatter with `bookCover` field
6. Regenerate TypeScript imports using `generate-book-covers.js`

### When to Run

Run this script when:
- You add a new bookshelf entry without a cover
- You want to find covers for existing entries that don't have them
- You've manually deleted a cover and want to re-download it

## How It Works

### 1. File Discovery

The script scans all subdirectories in `src/content/` looking for markdown files with:
```yaml
---
category: bookshelf
title: "Book Title"
author: "Author Name"
---
```

### 2. Cover Search Strategy

For each book without a cover:

**Step 1: Open Library**
- Searches Open Library API with title + author
- Uses the highest quality cover available (Large size)
- Free, no API key required

**Step 2: Google Books** (fallback)
- If Open Library doesn't have a cover, tries Google Books API
- Prefers larger images (extraLarge > large > medium > small)
- Free, no API key required

### 3. Filename Convention

Book titles are converted to filenames using this logic:
```javascript
"The Quick Python Book" → "the-quick-python-book.jpg"
"Chambers, Becky - The Galaxy, and the Ground Within" → "the-galaxy-and-the-ground-within.jpg"
```

Rules:
- Lowercase
- Spaces → hyphens
- Remove special characters
- Remove author prefix if present

### 4. Frontmatter Update

If a book doesn't have a `bookCover` field, the script adds it:

**Before:**
```yaml
---
title: "The Quick Python Book"
author: "Naomi Ceder"
category: bookshelf
---
```

**After:**
```yaml
---
title: "The Quick Python Book"
author: "Naomi Ceder"
category: bookshelf
bookCover: "the-quick-python-book.jpg"
---
```

## Output Example

```
🔍 Scanning for bookshelf entries...

Found 32 bookshelf entries

✅ "Black box thinking" - Cover already exists: black-box-thinking.jpg
📚 Processing: "New Book Title" by Author Name
   🔎 Searching Open Library...
   ✓ Found on Open Library
   ⬇️  Downloading cover...
   ✅ Saved as: new-book-title.jpg
   📝 Updated markdown with bookCover reference

═══════════════════════════════════════
📊 Summary:
   ✅ Downloaded: 1
   ⏭️  Skipped: 31
   ❌ Failed: 0
   📚 Total: 32
═══════════════════════════════════════
```

## Configuration

### Directory Structure

The script expects this structure:
```
scdotnetv3/
├── src/
│   ├── content/          # Markdown files
│   │   ├── 2024/
│   │   ├── 2025/
│   │   └── ...
│   └── images/
│       └── bookshelf/    # Book cover images
└── scripts/
    └── download-book-covers.js
```

### Image Format

- Format: JPEG (`.jpg`)
- Size: Large (typically 300-600px width)
- Location: `src/images/bookshelf/`

## Troubleshooting

### No cover found for a book

If the script can't find a cover, try:

1. **Check the title and author**: Make sure they're spelled correctly in the markdown frontmatter
2. **Manual search**: Visit [Open Library](https://openlibrary.org/) or [Google Books](https://books.google.com/) to verify the book exists
3. **Manual download**: Download the cover manually and place it in `src/images/bookshelf/` with the correct filename

### Rate limiting

The script includes a 500ms delay between requests to avoid rate limiting. If you have many books, the script may take a few minutes to complete.

### Permission errors

Make sure the script has write access to:
- `src/images/bookshelf/` (for saving covers)
- `src/content/` (for updating frontmatter)

## Advanced Usage

### Running manually with Node

```bash
node scripts/download-book-covers.js
```

### Checking what will be downloaded (dry run)

Currently there's no dry-run mode, but the script is safe to run multiple times as it skips existing covers.

## Integration with Build Process

The script is **not** automatically run during builds to avoid:
- Network requests during CI/CD
- Potential API rate limits
- Unexpected file changes

Run it manually when needed:
```bash
npm run download-covers
npm run dev
```

## API Sources

### Open Library
- URL: https://openlibrary.org/
- Docs: https://openlibrary.org/dev/docs/api/covers
- Rate limit: Reasonable use (500ms delay between requests)
- No API key required

### Google Books
- URL: https://developers.google.com/books
- Docs: https://developers.google.com/books/docs/v1/using
- Rate limit: 1000 requests/day (free tier)
- No API key required for basic use

## Related Scripts

- `generate-book-covers.js` - Generates TypeScript imports for book covers (automatically called after download)
- `cache-nordletter-images.js` - Caches newsletter images

## Examples

### Adding a New Book

1. Create a new markdown file in `src/content/2025/`:
```markdown
---
title: "New Book Title"
author: "Author Name"
category: bookshelf
bookStatus: "reading"
pubDate: 2025-12-01T10:00:00
---

Your notes about the book...
```

2. Run the downloader:
```bash
npm run download-covers
```

3. The script will:
   - Find the book
   - Download the cover as `new-book-title.jpg`
   - Update the frontmatter to include `bookCover: "new-book-title.jpg"`

### Bulk Adding Books

If you add multiple books at once:

```bash
# Add all your markdown files first
# Then run once to download all covers
npm run download-covers
```

The script processes all missing covers in a single run.

## Maintenance

### Updating TypeScript Imports

After downloading covers, the script automatically runs `generate-book-covers.js` to update:
- `src/utils/bookCovers.ts` - TypeScript imports and type definitions

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
- [ ] Custom API key support for higher rate limits
- [ ] ISBN-based search option
- [ ] Cover quality/size selection
- [ ] Batch mode with progress bar
- [ ] Cleanup orphaned covers
- [ ] Support for other image formats (PNG, WebP)
