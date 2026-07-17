# Syndication Workflow (POSSE)

The POSSE pipeline cross-posts recent entries to Mastodon, Bluesky, and Threads — plus Instagram for photo posts — then writes the resulting URLs back into each post’s frontmatter.

## Overview

- Entry point: `scripts/syndicate-content.js`.
- Supported platforms are configured via `syndication.config.json`, which defines character limits, hashtag usage, and rate limits for each network.【F:scripts/syndicate-content.js†L1-L118】【F:syndication.config.json†L1-L63】
- Eligible categories include stream posts (blog, micro, photo), garden entries (evergreen, til, bookshelf, story, poem), and Nordletters.【F:scripts/syndicate-content.js†L19-L37】
- Instagram is photo-only: `eligiblePlatforms()` in `scripts/syndicate-content.js` restricts it to `category: photo` posts (the API cannot publish without an image). Setup and content requirements live in [instagram-setup.md](instagram-setup.md).

## Execution Flow

1. **Content discovery** – Reads every Markdown file in the category folders under `src/content/`, parsing frontmatter with `gray-matter`. Posts older than `SYNDICATION_DAYS_BACK` (default 7 days) are skipped.【F:scripts/syndicate-content.js†L39-L86】【F:scripts/syndicate-content.js†L99-L133】
2. **Eligibility check** – A post proceeds if it belongs to the configured categories and is missing one or more platform URLs.【F:scripts/syndicate-content.js†L91-L133】
3. **Rate limiting** – Each platform has a `RateLimiter` instance to respect API quotas before posting.【F:scripts/syndicate-content.js†L118-L137】
4. **Posting** – Platform-specific helpers in `scripts/lib/platforms/` handle API calls. In dry-run mode (`SYNDICATION_DRY_RUN=true`) the script logs mock URLs instead of publishing.【F:scripts/syndicate-content.js†L139-L207】
5. **Frontmatter updates** – New URLs are merged into the `syndicationUrls` array using `safeUpdateSyndicationUrls()`, which preserves all other fields and optionally creates backups.【F:scripts/lib/frontmatter-updater.js†L1-L120】

## Micro and Photo Posts

Micro and photo posts get special formatting in `scripts/lib/content-formatter.js`:

- **Images upload natively** – Markdown images (`![alt](url)`) or a photo post's frontmatter `images:` gallery are stripped from the post text and attached as native media instead: uploaded via the media API on Mastodon (up to 4), as an image embed on Bluesky (up to 4, subject to Bluesky's ~1 MB blob limit), and via `image_url` on Threads (first image only). Alt text is passed through to each platform. If an image upload fails, the post still goes out as text with a console warning.
- **No link back when the text fits** – If the full post text (plus hashtags) fits within the platform's character limit, it is posted verbatim with no "Read more" link back to the site. This applies to both categories, including Instagram (photo-only). Only posts that exceed the limit are truncated and get the link back.

## Configuration

Key environment variables:

- `SYNDICATION_DRY_RUN` – Set to `true` to test formatting without posting.
- `SYNDICATION_DAYS_BACK` – Limits how far back the script looks for posts (defaults to seven days).【F:scripts/syndicate-content.js†L29-L37】

Platform credentials should be stored as environment variables (see platform helper files for exact names) and configured in your local shell or CI secrets manager.

`syndication.config.json` controls formatting defaults, hashtag usage, and platform-specific character limits. Adjust this file when adding new networks or tweaking copy guidelines.【F:syndication.config.json†L1-L63】

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
