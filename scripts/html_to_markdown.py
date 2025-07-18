import os
import re
from bs4 import BeautifulSoup
import html2text
from pathlib import Path

def convert_html_to_markdown(content):
    # Create an HTML to Markdown converter
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.ignore_images = False
    h.ignore_emphasis = False
    h.body_width = 0  # Don't wrap text
    
    # Convert HTML to Markdown
    markdown = h.handle(content)
    
    # Clean up any extra newlines
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)
    
    return markdown

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split the frontmatter and content
    parts = content.split('---', 2)
    if len(parts) != 3:
        print(f"Skipping {file_path} - Invalid frontmatter format")
        return
    
    frontmatter = parts[1]
    html_content = parts[2]
    
    # Convert HTML content to Markdown
    markdown_content = convert_html_to_markdown(html_content)
    
    # Reconstruct the file content
    new_content = f"---{frontmatter}---\n\n{markdown_content}"
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def main():
    # Get the content directory path
    content_dir = Path(__file__).parent.parent / 'src' / 'content'
    
    # Process all .md files in the content directory and its subdirectories
    for md_file in content_dir.rglob('*.md'):
        print(f"Processing {md_file}")
        process_file(md_file)

if __name__ == '__main__':
    main() 