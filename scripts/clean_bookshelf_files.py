#!/usr/bin/env python3
"""
Clean up bookshelf file names and ensure proper title quoting.
- Remove series info from filenames
- Remove special characters like : ; ( ) # from filenames
- Ensure all titles are double-quoted
"""

import re
from pathlib import Path


def clean_filename(filename):
    """Clean filename by removing series info and special characters."""
    # Extract timestamp prefix (YYYYMMDDHHmm)
    match = re.match(r'^(\d{12})\s+(.+)\.md$', filename)
    if not match:
        return filename

    timestamp = match.group(1)
    title_part = match.group(2)

    # Remove series info in parentheses with #
    title_part = re.sub(r'\s*\([^)]*#[^)]*\)', '', title_part)

    # Remove remaining parentheses and content
    # But keep if it's part of the actual title (no series indicator)
    # For safety, only remove if it contains series-like patterns

    # Remove special characters: : ; ( ) # & ' "
    title_part = title_part.replace(':', '')
    title_part = title_part.replace(';', '')
    title_part = title_part.replace('(', '')
    title_part = title_part.replace(')', '')
    title_part = title_part.replace('#', '')
    title_part = title_part.replace('&', 'and')
    title_part = title_part.replace("'", '')
    title_part = title_part.replace('"', '')
    title_part = title_part.replace(',', '')

    # Clean up multiple spaces and trailing/leading spaces
    title_part = re.sub(r'\s+', ' ', title_part).strip()

    return f"{timestamp} {title_part}.md"


def ensure_quoted_title(content):
    """Ensure title in frontmatter is double-quoted."""
    lines = content.split('\n')
    new_lines = []

    for line in lines:
        if line.startswith('title:'):
            # Extract the title value
            title_value = line.split(':', 1)[1].strip()

            # Remove existing quotes
            title_value = title_value.strip('"').strip("'")

            # Add double quotes
            new_lines.append(f'title: "{title_value}"')
        else:
            new_lines.append(line)

    return '\n'.join(new_lines)


def process_file(filepath):
    """Process a single bookshelf file."""
    # Read content
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Ensure title is quoted
    updated_content = ensure_quoted_title(content)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    # Check if filename needs cleaning
    original_name = filepath.name
    clean_name = clean_filename(original_name)

    if clean_name != original_name:
        new_path = filepath.parent / clean_name

        # Check if target already exists
        if new_path.exists():
            print(f"⚠ Skipping {original_name} - target already exists: {clean_name}")
            return False

        filepath.rename(new_path)
        print(f"✓ Renamed: {original_name}")
        print(f"      To: {clean_name}")
        return True
    else:
        print(f"  No rename needed: {original_name}")
        return False


def main():
    """Main function to process all bookshelf posts."""
    project_root = Path(__file__).parent.parent
    content_dir = project_root / 'src' / 'content'

    renamed_count = 0
    processed_count = 0

    for year in ['2013', '2015', '2016', '2020', '2023']:
        year_dir = content_dir / year
        if not year_dir.exists():
            continue

        for md_file in sorted(year_dir.glob('*.md')):
            # Check if it's a bookshelf post
            with open(md_file, 'r') as f:
                first_lines = f.read(500)
                if 'category: bookshelf' not in first_lines:
                    continue

            if process_file(md_file):
                renamed_count += 1
            processed_count += 1

    print(f"\nDone!")
    print(f"Processed: {processed_count} bookshelf posts")
    print(f"Renamed: {renamed_count} files")


if __name__ == '__main__':
    main()
