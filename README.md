# sajalchoudhary.net

Source code for [sajalchoudhary.net](https://sajalchoudhary.net), an Astro-powered personal site. Comprehensive reference material lives under [`docs/`](docs/README.md); start there for architecture, design system, and operational guides. Agent-facing contribution guidelines are in [`AGENTS.md`](AGENTS.md).

## Quick Start

Requires Node 22.12+ and npm 10+.

```bash
npm install
npm run dev       # cache newsletter images, generate covers, start dev server
npm run build     # same pre-steps, astro build, then Pagefind search indexing
npm run preview   # serve the last build
```

The site deploys to Cloudflare Pages via `npm run build:cloudflare` (identical to `build`). See [`docs/operations/deployment.md`](docs/operations/deployment.md).

## Content Buckets

The site organizes writing into the following buckets:

1. **Notes** – `evergreen`, `now`
2. **Ephemera** – `micro`, `blog`, `photo`, `til`
3. **Fiction** – `poem`, `story`
4. **Newsletter** – `nordletter`
5. **Shelf** – `bookshelf`, `filmshelf`, `tvshelf`, `gameshelf`
6. **Meta** – `colophon`

Content lives in one folder per category under `src/content/` (e.g. `src/content/blog`, `src/content/bookshelf`), validated by the shared schema in `src/content.config.ts`. Never hard-code the category list — read it at runtime via `getContentCategories()` / `getAllPosts()` from `src/utils/content.ts`. New notes arrive through `src/content/inbox/` and are sorted by the [publishing pipeline](docs/content/publishing-pipeline.md); quick posts publish instantly from the [`/write` composer](docs/content/micro-composer.md).

## Layout Building Blocks

- **Section landings**: Pages that render archive-style grids share a common `SectionLanding` configuration. Use `createSectionLandingProps` from `src/utils/sectionLanding.ts` to pull in the default layout, heading size, and padding tokens before applying route-specific overrides.
- **Page wrapper**: The site-wide `Layout` component exposes a `pageWrapper` hook that forwards props to `LayoutContainer`. Rely on its `padding` and `paddingScale` tokens instead of sprinkling Tailwind utility classes; keep the wrapper neutral and push contextual spacing into inner surfaces.
- **Progress pages**: `/now/` and `/then/` both render through `src/components/layout/ProgressLayout.astro`, which handles the two-column stats rail and main content slot.
- **Long-form posts**: Articles rendered by `[...slug].astro` use `src/components/layout/PostLayout.astro` to standardize hero metadata, tags, backlinks, and microformat wiring.

## Documentation

| Topic | Where |
| --- | --- |
| Architecture, design system, components | [`docs/README.md`](docs/README.md) |
| Writing & publishing (pipeline, `/write`, authoring) | [`docs/content/`](docs/README.md#writing--publishing) |
| Operations (deploy, syndication, token refresh) | [`docs/operations/`](docs/README.md#operations) |
| Contribution guidelines for agents & humans | [`AGENTS.md`](AGENTS.md) |
| Planning artifacts, audits, backlogs | `planning/` |

## License

The **source code** is released under the [MIT License](LICENSE). The
**content** — all writing, original images, and everything under
`src/content/` — is **not** MIT-licensed: it is © Sajal Choudhary, all
rights reserved. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md) for the exact
scope, including the note on third-party cover artwork.
