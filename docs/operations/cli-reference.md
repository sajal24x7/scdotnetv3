# CLI Reference

Every command you can run against this repository, in one place: the npm
scripts wired into `package.json`, the scripts that are only ever run
directly, the environment variables each one reads, and the GitHub Actions
workflow that does the same job in CI.

Requires Node ≥ 22.12.0 and npm ≥ 10 (`package.json` `engines`). Run
`npm install` after pulling. Python scripts need `python3`.

Conventions in the tables below:

- **Command** — run from the repo root.
- **Env** — optional unless marked required. Secrets are never in the repo;
  locally, export them in your shell or use a `.env` you don't commit.
- Scripts write in place and are idempotent unless noted.

## Quick reference

```bash
npm install                 # after every pull
npm run dev                 # local server at http://localhost:4321
npm run build               # full production build + search index
npx astro check             # type check (run before a PR)
npm run validate-learn      # /learn/* content-pool guardrails
npm run test:wotd && npm run test:authored && npm run test:session
```

Those last five lines are exactly what `.github/workflows/ci.yml` runs on a
pull request, in that order. If they pass locally, CI passes.

## Develop and build

| Command | What it does |
| --- | --- |
| `npm run dev` | Caches Nordletter images, generates covers, extracts `learn` blocks, then starts the Astro dev server with live reload. |
| `npm start` | Alias of `npm run dev`. |
| `npm run build` | Same pre-steps, then `astro build`, then `pagefind --site dist` for the search index. |
| `npm run build:cloudflare` | Identical to `npm run build`. This is the command configured in Cloudflare Pages. |
| `npm run preview` | Serves the last build from `dist/`. |
| `npm run astro -- <args>` | Passes through to the Astro CLI, e.g. `npm run astro -- check`. |
| `npx astro check` | Type check. Run before opening a pull request. |

See [Deployment](deployment.md) for the build sequence and Cloudflare Pages
configuration.

## Tests and validation

No general test runner is configured. These are the checks that exist, all
network-free.

| Command | What it checks |
| --- | --- |
| `npm run validate-learn` | `/learn/*` content pools: prompt-id uniqueness, `introductionOrder` completeness, non-empty categories/items. Run after editing `src/data/linux-commands.ts`, `src/data/finnish.ts`, or any note with a `learn` block. |
| `npm run test:wotd` | Parser tests for `scripts/fetch-wotd.mjs` against stored feed fixtures. |
| `npm run test:authored` | The pure half of `src/components/learn/authoredPrompts.ts`: id allocation, cross-device merge, dataset overlay, validation gate, one-time migration. |
| `npm run test:session` | The shared sign-in session in `public/auth/session.js`: an already signed-in browser stays signed in, and sign-out clears the pre-session keys too. |

## Build-time asset generation

These run automatically inside `npm run dev` and `npm run build`. Run them
alone when you want just one step.

| Command | Notes |
| --- | --- |
| `npm run cache-nordletter-images` | Downloads missing newsletter thumbnails and refreshes the manifest. See [Nordletter Image Cache](nordletter-image-cache.md). |
| `npm run generate-covers` | Regenerates the TypeScript cover map for bookshelf images. |
| `npm run extract-learn` | Builds `src/data/learn-decks.generated.json` from ` ```learn ` blocks in `src/content/til` and `src/content/evergreen`. |
| `node scripts/generate-film-covers.js` | Film cover map. Not wired into an npm script. |
| `node scripts/generate-tv-covers.js` | TV cover map. |
| `node scripts/generate-game-covers.js` | Game cover map. |

## Cover downloads

All four take `--force` to re-download entries that already have a cover,
and target a single entry by title. Books use `--book`; the others use
`--title`.

| Command | Env | Notes |
| --- | --- | --- |
| `npm run download-covers` | `GOOGLE_BOOKS_API_KEY` (optional) | Books, four sources with quality selection; updates frontmatter. See [Book Cover Downloader](../tools/book-cover-downloader.md). |
| `npm run download-covers:force` | as above | `--force`. |
| `npm run download-covers:refresh-low-res` | as above | `--replace-low-res`: re-fetch covers below the quality threshold. Books only. |
| `node scripts/download-book-covers.js --book "Title"` | as above | One book. |
| `node scripts/download-film-covers.js [--force] [--title "Title"]` | `TMDB_API_KEY` required | See [Shelf Cover Downloaders](../tools/shelf-cover-downloaders.md). |
| `node scripts/download-tv-covers.js [--force] [--title "Title"]` | `TMDB_API_KEY` required | |
| `node scripts/download-game-covers.js [--force] [--title "Title"]` | `RAWG_API_KEY` (optional), `TWITCH_CLIENT_ID` + `TWITCH_CLIENT_SECRET` (optional, for IGDB) | RAWG works keyless at a lower rate limit. |
| `npm run convert-covers-to-webp` | — | Converts downloaded covers to WebP. `node scripts/convert-covers-to-webp.js --dir <path>` limits it to one folder. |

Workflow equivalents: `download-covers.yml` (inputs: `shelf` =
all/book/film/game/tv, `mode` = normal/force/refresh-low-res) and
`convert-covers-to-webp.yml` (input: `folder`, blank for all four shelves).

## Metadata enrichment

Each script fills in missing shelf metadata (author, genre, year, …) from an
external API. All take `--force` to overwrite fields that already have a
value, and `--title "Title"` to do one entry.

| Command | Env |
| --- | --- |
| `node scripts/enrich-book-metadata.js [--force] [--title "Title"]` | `GOOGLE_BOOKS_API_KEY` (optional) |
| `node scripts/enrich-film-metadata.js [--force] [--title "Title"]` | `TMDB_API_KEY` required |
| `node scripts/enrich-tv-metadata.js [--force] [--title "Title"]` | `TMDB_API_KEY` required |
| `node scripts/enrich-game-metadata.js [--force] [--title "Title"]` | `RAWG_API_KEY`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` (all optional) |

Workflow equivalent: `enrich-shelf-metadata.yml` (inputs: `shelf`, `force`).
It also runs on shelf-content pushes to `main`, enriching only the changed
entries. See [Shelf Metadata Enrichment](../tools/shelf-metadata-enrichment.md).

## Publishing pipeline

| Command | What it does |
| --- | --- |
| `npm run sort-inbox` | For each note in `src/content/inbox/`, normalizes it with `obsidian_to_astro.py`, then moves it into `src/content/<category>/`. Carries over fields an enrichment run added on the site side. |
| `python3 scripts/obsidian_to_astro.py <file.md> [more.md …]` | Normalizes Obsidian frontmatter and wiki links for Astro, in place. |
| `python3 scripts/obsidian_to_astro.py --merge-missing <incoming.md> <existing.md>` | Copies fields present in the existing note but missing from the incoming one. Used by `sort-inbox`. |
| `npm run reconcile-shelf-queue` | Deletes a shelf's `status: todo` queue stub once the real note for the same title arrives from the inbox. Runs right after `sort-inbox` in CI. |

Workflow: `content-publish.yml`. See [Publishing Pipeline](../content/publishing-pipeline.md).

## Syndication (POSSE)

| Command | Env |
| --- | --- |
| `npm run syndicate` | Platform credentials below. Posts for real. |
| `npm run syndicate:dry-run` | Sets `SYNDICATION_DRY_RUN=true`. Logs what it would post, writes nothing. Use this locally. |

Environment:

| Variable | Purpose |
| --- | --- |
| `SYNDICATION_DRY_RUN` | `true` to log without posting. |
| `SYNDICATION_DAYS_BACK` | Scan window in days. Workflow default `7`. |
| `MASTODON_INSTANCE`, `MASTODON_ACCESS_TOKEN` | Mastodon. |
| `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD` | Bluesky. |
| `THREADS_USER_ID`, `THREADS_ACCESS_TOKEN` | Threads. See [Threads Token Refresh](threads-token-refresh.md). |
| `INSTAGRAM_USER_ID`, `INSTAGRAM_ACCESS_TOKEN` | Instagram. See [Instagram Setup](instagram-setup.md). |
| `R2_PUBLIC_URL` | Public base URL for images attached to syndicated posts. |

Syndication is not part of the build. It runs from `syndicate-content.yml`
every three hours (dispatch inputs: `dry_run`, `days_back`). See
[Syndication](syndication.md).

`scripts/trigger-syndication.sh` fires that workflow over the GitHub API
instead of running the script: needs `GITHUB_PAT`, and reads `GITHUB_REPO`
(default `sajal/scdotnetv3`), `DRY_RUN` (default `false`), `DAYS_BACK`
(default `7`).

## Webmentions and interactions

| Command | Env |
| --- | --- |
| `npm run collect-interactions` | `INTERACTIONS_DAYS_BACK` (poll window in days, `0` = all posts; default from `interactions.config.json`), `INTERACTIONS_TIME_BUDGET_MINUTES` (default `12`), platform tokens as above, `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` / `WEBMENTIONS_KV_NAMESPACE_ID`, `MIRROR_AVATAR_ENDPOINT`. |
| `npm run send-webmentions` | `WEBMENTIONS_DAYS_BACK` (default `7`). |
| `npm run send-webmentions:dry-run` | Sets `WEBMENTIONS_DRY_RUN=true`: logs without POSTing or writing state. |
| `node scripts/moderate-webmention.js` | Approves or rejects a pending webmention. Driven by `COMMENT_BODY` and `GITHUB_OUTPUT`; meant for `webmention-moderation.yml`, not hand use. |
| `node scripts/print-moderation-issue.js` | Renders the moderation issue body for that workflow. |

Workflows: `refresh-interactions.yml` (nightly, plus monthly full archive;
dispatch inputs `days_back`, `rebuild_backlinks`) and
`webmention-moderation.yml`.

## Learning decks

| Command | What it does |
| --- | --- |
| `npm run fetch-wotd` | Fetches Merriam-Webster's Word of the Day and upserts it into `src/data/vocab.generated.json`. Word-keyed and idempotent: a word already on file is never re-fetched, so at most one word is added per run. |
| `npm run extract-learn` | See [Build-time asset generation](#build-time-asset-generation). |
| `npm run validate-learn` | See [Tests and validation](#tests-and-validation). |

Workflow: `fetch-wotd.yml`, daily at 09:05 UTC. See
[Learning Systems](../architecture/learning-systems.md).

## Content maintenance

| Command | Notes |
| --- | --- |
| `node scripts/ap-title-case.cjs [--dry-run]` | Rewrites content titles to AP title case. `--dry-run` (or `--preview`) reports changes without writing. |
| `node scripts/update-post-dates.js` | Backfills post dates. Reads `COMMIT_TIMESTAMP` and `MODIFIED_FILES_PATH`; built for CI. |
| `bash scripts/clean-content.sh` | **Destructive.** Deletes every non-`sample-*` markdown file in the legacy year folders under `src/content/`. A migration leftover: read it before running it. |

## Token refresh

Long-lived platform tokens are renewed by workflow, not by a local command:
`refresh-threads-token.yml` (60-day Threads renewal) and
`refresh-instagram-token.yml`. Both also accept a manual dispatch. See
[Threads Token Refresh](threads-token-refresh.md).

## One-time migration scripts

The remaining Python and TypeScript scripts in `scripts/` ran one-off
content migrations and are kept for reference only. They predate the current
frontmatter schema, so their output uses field names that have since been
renamed. Don't run them against today's content without updating them first.
`scripts/README.md` lists them with what each one did.

## Related Documentation

- [Deployment and Build Pipeline](deployment.md)
- [Publishing Pipeline](../content/publishing-pipeline.md)
- [Syndication Workflow](syndication.md)
- [Scripts catalog](../../scripts/README.md)
- [Contributor notes](../contributing/claude-guide.md)
