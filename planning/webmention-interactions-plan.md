# Webmentions & Interactions: Self-Hosted Plan

Plan for collecting responses to posts — replies, likes, reposts, and comments from
Mastodon, Bluesky, Threads, Instagram, classic webmentions from other blogs, and
email replies from Buttondown — and displaying them under each post in an
**Interactions** tab rendered as a stream. Everything is self-hosted on
infrastructure the site already pays $0 for: GitHub Actions, Cloudflare Pages
Functions, and Cloudflare KV. No webmention.io, no Bridgy.

## Why this site is already 90% ready

| Prerequisite | Status |
|---|---|
| POSSE syndication to Mastodon, Bluesky, Threads, Instagram | ✅ `scripts/syndicate-content.js` + `scripts/lib/platforms/*` |
| Syndicated copy URLs recorded per post | ✅ `syndicationUrls` frontmatter via `scripts/lib/frontmatter-updater.js` |
| h-entry microformats + `u-syndication` markup | ✅ `PostLayout.astro`, `PhotoPostLayout.astro`, `SyndicationLinks.astro` |
| Platform API credentials | ✅ GitHub secrets: `MASTODON_ACCESS_TOKEN`, `BLUESKY_*`, `THREADS_*`, `INSTAGRAM_*` (with token-refresh workflows) |
| "Fetch → commit JSON → rebuild" pipeline precedent | ✅ `refresh-backlinks.yml` → `src/data/backlinks-index.json` |
| Serverless endpoint hosting | ✅ Cloudflare Pages Functions (`functions/api/*`) |
| HTML sanitizer | ✅ `sanitize-html` already a dependency |

The `syndicationUrls` frontmatter is the linchpin: each post already knows where its
copies live on every network, which is exactly what a backfeed collector needs.
Because the syndicated post links back to the canonical URL, replies to those copies
are morally webmentions — we just fetch them ourselves instead of relying on Bridgy.

## Architecture overview

```
                       ┌───────────────────────────────┐
 Mastodon / Bluesky /  │  GitHub Action (cron, 4×/day) │
 Threads / Instagram ─▶│  scripts/collect-interactions │──┐
        APIs           └───────────────────────────────┘  │
                                                          ▼
 Other blogs ─▶ POST /api/webmention ─▶ KV (pending) ─▶ merge into
               (Cloudflare Pages Fn)      ▲               src/data/interactions-index.json
                                          │               │ commit → Pages rebuild
 Buttondown replies ─▶ (manual curation / │               ▼
   later: CF Email Worker) ───────────────┘   <Interactions /> tab in PostLayout
```

Interactions are **baked in at build time** — the site stays fully static, reads are
free and cached, and there is no client-side fetching. Freshness is bounded by the
cron cadence (up to ~6 h stale), which is an acceptable trade-off for a personal
site; a live client-side island can be added later without changing the data model.

## Data model

One JSON index, mirroring the backlinks pattern: `src/data/interactions-index.json`.

```jsonc
{
  "/micro/fable-is-very-good/": [
    {
      "id": "mastodon-114312345678901234",     // stable dedupe key: platform + native id
      "type": "reply",                         // reply | like | repost | mention | like-count | email
      "platform": "mastodon",                  // mastodon | bluesky | threads | instagram | web | email
      "author": {
        "name": "Ada",
        "url": "https://mastodon.social/@ada",
        "avatar": "https://files.mastodon.social/....png"
      },
      "content": "<p>Sanitized HTML or plain text…</p>",  // empty for likes/reposts
      "url": "https://mastodon.social/@ada/114312…",       // permalink to the interaction
      "published": "2026-07-12T18:04:00Z",
      "status": "approved"                     // approved | pending | blocked
    }
  ]
}
```

- Keyed by canonical post path (same convention as the backlinks index).
- `id` makes collector runs idempotent: merge by id, never duplicate.
- `content` is always passed through `sanitize-html` with a strict allowlist
  (`p`, `a`, `br`, `em`, `strong`, `code`) before it is written to the index —
  the index never contains unsanitized third-party HTML.
- Likes/reposts have empty content and render as a facepile, not stream items.
- If the file grows unwieldy it can shard to `src/data/interactions/<slug>.json`
  later without changing consumers (hide access behind `src/utils/interactions.ts`).

## Phase 1 — Backfeed collector: Mastodon + Bluesky (highest value, zero new infra)

New script `scripts/collect-interactions.js` (+ `scripts/lib/interactions/` helpers),
run by a new workflow `.github/workflows/refresh-interactions.yml` cloned from
`refresh-backlinks.yml` (cron every 6 h + `workflow_dispatch`, same
bot-loop guard, same commit-if-changed step, same failure-issue step).

Per post with `syndicationUrls`:

- **Mastodon** — status ID is the last path segment of the syndication URL.
  - Replies: `GET {instance}/api/v1/statuses/{id}/context` → `descendants`
  - Likes: `GET .../statuses/{id}/favourited_by`
  - Reposts: `GET .../statuses/{id}/reblogged_by`
  - Public endpoints; send the existing `MASTODON_ACCESS_TOKEN` anyway for rate-limit headroom.
- **Bluesky** — URL is `https://bsky.app/profile/{handle}/post/{rkey}`. Resolve
  handle → DID once (`com.atproto.identity.resolveHandle`, cache in the script run),
  build `at://{did}/app.bsky.feed.post/{rkey}`, then hit the **public AppView**
  (`https://public.api.bsky.app`, no auth at all):
  - Replies: `app.bsky.feed.getPostThread`
  - Likes: `app.bsky.feed.getLikes`
  - Reposts: `app.bsky.feed.getRepostedBy`

Scope control so runs stay fast and within rate limits: only poll posts published in
the last N days (default 60, configurable like the syndicator's `days-back` input),
plus any post that already has interactions. Reuse `scripts/lib/utils/rate-limiter.js`.

Deliverables: collector script, workflow, `interactions-index.json`, and the display
component (below). **This phase alone gets replies/likes/reposts from the two
platforms with the friendliest APIs onto the site.**

## Phase 2 — Threads + Instagram backfeed

Both store only a permalink in frontmatter, and Meta's APIs want a *media ID*, so
add a resolution step: list own media (`GET graph.threads.net/v1.0/{user-id}/threads`
/ `GET graph.instagram.com/{user-id}/media` with `fields=id,permalink`) and match
permalinks against `syndicationUrls`. Cache the permalink→id map inside the index
(or a sibling `interaction-sources.json`) so resolution happens once per post.

- **Threads** (existing `THREADS_ACCESS_TOKEN`, auto-refreshed by
  `refresh-threads-token.yml`):
  - Replies: `GET /{media-id}/replies?fields=id,text,username,permalink,timestamp` —
    the API returns replies to *your own* posts, which is exactly this use case.
  - Likes: only **counts** via `GET /{media-id}/insights?metric=likes` — Threads does
    not expose who liked. Render as a count chip ("❤️ 12 on Threads"), not a facepile.
- **Instagram** (existing `INSTAGRAM_ACCESS_TOKEN`, auto-refreshed by
  `refresh-instagram-token.yml`):
  - Comments: `GET /{media-id}/comments?fields=id,text,username,timestamp`.
    ⚠️ Verify the Meta app has `instagram_business_manage_comments` (or the
    equivalent scope for the current API product); the publish-only scope used for
    syndication may not cover reading comments. If a new scope is needed, it's a
    one-time re-auth, still free.
  - Likes: counts only (`like_count` field on the media object) — same count-chip
    treatment as Threads.

## Phase 3 — Receiving real webmentions (other blogs)

1. **Advertise the endpoint.** Add to the site head in `Layout.astro`:
   `<link rel="webmention" href="https://sajalchoudhary.net/api/webmention">`.
2. **Endpoint**: new Pages Function `functions/api/webmention.js` (pattern-match
   `functions/api/upload.js`). Handles `POST` with form-encoded `source` + `target`:
   - Validate: both are `http(s)`, `target` is on `sajalchoudhary.net`,
     `source !== target`, target path actually exists (cheap HEAD against the site).
   - Verify synchronously (webmention spec allows async, but sync is simpler and
     volume is tiny): fetch `source` with a timeout and a ~1 MB size cap, confirm
     the document links to `target`, and extract a minimal h-entry (author h-card,
     `e-content` excerpt, `in-reply-to` / `like-of` / `repost-of` → type; default
     `mention`).
   - Store the parsed mention in **Cloudflare KV** (bind `WEBMENTIONS` to the Pages
     project) keyed `pending:{hash(source+target)}`, `status: pending`. Re-sent
     webmentions overwrite (spec-compliant update); a source that now returns
     410/404 or no longer links to target marks the stored mention deleted.
   - Return `201`. Rate-limit by IP (simple KV counter) to keep abuse out.
   - Free-tier math: Pages Functions 100k req/day, KV 1k writes/day — a personal
     site's webmention volume is orders of magnitude below both.
3. **Moderation + merge.** The Phase 1 workflow gains a step that drains pending
   mentions from KV via the Cloudflare API (`CLOUDFLARE_API_TOKEN` +
   `CLOUDFLARE_ACCOUNT_ID` secrets, KV-read scope) and merges them into the index:
   - Domains on an allowlist (`interactions.config.json`) → `approved` immediately.
   - Everything else lands as `pending` — invisible on the site — and the workflow
     opens/updates a GitHub issue listing pending mentions. Approve by adding the
     domain to the allowlist or flipping the entry's `status` in the JSON; block by
     adding to a blocklist that also purges existing entries.
   This keeps arbitrary internet input out of the rendered site until a human nods.

## Phase 4 — Email replies (Buttondown) + polish

- **Buttondown replies, MVP: manual curation.** Buttondown routes replies to the
  personal inbox and exposes no reply-content API, and email is *private by
  default* — auto-publishing someone's email would be wrong anyway. Add a small
  curated file `src/data/email-interactions.json` (same entry shape,
  `platform: "email"`, author name reduced to first name unless permission given)
  that merges into the index at build. Pasting a good reply in takes 30 seconds and
  doubles as a consent checkpoint.
- **Optional automation later:** point Buttondown's reply-to at a dedicated address
  on a Cloudflare **Email Routing** worker (free), which parses inbound mail into
  the same KV pending queue → same moderation flow. Still always moderated, never
  auto-approved.
- **Sending webmentions** (be a good citizen): in `content-publish.yml`, after
  deploy, run a small script over new/changed posts: extract outgoing links from
  rendered content, discover each target's webmention endpoint (HTTP `Link` header
  or `<link rel="webmention">`), `POST source+target`. Record sent pairs in
  `src/data/webmentions-sent.json` to avoid re-sending.
- **Avatar caching (optional):** hotlinked avatars leak reader IPs to third parties
  and rot. The collector can mirror avatars into the existing R2 bucket
  (`storage.sajalchoudhary.net`) at collection time. V1 ships with hotlinks +
  `loading="lazy" referrerpolicy="no-referrer"`; caching is a drop-in upgrade.

## Display: the Interactions tab

New `src/components/interactions/Interactions.astro`, wired into
`PostLayout.astro` (below the content, adjacent to the existing
`SyndicationLinks` block at ~line 611) and `PhotoPostLayout.astro`.

- **Tab bar** under the post: `Post · Interactions (12)`. Default view is the post;
  the Interactions tab is a progressive-enhancement toggle (works as an anchor
  without JS, small vanilla island like `tag-list-island.js` for the tab switch).
  Hide the tab entirely when a post has zero interactions.
- **Inside the tab, a stream view** (consistent with the site's Stream idiom):
  - Top row: **facepile** of likes + reposts (avatar stack, grouped by type, each
    avatar links to the profile), plus count chips for Threads/Instagram likes
    where only counts exist.
  - Below: chronological stream of replies / comments / webmentions / emails —
    avatar, author name → profile link, platform glyph (reuse the icon set from
    `syndication.config.json`: 🐘 🦋 🧵 📷, plus 🌐 web / ✉️ email), relative
    timestamp (existing `src/scripts/relativeTime.ts`), sanitized content, and a
    permalink to the original. Replying happens *on the platform* — the permalink
    is the call to action.
- Data access via `src/utils/interactions.ts` (`getInteractionsForPost(path)`),
  filtering `status === "approved"`, so layouts never touch the JSON shape directly.
- Later (optional): a global `/interactions` firehose page and a stream-sidebar
  module — trivial once the index exists (fits `stream-sidebar-opportunities.md`).

## What each platform can and cannot provide

| Platform | Replies | Who liked | Who reposted | Auth needed |
|---|---|---|---|---|
| Mastodon | ✅ full | ✅ full | ✅ full | none (public) — token helps rate limits |
| Bluesky | ✅ full | ✅ full | ✅ full | none (public AppView) |
| Threads | ✅ own posts | ❌ count only | ❌ | existing token |
| Instagram | ✅ comments | ❌ count only | n/a | existing token (verify comment-read scope) |
| Other blogs | ✅ via webmention | ✅ via webmention | ✅ via webmention | n/a |
| Buttondown | ✅ manual (or Email Worker) | n/a | n/a | n/a |

## Cost check (the "free" constraint)

- **GitHub Actions**: one more scheduled workflow at ~2 min × 4/day ≈ 240 min/month,
  alongside the existing crons — inside the free allowance.
- **Cloudflare Pages Functions**: 100k requests/day free; webmention traffic is negligible.
- **Cloudflare KV**: 100k reads / 1k writes per day free — far above expected volume.
- **Cloudflare Email Routing** (Phase 4 option): free.
- **No third-party services**: no webmention.io, no Bridgy, no brid.gy backfeed —
  every collector is first-party code hitting the platforms' own free APIs.

## Risks & mitigations

- **Meta API scope gaps** (Instagram comment reading): verify scopes early in
  Phase 2; worst case Instagram ships counts-only until re-auth.
- **Bot-commit loops**: reuse the `github.actor != 'github-actions[bot]'` guard —
  but note the interactions workflow *must not* trigger syndication; confirm
  `content-publish.yml` / `syndicate-content.yml` path filters ignore `src/data/`.
- **Abuse via webmention endpoint**: sync verification, size/time caps on source
  fetches, IP rate limiting, moderation queue for unknown domains, strict
  sanitization at write time and again at render.
- **Deleted platform posts**: collector treats 404/410 on a previously-seen
  interaction as a tombstone and removes it — respects deletions upstream.
- **Rebase races on `main`**: same `git pull --rebase` push strategy as
  `refresh-backlinks.yml`.

## Suggested build order

1. **Phase 1** (collector for Mastodon + Bluesky, index, Interactions tab) — one PR,
   immediately visible payoff. ✅ **Shipped**: `scripts/collect-interactions.js`,
   `scripts/lib/interactions/*`, `src/data/interactions-index.json`,
   `src/utils/interactions.ts`, `src/components/interactions/Interactions.astro`,
   `.github/workflows/refresh-interactions.yml`, `interactions.config.json`.
2. **Phase 2** (Threads + Instagram) — mostly collector plumbing.
   ✅ **Shipped**: `scripts/lib/interactions/threads.js`, `scripts/lib/interactions/instagram.js`,
   shared Meta Graph helpers + permalink→media-id resolution in
   `scripts/lib/interactions/meta.js`, the resolution cache
   `src/data/interaction-sources.json`, and `like-count` count-chip entries
   rendered by `Interactions.astro`. Missing read scopes
   (`threads_read_replies`, `threads_manage_insights`,
   `instagram_business_manage_comments`) degrade gracefully with a run-log
   warning until a one-time re-auth grants them.
3. **Phase 3** (webmention endpoint + KV + moderation) — the "real" webmention support.
   ✅ **Shipped**: `functions/api/webmention.js` (sync verification with timeout +
   1 MB cap, minimal h-entry extraction via HTMLRewriter, IP rate limiting,
   tombstones for deleted/unlinked sources), `<link rel="webmention">` in
   `Layout.astro`, KV drain + moderation merge in
   `scripts/lib/interactions/webmentions.js` (wired into
   `scripts/collect-interactions.js`), `approvedWebmentionDomains` /
   `blockedWebmentionDomains` in `interactions.config.json`, and a
   self-maintaining "Webmentions pending moderation" issue step in
   `refresh-interactions.yml`.

   **One-time setup still required** — see
   [Phase 3 setup: KV namespace, binding, secrets](#phase-3-setup-kv-namespace-binding-secrets)
   below. Until the KV binding exists the endpoint returns 500 (nothing else
   is affected); until the secrets are set the collector logs that the drain
   is skipped and mentions simply wait in KV.
4. **Phase 4** (outgoing webmentions, email curation, avatar caching) — polish, any order.
   ✅ **Shipped**: `src/data/email-interactions.json` (curated file, merged into
   `getInteractionsForPost()` in `src/utils/interactions.ts` at build time —
   paste a reply in, it appears on the next build, no workflow run needed),
   `scripts/send-webmentions.js` (fetches each recent post's live page,
   extracts outbound links from its `.e-content` block(s), discovers each
   target's webmention endpoint via `Link` header or `<link rel="webmention">`,
   POSTs source+target, records sent pairs — and negative results, rechecked
   after 30 days — in `src/data/webmentions-sent.json`; wired into
   `syndicate-content.yml` right after the existing deploy-wait step),
   `scripts/lib/interactions/avatar-cache.js` (mirrors hotlinked avatars into
   the same R2 bucket `functions/api/upload.js` writes to, under an
   `avatars/` prefix; signs requests against R2's S3-compatible API by hand —
   no SDK — since the collector runs as a plain Node script in Actions, not
   inside a Pages Function; wired into `scripts/collect-interactions.js`
   after the webmention merge, with a `src/data/avatar-cache.json` cache so
   repeat runs don't re-upload).

   **One-time setup still required for avatar mirroring** — see
   [Phase 4 setup: R2 API token](#phase-4-setup-r2-api-token) below. Until
   the secrets are set the collector logs that mirroring is skipped and
   avatars stay hotlinked (no functional impact, just the privacy/rot
   trade-off described above). Sending outgoing webmentions and the email
   curation file need no new infrastructure — both are live already.

## Phase 3 setup: KV namespace, binding, secrets

One-time, ~10 minutes, all free tier. Three pieces: a KV namespace (the
mention queue), a binding so the Pages Function can write to it, and three
GitHub secrets so the collector workflow can drain it.

### 1. Create the KV namespace

**Dashboard:** [dash.cloudflare.com](https://dash.cloudflare.com) → select the
account → **Storage & Databases → KV** → **Create a namespace** → name it
`webmentions` (the name is cosmetic; the *binding* name in step 2 is what the
code sees) → **Add**.

**Or via wrangler:**

```sh
npx wrangler kv namespace create webmentions
```

Either way, copy the namespace **ID** (a 32-char hex string shown in the
namespace list / wrangler output) — it becomes the
`WEBMENTIONS_KV_NAMESPACE_ID` secret in step 4.

### 2. Bind it to the Pages project as `WEBMENTIONS`

Dashboard → **Workers & Pages** → the site's Pages project → **Settings** →
**Bindings** (older UI: Settings → Functions → KV namespace bindings) →
**Add** → **KV namespace**:

- **Variable name:** `WEBMENTIONS` — must be exactly this; it's what
  `functions/api/webmention.js` reads as `env.WEBMENTIONS`.
- **KV namespace:** the `webmentions` namespace from step 1.

Add the binding for the **Production** environment. Adding it to **Preview**
too is optional — harmless, but preview deployments would then write real
pending mentions into the same queue; leaving preview unbound just makes the
endpoint return 500 there, which is fine.

Bindings only apply to **new deployments**: trigger a rebuild (push any
commit, or Pages → Deployments → Retry) before testing.

### 3. Create a Cloudflare API token for the drain

The collector workflow reads and deletes queue entries through the REST API,
so it needs a token — scope it to KV only:

Dashboard (top-right profile) → **My Profile → API Tokens** → **Create
Token** → **Create Custom Token**:

- **Name:** `scdotnetv3 webmentions drain`
- **Permissions:** `Account` · `Workers KV Storage` · `Edit`
  (Edit, not Read — the drain deletes keys after merging)
- **Account Resources:** Include → the specific account
- Everything else default → **Continue to summary** → **Create Token**

Copy the token now — it's shown once. While here, note the **Account ID**
(dashboard → any zone → right sidebar, or **Workers & Pages** overview →
right side).

### 4. Add the GitHub repo secrets

Repo → **Settings → Secrets and variables → Actions** → **New repository
secret**, three times:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | the token from step 3 |
| `CLOUDFLARE_ACCOUNT_ID` | the account ID (32-char hex) |
| `WEBMENTIONS_KV_NAMESPACE_ID` | the namespace ID from step 1 |

All three are required — if any is missing the collector skips the drain
with an info log rather than failing.

### 5. Verify end to end

1. **Endpoint is live** (after the step-2 redeploy):
   ```sh
   curl -i https://sajalchoudhary.net/api/webmention
   ```
   Expect `405` with a JSON hint. A `500` mentioning the binding means step 2
   didn't take effect (or the rebuild hasn't happened).
2. **Rejects garbage:**
   ```sh
   curl -i -d 'source=https://example.com/&target=https://example.com/' \
     https://sajalchoudhary.net/api/webmention
   ```
   Expect `400` (`target is not on this site`).
3. **Accepts a real mention:** publish a note anywhere (e.g. a test page on
   any site you control) containing a link to a real post, then:
   ```sh
   curl -i -d 'source=<that page>&target=<the post URL>' \
     https://sajalchoudhary.net/api/webmention
   ```
   Expect `201`. The record should appear in the dashboard under the KV
   namespace's entries as `pending:<hash>`.
4. **Drain works:** run the **Refresh interactions index** workflow manually
   (Actions → workflow_dispatch). The log should show
   `🌐 web: drained 1 webmention(s) from KV`, the KV entry disappears, and —
   since the source domain isn't allowlisted — a
   "Webmentions pending moderation" issue opens listing it. Approve by adding
   the domain to `approvedWebmentionDomains` in `interactions.config.json`
   (or flip the entry's `status` in `src/data/interactions-index.json`); the
   mention renders in the post's Interactions tab after the next build.

## Phase 4 setup: R2 API token

One-time, ~5 minutes, free tier. Avatar mirroring reuses the R2 bucket
`functions/api/upload.js` already writes to (bound as `IMAGES` on Pages) — no
new bucket, and no folder to create by hand: R2 has no real directory
concept, so the `avatars/` key prefix just appears the first time something
writes under it, the same way `images/2026/07/...` did. What's new is
*credentials*: `scripts/lib/interactions/avatar-cache.js` runs as a plain
Node script in GitHub Actions, not inside a Cloudflare Pages Function, so it
can't use the `env.IMAGES` binding — it signs requests against R2's
S3-compatible API instead, which needs an R2-specific API token (a different
credential type from the `CLOUDFLARE_API_TOKEN` used for the KV drain in
Phase 3, which only grants Workers KV access).

### 1. Find the bucket name

Dashboard → **Storage & Databases → R2** — the bucket bound as `IMAGES` in
the Pages project's Settings → Bindings. Note its name; it becomes the
`R2_BUCKET` secret in step 3.

### 2. Create an R2 API token

Dashboard → **R2** → **Manage R2 API Tokens** (right side) → **Create API
Token**:

- **Token name:** `scdotnetv3 avatar mirror`
- **Permissions:** `Object Read & Write`
- **Specify bucket(s):** the bucket from step 1 only — no need for
  account-wide access
- **TTL:** forever (or your preference)
- **Create API Token**

The confirmation page shows an **Access Key ID**, a **Secret Access Key**,
and a **Jurisdiction-specific endpoint** — copy the Access Key ID and Secret
Access Key now (the secret is shown once); the endpoint isn't needed since
the script derives it from the account ID.

### 3. Add the GitHub repo secrets

Repo → **Settings → Secrets and variables → Actions** → **New repository
secret**, four times:

| Secret | Value |
|---|---|
| `R2_ACCOUNT_ID` | the account ID (same one used for `CLOUDFLARE_ACCOUNT_ID` in Phase 3) |
| `R2_ACCESS_KEY_ID` | the Access Key ID from step 2 |
| `R2_SECRET_ACCESS_KEY` | the Secret Access Key from step 2 |
| `R2_BUCKET` | the bucket name from step 1 |

All four are required — if any is missing the collector logs
`ℹ️  avatars: R2 credentials not configured, using hotlinked avatars` and
skips mirroring rather than failing.

### 4. Verify

Run the **Refresh interactions index** workflow manually (Actions →
workflow_dispatch). The log should show a line like
`🖼️  avatars: 12 mirrored, 0 cached, 0 failed` (counts will vary), and
`src/data/avatar-cache.json` should pick up a new commit. Spot-check one of
the mirrored URLs — it should be `https://storage.sajalchoudhary.net/avatars/<hash>.<ext>`
and load the same image the original hotlink did. On the next site build,
avatars in the Interactions tab load from that URL instead of the origin
platform's CDN.
