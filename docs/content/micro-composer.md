# Micro & Photo Composer (`/write`)

A single-page composer for publishing micro and photo posts from any device —
no Obsidian, no Apple Shortcuts, no gitsync. Open
`https://sajalchoudhary.net/write`, pick **Micro** or **Photo** with the toggle
at the top, type, hit **Publish**, done. A fourth **Shelf** tab quick-adds
books/films/TV/games to the shelf queue — see below.

## How it publishes

The page is a static file at `public/write/index.html`, deployed with the site.
It commits a Markdown file directly to `src/content/micro/` (or
`src/content/photo/` in Photo mode) on `main` via the GitHub Contents API.
From there the existing automation takes over:

1. The push to `main` triggers the Cloudflare Pages build → post goes live.
2. `syndicate-content.yml` runs on a schedule (every 3 hours); its next
   sweep cross-posts the new note and writes `syndicationUrls` back with a
   `[CI Skip]` commit, so the bookkeeping doesn't trigger another build.
3. The push also triggers `sync-content-branch.yml`, which merges `main`
   into the `content` branch so it never trails a `/write` post.

Nothing touches the content-branch publish pipeline (`content-publish.yml`,
see `docs/content/publishing-pipeline.md`) — micro posts land in
`src/content/micro/` already in Astro format, so they skip the
normalize/sort step and go straight to `main` for instant publishing.

## One-time setup

1. On GitHub: **Settings → Developer settings → Fine-grained personal access
   tokens → Generate new token.**
   - Repository access: **only `scdotnetv3`**.
   - Permissions: **Contents → Read and write.** Nothing else.
   - Pick an expiry you're comfortable with (the page will start returning 401
     when it lapses — just paste a fresh token).
2. Open `/write`, paste the token, save. It's stored in `localStorage` on that
   device only and sent only to `api.github.com`.
3. On iPhone: Share → **Add to Home Screen** to get an app-like icon that opens
   straight into the composer.

## What it writes

Filename follows the existing convention — `YYYYMMDDHHMM Title.md`, or just
`YYYYMMDDHHMM.md` when there's no title (titles are optional for micro posts).

```yaml
---
title: "Optional title"      # omitted when blank
slug: "optional-title"        # always written; the timestamp when no title
created: 2026-07-08T10:30:00.000Z
updated: 2026-07-08T10:30:00.000Z
category: micro
tags:                         # omitted when blank
  - example
---
```

If a **Link** is provided, the body is prefixed with `[Title](link)` (or the
link's hostname when there's no title), matching the established micro post
format. Quotes are just typed as Markdown `>` blockquotes in the body.

## Photo mode

The toggle at the top switches the composer to photo posts:

- Uploaded photos collect in a thumbnail strip (tap × to remove one) instead
  of being inserted into the body. Publishing requires at least one photo.
- The body becomes an optional **caption**; it stays plain text in the post
  body.
- Photos are written to frontmatter only — an `images:` list with every photo
  plus `image:` (the first one) for feed cards and syndication. The body never
  contains image Markdown.
- Multiple photos render as a carousel on the post page and get a count badge
  on the `/photos` grid.
- Photo-mode uploads use the same 1024px max dimension as micro, and are
  always re-encoded to JPEG so they stay eligible for Instagram syndication
  (the Instagram API accepts JPEG only).

```yaml
---
slug: "202607091110"
created: 2026-07-09T11:10:00.000Z
updated: 2026-07-09T11:10:00.000Z
category: photo
image: "https://storage.sajalchoudhary.net/images/2026/07/…jpg"
images:
  - "https://storage.sajalchoudhary.net/images/2026/07/…jpg"
  - "https://storage.sajalchoudhary.net/images/2026/07/…jpg"
---
Optional caption text.
```

## Shelf mode (queue quick-add)

The **Shelf** tab quick-adds an item to the "to be read/watched/played"
queue described in `planning/shelf-queue-design.md` — a book, film, TV show,
or game you want to get to eventually, without writing a full shelf entry.

- **Category** segmented control (Book/Film/TV/Game) picks the target
  collection; the creator field's placeholder swaps to match
  (Author/Director/Creator/Developer).
- **Title** is required; **Creator** and the notes textarea (the "why") are
  optional.
- Publish commits `YYYYMMDDHHMM Title.md` straight to
  `src/content/<category>/` on `main`, with `status: todo` and a `created`
  timestamp — same instant, schema-valid, no-inbox path as micro/photo posts.
  For TV, the stub is show-level: `showTitle` is set to the title and no
  `season` is written (the season-per-file structure only starts once a real
  note exists).
- Below the form, a **Queue** list (from the build-time
  `/api/shelf-queue.json` endpoint) shows every `status: todo` entry with
  **Start** and **Remove** actions:
  - **Start** edits the stub in place — `status: todo` → `started`, plus a
    `started:` date — turning it into the log entry itself.
  - **Remove** deletes the stub (changed your mind).

  Both actions read the file's current `sha` via the Contents API before
  writing, same as any other GitHub-API edit. The queue list itself is a
  build-time snapshot (cached an hour), so it only reflects the last deploy;
  items added or removed in the current session are patched into the
  on-screen list immediately rather than waiting for a rebuild. A **↻
  refresh** link reloads it after a deploy catches up.

## Images (Cloudflare R2)

The **＋ photo** button uploads images to the existing media R2 bucket (the
one behind `storage.sajalchoudhary.net`, where nordletter media already
lives) and inserts `![](https://storage.sajalchoudhary.net/images/…)`
Markdown at the cursor. It is not also written to the `image:` frontmatter
field — the post page renders that field as a separate hero image above the
body, so duplicating it there would show the same image twice.

One Pages Function does the work — `POST /api/upload`
(`functions/api/upload.js`, deployed automatically alongside the static
build). It validates the request, stores the image following the bucket's
established layout `images/YYYY/MM/<timestamp>-<random>.<ext>`, and returns
the public URL. Auth reuses the **same GitHub token** the composer already
holds: the function accepts an upload only if GitHub confirms the token can
read this repo, so there is no separate upload secret to manage.

Photos are downscaled in the browser before upload (max 1024px for both
micro and photo posts, JPEG) so phone pictures don't land as 10MB originals.
Any image over the max dimension is resized regardless of file size; GIFs
and images that are both small and already within the max dimension are
sent as-is. The server caps uploads at 15MB and only accepts image content
types.

The public base URL defaults to `https://storage.sajalchoudhary.net` and can
be overridden with an `IMAGES_PUBLIC_URL` env var on the Pages project.

### One-time R2 setup (Cloudflare dashboard)

1. **Workers & Pages → your Pages project → Settings → Bindings →
   Add → R2 bucket** — variable name **`IMAGES`** (must be exactly this),
   bucket: the existing media bucket that serves
   `storage.sajalchoudhary.net`. Apply to Production (and Preview if you want
   uploads from preview deploys).
2. Redeploy the site once so the binding takes effect.

Until the binding exists, uploads fail with a clear "IMAGES R2 binding is not
configured" error; the rest of the composer keeps working.

## Behaviour notes

- Drafts autosave to `localStorage` as you type and survive closing the tab;
  they're cleared only on successful publish.
- A filename collision (two posts in the same minute) retries once with a
  `-2` suffix.
- The page is excluded from crawling via `robots.txt` and a `noindex` meta tag.
  It is public but inert without a token.
