# Goodreads to Bookshelf Converter

This script converts a Goodreads export JSON file to bookshelf markdown posts.

## Usage

```bash
python3 scripts/convert_goodreads_to_bookshelf.py
```

## What it does

1. Reads the `src/data/review.json` file (Goodreads export)
2. Processes each book entry with `read_status: "read"`
3. Creates a markdown file in the appropriate year folder based on the `finishedReading` date
4. Generates proper frontmatter with:
   - Title and slug from the book title (cleaned of series info)
   - Series information extracted from title patterns like "(Series Name, #1)"
   - Genre auto-detected from title/series keywords
   - Format set to "paperback" by default
   - Timestamps from Goodreads `created_at` (startedReading) and `updated_at` (finishedReading)
   - Rating converted to `like`/`love`/`nope` categories:
     - 5 stars → `love`
     - 3-4 stars → `like`
     - 1-2 stars → `nope`
   - Review text as the body (or "Finished Reading" if no review)

## Features

- **Automatic year folders**: Creates year directories if they don't exist
- **Series extraction**: Automatically extracts series name from patterns like "(Series Name, #1)"
- **Genre detection**: Intelligently detects genre based on keywords in title/series:
  - sci-fi (robot, foundation, space, galaxy, etc.)
  - mystery (murder, detective, code, symbol, etc.)
  - non-fiction (history, guide, psychology, etc.)
  - fantasy (mythology, shiva, nagas, etc.)
  - fiction (default)
- **Slug generation**: Converts book titles to URL-friendly slugs
- **Smart review handling**: Treats "(not provided)" as empty reviews
- **Skips incomplete data**: Only processes books with valid read status and dates
- **No syndication**: Creates files only, doesn't post to social media

## Output format

Files are created with the naming pattern:
```
YYYYMMDDHHmm Title.md
```

Example: `201301160733 Tuesdays with Morrie: An Old Man, a Young Man, and Life's Greatest Lesson.md`

## Frontmatter structure

```yaml
---
title: The Da Vinci Code
slug: the-da-vinci-code
pubDate: 2013-01-08T15:14:52Z
updatedDate: 2013-01-08T15:14:52Z
category: bookshelf
tags:
  - book-reviews
series: 'Robert Langdon'
genre: mystery
format: paperback
bookStatus: read
startedReading: 2013-01-08T15:14:45Z
finishedReading: 2013-01-08T15:14:52Z
bookRating: like
---
Book review text here (or "Finished Reading")
```

**Note**: The `series`, `author`, and `genre` fields are optional and only appear when detected.

## Notes

- Books with `read_status: "to-read"` or `"currently-reading"` are skipped
- Books without valid dates are skipped
- The script is idempotent - running it multiple times will overwrite existing files
