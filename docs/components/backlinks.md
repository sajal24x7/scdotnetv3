# Backlinks System

This site surfaces internal references at the end of every long-form post so readers can discover related entries. The workflow combines a cached build-time index with a presentational Astro component.

## Data Pipeline

1. **Path discovery** – `src/pages/[...slug].astro` resolves the requested category/slug pair during `getStaticPaths` and uses it as the lookup key for backlinks.【F:src/pages/[...slug].astro†L3-L46】
2. **Index lookup** – `findBacklinksComprehensive()` in `src/utils/backlinks.ts` loads `src/data/backlinks-index.json` if it exists. When the artifact is missing or `REGENERATE_BACKLINKS=true`, it regenerates the cache by scanning every year collection discovered via `getYearDirectories()`.【F:src/utils/backlinks.ts†L33-L189】
3. **Target normalization** – Markdown links are normalized to canonical internal paths (host stripped, query/hash removed) before being stored. The helper deduplicates references and sorts them by publication date.【F:src/utils/backlinks.ts†L191-L313】
4. **Prop wiring** – The resulting array is passed to `PostLayout.astro`, which forwards it to the `Backlinks` UI fragment once the main article body renders.【F:src/components/layout/PostLayout.astro†L106-L132】【F:src/components/Backlinks.astro†L5-L139】

The cached JSON artifact is safe to commit and allows incremental builds to resolve backlinks without rescanning every post. Setting `REGENERATE_BACKLINKS=true` rebuilds it on demand.

## Rendering Conventions

`src/components/Backlinks.astro` displays each backlink as a compact article card:

- Uses the shared `.card-chip` styling through `CategoryDisplay` to render the source category as a chip, matching other metadata treatments on the site.【F:src/components/CategoryDisplay.astro†L1-L16】【F:src/styles/global.css†L475-L577】
- Wraps the backlink list in a `<section>` with top border to separate it from share controls and footnotes.【F:src/components/Backlinks.astro†L17-L73】
- Provides hover affordances in light and dark themes for both the card background and title link.【F:src/components/Backlinks.astro†L56-L139】

The component only renders when the backlink array is non-empty to avoid empty headings.

## Extending the Feature

- **New link formats** – Update `collectBacklinkTargets()` if you introduce shortlinks or embed syntaxes so they normalize to the correct `category/slug` keys.【F:src/utils/backlinks.ts†L191-L272】
- **Alternate presentation** – Modify `Backlinks.astro` or create a wrapper slot in `PostLayout.astro` if future templates require richer previews (for example, excerpts or thumbnails). The data contract is isolated from rendering, so adjustments do not impact indexing.
- **Cache strategy** – The helper warns if it cannot read or write the JSON artifact. Confirm the repo has write permissions or rebuild with `REGENERATE_BACKLINKS=true` to recover from transient issues.【F:src/utils/backlinks.ts†L62-L140】

## Troubleshooting Checklist

| Symptom | Suggested Checks |
| --- | --- |
| Backlinks missing for a known post | Ensure the source post contains a real hyperlink (not plain text) to the target and that both live inside recognized year directories. Rebuild with regeneration if the cache is stale. |
| Incorrect URLs in the list | Verify the target post’s `category` matches the canonical URL segment; renaming categories requires updating content or adding redirects so normalization still resolves. |
| Build warnings about the artifact | Inspect filesystem permissions or disk space; the script logs read/write failures before falling back to regeneration. |

## Related Documentation

- [Content Lifecycle](../architecture/content-lifecycle.md) – Explains how year collections and Markdown parsing feed the backlink builder.
- [Design System](../design/system.md) – Covers the shared chip styles used in the backlink UI.
