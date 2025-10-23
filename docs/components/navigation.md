# Header and Navigation System

The navigation stack follows a Guardian-inspired layout with a persistent primary strip, contextual secondary links, and optional search affordances. All markup renders server-side while a small island handles dynamic active states for tag pages.

## Components

| Component | Responsibility |
| --- | --- |
| `src/components/Header.astro` | Wraps the entire header and forwards `currentPage` and `enableSearch` props to the multi-level navigation component.【F:src/components/Header.astro†L1-L13】 |
| `src/components/navigation/MultiLevelNavigation.astro` | Renders the brand, primary and secondary menus, and social/search affordances. It also includes the dataset hooks consumed by the island script.【F:src/components/navigation/MultiLevelNavigation.astro†L1-L183】 |
| `src/components/navigation/SocialLinks.astro` | Displays outbound profiles and the search trigger. The modal trigger is exposed when `enableSearch` is `true` and uses `data-search-modal="global-search"`.【F:src/components/navigation/SocialLinks.astro†L1-L109】 |
| `src/components/islands/multi-level-navigation-island.ts` | Keeps the correct menu section highlighted when browsing `/tags/` pages by reading the `category` query parameter and swapping classes accordingly.【F:src/components/islands/multi-level-navigation-island.ts†L1-L126】 |

`NavigationMenu.astro` is retained for simpler legacy layouts but the header defaults to the richer multi-level navigation.【F:src/components/navigation/NavigationMenu.astro†L1-L56】

## Primary and Secondary Structure

- **Primary nav** – Hard-coded array of the five top-level sections (Garden, Stream, Nordletter, Books, About). Each link declares its active/inactive class sets so the island can toggle states. Server-side heuristics mark the active item when `currentPage` matches the prefix.【F:src/components/navigation/MultiLevelNavigation.astro†L12-L94】
- **Secondary nav** – About, Garden, and Stream each expose section-specific children (e.g., `/evergreen/`, `/blog/`). The markup pre-renders every subsection and hides non-active blocks with the `hidden` attribute. URLs are matched against `currentPage` and `data-secondary-href` values to set active styling.【F:src/components/navigation/MultiLevelNavigation.astro†L96-L173】
- **Tag overrides** – When visiting `/tags/?category=til`, the island script remaps the active main/secondary links using the `categoryMappings` table, ensuring tag filters mirror the canonical section colors.【F:src/components/islands/multi-level-navigation-island.ts†L1-L80】

## Social Links and Search

`SocialLinks.astro` supports horizontal or vertical layouts and can trim to essential links. Passing `enableSearch` keeps the search button in the rendered list; otherwise it is filtered out. The search button is a `<button>` with `aria-haspopup="dialog"` and `data-search-modal="global-search"`, allowing the search modal loader to attach interactions.【F:src/components/navigation/SocialLinks.astro†L27-L109】

## Styling Notes

- Active states are applied by swapping Tailwind utility class sets defined in `data-active-class` and `data-inactive-class`. This avoids server re-renders when the island toggles sections.【F:src/components/navigation/MultiLevelNavigation.astro†L60-L140】
- The layout uses the `.name-social-row` and `.secondary-in-grid` grid utilities defined in `src/styles/global.css` to align the brand, nav, and social icons within the twelve-column system.【F:src/components/navigation/MultiLevelNavigation.astro†L118-L173】【F:src/styles/global.css†L662-L920】

## Extending the Navigation

| Goal | Suggested Approach |
| --- | --- |
| Add a new top-level section | Extend the `mainNavItems` array and update `categoryMappings` so tag pages pick up the new section. Adjust layout CSS if the nav overflows. |
| Update secondary menus | Modify the `secondaryNavItems` map and ensure the island mapping routes any related categories to the new subsection. |
| Toggle search globally | Pass `enableSearchModal: true` when invoking `Layout.astro` for pages that should expose the search button (the modal itself is only hydrated if enabled).【F:src/layouts/Layout.astro†L8-L76】 |
| Provide a compact header | Reuse `NavigationMenu.astro` or create a new wrapper that composes the shared `SocialLinks` component with minimal styling. |

## Related Documentation

- [Design System](../design/system.md) – Explains the twelve-column grid and typography tokens used in the header.
- [Search Modal](search.md) – Details how the search trigger integrates with the modal island.
