# TV Shelf redesign: one card per show, with rewatches

Status: proposal (not started)

## Goal

`/tvshelf/` renders one card per season file: 197 cards for 85 shows. Modern
Family alone takes 11 cards in 2021. Change the index to **one card per show
per year**, with a row of season pills on each card, and define how rewatches
work across every TV page before the first one is logged.

## What exists today

| Place | Behaviour | Issue |
| --- | --- | --- |
| `src/pages/tvshelf/index.astro` | One `TVCard` per season, grouped by activity year | The repetition. Never passes `watchNumber`, so rewatches would look like new seasons |
| `src/pages/tvshelf/[show]/index.astro` | Groups seasons by `showTitle`, lists every file | Two watches of S1 would show as two "Season 1" rows; the "Seasons" chip counts files, not seasons; the "Watched" date uses `created`, not `finished`; `todo` stubs are not filtered out and show up as an extra "Season 1" |
| `src/pages/tvshelf/[show]/[season].astro` | One page per season file, URL from the slug | Works for rewatches (`s1-2026`), but the page doesn't know about the other watch |
| `src/pages/shelf/index.astro` | Already groups TV by show (one card per show) | Links use `shelfUtils.slugify(showTitle)`, which doesn't match the stored slugs for 8 shows (see below). Season count = file count. Representative = highest season, so rewatching S1 doesn't bump the show's date |
| `src/pages/tvshelf/queue/index.astro` | Links to `/tvshelf/${slugify(showTitle)}/` | Same slug mismatch |
| `public/write/index.html` | A TV rewatch whose slug is taken becomes `show/sN-YYYY` (limited series: `show-YYYY`) | Fine for seasons. For a limited series, the show page takes its slug from `seasons[0].id`, so the show URL could flip to `glory-2026` depending on load order |
| `computeWatchNumbers()` in `src/utils/shelfUtils.ts` | Film and game rewatch numbers, keyed by normalised title | Not used for TV |
| `docs/pages/shelf.md` | Says the TV index groups by show | Out of date: the code does not group |

**Current data:** 197 entries, all `status: finished`, every one has a
`season`, and no show + season pair repeats. So there are no TV rewatches yet.
Nothing has to be migrated.

**Slug mismatch (existing bug):** the stored slugs come from the `/write`
slugify (`[^a-z0-9]+` becomes `-`), but `shelfUtils.slugify` drops apostrophes
and accents. Shows that link to a 404 from `/shelf` and the queue today:
The Queen's Gambit, The Office (U.S.), L.A.'s Finest, Pokémon Journeys,
Inside Bill's Brain, Turning Point: 9/11, What's Next?, The Ba\*\*\*ds of
Bollywood.

## Rewatch model

### How a rewatch is identified

Detect it automatically, the same way film and games already work. No new
frontmatter field.

- **Key:** normalised `showTitle` + `season` (no season = a limited series).
- **Order:** `finished`, then `started`, then `created`.
- **Result:** the first entry for a key is watch 1, the next is watch 2, and so on.
- `todo` entries are left out of the numbering.

Rewatching Friends S1 in 2026 makes the new S1 file "watch 2". It does not
count as an 11th season.

### Slugs and URLs

| Case | Slug | URL |
| --- | --- | --- |
| First watch of a season | `friends/s1` | `/tvshelf/friends/s1/` (unchanged) |
| Rewatch of a season | `friends/s1-2026` | `/tvshelf/friends/s1-2026/` (what `/write` already writes) |
| Second rewatch in the same year | `friends/s1-2026-2` | already a fallback in `/write` |
| Limited series rewatch | `glory-2026` | no own page; listed on `/tvshelf/glory/` |

Obsidian notes follow the same convention by hand. Document it in
`docs/pages/shelf.md`.

**The show slug is computed once per show:** the first slug segment of the
earliest first-watch entry. Every card and link uses that value, never a
per-post `id.split('/')[0]` or `slugify(showTitle)`. This also fixes the
mismatch bug above and stops a limited-series rewatch from moving the show URL.

### Duplicate guard

If two files share a slug, Astro silently keeps only one. Add a build check
that fails (or at least warns loudly) when two `tvshelf` entries resolve to
the same id. That way a hand-written rewatch note that reuses `friends/s1`
can't drop the original without anyone noticing.

## Shared helper: `src/utils/tvShelf.ts`

One module used by all four TV-aware pages, instead of four separate grouping
loops.

```ts
export interface TvWatch {
    post: TvPost;
    season?: number;        // undefined = limited series
    seasonSlug?: string;    // "s1", "s1-2026"
    watchNumber: number;    // 1 = first watch
    date: Date;             // finished > started > created
    year: number;
}

export interface TvShow {
    showTitle: string;
    showSlug: string;       // canonical, computed once
    watches: TvWatch[];     // every non-todo entry, oldest first
    seasons: Map<number | 'limited', TvWatch[]>;  // watches per season
    cover?: string;
    creator?: string[];
    isLimited: boolean;
}

export function groupTvShows(posts: TvPost[]): TvShow[];
export function showYearGroups(show: TvShow): Map<number, TvWatch[]>;
```

Internally it reuses `computeWatchNumbers()` with a `"${showTitle} ${season}"`
key, so TV follows the same rule as film and games.

Add `src/utils/__checks__/tvShelf.check.ts` (next to `life.check.ts`) and wire
it into `test:all`. Cases to cover:

- several seasons in one year
- a show spanning two years
- a season rewatch
- a limited-series rewatch
- the same season twice in one year
- a `todo` stub
- slug derivation for "The Queen's Gambit"

## Index page: one card per show per year

### Grouping

`groupTvShows()` → `showYearGroups()` gives one card per (show, year). A show
watched across two years gets a card in each year, holding only that year's
watches. Black Mirror would get S1, S4 in 2019 and S2, S3, S5 in 2020.

Expected size: about 103 cards, down from 197.

### Card content (`TVCard.astro`)

- **Title** links to the show page.
- **Season summary:** `Seasons 1–10`, `Seasons 2, 3, 5`, or `Season 4`.
  Limited series: no season text.
- **Date range** for that year: `Mar – Aug`, or one date if it was a single watch.
- **Season pills:** `S1 S2 … S10`. Each one links to that watch's season page.
  - Rating shown as a coloured dot or a tint (love / like / nope).
  - `started` / `paused` shown as an outlined pill.
  - A rewatch gets a small ↻ mark, with a title tooltip like
    "2nd watch, 2026-05-02".
  - The same season twice in one year: one pill with `2×`, linking to the
    latest watch.
  - More than ~12 pills (long-running shows): wrap them, or collapse to
    `S1 … S11` with a count.
- **Card-level chips:**
  - Status: the highest priority across that year's watches (reuse
    `SHELF_LIST_SORT_PRIORITY`). Show "Rewatching" instead of "Watching" when
    the active watch is a rewatch.
  - Rewatch chip: when every watch on the card is a rewatch, show
    `Rewatch`, or `2nd watch` when they all share one number. For a mix of new
    and rewatched seasons, no card chip; the pills carry it.
  - Rating: none at card level. The pills carry per-season ratings, so one
    rating can't misrepresent a show you loved in S1 and dropped in S4.
  - Genre, platform, creator: unchanged, taken from the latest watch.
- Keep the existing `book-card` shell and `shelf-card.css` so the page still
  matches film and books. New CSS only for the pill row, in `shelf-card.css`,
  using the `--text-*` tokens.

### Sorting and counts

- **Within a year:** status priority first, then most recent activity (today
  the tie order inside a status is undefined).
- **Page header:** `85 shows · 197 seasons`, plus `· N rewatched` once there
  are any.
- **Year sidebar:** `14 shows · 38 seasons`.
- **Filter results:** count noun becomes `show`.

### Filters

Each card carries the union of its watches' values, comma-separated. The
existing `shelfFilters.ts` already splits on commas:

- `data-rating="love,like"`
- `data-genre`, `data-platform`, `data-creator`, `data-tags`: unions
- `data-status`: the card's aggregate status
- Optional new filter: `data-rewatch="true"`, clickable from the rewatch chip.

Known trade-off: filtering by `nope` shows the whole card even if only one
season was a nope. The pills show which one.

## Show page: `/tvshelf/[show]/`

- Build from `groupTvShows()`.
- Leave `todo` stubs out of the season list. Show an "In queue" chip instead
  when one exists.
- **Season list:** one row per season number, not per file. Each row lists
  its watches:
  `Season 1 · Watched 2020-03-15 · Like` /
  `↻ Rewatched 2026-05-02 · Love`. Each line links to its season page.
- **"Seasons" chip** = number of distinct seasons. Add a `Rewatched` chip when
  any watch is a rewatch.
- **Bug fix:** the date chip should use `finished`, falling back to `started`,
  not `created`.
- **Limited series with rewatches:** render each watch's notes in order, under
  dated headings, instead of only the first file.

## Season page: `/tvshelf/[show]/[season]/`

- Keep one page per watch (URLs stay stable).
- When the season has more than one watch, add a small "Watch history" line,
  for example `1st watch 2020-03-15 · 2nd watch 2026-05-02`. Link the other
  watches and mark the current one. Show a `2nd watch` chip in the header.
- Use the canonical show slug for the back link.

## `/shelf` and the queue page

- `/shelf`: replace the inline `tvShowMap` loop with `groupTvShows()`.
  - The representative is the most recent watch, not the highest season.
  - The season count is the number of distinct seasons.
  - The link uses the canonical slug, which fixes the 8 broken links.
- Queue: link through the canonical show slug when the show already exists.
  Otherwise keep `slugify(showTitle)`.

## Feeds and tooling

- **RSS** (`src/pages/tvshelf/rss.xml.js`): optional, suffix a rewatch item's
  title with `(rewatch)`. The per-season feed items stay as they are.
- **`/write`:** no change is needed for season rewatches. Optionally, show a
  hint ("Looks like a rewatch of S1") when the slug probe finds the base slug
  taken.
- **`enrich-tv-metadata.js`, `download-tv-covers.js`:** already group by
  `showTitle`, so rewatch files get the same cover and metadata. No change.
- **`reconcile-shelf-queue.js`:** only targets `todo`, so it never deletes a
  watched season. No change.

## Docs

- `docs/pages/shelf.md`: fix the "TV Show Grouping" section, add a "TV
  rewatches" section (key, slug convention, display), and note the canonical
  show slug.
- `docs/content/micro-composer.md`: mention that a TV rewatch is detected by
  show + season.

## Build order

1. `tvShelf.ts` + check script, wired into `test:all`. Covers the slug fix and
   rewatch numbering.
2. Index page: grouping, new `TVCard` props, pill row, counts, filters.
3. Show page and season page: per-season watch rows, watch history, date fix,
   todo filtering.
4. `/shelf` and queue migrated to the helper (fixes the broken links).
5. Duplicate-slug build guard.
6. Docs.
7. Verify:
   - `npm run astro check` and `npm run build`
   - spot-check `/tvshelf/` at mobile, 48rem and desktop widths
   - check Friends, Black Mirror (spans years), Glory (limited) and The
     Queen's Gambit (slug)
   - add one temporary rewatch file locally (Friends S1, finished this year)
     and confirm: the 2026 card shows `S1 ↻`, the show page groups both S1
     watches, the season pages cross-link, and `/shelf` moves Friends to 2026.

Steps 1 and 4 alone fix today's broken links, so they can ship first.

## Open questions

1. Should a rewatch-only year card show the cover again, or a smaller
   "rewatch" row style so new shows stand out more?
2. Header count: should seasons include rewatches (`197 seasons`) or only
   first watches?
3. Keep per-season RSS items, or move to one item per show per month?
