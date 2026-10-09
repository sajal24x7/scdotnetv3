# Publishing Pipeline (Obsidian inbox → `main`)

How content gets from Obsidian (or `/write`) onto the site. Everything
lives on `main`; there is no separate content branch.

## Why it is this simple

Cloudflare Pages keeps the last good deploy live when a build fails, so a
broken build never takes the site down. The only things CI needs to do are
turn Obsidian notes into Astro content and tell you when something breaks:

- A broken **note** (missing or unknown `category`) fails the publish
  workflow, stays in the inbox, and opens a GitHub issue.
- A broken **build** (type error, failing test, bad content) fails the
  Cloudflare build. Cloudflare's "Pages: Deployment failed" notification
  emails you. The site stays on the previous deploy.

`npm run build` runs the unit checks (`npm run test:all`) first, so a
failing test also fails the Cloudflare build. There is no separate PR CI;
Cloudflare preview builds cover pull requests.

## The flow at a glance

There are two publishing paths, and they don't interfere with each other:

### Obsidian notes (long-form, shelves, everything via the inbox)

```
Obsidian note ──Shortcut + GitSync──▶ main: src/content/inbox/
                                         │  (Cloudflare skips inbox-only
                                         │   pushes via build watch paths)
                                         ▼
                    content-publish.yml (runs on inbox pushes)
                      1. normalize Obsidian → Astro frontmatter
                      2. sort inbox/ notes into category folders
                      3. reconcile shelf queue: delete any `todo` stub a
                         just-arrived shelf note promotes (see below)
                      4. commit to main ("publish: content batch …")
                                         │
                                         ▼
                    Cloudflare builds main, exactly once
                                         │
                                         ▼
                    syndicate-content.yml (scheduled, every 3 hours)
                    picks up the new posts, cross-posts, and writes
                    syndicationUrls back with [CI Skip] (no extra build)
```

If a note has a missing/unknown `category`, the run fails, a GitHub issue is
opened, and the notes stay in `src/content/inbox/` (which never renders).
Fix the frontmatter and run the shortcut again.

#### Field preservation on overwrite (step 2)

`sort-inbox.sh` moves a sorted note into place with `mv`, which — if a note
with the same filename is already published there — fully overwrites it.
A shelf note re-synced from the vault only carries whatever the vault last
had; it knows nothing about fields a later site-side run added on the
published copy, like `cover` (from the cover-download workflow) or `year`.
Before the `mv`, when a same-named file already exists at the destination,
`sort-inbox.sh` now runs:

```
python3 scripts/obsidian_to_astro.py --merge-missing <incoming> <existing>
```

This copies any top-level frontmatter field present on the existing
published file but entirely absent from the incoming one into the incoming
file, then the `mv` proceeds. A field present in both is left as the
incoming copy has it — an intentional edit (a `status` or `rating` change)
still wins; only fields that would otherwise vanish outright are carried
forward. See the "Anxious People" cover-loss incident (Sep 2026) for the
failure this closes.

**Caveat:** this only protects notes that actually pass through `inbox/`.
That incident's proximate cause was a note re-sync that landed directly on
its already-published path under `src/content/bookshelf/` with no inbox
step, so it didn't go through this script at all and this safeguard
wouldn't have caught it. That's a separate, still-open gap in the sync setup ("Environment
expectations" below says all Obsidian notes go through the inbox Shortcut;
in practice at least one edit to an already-existing note did not) — worth
checking if you want that path closed too.

#### Shelf queue reconciliation (step 3)

`scripts/reconcile-shelf-queue.js` runs right after `sort-inbox`. For every
shelf note that just moved out of `inbox/` (book/film/TV/game), it looks for
an existing `status: todo` queue stub in the same category whose normalized
title matches (normalized `showTitle`, for TV) and deletes it — the arriving
note is the canonical entry, the stub was just a placeholder for "I want to
read/watch/play this." Matching is exact-normalized-title only and only ever
targets `todo` entries, so a reread/rewatch never deletes a finished prior
entry; a near-miss (e.g. "Wool" vs "Wool (Silo, #1)") is logged, not
auto-deleted. See `planning/shelf-queue-design.md` §4 for the full design.

### Micro posts (`/write` composer)

The composer commits schema-valid files straight to `src/content/micro/` on
`main`, so it needs no inbox step. Cloudflare builds once and syndication is
picked up by `syndicate-content.yml`'s next scheduled sweep. See
`micro-composer.md`.

> **Why scheduled?** An earlier revision triggered syndication off
> Cloudflare's deploy events (never fired: this repo's Cloudflare
> integration creates no GitHub deployment events), then off every content
> push to `main`. Per-push runs burned Actions minutes badly. The script
> already scans the last `SYNDICATION_DAYS_BACK` days and skips anything
> with `syndicationUrls`, so a 3-hourly sweep catches everything in one
> bounded run.

## Environment expectations

- **GitSync (iOS)** pushes to **`main`**, and the publishing Shortcut copies
  notes into `src/content/inbox/`. See `publishing-shortcut.md`.
- **Desktop clones**: work on `main`.
- **Cloudflare Pages**:
  - Production branch is `main`, Node 22 (a dashboard `NODE_VERSION`
    overrides `cloudflare-pages.json`).
  - Build watch paths: include `*`, exclude `src/content/inbox/*`, so a
    GitSync push that only adds inbox notes does not start a build.
  - Notifications: "Pages: Deployment failed" is turned on, so failed
    builds email the owner.
  - The R2 `IMAGES` binding for `/write` uploads is separate; see
    `micro-composer.md`.

> **History:** until October 2026 notes went to a separate `content`
> branch, and a workflow merged it into `main` after validating. That
> validation never blocked anything Cloudflare wouldn't already have
> refused, and keeping two branches in sync took three workflows, so it was
> removed.

## Verifying a publish

1. Run the shortcut on a test note. Expect: no Cloudflare build for the
   GitSync push, one **Publish content** run in the Actions tab, one
   `publish: content batch …` commit on `main`, and exactly **one**
   Cloudflare production build.
2. On the next scheduled **Syndicate Content** run, its `syndicationUrls`
   commit does **not** start a new Cloudflare build.
3. Push a note with a broken `category`. Expect: the run fails, an issue
   labelled `automation`/`inbox` is opened, the note stays in the inbox,
   and production is untouched.
