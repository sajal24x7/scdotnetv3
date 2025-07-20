# Nordletter Edition Update - Implementation Plan

## Overview
Update all nordletter posts to:
1. Add edition metadata property to frontmatter
2. Remove NL<number> prefix from titles
3. Update slugs to remove nl<number> prefix
4. Display edition information on the nordletter page

## Current Phase: ✅ COMPLETED

## Overall Progress: ✅ COMPLETED

## Tasks

### ✅ P1.1 - Update content utility functions
- **Status**: COMPLETED
- **Files Modified**: `src/utils/content.ts`
- **Changes**: 
  - Added `extractEditionNumber()` function to handle different NL formats
  - Added `cleanNordletterTitle()` function to remove NL prefixes
  - Added `getEditionDisplay()` function to format edition display (e.g., "62 - July 13")
  - Updated Post interface to include `edition` property

### ✅ P1.2 - Update nordletter index page
- **Status**: COMPLETED
- **Files Modified**: `src/pages/nordletter/index.astro`
- **Changes**:
  - Updated to process posts with edition information
  - Added call to `getEditionDisplay()` to generate edition display text
  - Cleaned titles by removing NL prefixes

### ✅ P1.3 - Update NordletterGrid component
- **Status**: COMPLETED
- **Files Modified**: `src/components/NordletterGrid.astro`
- **Changes**:
  - Added edition display below circular image
  - Updated CSS to make font smaller (0.75rem) and light grey (#6b7280)
  - Added dark mode support for edition display

### ✅ P1.4 - Update all nordletter posts
- **Status**: COMPLETED
- **Files Modified**: All nordletter posts in `src/content/2024` and `src/content/2025`
- **Changes**:
  - Added `edition` property to frontmatter for all 54 nordletter posts
  - Removed NL<number> prefix from titles
  - Updated slugs to remove nl<number> prefix
  - Kept filenames unchanged as requested

### ✅ P1.5 - Create and run update scripts
- **Status**: COMPLETED
- **Files Created**: 
  - `scripts/update_nordletter_posts.py` - Main update script
  - `scripts/fix_missing_editions.py` - Script to add missing edition numbers
- **Changes**:
  - Automated the process of updating all nordletter posts
  - Extracted edition numbers from filenames when not in titles
  - Successfully updated all 54 nordletter posts

## Completion Notes

**All tasks completed successfully!** The nordletter page now displays edition information in the format "62 - July 13" below the circular image for each post. The implementation:

- ✅ Extracts edition numbers from post metadata or filenames
- ✅ Displays edition in the requested format without "#" symbol
- ✅ Uses smaller, light grey font as requested
- ✅ Works with both light and dark modes
- ✅ Maintains clean titles without NL prefixes
- ✅ Preserves all existing functionality

**Last Updated**: January 13, 2025 