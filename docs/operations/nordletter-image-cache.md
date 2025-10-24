# Nordletter Image Caching Pipeline

This guide documents how Nordletter cover images are cached at build time and rendered through Astro's image pipeline. Follow the same pattern to optimize other content families that still rely on remote, oversized assets.

## Directory Layout

- Cached thumbnails live under `src/images/nordletter/`. The directory is ignored in Git except for the placeholder `.gitignore`, so images are regenerated on demand rather than committed.【F:scripts/cache-nordletter-images.js†L6-L8】【F:src/images/nordletter/.gitignore†L1-L2】
- `src/data/nordletter-image-manifest.json` stores a slug→filename lookup that the component layer uses to locate the downloaded asset at render time.【F:scripts/cache-nordletter-images.js†L6-L8】【F:src/data/nordletter-image-manifest.json†L1-L1】

## Build-Time Fetching

`scripts/cache-nordletter-images.js` runs before both `astro dev` and `astro build`. It discovers every Nordletter entry, downloads the referenced hero image if a local copy is missing, and keeps the manifest in sync.【F:package.json†L11-L19】【F:scripts/cache-nordletter-images.js†L90-L148】

High-level flow:

1. **Discovery** – Walk every Markdown file in `src/content` and select entries where `category: nordletter` is set.【F:scripts/cache-nordletter-images.js†L95-L104】
2. **Slug resolution** – Use the frontmatter `slug` when present; otherwise fall back to a sanitized version of the title or filename so cached files stay stable between runs.【F:scripts/cache-nordletter-images.js†L10-L17】【F:scripts/cache-nordletter-images.js†L106-L109】
3. **Download & dedupe** – Derive an extension from the remote URL, stream the image once per slug, and skip work if the local copy already exists.【F:scripts/cache-nordletter-images.js†L32-L55】【F:scripts/cache-nordletter-images.js†L122-L138】
4. **Manifest hygiene** – Remove entries for posts that no longer specify an image or have been deleted, then prune any orphaned files on disk.【F:scripts/cache-nordletter-images.js†L141-L148】

If the fetch step fails for a given slug, the script drops the manifest entry so the UI can safely fall back to the remote URL during rendering.【F:scripts/cache-nordletter-images.js†L132-L138】

To execute manually (for example, after editing frontmatter in an editor that doesn't run npm scripts automatically):

```bash
npm run cache-nordletter-images
```

## Runtime Rendering

`NordletterGrid.astro` eagerly imports every cached asset through `import.meta.glob`, matches entries by filename using the manifest, and renders them via Astro's `<Image>` component. Issues without a cached image continue to use the original remote URL, ensuring graceful degradation.【F:src/components/NordletterGrid.astro†L1-L118】

Because the `<Image>` component knows the intrinsic width and height (384×384), the grid avoids layout shifts and emits responsive formats during the build. Explicit `loading="lazy"`, `decoding="async"`, and `sizes` hints keep the archive snappy even when dozens of thumbnails appear on the page.【F:src/components/NordletterGrid.astro†L94-L103】

## Extending the Pattern

To reuse this pipeline for another collection:

1. Duplicate the script under a new name and adjust the category filter plus target directory.
2. Add a matching manifest file and update the relevant UI component to glob the new directory.
3. Wire the script into the appropriate npm lifecycle commands (dev, build, or both) so assets exist before Astro renders.
4. Document the new workflow in `docs/operations/` so future contributors know where cached assets originate.

Keeping the fetch logic at build time centralizes performance control: you can regenerate thumbnails with better formats, swap to a proxy, or add transforms (e.g., `sharp` resizing) without touching individual posts.
