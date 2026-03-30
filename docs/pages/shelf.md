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

Create a markdown file in the appropriate year directory (`src/content/2025/`, etc.) with a timestamp filename (`YYYYMMDDHHMM Title.md`). Set `category` to the relevant value and fill in the fields for that media type (see below).

After adding an entry, run the corresponding cover-download script if you want artwork pulled automatically (see [Cover Downloaders](../tools/shelf-cover-downloaders.md)).

---

## Frontmatter by Category

### Books — `category: bookshelf`

```yaml
---
title: "The Pragmatic Programmer"
author: "David Thomas"           # or array: ["David Thomas", "Andrew Hunt"]
series: "none"                   # optional; defaults to "none"
category: bookshelf
pubDate: 2025-01-15T00:00:00
bookStatus: reading              # reading | read | finished | on-hold | to-read
bookRating: love                 # like | love | nope  (optional)
startedReading: 2025-01-10       # optional
finishedReading: 2025-01-20      # optional; required for "finished" count
bookCover: "the-pragmatic-programmer.jpg"  # auto-filled by download script
genre: "programming"             # optional
tags: [programming, software]   # optional
---

Your notes, thoughts, or quotes from the book.
```

**Status values:**
- `reading` — currently reading
- `finished` / `read` — completed (both values count toward the finished total)
- `to-read` — on the reading list
- `on-hold` — paused

---

### Film — `category: filmshelf`

```yaml
---
title: "Dune: Part Two"
director: "Denis Villeneuve"
year: 2024                       # release year
category: filmshelf
pubDate: 2025-03-01T00:00:00
filmStatus: watched              # watching | watched | to-watch
filmRating: love                 # like | love | nope  (optional)
watchedDate: 2025-03-01          # optional; used for rewatch detection ordering
filmCover: "dune-part-two.jpg"   # auto-filled by download script
genre: "sci-fi"                  # optional
tags: [sci-fi, epic]             # optional
---

Optional notes about the film.
```

**Rewatch tracking:** No extra frontmatter needed. The build automatically detects rewatches by grouping entries with the same (normalised) title and assigning watch numbers (1st watch, 2nd watch, etc.) ordered by `watchedDate`.

**Status values:**
- `watched` — seen it
- `watching` — currently watching
- `to-watch` — on the watch list

---

### TV — `category: tvshelf`

One markdown file per season. The TV shelf groups all seasons of a show into a single card; the show detail page (`/tvshelf/[show]/`) lists every season.

```yaml
---
title: "Severance S1"            # displayed on the season detail page
showTitle: "Severance"           # used to group seasons — must match exactly across files
season: 1                        # season number
creator: "Dan Erickson"
year: 2022                       # season release year
category: tvshelf
pubDate: 2025-02-10T00:00:00
tvStatus: watched                # watching | watched | to-watch | on-hold | abandoned
tvRating: love                   # like | love | nope  (optional)
tvCover: "severance.jpg"         # auto-filled by download script; one image per show
genre: "thriller"                # optional
tags: [thriller, workplace]      # optional
---

Notes about this season.
```

**Important:** `showTitle` must be identical across all seasons of the same show — it is the grouping key. The show slug in the URL is derived from `showTitle` (lowercased, spaces replaced with hyphens).

**Status values:**
- `watched` — finished the season
- `watching` — currently watching
- `to-watch` — plan to watch
- `on-hold` — paused
- `abandoned` — dropped

When multiple seasons have different statuses, the shelf card shows the highest-priority status: `watching` > `to-watch` > `on-hold` > `abandoned` > `watched`.

---

### Games — `category: gameshelf`

```yaml
---
title: "Hollow Knight"
developer: "Team Cherry"
year: 2017                       # release year
platform: "PC"                   # optional; shown as a chip on the card
category: gameshelf
pubDate: 2025-04-05T00:00:00
gameStatus: played               # playing | played | to-play | on-hold | abandoned
gameRating: love                 # like | love | nope  (optional)
gameCover: "hollow-knight.jpg"   # auto-filled by download script
genre: "metroidvania"            # optional
tags: [indie, metroidvania]      # optional
---

Optional notes about the game.
```

**Replay tracking:** Same as film — create a new entry each time you replay. Watch numbers are assigned automatically at build time.

**Status values:**
- `played` — completed (counts toward the finished total)
- `playing` — currently playing
- `to-play` — on the backlog
- `on-hold` — paused
- `abandoned` — dropped

---

## Cover Images

Covers are downloaded by dedicated scripts and committed to the repository so they are available at build time on Cloudflare Pages.

| Category | Image directory | Script |
| --- | --- | --- |
| Books | `src/images/bookshelf/` | `npm run download-covers` |
| Film | `src/images/filmshelf/` | `npm run download-film-covers` |
| TV | `src/images/tvshelf/` | `npm run download-tv-covers` |
| Games | `src/images/gameshelf/` | `npm run download-game-covers` |

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
