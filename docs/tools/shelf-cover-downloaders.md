# Shelf Cover Downloaders

Three scripts download poster/cover artwork for the film, TV, and game shelf categories, mirroring the existing book cover workflow.

## Overview

| Script | npm command | API | Category |
| --- | --- | --- | --- |
| `scripts/download-film-covers.js` | `npm run download-film-covers` | TMDB | `filmshelf` |
| `scripts/download-tv-covers.js` | `npm run download-tv-covers` | TMDB | `tvshelf` |
| `scripts/download-game-covers.js` | `npm run download-game-covers` | RAWG | `gameshelf` |

After downloading, the corresponding generate scripts update TypeScript cover-map files so Astro components can import images at build time:

| Generate script | npm command | Output file |
| --- | --- | --- |
| `scripts/generate-film-covers.js` | `npm run generate-film-covers` | `src/utils/filmCovers.ts` |
| `scripts/generate-tv-covers.js` | `npm run generate-tv-covers` | `src/utils/tvCovers.ts` |
| `scripts/generate-game-covers.js` | `npm run generate-game-covers` | `src/utils/gameCovers.ts` |

---

## Film Covers (TMDB)

**Script:** `scripts/download-film-covers.js`

Scans all `filmshelf` entries, searches TMDB `/search/movie` with the title, and downloads the poster to `src/images/filmshelf/[slug].jpg`. Updates the `filmCover` frontmatter field in the markdown file.

### Requirements

Set a `TMDB_API_KEY` environment variable (free account at [themoviedb.org](https://www.themoviedb.org/)).

```bash
export TMDB_API_KEY=your_key_here
npm run download-film-covers
```

### Filename Convention

```
"Dune: Part Two" → "dune-part-two.jpg"
```

### Frontmatter Updated

```yaml
filmCover: "dune-part-two.jpg"
```

---

## TV Covers (TMDB)

**Script:** `scripts/download-tv-covers.js`

Groups all `tvshelf` entries by `showTitle`. For each unique show, searches TMDB `/search/tv` and downloads one poster to `src/images/tvshelf/[show-slug].jpg`. Updates `tvCover` in every season file for that show.

### Requirements

Same `TMDB_API_KEY` as the film script.

```bash
export TMDB_API_KEY=your_key_here
npm run download-tv-covers
```

### Filename Convention

```
showTitle: "Severance" → "severance.jpg"
```

One image per show — all season files for the same show share it.

### Frontmatter Updated

```yaml
tvCover: "severance.jpg"
```

---

## Game Covers (RAWG)

**Script:** `scripts/download-game-covers.js`

Scans all `gameshelf` entries, searches RAWG `/api/games?search=TITLE`, and downloads the `background_image` to `src/images/gameshelf/[slug].jpg`. Updates `gameCover` in the markdown file.

### Requirements

No API key required (RAWG free tier). The script uses the public endpoint.

```bash
npm run download-game-covers
```

### Filename Convention

```
"Hollow Knight" → "hollow-knight.jpg"
```

### Frontmatter Updated

```yaml
gameCover: "hollow-knight.jpg"
```

---

## Running All Cover Scripts at Once

```bash
npm run download-film-covers && npm run download-tv-covers && npm run download-game-covers
```

Or to also regenerate cover maps:

```bash
npm run download-film-covers && npm run generate-film-covers
npm run download-tv-covers   && npm run generate-tv-covers
npm run download-game-covers && npm run generate-game-covers
```

---

## Directory Structure

```
src/
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

**Cover not found:** Check that the title in frontmatter matches the title on TMDB/RAWG. You can manually download a cover and place it in the appropriate `src/images/[category]/` directory with the correct slug filename, then run the generate script to register it.

**TMDB key missing:** The film and TV scripts will exit with an error if `TMDB_API_KEY` is not set.

**Idempotent:** All scripts skip entries where a cover file already exists on disk, so they are safe to re-run.

---

## Related Documentation

- [Book Cover Downloader](./book-cover-downloader.md)
- [Shelf Pages](../pages/shelf.md)
