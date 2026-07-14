# Deployment and Build Pipeline

This site deploys to Cloudflare Pages and uses npm scripts to orchestrate pre-build tasks such as cover generation.

## Environment Requirements

- Node.js ≥ 22.12.0 and npm ≥ 10 are required locally and in CI/CD, matching the `engines` field in `package.json`.【F:package.json†L5-L23】
- Cloudflare Pages specifies Node 22 in `cloudflare-pages.json`, ensuring parity between local builds and production.【F:cloudflare-pages.json†L1-L8】

## Core Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Generates bookshelf covers and starts the Astro dev server with live reload.【F:package.json†L11-L18】 |
| `npm run build` | Generates covers, runs `astro build`, and then triggers the POSSE syndication shell script. The syndication step is allowed to fail without failing the build (`|| true`).【F:package.json†L11-L16】 |
| `npm run build:cloudflare` | Same as `npm run build` but skips the syndication shell script; this is the command executed in Cloudflare Pages.【F:package.json†L11-L16】【F:cloudflare-pages.json†L1-L8】 |
| `npm run preview` | Serves the contents of the `dist/` directory for validation.【F:package.json†L11-L21】 |

## Build Sequence

1. **Cover generation** – `scripts/generate-book-covers.js` creates or updates cover art assets referenced by bookshelf entries before the Astro compiler runs. The command is idempotent and safe to run repeatedly.
2. **Astro build** – Generates static HTML, JSON endpoints, and asset bundles under `dist/`.
3. **Optional syndication** – The default `npm run build` calls `./scripts/trigger-syndication.sh`. Cloudflare skips this step because it uses `npm run build:cloudflare`.

## Cloudflare Pages Configuration

- Build command: `npm run build:cloudflare`
- Output directory: `dist`
- Environment variables: set in the Pages dashboard for secrets (e.g., syndication credentials). None are hard-coded in the repo.

If you add new build-time scripts, update both `package.json` and `cloudflare-pages.json` so local and hosted builds remain consistent.

## Deployment Checklist

- Run `npm install` after pulling changes to ensure dependencies align with the lockfile.
- Execute `npm run build` locally before pushing major changes to catch integration regressions.
- Commit regenerated artifacts (`src/data/backlinks-index.json`, generated covers) when they change; the build relies on these caches to stay warm.

## Related Documentation

- [Syndication Workflow](syndication.md)
- [Content Lifecycle](../architecture/content-lifecycle.md)
