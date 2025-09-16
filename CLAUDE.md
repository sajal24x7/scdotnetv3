# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website built with **Astro** (v5.12.0) for sajalchoudhary.net. It's a content-driven site with multiple content types organized by year, featuring build-time webmentions, multi-level navigation, and advanced search functionality.

## Common Development Commands

```bash
# Development
npm run dev                     # Start dev server with book cover generation
npm start                       # Alias for npm run dev

# Build & Preview
npm run build                   # Generate covers, fetch webmentions, then build
npm run preview                 # Preview production build

# Utility Scripts
npm run generate-covers         # Generate book covers (scripts/generate-book-covers.js)
npm run fetch-webmentions      # Fetch webmentions from webmention.io
```

## Architecture & Content Organization

### Content Structure
Content is organized by **year directories** under `src/content/` (2012-2025). Each year contains markdown/MDX files with frontmatter for different content categories:

**Content Collections:**
1. Evergreen
2. Blog
3. Micro
4. Photo
5. Nordletter
6. Story
7. Poem
8. Bookshelf
9. Now
10. TIL

There are primarily three types of content on the site: 
1. Garden - Evergreen, TIL, Story, Poem, Bookshelf
2. Stream - Blog, Micro, Photo
3. NordLetter

### Dynamic Collection System
- **Year-based collections**: Content is stored in year folders. The system dynamically discovers year directories and creates collections.
- **Key utility**: `src/utils/content.ts` provides `getYearDirectories()` and `getAllPosts()` functions
- **Important**: Never use constants to get collections; always dynamically read from the content folder

### Navigation System
Multi-level navigation inspired by The Guardian:
- **Primary**: About, Garden, Stream, Nordletter
- **Secondary**: Auto-appears for About/Garden/Stream sections
- **Implementation**: `src/components/navigation/MultiLevelNavigation.astro`

### Search System
- **Client-side search** with relevance scoring
- **Tag syntax**: `tag:ai` for precise filtering
- **Scoring priorities**: Tags (100) > Title (50) > Category (25) > Description (10)
- **Component**: `src/components/SearchModal.astro`

### Webmentions System
Build-time webmention fetching:
- **Fetch script**: `scripts/fetch-webmentions.js`
- **Data storage**: `src/data/webmentions.json`
- **Webhook endpoint**: `src/pages/api/webhook.ts`
- **Component**: `src/components/Webmentions.astro`

## Key Technical Patterns

### Content Schema
Defined in `src/content/config.ts`:
- Unified post schema with category enum
- Optional book-specific metadata
- POSSE syndication support
- Dynamic year collection creation

### Utility Functions
- **Date handling**: Custom date schema accepting Date objects and ISO strings
- **Content utilities**: `getAllPosts()`, `transformPost()`, `extractEditionNumber()`
- **Backlinks**: `src/utils/backlinks.ts`
- **Book covers**: `src/utils/bookCovers.ts`

### Component Architecture
- **Layout wrappers**: ContainerWrapper, GridWrapper, ProseWrapper, PageWrapper
- **Content grids**: ContentGrid, NotesGrid, NordletterGrid, BookGrid
- **Reusable UI**: PostCard, Tag, TagList, CategoryDisplay

## Important Development Notes

### From Cursor Rules
- **Testing**: Delegate testing to user, never run build/test commands automatically
- **Problem-solving**: For substantial features, act as Socratic dialogue partner
- **Implementation plans**: Create detailed plans before coding major features
- **TypeScript**: Use strict types, proper error handling, avoid `any`
- Always create a new feature/bug-fix branch when working on a new feature or bug fix etc.
- Keep commit messages to 20 words or less.

### Content Handling
- Content collections are dynamically created from year directories
- Never hardcode year values; always discover them from the filesystem
- Nordletter posts use special edition number extraction from titles/slugs

### Build Process
The build includes automatic cover generation and webmention fetching:
```json
"build": "npm run generate-covers && npm run fetch-webmentions && astro build || true"
```

## File Locations

- **Content**: `src/content/{year}/*.md`
- **Components**: `src/components/`
- **Utilities**: `src/utils/`
- **Scripts**: `scripts/`
- **Pages**: `src/pages/`
- **Layouts**: `src/layouts/`
- **Styles**: Tailwind CSS with custom config