# Content Authoring Guide

Follow this guide when adding or updating Markdown/MDX entries under `src/content`.

## Directory Structure

- Content lives one folder per category under `src/content/<category>/` (e.g. `src/content/bookshelf`, `src/content/blog`) — not year folders. The full category list is `CONTENT_CATEGORIES` in `src/content.config.ts`.【F:src/content.config.ts†L106-L121】
- New notes land in `src/content/inbox/` first; the publish pipeline sorts them into their category folder based on the `category` frontmatter field (see [Publishing Shortcut](./publishing-shortcut.md)).
- Filenames start with a timestamp (`YYYYMMDDHHMM Title.md`). The content-collection loader uses the frontmatter `slug` as the entry's URL id if present, otherwise it slugifies the filename.【F:src/content.config.ts†L10-L33】

## Frontmatter Schema

`src/content.config.ts` enforces the following fields for the primary posts collection (shared by all 14 content categories):

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Optional | Recommended for long-form pieces; cards fall back to slug if missing. |
| `description` | Optional | Appears in search results and cards; keep under ~160 characters. |
| `created` | Required | ISO string or `Date` value. Used for sorting, display, and RSS `pubDate`. |
| `updated` | Optional | Displayed where relevant; set when substantive revisions occur. |
| `category` | Required | One of `evergreen`, `blog`, `micro`, `photo`, `nordletter`, `story`, `poem`, `bookshelf`, `filmshelf`, `tvshelf`, `gameshelf`, `now`, `til`, `colophon`. Categories drive navigation highlights, chip colors, and URLs.【F:src/content.config.ts†L41】【F:src/content.config.ts†L106-L121】 |
| `status` | Optional (default `started`) | Unified `todo` / `started` / `paused` / `finished` field, shared by `now` posts (a life focus) and shelf posts (a book/film/show/game). Display text is category-specific — see `src/utils/shelfStatus.ts`. Shelf RSS feeds only include entries with `status: finished`.【F:src/content.config.ts†L42-L44】 |
| `tags` | Optional | Array of strings; powers tag pages and search weighting. |
| `image` | Optional | Path or URL for hero/cover art. Required for some grid layouts. |
| `images` | Optional | Photo posts only: array of gallery image URLs. Rendered as a carousel on the post page and used by the `/photos` grid; the body holds just the caption. |
| `syndicationUrls` | Optional | Managed by the syndication workflow; manual entries should list canonical cross-post URLs.【F:src/content.config.ts†L87】 |
| Book-specific fields | Optional | `author`, `series`, `seriesNumber`, `started`, `finished`, `readingProgress`, `rating`, `cover` drive bookshelf components. `status` (see above) tracks reading progress.【F:src/content.config.ts†L62-L85】 |
| Film-specific fields | Optional | `director`, `year`, `finished`, `rating`, `cover` for `filmshelf` entries. `status` tracks watch progress. |
| TV-specific fields | Optional | `showTitle`, `season`, `creator`, `year`, `started`, `finished`, `rating`, `cover` for `tvshelf` entries. `showTitle` is the grouping key for multi-season shows. `status` tracks watch progress. |
| Game-specific fields | Optional | `developer`, `platform`, `hoursPlayed`, `started`, `finished`, `rating`, `cover` for `gameshelf` entries. `status` tracks play progress. |

Nordletter issues (`src/content/nordletter`) and notes use the same shared schema but only populate the fields relevant to a newsletter issue (`edition`, `description`, `image`).【F:src/content.config.ts†L36-L88】

## Metadata and Chips

- Categories render through `CategoryDisplay.astro`, which applies the shared `.card-chip` style. Keep category values concise so chips remain legible.【F:src/components/CategoryDisplay.astro†L1-L16】【F:src/styles/global.css†L475-L540】
- Publication dates and syndication notices also use chip styling. Ensure `created` is accurate so time-based UI (and RSS `pubDate`) remains correct.【F:src/components/Card.astro†L1-L64】【F:src/components/PostItem.astro†L70-L180】

## Linking and Backlinks

- Use root-relative links (`/evergreen/example-post/`, i.e. `/<category>/<slug>/`) when referencing other posts. The backlink index normalizes full URLs and bare domains, but root-relative paths are the most reliable.【F:src/utils/backlinks.ts†L145-L261】
- Backlink sections render automatically at the bottom of posts when other entries link to them. No additional markup is necessary.【F:src/components/Backlinks.astro†L5-L73】

## Syndication

- If you cross-post manually, append the resulting URLs to the `syndicationUrls` array so `SyndicationLinks.astro` can expose them in post headers.【F:src/content.config.ts†L87】

## Learn Blocks

- TIL and evergreen notes can opt into the `/learn` spaced-repetition decks by adding a fenced ` ```learn ` block with prompts. Use the bare `q:`/`a:` shorthand for the common case; the full `prompts:` list syntax is only needed for per-prompt `id:`/`note:` overrides. See [Learning Systems Architecture](../architecture/learning-systems.md#note-backed-decks-learntil-learnevergreen) for the full syntax and id-stability rules.

## Content Tips

- Keep descriptions concise and actionable; they power search previews and social embeds.
- Favor Markdown headings (`##`) over manual bold text to improve table-of-contents generation and anchor linking.
- For photo or micro posts, ensure the first paragraph or blockquote includes enough context for search results and feed cards.

## Review Checklist

- [ ] File saved under the correct category directory with consistent timestamp naming.
- [ ] Frontmatter includes `created` and a valid `category` enum value.
- [ ] Description and tags added if the post should rank well in search.
- [ ] Internal links use root-relative paths to support backlinks.
- [ ] Cross-post URLs recorded (or script will add them later).

## Related Documentation

- [Micro Composer](./micro-composer.md) — publish micro posts from a phone via `/write`
- [Content Lifecycle](../architecture/content-lifecycle.md)
- [Design System](../design/system.md)
- [Syndication Workflow](../operations/syndication.md)
