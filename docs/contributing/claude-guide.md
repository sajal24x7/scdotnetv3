# Automation Assistant Reference

This document provides context for large-language-model contributors working inside this repository. It distills the most important operational knowledge and points to deeper references in the `docs/` directory. The root [`AGENTS.md`](../../AGENTS.md) is the primary agent-facing guide; this page is the quick version.

## Project Snapshot

- **Framework** – Astro 7 with Tailwind CSS 4 and MDX support (`astro.config.mjs`).
- **Content source** – Markdown/MDX entries in one folder per category under `src/content/` (e.g. `src/content/blog`, `src/content/bookshelf`), with the shared schema and `CONTENT_CATEGORIES` list defined in `src/content.config.ts`. Never hard-code the category list — read it via `getContentCategories()`.
- **Key utilities** – `src/utils/content.ts` exposes `getContentCategories()`, `getAllPosts()`, `getPostsByCategory()`, and `transformPost()`, used throughout the site.

Consult the [Architecture Overview](../architecture/overview.md) for a full tour of entry points and layout structure.

## Common Commands

```bash
npm run dev            # Cache Nordletter images, generate book covers, start Astro dev server
npm run build          # Same pre-steps, astro build, then Pagefind indexing (pagefind --site dist)
npm run build:cloudflare  # Identical to build; the command Cloudflare Pages runs
npm run preview        # Serve the latest production build
npm run syndicate:dry-run # Preview POSSE output without publishing
```

Node 22.12+ and npm 10+ are required for parity with the production environment (`engines` in `package.json`).

## Implementation Guidance

- Always create a feature branch before editing code (the repository uses short, action-oriented commit subjects).
- Preserve the twelve-column grid utilities defined in `src/styles/global.css` when adjusting layouts; see [Design System](../design/system.md).
- Use the `--text-*` type-scale tokens and `--font-sans`/`--font-serif`/`--font-mono` family tokens — never hard-code `font-size` or a font stack in component styles.
- Fetch content once in route files and pass subsets to components instead of re-querying. Utilities are memoized to avoid redundant reads.
- Respect the metadata chip language documented under [Design System](../design/system.md#metadata-chips) when adding new UI surfaces.
- Backlinks, search, and syndication workflows are covered in dedicated documents under `docs/components` and `docs/operations`.

## Tooling Etiquette

- Syndication is **not** part of the build — it runs via `.github/workflows/syndicate-content.yml` (triggered by pushes to `main` and dispatched by the publishing pipeline). Use `npm run syndicate:dry-run` to test POSSE output locally without publishing.
- Run `npx astro check` before opening a pull request. No separate ESLint/Prettier config is present; maintain existing formatting and four-space indentation in TypeScript modules.

## Additional Resources

- [Project Documentation Index](../README.md)
- [Content Authoring Guide](../content/authoring.md)
- [Publishing Pipeline](../content/publishing-pipeline.md)
- [Deployment Guide](../operations/deployment.md)
