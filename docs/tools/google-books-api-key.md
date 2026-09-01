# Google Books API Key Setup

Optional. `scripts/download-book-covers.js` calls the Google Books API as
one of its four cover sources. Without a key, requests go through
unauthenticated and share Google's single anonymous per-IP quota — which
GitHub Actions runners can exhaust just from *other* tenants' unrelated
traffic on the same shared IP ranges, since huge numbers of unrelated CI
jobs make keyless Google API calls from the same pool of IPs. When that
happens, Google Books returns a `429 Quota exceeded` response, which
previously looked identical to "book not found" in the logs (see the fix
in `scripts/download-book-covers.js` that now logs
`⚠️  Google Books returned HTTP 429` explicitly instead of failing
silently).

A free API key gets its own dedicated quota (1,000 requests/day, far more
than this site needs) instead of sharing the anonymous bucket, so it's
worth setting up if you're seeing books fail with no explanation in the
`Download Covers` or `Enrich Shelf Metadata` workflow logs.

The script works fine without a key — this just makes Google Books more
reliable as a source.

## 1. Create the API key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or pick an existing one) — the free tier is all
   this needs, no billing account is required for the Books API's free
   quota.
3. Go to **APIs & Services → Library**, search for **Books API**, and
   click **Enable**.
4. Go to **APIs & Services → Credentials → Create Credentials → API key**.
   Copy the generated key.
5. Click **Restrict Key** (recommended, not required):
   - Under **API restrictions**, choose **Restrict key** and select only
     **Books API**. This limits what the key can be used for if it ever
     leaks.
   - Leave **Application restrictions** as **None** — this key is used
     from a GitHub Actions runner and a local machine, both with
     unpredictable IPs, so IP/referrer restrictions aren't practical here.

## 2. Set it up locally

Add it to your local `.env` file at the repo root (create the file if it
doesn't exist — it's gitignored):

```bash
GOOGLE_BOOKS_API_KEY=your_key_here
```

Or export it for a single run instead:

```bash
GOOGLE_BOOKS_API_KEY=your_key_here node scripts/download-book-covers.js
```

## 3. Set it up in GitHub Actions

1. Go to the repository on GitHub → **Settings → Secrets and variables →
   Actions → New repository secret**.
2. Name: `GOOGLE_BOOKS_API_KEY`. Value: the key from step 1.
3. Save.

Both workflows that call `download-book-covers.js` already pass this
secret through as an environment variable if it's set — no workflow YAML
changes are needed:

- `.github/workflows/download-covers.yml` (manual bulk/backfill runs)
- `.github/workflows/enrich-shelf-metadata.yml` (automatic cover fetch on
  push, for newly added books)

If the secret isn't set, both workflows keep working exactly as before —
Google Books just falls back to the shared anonymous quota.

## Verifying it worked

Run the downloader locally for a book and check the debug output for the
Google Books request URL — it should include `&key=...`:

```bash
node scripts/download-book-covers.js --book "Some Title"
```

In GitHub Actions, if Google Books ever does return a non-200 response
again, the workflow log will now show it explicitly:

```
⚠️  Google Books returned HTTP 429
```

instead of silently reporting the book as not found.

## Related

- [Book Cover Downloader](book-cover-downloader.md) — the script this key
  applies to, and the other three sources it tries (Bookshop.org,
  Goodreads, Open Library).
- [Shelf Cover Downloaders](shelf-cover-downloaders.md) — the film/TV/game
  equivalents, which use `TMDB_API_KEY`/`RAWG_API_KEY`/`TWITCH_CLIENT_ID`
  the same way.
