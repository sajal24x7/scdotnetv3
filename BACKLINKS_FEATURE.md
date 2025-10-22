# Backlinks Feature

## Overview
The backlinks feature surfaces internal references to the current post. When a post links to another post anywhere in its Markdown body, the linking post is listed in a "Backlinks" section at the bottom of the destination post. The implementation combines build-time discovery of references with an Astro component that renders the results in the post layout.

## Build-Time Discovery Flow
1. **Dynamic routing** – `src/pages/[...slug].astro` handles every content detail page. During build it enumerates all markdown entries via `getStaticPaths`, deriving each route's category and slug from the entry metadata.【F:src/pages/[...slug].astro†L3-L24】
2. **Backlink lookup** – When Astro builds a post, the page file calls `findBacklinksComprehensive` with the current `category/slug` path. The helper resolves backlinks from a JSON artifact and passes the array into the layout component.【F:src/pages/[...slug].astro†L28-L46】【F:src/utils/backlinks.ts†L33-L60】
3. **Prop wiring** – The resulting backlink data, along with the entry and category information, flows into `PostLayout.astro`. That layout renders the main article content and injects the backlink section once the article body is complete.【F:src/components/layout/PostLayout.astro†L7-L132】

## How `findBacklinksComprehensive` Works
`src/utils/backlinks.ts` now builds and caches a backlink index so each page can reuse the results instead of rescanning every post.

1. **Load or build the artifact** – The helper looks for `src/data/backlinks-index.json` unless `REGENERATE_BACKLINKS=true`. If the file exists it is parsed into memory; otherwise the module rebuilds the index and rewrites the artifact for future runs.【F:src/utils/backlinks.ts†L62-L113】
2. **Build the backlink index** – When rebuilding, the helper gathers every year collection, records a lookup map of `category/slug` keys, and then walks each entry to capture explicit internal links. Each target gets a list of backlink objects sorted by publication date.【F:src/utils/backlinks.ts†L115-L189】
3. **Explicit link detection** – `collectBacklinkTargets` extracts Markdown inline links, HTML anchors, reference definitions, and autolink-style URLs. Candidates are normalized to canonical paths, filtered to the site domain, and deduplicated.【F:src/utils/backlinks.ts†L191-L261】
4. **Normalization helpers** – Utility functions normalize hostnames, ensure category fallbacks, coerce dates, and strip query/hash fragments so the artifact remains stable and deterministic.【F:src/utils/backlinks.ts†L263-L313】

`findBacklinks` is retained as an alias to the comprehensive implementation for compatibility, but the site now exclusively uses the cached lookup path.【F:src/utils/backlinks.ts†L28-L60】【F:src/pages/[...slug].astro†L34-L35】

## Rendering the Backlink List
`PostLayout.astro` renders the backlink data using the `Backlinks` component once the main article content and share controls are in place.【F:src/components/layout/PostLayout.astro†L106-L132】 The component itself lives at `src/components/Backlinks.astro` and expects an array of objects shaped like the `Backlink` interface.

Key rendering behaviors:
- The section is wrapped in a `<section>` with a top border so it visually separates from the rest of the post footer. It only renders when one or more backlinks are supplied.【F:src/components/Backlinks.astro†L17-L38】
- Each backlink is an `<article>` containing a link, the referring post's category chip (via `CategoryDisplay`), title, and optional description. The layout is flex-based to keep the metadata together and responsive.【F:src/components/Backlinks.astro†L5-L35】【F:src/components/Backlinks.astro†L43-L120】
- Hover states tint both the card background and the title color, with dark mode variants defined via `:global(.dark)` selectors.【F:src/components/Backlinks.astro†L56-L139】

## Adding or Customizing Backlinks
- **Referencing another post** – Add an explicit hyperlink that resolves to the target page. Accepted formats include fully qualified URLs (`https://sajalchoudhary.net/category/slug/`), protocol-relative or bare-domain links (`sajalchoudhary.net/category/slug/`), and root-relative paths (`/category/slug/`). Plain-text mentions without link markup are ignored during backlink discovery.【F:src/utils/backlinks.ts†L145-L261】
- **Extending detection rules** – To recognize additional reference styles (for example, shortlinks or embeds), adjust `collectBacklinkTargets` or `normalizeHrefToKey` with the new parsing or validation logic so the resulting canonical keys still match real posts.【F:src/utils/backlinks.ts†L145-L272】
- **Changing display** – Modify `src/components/Backlinks.astro` to adjust copy, add thumbnails, or change the layout. The component is isolated from the backlink search logic, so visual updates do not require touching the utility.
- **Performance considerations** – The backlink index is cached to `src/data/backlinks-index.json` and reused for every page render. Set `REGENERATE_BACKLINKS=true` when running a build to force a fresh scan if the artifact becomes stale.【F:src/utils/backlinks.ts†L62-L140】

## Troubleshooting
- **No backlinks appearing** – Confirm that the source post is published in a year directory recognized by `getYearDirectories()` and that the link uses one of the supported URL formats (full URL, bare-domain, or root-relative). Building the site regenerates the artifact if it is missing.【F:src/utils/backlinks.ts†L96-L195】
- **Incorrect URLs** – The backlink builder assumes each post's `category` frontmatter matches the first path segment in the canonical URL so it can emit `/{category}/{slug}/`. If categories are renamed, regenerate content or add redirects so the computed path remains valid.【F:src/utils/backlinks.ts†L123-L134】【F:src/utils/backlinks.ts†L310-L316】
- **Console warnings during build** – The utility logs a warning if it cannot read or write the `src/data/backlinks-index.json` artifact. Check file permissions or disk space, then rerun with `REGENERATE_BACKLINKS=true` if necessary.【F:src/utils/backlinks.ts†L73-L94】
