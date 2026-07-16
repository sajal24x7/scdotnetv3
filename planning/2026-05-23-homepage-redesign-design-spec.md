# Homepage Redesign — Design Spec

**Date:** 2026-05-23  
**Status:** Approved

## Problem

The current homepage feels like a mish-mash of five independent ideas: a book hero, an about section, a featured grid, a stream list, and a garden grid. Each section was designed separately and uses a different visual language. The individual section pages (Garden, Stream, Nordletter) feel distinct and well-designed; the homepage fails because it tries to replicate all of them at once.

## Design Decision

**Philosophy: Book-led handshake + one Featured section.**

The homepage has one job: introduce Sajal and his work, then hand the visitor off to the right section page. Content-heavy sections (stream, garden) belong on their own pages — the homepage does not need to replicate them.

A single Featured section remains as a curated sampler of the best writing, giving first-time visitors a taste of what to expect without overwhelming the page.

## Page Structure (top to bottom)

### 1. Navigation
Unchanged. Multi-level nav (name + primary links + social icons) stays exactly as-is.

### 2. Book Hero
- Book cover image on the left, prominent
- "Out now" eyebrow label
- Title: *A Year of Mornings*
- Description: the current one-paragraph blurb
- CTAs: "Buy on Amazon" (filled purple) + "Borrow via Helmet" (outlined purple)
- Layout: same two-column grid as current (cover left, content right)

### 3. Identity Section
- Profile photo (circular) on the left — full size, not compressed
- Right side: bio paragraph ("I am a platform engineer and a writer based in Finland…")
- Below bio: NordLetter newsletter signup — label, one-line description, email input + Subscribe button
- Layout and size identical to current About section — generous, not compact

### 4. Content Paths
New section. Four equal-width cards that link to the main content areas:
- 🌱 Garden → `/garden/`
- 🌊 Stream → `/stream/`
- 📚 Shelf → `/shelf/`
- 📬 Nordletter → `/nordletter/`

Simple icon + label, light border, subtle background. These replace the need to scroll through content to find entry points.

### 5. Featured Section
- Heading: "Featured"
- 4-column grid of cards (same count as current: 4 posts, randomly shuffled from the curated `homeFeatured.json` pool)
- **Card style change:** Light editorial cards replace the current dark image-overlay cards
  - Each card has a soft colour band at the top, colour-coded by content type:
    - Poem → pink (`#fce7f3` → `#fbcfe8`)
    - Evergreen → green (`#d1fae5` → `#a7f3d0`)
    - TIL → blue (`#e0f2fe` → `#bae6fd`)
    - Story → purple (`#ede9fe` → `#ddd6fe`)
    - Bookshelf → amber (`#fef3c7` → `#fde68a`)
    - Default → light grey
  - Below the band: content type label (small, uppercase) + post title
  - Light border, white background, subtle box shadow
  - Hover: slight lift + accent border colour (colour matches the top band)

### 6. Footer
Unchanged. Black footer with last-updated date, streak count, total posts, copyright.

## What Is Removed

| Section | Reason |
|---|---|
| Stream section (5 recent posts) | Lives on `/stream/` — homepage doesn't need to replicate it |
| Garden grid (9 cards) | Lives on `/garden/` — homepage doesn't need to replicate it |
| Dark image-overlay Featured cards | Replaced by light editorial cards for visual cohesion |

## Files to Change

### `src/pages/index.astro`
- Remove `streamPosts` data fetching and `StreamList` import
- Remove `gardenPosts` data fetching and `GardenGrid` import
- Remove the Stream section (`home-section--stream`)
- Remove the Garden section (`home-section--garden`)
- Add a Content Paths section between Identity and Featured
- Remove all Stream/Garden-related CSS rules

### `src/components/layout/FeaturedGrid.astro`
- Replace dark overlay card styles with light editorial card styles
- Colour band at top of each card, colour-coded by content type
- White card body with type label + title

### New inline component or CSS (within `index.astro`)
- Content Paths section: four equal-width link cards

## Visual Language

- **Colours:** Unchanged — warm cream background (`#fffcf5`), purple accent (`#8b5cf6`), dark text (`#212121`)
- **Typography:** Unchanged — Inter for body, Merriweather for headings
- **Card colours for Featured:**
  - Poem: pink
  - Evergreen: green  
  - TIL: blue
  - Story: purple
  - Bookshelf: amber
- **Featured card hover:** lift (`translateY(-2px)`) + border in matching content-type colour

## Out of Scope

- Navigation changes
- Footer changes
- Individual section page changes (Garden, Stream, etc.)
- Mobile-specific Featured grid layout (keeps current 1-col → 4-col responsive behaviour)
