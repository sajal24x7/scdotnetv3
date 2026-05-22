# Automation Assistant Reference

This document provides context for large-language-model contributors working inside this repository. It distills the most important operational knowledge and points to deeper references in the `docs/` directory.

## Project Snapshot

- **Framework** – Astro 5 with Tailwind CSS (base styles disabled) and MDX support.【F:astro.config.mjs†L1-L22】
- **Content source** – Markdown/MDX entries grouped by year inside `src/content/YYYY`, with schemas defined in `src/content/config.ts`. Never hard-code the list of years.【F:src/content/config.ts†L1-L55】
- **Key utilities** – `src/utils/content.ts` exposes `getYearDirectories()`, `getAllPosts()`, and helper filters used throughout the site.【F:src/utils/content.ts†L1-L111】

Consult the [Architecture Overview](../architecture/overview.md) for a full tour of entry points and layout structure.

## Common Commands

```bash
npm run dev            # Generate book covers, start Astro dev server
npm run build          # Generate covers, run astro build, attempt syndication
npm run build:cloudflare  # Build without firing the syndication shell script
npm run preview        # Serve the latest production build
```

Node 20+ and npm 10+ are required for parity with the production environment.【F:package.json†L1-L23】

## Implementation Guidance

- Always create a feature branch before editing code (the repository uses short, action-oriented commit subjects).
- Preserve the twelve-column grid utilities defined in `src/styles/global.css` when adjusting layouts; see [Design System](../design/system.md).
- Fetch content once in route files and pass subsets to components instead of re-querying. Utilities are memoized to avoid redundant file system reads.【F:src/utils/content.ts†L38-L92】
- Respect the metadata chip language documented under [Design System](../design/system.md#metadata-chips) when adding new UI surfaces.
- Backlinks, search, and syndication workflows are covered in dedicated documents under `docs/components` and `docs/operations`.

## Tooling Etiquette

- `npm run build` triggers `scripts/trigger-syndication.sh` at the end; the script is allowed to fail without breaking the build (`|| true`).【F:package.json†L11-L16】
- Use `npm run syndicate:dry-run` to test POSSE output locally without publishing to platforms.【F:package.json†L17-L21】
- Linting relies on Tailwind and Astro defaults; no separate ESLint/Prettier config is present. Maintain existing formatting and four-space indentation in TypeScript modules.

## Additional Resources

- [Project Documentation Index](../README.md)
- [Content Authoring Guide](../content/authoring.md)
- [Deployment Guide](../operations/deployment.md)
