# Book Cover Scripts

This directory contains scripts for managing book covers for the bookshelf feature.

## Scripts

### `download-book-covers.js`

Automatically downloads missing book covers from Open Library and Google Books APIs.

**Automatic Execution:**
Runs automatically during `npm run dev`, `npm run build`, and all build commands.

**Manual Usage:**
```bash
npm run download-covers
```

**What it does:**
1. Scans all bookshelf entries in `src/content/`
2. Identifies books without covers
3. Searches Open Library and Google Books for cover images
4. Downloads covers to `src/images/bookshelf/`
5. Updates markdown frontmatter with `bookCover` field

Note: `generate-book-covers.js` runs after this to update TypeScript imports.

**Example output:**
```
📚 Processing: "New Book" by Author Name
   🔎 Searching Open Library...
   ✓ Found on Open Library
   ⬇️  Downloading cover...
   ✅ Saved as: new-book.jpg
   📝 Updated markdown with bookCover reference
```

### `generate-book-covers.js`

Generates TypeScript imports for all book cover images.

**Usage:**
```bash
npm run generate-covers
```

**What it does:**
1. Scans `src/images/bookshelf/` for image files
2. Generates TypeScript imports in `src/utils/bookCovers.ts`
3. Creates type-safe accessors for book covers

**Note:** This runs automatically in the build chain after `download-book-covers.js`.

## Quick Start

### Add a new book

1. Create markdown file in `src/content/YYYY/`:
```yaml
---
title: "Book Title"
author: "Author Name"
category: bookshelf
bookStatus: "reading"
pubDate: 2025-12-01T10:00:00
---
```

2. Start dev server (covers download automatically):
```bash
npm run dev
```

3. Done! The cover is automatically downloaded and referenced.

**Or run manually:**
```bash
npm run download-covers
npm run generate-covers
```

## File Naming Convention

Book covers are saved with this naming pattern:
- **Input:** "The Quick Python Book" by Naomi Ceder
- **Output:** `the-quick-python-book.jpg`

Rules:
- Lowercase
- Spaces become hyphens
- Special characters removed
- Author prefix removed if present

## Data Sources

- **Primary:** Open Library (https://openlibrary.org/)
- **Fallback:** Google Books API

Both sources are free and don't require API keys for basic use.

## See Also

📖 Full documentation: `/docs/tools/book-cover-downloader.md`
