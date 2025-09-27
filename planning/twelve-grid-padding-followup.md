# Twelve-Column Grid Padding Follow-Up (November 2025)

## Summary
- Reviewed the recently completed twelve-column grid migration to understand why stripping padding classes removed comfortable gutters on detail pages.
- Documented how spacing is currently applied across shared layout components and page templates so we can simplify the CSS surface area without reintroducing edge-to-edge content on small screens.

## Observations
- The root `.twelve-grid` utility now owns width, centering, and gap tokens, but its inline padding pulls from `--grid-padding-inline`, which defaults to `0rem`. Without an explicit `grid-pad-*` helper the grid renders flush to the viewport.【F:src/styles/global.css†L45-L56】【F:src/styles/global.css†L530-L558】
- `Layout.astro` only applies `grid-pad-narrow|wide|none` when a page opts into `pageWrapper.grid`, so routes that omitted the padding hook lost all gutters once manual Tailwind padding was removed.【F:src/layouts/Layout.astro†L44-L63】
- Several section templates compensate by adding ad-hoc Tailwind padding back through `pageWrapper.className` (for example the stream and garden families specify `px-2`), which undermines the goal of consolidating spacing logic.【F:src/pages/stream/index.astro†L17-L44】【F:src/pages/garden/index.astro†L16-L42】
- `SectionLanding` wraps its content slot in a bare `twelve-grid`, so callers supply custom `contentClass` strings like `grid-pad-narrow` or even additional `twelve-grid` wrappers to get the desired spacing. This duplicates configuration that the layout shell could expose directly.【F:src/layouts/SectionLanding.astro†L110-L178】
- Core layout components (`StreamLayout`, `GardenGrid`, `BookGrid`, `BookDetailLayout`, `NordletterGrid`) already bake in `grid-pad-narrow` and expect gutters to exist. Removing those helpers collapses spacing across multiple page families at once.【F:src/components/layout/StreamLayout.astro†L20-L66】【F:src/components/layout/GardenGrid.astro†L70-L139】【F:src/components/bookshelf/BookGrid.astro†L34-L55】【F:src/components/books/BookDetailLayout.astro†L19-L155】【F:src/components/NordletterGrid.astro†L21-L198】
- Post detail pages rely on `LayoutContainer` for prose width rather than the outer grid, so losing the grid padding pushes the article against the viewport edges, especially on phones.【F:src/pages/[...slug].astro†L39-L110】【F:src/components/layout/LayoutContainer.astro†L1-L75】

## Recommendations
1. **Restore a default gutter.** Either raise `--grid-padding-inline` to a compact clamp (for example `clamp(0.5rem, 4vw, 1.5rem)`) or have `Layout.astro` default `grid.padding` to `'narrow'` when a page does not opt into a custom value. This keeps comfortable gutters on every route without sprinkling `px-*` utilities back in.【F:src/styles/global.css†L45-L56】【F:src/layouts/Layout.astro†L44-L63】
2. **Expose padding controls on `SectionLanding`.** Add explicit props (e.g., `gridPadding`, `gridGap`) that translate to the shared `grid-pad-*` / `grid-gap-*` tokens instead of asking callers to concatenate class names. That keeps the API aligned with the layout shell and prevents duplicate `.twelve-grid` wrappers in child sections.【F:src/layouts/SectionLanding.astro†L110-L178】
3. **Replace ad-hoc Tailwind padding with the shared tokens.** After the default gutter exists, audit the routes that currently pass `pageWrapper.className: 'px-*'` (stream, blog, micro, photos, garden, evergreen, til, stories, poems, books, bookshelf, nordletter, tags) and swap those overrides for the new grid padding configuration so spacing remains declarative.【F:src/pages/stream/index.astro†L17-L44】【F:src/pages/garden/index.astro†L16-L42】【F:src/pages/books/index.astro†L20-L105】【F:src/pages/bookshelf/index.astro†L42-L94】【F:src/pages/nordletter/index.astro†L28-L60】【F:src/pages/tags/index.astro†L57-L139】
4. **Document component-level spacing expectations.** Update the UI/UX guidelines to note which layout components include their own padding (`StreamLayout`, `GardenGrid`, etc.) versus those that expect the parent grid to supply it. That will prevent future cleanups from stripping required classes during refactors.【F:src/components/layout/StreamLayout.astro†L20-L66】【F:src/components/layout/GardenGrid.astro†L70-L139】

## Page & Component Inventory

### Global scaffolding
Component list (2)
- **Layout** – Provides the shared twelve-column wrapper, header/footer, and optional grid padding controls consumed by every page template.【F:src/layouts/Layout.astro†L44-L115】
- **LayoutContainer** – Handles max-width, centering, and optional prose styles inside the grid for detail views and nested sections.【F:src/components/layout/LayoutContainer.astro†L1-L76】

### Home (/)
Component list (3)
- **Layout (page wrapper)** – Home opts into loose gaps and narrow padding on the twelve-column shell to create generous breathing room for the hero and feed rail.【F:src/pages/index.astro†L52-L121】
- **RecentItems** – Renders the stream preview as a vertically spaced list with its own inner boundary classes, keeping post cards aligned with the grid gutters.【F:src/components/RecentItems.astro†L24-L60】
- **FeaturedPosts** – Presents curated long-form entries in card chrome with consistent typography and spacing tokens.【F:src/components/content/FeaturedPosts.astro†L24-L147】

### Stream / Blog / Micro / Photos
Component list (3)
- **Layout (page wrapper)** – Each route relies on the shared layout and currently reinstates padding through `pageWrapper` to avoid edge-to-edge content.【F:src/pages/stream/index.astro†L17-L44】【F:src/pages/blog/index.astro†L17-L44】【F:src/pages/micro/index.astro†L17-L45】【F:src/pages/photos/index.astro†L17-L44】
- **SectionLanding** – Supplies the standardized hero, counts, tag rail, and content/sidebar slots on a twelve-column grid.【F:src/layouts/SectionLanding.astro†L110-L178】
- **StreamLayout** – Lays out the post column and optional sidebar with baked-in gutters, sticky behavior, and row spacing tokens.【F:src/components/layout/StreamLayout.astro†L20-L66】

### Garden / Evergreen / TIL / Stories / Poems
Component list (3)
- **Layout (page wrapper)** – Wraps each notes index in the shared shell with manual padding overrides that should migrate to the grid utilities.【F:src/pages/garden/index.astro†L16-L42】【F:src/pages/evergreen/index.astro†L19-L46】【F:src/pages/til/index.astro†L19-L46】【F:src/pages/stories/index.astro†L19-L46】【F:src/pages/poems/index.astro†L19-L46】
- **SectionLanding** – Provides the shared heading/count/tag treatment before the card grid.【F:src/layouts/SectionLanding.astro†L110-L178】
- **GardenGrid** – Outputs the card collection with span-aware grid classes and accent variants per content type.【F:src/components/layout/GardenGrid.astro†L70-L139】

### Nordletter
Component list (4)
- **Layout (page wrapper)** – Uses the global layout with a custom padding override to align the archive shell.【F:src/pages/nordletter/index.astro†L28-L60】
- **SectionLanding** – Handles the hero, tag list, and signup slot before the archive grid.【F:src/layouts/SectionLanding.astro†L110-L178】
- **NewsletterSignup** – Provides the call-to-action block with configurable copy and form presentation at the top of the archive.【F:src/components/ui/NewsletterSignup.astro†L26-L62】
- **NordletterGrid** – Groups issues by year, maps span metadata to twelve-column classes, and styles card variants for narrow, wide, and full layouts.【F:src/components/NordletterGrid.astro†L21-L198】

### Books (index)
Component list (2)
- **Layout (page wrapper)** – Wraps the books landing page with the shared shell and manual padding fallback for now.【F:src/pages/books/index.astro†L20-L105】
- **SectionLanding** – Provides the headline row and embeds the custom book list plus sidebar within the twelve-column grid.【F:src/layouts/SectionLanding.astro†L110-L178】

### Book detail (/books/a-year-of-mornings/)
Component list (2)
- **Layout** – Supplies the global chrome and grid wrapper for the detail page.【F:src/pages/books/a-year-of-mornings.astro†L16-L31】
- **BookDetailLayout** – Implements the cover/metadata column and prose column with span-aware classes and padding variables.【F:src/components/books/BookDetailLayout.astro†L19-L155】

### Bookshelf
Component list (2)
- **Layout (page wrapper)** – Applies the shared grid while the page transitions away from ad-hoc padding utilities.【F:src/pages/bookshelf/index.astro†L42-L94】
- **BookGrid** – Renders book cards with twelve-column spans and internal alignment styles for the bookshelf sections.【F:src/components/bookshelf/BookGrid.astro†L34-L55】

### Now / Done
Component list (3)
- **Layout (page wrapper)** – Enables grid padding through `pageWrapper.grid` to keep the progress layout readable.【F:src/pages/now.astro†L46-L145】【F:src/pages/done.astro†L61-L160】
- **PageHeader** – Provides the centered hero copy reused across both timelines.【F:src/components/layout/PageHeader.astro†L59-L151】
- **Progress page sections** – Each template uses a `progress-page__layout` twelve-grid that splits the feed column and sticky sidebar while embedding `LayoutContainer` for rendered Markdown.【F:src/pages/now.astro†L64-L143】【F:src/pages/done.astro†L79-L159】

### Feeds
Component list (3)
- **Layout** – Supplies the shared grid shell for the feeds overview.【F:src/pages/feeds.astro†L18-L139】
- **PageHeader** – Handles the centered hero copy above the feed grid.【F:src/components/layout/PageHeader.astro†L59-L151】
- **RecentItems** – Reuses the stream list styling to preview recent posts beside the RSS explainer.【F:src/components/RecentItems.astro†L24-L60】

### Tags
Component list (2)
- **Layout (page wrapper)** – Wraps the tag directory with the global grid and temporary Tailwind padding shim.【F:src/pages/tags/index.astro†L57-L139】
- **PageHeader** – Presents the page hero before the interactive tag grids.【F:src/components/layout/PageHeader.astro†L59-L151】

### Colophon
Component list (2)
- **Layout (page wrapper)** – Activates shared grid padding for the stacked sections.【F:src/pages/colophon.astro†L37-L140】
- **PageHeader** – Supplies the top-level hero copy before the grid-based card sections.【F:src/components/layout/PageHeader.astro†L59-L151】

### Sajal
Component list (2)
- **Layout (page wrapper)** – Reuses the grid utilities with tight gaps for the personal landing page.【F:src/pages/sajal.astro†L119-L200】
- **PageHeader** – Anchors the hero copy above the twelve-column sections that follow.【F:src/components/layout/PageHeader.astro†L59-L151】

### Individual posts (/category/slug/)
Component list (2)
- **Layout** – Wraps each article with the global chrome and twelve-column shell.【F:src/pages/[...slug].astro†L39-L110】
- **LayoutContainer** – Applies the prose width clamp and optional padding around the article body, backlinks, and webmentions.【F:src/components/layout/LayoutContainer.astro†L1-L76】
