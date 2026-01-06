#!/usr/bin/env python3
"""Rename files with special characters to use standard ASCII."""

import os
from pathlib import Path

content_dir = Path('/Users/sajal/Desktop/scdotnetv3/src/content')

# Characters to replace (using unicode codes to avoid issues)
replacements = {
    '\u2019': "'",  # Curly apostrophe to straight
    '\u201c': '"',  # Curly quote to straight
    '\u201d': '"',  # Curly quote to straight
}

renamed_count = 0

for year in ['2013', '2015', '2016', '2020', '2023']:
    year_dir = content_dir / year
    if not year_dir.exists():
        continue

    for filepath in year_dir.glob('*.md'):
        original_name = filepath.name
        new_name = original_name

        # Replace special characters
        for old_char, new_char in replacements.items():
            new_name = new_name.replace(old_char, new_char)

        if new_name != original_name:
            new_path = filepath.parent / new_name
            filepath.rename(new_path)
            print(f"Renamed: {original_name}")
            print(f"     To: {new_name}")
            renamed_count += 1

print(f"\nTotal files renamed: {renamed_count}")
