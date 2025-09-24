# Site Refinement Task List

## Completed Changes
- Collapsed the legacy `PageWrapper`, `ContainerWrapper`, and `ProseWrapper` components into a single `LayoutContainer` primitive to centralize spacing and prose-mode configuration across layouts.
- Deferred heavy client logic by introducing the search modal loader island and an API-backed link-hover preview system that fetches metadata on demand instead of embedding the full payload in every page.
- Updated the global layout to expose opt-in hooks for search and link previews, threading configuration through the header/navigation layers so static sections can omit unused islands.
- Normalized done-page timeline entries to guarantee valid `endDate` values, preventing the static build from crashing on undefined timestamps.

## Planned Changes
1. Expose a named `<slot name="head">` (plus supporting props) in the global layout so pages can extend canonical and OpenGraph metadata while reusing shared defaults.
2. Ship the search modal island lazily (e.g., `client:idle`) and avoid loading it on pages without triggers to reduce initial JavaScript execution.
3. Segment link-hover preview data so only relevant summaries load per section and the tooltip logic mounts on demand.
4. Extract shared grid/list helpers—or Tailwind theme tokens—for the repeated “centered, max-width 1400px” pattern used by garden, stream, bookshelf, and related layouts.
5. Move global link styling into the Tailwind typography plugin (or semantic utility classes) to replace brittle negative selector chains and keep anchor treatments centralized.
6. Refactor `ShareButton` into a dedicated Astro/TypeScript island so event wiring lives in a module with predictable lifecycle hooks instead of inline scripts.
7. Require parents to provide post collections (or summaries) to `TagList`, eliminating redundant `getAllPosts()` fetches and keeping tag counts in sync with upstream loaders.
8. Pre-render per-tag/category slices so tag detail pages ship static HTML rather than mutating headings and article lists via client scripts.
9. Extend `SectionLanding` props/slots to cover stream and garden needs (counts, tag pickers) so section pages stop wrapping the layout with bespoke markup.
10. Replace the hand-rolled Nordletter signup form with the shared `NewsletterSignup` component to fix nested form-control markup and consolidate styling.
11. Centralize category filtering helpers (e.g., `getPostsByCategory`) so home, garden, and stream routes no longer duplicate filter arrays and sort logic.
