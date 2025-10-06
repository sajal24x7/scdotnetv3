# Repository Guidelines

## Frameworks & Tooling
- **Astro 5.x** drives page generation and content collections. Routes live under `src/pages`, islands under `src/components`, and layout primitives in `src/layouts`.
- **TypeScript-first utilities** power content aggregation. Prefer named exports and keep helpers in `src/utils` alongside related Zod schemas in `src/types`.
- **Tailwind CSS** provides styling; keep bespoke styles minimal and colocate reusable patterns in `src/styles`.
- **Build-time integrations** cover cover-art generation, webmention syncing, and POSSE syndication. Follow the existing npm scripts (`npm run dev`, `npm run build`, etc.) to trigger the full pipeline.

## Project Structure & Module Organization
The Astro site lives in `src`, with route files under `src/pages`, shared layout primitives in `src/layouts`, and UI elements in `src/components`. Structured content is kept in `src/content/<year>/<slug>.md` folders; use the same year split when adding notes, ephemera, or newsletters so collection helpers can enumerate years dynamically. Data helpers sit in `src/data` and `src/types`, while `src/utils` holds reusable formatters and content loaders. Static assets belong in `public` and generated covers are written to `src/assets/covers`; the production build emits to `dist`.

## Build, Test, and Development Commands
Run `npm install` with Node 20+ before contributing. Use `npm run dev` for the local server; it pre-builds covers and watches Astro files. `npm run build` executes cover generation, syncs webmentions, builds the static site, and best-effort triggers syndication. `npm run preview` serves the last build. Sync webmentions on demand with `npm run fetch-webmentions`, and use `npm run syndicate:dry-run` to verify outbound syndication without publishing.

## Coding Style & Naming Conventions
Follow the existing 4-space indentation in TypeScript, Astro, and scripts. Name Astro components with `PascalCase.astro` and colocate supporting modules in subfolders (for example `src/components/navigation`). Keep utility modules in TypeScript (`.ts`) and prefer named exports. Styling relies on Tailwind; favor utility classes over bespoke CSS unless adding a shared pattern to `src/styles`. Run `npm run astro check` (or `npx astro check`) before opening a pull request.

## Testing Guidelines
No automated test suite is configured; rely on `npm run dev` for interactive verification and `npm run build` to catch integration issues. When adding logic-heavy utilities, include minimal unit scripts under `src/utils/__checks__` or document manual test steps in the pull request until a formal harness is introduced.

## Commit & Pull Request Guidelines
Commits in this repository use short, action-focused subjects (e.g., `Minor ui changes`, `NL72`). Keep to 65 characters, start with an imperative verb when possible, and scope single features or fixes per commit. Pull requests should describe the change, reference any related issue, and note content updates or scripts executed. Include screenshots or URLs if you adjust visual components, and call out any manual verification performed.

## Content Loading & Authoring Tips
- **Dynamic discovery only**: Never hardcode year directories or category lists. Use the helpers in `src/utils/content.ts` (`getYearDirectories`, `getAllPosts`, `getPostsByCategory`, `transformPost`) to aggregate content.
- **Pass collections through**: Components like `TagList`, feed grids, and layout slots expect the upstream route to fetch posts once (usually via `getAllPosts()`) and pass filtered subsets down. Avoid re-fetching inside components.
- **Frontmatter consistency**: Match existing schema defined in `src/content/config.ts`. Categories drive layout decisions, so keep metadata accurate.
- **Generated media**: Run the cover generator (`npm run generate-covers`) for book imagery. Store other large assets in `public` or reference hosted media via frontmatter fields.

## Layout & Interaction Guidelines
- **LayoutContainer** centralizes spacing, prose width, and slot plumbing across routes. Use it instead of legacy `PageWrapper`/`ContainerWrapper`/`ProseWrapper` components.
- **Head slots and optional islands**: The global layout exposes `<slot name="head">` and opt-in hooks for search or link-preview islands. Thread configuration from pages down through navigation layers so static routes can omit client bundles they don't need.
- **Deferred interactivity**: Search and link-preview features load client logic lazily. Prefer loader islands and API-backed previews over embedding heavy payloads in every page.
- **Shared filtering helpers**: Category filtering logic lives in `src/utils/content.ts`—reuse those helpers for home, garden, stream, and bookshelf views to keep behavior consistent.
- **Twelve-column grid usage**:
  - `Layout.astro` already wraps every page in a `.twelve-grid` shell with shared gap and padding tokens. Reach for existing layout components (`LayoutContainer`, `SectionLanding`, `StreamLayout`, `GardenGrid`, `BookGrid`, `BookDetailLayout`, `NordletterGrid`) before introducing fresh wrappers so column spans stay consistent.【F:planning/twelve-column-grid-task-list.md†L5-L140】【F:planning/twelve-grid-padding-followup.md†L10-L94】
  - Control gutters with the dedicated helpers (`grid-pad-narrow`, `grid-pad-wide`, `grid-pad-none`) instead of ad-hoc `px-*` classes; pair them with `grid-gap-tight` / `grid-gap-loose` when sections need custom rhythm.【F:src/styles/global.css†L536-L577】【F:planning/twelve-grid-padding-followup.md†L10-L78】
  - Assign column widths and offsets via the span/start utilities (`grid-span-*`, `grid-start-*`) or the prebuilt component APIs rather than stacking multiple `.twelve-grid` containers. Only add a new grid host when a section truly needs its own twelve-column context (for example, distinct sub-layouts on `/feeds` or `/tags`).【F:src/styles/global.css†L662-L920】【F:planning/twelve-grid-audit.md†L17-L108】
  - When building new templates, keep the goal of “one canonical grid host per logical section” in mind to avoid the wrapper proliferation called out in the audit. If you must nest grids, document why in the PR so the next pass can fold it into the shared `LayoutContainer` roadmap.【F:planning/twelve-grid-audit.md†L84-L124】【F:planning/twelve-grid-rollout-task-list.md†L1-L43】
  - **Twelve-column implementation checklist**:
    1. Start by confirming the page is mounted inside `Layout.astro` with a `pageWrapper` that exposes the shared `.twelve-grid`. Avoid wrapping the page content in another `.twelve-grid` unless the section needs an entirely separate layout context.
    2. For each major section (`<section>`, `<aside>`, etc.), add a helper class that sets `display: contents;`. This keeps the semantic element without breaking the twelve-column flow, letting each child div/figure participate in the grid directly.
    3. Assign desktop layouts with the provided `grid-span-*` and `grid-start-*` utilities (for example: `grid-span-3`, `grid-span-7`, `grid-start-9`). Use full-width defaults on mobile; the utilities collapse to the stacked layout automatically below 48rem.
    4. Control vertical rhythm and offsets with spacing utilities or lightweight scoped styles rather than new wrapper divs. Reach for the existing clamp-based padding patterns so sections remain consistent with the global grid tokens.
    5. When reorganising older `.row`-based markup, remove the extra row container and re-map the children directly onto column spans. Spot-check the result at mobile, tablet (≥48rem), and large desktop widths to ensure columns align to the 1/12, 3/12, 4/12, 7/12, 8/12, etc. patterns requested in the grid audit.

## Card Components
- `src/components/Card.astro` is the base article card used by `GardenGrid` (and therefore Garden, Evergreen, TIL, Stories, Poems) to render post summaries with optional micro-post prose.
- `src/components/PostCard.astro` wraps the base card for classic blog feeds and is consumed by `PostList` when a route wants stacked post cards.
- `src/components/bookshelf/BookCard.astro` powers the bookshelf UI via `BookGrid`, formatting status, dates, and cover art for reading logs.
- `StreamLayout` renders stream entries with `PostItem` instead of a dedicated card, and `NordletterGrid` ships bespoke markup for newsletter issues; there is no standalone stream or newsletter card component after the legacy `StreamCard` removal.
- **Homepage Featured** reads its source slugs from `src/data/homeFeatured.json`. Keep that file to bare post slugs (e.g., `"the-goal-with-yoga"`) so the homepage lookup `postsBySlug.get(slug)` can match frontmatter `slug` values without needing category prefixes or full URLs.
