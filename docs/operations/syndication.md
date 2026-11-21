# Syndication Workflow (POSSE)

The POSSE pipeline cross-posts recent entries to Mastodon, Bluesky, and Threads — plus Instagram for photo posts — then writes the resulting URLs back into each post’s frontmatter.

## Overview

- Entry point: `scripts/syndicate-content.js`.
- Supported platforms are configured via `syndication.config.json`, which defines character limits, how URLs and characters are counted, which categories get hashtags, per-platform category limits, and rate limits.【F:scripts/syndicate-content.js†L1-L118】【F:syndication.config.json†L1-L63】
- Eligible categories (and, for shelves, eligible statuses) come from the `syndication` map in `publication.config.json` — the central [publication allowlist](publication.md). Categories missing from that map are never syndicated.
- Instagram is photo-only: its `categories: ["photo"]` entry in `syndication.config.json` restricts it to photo posts (the API cannot publish without an image). Setup and content requirements live in [instagram-setup.md](instagram-setup.md).

## Execution Flow

1. **Content discovery** – Reads every Markdown file in the category folders under `src/content/`, parsing frontmatter with `gray-matter`. Posts older than `SYNDICATION_DAYS_BACK` (default 7 days) are skipped.【F:scripts/syndicate-content.js†L39-L86】【F:scripts/syndicate-content.js†L99-L133】
2. **Eligibility check** – A post proceeds if the `syndication` allowlist in `publication.config.json` permits its category/status and it is missing one or more platform URLs.【F:scripts/syndicate-content.js†L91-L133】
3. **Rate limiting** – Each platform has a `RateLimiter` instance to respect API quotas before posting.【F:scripts/syndicate-content.js†L118-L137】
4. **Posting** – Platform-specific helpers in `scripts/lib/platforms/` handle API calls. In dry-run mode (`SYNDICATION_DRY_RUN=true`) the script logs mock URLs instead of publishing.【F:scripts/syndicate-content.js†L139-L207】
5. **Frontmatter updates** – New URLs are merged into the `syndicationUrls` array using `safeUpdateSyndicationUrls()`, which preserves all other fields and optionally creates backups.【F:scripts/lib/frontmatter-updater.js†L1-L120】

## What Each Post Looks Like

`scripts/lib/content-formatter.js` builds a short post: one or two lines plus a bare link, with no "Read more" text. Hashtags go out on photo posts only (`defaults.hashtagCategories` in `syndication.config.json`).

| Category | Post |
|---|---|
| micro (link post) | Your comments, then the shared link. The quoted excerpt is skipped. If it doesn't fit, the comments are cut at a sentence end and the link points at your post instead. |
| micro (plain note) | Full text. If it doesn't fit, cut at a sentence end plus a link to the post. |
| photo | Caption and hashtags, images attached. If it doesn't fit, cut caption, link to the post, hashtags. |
| haiku | `No. N`, the verse, then `Read all haiku: https://sajalchoudhary.net/haiku/`. |
| poem | The full poem with line breaks and no title, when it fits. Otherwise title and link. |
| til | Title and link. |
| blog, nordletter, evergreen, story and other long-form posts | `description` and link, or title and link when there is no description. |
| shelf, notes and description | `<description>`, then `My review: <link>`. |
| shelf, notes, no description | `Finished reading X. My review: <link>` (watching for film and TV, playing for games; TV adds the season). |
| shelf, no notes | `Finished watching X`, no link. Empty `## Review` / `## Notes` headings and auto lines like "Finished watching on 2026-11-09." don't count as notes. |

Lengths are counted the way each platform counts them: Mastodon counts every URL as 23 characters, Bluesky counts graphemes. A post that doesn't fit is cut at a sentence end (or a word, with "…"), never through the link.

Images upload natively for micro and photo posts: up to 4 on Mastodon and Bluesky (Bluesky's ~1 MB blob limit applies), the first image on Threads. If an upload fails, the post still goes out as text with a console warning.

## Configuration

Key environment variables:

- `SYNDICATION_DRY_RUN` – Set to `true` to test formatting without posting.
- `SYNDICATION_DAYS_BACK` – Limits how far back the script looks for posts (defaults to seven days).【F:scripts/syndicate-content.js†L29-L37】

Platform credentials should be stored as environment variables (see platform helper files for exact names) and configured in your local shell or CI secrets manager.

`syndication.config.json` controls platform character limits, hashtag categories, and rate limits. Adjust this file when adding new networks or tweaking copy guidelines. Which categories and statuses syndicate at all is decided separately by `publication.config.json` — see the [publication allowlist](publication.md).

## Running the Script

- `npm run syndicate` executes the workflow in live mode.
- `npm run syndicate:dry-run` runs with `SYNDICATION_DRY_RUN=true` set automatically for safe previews.【F:package.json†L17-L21】

In production, syndication runs via `.github/workflows/syndicate-content.yml` on a schedule (every 3 hours, plus manual `workflow_dispatch`). Each sweep scans the last `SYNDICATION_DAYS_BACK` days, skips posts that already have `syndicationUrls`, cross-posts the rest, then writes `syndicationUrls` back with a `[CI Skip]` commit so the bookkeeping doesn't trigger another build. The site build itself (`npm run build` / `build:cloudflare`) never syndicates. See [Publishing Pipeline](../content/publishing-pipeline.md) for the full flow.

## Maintenance Tips

- Keep `src/content` committed with the latest `syndicationUrls`; re-running the script will skip posts that already have URLs for all platforms.
- Update `RateLimiter` thresholds if platform policies change.
- Add integration tests or manual checklists when introducing new platforms to confirm frontmatter updates remain idempotent.

## Related Documentation

- [Instagram Setup](instagram-setup.md)
- [Threads Token Refresh](threads-token-refresh.md)
- [Deployment and Build Pipeline](deployment.md)
- [Content Lifecycle](../architecture/content-lifecycle.md)
