#!/usr/bin/env python3
"""
Script to add missing edition numbers to nordletter posts by extracting from filenames
"""

import os
import re
import glob
from pathlib import Path

def extract_edition_from_filename(filename):
    """Extract edition number from filename"""
    # Pattern: "202501120254 NL42 - Ice Ice baby.md"
    match = re.search(r'NL(\d+)', filename)
    if match:
        return int(match.group(1))
    return None

def add_missing_editions():
    """Add missing edition numbers to nordletter posts"""
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
    
    for file_path in nordletter_files:
        filename = file_path.name
        edition_from_filename = extract_edition_from_filename(filename)
        
        if not edition_from_filename:
            print(f"Skipping {filename} - no edition in filename")
            continue
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if edition already exists
        if 'edition:' in content:
            print(f"Skipping {filename} - edition already exists")
            continue
        
        # Extract frontmatter
        frontmatter_match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
        if not frontmatter_match:
            print(f"Warning: No frontmatter found in {filename}")
            continue
        
        frontmatter = frontmatter_match.group(1)
        body = content[frontmatter_match.end():]
        
        # Parse frontmatter
        lines = frontmatter.split('\n')
        updated_lines = []
        
        for line in lines:
            if line.startswith('title:'):
                updated_lines.append(line)
                # Add edition after title
                updated_lines.append(f'edition: {edition_from_filename}')
            else:
                updated_lines.append(line)
        
        # Reconstruct content
        new_frontmatter = '\n'.join(updated_lines)
        new_content = f'---\n{new_frontmatter}\n---\n{body}'
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"Added edition {edition_from_filename} to {filename}")

if __name__ == '__main__':
    add_missing_editions() 