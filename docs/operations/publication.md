# Publication Allowlist

`publication.config.json` (repo root) is the single place that decides which posts are published to readers — which categories and shelf statuses appear in RSS feeds and which are syndicated to social platforms. Nothing reaches a feed or a POSSE target unless it is explicitly listed there.

## How It Works

The file maps each **surface** to a category allowlist:

```json
{
  "rss": {
    "blog": "all",
    "bookshelf": ["finished"]
  },
  "syndication": {
    "blog": "all",
    "bookshelf": ["started", "paused", "finished"]
  }
}
```

- `"all"` — every post in the category is published on that surface.
- `["status", …]` — only posts whose `status` frontmatter matches one of the listed values are published. Shelf categories use this to keep queue stubs (`todo`) and other unpublished states off feeds.
- **Missing category** — publishes nothing on that surface. This is the explicit-allow guarantee: a new content category or a new shelf status stays off every feed and every syndication target until it is deliberately added here.

### Surfaces

| Surface | Governs | Consumed by |
| --- | --- | --- |
| `rss` | The site-wide feed (`/rss.xml`), every per-category feed, and the group feeds (stream, garden, prose, longform, shelf). | `src/utils/publication.ts` via each `src/pages/**/rss.xml.js` |
| `syndication` | POSSE cross-posting to Mastodon, Bluesky, Threads, and Instagram. | `scripts/syndicate-content.js` (reads the JSON directly) |

### What stays in code

Rules that are not a category/status decision remain where they were:

- **Backfill cutoff** — film/TV entries bulk-imported from Netflix history are excluded by date, layered on top of the allowlist: `isNotBackfilled` in `src/utils/rss.js` for feeds, mirrored in `scripts/syndicate-content.js` for syndication (the import set their `created` to the import date, so the recency window alone can't catch them).
- **Platform constraints** — Instagram remains photo-only; character limits and rate limits live in `syndication.config.json` and `scripts/lib/`.
- **On-site display** — the homepage unified feed and section pages are site navigation, not outbound publication. The unified feed has its own explicit category list (`FEED_GROUPS` in `src/utils/feed.ts`).

## Adding a New Category or Status

1. Create the content category (folder under `src/content/`, collection in `src/content.config.ts`) or start using the new `status` value.
2. Nothing is published yet — feeds and syndication ignore it by default.
3. When ready to publish, add the category (or add the status to the category's array) under `rss` and/or `syndication` in `publication.config.json`.

## Helper API

`src/utils/publication.ts` exposes:

- `publishedCategories(surface)` — categories listed for a surface.
- `isPublished(surface, category, status?)` — whether a post passes the allowlist.
- `publicationFilter(surface, category?)` — a predicate for `getCollection()` filters or `Array#filter`; reads the category from the post when not supplied.

The syndication script parses the JSON with `fs` (it runs outside Astro) and applies the same semantics.

## Related Documentation

- [Syndication](syndication.md)
- [Content Lifecycle](../architecture/content-lifecycle.md)
- [Publishing Pipeline](../content/publishing-pipeline.md)
