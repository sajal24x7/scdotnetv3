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
                      4. validate (astro check)
                      5. commit the cleaned tree back to content
                      6. merge content → main (one clean commit)
                                  │
                                  ▼
                    Cloudflare builds main — exactly once
                                  │  deploy succeeds
                                  ▼
                    syndicate-content.yml cross-posts, writes
                    syndicationUrls back with [CI Skip] (no extra build)
```

If a note has a missing/unknown `category`, the run fails, a GitHub issue is
opened, and **nothing reaches `main` or production**. Fix the frontmatter and
push to `content` again.

### Micro posts (`/write` composer)

The composer commits schema-valid files straight to `src/content/micro/` on
`main` — no inbox, no normalization needed — so it intentionally bypasses the
`content` branch for instant publishing. Cloudflare builds once, and the same
deploy-success trigger syndicates it. See `micro-composer.md`. No changes
needed to the composer for this pipeline; the two paths share only the
syndication tail.

## One-time switchover checklist

Do these in one sitting, in order:

1. **Merge the audit PR** (the branch with `content-publish.yml`,
   `download-covers.yml`, the rewritten `syndicate-content.yml`, and the
   deletion of `sort-inbox.yml`/`update-post-dates.yml`).
2. **Sync the `content` branch to the merged main** so it contains the
   workflow (workflows only trigger if the file exists on the pushed branch):
   ```bash
   git fetch origin
   git push origin origin/main:content
   ```
   (The branch already exists — created from main on 2026-07-09. If notes
   were pushed to it in the meantime, merge instead of force-anything:
   `git checkout content && git merge origin/main && git push`.)
3. **Repoint GitSync (iOS)** at branch `content` instead of `main`, and
   replace the old metadata-mapping Shortcut with the simple copy-to-inbox
   one — see `publishing-shortcut.md`. (The old Shortcut also still works;
   the pipeline skips notes that are already in Astro format.)
4. **Mac clone**: write notes on `content`
   (`git checkout -b content origin/content`); keep using `main` for code.
5. **Cloudflare Pages dashboard**:
   - If `NODE_VERSION` is set in the dashboard env vars, change it to `22`
     (dashboard values override `cloudflare-pages.json`).
   - Confirm the production branch is `main` (unchanged — just verify).
   - Optionally disable preview deploys for the `content` branch
     (Settings → Builds) unless you want a preview per raw note push.
   - The R2 `IMAGES` binding for `/write` uploads is separate — see
     `micro-composer.md`.

Until steps 1–2 are done, pushes to `content` do nothing (the workflow file
isn't on the branch yet). Notes pushed early aren't lost — the first
successful publish run picks up everything sitting on the branch.

## Verifying the first publish

1. Push a test note to `content`. Expect: exactly one **Publish content** run
   in the Actions tab, one `publish: content batch …` commit on `main`, and
   exactly **one** Cloudflare production build.
2. After the deploy goes green, one **Syndicate Content** run fires
   (triggered by `deployment_status`), and its `syndicationUrls` commit does
   **not** start a new Cloudflare build.
   - If syndication doesn't fire: open the workflow run's event payload and
     check `deployment.environment` — the job filters on
     `Production`/`production`, but some Cloudflare integrations name it
     after the Pages project. Adjust the `if:` in `syndicate-content.yml`.
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
  `main` into it first, so it stays current with code changes.
