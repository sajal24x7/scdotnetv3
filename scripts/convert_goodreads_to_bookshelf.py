#!/usr/bin/env python3
"""
Convert Goodreads export JSON to bookshelf markdown posts.

This script reads the review.json file from src/data and creates bookshelf posts
in the appropriate year folders based on when books were read.
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path


def slugify(text):
    """Convert text to a URL-friendly slug."""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters and replace spaces with hyphens
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    # Remove leading/trailing hyphens
    text = text.strip('-')
    return text


def parse_goodreads_date(date_str):
    """Parse Goodreads date string to ISO format."""
    if date_str == "(not provided)" or not date_str:
        return None
    try:
        # Goodreads format: "2013-01-08 15:13:30 UTC"
        dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S UTC")
        return dt.isoformat() + 'Z'
    except ValueError:
        return None


def get_rating_category(rating):
    """Convert numeric rating to like/love/nope category."""
    if rating == 5:
        return "love"
    elif rating >= 3:
        return "like"
    elif rating > 0:
        return "nope"
    else:
        return None


def extract_author_from_title(title):
    """
    Extract author from book title if present.
    Some Goodreads exports include author in the title.
    """
    # Common patterns: "Title by Author" or just the title
    # For now, we'll return None as Goodreads JSON doesn't include author
    # This can be enhanced later with an author mapping
    return None


def extract_series_info(title):
    """
    Extract series information from book title.
    Pattern: "Book Title (Series Name, #number)" or "Book Title (Series Name #number)"
    """
    # Match patterns like "(Series Name, #1)" or "(Series Name #1)"
    series_pattern = r'\(([^,)]+?)(?:,)?\s*#[\d.]+\)'
    match = re.search(series_pattern, title)

    if match:
        series_name = match.group(1).strip()
        return series_name

    return None


def clean_title(title):
    """
    Remove series information from title to get clean title.
    """
    # Remove series info like "(Series Name, #1)" or "(Series Name #1)"
    clean = re.sub(r'\s*\([^)]*#[\d.]+\)\s*', '', title)
    return clean.strip()


def infer_genre(title, series):
    """
    Infer genre from title or series name.
    This is a basic implementation - can be enhanced with a mapping.
    """
    title_lower = title.lower()
    series_lower = (series or "").lower()

    # Science fiction keywords
    if any(word in title_lower or word in series_lower for word in
           ['robot', 'foundation', 'space', 'galaxy', 'sci-fi', 'odyssey',
            'empire', 'android', 'xenocide', 'ender', 'hyperion', 'mars']):
        return 'sci-fi'

    # Mystery/Thriller
    if any(word in title_lower for word in
           ['murder', 'mystery', 'detective', 'affair', 'manuscript', 'code', 'symbol']):
        return 'mystery'

    # Non-fiction indicators
    if any(word in title_lower for word in
           ['history', 'guide', 'how to', 'psychology', 'mindset', 'tipping point',
            'survival guide', 'philosophy', 'brief history', 'infinity']):
        return 'non-fiction'

    # Fiction default for novels
    if any(word in title_lower for word in
           ['godfather', 'mockingbird', 'fountainhead', 'morrie', 'vendetta',
            'animal farm', '1984', 'fahrenheit', 'kane', 'abel']):
        return 'fiction'

    # Fantasy
    if any(word in title_lower or word in series_lower for word in
           ['shiva', 'nagas', 'meluha', 'vayuputras', 'mythology']):
        return 'fantasy'

    return 'fiction'  # default


def create_bookshelf_post(book, content_dir):
    """Create a bookshelf markdown post from a Goodreads book entry."""

    # Skip books that aren't read
    if book.get('read_status') != 'read':
        return None

    # Get book details
    original_title = book.get('book', 'Untitled')
    rating = book.get('rating', 0)
    review = book.get('review', '(not provided)')
    created_at = book.get('created_at')
    updated_at = book.get('updated_at')

    # Extract metadata from title
    series = extract_series_info(original_title)
    title = clean_title(original_title)
    author = extract_author_from_title(original_title)
    genre = infer_genre(original_title, series)

    # Parse dates
    started_reading = parse_goodreads_date(created_at)
    finished_reading = parse_goodreads_date(updated_at)

    if not started_reading or not finished_reading:
        print(f"Skipping '{title}' - missing date information")
        return None

    # Determine year from finished_reading date
    finished_dt = datetime.fromisoformat(finished_reading.replace('Z', '+00:00'))
    year = finished_dt.year

    # Create year directory if it doesn't exist
    year_dir = content_dir / str(year)
    year_dir.mkdir(exist_ok=True)

    # Create filename with timestamp prefix (using original title with series info)
    timestamp = finished_dt.strftime("%Y%m%d%H%M")
    slug = slugify(title)
    filename = f"{timestamp} {original_title}.md"
    filepath = year_dir / filename

    # Determine body content
    if review and review != "(not provided)":
        body = review.strip()
    else:
        body = "Finished Reading"

    # Determine rating
    book_rating = get_rating_category(rating)
    rating_line = f"bookRating: {book_rating}\n" if book_rating else ""

    # Build optional metadata lines
    author_line = f"author: {author}\n" if author else ""
    series_line = f"series: '{series}'\n" if series else ""
    genre_line = f"genre: {genre}\n" if genre else ""

    # Create frontmatter
    frontmatter = f"""---
title: {title}
slug: {slug}
pubDate: {finished_reading}
updatedDate: {finished_reading}
category: bookshelf
tags:
  - book-reviews
{author_line}{series_line}{genre_line}format: paperback
bookStatus: read
startedReading: {started_reading}
finishedReading: {finished_reading}
{rating_line}---
{body}
"""

    # Write the file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(frontmatter)

    return filepath


def main():
    """Main function to process the Goodreads export."""

    # Get the project root directory (parent of scripts dir)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    # Paths
    json_file = project_root / 'src' / 'data' / 'review.json'
    content_dir = project_root / 'src' / 'content'

    # Check if JSON file exists
    if not json_file.exists():
        print(f"Error: {json_file} not found!")
        return

    # Load the JSON data
    print(f"Reading {json_file}...")
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Skip the first item if it's the explanation
    books = data[1:] if data and isinstance(data[0], dict) and 'explanation' in data[0] else data

    # Process each book
    created_count = 0
    skipped_count = 0

    for book in books:
        if isinstance(book, dict) and 'book' in book:
            result = create_bookshelf_post(book, content_dir)
            if result:
                print(f"Created: {result}")
                created_count += 1
            else:
                skipped_count += 1

    print(f"\nDone!")
    print(f"Created: {created_count} posts")
    print(f"Skipped: {skipped_count} posts")


if __name__ == '__main__':
    main()
