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

## Behaviour notes

- Drafts autosave to `localStorage` as you type and survive closing the tab;
  they're cleared only on successful publish.
- A filename collision (two posts in the same minute) retries once with a
  `-2` suffix.
- The page is excluded from crawling via `robots.txt` and a `noindex` meta tag.
  It is public but inert without a token.
