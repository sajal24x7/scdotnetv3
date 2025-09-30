# Home Page Redesign Implementation Plan

**Last Updated:** July 25, 2025

## Overview
This plan covers the redesign of the home page to match the layout and user experience inspired by https://maggieappleton.com, with a four-section grid:
- Top left: Recent 4 notes (content grid)
- Top right: Ephemera feed (10-12 items, list)
- Bottom left: Bookshelf (list)
- Bottom right: Recent 4 poems and stories (content grid)

The goal is to create a visually engaging, information-rich landing page that is consistent with the rest of the site in terms of max width and layout.

---

## Task Checklist
- [ ] P1.1: Analyze and document current home page structure (`src/pages/index.astro`)
- [ ] P1.2: Design new four-section layout structure (update or extend `FourSectionLayout` or create new component if needed)
- [ ] P1.3: Implement recent notes grid (top left)
- [ ] P1.4: Implement ephemera feed list (top right)
- [ ] P1.5: Implement bookshelf list (bottom left)
- [ ] P1.6: Implement recent poems and stories grid (bottom right)
- [ ] P1.7: Style all sections for visual consistency and responsiveness
- [ ] P1.8: Refactor/remove any redundant or inconsistent container classes/max-widths
- [ ] P1.9: Update tests or add manual test instructions for user
- [ ] P1.10: Document changes in this plan and update progress

---

## Current Phase
- **Phase 1:** Planning and layout design (P1.1–P1.2)

## Overall Progress
- **Not started**

---

## Notes on Implementation
- All content should be fetched dynamically from the content collections (notes, ephemera, bookshelf, poems, stories)
- Use headline and category for list items where appropriate
- Ensure max width is consistent with other main pages (`max-w-7xl`/1400px)
- Use Tailwind utility classes for layout and spacing
- Ensure mobile responsiveness and accessibility

---

## Current Home Page Structure (P1.1)

The current home page (`src/pages/index.astro`) uses the following structure:

- **Layout:** Wrapped in the `Layout` component, which forwards a `LayoutContainer` configuration (`maxWidth: '7xl'`, `padding: 'none'`, `className: 'px-2'`) for consistent max width and centering.
- **ProfileHero:** Displays the user's profile, name, image, and job description at the top.
- **BookShowcase:** Highlights a featured book with cover, title, and description.
- **NewsletterSignup:** Section for newsletter signups.
- **FourSectionLayout:** Renders a four-section grid (currently: Notes, Ephemera, Stories, Poems) with counts and links, but not the custom content layout described in the new plan.
- **Recent Posts:** Lists the 5 most recent posts in a vertical list, showing date, title, and category.
- **Directory/Footer Section:** Contains links to About, Now, and a writing directory (notes, blog, stories, poems) in a grid/list format.

**Layout Approach:**
- Uses Tailwind utility classes for spacing, borders, and typography.
- All main content is inside the `Layout`/`LayoutContainer` pairing for consistent max width.
- No custom four-quadrant grid as described in the new requirements; the current `FourSectionLayout` is a simple section grid with links and counts.

---

## Completion Notes

### P1.1 (July 25, 2025)
- **File analyzed:** `src/pages/index.astro`
- **Key features:** Profile, book showcase, newsletter, four-section grid (links/counts), recent posts, directory/footer
- **Technical notes:** Uses `Layout`/`LayoutContainer` for max width; no custom four-quadrant content grid yet
- **Next:** Design new four-section layout structure (P1.2)
*To be filled as tasks are completed, including files modified, features implemented, and any issues resolved.* 