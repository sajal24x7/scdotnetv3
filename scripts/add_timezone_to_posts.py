#!/usr/bin/env python3
"""
Script to add Finland timezone information to all blog posts.
Updates pubDate and updatedDate fields in frontmatter to include proper timezone offsets.

Finland uses:
- EET (Eastern European Time) UTC+2 during winter
- EEST (Eastern European Summer Time) UTC+3 during summer
"""

import os
import re
import glob
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple

def get_finland_timezone_offset(dt: datetime) -> str:
    """
    Determine if a given datetime falls in Finland's winter (EET, UTC+2) or summer (EEST, UTC+3) time.
    
    Finland DST rules:
    - Summer time starts: Last Sunday in March at 03:00 EET (becomes 04:00 EEST)
    - Summer time ends: Last Sunday in October at 04:00 EEST (becomes 03:00 EET)
    
    Args:
        dt: datetime object to check
        
    Returns:
        str: "+02:00" for winter time (EET), "+03:00" for summer time (EEST)
    """
    year = dt.year
    
    # Find last Sunday in March
    march_last_day = 31
    while True:
        march_date = datetime(year, 3, march_last_day)
        if march_date.weekday() == 6:  # Sunday is 6
            dst_start = march_date
            break
        march_last_day -= 1
    
    # Find last Sunday in October
    october_last_day = 31
    while True:
        october_date = datetime(year, 10, october_last_day)
        if october_date.weekday() == 6:  # Sunday is 6
            dst_end = october_date
            break
        october_last_day -= 1
    
    # Check if date falls in summer time period
    # Note: We're being conservative and using the date without considering exact time
    # since our post times are likely local times anyway
    if dst_start <= dt.replace(tzinfo=None) < dst_end:
        return "+03:00"  # EEST (summer time)
    else:
        return "+02:00"  # EET (winter time)

def parse_datetime_from_frontmatter(date_str: str) -> Optional[datetime]:
    """
    Parse datetime string from frontmatter.
    Expected format: YYYY-MM-DDTHH:MM:SS
    
    Args:
        date_str: Date string from frontmatter
        
    Returns:
        datetime object or None if parsing fails
    """
    try:
        # Remove any existing timezone info if present
        date_str = re.sub(r'[+-]\d{2}:\d{2}$', '', date_str.strip())
        date_str = re.sub(r'Z$', '', date_str.strip())
        
        return datetime.fromisoformat(date_str)
    except ValueError:
        print(f"Warning: Could not parse date string: {date_str}")
        return None

def update_date_with_timezone(date_str: str) -> str:
    """
    Update date string to include Finland timezone offset.
    
    Args:
        date_str: Original date string
        
    Returns:
        Updated date string with timezone offset
    """
    dt = parse_datetime_from_frontmatter(date_str)
    if not dt:
        return date_str
    
    timezone_offset = get_finland_timezone_offset(dt)
    
    # Return the original date string with timezone offset added
    base_date = re.sub(r'[+-]\d{2}:\d{2}$', '', date_str.strip())
    base_date = re.sub(r'Z$', '', base_date.strip())
    
    return f"{base_date}{timezone_offset}"

def update_post_file(file_path: str) -> bool:
    """
    Update a single post file to include timezone information.
    
    Args:
        file_path: Path to the markdown file
        
    Returns:
        bool: True if file was updated, False otherwise
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Track if any changes were made
        updated = False
        
        # Update pubDate
        pub_date_pattern = r'^pubDate:\s*(.+)$'
        def update_pub_date(match):
            nonlocal updated
            original_date = match.group(1).strip()
            
            # Skip if already has timezone info
            if re.search(r'[+-]\d{2}:\d{2}$', original_date) or original_date.endswith('Z'):
                return match.group(0)
            
            new_date = update_date_with_timezone(original_date)
            updated = True
            return f"pubDate: {new_date}"
        
        content = re.sub(pub_date_pattern, update_pub_date, content, flags=re.MULTILINE)
        
        # Update updatedDate
        updated_date_pattern = r'^updatedDate:\s*(.+)$'
        def update_updated_date(match):
            nonlocal updated
            original_date = match.group(1).strip()
            
            # Skip if already has timezone info
            if re.search(r'[+-]\d{2}:\d{2}$', original_date) or original_date.endswith('Z'):
                return match.group(0)
            
            new_date = update_date_with_timezone(original_date)
            updated = True
            return f"updatedDate: {new_date}"
        
        content = re.sub(updated_date_pattern, update_updated_date, content, flags=re.MULTILINE)
        
        # Write back if changes were made
        if updated:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all posts."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    content_dir = os.path.join(os.path.dirname(script_dir), 'src', 'content')
    
    if not os.path.exists(content_dir):
        print(f"Content directory not found: {content_dir}")
        return
    
    print("🕐 Starting timezone update for all posts...")
    print(f"📂 Processing content directory: {content_dir}")
    
    # Get all year directories
    year_dirs = [d for d in os.listdir(content_dir) 
                 if os.path.isdir(os.path.join(content_dir, d)) and d.isdigit()]
    
    total_files = 0
    updated_files = 0
    
    for year_dir in sorted(year_dirs):
        year_path = os.path.join(content_dir, year_dir)
        print(f"\n📅 Processing year: {year_dir}")
        
        # Find all markdown files in the year directory
        md_files = glob.glob(os.path.join(year_path, "*.md"))
        
        for md_file in md_files:
            total_files += 1
            filename = os.path.basename(md_file)
            
            if update_post_file(md_file):
                updated_files += 1
                print(f"  ✅ Updated: {filename}")
            else:
                print(f"  ⏭️  Skipped: {filename} (no changes needed)")
    
    print(f"\n🎉 Timezone update complete!")
    print(f"📊 Summary:")
    print(f"   • Total files processed: {total_files}")
    print(f"   • Files updated: {updated_files}")
    print(f"   • Files already up-to-date: {total_files - updated_files}")
    
    print(f"\n🇫🇮 All dates now use Finland timezone:")
    print(f"   • Winter (EET): UTC+2 (October-March)")
    print(f"   • Summer (EEST): UTC+3 (March-October)")

if __name__ == "__main__":
    main() 