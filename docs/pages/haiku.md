# Haiku

A daily haiku practice. Haiku are their own content category (`haiku`), live
in the garden, and get their own page at `/haiku/`.

## Writing one

Create a note in `src/content/haiku/` (or drop it in the inbox) with
`category: haiku`. A title is optional; most haiku need none. Put one line of
verse per line in the body:

```markdown
---
created: 2026-10-11T07:30:00.000Z
category: haiku
tags:
  - rain
---
morning rain again
the heron does not move
neither do I
```

There is nothing season-related to fill in. The season comes from `created`.

## Season

`getSeason()` in `src/utils/haiku.ts` reads the month of `created` in the site
timezone (`SITE_TIMEZONE`, Helsinki) and maps it to a meteorological,
northern-hemisphere season split into early, mid and late:

| Months | Season |
| --- | --- |
| Dec, Jan, Feb | Early, mid, late winter |
| Mar, Apr, May | Early, mid, late spring |
| Jun, Jul, Aug | Early, mid, late summer |
| Sep, Oct, Nov | Early, mid, late autumn |

A winter belongs to the year of its December, so the `/haiku/` page groups
December 2026 to February 2027 as "Winter 2026–27". Season accent colors are
the `--season-*` tokens in `src/styles/tokens.css`.

## Where haiku show up

- `/haiku/`: a single column, newest first, grouped by season. Each entry
  shows the season, date, its number in the practice (oldest is No. 1), the
  verse with the classic stepped indent, tags and syndication links
  (`src/components/haiku/HaikuItem.astro`).
- `/haiku/<slug>/`: `HaikuPostLayout.astro`, centered verse with previous and
  next links.
- `/garden/`: a compact haiku card in the grid (`HaikuItem` with
  `variant="card"`).
- Home feed: full verse with the season beside the date (`renderHaiku` in
  `src/utils/feed.ts`).
- RSS: `/haiku/rss.xml`, plus the garden and site-wide feeds.

## Syndication

Haiku are in the `rss` list of `publication.config.json` but **not** in
`syndication`, so they do not cross-post to Mastodon, Bluesky or Threads.
Add `"haiku": "all"` under `syndication` to turn that on.

## Checks

```sh
node --experimental-strip-types src/utils/__checks__/haiku.check.ts
```
