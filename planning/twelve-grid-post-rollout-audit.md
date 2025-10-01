# Twelve-Grid Post-Rollout Audit

_Last updated: 2025-02-14_

## Methodology
- Verified that the global `Layout.astro` only emits a `.twelve-grid` wrapper when a page does not explicitly disable it via the `pageWrapper.grid` flag.【F:src/layouts/Layout.astro†L40-L130】
- Confirmed that `SectionLanding.astro` is now the sole grid host for landing pages, while its content slot can opt into a CSS-grid helper (`section-content--grid`) without introducing another `.twelve-grid` element.【F:src/layouts/SectionLanding.astro†L143-L239】
- Reviewed every component that previously injected `.twelve-grid` classes (stream views, bookshelf grids, book detail layout, progress layout, generic content grids, post lists, fiction grids, and garden grids) to ensure they now render standalone CSS grids instead of delegating to the legacy class.【F:src/components/layout/StreamLayout.astro†L20-L76】【F:src/components/bookshelf/BookGrid.astro†L34-L65】【F:src/components/books/BookDetailLayout.astro†L19-L215】【F:src/components/layout/ProgressLayout.astro†L35-L178】【F:src/components/ContentGrid.astro†L69-L132】【F:src/components/content/ResponsiveContentGrid.astro†L34-L155】【F:src/components/content/PostList.astro†L27-L293】【F:src/components/content/FictionGrid.astro†L16-L142】【F:src/components/layout/GardenGrid.astro†L70-L155】
- Searched the project to confirm that the only remaining `.twelve-grid` class originates from `LayoutContainer.astro`, guaranteeing a single grid host per page.

## Findings

### Global and detail views
- **Default pages & post detail (`[...slug].astro`)** rely exclusively on the layout shell’s grid, as downstream components stay free of `.twelve-grid` wrappers.【F:src/pages/[...slug].astro†L30-L48】
- **Progress views** (`/done/`, `/now/`) now depend on the updated `ProgressLayout` CSS grid, leaving the surrounding layout as the sole `.twelve-grid` wrapper when `pageWrapper.grid` remains enabled.【F:src/components/layout/ProgressLayout.astro†L35-L178】
- **Book detail pages** (`/books/*`) render their internal layout with the standalone `BookDetailLayout` grid, avoiding additional `.twelve-grid` classes beyond the page wrapper.【F:src/components/books/BookDetailLayout.astro†L19-L215】

### Section landing routes
- **Stream family** (`/blog/`, `/micro/`, `/photos/`, `/stream/`) disables the layout grid (`pageWrapper.grid: false`) and lets `SectionLanding` provide the lone `.twelve-grid`, while the updated `StreamLayout` keeps its own CSS grid implementation.【F:src/pages/blog/index.astro†L30-L45】【F:src/pages/micro/index.astro†L30-L45】【F:src/pages/photos/index.astro†L30-L45】【F:src/pages/stream/index.astro†L30-L45】【F:src/components/layout/StreamLayout.astro†L20-L76】
- **Garden and literary hubs** (`/garden/`, `/evergreen/`, `/til/`, `/poems/`, `/stories/`, `/nordletter/`) also disable the layout grid; `SectionLanding` supplies the single `.twelve-grid`, and slot content uses component-level grids (`GardenGrid`, `ContentGrid`, or `FictionGrid`) without reintroducing the legacy class.【F:src/pages/garden/index.astro†L30-L44】【F:src/pages/evergreen/index.astro†L30-L45】【F:src/pages/til/index.astro†L30-L45】【F:src/pages/poems/index.astro†L30-L45】【F:src/pages/stories/index.astro†L30-L45】【F:src/pages/nordletter/index.astro†L30-L54】【F:src/components/layout/GardenGrid.astro†L70-L155】【F:src/components/ContentGrid.astro†L69-L132】【F:src/components/content/FictionGrid.astro†L16-L142】
- **Bookshelf landing** (`/bookshelf/`) mirrors the pattern: the layout grid is disabled and `BookGrid` now renders its own CSS grid, ensuring a single `.twelve-grid` wrapper sourced from `SectionLanding` only.【F:src/pages/bookshelf/index.astro†L60-L89】【F:src/components/bookshelf/BookGrid.astro†L34-L65】
- **Books index** (`/books/`) similarly delegates the grid to `SectionLanding`, while `ContentGrid` handles card layout without `.twelve-grid` duplication.【F:src/pages/books/index.astro†L28-L61】【F:src/components/ContentGrid.astro†L69-L132】

### Informational pages
- **RSS feeds** (`/feeds/`) keeps the layout shell as the only `.twelve-grid`, while local `.page-grid` wrappers orchestrate feed buttons and recent posts without reintroducing the legacy class.【F:src/pages/feeds.astro†L1-L160】
- **Tag explorer** (`/tags/`) renders a single layout grid and relies on scoped `.page-grid` helpers for the top-twenty and full tag listings, eliminating nested `.twelve-grid` containers.【F:src/pages/tags/index.astro†L1-L259】
- **Colophon** (`/colophon/`) now uses CSS-only grids for callouts, feature cards, and timeline sections, leaving the layout wrapper as the site-wide `.twelve-grid`.【F:src/pages/colophon.astro†L1-L342】
- **About Sajal** (`/sajal/`) applies bespoke `.page-grid` sections for intro, card groups, and timeline content so the layout wrapper remains the lone `.twelve-grid`.【F:src/pages/sajal.astro†L1-L415】

### Audit conclusion
All routes—including the blog, garden, stream, bookshelf, informational pages, and individual posts—now render exactly one `.twelve-grid` wrapper per page. Any additional layout structure is handled by bespoke CSS grid classes that no longer rely on the Craig Mod utility class, satisfying the rollout requirement for a single 12-column host across the site.
