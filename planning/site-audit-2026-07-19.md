# Site Audit & Refactor — 2026-07-19

A full-repo audit covering unused code, security, dependencies, and general
health, following up on `planning/site-audit-2026-07/` and
`planning/site-audit-2026-07-11-fresh.md`. Unlike those passes, this one
**applies** the safe fixes in the same change; each finding below is marked
**FIXED** (in this branch) or **OPEN** (needs a decision or production access).

**Baseline:** `npm run build` passes (2,301 pages indexed by Pagefind) and
`astro check` reports 0 errors / 0 warnings (120 informational hints), before
and after the changes.

---

## 1. Security

### 1.1 `/api/upload` and `/api/mirror-avatar` were open to any GitHub account — **FIXED** (high)

The 2026-07-11 audit (§1.3) rated the Pages Functions' auth model — "any
token that returns 200 on `GET /repos/sajal24x7/scdotnetv3` is the owner" —
as acceptable *because the repo was private*, and warned it would become an
open write endpoint if the repo ever went public. **The repo is now public**,
so that condition tripped: any GitHub user could authenticate with their own
token and

- upload arbitrary 15 MB files to the media R2 bucket via `/api/upload`,
  served from `storage.sajalchoudhary.net` (abuse hosting under your domain,
  storage costs), and
- make `/api/mirror-avatar` fetch any URL and persist the response to the
  same bucket.

**Fix applied:** both functions now parse the repo response and require
`permissions.push === true` — read access no longer qualifies. This keeps
both legitimate callers working with no new secrets: the `/write` composer's
fine-grained PAT has Contents read/write, and the nightly workflow's
`GITHUB_TOKEN` runs with `contents: write` (`refresh-interactions.yml`).
`/api/til/sync` needed no change — its writes go through GitHub with the
caller's token, so GitHub enforces permissions naturally.

**Verify after deploy:** publish a photo from `/write` and let the nightly
interactions run mirror an avatar; both should still succeed, while a
read-only token should now get 403.

### 1.2 Reflected XSS on `/search` — **FIXED** (moderate)

Carried over unfixed from the 2026-07-11 audit (§1.1): the query string was
interpolated raw into `results.innerHTML` ("No results for …" and the results
header), so a crafted `/search?q=<img onerror=…>` link executed script.
Because `/write` keeps a repo-write PAT in `localStorage` on the same origin,
any XSS on the domain is potentially a site-takeover primitive, not just a
nuisance.

**Fix applied:** added an `escapeHtml` helper in `search.astro`; the query,
Pagefind titles, categories, tag labels, and URLs are all escaped before
concatenation. Pagefind excerpts remain HTML (they carry `<mark>` highlights
and derive from site-owned content).

### 1.3 No security response headers — **FIXED** (hardening)

`public/_headers` only tuned Pagefind's encoding. Added conservative,
breakage-free headers for all routes: `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
and a minimal `Permissions-Policy`. A full `Content-Security-Policy` is
still **OPEN** — the site uses many inline scripts (Astro islands, JSON-LD,
the theme snippet), so a CSP needs `unsafe-inline` or a nonce strategy and
real testing; see §5.

### 1.4 JSON-LD script-tag breakout — **FIXED** (low)

`[...slug].astro` injected `JSON.stringify(jsonLd)` into an inline
`<script type="application/ld+json">`. `JSON.stringify` does not escape
`</script>`, so a post title containing it would terminate the tag early.
Content is site-owned so this was latent, not exploitable by outsiders; `<`
is now escaped to `\u003c` before injection.

### 1.5 Reviewed and found sound (no action)

- **Webmention endpoint** (`functions/api/webmention.js`): target host
  allowlist, http(s)-only, 1 MB fetch cap with timeout, per-IP rate limit,
  plain-text-only excerpts, moderation gate before anything renders. Solid.
- **Interactions pipeline**: every collector (Mastodon, Bluesky, Threads,
  Instagram, webmentions) funnels third-party content through
  `sanitizeInteractionHtml` / `plainTextToHtml` in
  `scripts/lib/interactions/shared.js` before it reaches
  `interactions-index.json`, which `Interactions.astro` renders via
  `set:html`. Allowlist is tags-only formatting; links get
  `rel="nofollow noopener noreferrer"`.
- **GitHub workflows**: untrusted input (`comment.body`, dispatch inputs) is
  passed via `env:`, never interpolated into `run:` scripts;
  `webmention-moderation.yml` gates on OWNER/MEMBER/COLLABORATOR author
  association and `moderate-webmention.js` normalizes the domain before it
  reaches a commit message; refreshed tokens are `::add-mask::`ed. No
  `pull_request_target` use.
- **`/write` composer**: `setStatus` uses `innerHTML`, but the strings it
  receives are site-authored or same-origin API errors — self-XSS at worst.
  Queue rendering already escapes titles. See §5 for the localStorage-PAT
  note.

## 2. Unused code removed — **FIXED**

Verified by reference search across `src/`, `scripts/`, `functions/`,
`public/` and docs (imports, dynamic references, and doc links):

| Deleted | Why |
| --- | --- |
| `src/components/ContentGrid.astro` | No importers; superseded by `GardenGrid`/`Card` |
| `src/components/NotesGrid.astro` | No importers; evergreen pages use `GardenGrid` |
| `src/components/bookshelf/BookCard.astro` | No importers; `BookshelfCard` is the live card |
| `src/components/bookshelf/BookGrid.astro` | Only consumer of `BookCard`, itself unimported |
| `src/components/content/CategoryFilter.astro` | No importers (folder removed too) |
| `src/components/navigation/NavigationMenu.astro` | Docs claimed it was "retained for legacy layouts" but nothing renders it |
| `src/utils/imageUtils.ts` | No importers |
| `scripts/build.sh` | Not on any build path (Cloudflare uses `npm run build:cloudflare`) and destructive — it deleted `package-lock.json` and reinstalled |

Follow-on cleanups: stale "for the ContentGrid component" comments rewritten
in six section pages and `src/utils/content.ts`; `AGENTS.md` card-component
section corrected (`BookshelfCard`, `BookGrid` dropped from the layout list);
`docs/components/navigation.md` no longer points at `NavigationMenu`; the
sitemap filter for the long-gone `/navigation-demo/` page dropped from
`astro.config.mjs`.

Everything else with low reference counts (`Footer`, `LinkHoverEffect`,
`PhotoGrid`, `RecentItems`, `TagList`, islands, all shelf cards, both CSS
files in `src/styles/`) checked out as genuinely used.

## 3. Dependencies — **FIXED**

- **Removed unused direct deps:** `sax`, `js-yaml` (scripts use
  `gray-matter`), `tslib` (no `importHelpers` in tsconfig). Lockfile pruned
  by ~480 lines.
- **`npm audit`:** was 6 vulnerabilities (1 low, 5 moderate — esbuild dev
  server, `js-yaml` under `gray-matter`, `yaml` under the Astro language
  server; all dev-toolchain, none reachable in production). `npm audit fix`
  applied; **0 vulnerabilities** after.

## 4. Prior-audit status check

From `site-audit-2026-07-11-fresh.md`:

| Finding | Status |
| --- | --- |
| 1.1 Search XSS | Fixed here (§1.2) |
| 1.2 Security headers | Fixed here (§1.3), CSP still open |
| 1.3 Upload auth if repo goes public | **Condition tripped; fixed here (§1.1)** |
| 2.1 `build.sh` stale/destructive | Deleted here (§2) |
| 2.2 `astro check` hints (~120) | Open — mechanical, low value |
| 3.x Accessibility, 4–6 UX/features/perf | Open — product decisions, not refactor scope |

## 5. Open items (deliberate, need a decision)

1. **Content-Security-Policy** — biggest remaining hardening win; would have
   neutralized §1.2-class bugs. Needs a nonce/hash strategy for Astro's
   inline scripts and a test pass in report-only mode first.
2. **PAT in `localStorage` on `/write`** — works, but any future XSS on the
   origin can exfiltrate a repo-write token. Options: scope the PAT to the
   narrowest fine-grained permissions (already the intent — verify it has
   only Contents read/write on this one repo), set an expiry, or move
   publishing behind a small authenticated function.
3. **No rate limit on `/api/upload`** — with §1.1 fixed only write-capable
   tokens can hit it, so this is now owner-abuse-only; add a KV counter like
   the webmention endpoint's if it ever matters.
4. **`tsconfig` has all strict flags off** — long-term code-health item;
   flipping `strictNullChecks` alone would surface real bugs but is a large
   mechanical change.
5. **Legacy one-time scripts** in `scripts/` (Python migrations, Ghost/
   Goodreads importers) are documented as legacy in `scripts/README.md` and
   kept intentionally — no action.
6. **`public/_redirects` is empty** — harmless placeholder; delete or
   populate whenever redirects are actually needed.
