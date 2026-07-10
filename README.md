# sajalchoudhary.net

Source code for [sajalchoudhary.net](https://sajalchoudhary.net), an Astro-powered personal site. Comprehensive reference material now lives under [`docs/`](docs/README.md); start there for architecture, design system, and operational guides.

## Content Buckets

The site organizes writing into the following buckets:

1. **Notes** – `evergreen`, `now`
2. **Ephemera** – `micro`, `blog`, `photo`, `til`
3. **Fiction** – `poem`, `story`
4. **Newsletter** – `nordletter`
5. **Bookshelf** – `bookshelf`

Content collections are stored in year folders under `src/content`. Never hard-code the list of years—always read directories at runtime via `getYearDirectories()` / `getAllPosts()` from `src/utils/content.ts`.

## Section Landing Helper

Pages that render archive-style grids share a common `SectionLanding` configuration. Use `createSectionLandingProps` from `src/utils/sectionLanding.ts` to pull in the default layout, heading size, and padding tokens before applying route-specific overrides. This keeps section pages aligned and avoids duplicating prop blocks across the Garden and Stream surfaces.

## Layout Container Usage

The site-wide `Layout` component exposes a `pageWrapper` hook that forwards props to `LayoutContainer`. When page-level padding is needed, rely on the `padding` and `paddingScale` tokens defined on `LayoutContainer` instead of sprinkling Tailwind utility classes through `className`. Keep the wrapper neutral and push contextual spacing into inner surfaces (for example `SectionLanding` or dedicated content wrappers) so every route inherits the same structural frame.

## Other Shared Layouts

- **Progress pages**: `/now/` and `/then/` both render through `src/components/layout/ProgressLayout.astro`, which handles the two-column stats rail and main content slot.
- **Long-form posts**: Articles rendered by `[...slug].astro` use `src/components/layout/PostLayout.astro` to standardize hero metadata, tags, backlinks, and microformat wiring.
