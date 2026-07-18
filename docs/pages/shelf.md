# Shelf Pages

The shelf is a set of media-tracking pages covering books, films, TV shows, and games. It lives under the **Garden** section of the site.

## Pages

| URL | Category | Tab |
| --- | --- | --- |
| `/shelf/` | Combined (all categories) | Default landing |
| `/bookshelf/` | `bookshelf` | Books |
| `/filmshelf/` | `filmshelf` | Film |
| `/tvshelf/` | `tvshelf` | TV |
| `/gameshelf/` | `gameshelf` | Games |
| `/tvshelf/[show]/` | — | TV show detail |

The `/shelf/` page is the default landing when clicking **Shelf** in the secondary nav. The **Books / Film / TV / Games** tab nav on every shelf page links to the four category pages.

## Adding New Entries

The normal path is an Obsidian note via the [publishing shortcut](../content/publishing-shortcut.md) (which lands in `src/content/inbox/` and gets sorted automatically), or a quick-add from the `/write` Shelf tab for queue stubs. To add a file directly, create it in the category folder (`src/content/bookshelf/`, `src/content/filmshelf/`, etc.) with a timestamp filename (`YYYYMMDDHHMM Title.md`), set `category` to the relevant value, and fill in the fields for that media type (see below).

Covers and missing metadata are filled in automatically by GitHub Actions when shelf content lands on `main` (see [Cover Downloaders](../tools/shelf-cover-downloaders.md) and [Metadata Enrichment](../tools/shelf-metadata-enrichment.md)).

---

## Frontmatter by Category

### Books — `category: bookshelf`

```yaml
---
title: "The Pragmatic Programmer"
author: "David Thomas"           # or array: ["David Thomas", "Andrew Hunt"]
series: "Series Name"            # optional; defaults to "none"
seriesNumber: 1                  # optional
category: bookshelf
created: 2025-01-15T00:00:00
status: started                  # todo | started | paused | finished (unified across all shelf categories)
rating: love                     # like | love | nope  (optional, unified across all shelf categories)
started: 2025-01-10              # optional
finished: 2025-01-20             # optional; required for "finished" count
readingProgress: 40              # optional, 0–100
cover: "the-pragmatic-programmer.webp"  # auto-filled by download script
year: 1999                       # optional; publication year
genre: "programming"             # optional
tags: [programming, software]   # optional
---

Your notes, thoughts, or quotes from the book.
```

**Status values** (shared by all four shelf categories — see [Unified Status](#unified-status)):
- `started` — currently reading
- `finished` — completed (counts toward the finished total)
- `todo` — on the reading list
- `paused` — on hold

---

### Film — `category: filmshelf`

```yaml
---
title: "Dune: Part Two"
director:                        # array
  - Denis Villeneuve
year: 2024                       # release year
category: filmshelf
created: 2025-03-01T00:00:00
status: finished                 # todo | started | paused | finished (unified across all shelf categories)
rating: love                     # like | love | nope  (optional)
finished: 2025-03-01             # watch date; used for rewatch detection ordering
cover: "dune-part-two.webp"      # auto-filled by download script
platform: "Netflix"              # optional; shown as a chip
genre: "sci-fi"                  # optional
tags: [sci-fi, epic]             # optional
---

Optional notes about the film.
```

**Rewatch tracking:** No extra frontmatter needed. The build automatically detects rewatches by grouping entries with the same (normalised) title and assigning watch numbers (1st watch, 2nd watch, etc.) ordered by `finished` date.

**Status values:**
- `finished` — seen it
- `started` — currently watching
- `todo` — on the watch list
- `paused` — on hold

---

### TV — `category: tvshelf`

One markdown file per season. The TV shelf groups all seasons of a show into a single card; the show detail page (`/tvshelf/[show]/`) lists every season.

```yaml
---
title: "Severance S1"            # displayed on the season detail page
showTitle: "Severance"           # used to group seasons — must match exactly across files
season: 1                        # season number
creator:                         # array
  - Dan Erickson
year: 2022                       # season release year
category: tvshelf
created: 2025-02-10T00:00:00
status: finished                 # todo | started | paused | finished (unified across all shelf categories)
rating: love                     # like | love | nope  (optional)
started: 2025-02-01              # optional
finished: 2025-02-10             # optional
cover: "severance.webp"          # auto-filled by download script; one image per show
platform: "Apple TV+"            # optional; shown as a chip
genre: "thriller"                # optional
tags: [thriller, workplace]      # optional
---

Notes about this season.
```

**Important:** `showTitle` must be identical across all seasons of the same show — it is the grouping key. The show slug in the URL is derived from `showTitle` (lowercased, spaces replaced with hyphens).

**Status values:**
- `finished` — finished the season
- `started` — currently watching
- `todo` — plan to watch
- `paused` — on hold

When multiple seasons have different statuses, the shelf card shows the highest-priority status: `started` > `paused` > `todo` > `finished`.

---

### Games — `category: gameshelf`

```yaml
---
title: "Hollow Knight"
developer: "Team Cherry"
year: 2017                       # release year
platform: "PC"                   # optional; shown as a chip on the card
category: gameshelf
created: 2025-04-05T00:00:00
status: finished                 # todo | started | paused | finished (unified across all shelf categories)
rating: love                     # like | love | nope  (optional)
started: 2025-03-20              # optional
finished: 2025-04-05             # optional
hoursPlayed: 40                  # optional
cover: "hollow-knight.webp"      # auto-filled by download script
genre: "metroidvania"            # optional
tags: [indie, metroidvania]      # optional
---

Optional notes about the game.
```

**Replay tracking:** Same as film — create a new entry each time you replay. Watch numbers are assigned automatically at build time.

**Status values:**
- `finished` — completed (counts toward the finished total)
- `started` — currently playing
- `todo` — on the backlog
- `paused` — on hold

---

## Queue Pages

Each shelf category has a queue page listing its `status: todo` entries — the
"to be read/watched/played" pipeline. `todo` entries do not render on the
main shelf pages at all (including the combined `/shelf/` page); they only
appear on the queue page beneath each shelf.

| URL | Category | Heading |
| --- | --- | --- |
| `/bookshelf/queue/` | `bookshelf` | To Read |
| `/filmshelf/queue/` | `filmshelf` | To Watch |
| `/tvshelf/queue/` | `tvshelf` | To Watch |
| `/gameshelf/queue/` | `gameshelf` | To Play |

Each of the four shelf pages has a "Queue →" link in its header, next to the
RSS icon. Queue cards are a compact row (cover thumbnail when available,
title, creator, "added <month year>" from `created`, and the entry body
rendered small as the "why"), sorted by `created` descending — no year
grouping.

`/api/shelf-queue.json` returns every `todo` entry across all four
categories (`id`, `category`, `title`, `creator`, `created`), sorted by
`created` descending. It's a derived, build-time view of the same content
collections — not a separate source of truth.

To queue something, create a normal shelf entry with `status: todo` (see
frontmatter examples above) — no special "stub" format is required, though a
minimal entry only needs `title`, `category`, `status: todo`, and `created`.
Promote it out of the queue by changing `status` to `started`/`finished` (or
editing in place once you start it).

See [`planning/shelf-queue-design.md`](../../planning/shelf-queue-design.md)
for the full design, including not-yet-built stages (composer quick-add,
automatic metadata enrichment, and Obsidian-arrival reconciliation).

---

## Unified Status

All four shelf categories (and `now` posts) share a single `status` field with the same four values:

| Value | Books | Film/TV | Games | `now` posts |
| --- | --- | --- | --- | --- |
| `todo` | To Read | To Watch | To Play | not yet started |
| `started` | Currently Reading | Watching | Playing | active |
| `paused` | On Hold | On Hold | On Hold | paused |
| `finished` | Read | Watched | Played | done |

The underlying value is shared, but each card renders category-specific display text — see `src/utils/shelfStatus.ts` for the label/CSS-class lookup tables.

---

## Cover Images

Covers are downloaded by dedicated scripts and committed to the repository so they are available at build time on Cloudflare Pages.

| Category | Image directory | Script |
| --- | --- | --- |
| Books | `src/images/bookshelf/` | `npm run download-covers` |
| Film | `src/images/filmshelf/` | `node scripts/download-film-covers.js` |
| TV | `src/images/tvshelf/` | `node scripts/download-tv-covers.js` |
| Games | `src/images/gameshelf/` | `node scripts/download-game-covers.js` |

See [Shelf Cover Downloaders](../tools/shelf-cover-downloaders.md) for full details on each script.

After downloading new covers, the corresponding generate script updates the TypeScript cover-map (`src/utils/filmCovers.ts`, etc.) so components can import the images.

---

## Build-Time Logic

### Rewatch / Replay Detection

`src/utils/shelfUtils.ts` exports `computeWatchNumbers()`. It groups entries by normalised title (lowercase, punctuation stripped), sorts by date, and assigns 1-based watch numbers. Film and game cards show a "2nd watch" / "2nd play" chip when the number is > 1. No frontmatter changes are needed.

### TV Show Grouping

`/tvshelf/index.astro` groups per-season entries by `showTitle` at build time. For each show it picks the representative entry (highest season number) and computes an aggregate status. The show detail page (`src/pages/tvshelf/[show].astro`) renders all seasons sorted ascending.

---

## Related Documentation

- [Shelf Cover Downloaders](../tools/shelf-cover-downloaders.md)
- [Book Cover Downloader](../tools/book-cover-downloader.md)
- [Content Authoring Guide](../content/authoring.md)
- [Navigation System](../components/navigation.md)
