# Architecture Overview

The site is an Astro 7 project that renders content-driven routes backed by Markdown collections. Astro handles routing and build-time data aggregation, while a handful of small client scripts deliver progressive enhancement for navigation, tag filtering, and link previews.

## Site Shell

- `src/layouts/Layout.astro` is the root layout for every page. It imports the global stylesheet, wraps content in a twelve-column grid (`.twelve-grid`), and can opt individual pages into the link-hover preview island via `enableLinkHoverEffect`. Search is a standalone page (`src/pages/search.astro`), not a layout-level modal.
- `LayoutContainer.astro` manages padding, max-width, and optional prose styling. Pages pass `pageWrapper` options to the layout to opt into centered, containerized, or prose-optimized renders without duplicating wrapper markup.
- The layout injects the `Header` and `Footer` components around the `<main>` element, ensuring consistent navigation and site credits across every route.

## Routing

- Astro page files live under `src/pages/`. Top-level directories (`garden`, `stream`, `books`, etc.) render list views, while `[...slug].astro` handles every individual post detail page based on `category/slug` pairs.
- Dynamic content lists reuse helpers from `src/utils/content.ts` to pull posts by category, sort by publication date, and transform them for specific grid components.
- API-style endpoints live either as prerendered Astro routes under `src/pages/api/` (e.g., `shelf-queue.json.ts`, `link-previews.json.ts`, RSS feeds) or as Cloudflare Pages Functions under `functions/api/` for anything requiring a runtime request (e.g., `functions/api/upload.js`, `functions/api/til/sync.js`). Search is handled separately by Pagefind, a build-time static index rather than an Astro endpoint.

## Client Islands

Interactivity is opt-in and only loaded where required:

| Script | Purpose |
| --- | --- |
| `src/components/islands/multi-level-navigation-island.ts` | Keeps the navigation section highlights in sync when browsing tag-filtered pages. |
| `src/components/islands/tag-list-island.js` | Client-side behavior for tag list filtering. |
| `src/scripts/relativeTime.ts` | Defines the `<relative-time>` custom element used by `TimeDisplay.astro` so relative timestamps stay fresh after the static build. |
| `LinkHoverEffect.astro` | Adds hover preview cards on eligible links when a page passes `enableLinkHoverEffect` to `Layout.astro`. Internal links show a fixed-size, scrollable card with the post title and a build-time excerpt of the post body (generated in `src/utils/contentPreview.ts`, served via `/api/link-previews/[category].json`); external links show the full URL. Non-link elements opt in with `data-hover-title`/`data-hover-description` (e.g. the `/learn` wall-chart tiles). |

Pages enable specific islands by passing flags to `Layout.astro`, ensuring minimal client bundles on simpler routes.

## Data Sources

- **Content collections** – `src/content.config.ts` defines one shared Zod schema used by all 14 category collections (one folder per category under `src/content/`, e.g. `src/content/blog`, `src/content/bookshelf`), plus a relaxed `inbox` collection for notes arriving from the publishing pipeline. The category list is exported as `CONTENT_CATEGORIES`.
- **Utilities** – `getAllPosts()` in `src/utils/content.ts` memoizes collection reads and powers feeds, tag pages, and backlinks. `getPostsByCategory()` applies consistent filtering across landing pages. Additional helpers cover Nordletter edition parsing and shelf metadata normalization.
- **Generated data** – Build scripts store artifacts in `src/data/`, including `backlinks-index.json` and the Nordletter image manifest. Components treat these as local caches.

## Styling System

The project uses Tailwind CSS (v4, via `@tailwindcss/vite`) with shared tokens in `src/styles/global.css`, which defines the typography scale, twelve-column grid utilities, and reusable chip/button treatments. See [Design System](../design/system.md) for details.

## Related Guides

- [Content Lifecycle](content-lifecycle.md)
- [Design System](../design/system.md)
- [Deployment](../operations/deployment.md)
