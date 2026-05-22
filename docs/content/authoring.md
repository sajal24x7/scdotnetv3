# Content Authoring Guide

Follow this guide when adding or updating Markdown/MDX entries under `src/content`.

## Directory Structure

- Create new posts inside the current year folder (`src/content/2025`, etc.). Year directories are discovered automatically, so no code changes are needed when the calendar rolls over.【F:src/utils/content.ts†L28-L37】
- Filenames typically start with a timestamp (`YYYYMMDDHHMM Title.md`). The slug defaults to the filename unless overridden in frontmatter.【F:scripts/syndicate-content.js†L49-L86】

## Frontmatter Schema

`src/content/config.ts` enforces the following fields for the primary posts collection:

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Optional | Recommended for long-form pieces; cards fall back to slug if missing.【F:src/content/config.ts†L1-L55】 |
| `description` | Optional | Appears in search results and cards; keep under ~160 characters.【F:src/pages/search-index.json.ts†L1-L31】 |
| `pubDate` | Required | ISO string or `Date` value. Used for sorting and display.【F:src/content/config.ts†L1-L22】 |
| `updatedDate` | Optional | Displayed where relevant; set when substantive revisions occur.【F:src/content/config.ts†L1-L22】 |
| `category` | Required | Must be one of `evergreen`, `blog`, `micro`, `photo`, `nordletter`, `story`, `poem`, `bookshelf`, `now`, or `til`. Categories drive navigation highlights, chip colors, and URLs.【F:src/content/config.ts†L13-L30】【F:src/components/navigation/MultiLevelNavigation.astro†L12-L94】 |
| `tags` | Optional | Array of strings; powers tag pages and search weighting.【F:src/pages/search-index.json.ts†L12-L20】 |
| `image` | Optional | Path or URL for hero/cover art. Required for some grid layouts. |
| `syndicationUrls` | Optional | Managed by the syndication workflow; manual entries should list canonical cross-post URLs.【F:src/content/config.ts†L31-L55】 |
| Book-specific fields | Optional | `author`, `series`, `bookStatus`, `startedReading`, `finishedReading`, `bookRating`, `bookCover` drive bookshelf components.【F:src/content/config.ts†L23-L55】 |
| Film-specific fields | Optional | `director`, `year`, `watchedDate`, `filmStatus`, `filmRating`, `filmCover` for `filmshelf` entries. |
| TV-specific fields | Optional | `showTitle`, `season`, `creator`, `year`, `tvStatus`, `tvRating`, `tvCover` for `tvshelf` entries. `showTitle` is the grouping key for multi-season shows. |
| Game-specific fields | Optional | `developer`, `year`, `platform`, `gameStatus`, `gameRating`, `gameCover` for `gameshelf` entries. |

Nordletter issues (`src/content/nordletter`) and notes use their own schemas but follow similar conventions for title, description, and dates.【F:src/content/config.ts†L57-L90】

## Metadata and Chips

- Categories render through `CategoryDisplay.astro`, which applies the shared `.card-chip` style. Keep category values concise so chips remain legible.【F:src/components/CategoryDisplay.astro†L1-L16】【F:src/styles/global.css†L475-L540】
- Publication dates and syndication notices also use chip styling. Ensure `pubDate` is accurate so time-based UI remains correct.【F:src/components/Card.astro†L1-L64】【F:src/components/PostItem.astro†L70-L180】

## Linking and Backlinks

- Use root-relative links (`/garden/example-post/`) when referencing other posts. The backlink index normalizes full URLs and bare domains, but root-relative paths are the most reliable.【F:src/utils/backlinks.ts†L145-L261】
- Backlink sections render automatically at the bottom of posts when other entries link to them. No additional markup is necessary.【F:src/components/Backlinks.astro†L5-L73】

## Syndication

- If you cross-post manually, append the resulting URLs to the `syndicationUrls` array so `SyndicationLinks.astro` can expose them in post headers.【F:src/content/config.ts†L31-L55】

## Content Tips

- Keep descriptions concise and actionable; they power search previews and social embeds.
- Favor Markdown headings (`##`) over manual bold text to improve table-of-contents generation and anchor linking.
- For photo or micro posts, ensure the first paragraph or blockquote includes enough context for the search modal and feed cards.

## Review Checklist

- [ ] File saved under the correct year directory with consistent timestamp naming.
- [ ] Frontmatter includes `pubDate` and a valid `category` enum value.
- [ ] Description and tags added if the post should rank well in search.
- [ ] Internal links use root-relative paths to support backlinks.
- [ ] Cross-post URLs recorded (or script will add them later).

## Related Documentation

- [Content Lifecycle](../architecture/content-lifecycle.md)
- [Design System](../design/system.md)
- [Syndication Workflow](../operations/syndication.md)
