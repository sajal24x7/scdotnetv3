# Image Optimization Roadmap

Plan for making every content image on the site optimized and responsive.
Current behavior is documented in
[`docs/operations/image-optimization.md`](../docs/operations/image-optimization.md).

> **Status (2026-10):** Phase 1 is done on the `claude/responsive-images`
> branch. Phases 2 to 5 are open.

---

## Phase 1: Optimize and make R2 images responsive (done)

- `astro.config.mjs`: `image.domains` allows `storage.sajalchoudhary.net`;
  `image.layout: 'constrained'` makes every image responsive by default.
- `scripts/cache-image-dimensions.js` writes `src/data/image-dimensions.json`
  (URL → `[width, height]`) before every dev/build.
- `src/utils/remarkResponsiveImages.ts` sizes R2 images in Markdown bodies and
  turns unknown ones into plain `<img>` tags so they can't fail the build.
- `src/components/RemoteImage.astro` replaces bare `<img>` tags for
  frontmatter images in `PhotoGrid`, `PhotoCarousel`, `PostItem`, `Card`,
  `PostHero`, `PhotoPostLayout` and the `NordletterGrid` fallback.
- `parseMarkdownWithImages()` (`src/utils/images.ts`) rewrites R2 images in the
  `marked` previews used by `StreamLayout`, `GardenGrid`, `RecentItems` and
  `/now`.
- RSS feeds and `og:image` keep the original R2 URLs on purpose.

Verified locally by serving test images from a local server in place of R2:
Markdown bodies, heroes, carousels, the photo grid and stream previews all got
`/_astro/*.webp` files with `srcset` widths from 320px up to the original
size, and a second build reused the cache.

### Before merging

1. **Fill and commit the manifest.** Run `npm run cache-image-dimensions` on a
   machine that can reach R2 (about 1,400 images; each probe downloads only a
   few KB), then commit `src/data/image-dimensions.json`. Without it, every
   Cloudflare build re-probes all images and nothing is optimized until it
   does.
2. **Watch the first Cloudflare build.** It converts about 1,400 photos into
   up to 8 widths each. Check it fits in the Pages build time limit. If it
   doesn't, commit the manifest in batches (for example one year of images at
   a time) so the cache warms over several builds.
3. **Check the preview deploy:**
   - Post bodies, photo grid, photo posts, heroes and stream entries use
     `/_astro/...` URLs with `srcset`.
   - A second build is much faster than the first.
   - No layout shift at mobile, tablet (≥48rem) and desktop widths.
   - Shelf pages and `<Image>` calls that had no `layout` before
     (`BookDetailLayout`, `ShelfPostLayout`, TV show and season pages,
     `books/index`) still look right with the new `constrained` default.
   - RSS feeds and `og:image` still point at R2.

## Phase 2: Retire the Nordletter image cache

Nordletter thumbnails are R2 images too, so the separate download step is no
longer needed.

- Render Nordletter thumbnails with `RemoteImage` (the fallback branch in
  `NordletterGrid.astro` already does) and remove the `<Image>` branch.
- Delete `scripts/cache-nordletter-images.js`,
  `src/data/nordletter-image-manifest.json` and `src/images/nordletter/`.
- Remove the `import.meta.glob` lookup in `src/utils/feed.ts` (around line 44);
  feeds should use the R2 URL directly.
- Remove `cache-nordletter-images` from the `dev`, `start`, `build` and
  `build:cloudflare` scripts in `package.json`.
- Update `docs/operations/nordletter-image-cache.md` (delete or mark
  historical), `docs/operations/deployment.md`, `docs/README.md`,
  `docs/architecture/content-lifecycle.md`, `docs/architecture/overview.md`,
  `scripts/README.md` and `AGENTS.md`.

## Phase 3: Copy third-party images into R2

24 Markdown images point at other sites and will break over time:
seths.blog (4), futureforum.com (4), images.unsplash.com (3),
substackcdn.com (2), daringfireball.net (2), cdn.prod.website-files.com (2),
alexkondov.com (2), and one each from research.swtch.com, randsinrepose.com,
cdn-ikpmcgf.nitrocdn.com, thehelix.ie and youtu.be (probably a link, not an
image; check by hand).

- Write a one-time script (`scripts/mirror-external-images.js`) that downloads
  each image, uploads it to R2 under `images/mirrored/<year>/`, and rewrites
  the URL in the content file.
- Run `npm run cache-image-dimensions` afterwards so the copies get optimized.
- Commit content changes on the `content` branch flow described in
  `docs/content/publishing-pipeline.md`.

## Phase 4: Clean images at upload time

**Keep JPEG as the stored format.** Do not convert R2 originals to WebP:

- It would not remove the build step. Most of Astro's work is resizing each
  image into several widths, which costs the same whatever the source format.
  Astro already serves WebP to readers.
- Instagram only accepts JPEG (`scripts/lib/platforms/instagram.js` skips
  anything else), and the Threads API accepts only JPEG and PNG.
- RSS feeds and `og:image` use the originals, and some feed readers and
  social sites handle WebP poorly.
- Converting existing images means rewriting about 1,400 URLs in content and
  breaking any outside links to the old files.

### `/write` uploads (already mostly right)

`public/write/index.html` (`shrinkImage`) and `functions/api/upload.js`
already:

- resize to 1536px on the long edge;
- re-encode to JPEG at quality 0.85 (always in photo mode; otherwise when
  the file is over 500 KB or needs resizing);
- use hashed keys (`images/YYYY/MM/<timestamp>-<hash>.<ext>`);
- set `Cache-Control: public, max-age=31536000, immutable`.

Re-encoding through a canvas drops EXIF data, including GPS location.
**Gap:** in note mode, a JPEG under 500 KB that is already within 1536px is
uploaded untouched, so its EXIF (and any GPS location) is kept. Fix: always
re-encode JPEGs in `shrinkImage` (or strip EXIF in `upload.js`).

### Obsidian → `content` branch pipeline

Bring it in line with `/write`:

- Strip EXIF metadata, especially GPS location.
- Resize to about 1536–2400px on the long edge and keep JPEG.
- Use hashed filenames and the same `Cache-Control` header, so Astro's build
  cache reuses images without a revalidation request.

### Existing images

- Consider a one-time pass over existing R2 JPEGs to strip GPS data in
  place (same keys, so no content changes).
- Set the long `Cache-Control` header on older objects that lack it.

## Phase 5: Keep the manifest current

The build fills in missing manifest entries but never commits them, so new
images get probed on every build until someone commits the manifest.

- Add a step to an existing GitHub Actions workflow that already commits to
  `main` (for example the interactions refresh), or a small scheduled one,
  that runs `npm run cache-image-dimensions` and commits
  `src/data/image-dimensions.json` with `[CI Skip]`.
- Alternatively, have the publishing pipeline record dimensions when it
  uploads an image.

## Small follow-ups

- `PhotoGrid` uses one `sizes` value for both grid and list views because the
  view switches on the client. Grid view downloads larger images than it
  needs. A tighter value is possible if grid view becomes the only default.
- `og:image` could use a 1200px JPEG made at build time to cut social preview
  size. Needs an absolute URL, so it would use `getImage()` plus `Astro.site`.
- Webmention avatars in `Interactions.astro` stay unoptimized (third-party
  URLs). Fine unless they become a performance problem.
