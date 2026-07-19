# Header and Navigation System

The navigation stack follows a Guardian-inspired layout with a persistent primary strip, contextual secondary links, and a tertiary strip for the shelf pages. All markup renders server-side while a small island handles dynamic active states for tag pages. Search has no header affordance — it lives at `/search/` (see [Search Page](search.md)).

## Components

| Component | Responsibility |
| --- | --- |
| `src/components/Header.astro` | Wraps the header and forwards `currentPage` to the multi-level navigation component. |
| `src/components/navigation/MultiLevelNavigation.astro` | Renders the brand, primary/secondary/tertiary menus, and social links. It also includes the dataset hooks (`data-main-key`, `data-secondary-nav`, `data-tertiary-nav`) consumed by the island script. |
| `src/components/navigation/SocialLinks.astro` | Displays outbound profiles (Mastodon, Bluesky, etc.) with `rel="me"` links. Supports horizontal/vertical layouts, sizes, and an essential-links-only mode. |
| `src/components/islands/multi-level-navigation-island.ts` | Keeps the correct menu section highlighted when browsing `/tags/` pages by reading the `category` query parameter and swapping classes accordingly. |

The header always renders the multi-level navigation; the legacy `NavigationMenu.astro` was removed in the 2026-07 audit after going unused.

## Navigation Levels

- **Primary nav** – Hard-coded `mainNavItems` array of the five top-level sections: Garden, Stream, Nordletter, Books, About. Each link declares its active/inactive class sets so the island can toggle states. Server-side heuristics mark the active item when `currentPage` matches the prefix.
- **Secondary nav** – Section-specific children, pre-rendered for every section and hidden with the `hidden` attribute when inactive:
  - **About** → Colophon, Now, Feeds
  - **Garden** → Evergreen, TIL, Shelf, Stories, Poems
  - **Stream** → Blog, Micro, Photos
- **Tertiary nav (shelf)** – On shelf routes, a third strip (`tertiaryNavItems`) links the four shelf categories: `/bookshelf/` (Books), `/filmshelf/` (Film), `/tvshelf/` (TV), `/gameshelf/` (Games).
- **Tag overrides** – When visiting `/tags/?category=til`, the island script remaps the active main/secondary/tertiary links using its `categoryMappings` table, ensuring tag filters mirror the canonical section highlighting.

## Styling Notes

- Active states are applied by swapping Tailwind utility class sets defined in `data-active-class` and `data-inactive-class`. This avoids server re-renders when the island toggles sections.
- The layout uses the `.name-social-row` and `.secondary-in-grid` grid utilities defined in `src/styles/global.css` to align the brand, nav, and social icons within the twelve-column system.

## Extending the Navigation

| Goal | Suggested Approach |
| --- | --- |
| Add a new top-level section | Extend the `mainNavItems` array and update the island's `categoryMappings` so tag pages pick up the new section. Adjust layout CSS if the nav overflows. |
| Update secondary menus | Modify the `secondaryNavItems` map and ensure the island mapping routes any related categories to the new subsection. |
| Add a shelf category | Extend `tertiaryNavItems` alongside the content-collection changes described in [Content Lifecycle](../architecture/content-lifecycle.md). |
| Provide a compact header | Create a wrapper that composes the shared `SocialLinks` component with minimal styling. |

## Related Documentation

- [Design System](../design/system.md) – Explains the twelve-column grid and typography tokens used in the header.
- [Search Page](search.md) – The Pagefind-backed search experience.
