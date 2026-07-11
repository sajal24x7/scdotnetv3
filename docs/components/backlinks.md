# Backlinks System

This site surfaces internal references at the end of every long-form post — rendered as a "Paths into this note" section — so readers can discover related entries and see how notes interconnect. The workflow combines a cached build-time index with a presentational Astro component.

## Data Pipeline

1. **Path discovery** – `src/pages/[...slug].astro` resolves the requested category/slug pair during `getStaticPaths` and uses it as the lookup key for backlinks.
2. **Index lookup** – `findBacklinksComprehensive()` in `src/utils/backlinks.ts` loads `src/data/backlinks-index.json` if it exists. When the artifact is missing, stale, or `REGENERATE_BACKLINKS=true`, it regenerates the cache by scanning every content collection.
3. **Target normalization** – Markdown links, HTML links, and Obsidian wikilinks are normalized to canonical internal paths (host stripped, query/hash removed) before being stored. The helper deduplicates references and sorts them by publication date.
4. **Snippet extraction** – For each link, the indexer records the position of its first mention and extracts surrounding context as a plain-text `snippet` (markdown syntax stripped). Snippets are bounded to the containing line because content is authored Obsidian-style (one paragraph or list item per line). The whole paragraph is used when it fits within 500 characters; longer paragraphs start at the sentence containing the link (prefixed with an ellipsis when that isn't the paragraph start) and are cut off at the limit with a trailing ellipsis. Snippets shorter than 20 characters, or links that only appear in reference-style definitions, are dropped so the UI can fall back to the target note's description.
5. **Prop wiring** – The resulting array is passed to `PostLayout.astro` (and `PhotoPostLayout.astro`), which forwards it to the `Backlinks` UI fragment once the main article body renders.

The cached JSON artifact is safe to commit and allows incremental builds to resolve backlinks without rescanning every post. The `_meta` block stores a file manifest plus a schema `version`; the cache regenerates automatically when content files change or the schema version bumps (bump `INDEX_VERSION` in `src/utils/backlinks.ts` whenever the artifact shape changes). You can also force regeneration by setting `REGENERATE_BACKLINKS=true`.

## Rendering Conventions

`src/components/Backlinks.astro` renders a title-first list under the heading "Paths into this note", with a subtitle counting how many notes lead here:

- Each entry shows the linking note's title (linked), a category chip and date on the same line, and beneath it the snippet — the sentence in which the link appears — as quieter, left-ruled text. When no snippet survived extraction, the entry falls back to the linking note's `description`.
- Each backlink is normalized before rendering—empty descriptions collapse to nothing, missing categories fall back to `blog`, and internal slugs are rewritten to canonical `/category/slug/` paths so entries behave consistently across evergreen, garden, and Nordletter entries.
- Category chips pass through `CategoryDisplay`, which converts the raw key into the human-friendly label defined in the tagging utilities (for example, `evergreen` → `Evergreen`, `nordletter` → `Nordletter`); dates pass through `TimeDisplay`, which uses relative time for garden categories.
- The section retains the top border divider so it separates from the post metadata.

The component only renders when the backlink array is non-empty to avoid empty headings.

## Extending the Feature

- **New link formats** – Update `collectBacklinkTargets()` if you introduce shortlinks or embed syntaxes so they normalize to the correct `category/slug` keys.【F:src/utils/backlinks.ts†L191-L272】
- **Alternate presentation** – Modify `Backlinks.astro` or create a wrapper slot in `PostLayout.astro` if future templates require richer previews (for example, excerpts or thumbnails). The data contract is isolated from rendering, so adjustments do not impact indexing.
- **Cache strategy** – The system automatically invalidates the cache when content files are modified by comparing file timestamps. This ensures backlinks stay current without manual intervention. The helper warns if it cannot read or write the JSON artifact. Confirm the repo has write permissions or use `REGENERATE_BACKLINKS=true` to force regeneration if needed.【F:src/utils/backlinks.ts†L62-L140】

## Troubleshooting Checklist

| Symptom | Suggested Checks |
| --- | --- |
| Backlinks missing for a known post | Ensure the source post contains a real hyperlink (not plain text) to the target and that both live inside recognized year directories. The cache should auto-regenerate when content changes, but you can force it with `REGENERATE_BACKLINKS=true` if needed. |
| Incorrect URLs in the list | Verify the target post’s `category` matches the canonical URL segment; renaming categories requires updating content or adding redirects so normalization still resolves. |
| Build warnings about the artifact | Inspect filesystem permissions or disk space; the script logs read/write failures before falling back to regeneration. |

## Related Documentation

- [Content Lifecycle](../architecture/content-lifecycle.md) – Explains how year collections and Markdown parsing feed the backlink builder.
- [Design System](../design/system.md) – Covers the shared chip styles used in the backlink UI.
