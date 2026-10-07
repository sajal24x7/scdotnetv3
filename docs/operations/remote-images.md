# Remote Image Optimization

Post and newsletter images live in the R2 bucket behind `storage.sajalchoudhary.net`. Astro downloads, resizes and converts them to WebP at build time, and caches the results so later builds skip the work.

## What gets optimized

| Where | How | Output |
| --- | --- | --- |
| Images in Markdown post bodies | `src/utils/rehypeRemoteImages.ts` (rehype plugin in `astro.config.mjs`), then Astro's built-in Markdown image step | 750w + 1500w WebP `srcset`, capped at the original width |
| Post hero and photo galleries | `getContentImageAttributes()` in `PostHero.astro`, `PhotoCarousel.astro`, `PhotoPostLayout.astro` | Same as Markdown images |
| Nordletter grid thumbnails | `getSquareImageAttributes()` in `NordletterGrid.astro` | 192w + 384w square WebP, center cropped |
| Nordletter cards in the home feed | `getContentImageAttributes()` in `src/utils/feed.ts` | Same as Markdown images |

Only hosts listed in `REMOTE_IMAGE_DOMAINS` (`src/utils/imageDomains.ts`) are optimized. That list also feeds `image.domains` in `astro.config.mjs`. Images on any other host render as plain `<img>` tags with their original URL.

## Caching

All caches live under `node_modules/.astro/`, which the Cloudflare Pages build cache keeps between deploys:

- `assets/` holds every converted image (Astro's own cache). When an entry expires, Astro revalidates it with the stored ETag / Last-Modified, so an unchanged image costs one `304 Not Modified` request and is never downloaded again.
- `remote-image-sizes.json` holds each image's original width and height. Astro does not cache its size probe, so without this file every build would probe all R2 images over the network.
- `data-store.json` holds rendered Markdown, so unchanged posts are not re-rendered.

To avoid even the revalidation requests, serve R2 objects with a long `Cache-Control` header (for example `public, max-age=31536000, immutable`, set through a Cloudflare Response Header Transform Rule on `storage.sajalchoudhary.net`). Astro then treats cached images as fresh. Only do this if image URLs are never overwritten with different content.

## Failure behavior

Each image's size is probed (once, then cached) before Astro queues it for download. If the probe fails, the image keeps its original R2 URL and the build logs a `[images]` warning instead of failing. Watch for these warnings in the Cloudflare build log; they usually mean a broken image link.

The rendered HTML of a post is cached in `data-store.json`, so a post rendered during an R2 outage keeps its plain `<img>` until the post or the Astro config changes.

## Cost

The first build with an empty cache downloads and converts every R2 image once. Later builds only process new or changed images. Clear the Cloudflare build cache to force a full rebuild.

## Adding another image host

Add the hostname to `REMOTE_IMAGE_DOMAINS` in `src/utils/imageDomains.ts`. Both Markdown and component images on that host are then optimized.
