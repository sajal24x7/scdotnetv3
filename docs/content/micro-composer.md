# Micro Composer (`/write`)

A single-page composer for publishing micro posts from any device — no Obsidian,
no Apple Shortcuts, no gitsync. Open `https://sajalchoudhary.net/write`, type,
hit **Publish**, done.

The page is a static file at `public/write/index.html`, deployed with the site.
It commits a Markdown file directly to `src/content/micro/` on `main` via the
GitHub Contents API. From there the existing automation takes over:

1. The push to `main` triggers the Cloudflare Pages build → post goes live.
2. The push also triggers `syndicate-content.yml` → post is cross-posted and
   `syndicationUrls` are written back.

Nothing touches the inbox pipeline (`sort-inbox.yml`) — files land in
`src/content/micro/` already in Astro format.

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
slug: optional-title          # omitted when no title; falls back to filename
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

## Images (Cloudflare R2)

The **＋ photo** button uploads images to a Cloudflare R2 bucket and inserts
`![](https://sajalchoudhary.net/i/…)` Markdown at the cursor. The first image
in a post is also written to the `image:` frontmatter field so feed cards pick
it up.

Two Pages Functions (in `functions/` at the repo root, deployed automatically
alongside the static build) do the work:

- `POST /api/upload` (`functions/api/upload.js`) — validates the request,
  stores the image in R2 under `micro/YYYY/MM/<timestamp>-<random>.<ext>`, and
  returns the URL. Auth reuses the **same GitHub token** the composer already
  holds: the function accepts an upload only if GitHub confirms the token can
  read this repo, so there is no separate upload secret to manage.
- `GET /i/*` (`functions/i/[[path]].js`) — streams images out of R2 from the
  site's own domain with immutable cache headers and edge caching, so the
  bucket never needs to be public or have its own domain.

Photos are downscaled in the browser before upload (max 2048px, JPEG) so phone
pictures don't land as 10MB originals; GIFs and already-small images are sent
as-is. The server caps uploads at 15MB and only accepts image content types.

### One-time R2 setup (Cloudflare dashboard)

1. **R2 → Create bucket** — name it e.g. `scdotnet-images` (any name works;
   the binding below is what the code sees). No public access needed.
2. **Workers & Pages → your Pages project → Settings → Bindings →
   Add → R2 bucket** — variable name **`IMAGES`** (must be exactly this),
   bucket: the one you just created. Apply to Production (and Preview if you
   want uploads from preview deploys).
3. Redeploy the site once so the binding takes effect.

Until the binding exists, uploads fail with a clear "IMAGES R2 binding is not
configured" error; the rest of the composer keeps working.

## Behaviour notes

- Drafts autosave to `localStorage` as you type and survive closing the tab;
  they're cleared only on successful publish.
- A filename collision (two posts in the same minute) retries once with a
  `-2` suffix.
- The page is excluded from crawling via `robots.txt` and a `noindex` meta tag.
  It is public but inert without a token.
