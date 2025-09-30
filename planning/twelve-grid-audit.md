# Twelve-Column Grid Usage Audit

_Last updated: 2025-09-30_

## Methodology
- Every routed page renders through `Layout.astro`, which wraps the `<main>` slot in a `.twelve-grid` container. This baseline instance is present on every page and is counted once per route.【F:src/layouts/Layout.astro†L46-L140】
- For each Astro page under `src/pages`, I counted any additional `.twelve-grid` classes declared directly in the page markup or introduced by child components/layouts referenced in that page.
- Totals below represent the number of `.twelve-grid` wrappers that render on a page (baseline layout + additional wrappers).

## Page-by-page usage

| Route | Astro file | Additional `.twelve-grid` wrappers beyond `Layout` | Total wrappers per page |
| --- | --- | --- | --- |
| `/` | `src/pages/index.astro` | None – the home page relies on standard Tailwind grid classes inside the layout shell.【F:src/pages/index.astro†L29-L95】 | 1 |
| `/blog/` | `src/pages/blog/index.astro` | SectionLanding injects a `.twelve-grid` frame and the nested `StreamLayout` adds another grid wrapper.【F:src/pages/blog/index.astro†L29-L44】【F:src/layouts/SectionLanding.astro†L129-L201】【F:src/components/layout/StreamLayout.astro†L20-L34】 | 3 |
| `/micro/` | `src/pages/micro/index.astro` | Same pattern as `/blog/`: SectionLanding + StreamLayout each add a `.twelve-grid` in addition to `Layout`.【F:src/pages/micro/index.astro†L29-L43】【F:src/layouts/SectionLanding.astro†L129-L201】【F:src/components/layout/StreamLayout.astro†L20-L34】 | 3 |
| `/photos/` | `src/pages/photos/index.astro` | SectionLanding + StreamLayout wrappers on top of the layout grid.【F:src/pages/photos/index.astro†L29-L43】【F:src/layouts/SectionLanding.astro†L129-L201】【F:src/components/layout/StreamLayout.astro†L20-L34】 | 3 |
| `/stream/` | `src/pages/stream/index.astro` | SectionLanding + StreamLayout wrappers in addition to the layout shell.【F:src/pages/stream/index.astro†L29-L43】【F:src/layouts/SectionLanding.astro†L129-L201】【F:src/components/layout/StreamLayout.astro†L20-L34】 | 3 |
| `/garden/` | `src/pages/garden/index.astro` | SectionLanding provides one `.twelve-grid`, and the `contentClass` prop injects another on the `<main>` element.【F:src/pages/garden/index.astro†L22-L41】【F:src/layouts/SectionLanding.astro†L129-L201】 | 3 |
| `/evergreen/` | `src/pages/evergreen/index.astro` | Same as `/garden/`: SectionLanding shell plus a `.twelve-grid` applied via `contentClass`.【F:src/pages/evergreen/index.astro†L20-L47】【F:src/layouts/SectionLanding.astro†L129-L201】 | 3 |
| `/til/` | `src/pages/til/index.astro` | SectionLanding + `contentClass="… twelve-grid …"` create two extra wrappers beyond layout.【F:src/pages/til/index.astro†L30-L54】【F:src/layouts/SectionLanding.astro†L129-L201】 | 3 |
| `/poems/` | `src/pages/poems/index.astro` | SectionLanding grid plus the `contentClass` `.twelve-grid`.【F:src/pages/poems/index.astro†L30-L47】【F:src/layouts/SectionLanding.astro†L129-L201】 | 3 |
| `/stories/` | `src/pages/stories/index.astro` | SectionLanding grid plus the `contentClass` `.twelve-grid`.【F:src/pages/stories/index.astro†L30-L47】【F:src/layouts/SectionLanding.astro†L129-L201】 | 3 |
| `/nordletter/` | `src/pages/nordletter/index.astro` | SectionLanding grid plus the `contentClass` `.twelve-grid` applied to the main slot.【F:src/pages/nordletter/index.astro†L28-L60】【F:src/layouts/SectionLanding.astro†L129-L201】 | 3 |
| `/books/` | `src/pages/books/index.astro` | SectionLanding grid plus the `contentClass="books-layout twelve-grid…"`.【F:src/pages/books/index.astro†L24-L61】【F:src/layouts/SectionLanding.astro†L129-L201】 | 3 |
| `/books/a-year-of-mornings/` | `src/pages/books/a-year-of-mornings.astro` | The page injects `BookDetailLayout`, whose root element is a `.twelve-grid` wrapper alongside the layout grid.【F:src/pages/books/a-year-of-mornings.astro†L17-L32】【F:src/components/books/BookDetailLayout.astro†L17-L56】 | 2 |
| `/bookshelf/` | `src/pages/bookshelf/index.astro` | SectionLanding adds one grid, and each `BookGrid` render introduces another `.twelve-grid` container around the cards.【F:src/pages/bookshelf/index.astro†L43-L91】【F:src/components/bookshelf/BookGrid.astro†L23-L38】【F:src/layouts/SectionLanding.astro†L129-L201】 | 3 |
| `/now/` | `src/pages/now.astro` | Uses `ProgressLayout`, which wraps the page content in a `.twelve-grid` in addition to the layout shell.【F:src/pages/now.astro†L45-L102】【F:src/components/layout/ProgressLayout.astro†L24-L73】 | 2 |
| `/done/` | `src/pages/done.astro` | Same as `/now/`: the `ProgressLayout` component introduces an extra `.twelve-grid`.【F:src/pages/done.astro†L45-L111】【F:src/components/layout/ProgressLayout.astro†L24-L73】 | 2 |
| `/feeds/` | `src/pages/feeds.astro` | Three inline sections each declare `.twelve-grid` wrappers (page shell, feed buttons grid, and recent/posts block) on top of `Layout`.【F:src/pages/feeds.astro†L31-L138】 | 4 |
| `/tags/` | `src/pages/tags/index.astro` | The top-level wrapper plus each subsection/grid applies `.twelve-grid`, yielding five additional instances beyond the layout.【F:src/pages/tags/index.astro†L79-L139】 | 6 |
| `/colophon/` | `src/pages/colophon.astro` | Eight inline sections/subsections each start a `.twelve-grid`, creating heavy nesting beyond the layout grid.【F:src/pages/colophon.astro†L53-L205】 | 9 |
| `/sajal/` | `src/pages/sajal.astro` | Nine inline sections/subsections apply `.twelve-grid`, resulting in the highest wrapper count in addition to the layout grid.【F:src/pages/sajal.astro†L135-L215】 | 10 |
| `/navigation-demo/` | `src/pages/navigation-demo.astro` | No extra `.twelve-grid` wrappers – content relies on standard Tailwind utilities inside the layout shell.【F:src/pages/navigation-demo.astro†L6-L74】 | 1 |
| `/{category}/{slug}/` | `src/pages/[...slug].astro` | Detail pages render inside `PostLayout`, which stays inside the layout grid without adding another `.twelve-grid`.【F:src/pages/[...slug].astro†L34-L54】 | 1 |

## Key observations
- Content landing pages (`/garden/`, `/evergreen/`, `/til/`, `/poems/`, `/stories/`, `/nordletter/`, `/books/`) currently layer the SectionLanding grid with an additional `.twelve-grid` applied to the main slot, effectively doubling the grid wrapper for primary content areas.【F:src/layouts/SectionLanding.astro†L129-L201】
- Stream family pages (`/blog/`, `/micro/`, `/photos/`, `/stream/`) nest both SectionLanding and StreamLayout grids, resulting in three stacked `.twelve-grid` containers per route.【F:src/pages/blog/index.astro†L29-L44】【F:src/components/layout/StreamLayout.astro†L20-L34】
- Informational pages such as `/feeds/`, `/tags/`, `/colophon/`, and `/sajal/` rely heavily on inline `.twelve-grid` sections, far exceeding the “one grid per page” target and warranting refactors to consolidate layout structure.【F:src/pages/feeds.astro†L31-L138】【F:src/pages/tags/index.astro†L79-L139】【F:src/pages/colophon.astro†L53-L205】【F:src/pages/sajal.astro†L135-L215】
