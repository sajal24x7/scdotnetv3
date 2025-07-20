#!/usr/bin/env python3
"""
Script to update all nordletter posts by:
1. Adding edition property to frontmatter
2. Removing NL<number> prefix from titles
3. Updating slugs to remove nl<number> prefix
4. Keeping filenames unchanged
"""

import os
import re
import glob
from pathlib import Path

def extract_edition_number(title, slug):
    """Extract edition number from title or slug"""
    # Try title first - handle different formats:
    # "NL42 - Ice, Ice, baby!"
    # "NL 60 - Trip to NYC III"
    # "NL32"
    patterns = [
        r'^NL\s*(\d+)\s*-\s*',  # NL 60 - or NL60 -
        r'^NL(\d+)\s*-\s*',     # NL60 -
        r'^NL\s*(\d+)$',        # NL 60
        r'^NL(\d+)$',           # NL60
    ]
    
    for pattern in patterns:
        match = re.search(pattern, title, re.IGNORECASE)
        if match:
            return int(match.group(1))
    
    # Try slug (e.g., "nl42-ice-ice-baby")
    match = re.search(r'^nl(\d+)-', slug, re.IGNORECASE)
    if match:
        return int(match.group(1))
    
    return None

def clean_title(title):
    """Remove NL<number> prefix from title"""
    # Handle different formats
    patterns = [
        r'^NL\s*\d+\s*-\s*',  # NL 60 - or NL60 -
        r'^NL\s*\d+\s*$',     # NL 60
        r'^NL\d+\s*$',        # NL60
    ]
    
    for pattern in patterns:
        title = re.sub(pattern, '', title, flags=re.IGNORECASE)
    
    return title.strip()

def clean_slug(slug):
    """Remove nl<number> prefix from slug"""
    return re.sub(r'^nl\d+-', '', slug, flags=re.IGNORECASE)

def update_nordletter_post(file_path):
    """Update a single nordletter post"""
    print(f"Processing: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract frontmatter
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    if not frontmatter_match:
        print(f"  Warning: No frontmatter found in {file_path}")
        return
    
    frontmatter = frontmatter_match.group(1)
    body = content[frontmatter_match.end():]
    
    # Parse frontmatter
    lines = frontmatter.split('\n')
    updated_lines = []
    title = None
    slug = None
    
    for line in lines:
        if line.startswith('title:'):
            title = line.split(':', 1)[1].strip().strip('"\'')
            edition = extract_edition_number(title, slug or '')
            clean_title_text = clean_title(title)
            updated_lines.append(f'title: "{clean_title_text}"')
        elif line.startswith('slug:'):
            slug = line.split(':', 1)[1].strip().strip('"\'')
            clean_slug_text = clean_slug(slug)
            updated_lines.append(f'slug: "{clean_slug_text}"')
        elif line.startswith('edition:'):
            # Skip if already exists
            continue
        else:
            updated_lines.append(line)
    
    # Add edition property after title
    if edition:
        # Find title line and insert edition after it
        for i, line in enumerate(updated_lines):
            if line.startswith('title:'):
                updated_lines.insert(i + 1, f'edition: {edition}')
                break
    
    # Reconstruct content
    new_frontmatter = '\n'.join(updated_lines)
    new_content = f'---\n{new_frontmatter}\n---\n{body}'
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  Updated: {file_path}")
    print(f"    Edition: {edition}")
    print(f"    Title: {clean_title(title)}")
    print(f"    Slug: {clean_slug(slug)}")

def main():
    """Main function to update all nordletter posts"""
    content_dir = Path('src/content')
    
    # Find all nordletter posts
    nordletter_files = []
    for year_dir in content_dir.iterdir():
        if year_dir.is_dir() and year_dir.name.isdigit():
            for file_path in year_dir.glob('*.md'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'category: nordletter' in content:
                        nordletter_files.append(file_path)
    
    print(f"Found {len(nordletter_files)} nordletter posts")
    
    # Update each post
    for file_path in nordletter_files:
        update_nordletter_post(file_path)
    
    print(f"\nUpdated {len(nordletter_files)} nordletter posts")

if __name__ == '__main__':
    main() 