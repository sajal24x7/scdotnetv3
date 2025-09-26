# Twelve-Column Layout Implementation Tasks

> Status tracking document for aligning the site to the unified twelve-column grid. Check off each item once the work ships.

## 1. Foundation & Shared Infrastructure
- [x] Audit existing layout wrappers (`LayoutContainer`, section wrappers) to confirm responsive breakpoint usage and identify conflicts with twelve-column grid introduction.
  - `LayoutContainer` currently leans on Tailwind's `container` utility and enumerated `max-w-*` tokens, defaulting to a `3xl` width inside the global layout. Introducing the twelve-column shell will require swapping in an explicit grid container (e.g., `mx-auto grid grid-cols-12`) and leaving `container` opt-in for legacy templates so spacing doesn't double up.
  - `SectionWrapper` and `GridWrapper` exclusively manage padding/margin scales and ad-hoc column counts. They do not enforce gutters, so they can remain as lightweight spacing helpers once the parent grid owns column flow; however, both need optional hooks to consume shared gap tokens supplied by the grid utilities.
  - Home-specific wrappers (`HomeTwoRowGrid`, `HomeFourGrid`, `FourSectionLayout`, `StreamGrid`) hard-code bespoke column ratios and inline media queries. These will conflict with a unified twelve-column span system and should be retired in favor of declarative span props when the new utilities land.
  - `StreamLayout`, `GardenGrid`, and `TagSidebar` embed custom CSS grid templates (`grid-template-columns`, fixed pixel widths) that bypass Tailwind breakpoints. Each will need a rewrite to express spans via the common twelve-column classes so sticky sidebars and metadata columns inherit consistent gutters.
- [x] Define shared twelve-column CSS grid utilities (e.g., Tailwind classes, custom utility) and document usage in layout guidelines.
  - Added `.twelve-grid`, span/start helpers, and gap/padding tokens to `src/styles/global.css` alongside root spacing variables.
  - Documented usage patterns in `planning/site-improvement-guidelines.md` under the UI/UX section.
- [x] Update global `Layout` component to expose the twelve-column grid container, ensuring mobile fallback to single-column remains intact.
  - Wrapped the main slot with the shared `.twelve-grid` shell and added configurable gap/padding hooks so every route inherits the new structure by default.
- [x] Verify no regressions on global spacing, gutters, and max-width behavior after enabling the new grid container.
  - Adjusted grid span and start utilities to default to full-width on narrow viewports, keeping gutters and max-width behavior stable before desktop breakpoints.

- [x] Remove legacy grid components (`HomeTwoRowGrid`, redundant sections) per latest direction; confirm hero, book promo, about + Nordletter sign-up, and unified stream layout remain.
- [x] Rebuild home page sections using twelve-column spans: book hero (12 cols), about copy (cols 1-8) with embedded Nordletter signup (cols 9-12), and stream feed (cols 1-8) with featured stories rail (cols 9-12).
  - `index.astro` now assigns grid spans to the about, book showcase, stream, and featured sections, keeping newsletter signup and featured rail pinned to columns 9-12 on desktop while collapsing to single-column on small screens.
- [x] Power "Recently" and stream feeds with the shared `getAllPosts` → `getPostsByCategory` → `transformPost` pipeline so data sourcing matches the rest of the site.
  - Home "Recently" rail and blog, micro, photo stream routes now rely on `getPostsByCategory` for consistent filtering and ordering.
- [x] Support a hard-coded list of featured slugs that resolve to post metadata via `getAllPosts`, allowing manual curation without bespoke data fetches.
- [x] Ensure micro posts in the stream respect full-content display while fitting within the new column spans.
  - Reworked `PostItem` to span twelve-column gutters while keeping micro entries rendered from full Markdown content across stream surfaces.
- [x] Validate responsive behavior across breakpoints and adjust spacing/typography as needed.
  - Updated `RecentItems`, `FeaturedPosts`, and `PostItem` to rely on fluid typography tokens, shared grid gaps, and CSS variables so spacing and contrast stay consistent from mobile through desktop.

## 3. Garden Family Pages (`/garden`, `/evergreen`, `/til`, `/poems`, `/stories`)
- [x] Refactor `GardenGrid` to sit inside the shared twelve-column parent with default card spans of three columns on desktop.
- [x] Provide overrides for featured cards to span six or twelve columns where applicable.
  - Added optional `layout.span` frontmatter to support six- and twelve-column garden features, with `GardenGrid` mapping spans to shared grid classes.
- [x] Align tag and count headers to full-width rows within `SectionLanding`.
  - Wrapped SectionLanding metadata rows in the shared twelve-column grid so count badges, custom slots, and tag lists span the full template width before content renders.
- [x] Confirm mobile layout collapses to single-column while preserving card order.
  - Enforced row-based auto-flow on the twelve-column utility and constrained garden cards with `min-width: 0` so mobile breakpoints render items one per row without reordering.

## 4. Stream Family Pages (`/stream`, `/blog`, `/micro`, `/photos`)
- [x] Update `StreamLayout` to map metadata/filters to sidebar spans (cols 9-12) and main content to cols 1-8.
  - Wrapped stream listings in the shared twelve-column grid with dedicated main (cols 1-8) and optional sticky sidebar (cols 9-12) slots for metadata and filters.
- [x] Adjust `PostItem` component spacing to harmonize with new column gutters.
  - Replaced hard-coded clamps with inherited twelve-column spacing tokens so borders, metadata rows, and body copy follow the shared grid gaps across stream contexts.
- [x] Verify sticky sidebar behavior (if used) functions within twelve-column grid constraints.
  - Ensured the stream grid aligns items to the start so the sidebar retains its sticky positioning within the twelve-column template across browsers.

## 5. Nordletter (`/nordletter`)
- [x] Rework `NordletterGrid` so issues span three columns by default on desktop, with optional six-column highlights.
  - `NordletterGrid` now renders directly inside the shared twelve-column shell with span-aware classes (`grid-span-3`, `grid-span-6`, `grid-span-12`) mapped from optional `layout.span` metadata for curated highlights.
  - Follow-up adjustments removed the card chrome, bumped image/title scale, and introduced a dedicated mobile grid so two issues sit side-by-side on phones per latest feedback.
- [x] Ensure year dividers and signup module occupy full twelve-column width.
  - Year headers render as `grid-span-full` rows with refreshed styling and the newsletter signup inherits the landing grid container so it stretches across all twelve columns before the issue listings.

## 6. Bookshelf & Book Pages (`/bookshelf`, `/books`, `/books/*`)
- [x] Convert `BookGrid` to twelve-column spans: default card width four columns, with support for wider features.
  - `BookGrid` now renders within the shared twelve-column container, defaulting cards to four-column spans while honoring optional eight- and twelve-column features via `layout.span` metadata.
- [x] For `/books`, align year sections across columns 1-8 with summary/sidebar content in cols 9-12.
  - Converted the books landing page to use `SectionLanding` with a nested twelve-column layout, placing the book timeline across columns 1-8 and a sticky summary rail within columns 9-12.
- [x] For book detail pages, keep the cover in the first column and flow the description across the remaining two columns within a simple three-column desktop grid.
  - `/books/a-year-of-mornings/` now keeps the cover anchored to the first column with a metadata box beneath it, featuring publication date, ISBN, page count, and outbound store/library links in a dotted treatment with horizontal label/value pairs that mirrors other sidebar callouts.
  - Introduced a reusable `BookDetailLayout` component so future book pages can share the cover, metadata, and description structure without rewriting the grid treatment.

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
