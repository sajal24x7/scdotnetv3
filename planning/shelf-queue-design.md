# Shelf Queue — Design

A "to be read / watch / play" pipeline shared by all four shelf categories
(bookshelf, filmshelf, tvshelf, gameshelf): a public queue view per shelf, a
quick-add tab on `/write`, automatic metadata enrichment, and a defined path
for promoting a queued item into the reading/watching log — including the
case where the "real" note is born in Obsidian with a different filename.

**Status: design only — nothing here is implemented yet.**

---

## The core decision: markdown notes, not JSON

Queue items are ordinary shelf entries with `status: todo`. No JSON source of
truth.

Why:

1. **`todo` already exists.** The unified status enum in
   `src/content.config.ts` (`todo | started | paused | finished`) is shared by
   all four shelf categories, the filter badges, `SHELF_LIST_SORT_PRIORITY`,
   and the docs. "To be read" is already a first-class state of the existing
   system; a JSON file would be a second, parallel system for the same fact.
2. **Promotion becomes trivial.** Moving a book from queue → reading is a
   one-field frontmatter change (`status: todo` → `started`), or — in the
   Obsidian flow — deleting the stub once the real note arrives (§4). With
   JSON it would be a cross-format migration: delete a JSON row, create a
   markdown file, keep the two from drifting.
3. **Everything downstream already consumes markdown.** The enrichment
   scripts, cover downloaders, shelf pages, filters, and RSS all read the
   content collections. A `todo` entry gets enrichment and covers for free.
4. **A body is useful.** "Why I want to read this / who recommended it" fits
   naturally in the note body and renders on the queue card. JSON makes that
   awkward.

The JSON the original idea wanted still exists — but as a **derived view**,
not a source: a build-time endpoint `/api/shelf-queue.json` (Astro API route,
same pattern as `src/pages/api/link-previews.json.ts`) that lists every
`status: todo` entry with its category, title, creator, and repo file path.
The `/write` composer reads it to display the queue and to know which file to
PUT when you tap "Start".

### Anatomy of a queue stub

```yaml
---
title: "The Dispossessed"
author: "Ursula K. Le Guin"     # director / creator / developer for other shelves
category: bookshelf
created: 2026-07-16T09:30:00.000Z   # when it entered the queue → queue ordering
status: todo
---
Optional: why it's on the list, who recommended it.
```

`genre`, `year`, `series`, `cover` are filled in later by automation (§3).
The schema already accepts all of this; no schema changes needed.

---

## 1. Queue pages (shared across shelves)

Follow the now/then pattern: the shelf page is the log ("then"), the queue is
the intent ("now-ish"). Concretely:

- One shared component — `src/components/shelf/ShelfQueue.astro` — driven by
  a per-category config map (mirroring how `createSectionLandingProps` and
  `shelfStatus.ts` centralise per-category labels):

  | category  | route               | heading  | creator field | verb    |
  | --------- | ------------------- | -------- | ------------- | ------- |
  | bookshelf | `/bookshelf/queue/` | To Read  | `author`      | reading |
  | filmshelf | `/filmshelf/queue/` | To Watch | `director`    | watching|
  | tvshelf   | `/tvshelf/queue/`   | To Watch | `creator`     | watching|
  | gameshelf | `/gameshelf/queue/` | To Play  | `developer`   | playing |

- Four thin route files that just pass the config — the same shape as the
  four existing shelf index pages sharing `ShelfTabNav`.
- Each shelf page header gets a small "Queue →" link next to the RSS icon
  (the now ↔ then toggle, adapted); the queue page links back and reuses
  `ShelfTabNav` so you can hop between category queues.
- Card layout: compact row — cover thumbnail (when enriched), title, creator,
  "added <month year>" from `created`, and the body (the "why") rendered
  small. Sorted by `created` descending. No year grouping — a queue is a
  list, not an archive.

**Decision to make:** today, `todo` entries also render inside the main shelf
year grid (sorted last within their year). Once queue pages exist, I'd
exclude `todo` from the year grid so the log stays a log — but keeping them
is a one-line difference either way.

---

## 2. Quick add: a Shelf tab on `/write`

Add a fourth mode to `public/write/index.html` (it already switches
Micro/Photo/TIL via `data-mode` + `setMode()`):

- **Fields:** a Book/Film/TV/Game segmented control, **Title** (required),
  **Creator** (optional — placeholder label swaps to Author / Director /
  Creator / Developer with the category), and the existing notes textarea as
  the optional "why".
- **Publish** commits `YYYYMMDDHHMM <Title>.md` with the stub frontmatter
  above straight to `src/content/<category>/` on `main` via the GitHub
  Contents API — exactly the micro-post path (instant, schema-valid, no
  inbox, `sync-content-branch.yml` keeps `content` level). Same token, same
  collision retry, same draft autosave.
- **Queue list below the form:** fetched from `/api/shelf-queue.json`. Each
  row shows title/creator and two actions using the token the page already
  holds:
  - **Start** → GitHub Contents PUT on the stub: `status: started`,
    `started: <today>`. (For books, this is also where a
    `readingProgress` habit could hook in later.)
  - **Remove** → Contents DELETE (changed my mind).

  The JSON is regenerated at build time, so the list is as fresh as the last
  deploy — fine for this use.

TV nuance: quick-add is show-level. The stub gets `title` + `showTitle` set
to the show name and no season; the season-per-file structure only starts
when a real "Show S1" note exists. `showTitle` is the reconcile key (§4).

---

## 3. Automatic enrichment ("type a title, get a full card")

Extend the existing enrichment/cover machinery rather than inventing new:

| Shelf | Metadata source | Cover source | Exists today? |
| --- | --- | --- | --- |
| Film | TMDB (`enrich-film-metadata.js`) | TMDB (`download-film-covers.js`) | ✅ both |
| TV | TMDB (`enrich-tv-metadata.js`) | TMDB | ✅ both |
| Books | **new** `enrich-book-metadata.js` — Open Library + Google Books (both keyless; the cover script already queries both) → `author` (fill/normalise), `genre`, `year`, `series` | Open Library / Google Books | covers ✅, metadata ❌ |
| Games | **new** `enrich-game-metadata.js` — RAWG (keyless) with IGDB fallback (same sources as the cover script) → `developer`, `genre`, `year`, `platform` | RAWG / IGDB | covers ✅, metadata ❌ |

Trigger change: `enrich-shelf-metadata.yml` today is manual-dispatch only.
Add a `push` trigger on `main` filtered to
`src/content/{bookshelf,filmshelf,tvshelf,gameshelf}/**`, running:

1. the enrichment script(s) for the touched categories (idempotent — they
   already skip entries that have their fields), then
2. the matching cover downloader + cover-map generator,
3. one commit back to `main` with the `[CI Skip]`-style guard the
   syndication workflow already uses so the bookkeeping commit doesn't loop
   the workflow or trigger a second Cloudflare build unnecessarily —
   actually here we *want* one rebuild (to show the cover), so: commit
   normally but gate the workflow's own trigger with a commit-message check
   (`if: !contains(github.event.head_commit.message, 'enrich:')`).

End-to-end: type "The Dispossessed / Le Guin" on your phone → stub commits →
Action fills genre/year/series and downloads the cover → site rebuilds with
a complete queue card. No manual steps; entries the APIs can't match are
left untouched and logged, same as today.

---

## 4. Promoting queue → reading (and the Obsidian filename problem)

Two paths, both supported; they coexist per-item.

### Path A — edit in place (no Obsidian note)

Tap **Start** on the `/write` queue list. The stub itself becomes the log
entry (`status: started`, `started:` set). Best for films/games/TV where you
often never write a note at all. Finishing later is the same kind of edit
(Obsidian, GitHub mobile, or a future "finish" action).

### Path B — Obsidian-first (your existing habit; applies to all four shelves)

You start something new → you create a new note in Obsidian as always
(`status: started`, your own timestamp filename) → GitSync pushes it to the
`content` branch → `content-publish.yml` normalizes and sorts it into its
category folder, exactly as today. **That existing flow is untouched** — the
Obsidian note is the new canonical entry, as-is.

The only addition is a **check-and-delete step** in that pipeline, right
after `sort-inbox`, identical for bookshelf, filmshelf, tvshelf, and
gameshelf:

> For each shelf note that just arrived from the inbox, look for an existing
> entry in the same category that has `status: todo` — and **only**
> `status: todo`; started/paused/finished entries are never candidates —
> whose **normalised title** matches (lowercase, punctuation stripped — the
> exact normalisation `computeWatchNumbers()` already uses; for TV, match on
> normalised `showTitle` instead). If found: delete the stub, in the same
> publish commit. Nothing is copied or merged.

Consequences:

- **The filename mismatch evaporates.** The Obsidian note's filename becomes
  the canonical one; the stub with its different timestamp is deleted before
  anything reaches `main`, so no duplicate ever renders.
- No merge logic to get wrong: the new note arrives bare and the enrichment
  workflow (§3) fills its metadata and cover again on the next push — the
  stub's enriched fields are simply discarded with it.
- Matching only against `todo` keeps rereads/rewatches safe: a second "Wool"
  entry never deletes the finished first read — rewatch detection keeps
  working on multiple non-todo entries as today.

**Failure mode** (titles differ: "Wool" vs "Wool (Silo, #1)"): the stub
survives and shows as a leftover on the queue page — visible, harmless,
fixed by tapping Remove. The publish run's summary can flag near-miss pairs
(high-similarity titles across todo/started in one category) to make these
easy to spot. This is deliberately a soft failure: no fuzzy auto-merge that
could eat the wrong note.

### Why not "sync stubs into the vault" instead?

The vault and the site repo are separate; GitSync only pushes vault →
`content`. Making stubs appear in Obsidian would mean writing into the vault
from CI — invasive, conflict-prone, and it would fight the "vault is where
*my* notes are born" model. Reconcile-on-arrival keeps each system's
ownership clean: the queue belongs to the site, the notes belong to the
vault.

---

## Files touched (when implemented)

| Piece | Files |
| --- | --- |
| Queue pages | `src/components/shelf/ShelfQueue.astro`, `src/utils/shelfQueue.ts` (config map), 4 thin routes `src/pages/{book,film,tv,game}shelf/queue/index.astro`, "Queue" link in shelf headers |
| JSON view | `src/pages/api/shelf-queue.json.ts` |
| Composer tab | `public/write/index.html` (new mode, form, queue list, Start/Remove) |
| Enrichment | `scripts/enrich-book-metadata.js`, `scripts/enrich-game-metadata.js`, `push` trigger in `.github/workflows/enrich-shelf-metadata.yml` |
| Reconcile | `scripts/reconcile-shelf-queue.js` (or a section in `sort-inbox.sh`), wired into `content-publish.yml` |
| Docs | `docs/pages/shelf.md` (queue section), `docs/content/micro-composer.md` (shelf tab), `docs/tools/shelf-metadata-enrichment.md` (books/games) |

Suggested build order: **1)** queue pages + JSON endpoint (pure read of
existing `todo` entries — immediately useful), **2)** composer tab,
**3)** enrichment for books/games + push trigger, **4)** reconcile step.
Each stage ships independently.
