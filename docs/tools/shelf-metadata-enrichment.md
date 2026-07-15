# Shelf Metadata Enrichment

Two scripts fill in `genre`, `director`/`creator`, and `year` for the film and TV shelves from TMDB — separate from the [cover downloaders](./shelf-cover-downloaders.md), which only ever touch the `cover` field. Both run on demand via `.github/workflows/enrich-shelf-metadata.yml`.

## Overview

| Script | Run directly | Fields written | Category |
| --- | --- | --- | --- |
| `scripts/enrich-film-metadata.js` | `node scripts/enrich-film-metadata.js` | `genre`, `director`, `year` | `filmshelf` |
| `scripts/enrich-tv-metadata.js` | `node scripts/enrich-tv-metadata.js` | `genre`, `creator`, `year` | `tvshelf` |

### Requirements

Set a `TMDB_API_KEY` environment variable (or add it to a local `.env` file) — same free key used by the cover downloaders.

```bash
export TMDB_API_KEY=your_key_here
node scripts/enrich-film-metadata.js
node scripts/enrich-film-metadata.js --force            # overwrite existing values too
node scripts/enrich-film-metadata.js --title "Inception" # only this film

node scripts/enrich-tv-metadata.js
node scripts/enrich-tv-metadata.js --title "Breaking Bad"
```

### How it works

- **Film**: searches TMDB's `/search/movie` with the title (and `year` if already known), then reads genres and release year from `/movie/{id}` and director(s) from `/movie/{id}/credits`.
- **TV**: groups entries by `showTitle`, searches `/search/tv` once per unique show, then reads genres, `created_by` (→ `creator`), and first-air year from `/tv/{id}` — one TMDB lookup covers every season file for that show.
- **Idempotent by default**: a film/show is skipped if it already has both `genre` and `director`/`creator` set. Pass `--force` to re-fetch and overwrite everything, e.g. after a source-data correction.
- Entries TMDB can't match (obscure regional titles, anthology specials, stand-up comedy specials filed as movies) are left untouched and logged as "No TMDB match" — nothing is guessed.

## The Workflow

`.github/workflows/enrich-shelf-metadata.yml` — manual dispatch only:

- Pick `shelf`: `all` / `film` / `tv`.
- `force`: overwrite fields that already have a value.

It needs the `TMDB_API_KEY` secret (same one `download-covers.yml` uses), commits the updated markdown to `main`, and rebases against concurrent pushes the same way the cover-download workflow does.

## Related Documentation

- [Shelf Cover Downloaders](./shelf-cover-downloaders.md)
- [Shelf Pages](../pages/shelf.md)
