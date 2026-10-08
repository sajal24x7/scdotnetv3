# Image Optimization

Every image on the site's pages is optimized at build time and served with a responsive `srcset`. This page covers how that works and what to do when adding images.

## Image sources

| Source | Where | How it is optimized |
| --- | --- | --- |
| Shelf covers, profile photo | `src/images/` (committed) | `<Image>` from `astro:assets` with an explicit `layout`. |
| Nordletter thumbnails | Downloaded into `src/images/nordletter/` before each build | `<Image>`; see [Nordletter Image Caching](nordletter-image-cache.md). |
| Content images on R2 (`storage.sajalchoudhary.net`) | Markdown bodies and frontmatter `image` / `images` | Astro's remote image pipeline, sized from the dimension manifest (below). |
| Third-party image URLs | A few older posts | Not optimized. Served as-is with lazy loading. |

## Configuration

`astro.config.mjs`:

```js
image: {
    domains: ['storage.sajalchoudhary.net'],
    layout: 'constrained',
},
```

- `domains` allows Astro to download and optimize R2 images during the build.
- `layout: 'constrained'` is the default for every image, so each one gets a `srcset` and `sizes`. Components can still pass their own `layout` (shelf cards use `fixed`).
- `responsiveStyles` stays off. Global CSS (`img { max-width: 100%; height: auto; }` in `src/styles/grid.css`) already sizes images.

## The dimension manifest

`src/data/image-dimensions.json` maps each R2 image URL to `[width, height]`. It is written by `scripts/cache-image-dimensions.js`, which runs before every `dev` and `build` (`npm run cache-image-dimensions`).

Why it exists:

- **No measuring fetches.** Without known sizes, Astro downloads every remote image on every build just to measure it.
- **No broken builds.** Astro fails the build when it cannot measure a remote image. Images missing from the manifest are rendered as plain `<img>` tags instead, so a new or broken image never stops a deploy.

The script scans `src/content/**/*.md` for R2 URLs in Markdown image syntax and in the `image` / `images` frontmatter fields. It only probes URLs missing from the manifest, downloads just the first few kilobytes of each, and drops entries for images no longer referenced. Network failures are logged (first 10 only) and skipped.

**The manifest is committed automatically.** Cloudflare builds can fill in missing entries, but they don't commit the result. The `refresh-image-dimensions.yml` workflow runs the script after content changes on `main`, after each content publish, and nightly, then commits `src/data/image-dimensions.json` with `[CI Skip]` if it changed. Run it by hand from the Actions tab after a large import.

## How each kind of image is rendered

| Where | Code | Notes |
| --- | --- | --- |
| Markdown bodies on post pages | `src/utils/remarkResponsiveImages.ts` | Adds width, height, srcset widths and the prose `sizes` hint to R2 images in the manifest, then Astro optimizes them. R2 images not in the manifest become plain lazy `<img>` HTML. |
| Frontmatter images | `src/components/RemoteImage.astro` | Used by `PhotoGrid`, `PhotoCarousel`, `PostItem`, `Card`, `PostHero`, `PhotoPostLayout` and the `NordletterGrid` fallback. Falls back to the original URL when an image cannot be optimized. |
| Stream, garden, now and recent-item previews | `parseMarkdownWithImages()` in `src/utils/images.ts` | These render Markdown with `marked`, so R2 `<img>` tags in the HTML are rewritten after parsing. |

Shared settings live in `src/utils/imageDimensions.ts`:

- `PROSE_SIZES` (`(max-width: 48rem) 100vw, 42rem`) and `PROSE_MAX_WIDTH` (1600px) for images in a text column.
- Candidate `srcset` widths: 320 to 2048px. An image never gets widths larger than its original.

When adding a component that shows an R2 image, use `RemoteImage` and give it a `sizes` value that matches the slot it is shown in, plus `maxWidth` of roughly twice the slot's widest CSS width.

## Deliberately not optimized

- **RSS feeds** (`src/pages/**/rss.xml.js`, `src/utils/feed.ts`): feed readers need absolute URLs, so feeds keep the original R2 links.
- **`og:image`** (`src/pages/[...slug].astro`): social sites fetch the original directly.
- **Webmention avatars** (`Interactions.astro`): third-party URLs.

## Build cache

Optimized images are cached in `node_modules/.astro/assets/`, which Cloudflare Pages keeps between builds. The first build after a cache reset processes every image and is slow; later builds only process new images.

Remote images are revalidated when their cached copy expires, based on the `Cache-Control` header R2 sends. Serving R2 objects with a long `max-age` (they are never changed in place) lets builds reuse cached images without a request.

If an image listed in the manifest is deleted from R2 and its cached copy has expired, the build fails with a "could not download" error. Remove the reference from content, or delete its manifest entry.

## Troubleshooting

- **Image shows the raw R2 URL instead of `/_astro/...`:** it is missing from the manifest. Run `npm run cache-image-dimensions` with network access and check the output.
- **Image looks blurry:** the slot is wider than `maxWidth / 2`. Raise `maxWidth` on that `RemoteImage`.
- **Page downloads a much larger file than it displays:** the `sizes` value is too generous for that slot.
