# Architecture Overview

The site is an Astro 5 project that renders content-driven routes backed by Markdown collections. Astro handles routing and build-time data aggregation, while a handful of islands deliver progressive enhancement for navigation, search, and link previews.

## Site Shell

- `src/layouts/Layout.astro` is the root layout for every page. It imports the global stylesheet, wraps content in a twelve-column grid, and can opt individual pages into the link-hover preview island via `enableLinkHoverEffect`. Search is a standalone page (`src/pages/search.astro`), not a layout-level modal.【F:src/layouts/Layout.astro†L1-L132】
- `LayoutContainer.astro` manages padding, max-width, and optional prose styling. Pages pass `pageWrapper` options to the layout to opt into centered, containerized, or prose-optimized renders without duplicating wrapper markup.【F:src/components/layout/LayoutContainer.astro†L1-L64】
- The layout injects the `Header` and `Footer` components around the `<main>` element, ensuring consistent navigation and site credits across every route.【F:src/layouts/Layout.astro†L44-L132】

## Routing

- Astro page files live under `src/pages/`. Top-level directories (`garden`, `stream`, `books`, etc.) render list views, while `[...slug].astro` handles every individual post detail page based on `category/slug` pairs.【F:src/pages/[...slug].astro†L1-L46】
- Dynamic content lists reuse helpers from `src/utils/content.ts` to pull posts by category, sort by publication date, and transform them for specific grid components.【F:src/utils/content.ts†L38-L165】
- API-style endpoints live either as prerendered Astro routes under `src/pages/` (e.g., RSS feeds) or as Cloudflare Pages Functions under `functions/api/` for anything requiring a runtime request (e.g., `functions/api/til/sync.js`). Search is handled separately by Pagefind, a build-time static index rather than an Astro endpoint.

## Client Islands

Interactivity is opt-in and only loaded where required:

| Island | Purpose |
| --- | --- |
| `search-modal-loader.ts` / `search-modal-island.ts` | Lazy-loads the global search UI and handles keyboard shortcuts.【F:src/components/islands/search-modal-loader.ts†L1-L154】【F:src/components/islands/search-modal-island.ts†L1-L210】 |
| `multi-level-navigation-island.ts` | Keeps the navigation section highlights in sync when browsing tag-filtered pages.【F:src/components/islands/multi-level-navigation-island.ts†L1-L126】 |
| `link-preview` (via `LinkHoverEffect.astro`) | Adds hover previews on eligible links when enabled on a page.【F:src/layouts/Layout.astro†L8-L76】 |

Pages enable specific islands by passing flags to `Layout.astro`, ensuring minimal client bundles on simpler routes.

## Data Sources

- **Content collections** – `src/content/config.ts` defines schemas for posts, nordletters, and notes. Year-based directories are discovered dynamically and registered as individual collections so `getCollection(year)` works automatically.【F:src/content/config.ts†L1-L55】【F:src/content/config.ts†L57-L90】
- **Utilities** – `getAllPosts()` memoizes filesystem reads and powers search, feeds, and backlinks. `getPostsByCategory()` applies consistent filtering across landing pages. Additional helpers cover Nordletter edition parsing and bookshelf metadata normalization.【F:src/utils/content.ts†L38-L165】
- **Generated data** – Build scripts store artifacts in `src/data/`, including `backlinks-index.json` and generated cover metadata. Components treat these as local caches.

## Styling System

The project uses Tailwind CSS with base styles disabled. Shared tokens live in `src/styles/global.css`, which defines typography scales, twelve-column grid utilities, and reusable chip/button treatments. See [Design System](../design/system.md) for details.

## Related Guides

- [Content Lifecycle](content-lifecycle.md)
- [Design System](../design/system.md)
- [Deployment](../operations/deployment.md)
