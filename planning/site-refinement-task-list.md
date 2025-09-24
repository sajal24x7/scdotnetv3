# Site Refinement Task List

## Completed Changes
- Collapsed the legacy `PageWrapper`, `ContainerWrapper`, and `ProseWrapper` components into a single `LayoutContainer` primitive to centralize spacing and prose-mode configuration across layouts.
- Deferred heavy client logic by introducing the search modal loader island and an API-backed link-hover preview system that fetches metadata on demand instead of embedding the full payload in every page.
- Updated the global layout to expose a `<slot name="head">` extension point and opt-in hooks for search and link previews, threading configuration through the header/navigation layers so static sections can omit unused islands entirely.
- Normalized done-page timeline entries to guarantee valid `endDate` values, preventing the static build from crashing on undefined timestamps.
- Segmented link-hover preview data by category so each section only prefetches the summaries it needs, keeping tooltip payloads lean after the API refactor.
- Extracted a shared `layout-boundary` helper and Tailwind `max-w-layout` token so garden, stream, and bookshelf grids reuse the centered 1400px shell instead of duplicating styles.
- Restored inline link highlighting while keeping global CSS underline-free and inheriting the default text color in both light and dark modes.
- Refactored the ShareButton into a reusable island powered by a dedicated TypeScript module so client lifecycle and event wiring are managed outside inline scripts.
- Required every TagList consumer to supply the posts collection so the component reuses upstream loaders instead of issuing its own `getAllPosts()` call.
- Pre-rendered tag detail pages for each category slice so the markup ships statically without relying on client-side DOM mutations for filtered views.
- Extended SectionLanding with count variants, configurable tag list props, and a dedicated count slot so stream and garden sections can rely on the layout without bespoke wrappers.
- Replaced the Nordletter signup form with the shared `NewsletterSignup` component so the embed uses consistent markup and styling across the site.
- Centralized category filtering helpers so home, garden, and stream routes reuse shared category groups and sort logic.
- Added a skip navigation link, landmark id, and `aria-current` attributes so keyboard and screen reader users can bypass the header and understand active navigation states.

## Planned Changes
- _(None yet)_
