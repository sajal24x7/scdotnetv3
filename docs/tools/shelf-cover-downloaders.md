# Shelf Cover Downloaders

Three scripts download poster/cover artwork for the film, TV, and game shelf categories, mirroring the [book cover downloader](./book-cover-downloader.md). All four run on a shared schedule via `.github/workflows/download-covers.yml` — books daily, film/TV/game weekly (Sundays) — and all write the same unified `cover` frontmatter field.

## Overview

| Script | Run directly | Source(s) | Category |
| --- | --- | --- | --- |
| `scripts/download-film-covers.js` | `node scripts/download-film-covers.js` | TMDB | `filmshelf` |
| `scripts/download-tv-covers.js` | `node scripts/download-tv-covers.js` | TMDB | `tvshelf` |
| `scripts/download-game-covers.js` | `node scripts/download-game-covers.js` | RAWG, then IGDB (Twitch) as fallback | `gameshelf` |

There are no `npm run download-film-covers` / `download-tv-covers` / `download-game-covers` shortcuts in `package.json` — invoke the scripts with `node` directly, or trigger the shared workflow (see below). Only the book scripts have npm aliases (`download-covers`, `download-covers:force`, `download-covers:refresh-low-res`).

After downloading, the corresponding generate scripts update TypeScript cover-map files so Astro components can import images at build time:

| Generate script | Run directly | Output file |
| --- | --- | --- |
| `scripts/generate-film-covers.js` | `node scripts/generate-film-covers.js` | `src/utils/filmCovers.ts` |
| `scripts/generate-tv-covers.js` | `node scripts/generate-tv-covers.js` | `src/utils/tvCovers.ts` |
| `scripts/generate-game-covers.js` | `node scripts/generate-game-covers.js` | `src/utils/gameCovers.ts` |

## The Shared Workflow

All four shelves run through one workflow, `.github/workflows/download-covers.yml`:

- **Books**: every day at 2 AM UTC
- **Film, TV, games**: every Sunday at 3 AM UTC
- **Manual dispatch**: pick a shelf (`all`/`book`/`film`/`tv`/`game`) and a mode (`normal`/`force`/`refresh-low-res` — the low-res mode only applies to books)

Each shelf's job runs `node scripts/download-<shelf>-covers.js`, then `node scripts/generate-<shelf>-covers.js`, then commits the images plus updated frontmatter to `main` (rebasing first to avoid racing other automation). It needs these secrets, passed as env vars to the download step: `TMDB_API_KEY`, `RAWG_API_KEY`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`.

---

## Film Covers (TMDB)

**Script:** `scripts/download-film-covers.js`

Scans all `filmshelf` entries, searches TMDB's `/search/movie` with the title, and downloads the poster to `src/images/filmshelf/[slug].jpg`. Updates the unified `cover` frontmatter field in the markdown file.

### Requirements

Set a `TMDB_API_KEY` environment variable (or add it to a local `.env` file) — free account at [themoviedb.org](https://www.themoviedb.org/settings/api).

```bash
export TMDB_API_KEY=your_key_here
node scripts/download-film-covers.js
node scripts/download-film-covers.js --force            # re-download every poster
node scripts/download-film-covers.js --title "Inception" # only this film
```

### Filename Convention

```
"Dune: Part Two" → "dune-part-two.jpg"
```

### Frontmatter Updated

```yaml
cover: "dune-part-two.jpg"
```

---

## TV Covers (TMDB)

**Script:** `scripts/download-tv-covers.js`

Groups all `tvshelf` entries by `showTitle` (falling back to `title`). For each unique show, searches TMDB's `/search/tv` and downloads one poster to `src/images/tvshelf/[show-slug].jpg`, then updates `cover` in every season file for that show.

### Requirements

Same `TMDB_API_KEY` as the film script.

```bash
export TMDB_API_KEY=your_key_here
node scripts/download-tv-covers.js
node scripts/download-tv-covers.js --force
node scripts/download-tv-covers.js --title "Breaking Bad"
```

### Filename Convention

```
showTitle: "Severance" → "severance.jpg"
```

One image per show — all season files for the same show share it.

### Frontmatter Updated

```yaml
cover: "severance.jpg"
```

---

## Game Covers (RAWG, then IGDB)

**Script:** `scripts/download-game-covers.js`

Scans all `gameshelf` entries and searches RAWG first; if RAWG has no image for a title, it falls back to IGDB (Twitch-authenticated). Downloads the cover to `src/images/gameshelf/[slug].jpg` and updates `cover` in the markdown file.

### Requirements

- **RAWG**: no key required for the free tier; set `RAWG_API_KEY` for higher rate limits.
- **IGDB fallback**: requires `TWITCH_CLIENT_ID` + `TWITCH_CLIENT_SECRET` (free at [dev.twitch.tv](https://dev.twitch.tv/)).

Both can be set as environment variables or in a local `.env` file.

```bash
node scripts/download-game-covers.js
node scripts/download-game-covers.js --force
node scripts/download-game-covers.js --title "Hades"
```

### Filename Convention

```
"Hollow Knight" → "hollow-knight.jpg"
```

### Frontmatter Updated

```yaml
cover: "hollow-knight.jpg"
```

---

## Running All Cover Scripts at Once

```bash
node scripts/download-film-covers.js && node scripts/download-tv-covers.js && node scripts/download-game-covers.js
```

Or to also regenerate cover maps:

```bash
node scripts/download-film-covers.js && node scripts/generate-film-covers.js
node scripts/download-tv-covers.js   && node scripts/generate-tv-covers.js
node scripts/download-game-covers.js && node scripts/generate-game-covers.js
```

(Books use the npm aliases instead — see [Book Cover Downloader](./book-cover-downloader.md).)

---

## Directory Structure

```
src/
├── content/
│   ├── bookshelf/     # status/rating/cover live in unified frontmatter fields
│   ├── filmshelf/
│   ├── tvshelf/
│   └── gameshelf/
├── images/
│   ├── bookshelf/     # book covers
│   ├── filmshelf/     # film posters
│   ├── tvshelf/       # TV show posters (one per show)
│   └── gameshelf/     # game cover art
└── utils/
    ├── bookCovers.ts  # auto-generated TypeScript cover map
    ├── filmCovers.ts  # auto-generated
    ├── tvCovers.ts    # auto-generated
    └── gameCovers.ts  # auto-generated
```

---

## Troubleshooting

**Cover not found:** Check that the title in frontmatter matches the title on TMDB/RAWG/IGDB. You can manually download a cover and place it in the appropriate `src/images/[category]/` directory with the correct slug filename, set `cover:` to that filename in the frontmatter, then run the generate script to register it.

**TMDB key missing:** The film and TV scripts exit with an error if `TMDB_API_KEY` isn't set (env var or `.env`).

**RAWG/IGDB:** RAWG works without a key at a lower rate limit; if it comes up empty and `TWITCH_CLIENT_ID`/`TWITCH_CLIENT_SECRET` aren't set, the game script has no fallback and will report the game as not found.

**Idempotent:** All scripts skip entries where a cover file already exists on disk (unless `--force` is passed), so they are safe to re-run.

---

## Related Documentation

- [Book Cover Downloader](./book-cover-downloader.md)
- [Shelf Pages](../pages/shelf.md)
