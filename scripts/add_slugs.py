#!/usr/bin/env python3
import os
import re
from pathlib import Path
import unicodedata
import string

def extract_slug_from_filename(filename):
    # Match YYYYMMDDHHMM-<slug>.md pattern
    match = re.match(r'\d{12}-(.+)\.md$', filename)
    if match:
        # Get the slug and remove any trailing dashes
        slug = match.group(1).rstrip('-')
        return slug
    return None

def extract_title_from_frontmatter(content):
    if not content.startswith('---'):
        return None
    parts = content.split('---', 2)
    if len(parts) < 3:
        return None
    front_matter = parts[1]
    for line in front_matter.strip().split('\n'):
        if line.lower().startswith('title:'):
            return line.split(':', 1)[1].strip().strip('"\'')
    return None

def has_nordletter_category(content):
    if not content.startswith('---'):
        return False
    parts = content.split('---', 2)
    if len(parts) < 3:
        return False
    front_matter = parts[1]
    for line in front_matter.strip().split('\n'):
        if line.lower().startswith('category:') and 'nordletter' in line.lower():
            return True
    return False

def slugify(text):
    # Normalize unicode, remove accents
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    # Lowercase
    text = text.lower()
    # Replace spaces and punctuation with dashes
    allowed = string.ascii_lowercase + string.digits + '-'
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text

def add_slug_to_frontmatter(content, slug):
    if not content.startswith('---'):
        return content
    
    # Always quote the slug to ensure it is a string
    slug_str = f'"{slug}"'
    
    # Split content into front matter and body
    parts = content.split('---', 2)
    if len(parts) < 3:
        return content
    
    front_matter = parts[1]
    body = parts[2]
    
    # Split front matter into lines
    lines = front_matter.strip().split('\n')
    
    # Remove any existing slug line
    lines = [line for line in lines if not line.startswith('slug:')]
    
    # Add new slug line
    lines.append(f'slug: {slug_str}')
    
    # Build the new front matter string
    new_front_matter = '\n'.join(lines)
    # Reconstruct the content
    return f"---\n{new_front_matter}\n---{body}"

def process_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        filename = os.path.basename(file_path)
        slug = extract_slug_from_filename(filename)
        needs_update = False
        
        if slug:
            updated_content = add_slug_to_frontmatter(content, slug)
            if updated_content != content:
                needs_update = True
                content = updated_content
        # If not matched by filename, check for nordletter category
        if not slug and has_nordletter_category(content):
            title = extract_title_from_frontmatter(content)
            if title:
                slug = slugify(title)
                updated_content = add_slug_to_frontmatter(content, slug)
                if updated_content != content:
                    needs_update = True
                    content = updated_content
            else:
                print(f"Could not extract title for slug in: {filename}")
        if needs_update:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file_path}")
        elif not slug and not has_nordletter_category(content):
            print(f"Could not extract slug from filename: {filename}")
            
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")

def main():
    content_dir = Path('src/content')
    if not content_dir.exists():
        print(f"Content directory {content_dir} does not exist")
        return
    
    for root, _, files in os.walk(content_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                print(f"Processing {file_path}")
                process_file(file_path)

if __name__ == '__main__':
    main() 