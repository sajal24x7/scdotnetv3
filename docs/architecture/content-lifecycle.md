# Content Lifecycle

This guide documents how Markdown files flow from `src/content` into Astro pages, including schema validation, aggregation utilities, and derived artifacts such as search and backlink indexes.

## Authoring and Validation

- Content lives in one folder per category under `src/content/` (`src/content/blog`, `src/content/til`, `src/content/bookshelf`, etc.). The canonical category list is `CONTENT_CATEGORIES` in `src/content.config.ts`; each category maps to its own collection.
- `src/content.config.ts` defines the shared Zod schema for all post collections. Required fields are `created` and `category`; optional metadata covers shelf status/ratings, syndication URLs, photo galleries, and layout spans. Entry IDs come from the frontmatter `slug` when present, otherwise from a slugified filename.
- A relaxed `inbox` collection (`src/content/inbox/`) stages notes arriving from Obsidian/Shortcuts; the publishing pipeline normalizes and sorts them into category folders (see [Publishing Pipeline](../content/publishing-pipeline.md)).

## Loading Content

- `getContentCategories()` in `src/utils/content.ts` returns the category list (`getYearDirectories` survives as a backwards-compatible alias from the old year-folder layout).
- `getAllPosts()` lazily caches posts from every category collection to minimize repeated reads during a build. Subsequent calls reuse the same in-memory array.
- `getPostsByCategory()` filters the cached posts using either named filters (e.g., `streamHighlights`) or explicit category arrays. Results are sorted by publication date descending and support optional limits.
- `transformPost()` normalizes post data for grid-based components, attaching computed links and flattening frontmatter for consistent consumption.

## Derived Artifacts

| Artifact | Produced By | Used For |
| --- | --- | --- |
| `src/data/backlinks-index.json` | `findBacklinksComprehensive()` regenerates this cache when content changes, when the file is missing, or when `REGENERATE_BACKLINKS=true`. | Supplies backlinks to `PostLayout.astro`. |
| `dist/pagefind/` | Pagefind crawls the built HTML output as a post-build step (`pagefind --site dist` in the `build` script). | Read by `src/pages/search.astro` for client-side queries. |
| `src/data/nordletter-image-manifest.json` + cached images | `npm run cache-nordletter-images` before every dev/build. | Newsletter thumbnails in `NordletterGrid.astro` (see [Nordletter Image Cache](../operations/nordletter-image-cache.md)). |
| Generated cover maps (`src/utils/bookCovers.ts` etc.) | `npm run generate-covers` and the per-shelf generate scripts. | Shelf layouts import cover images at build time. |

## Backlinks Integration

During `getStaticPaths`, the `[...slug].astro` route resolves the current post and calls `findBacklinksComprehensive()` using the category/slug key. The helper ensures the backlink cache is available before `PostLayout.astro` renders the page. See [Backlinks System](../components/backlinks.md) for details.

## Search Index Integration

Search is powered by Pagefind, which indexes the built HTML after `astro build` completes — it does not go through `getAllPosts()`. The search page itself computes popular tags server-side from `getAllPosts()`; because the utility memoizes its promise, tag pages, backlinks, and feed routes reuse the same in-memory array during a single build.

## Syndication Metadata

POSSE scripts update `syndicationUrls` in frontmatter when new cross-post links are discovered. The shared schema and `transformPost()` ensure the URLs are exposed to components such as `SyndicationLinks.astro`. Consult [Syndication](../operations/syndication.md) for more information.

## Maintenance Checklist

- When adding a new content category, add it to `CONTENT_CATEGORIES` and the `category` enum in `src/content.config.ts`, register the collection, create the folder under `src/content/`, extend navigation mappings, and review search/filter logic for the new identifier.
- Keep the backlink cache committed; deleting it triggers regeneration on the next build but increases build time.
- Run `npm run generate-covers` after adding bookshelf entries that reference new covers to ensure assets exist locally.
