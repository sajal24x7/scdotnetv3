#!/usr/bin/env python3
import os
import re
from pathlib import Path

def fix_categories(directory):
    # Patterns to match both formats
    patterns = [
        r'category:\s*#nordletter',  # category: #nordletter
        r"category:\s*'#nordletter'",  # category: '#nordletter'
        r'category:\s*"#nordletter"',  # category: "#nordletter"
    ]
    replacement = 'category: nordletter'
    
    # Counter for modified files
    modified_count = 0
    
    # Walk through all directories
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                
                # Read the file content
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if any pattern exists in the file
                modified = False
                for pattern in patterns:
                    if re.search(pattern, content):
                        # Replace the pattern
                        content = re.sub(pattern, replacement, content)
                        modified = True
                
                if modified:
                    # Write the modified content back
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    print(f"Modified: {file_path}")
                    modified_count += 1
    
    print(f"\nTotal files modified: {modified_count}")

if __name__ == "__main__":
    # Get the content directory path
    content_dir = Path(__file__).parent.parent / "src" / "content"
    
    if not content_dir.exists():
        print(f"Error: Content directory not found at {content_dir}")
        exit(1)
    
    print(f"Scanning directory: {content_dir}")
    fix_categories(content_dir) 