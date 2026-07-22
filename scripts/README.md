# Scripts

Utility scripts for the site. The ones you're likely to need are wired into `package.json` and documented under [`docs/`](../docs/README.md):

| Area | Scripts | Documentation |
| --- | --- | --- |
| Build-time assets | `generate-book-covers.js`, `generate-film-covers.js`, `generate-tv-covers.js`, `generate-game-covers.js`, `cache-nordletter-images.js` | [Nordletter Image Cache](../docs/operations/nordletter-image-cache.md), [Shelf Cover Downloaders](../docs/tools/shelf-cover-downloaders.md) |
| Cover downloads | `download-book-covers.js`, `download-film-covers.js`, `download-tv-covers.js`, `download-game-covers.js` | [Book Cover Downloader](../docs/tools/book-cover-downloader.md), [Shelf Cover Downloaders](../docs/tools/shelf-cover-downloaders.md) |
| Metadata enrichment | `enrich-book-metadata.js`, `enrich-film-metadata.js`, `enrich-tv-metadata.js`, `enrich-game-metadata.js` | [Shelf Metadata Enrichment](../docs/tools/shelf-metadata-enrichment.md) |
| Syndication (POSSE) | `syndicate-content.js`, `lib/` | [Syndication Workflow](../docs/operations/syndication.md) |
| Publishing pipeline | `sort-inbox.sh`, `obsidian_to_astro.py`, `reconcile-shelf-queue.js` | [Publishing Pipeline](../docs/content/publishing-pipeline.md) |
| Webmentions & interactions | `collect-interactions.js`, `send-webmentions.js`, `moderate-webmention.js`, `print-moderation-issue.js` | run via `.github/workflows/refresh-interactions.yml` and `webmention-moderation.yml` |
| `/learn/*` content pools | `validate-learn-data.mjs` | Run `node scripts/validate-learn-data.mjs` after editing `src/data/linux-commands.ts`, `src/data/finnish.ts`, or any note carrying a `learn` block. Checks prompt-id uniqueness, `introductionOrder` completeness, and that every category/item is non-empty. See [`docs/architecture/learning-systems.md`](../docs/architecture/learning-systems.md). |
| `/learn/til` + `/learn/evergreen` decks | `extract-learn-blocks.mjs` | Builds `src/data/learn-decks.generated.json` from ` ```learn ` fenced blocks inside `src/content/til` and `src/content/evergreen` notes. Runs automatically in `npm run dev`/`npm run build` (`npm run extract-learn` to run it alone). See [`docs/architecture/learning-systems.md`](../docs/architecture/learning-systems.md). |
| `/learn/vocabulary` deck | `fetch-wotd.mjs` | Fetches Wiktionary's Word of the Day RSS feed and upserts each word into `src/data/vocab.generated.json` (word-keyed, idempotent — a word already on file is never re-fetched). Runs daily via `.github/workflows/fetch-wotd.yml`; `npm run fetch-wotd` to run it by hand. Merriam-Webster is a second, off-by-default source (`WOTD_ENABLE_MW=true`). See [`docs/architecture/learning-systems.md`](../docs/architecture/learning-systems.md). |

## One-time migration scripts (historical)

The remaining Python/TypeScript scripts were used for one-off content migrations and are kept for reference only. They predate the current unified frontmatter schema — their output used fields that have since been renamed (`pubDate` → `created`, `bookStatus`/`bookRating` → `status`/`rating`, `startedReading`/`finishedReading` → `started`/`finished`, `bookCover` → `cover`) and year-based folders that have since become category folders. Don't run them against today's content without updating them first.

- **Goodreads import** — `convert_goodreads_to_bookshelf.py` converted a Goodreads export (`review.json`) into bookshelf markdown posts (57 books migrated), with series extraction from `(Series Name, #N)` title patterns, keyword-based genre detection, and star-ratings mapped to `love`/`like`/`nope`. Follow-up passes: `add_authors_to_bookshelf.py` (author metadata as arrays), `clean_bookshelf_files.py` (filename/title cleanup), `rename_special_chars.py` (ASCII-safe filenames), `fix_missing_editions.py`.
- **Platform migrations** — `migrate-ghost.ts`, `migrate-content.ts`, `migrate-nordletter.ts`, `update_nordletter_posts.py`, `html_to_markdown.py`, `obsidian_to_astro.py` (the last one is still used by `content-publish.yml`).
- **Frontmatter sweeps** — `standardize-frontmatter.ts`, `migrate-to-categories.mjs`, `update-categories.cjs`, `fix_categories.py`, `add_slugs.py`, `update-post-dates.js`.
