# Deployment and Build Pipeline

This site deploys to Cloudflare Pages and uses npm scripts to orchestrate pre-build tasks such as image caching and cover generation.

## Environment Requirements

- Node.js ≥ 22.12.0 and npm ≥ 10 are required locally and in CI/CD, matching the `engines` field in `package.json`.
- Cloudflare Pages specifies Node 22 in `cloudflare-pages.json`, ensuring parity between local builds and production (a `NODE_VERSION` set in the Pages dashboard overrides this file).

## Core Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Caches Nordletter images, generates bookshelf covers, then starts the Astro dev server with live reload. |
| `npm run build` | Runs the same pre-steps, then `astro build`, then `pagefind --site dist` to generate the search index. |
| `npm run build:cloudflare` | Identical to `npm run build`; this is the command configured in Cloudflare Pages. |
| `npm run preview` | Serves the contents of the `dist/` directory for validation. |

## Build Sequence

1. **Nordletter image cache** – `scripts/cache-nordletter-images.js` downloads any missing newsletter thumbnails and refreshes the manifest (see [Nordletter Image Cache](nordletter-image-cache.md)).
2. **Cover generation** – `scripts/generate-book-covers.js` regenerates the TypeScript cover map for bookshelf images. Idempotent and safe to run repeatedly.
3. **Astro build** – Generates static HTML, JSON endpoints, and asset bundles under `dist/`. Cloudflare Pages Functions in `functions/` deploy alongside the static output.
4. **Pagefind indexing** – `pagefind --site dist` crawls the built HTML and writes the static search index to `dist/pagefind/`.

Syndication is **not** part of the build. It runs as a separate, scheduled GitHub Actions workflow (`.github/workflows/syndicate-content.yml`, every 3 hours) — see [Syndication Workflow](syndication.md).

## Cloudflare Pages Configuration

- Build command: `npm run build:cloudflare`
- Output directory: `dist`
- Environment variables: set in the Pages dashboard for secrets. The R2 `IMAGES` binding powers `/write` uploads (see [Micro Composer](../content/micro-composer.md)). None are hard-coded in the repo.

If you add new build-time scripts, update both `package.json` and (if the Node version or command changes) `cloudflare-pages.json` so local and hosted builds remain consistent.

## Deployment Checklist

- Run `npm install` after pulling changes to ensure dependencies align with the lockfile.
- Execute `npm run build` locally before pushing major changes to catch integration regressions.
- Commit regenerated artifacts (`src/data/backlinks-index.json`, generated covers) when they change; the build relies on these caches to stay warm.

## Related Documentation

- [Syndication Workflow](syndication.md)
- [Publishing Pipeline](../content/publishing-pipeline.md)
- [Content Lifecycle](../architecture/content-lifecycle.md)
