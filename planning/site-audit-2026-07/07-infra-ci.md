# 07 — Infrastructure & CI (P1)

## 7.1 Resolve the Node version conflict

Current state (contradictory):

| Place | Node |
|-------|------|
| `package.json` → `engines.node` | `>=22.12.0` |
| `cloudflare-pages.json` → `NODE_VERSION` | `20` |
| All 8 workflows in `.github/workflows/*.yml` → `setup-node.node-version` | `'20'` |

So production builds and every scheduled workflow run on a Node the project declares
unsupported. Nothing crashes today, but it's a drift time bomb and `npm ci` may start
warn-failing on engine checks.

**Fix — standardize on Node 22 (matches `engines`):**

1. `cloudflare-pages.json`: `"NODE_VERSION": "22"`. Note: if the Cloudflare Pages project
   defines `NODE_VERSION` in its dashboard environment variables, that value wins — the
   PR description must remind the owner to update the dashboard too.
2. Every file in `.github/workflows/`: `node-version: '22'`.
3. Add `.nvmrc` at repo root containing `22` (helps local contributors and some CI images).
4. Local sanity: `nvm use 22 && rm -rf node_modules && npm ci && npm run build`.

## 7.2 Add a PR CI workflow (none exists)

All 8 existing workflows are cron/dispatch content-automation jobs (cover downloads,
syndication, inbox sorting). Nothing builds the site on a pull request, which is how the
59 type errors and the broken fonts URL shipped unnoticed.

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx astro check

      - name: Build
        run: npm run build
        env:
          # syndication is best-effort in the build script; make sure CI never publishes
          SYNDICATION_DRY_RUN: 'true'

      - name: Feed sanity — every RSS item must carry pubDate
        run: |
          test -f dist/rss.xml
          items=$(grep -c "<item>" dist/rss.xml)
          dates=$(grep -c "<pubDate>" dist/rss.xml)
          echo "items=$items pubDates=$dates"
          [ "$items" -eq "$dates" ]
```

Notes for the implementer:
- `npx astro check` must pass before this lands — do brief **06** first, or start with
  the check step marked `continue-on-error: true` and a TODO to flip it.
- Confirm `npm run build` does not require network secrets: `scripts/syndicate-content.js`
  is invoked "best-effort" from the build script per `AGENTS.md` — read `scripts/build.sh`
  / `package.json` and verify a missing token only warns. If it hard-fails, set
  `SYNDICATION_DRY_RUN=true` (supported per `package.json`'s `syndicate:dry-run`).
- Build takes several minutes (4,400+ pages, cover generation); acceptable for PR CI.

## 7.3 Remove the stale `.npmrc` workaround

Covered in brief 05 §5.3 (`legacy-peer-deps=true` references a package no longer
installed). If brief 05 is deferred, do this piece here — CI in 7.2 uses `npm ci`, which
is exactly the path the stale flag was papering over.

## 7.4 (Optional) Stop committing regenerated artifacts, or refresh them in CI

`src/utils/bookCovers.ts` (with a timestamp header) and `src/data/backlinks-index.json`
are build outputs committed to git. Every local `npm run dev`/`build` dirties them — the
repo copy of `backlinks-index.json` was ~150 entries stale as of this audit.

Two acceptable resolutions (pick one, note the choice in the PR):

1. **Regenerate in a scheduled workflow** (like the cover downloads) so the committed
   copies stay fresh, and add a `git update-index --skip-worktree` note to docs for local
   noise. Low effort, keeps current architecture.
2. **Make them pure build artifacts:** generate into `.astro/` or `src/generated/`
   (gitignored) during `npm run dev/build` prestep; import from there. Cleaner, but
   touches the cover/backlink import paths — verify `astro check` still resolves the
   generated module (it must exist before check runs; add the generator to a `precheck`
   script).

The timestamp comment line in `generate-book-covers.js` output is what makes diffs noisy
even when nothing changed — at minimum, drop the `Generated on:` line from the generated
header so no-op regenerations produce no diff. (One-line change in
`scripts/generate-book-covers.js`; check the film/game/TV generators for the same
pattern.)

## 7.5 (Optional) Consolidate the four cover-download workflows

`download-book-covers.yml`, `download-film-covers.yml`, `download-game-covers.yml`,
`download-tv-covers.yml` are near-identical (checkout → node 22 → npm ci → run script →
commit). Convert to a single workflow with a `matrix: shelf: [book, film, game, tv]`, or a
reusable workflow. Pure maintenance win; behavior must stay identical (same crons, same
commit messages). Low priority — skip if time-boxed.

## Verification

```bash
# locally with Node 22:
node --version           # v22.x
npm ci && npx astro check && npm run build
```

- Open a draft PR touching a page; the new CI workflow runs and goes green.
- Workflows list in the Actions tab shows `CI` alongside the existing automation jobs.
- Cloudflare Pages deploy (after dashboard env update) logs `Node v22`.
