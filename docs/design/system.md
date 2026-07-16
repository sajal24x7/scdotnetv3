# Design System

The site’s visual language is codified in `src/styles/global.css` and a handful of shared components. This guide captures the key tokens, layout utilities, and reusable UI patterns that every page should follow.

## Theme Tokens

- CSS custom properties define typography scales (`--text-xs` through `--text-huge`), spacing clamps for the grid, and color primitives for both light and dark themes.【F:src/styles/global.css†L8-L76】
- The `:root` palette sets background, text, accent, and border colors, while the `.dark` block overrides them when the OS prefers dark mode. The layout script in `Layout.astro` toggles the `dark` class based on media queries to avoid flashes of unstyled content.【F:src/styles/global.css†L8-L76】【F:src/layouts/Layout.astro†L58-L88】

## Typography

- Body copy uses the Inter variable font, while headings switch to Fraunces for a serif accent. Code uses the shared `--font-mono` stack. Utilities like `.text-xs`, `.text-small`, `.text-medium`, `.text-large`, `.text-xlarge`, and `.text-huge` map directly to the CSS variables for consistent sizing.【F:src/styles/global.css†L16-L100】
- **Type scale**:

  | Token | Value | Role |
  | --- | --- | --- |
  | `--text-xs` | `0.75rem` (fixed) | Chips, uppercase labels, `text-xs` |
  | `--text-small` | `clamp(0.875rem, 2vw, 1rem)` | Meta, captions, `h6`, `text-sm` |
  | `--text-normal` | `clamp(1rem, 2.5vw, 1.125rem)` | Body copy, `h4`–`h5`, `text-base` |
  | `--text-medium` | `clamp(1.125rem, 2.5vw, 1.25rem)` | `h3`, `text-lg` |
  | `--text-large` | `clamp(1.25rem, 4vw, 1.5rem)` | `h2` |
  | `--text-xlarge` | `clamp(1.75rem, 4vw, 2.25rem)` | Feed / list section titles |
  | `--text-huge` | `clamp(2rem, 5vw, 3rem)` | `h1`, page and year titles |

  `--text-xs` is intentionally fixed rather than fluid — chips and labels are small UI elements that don't need viewport scaling. Every other token is fluid via `clamp()`.

- Tailwind's fixed `text-xs` / `text-sm` / `text-base` / `text-lg` utilities are remapped to these tokens (via `@theme` / `@theme inline`) so both spellings resolve to the same size at every width.【F:src/styles/global.css†L16-L30】
- **Headings** are Fraunces throughout, including the site masthead. `h1` is weight 700; `h2` is 600; `h3` is 500 at `--text-medium`; `h4` is 600 and `h5` is 500, both at `--text-normal`; `h6` drops to `--text-small` at weight 500 so it's genuinely smaller than body text rather than just a different font. Prose headings reuse the same tokens so an `<h2>` is one size inside and outside prose containers.【F:src/styles/global.css†L160-L235】
- Prefer the `--text-*` tokens over ad-hoc `font-size` values in component styles, and reference `--font-mono` rather than re-declaring a monospace stack.
- **Uppercase label/chip tracking** uses two `letter-spacing` values: `0.08em` for chip-size text (`--text-xs`) and `0.04em` for larger uppercase labels (`--text-small` and up). Non-uppercase chip text (e.g. mixed-case timeline/date chips) isn't part of this convention and may use tighter tracking.
- **Reading line-height** is `1.6` for body copy and UI paragraphs, and `1.75` for `.prose p`/`.prose li` (long-form article content). Don't introduce a third "comfortable reading" value.
- The `LayoutContainer` component exposes a `prose` flag to enable Tailwind’s typography plugin, ensuring long-form pages adhere to consistent widths and heading treatments.【F:src/components/layout/LayoutContainer.astro†L1-L64】

## Grid Systems

### Twelve-Column Grid

- `.twelve-grid` establishes the responsive grid shell used on most pages. On small screens it collapses to a single column; at `48rem` the layout expands to twelve equal columns.【F:src/styles/global.css†L515-L561】
- Utility classes such as `grid-span-{n}` and `grid-start-{n}` control column spans and offsets on desktop breakpoints, while `grid-pad-{narrow|wide|none}` and `grid-gap-{tight|loose}` adjust padding and rhythm per section.【F:src/styles/global.css†L660-L741】
- `Layout.astro` attaches these utilities via the `pageWrapper.grid` options so pages can opt into tighter gaps or edge-to-edge padding without redefining wrappers.【F:src/layouts/Layout.astro†L18-L76】

### Ten-Column Grid

- `.ten-grid` is a specialized grid utility introduced for nested layouts within the twelve-column grid. It follows the same responsive pattern—collapsing to single column on mobile and expanding to ten columns at `48rem`.【F:src/styles/global.css†L656-L672】
- This grid is particularly useful for creating asymmetric content layouts where a 10-column container is nested within a 12-column parent, such as the Books page layout.【F:src/pages/books/index.astro†L48-L82】
- Use `.grid-gap-normal` with ten-grid layouts to maintain balanced spacing between columns—this modifier provides medium-density gaps between tight and loose settings.【F:src/styles/global.css†L674-L677】

## Metadata Chips

Metadata chips are the canonical way to display categories, publication dates, and syndication labels:

- `.card-chip` defines the shared appearance—uppercase text, rounded pill, light/dark backgrounds, and subtle hover transitions.【F:src/styles/global.css†L475-L540】
- `CategoryDisplay.astro` outputs the category chip and is reused by cards, list items, stream entries, and backlinks. Always pass the category string into this component instead of crafting ad-hoc markup.【F:src/components/CategoryDisplay.astro†L1-L16】
- `TimeDisplay.astro` and `PostItem.astro` attach the `.card-chip` class to timestamps and syndication labels to keep metadata consistent across list and detail views.【F:src/components/Card.astro†L1-L64】【F:src/components/PostItem.astro†L70-L180】
- Relative timestamps hydrate on the client through the `<relative-time>` custom element defined in `src/scripts/relativeTime.ts`, which `TimeDisplay.astro` renders so static builds stay fresh as real time advances.

## Tag Treatments

Tag selectors (`.tag-item`, `.tag-chip-active`) live alongside the chip styles and share the same color variables. Active states bump font weight and adjust background opacity to signal applied filters.【F:src/styles/global.css†L450-L490】 Use these classes when adding new tag filters or taxonomy components.

## Background and Effects

- `.bg-bgSecondary` applies a semi-transparent panel with blur, useful for overlays or navigation rows that need separation without a full solid background.【F:src/styles/global.css†L96-L120】
- `LinkHoverEffect.astro` injects a lightweight script for hover previews when `enableLinkHoverEffect` is passed to the layout, complementing the chip interactions without forcing client JavaScript on every page.【F:src/layouts/Layout.astro†L8-L76】

## Implementation Guidelines

- Reuse existing utilities before introducing new Tailwind classes. If a layout truly requires unique spacing, document the decision in the relevant component or planning note.
- Prefer semantic elements with `display: contents` wrappers inside `.twelve-grid` sections so child elements participate directly in the grid (see `MultiLevelNavigation.astro` for an example).【F:src/components/navigation/MultiLevelNavigation.astro†L118-L173】
- When designing new metadata, extend chip styles or tag utilities to maintain the capsule aesthetic that ties cards, backlinks, and stream items together.

## Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [Navigation System](../components/navigation.md)
- [Backlinks System](../components/backlinks.md)
