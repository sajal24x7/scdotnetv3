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

## 7.6 Consolidate the content publish pipeline (content branch → main)

### Current flow — three production builds per note

The authoring flow today: write in Obsidian → an iOS Shortcut maps Obsidian metadata to
Astro frontmatter → GitSync (iOS) / plain git (Mac) pushes to `main`. That single push
then fans out:

| Step | Actor | Effect |
|------|-------|--------|
| 1. Author push lands note in `src/content/inbox/` | human | **Cloudflare build #1** (note in a half-published state); `syndicate-content.yml` `push` trigger fires immediately |
| 2. `sort-inbox.yml` normalizes frontmatter + moves file to its category folder, commits to `main` | bot | **Cloudflare build #2** |
| 3. Syndication run (serialized behind the `syndication` concurrency group) posts + commits `syndicationUrls` | bot | **Cloudflare build #3** |

Known defects in this flow, beyond the wasted builds (~4,400 pages each):

- **Syndication races the deploy.** The `push` trigger runs before Cloudflare has
  published, so a post can be syndicated before its canonical URL is live — and it runs
  against the pre-sort tree, where the note is still in `inbox/`.
- **Missed syndication.** The sort commit comes from `github-actions[bot]`, which
  `syndicate-content.yml` filters out (`if: github.actor != 'github-actions[bot]'`), so a
  note sometimes only syndicates when the *next* human push re-runs the 7-day catch-up
  window.
- **The `deploy-success` `repository_dispatch` path is dead.** `build:cloudflare` no
  longer calls `scripts/trigger-syndication.sh`, so that trigger never fires; only the
  racy `push` trigger does anything.
- `update-post-dates.yml` is permanently paused (`if: false`) — dead weight.
- Node drift: syndication pins 18, everything else 20, `engines` says ≥22 (see 7.1).

### Branching decision

Three options were considered:

**A. Content branch → checks → merge to `main` (chosen).** Authors push to a long-lived
`content` branch. A single workflow normalizes, sorts, validates, then merges to `main`.
`main` stays the deployable source of truth: Cloudflare keeps building `main` for
production, PRs keep targeting `main`, and the PR CI from 7.2 gates code changes exactly
as before. All bot churn happens on `content` *before* merge, so `main` receives one
clean commit per publish and Cloudflare builds once. Migration cost: change the branch
name in GitSync (iOS) and the Mac clone, once.

**B. Everything to `main`, promote to a `prod` branch that Cloudflare builds (rejected).**
Inverts what every tool assumes: "what's live" stops being `main`; PR flow, preview
deploys, and existing workflows all key off `main` and would need repointing. The bot
commits still land on `main` and still each need promoting — the multi-build problem is
rebuilt one branch over, plus a promotion workflow on top. Same gate, strictly more
moving parts. This model earns its keep on team projects with release trains, not a
single-author content site.

**C. Stay on `main`, consolidate workflows only (fallback).** Merge transform+sort into
one job with a single commit-back, and retrigger syndication off deploy success instead
of push. Gets ~3 builds down to ~2 with zero branch changes, but nothing is validated
*before* it deploys, and the half-sorted intermediate state still ships once. Acceptable
if option A ever feels like ceremony; the syndication fix below applies to it unchanged.

### Target flow (option A)

```
Obsidian note ──GitSync──▶ content branch
                              │
                              ▼
                  content-publish.yml (on: push, branches: [content])
                    1. obsidian_to_astro.py on src/content/inbox/*.md
                    2. sort into category folders (reuse sort-inbox logic)
                    3. validate: npx astro check + frontmatter schema
                    4. commit normalized tree back to content
                    5. merge content → main, push
                              │
                              ▼
                  Cloudflare builds main (exactly once)
                              │ deployment_status: success
                              ▼
                  syndicate-content.yml posts to Mastodon/Bluesky/Threads,
                  commits syndicationUrls to main with "[CI Skip]"
```

Two platform behaviors make this composition safe — rely on them, don't fight them:

- Pushes made with the default `GITHUB_TOKEN` **do not trigger other Actions workflows**
  (GitHub's recursion guard), but Cloudflare's GitHub App webhook **does** still fire.
  So the workflow's merge-to-main produces exactly one deploy and no workflow cascade.
  (Corollary: the syndication workflow must be triggered by `deployment_status`, not
  `push` — a `push: branches: [main]` trigger would never fire for the bot merge.)
- Cloudflare Pages skips builds for commits whose message contains `[CI Skip]`. Use it
  on the `syndicationUrls` commit-back so the URL bookkeeping doesn't cost a build; the
  syndication links render with the next publish. Drop the tag if showing them
  immediately is worth a second build.

Sketch for `.github/workflows/content-publish.yml`:

```yaml
name: Publish content

on:
  push:
    branches: [content]

concurrency:
  group: content-publish
  cancel-in-progress: false   # never drop a publish; queue them

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - uses: actions/setup-python@v5
        with:
          python-version: '3.x'

      - run: npm ci

      - name: Normalize Obsidian frontmatter
        run: |
          for f in src/content/inbox/*.md; do
            [ -f "$f" ] || continue
            [ "$(basename "$f")" = "README.md" ] && continue
            python3 scripts/obsidian_to_astro.py "$f"
          done

      - name: Sort inbox into category folders
        run: bash scripts/sort-inbox.sh   # extract current sort-inbox.yml logic here

      - name: Validate
        run: npx astro check              # requires brief 06; see note below

      - name: Commit normalized content to content branch
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add src/content/
          git diff --staged --quiet || git commit -m "chore: normalize and sort published notes"
          git push origin content

      - name: Merge to main
        run: |
          git fetch origin main
          git checkout main
          git merge --no-ff content -m "publish: content batch $(date -u +%Y-%m-%dT%H:%M)"
          git push origin main

      - name: Open issue on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Content publish failed — notes not deployed',
              body: `Run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}`,
              labels: ['automation', 'inbox'],
            })
```

And retrigger syndication off the deploy instead of the push:

```yaml
# syndicate-content.yml — replace the push + repository_dispatch triggers with:
on:
  deployment_status:
  workflow_dispatch:
    # keep existing dry_run / days_back inputs

jobs:
  syndicate:
    if: >
      github.event_name == 'workflow_dispatch' ||
      (github.event.deployment_status.state == 'success' &&
       github.event.deployment.environment == 'Production')
```

The Cloudflare Pages GitHub App creates deployments and deployment statuses on the repo,
so `deployment_status` fires natively — no PAT, no `trigger-syndication.sh`. Check the
exact `environment` string in an actual event payload (it's the Pages project name /
"Production" depending on integration vintage) before relying on the `if`. With the race
gone, the `concurrency: syndication` group can keep `cancel-in-progress: false` but loses
its double-trigger raison d'être — keep it anyway as cheap insurance. The
`syndicationUrls` commit message gains `[CI Skip]`.

### Migration checklist

1. Land 7.1 (Node 22) and 7.2 (PR CI) first; `astro check` must pass (brief 06) or the
   Validate step starts as `continue-on-error: true` with a TODO.
2. Extract the sort logic from `sort-inbox.yml` into `scripts/sort-inbox.sh` (a stub
   already exists — reconcile), so the workflow and local runs share it.
3. Create the `content` branch from `main`; add `content-publish.yml`.
4. Repoint GitSync (iOS) and the Mac clone at `content`. This is the only authoring-side
   change; the iOS Shortcut keeps working as-is.
5. Rewrite `syndicate-content.yml` triggers as above; add `[CI Skip]` to its commit.
6. Delete `sort-inbox.yml` (replaced) and `update-post-dates.yml` (paused since the
   `updated` field moved into Obsidian).
7. In the Cloudflare Pages dashboard, confirm production branch = `main` and disable
   preview deploys for `content` (or keep them if inbox previews are useful).
8. Optional, later: once CI normalization is trusted, the iOS Shortcut's metadata-mapping
   step is a redundant safety net — the phone flow can shrink to "write note → push".

### Verification (7.6)

- Push a test note to `content`: exactly one `Publish content` run, one commit lands on
  `main`, exactly **one** Cloudflare production build starts.
- After the deploy goes green, one syndication run fires (Actions tab shows it triggered
  by `deployment_status`), posts appear, and the `syndicationUrls` commit on `main`
  triggers **no** new Cloudflare build.
- Push a note with a broken category to `content`: the run fails, an issue is opened,
  and `main` + production are untouched.

## Verification

```bash
# locally with Node 22:
node --version           # v22.x
npm ci && npx astro check && npm run build
```

- Open a draft PR touching a page; the new CI workflow runs and goes green.
- Workflows list in the Actions tab shows `CI` alongside the existing automation jobs.
- Cloudflare Pages deploy (after dashboard env update) logs `Node v22`.
