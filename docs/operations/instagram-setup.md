# Instagram Syndication Setup

Photo posts (`category: photo`) syndicate to Instagram alongside Mastodon,
Bluesky, and Threads. Instagram is photo-only: micro/blog/garden posts are
never sent there because the API cannot publish without an image.

## Threads token does NOT work for Instagram

Although both live under the same Meta developer console and use the same
container → publish pattern, they are separate APIs with separate tokens:

| | Threads | Instagram |
|---|---|---|
| API host | `graph.threads.net` | `graph.instagram.com` |
| Scopes | `threads_basic`, `threads_content_publish` | `instagram_business_basic`, `instagram_business_content_publish` |
| Account requirement | Any Threads profile | Instagram **professional** account (Business or Creator) |
| Token lifetime | 60 days (refreshable) | 60 days (refreshable) |

You need a second token pair; the good news is the setup flow mirrors the
Threads one you've already done.

## One-time setup

1. **Switch the Instagram account to a professional account** (Business or
   Creator) in the Instagram app: Settings → Account type and tools →
   Switch to professional account. Personal accounts cannot use the
   publishing API.
2. In the [Meta developer console](https://developers.facebook.com/apps/),
   open your existing app (or create one) and add the product
   **"Instagram" → API setup with Instagram business login**. A Facebook
   Page is *not* required with this flow.
3. In the product's **API setup** page, generate an access token for your
   Instagram account with the `instagram_business_basic` and
   `instagram_business_content_publish` scopes, and note the Instagram user
   ID it shows.
4. Add two repository secrets (Settings → Secrets and variables → Actions):
   - `INSTAGRAM_ACCESS_TOKEN` — the long-lived token from step 3
   - `INSTAGRAM_USER_ID` — the numeric Instagram user ID
5. Done. The next `syndicate-content` run picks them up automatically. Until
   the secrets exist, Instagram posting fails with a clear "Missing Instagram
   configuration" warning and the other platforms are unaffected.

## Token refresh

Long-lived Instagram tokens expire after 60 days. The
`refresh-instagram-token` workflow (`.github/workflows/refresh-instagram-token.yml`)
runs every Monday and refreshes the token via
`graph.instagram.com/refresh_access_token`, writing the new value back to the
`INSTAGRAM_ACCESS_TOKEN` secret. It reuses the same `GH_PAT` secret the
Threads refresh workflow already needs (see
[threads-token-refresh.md](threads-token-refresh.md)).

## What Instagram requires of the content

Enforced by Meta at publish time — worth knowing when a post fails:

- **JPEG only.** PNG/WebP/GIF are rejected. The `/write` composer re-encodes
  every photo-mode upload to JPEG for this reason, and the syndication script
  skips non-JPEG gallery images (by URL extension) with a warning. Legacy
  posts whose images aren't `.jpg` simply won't attach.
- **Publicly reachable image URL** — the R2 bucket behind
  `storage.sajalchoudhary.net` qualifies.
- **Max 8 MB per image**; width between 320 and 1440px (larger images are
  scaled down by Instagram).
- **Aspect ratio between 4:5 and 1.91:1.** Very tall or very wide photos are
  rejected — there is no auto-crop via the API. Panoramas won't post.
- **Carousels**: 2–10 images; the script sends up to the first 10 gallery
  images. A carousel counts as one post.
- **Captions**: max 2,200 characters, 30 hashtags. Links in captions are
  plain text (not clickable) — the canonical URL still goes in for
  provenance.
- **Rate limit**: 50 API-published posts per rolling 24 hours per account.

## How the flow works

`scripts/lib/platforms/instagram.js` follows the standard Meta publish
sequence: create a media container per image
(`POST /{user-id}/media`, with `is_carousel_item` + a parent `CAROUSEL`
container for multi-photo posts), poll `status_code` until Instagram finishes
fetching the image(s), then `POST /{user-id}/media_publish` and read back the
`permalink` — which lands in the post's `syndicationUrls` frontmatter like
every other platform.
