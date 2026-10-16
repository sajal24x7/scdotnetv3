# Haiku

A daily haiku practice. Haiku are their own content category (`haiku`) with
their own page at `/haiku/`. They belong to the garden group (so they use the
garden post layout and relative "Planted" dates) but are filtered out of the
`/garden/` page itself.

## Writing one

Create a note in `src/content/haiku/` (or drop it in the inbox) with
`category: haiku`. A title is optional; most haiku need none. Put one line of
verse per line in the body:

```markdown
---
created: 2026-10-11T07:30:00.000Z
category: haiku
---
morning rain again
the heron does not move
neither do I
```

## Numbering

Every haiku has a `number:` in its frontmatter: its place in the practice,
oldest first. You don't set it yourself. `scripts/number_haiku.py` runs at the
end of `sort-inbox.sh` in the publishing pipeline and gives each new haiku the
next number after the current highest (several new ones are numbered oldest
`created` first). Numbers already set are never changed, so a backdated haiku
still goes to the end. To renumber, edit `number:` by hand.

The site (`/haiku/` and the single post page) and the syndication script both
read this field, so there is one source for the number. Run it by hand with
`npm run number-haiku`.

A haiku re-synced from the vault keeps its number: `sort-inbox.sh` carries
over frontmatter fields the vault copy lacks (`--merge-missing`).

## Where haiku show up

- `/haiku/`: the stream layout used by `/micro/`, newest first. Each entry
  shows its relative date, its number ("No. 12") and the full verse.
- `/haiku/<slug>/`: the garden post layout, with "No. 12. Planted 2 days ago."
  above the verse.
- Home feed: rendered like micro posts (full verse, no title).
- RSS: `/haiku/rss.xml`, plus the site-wide feed.
- Not on `/garden/`.

## Syndication

Haiku are in both the `rss` and `syndication` lists of
`publication.config.json`, so they cross-post to Mastodon, Bluesky and Threads
(not Instagram, which is photo-only). Each post carries the haiku number ("No. 12") and
the full verse with its line breaks, then a "Read all haiku" link to `/haiku/` rather than to the
single haiku. See `formatHaikuPost()` in `scripts/lib/content-formatter.js`.
