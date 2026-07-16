# Shelf Metadata Enrichment

Four scripts fill in the metadata fields a queue stub doesn't have yet — separate from the [cover downloaders](./shelf-cover-downloaders.md), which only ever touch the `cover` field. All four run via `.github/workflows/enrich-shelf-metadata.yml`, either on a push that touches shelf content or on demand.

## Overview

| Script | Run directly | Fields written | Category | Source(s) |
| --- | --- | --- | --- | --- |
| `scripts/enrich-book-metadata.js` | `node scripts/enrich-book-metadata.js` | `author`, `genre`, `year`, `series`/`seriesNumber` | `bookshelf` | Open Library, Google Books |
| `scripts/enrich-film-metadata.js` | `node scripts/enrich-film-metadata.js` | `genre`, `director`, `year` | `filmshelf` | TMDB |
| `scripts/enrich-tv-metadata.js` | `node scripts/enrich-tv-metadata.js` | `genre`, `creator`, `year` | `tvshelf` | TMDB |
| `scripts/enrich-game-metadata.js` | `node scripts/enrich-game-metadata.js` | `developer`, `genre`, `year`, `platform` | `gameshelf` | RAWG, IGDB (fallback) |

### Requirements

- **Film / TV**: `TMDB_API_KEY` environment variable (or a local `.env` file) — same free key used by the cover downloaders.
- **Books**: none — Open Library and Google Books are both keyless.
- **Games**: `RAWG_API_KEY` is optional (RAWG's free tier works keyless, at a lower rate limit); `TWITCH_CLIENT_ID` + `TWITCH_CLIENT_SECRET` are optional and enable the IGDB fallback — same credentials the game cover downloader uses.

```bash
node scripts/enrich-book-metadata.js
node scripts/enrich-book-metadata.js --force                    # overwrite existing values too
node scripts/enrich-book-metadata.js --title "The Dispossessed" # only this book

export TMDB_API_KEY=your_key_here
node scripts/enrich-film-metadata.js
node scripts/enrich-film-metadata.js --title "Inception"

node scripts/enrich-tv-metadata.js
node scripts/enrich-tv-metadata.js --title "Breaking Bad"

node scripts/enrich-game-metadata.js
node scripts/enrich-game-metadata.js --title "Hades"
```

### How it works

- **Books**: queries Open Library's `/search.json` and Google Books' `/volumes` in parallel with the title (and author, if known). Author and year prefer Open Library; genre comes from Google Books' `categories` (Open Library has no clean equivalent); `series`/`seriesNumber` are parsed from a trailing `(Series Name, #N)` on the matched title, when present — there's no reliable series field on either API.
- **Film**: searches TMDB's `/search/movie` with the title (and `year` if already known), then reads genres and release year from `/movie/{id}` and director(s) from `/movie/{id}/credits`.
- **TV**: groups entries by `showTitle`, searches `/search/tv` once per unique show, then reads genres, `created_by` (→ `creator`), and first-air year from `/tv/{id}` — one TMDB lookup covers every season file for that show.
- **Games**: searches RAWG's `/games` endpoint for the title, then reads developer, genre, release year, and platform from `/games/{id}`. Falls back to IGDB (same Twitch-authenticated flow the game cover downloader uses) only when RAWG has nothing.
- **Idempotent by default**: an entry is skipped once all of its fields are filled. Pass `--force` to re-fetch and overwrite everything, e.g. after a source-data correction.
- Entries a source can't match are left untouched and logged as "not found" — nothing is guessed.

## The Workflow

`.github/workflows/enrich-shelf-metadata.yml`:

- **Push trigger**: fires on pushes to `main` touching `src/content/{bookshelf,filmshelf,tvshelf,gameshelf}/**` — the queue stub flow (`/write` quick-add, an Obsidian note landing via `content-publish`). A `plan` job first picks which shelf(s) were touched; for each, a `Find touched entries` step then diffs the actual commit range to get the specific file(s) added/modified and reads their `title` (or `showTitle` for TV) — the enrich and cover-download scripts run with `--title`/`--book` scoped to just those entries, not the rest of the shelf. A queue card ends up complete (metadata + art) from one commit with no manual step, and the rest of the shelf's still-incomplete entries are left alone until they're the ones touched. No loop: the bookkeeping commit is pushed with the default `GITHUB_TOKEN`, which GitHub excludes from triggering further workflow runs — the same mechanism `syndicate-content.yml` relies on.
- **Manual dispatch**: pick `shelf` (`all` / `book` / `film` / `tv` / `game`) and `force`. Metadata only — no cover step — so a bulk/backfill run never races the push-triggered flow on the same commit.

It needs `TMDB_API_KEY`, `RAWG_API_KEY`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` as secrets (same ones `download-covers.yml` uses), commits the updated markdown (and cover, on push runs) to `main`, and rebases against concurrent pushes the same way the cover-download workflow does.

## Related Documentation

- [Shelf Cover Downloaders](./shelf-cover-downloaders.md)
- [Shelf Pages](../pages/shelf.md)
- [Shelf Queue Design](../../planning/shelf-queue-design.md)
