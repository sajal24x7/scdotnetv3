# Fresh Site Audit — 2026-07-11

A ground-up review of `sajalchoudhary.net` (repo `sajal24x7/scdotnetv3`), run
independently of the earlier `planning/site-audit-2026-07/` pass. Scope: security,
correctness/bugs, features, design/UX, accessibility, performance, and code health.

**Baseline health is good.** `npm run build` completes cleanly (2,562 pages in ~64s,
Pagefind indexes 1,685 pages), and `astro check` reports **0 errors / 0 warnings**
(126 informational hints). Nothing below is on fire; these are opportunities ranked by
value. Each item notes rough effort and whether it is safe to ship on its own.

---

## 1. Security

### 1.1 Reflected DOM-XSS on `/search` via the `q` query parameter — **fix recommended**
`src/pages/search.astro` reads the URL query (`params.get('q')`) and injects it, raw,
into `innerHTML` in several places (the "No results for …" and results-header strings,
e.g. `'… <strong>' + q + '</strong> …'` fed to `results.innerHTML`). A crafted link such
as `/search?q=<img src=x onerror=…>` executes script in the visitor's browser.

- **Impact:** moderate. It's a personal, cookie-light site with no login, so there's
  little to steal, but it's still a genuine reflected XSS an attacker could weaponise in
  a shared link. The `/write` page keeps a GitHub PAT in `localStorage` — a different
  origin path, but it raises the stakes of any XSS on the domain.
- **Fix:** HTML-escape `q` before interpolation, or set the query text with
  `textContent` instead of building an HTML string. Also escape the pagefind `title`
  (`d.meta.title`) which is likewise concatenated into `innerHTML`; it's site-owned
  content today, but escaping it is defence-in-depth and near-free.
- **Effort:** ~15 minutes. Self-contained, no visual change.

### 1.2 No security response headers — **hardening**
`public/_headers` only sets `Content-Encoding: identity` for `/pagefind/*`. There is no
`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, or
frame-protection (`X-Frame-Options` / CSP `frame-ancestors`). A CSP in particular would
have blunted finding 1.1.

- **Suggested additions (Cloudflare Pages `_headers`):**
  ```
  /*
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    X-Frame-Options: DENY
    Permissions-Policy: geolocation=(), microphone=(), camera=()
  ```
  A `Content-Security-Policy` is higher value but needs care: the site relies on several
  `is:inline` scripts (theme/FOUC script in `Layout.astro`, JSON-LD, search), so a strict
  `script-src` needs hashes or nonces. Recommend starting with
  `Content-Security-Policy-Report-Only` to shake out violations before enforcing.
- **Effort:** static headers ~15 min; a real CSP ~half a day including report-only tuning.

### 1.3 `/api/upload` and `/api/til/sync` authorization model — **minor, note only**
Both Cloudflare Pages Functions treat "any token that returns 200 on
`GET /repos/sajal24x7/scdotnetv3`" as the owner. Because the repo is **private**, GitHub
returns 404 to tokens without access, so this is effectively limited to the owner and
collaborators — acceptable today. Two things to keep in mind:
- If the repo is ever made **public**, `/api/upload` becomes an open write endpoint to
  the R2 media bucket for *any* valid GitHub token (a read is enough). Add a dedicated
  upload secret before flipping visibility.
- A **read-only** PAT can currently upload images (the check only proves read access).
  `til/sync`'s write path is naturally gated by GitHub rejecting commits from read-only
  tokens, but `/api/upload` is not. Consider requiring the token to prove write access
  (e.g. check `permissions.push` from the repo response) if you want upload to match
  intent. There is also no per-token rate limiting on `/api/upload`.
- **Effort:** ~30 min if you decide to tighten; otherwise document and defer.

---

## 2. Correctness / bugs

No functional bugs surfaced in the build or type-check. The items below are latent
risks and cleanups rather than active breakage.

### 2.1 `scripts/build.sh` appears stale and destructive — **verify / remove**
`build.sh` runs `rm -rf node_modules package-lock.json` then `npm install`. Cloudflare
builds via `npm run build:cloudflare` (per `cloudflare-pages.json`), so `build.sh` is not
on the deploy path. If nothing invokes it, delete it to avoid someone running a script
that discards the lockfile; if it *is* used somewhere, document where. **Effort:** 5 min.

### 2.2 `astro check` hints (126) — **low-risk cleanup**
Unused imports (e.g. `slugify` in `tvshelf/[show]/index.astro` and `[season].astro`),
unused `Props` interfaces, and a handful of implicit-`any` parameters. None affect
runtime, but clearing them keeps `astro check` output signal-rich for future changes.
**Effort:** ~1 hour, mechanical.

### 2.3 Content-length trust in `/api/upload` — already handled, keep as-is
Worth noting the code does the right thing: it early-rejects on the `content-length`
header *and* re-checks `bytes.byteLength` after reading, so a spoofed header can't bypass
the 15 MB cap. No change needed.

---

## 3. Accessibility

### 3.1 Search input has no programmatic label — **fix recommended**
`#search-input` in `src/pages/search.astro` relies on a placeholder only. Placeholders
are not labels for screen readers. Add a visually-hidden `<label for="search-input">` or
an `aria-label="Search the site"`. **Effort:** 5 min.

### 3.2 Good things already in place (no action)
Skip-to-content link (`Layout.astro`), `aria-pressed` on feed filters and mode toggles,
`aria-label`s on carousel controls, `role="status"`/`aria-live` on feed and upload status,
reduced-motion handling in the carousel and "load more" affordances. Solid baseline.

### 3.3 Opportunities
- Feed carousel arrows are keyboard-reachable but the carousel `role="group"` could gain
  `aria-roledescription="carousel"` and slides `aria-label="n of m"` for richer SR output.
- Verify focus-visible outlines meet contrast in both themes on the accent color.

---

## 4. Design / UX opportunities

- **Search UX:** results are capped at 50 with a "showing X of Y" note but no pagination
  or "load more" — long-tail queries silently truncate. Consider incremental loading or a
  count-aware message. Also, the empty/`tag:` states are text-only; a recent-searches or
  popular-content fallback would make the blank state more useful.
- **404 page:** functional and on-brand, but could surface a search box inline (it links
  to `/search/` today) so recovery is one step shorter.
- **Reading affordances:** blog/evergreen entries show excerpts but no reading-time or
  word-count chip. A build-time reading-time estimate (there's already `postStats.ts`)
  would be a cheap, high-signal addition to cards and post headers.
- **Related content:** backlinks exist (`Backlinks.astro`), but there's no "related by
  tag" block on posts. Given tags are already indexed, a simple tag-overlap "you might
  also like" list would deepen navigation with build-time data only.

---

## 5. Feature ideas (build-time friendly, no server needed)

Ranked by value-to-effort for a static Astro + Cloudflare Pages site:

1. **Webmentions / comments via a static-friendly service** (e.g. webmention.io + a
   build-time fetch, or Bluesky-comment embedding since you already syndicate there).
   Turns POSSE syndication into two-way conversation without a backend.
2. **JSON Feed (`/feed.json`)** alongside the existing RSS. Trivial to add, and some
   modern readers prefer it.
3. **Dynamic OG images** per post (Astro + Satori/`@vercel/og`-style at build time).
   Today all shares fall back to the square logo unless a post sets `image:`; generated
   title cards would lift link previews across every syndication target.
4. **Sitemap/robots for `/search`:** the sitemap already filters `/search/`, but the page
   is not `index={false}` — set it explicitly so intent and behavior match.
5. **`prefers-reduced-data` / save-data awareness** for the nordletter/photo imagery, and
   `fetchpriority` hints on the first feed image, to trim mobile data.
6. **Feed filter persistence:** remember the last-selected UnifiedFeed filter
   (all/stream/garden/nordletter) in `sessionStorage` so a reload keeps context.

---

## 6. Performance (currently healthy — keep it that way)

- Pagefind is lazy-loaded via `requestIdleCallback`, feed entries are memoized per post
  and pre-paginated into `/api/feed/*.json`, fonts are self-hosted, and the theme script
  is inlined to avoid FOUC. This is a well-tuned static build.
- **Watch item:** 2,562 pages build in ~64s today. As content grows, the
  `getAllPosts()` → per-category `getCollection` fan-out and the feed-entry rendering are
  the parts most likely to slow down; both are already cached within a build, so no action
  now — just the thing to profile first if build time creeps up.
- Consider adding explicit `Cache-Control` headers for hashed static assets in `_headers`
  (immutable, 1 year) to complement Cloudflare's defaults.

---

## Suggested order of work

1. **Escape `q` in `/search`** (1.1) — real bug, tiny, ship first.
2. **Add the static security headers** (1.2, minus full CSP) and **label the search
   input** (3.1) — quick hardening + a11y wins.
3. **Delete/verify `build.sh`** (2.1) and **clear the `astro check` hints** (2.2) — hygiene.
4. **CSP in report-only**, then enforce (1.2) — highest security value, needs care.
5. Pick from **features** (§5) — dynamic OG images and reading-time are the best
   value-to-effort for a writing-first site.

_None of §1–§3 change the visual design; they're safe to land incrementally._
