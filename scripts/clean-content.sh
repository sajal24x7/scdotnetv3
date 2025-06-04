#!/bin/bash

# Directory containing the content
CONTENT_DIR="src/content"

# Function to clean a year directory while preserving sample files
clean_year_dir() {
    local year_dir="$1"
    echo "Cleaning $year_dir..."
    
    # First, list all files that will be deleted
    echo "Files to be deleted in $year_dir:"
    find "$CONTENT_DIR/$year_dir" -type f -name "*.md" ! -name "sample-*.md" -ls
    
    # Then delete them
    find "$CONTENT_DIR/$year_dir" -type f -name "*.md" ! -name "sample-*.md" -delete
}

# Get all year directories
for year_dir in $(find "$CONTENT_DIR" -maxdepth 1 -type d -name "20[0-9][0-9]"); do
    year=$(basename "$year_dir")
    clean_year_dir "$year"
done

echo "Content cleanup complete. Sample files have been preserved." 