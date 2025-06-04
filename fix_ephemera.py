import os
import re

# Define your valid categories and some keyword hints for auto-categorization
CATEGORY_HINTS = {
    'poems': ['poem', 'poet', 'verse', 'stanza', 'rhyme'],
    'stories': ['story', 'stories', 'narrative', 'fiction', 'prose'],
    'photo': ['photo', 'image', 'jpg', 'jpeg', 'png', 'gallery'],
    'blog': ['blog', 'post', 'essay', 'thoughts', 'opinion'],
    'micro': ['micro', 'tweet', 'short', 'note'],
    'nordletter': ['nordletter'],
    'books': ['book', 'books', 'novel', 'read'],
    'evergreen': ['evergreen'],
}

def guess_category(content, tags):
    # Check tags first
    for cat, hints in CATEGORY_HINTS.items():
        for hint in hints:
            if hint in tags:
                return cat
    # Check content for hints
    for cat, hints in CATEGORY_HINTS.items():
        for hint in hints:
            if re.search(r'\b' + re.escape(hint) + r'\b', content, re.IGNORECASE):
                return cat
    return 'blog'  # Default fallback

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    if not any('category: ephemera' in line for line in lines):
        return False

    # Extract tags if present
    tags = []
    in_tags = False
    for line in lines:
        if line.strip().startswith('tags:'):
            in_tags = True
            continue
        if in_tags:
            if line.strip().startswith('- '):
                tags.append(line.strip()[2:].lower())
            elif line.strip() == '' or not line.startswith(' '):
                break

    content = ''.join(lines)
    new_category = guess_category(content, tags)

    new_lines = []
    for line in lines:
        if line.strip().startswith('category: ephemera'):
            new_lines.append(f'category: {new_category}\n')
        else:
            new_lines.append(line)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print(f"Fixed {filepath}: category set to '{new_category}'")
    return True

def main():
    root = 'src/content'
    for dirpath, _, filenames in os.walk(root):
        for filename in filenames:
            if filename.endswith('.md'):
                filepath = os.path.join(dirpath, filename)
                fix_file(filepath)

if __name__ == '__main__':
    main() 