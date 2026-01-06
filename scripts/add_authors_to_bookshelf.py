#!/usr/bin/env python3
"""
Add author information to bookshelf posts.
"""

import re
from pathlib import Path

# Author mapping based on series and book titles
AUTHOR_MAP = {
    # Series-based mapping
    'Robot': ['Isaac Asimov'],
    'Foundation': ['Isaac Asimov'],
    'Robert Langdon': ['Dan Brown'],
    'Old Man\'s War': ['John Scalzi'],
    'Space Odyssey': ['Arthur C. Clarke'],
    'The Godfather': ['Mario Puzo'],
    'Kane & Abel': ['Jeffrey Archer'],
    'Hitchhiker\'s Guide to the Galaxy': ['Douglas Adams'],
    'Shiva Trilogy': ['Amish Tripathi'],
    'Ender\'s Saga': ['Orson Scott Card'],

    # Title-based mapping (for books without series)
    'Tuesdays with Morrie': ['Mitch Albom'],
    '"Tuesdays with Morrie"': ['Mitch Albom'],  # With quotes in frontmatter
    'The Da Vinci Code': ['Dan Brown'],
    'Deception Point': ['Dan Brown'],
    'Digital Fortress': ['Dan Brown'],
    'The Chancellor Manuscript': ['Robert Ludlum'],
    'The Ultimate Hitchhiker\'s Guide to the Galaxy': ['Douglas Adams'],
    'The Ultimate Hitchhiker\'s Guide to the Galaxy (Hitchhiker\'s Guide to the Galaxy, #1-5)': ['Douglas Adams'],
    'V for Vendetta': ['Alan Moore', 'David Lloyd'],
    '1984': ['George Orwell'],
    'Animal Farm': ['George Orwell'],
    'The Tipping Point': ['Malcolm Gladwell'],
    'The Tipping Point: How Little Things Can Make a Big Difference': ['Malcolm Gladwell'],
    'Childhood\'s End': ['Arthur C. Clarke'],
    "Childhood's End": ['Arthur C. Clarke'],
    'The Fountainhead': ['Ayn Rand'],
    'To Kill a Mockingbird': ['Harper Lee'],
    'The Prodigal Daughter': ['Jeffrey Archer'],
    'Timequake': ['Kurt Vonnegut'],
    'Mindset': ['Carol S. Dweck'],
    'Mindset: How You Can Fulfil Your Potential': ['Carol S. Dweck'],
    'Myth = Mithya': ['Devdutt Pattanaik'],
    'Myth = Mithya: A Handbook of Hindu Mythology': ['Devdutt Pattanaik'],
    'The Immortals of Meluha': ['Amish Tripathi'],
    'The Secret of the Nagas': ['Amish Tripathi'],
    'The Oath of the Vayuputras': ['Amish Tripathi'],
    'The Zombie Survival Guide': ['Max Brooks'],
    'The Zombie Survival Guide: Complete Protection from the Living Dead': ['Max Brooks'],
    'World War Z': ['Max Brooks'],
    'World War Z: An Oral History of the Zombie War': ['Max Brooks'],
    'Inferno': ['Dan Brown'],
    'And the Mountains Echoed': ['Khaled Hosseini'],
    'Fahrenheit 451': ['Ray Bradbury'],
    'Ender\'s Game': ['Orson Scott Card'],
    'The Stand': ['Stephen King'],
    'Born to Run': ['Christopher McDougall'],
    'The Psychology of Money': ['Morgan Housel'],
    'The Road Less Travelled': ['M. Scott Peck'],
    'A Brief History of Time': ['Stephen Hawking'],
    'One, Two, Three...Infinity': ['George Gamow'],
    'One, Two, Three...Infinity: Facts and Speculations of Science': ['George Gamow'],
}


def extract_frontmatter(content):
    """Extract frontmatter and body from markdown content."""
    match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if match:
        return match.group(1), match.group(2)
    return None, content


def parse_frontmatter(fm_text):
    """Parse frontmatter into a dictionary."""
    fm_dict = {}
    lines = fm_text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()

            # Check if this is a list
            if value == '' and i + 1 < len(lines) and lines[i + 1].strip().startswith('-'):
                # This is a list
                list_items = []
                i += 1
                while i < len(lines) and lines[i].strip().startswith('-'):
                    list_items.append(lines[i].strip()[1:].strip())
                    i += 1
                fm_dict[key] = list_items
                continue
            else:
                # Clean up quoted values
                if value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                fm_dict[key] = value
        i += 1

    return fm_dict


def format_frontmatter(fm_dict):
    """Convert frontmatter dictionary back to YAML text."""
    lines = []
    # Maintain specific order
    ordered_keys = ['title', 'slug', 'pubDate', 'updatedDate', 'category', 'tags',
                    'author', 'series', 'genre', 'format', 'bookStatus',
                    'startedReading', 'finishedReading', 'bookRating']

    for key in ordered_keys:
        if key in fm_dict:
            value = fm_dict[key]
            if isinstance(value, list):
                lines.append(f"{key}:")
                for item in value:
                    lines.append(f"  - {item}")
            else:
                # Quote series names
                if key == 'series':
                    lines.append(f"{key}: '{value}'")
                else:
                    lines.append(f"{key}: {value}")

    return '\n'.join(lines)


def add_author_to_file(filepath):
    """Add author field to a bookshelf post if missing."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    fm_text, body = extract_frontmatter(content)
    if not fm_text:
        print(f"Skipping {filepath.name} - no frontmatter found")
        return False

    fm_dict = parse_frontmatter(fm_text)

    # Skip if author already exists
    if 'author' in fm_dict:
        print(f"Skipping {filepath.name} - author already exists")
        return False

    # Try to find author by series first
    author = None
    if 'series' in fm_dict:
        series_name = fm_dict['series']
        if series_name in AUTHOR_MAP:
            author = AUTHOR_MAP[series_name]

    # If not found by series, try by title
    if not author and 'title' in fm_dict:
        title = fm_dict['title']
        if title in AUTHOR_MAP:
            author = AUTHOR_MAP[title]

    if not author:
        print(f"No author found for {filepath.name} (title: {fm_dict.get('title', 'unknown')})")
        return False

    # Add author field
    fm_dict['author'] = author

    # Reconstruct file
    new_fm_text = format_frontmatter(fm_dict)
    new_content = f"---\n{new_fm_text}\n---\n{body}"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✓ Added {author} to {filepath.name}")
    return True


def main():
    """Main function to update all bookshelf posts."""
    project_root = Path(__file__).parent.parent
    content_dir = project_root / 'src' / 'content'

    # Find all markdown files in year directories
    updated_count = 0
    skipped_count = 0

    for year in ['2013', '2015', '2016', '2020', '2023']:
        year_dir = content_dir / year
        if not year_dir.exists():
            continue

        for md_file in year_dir.glob('*.md'):
            # Skip non-bookshelf posts (basic check)
            with open(md_file, 'r') as f:
                first_lines = f.read(500)
                if 'category: bookshelf' not in first_lines:
                    continue

            if add_author_to_file(md_file):
                updated_count += 1
            else:
                skipped_count += 1

    print(f"\nDone!")
    print(f"Updated: {updated_count} posts")
    print(f"Skipped: {skipped_count} posts")


if __name__ == '__main__':
    main()
