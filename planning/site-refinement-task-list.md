# Site Refinement Task List

## Completed Changes
- Collapsed the legacy `PageWrapper`, `ContainerWrapper`, and `ProseWrapper` components into a single `LayoutContainer` primitive to centralize spacing and prose-mode configuration across layouts.
- Deferred heavy client logic by introducing the search modal loader island and an API-backed link-hover preview system that fetches metadata on demand instead of embedding the full payload in every page.
- Updated the global layout to expose a `<slot name="head">` extension point and opt-in hooks for search and link previews, threading configuration through the header/navigation layers so static sections can omit unused islands entirely.
- Normalized done-page timeline entries to guarantee valid `endDate` values, preventing the static build from crashing on undefined timestamps.
- Segmented link-hover preview data by category so each section only prefetches the summaries it needs, keeping tooltip payloads lean after the API refactor.
- Extracted a shared `layout-boundary` helper and Tailwind `max-w-layout` token so garden, stream, and bookshelf grids reuse the centered 1400px shell instead of duplicating styles.

## Planned Changes
1. Move global link styling into the Tailwind typography plugin (or semantic utility classes) to replace brittle negative selector chains and keep anchor treatments centralized.
2. Refactor `ShareButton` into a dedicated Astro/TypeScript island so event wiring lives in a module with predictable lifecycle hooks instead of inline scripts.
3. Require parents to provide post collections (or summaries) to `TagList`, eliminating redundant `getAllPosts()` fetches and keeping tag counts in sync with upstream loaders.
4. Pre-render per-tag/category slices so tag detail pages ship static HTML rather than mutating headings and article lists via client scripts.
5. Extend `SectionLanding` props/slots to cover stream and garden needs (counts, tag pickers) so section pages stop wrapping the layout with bespoke markup.
6. Replace the hand-rolled Nordletter signup form with the shared `NewsletterSignup` component to fix nested form-control markup and consolidate styling.
7. Centralize category filtering helpers (e.g., `getPostsByCategory`) so home, garden, and stream routes no longer duplicate filter arrays and sort logic.
