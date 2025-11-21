# Project Documentation Index

This directory centralizes all reference material for the Astro-powered build of **sajalchoudhary.net**. Use the table below to find the appropriate guide for architecture, component behavior, content authoring, and operational workflows.

| Area | Summary | Key Files |
| --- | --- | --- |
| [Architecture Overview](architecture/overview.md) | High-level explanation of the Astro layout shell, content entry points, and client islands. | `src/layouts/Layout.astro`, `src/utils/content.ts`
| [Content Lifecycle](architecture/content-lifecycle.md) | Details on frontmatter schemas, year-based collections, indexing, and backlinks. | `src/content/config.ts`, `src/utils/backlinks.ts`
| [Design System](design/system.md) | Documentation for typography, grid utilities (twelve-column and ten-column), chip patterns, and responsive rules. | `src/styles/global.css`
| [Navigation](components/navigation.md) | Behavior of the Guardian-inspired multi-level navigation and header search affordances. | `src/components/navigation/*.astro`
| [Search Modal](components/search.md) | Search index generation, lazy island loading, and scoring heuristics. | `src/pages/search-index.json.ts`, `src/components/islands/search-modal-island.ts`
| [Backlinks](components/backlinks.md) | Cached backlink generation and rendering conventions for related-post callouts. | `src/utils/backlinks.ts`, `src/components/Backlinks.astro`
| [Content Authoring](content/authoring.md) | Guidelines for writing Markdown/MDX entries, metadata expectations, and category usage. | `src/content/**/*`
| [Books Page](pages/books.md) | Layout structure, grid architecture, and data management for the author's published works page. | `src/pages/books/index.astro`
| [Deployment](operations/deployment.md) | Local commands, build pipeline, and Cloudflare Pages configuration. | `package.json`, `cloudflare-pages.json`
| [Webmentions](operations/webmentions.md) | Build-time sync, spam filtering, and UI consumption of webmentions. | `scripts/fetch-webmentions.js`, `src/components/Webmentions.astro`
| [Nordletter Image Caching](operations/nordletter-image-cache.md) | Build-time download + manifest workflow for newsletter thumbnails and a template for future asset caches. | `scripts/cache-nordletter-images.js`, `src/components/NordletterGrid.astro`
| [Syndication](operations/syndication.md) | POSSE workflow, rate limiting, and how URLs are persisted back to content. | `scripts/syndicate-content.js`
| [Contributor Notes](contributing/claude-guide.md) | Quick reference for automation assistants contributing to the project. | `docs/contributing/claude-guide.md`

> **Planning artifacts** remain in the top-level `planning/` directory and are intentionally excluded from this reference library.
