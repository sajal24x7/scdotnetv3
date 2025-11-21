# Books Page

The Books page (`/books/`) showcases the author's published works with a specialized grid layout that mirrors the visual rhythm of the Bookshelf page while serving a distinct purpose.

## Purpose

This page displays books **authored** by Sajal Choudhary, distinguishing them from the Bookshelf page which tracks books the author is reading or has read. The separation maintains a clear boundary between creative output and consumption.

## Layout Structure

### Grid Architecture

The Books page uses a nested grid system optimized for asymmetric content display:

**Outer Grid (12 columns)**
- Each book item is wrapped in a `.twelve-grid` container
- Content is positioned in a 10-column span starting at column 2 (`.grid-span-10 .grid-start-2`)
- This centering creates breathing room on both edges

**Inner Grid (10 columns)**
- Inside the content wrapper, a `.ten-grid` establishes a nested 10-column layout
- The inner grid divides into three semantic zones:
  1. **Year** (columns 1-2): Publication year with sticky positioning
  2. **Cover** (columns 3-4): Book cover image
  3. **Details** (columns 5-10): Title, subtitle, and description

### Responsive Behavior

- **Mobile (<48rem)**: The ten-grid collapses to a single-column stack with year, cover, and details flowing vertically
- **Desktop (≥48rem)**: The ten-grid expands to its full 10-column layout with sticky year positioning
- The year sidebar uses `position: sticky` to remain visible during scrolling on larger screens

## Component Breakdown

### Book Item Structure

```astro
<article class="books-item twelve-grid grid-gap-tight">
  <div class="books-item__content grid-span-10 grid-start-2">
    <div class="books-item__inner ten-grid grid-gap-normal">
      <div class="books-item__year grid-span-2 grid-start-1">
        <!-- Year with sticky behavior -->
      </div>
      <div class="books-item__cover grid-span-2 grid-start-3">
        <!-- Book cover image -->
      </div>
      <div class="books-item__details grid-span-6 grid-start-5">
        <!-- Title, subtitle, description -->
      </div>
    </div>
  </div>
</article>
```

### Navigation Section

After the book listings, a centered navigation element provides contextual wayfinding:

```astro
<nav class="books-explore twelve-grid grid-gap-tight">
  <div class="books-explore__content grid-span-10 grid-start-2">
    <p class="books-explore__text">
      <a href="/garden/">Roam the garden</a>,
      <a href="/stream/">dip into the stream</a>, or
      <a href="/nordletter/">read an edition of nordletter</a>.
    </p>
  </div>
</nav>
```

This element:
- Uses the same 10-column centering as the book content
- Provides natural language navigation to other sections
- Matches the site's conversational tone

## Design Alignment

### Visual Consistency with Bookshelf

While the Books and Bookshelf pages serve different purposes, they share common design patterns:

- **Year Display**: Both use large, bold year markers with sticky positioning
- **Grid Rhythm**: The 10-column nested grid mirrors Bookshelf's layout structure
- **Spacing**: Both use `clamp()` functions for fluid responsive sizing
- **Typography**: Consistent font sizing and weight hierarchy
- **Borders**: Subtle dividers between items using `rgba(148, 163, 184, 0.35)`

### Distinctions from Bookshelf

- **Data Source**: Books page uses hardcoded array; Bookshelf pulls from markdown posts
- **Content**: Books shows author's publications; Bookshelf shows reading tracker
- **Navigation Position**: Books is top-level primary nav; Bookshelf is under Garden
- **Status Indicators**: Bookshelf includes reading status (reading, finished, etc.); Books does not

## Styling Patterns

### Key CSS Variables Used

- `clamp(2rem, 5vw, 3rem)`: Year font sizing for fluid responsiveness
- `clamp(7rem, 15vw, 10rem)`: Book cover max-width scaling
- `clamp(2rem, 4vw, 3rem)`: Section padding and spacing
- Color tokens: `#111827` (dark text), `#475569` (secondary text), with dark mode variants

### Dark Mode

All text and border colors include `:global(.dark)` overrides to ensure readability in dark mode. Shadows on book covers are deepened in dark mode for better contrast.

## Data Management

Books are defined in a static array at the top of `/src/pages/books/index.astro`:

```typescript
const books = [
  {
    year: 2025,
    title: "A Year of Mornings",
    subtitle: "Poems for Young Adults",
    url: "/books/a-year-of-mornings/",
    description: "...",
    available: true,
    coverImage: BookCover
  }
  // Future books added here
];
```

When adding new books:
1. Import the cover image at the top of the file
2. Add new book object to the array in reverse chronological order (newest first)
3. Set `available: true` if the book has a detail page, `false` otherwise
4. Ensure the cover image is optimized and placed in `/src/images/books/`

## Related Documentation

- [Design System](../design/system.md) - Grid utilities and typography
- [Bookshelf Page](../architecture/content-lifecycle.md) - Related reading tracker page
- [Navigation System](../components/navigation.md) - How Books appears in primary nav

## Change Log

**2025-11-21**: Updated Books page layout to match Bookshelf design patterns
- Introduced ten-grid nested layout (2 col year + 2 col cover + 6 col details)
- Centered content in 10-column span starting at column 2 of outer 12-column grid
- Added navigation links section after book listings
- Removed sidebar in favor of inline navigation
- Added `.ten-grid` and `.grid-gap-normal` utilities to global.css
