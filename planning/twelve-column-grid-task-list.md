# Twelve-Column Layout Implementation Tasks

> Status tracking document for aligning the site to the unified twelve-column grid. Check off each item once the work ships.

## 1. Foundation & Shared Infrastructure
- [ ] Audit existing layout wrappers (`LayoutContainer`, section wrappers) to confirm responsive breakpoint usage and identify conflicts with twelve-column grid introduction.
- [ ] Define shared twelve-column CSS grid utilities (e.g., Tailwind classes, custom utility) and document usage in layout guidelines.
- [ ] Update global `Layout` component to expose the twelve-column grid container, ensuring mobile fallback to single-column remains intact.
- [ ] Verify no regressions on global spacing, gutters, and max-width behavior after enabling the new grid container.

- [ ] Remove legacy grid components (`HomeTwoRowGrid`, redundant sections) per latest direction; confirm hero, book promo, about + Nordletter sign-up, and unified stream layout remain.
- [ ] Rebuild home page sections using twelve-column spans: book hero (12 cols), about copy (cols 1-8) with embedded Nordletter signup (cols 9-12), and stream feed (cols 1-8) with featured stories rail (cols 9-12).
- [ ] Power "Recently" and stream feeds with the shared `getAllPosts` → `getPostsByCategory` → `transformPost` pipeline so data sourcing matches the rest of the site.
- [ ] Support a hard-coded list of featured slugs that resolve to post metadata via `getAllPosts`, allowing manual curation without bespoke data fetches.
- [ ] Ensure micro posts in the stream respect full-content display while fitting within the new column spans.
- [ ] Validate responsive behavior across breakpoints and adjust spacing/typography as needed.

## 3. Garden Family Pages (`/garden`, `/evergreen`, `/til`, `/poems`, `/stories`)
- [ ] Refactor `GardenGrid` to sit inside the shared twelve-column parent with default card spans of three columns on desktop.
- [ ] Provide overrides for featured cards to span six or twelve columns where applicable.
- [ ] Align tag and count headers to full-width rows within `SectionLanding`.
- [ ] Confirm mobile layout collapses to single-column while preserving card order.

## 4. Stream Family Pages (`/stream`, `/blog`, `/micro`, `/photos`)
- [ ] Update `StreamLayout` to map metadata/filters to sidebar spans (cols 9-12) and main content to cols 1-8.
- [ ] Adjust `PostItem` component spacing to harmonize with new column gutters.
- [ ] Verify sticky sidebar behavior (if used) functions within twelve-column grid constraints.

## 5. Nordletter (`/nordletter`)
- [ ] Rework `NordletterGrid` so issues span three columns by default on desktop, with optional six-column highlights.
- [ ] Ensure year dividers and signup module occupy full twelve-column width.

## 6. Bookshelf & Book Pages (`/bookshelf`, `/books`, `/books/*`)
- [ ] Convert `BookGrid` to twelve-column spans: default card width four columns, with support for wider features.
- [ ] For `/books`, align year sections across columns 1-8 with summary/sidebar content in cols 9-12.
- [ ] For book detail pages, center primary prose across columns 3-10 and place metadata/sidebar elements in cols 1-4.

## 7. Prose Landing (`/prose`)
- [ ] Update `ContentGrid` to accept column-span props, defaulting to eight-column cards with optional side-by-side storytelling elements.
- [ ] Introduce sidebar space (cols 9-12) for tag filters or reading order aids.

## 8. Now & Done Pages (`/now`, `/done`)
- [ ] Apply twelve-column template with main content in cols 1-8.
- [ ] Populate cols 9-12 with quick links or summary widgets; ensure optional content is gracefully handled if omitted.

## 9. Colophon & Sajal Pages
- [ ] Map existing card sections to three-column spans on desktop.
- [ ] Allow select callouts to expand to six or twelve columns without breaking flow.

## 10. Feeds (`/feeds`)
- [ ] Arrange feed buttons into four three-column spans aligned within the grid.
- [ ] Place `RecentItems` list in cols 1-8 and maintain sidebar explainer content in cols 9-12.

## 11. Tags (`/tags`)
- [ ] Restructure tag grids so each tag chip spans three columns on desktop, four-up per row.
- [ ] Confirm filtering script updates preserve alignment when new items append.

## 12. Utility & Misc Pages
- [ ] Ensure random redirect and Nordletter test pages inherit the centered eight-column template (content cols 3-10).
- [ ] Audit any remaining standalone components for hard-coded grid classes and migrate to column-span utilities.

## 13. Documentation & QA
- [ ] Update `planning` docs or developer notes with guidance on using the twelve-column grid.
- [ ] Run `npm run build` to confirm no build-time regressions.
- [ ] Capture before/after screenshots for key pages (home, garden, stream) to document layout changes.

## 14. Cleanup
- [ ] Remove obsolete components and styles superseded by the twelve-column framework.
- [ ] Delete deprecated pages (`prose landing`, `navigation demo`) if not already removed.
- [ ] Confirm no unused imports or dead code remain in updated files.
