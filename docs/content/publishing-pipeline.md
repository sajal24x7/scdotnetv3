# Publishing Pipeline (`content` branch → `main`)

How content gets from Obsidian (or `/write`) onto the site, and the one-time
steps to switch over. Introduced by audit brief
`planning/site-audit-2026-07/07-infra-ci.md` §7.6.

## The flow at a glance

There are two publishing paths, and they don't interfere with each other:

### Obsidian notes (long-form, shelves, everything via the inbox)

```
Obsidian note ──GitSync/git──▶ content branch
                                  │
                                  ▼
                    content-publish.yml (one run per push)
                      1. sync main into content (stay current with code)
                      2. normalize Obsidian → Astro frontmatter
                      3. sort inbox/ notes into category folders
                      4. reconcile shelf queue: delete any `todo` stub a
                         just-arrived shelf note promotes (see below)
                      5. validate (astro check)
                      6. commit the cleaned tree back to content
                      7. merge content → main (one clean commit),
                         fast-forward content to the merge
                                  │
                                  ▼
                    Cloudflare builds main — exactly once
                                  │
                                  ▼
                    syndicate-content.yml (scheduled, every 3 hours)
                    picks up the new posts, cross-posts, writes
                    syndicationUrls back with [CI Skip] (no extra
                    build), and merges main into content so the
                    branches stay level
```

If a note has a missing/unknown `category`, the run fails, a GitHub issue is
opened, and **nothing reaches `main` or production**. Fix the frontmatter and
push to `content` again.

#### Shelf queue reconciliation (step 4)

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
`main` — no inbox, no normalization needed — so it intentionally bypasses the
`content` branch for instant publishing. Cloudflare builds once; the push to
`main` also triggers `sync-content-branch.yml` (which merges `main` into
`content` so the branch never trails a `/write` post). Syndication is picked
up by `syndicate-content.yml`'s next scheduled sweep. See
`micro-composer.md`. The two paths share only the syndication tail.

> **Why scheduled?** An earlier revision triggered syndication off
> Cloudflare's deploy events (never fired — this repo's Cloudflare
> integration creates no GitHub deployment events), then off every content
> push to `main`. Per-push runs burned Actions minutes badly: a burst of
> content commits queued hours of billable runner time. The script already
> scans the last `SYNDICATION_DAYS_BACK` days and skips anything with
> `syndicationUrls`, so a 3-hourly scheduled sweep catches everything in
> one bounded run, and no deploy-wait sleep is needed because the deploy
> is long finished by the time it fires.

## Environment expectations

The switchover to this pipeline is complete (July 2026). For reference, the
moving parts it depends on:

- **GitSync (iOS)** pushes Obsidian notes to the **`content`** branch, and the
  publishing Shortcut copies notes into `src/content/inbox/` — see
  `publishing-shortcut.md`.
- **Desktop clones**: write notes on `content`
  (`git checkout -b content origin/content`); use `main` for code.
- **Cloudflare Pages**: production branch is `main`, Node 22 (a dashboard
  `NODE_VERSION` overrides `cloudflare-pages.json`). Preview deploys for the
  `content` branch are optional noise. The R2 `IMAGES` binding for `/write`
  uploads is separate — see `micro-composer.md`.

## Verifying a publish

1. Push a test note to `content`. Expect: exactly one **Publish content** run
   in the Actions tab, one `publish: content batch …` commit on `main`, and
   exactly **one** Cloudflare production build.
2. One **Syndicate Content** run fires (dispatched by the publish run; it
   waits ~2 minutes for the deploy first), and its `syndicationUrls` commit
   does **not** start a new Cloudflare build.
3. Push a note with a broken `category`. Expect: the run fails, an issue
   labelled `automation`/`inbox` is opened, and `main` + production are
   untouched.

## Day-to-day afterwards

- **Write a note** in Obsidian → sync → it publishes itself. One build,
  syndicated after deploy, issue opened if anything's wrong.
- **Micro post** from `/write` → instant commit to `main`, one build,
  syndicated after deploy.
- **Code changes** → PRs against `main` as always, gated by `ci.yml`.
- The `content` branch never needs manual grooming: every publish run merges
  `main` into it first, `sync-content-branch.yml` merges `main` into it on
  every direct push to `main` (e.g. a `/write` micro post), and the
  syndication run pushes its bookkeeping commit to both branches — so
  `content` stays level with `main` instead of one step behind.
