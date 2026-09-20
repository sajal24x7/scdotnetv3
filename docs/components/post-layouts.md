# Post Detail Layouts

Every individual post URL (`/<category>/<slug>/`) is rendered by `src/pages/[...slug].astro`. The route is a thin resolver: it loads the entry, backlinks, interactions and JSON-LD, then hands off to one of five layouts under `src/components/layout/post/`.

## Category → layout mapping

The mapping lives in `CATEGORY_LAYOUTS` in `src/utils/content.ts`, next to `CATEGORY_FILTERS`. `getPostLayout(category)` resolves it, falling back to `stream` for anything unmapped.

| Layout | Categories | Treatment |
| --- | --- | --- |
| `GardenPostLayout` | `evergreen`, `til` | Centered title block plus a "Planted … / Last tended …" dateline. Notes that get tended. |
| `StreamPostLayout` | `blog`, `micro`, `nordletter`, `now`, `colophon` | Centered title block, chronological framing, Nordletter edition badge. Also the default for unmapped categories. |
| `ShelfPostLayout` | `bookshelf`, `filmshelf`, `tvshelf`, `gameshelf` | Cover art, byline and metadata chips. |
| `ProsePostLayout` | `story`, `poem` | Creative writing. Serif, narrow measure, one first-published date. |
| `PhotoPostLayout` | `photo` | Full-width image-first layout (the only one that also changes the page's grid span). |

Adding a category is one line in `CATEGORY_LAYOUTS` plus one entry in the component table in `[...slug].astro`.

## Shared pieces

- **`PostShell.astro`** — the chrome every post shares: Pagefind metadata, the `h-entry` microformat wrapper, the `e-content` body, the optional newsletter call to action, `Interactions` and `Backlinks`. Layouts fill its `header`, `before-content`, default and `footer` slots.
- **`CenteredPostHeader.astro`** — the centered hero/title/description/tags block used by the garden and stream layouts.
- **`PostMetaLine.astro`** — the "Published/Updated … Email me … Posted to:" footer line used by garden, stream and shelf.
- **`ShelfMetaChips.astro`** — renders the chips described by `getShelfMeta()`.
- **`src/utils/postMeta.ts`** — reads the frontmatter fields every layout needs.
- **`src/utils/shelfMeta.ts`** — one config table (`SHELF_CONFIGS`) mapping each shelf category to its cover lookup, byline wording and chip order. Books, films, TV and games differ only here, not in markup.

## Stories and poems

`ProsePostLayout` covers both, switching on a `poem` / `story` variant:

- **No evergreen framing.** No planted/tended line and no "Updated" stamp. `updated` still feeds JSON-LD `dateModified` and the feeds; it is simply not presented as a revision, because for most of this archive it is a migration timestamp rather than an edit.
- **One date.** A dateline reading `A poem · February 2012`, and a footer reading `First published February 2012.`
- **No hero image.** The frontmatter `image` on these posts is an OG card, not an illustration, so it stays in the `<head>` and out of the body.
- **Site typography.** Body copy stays on Inter, like the rest of the site, one step down from the default reading size (`--text-small`); titles stay on Fraunces like every other heading.
- **Narrow column.** `[...slug].astro` gives prose posts `grid-span-6 grid-start-4` instead of the usual `grid-span-8 grid-start-3`, so these pages are visibly narrower on wide screens. Inside that, poems cap at 28rem and stories at 36rem.
- **Poem variant** — verse-tight paragraph spacing (these files are authored one line per paragraph, so paragraphs are lines), set as a centered block of flush-left lines.
- **Story variant** — looser line height, normal prose paragraph rhythm.
- **Scene breaks** — a markdown `---` renders as a centered `· · ·` ornament rather than a rule.
- **Collection navigation** — a footer row linking the earlier and later piece in the same category, plus `/poems/` or `/stories/`. Built from `getAdjacentPosts()` in `src/utils/content.ts`, ordered by `created`.

If a piece is ever genuinely revised and that should be visible, add an explicit frontmatter flag rather than inferring it from `updated`.
