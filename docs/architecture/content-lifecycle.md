# Content Lifecycle

This guide documents how Markdown files flow from `src/content` into Astro pages, including schema validation, aggregation utilities, and derived artifacts such as search and backlink indexes.

## Authoring and Validation

- Content lives in year-based directories (`src/content/2024`, `src/content/2025`, etc.). Year folders are registered dynamically so new years require no code changes.【F:src/content/config.ts†L41-L73】
- `src/content/config.ts` defines the shared Zod schema for posts. Required fields include `pubDate` and `category`; optional metadata supports bookshelf status, syndication URLs, and custom layout spans.【F:src/content/config.ts†L1-L55】
- Additional collections cover Nordletter issues and notes, enabling distinct frontmatter for newsletter archives and note-taking flows.【F:src/content/config.ts†L57-L90】

## Loading Content

- `getYearDirectories()` reads the filesystem at runtime to locate year folders, ensuring the site stays in sync with committed content.【F:src/utils/content.ts†L28-L37】
- `getAllPosts()` lazily caches parsed posts from every year to minimize repeated disk I/O during a build. Subsequent calls reuse the in-memory array.【F:src/utils/content.ts†L38-L92】
- `getPostsByCategory()` filters the cached posts using either named filters (e.g., `streamHighlights`) or explicit category arrays. Results are sorted by publication date descending and support optional limits.【F:src/utils/content.ts†L94-L165】
- `transformPost()` normalizes post data for grid-based components, attaching computed links and flattening frontmatter for consistent consumption.【F:src/utils/content.ts†L66-L93】

## Derived Artifacts

| Artifact | Produced By | Used For |
| --- | --- | --- |
| `src/data/backlinks-index.json` | `findBacklinksComprehensive()` regenerates this cache when `REGENERATE_BACKLINKS=true` or when the file is missing. | Supplies backlinks to `PostLayout.astro`.【F:src/utils/backlinks.ts†L33-L189】 |
| `dist/search-index.json` (at build) | `src/pages/search-index.json.ts` emits a static index over every post. | Read by the search modal island for client-side queries.【F:src/pages/search-index.json.ts†L1-L31】 |
| Generated book covers | `npm run generate-covers` runs `scripts/generate-book-covers.js` to create local assets. | Used by bookshelf layouts to display consistent cover art. |

## Backlinks Integration

During `getStaticPaths`, the `[...slug].astro` route resolves the current post and calls `findBacklinksComprehensive()` using the category/slug key. The helper ensures the backlink cache is available before `PostLayout.astro` renders the page.【F:src/pages/[...slug].astro†L3-L46】【F:src/utils/backlinks.ts†L33-L113】 See [Backlinks System](../components/backlinks.md) for details.

## Search Index Integration

The search index is generated after all posts have been loaded through `getAllPosts()`. Because the utility memoizes its promise, search, backlinks, and feed routes reuse the same in-memory array during a single build, preventing redundant parsing work.【F:src/utils/content.ts†L38-L92】

## Syndication Metadata

POSSE scripts update `syndicationUrls` in frontmatter when new cross-post links are discovered. The shared schema and `transformPost()` ensure the URLs are exposed to components such as `SyndicationLinks.astro`. Consult [Syndication](../operations/syndication.md) for more information.【F:src/content/config.ts†L15-L55】【F:src/utils/content.ts†L66-L93】

## Maintenance Checklist

- When adding a new content category, update the Zod enums in `src/content/config.ts`, extend navigation mappings, and review search/filter logic for the new identifier.
- Keep the backlink cache committed; deleting it triggers regeneration on the next build but increases build time.
- Run `npm run generate-covers` after adding bookshelf entries that reference new covers to ensure assets exist locally.
