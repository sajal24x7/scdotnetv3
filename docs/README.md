# Project Documentation Index

This directory centralizes all reference material for the Astro-powered build of **sajalchoudhary.net**. Use the tables below to find the appropriate guide for architecture, component behavior, content authoring, and operational workflows.

## Architecture & Design

| Area | Summary | Key Files |
| --- | --- | --- |
| [Architecture Overview](architecture/overview.md) | High-level explanation of the Astro layout shell, content entry points, and client islands. | `src/layouts/Layout.astro`, `src/utils/content.ts` |
| [Content Lifecycle](architecture/content-lifecycle.md) | Frontmatter schemas, category-based collections, indexing, and derived artifacts. | `src/content.config.ts`, `src/utils/backlinks.ts` |
| [Design System](design/system.md) | Typography tokens, grid utilities (twelve-column and ten-column), chip patterns, and responsive rules. | `src/styles/global.css` |
| [Typography Audit (2026-07)](design/typography-audit.md) | Findings on font, size, weight, and spacing consistency, with all fixes applied — kept as rationale for the current scale. | `src/styles/global.css` |

## Components & Pages

| Area | Summary | Key Files |
| --- | --- | --- |
| [Navigation](components/navigation.md) | The Guardian-inspired multi-level navigation (primary/secondary/tertiary strips) and its tag-page island. | `src/components/navigation/*.astro` |
| [Search](components/search.md) | Pagefind-backed search page: index generation and query handling. | `src/pages/search.astro` |
| [Backlinks](components/backlinks.md) | Cached backlink generation and rendering conventions for "Paths into this note". | `src/utils/backlinks.ts`, `src/components/Backlinks.astro` |
| [Books Page](pages/books.md) | Layout structure, grid architecture, and data management for the author's published works page. | `src/pages/books/index.astro` |
| [Shelf Pages](pages/shelf.md) | Frontmatter reference and build-time logic for the bookshelf, filmshelf, tvshelf, and gameshelf pages plus their queues. | `src/pages/shelf/`, `src/pages/bookshelf/`, `src/utils/shelfStatus.ts` |

## Writing & Publishing

| Area | Summary | Key Files |
| --- | --- | --- |
| [Content Authoring](content/authoring.md) | Frontmatter rules, category usage, and the author workflow. | `src/content/**/*`, `src/content.config.ts` |
| [Publishing Pipeline](content/publishing-pipeline.md) | How notes flow from Obsidian/`/write` through the `content` branch to `main`, with validation and syndication. | `.github/workflows/content-publish.yml` |
| [Publishing Shortcut](content/publishing-shortcut.md) | The iOS Shortcut that copies an Obsidian note into the repo inbox for the pipeline. | `scripts/obsidian_to_astro.py` |
| [Micro & Photo Composer](content/micro-composer.md) | The `/write` page: publish micro/photo posts and shelf-queue stubs from any device. | `public/write/index.html`, `functions/api/upload.js` |

## Operations

| Area | Summary | Key Files |
| --- | --- | --- |
| [Deployment](operations/deployment.md) | Local commands, build pipeline (image cache → covers → Astro → Pagefind), and Cloudflare Pages configuration. | `package.json`, `cloudflare-pages.json` |
| [Publication Allowlist](operations/publication.md) | The central explicit-allow list deciding which categories/statuses reach readers via RSS feeds and syndication. | `publication.config.json`, `src/utils/publication.ts` |
| [Syndication](operations/syndication.md) | POSSE workflow (Mastodon, Bluesky, Threads, Instagram), rate limiting, and how URLs are persisted back to content. | `scripts/syndicate-content.js` |
| [Instagram Setup](operations/instagram-setup.md) | One-time Instagram API setup, content requirements, and how photo posts publish there. | `scripts/lib/platforms/instagram.js` |
| [Threads Token Refresh](operations/threads-token-refresh.md) | Automated 60-day token renewal for the Threads API. | `.github/workflows/refresh-threads-token.yml` |
| [Nordletter Image Caching](operations/nordletter-image-cache.md) | Build-time download + manifest workflow for newsletter thumbnails and a template for future asset caches. | `scripts/cache-nordletter-images.js`, `src/components/NordletterGrid.astro` |
| [TIL Vault Sync](operations/til-vault-sync.md) | Work-laptop Obsidian vault sync via the `/write` TIL tab: setup, sync semantics, and API surface. | `public/write/index.html`, `functions/api/til/sync.js` |

## Tools & Automation

| Area | Summary | Key Files |
| --- | --- | --- |
| [Book Cover Downloader](tools/book-cover-downloader.md) | Four-source book cover downloads with quality selection and frontmatter updates. | `scripts/download-book-covers.js` |
| [Shelf Cover Downloaders](tools/shelf-cover-downloaders.md) | TMDB and RAWG/IGDB scripts for film, TV, and game cover artwork, plus the shared workflow. | `scripts/download-*-covers.js`, `.github/workflows/download-covers.yml` |
| [Shelf Metadata Enrichment](tools/shelf-metadata-enrichment.md) | Scripts that fill in missing shelf metadata (author, genre, year, …) from external APIs. | `scripts/enrich-*-metadata.js`, `.github/workflows/enrich-shelf-metadata.yml` |
| [Contributor Notes](contributing/claude-guide.md) | Quick reference for automation assistants contributing to the project (see also the root `AGENTS.md`). | `AGENTS.md` |

> **Planning artifacts** (audits, redesign plans, backlogs) live in the top-level `planning/` directory and are intentionally excluded from this reference library. `scripts/README.md` catalogs the utility scripts, including legacy one-time migrations.
