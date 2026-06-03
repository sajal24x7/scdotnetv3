# Build Audit & Astro Updates

_Audit date: 2026-06-03_

## Build Status

Build succeeded — 4,353 pages built in 45.68s, Pagefind indexed 1,630 pages.

**Known issue (non-blocking):** The `cache-nordletter-images` pre-build script hits 403 Forbidden errors for every image from `storage.sajalchoudhary.net`. The build continues past it. Worth checking if storage bucket permissions have changed.

---

## Package Updates

### Minor updates — safe, within semver range (`npm update`)

- [x] `astro` 5.16.6 → 5.18.2
- [x] `@astrojs/mdx` 4.3.13 → 4.3.14
- [x] `@astrojs/rss` 4.0.14 → 4.0.18
- [x] `@astrojs/sitemap` 3.6.0 → 3.7.3
- [x] `@rollup/rollup-linux-x64-gnu` 4.45.1 → 4.61.0
- [x] `@tailwindcss/typography` 0.5.16 → 0.5.19
- [x] `typescript` 5.8.3 → 5.9.3
- [x] `glob` 11.0.3 → 11.1.0
- [x] `js-yaml` 4.1.1 → 4.2.0
- [x] `sanitize-html` 2.17.0 → 2.17.4
- [x] `sax` 1.4.1 → 1.6.0

### Major version upgrades — breaking changes, plan separately

- [ ] `astro` 5.x → **6.4.3**
- [ ] `@astrojs/mdx` 4.x → **6.0.1** (must track Astro major)
- [ ] `@astrojs/check` 0.4.1 → **0.9.9**
- [ ] `tailwindcss` 3.x → **4.3.0** (completely rewritten CSS engine; drops `@astrojs/tailwind` integration)
- [ ] `date-fns` 2.x → **4.4.0** (ESM-first, many API changes)
- [ ] `marked` 15.x → **18.0.4**
- [ ] `zod` 3.x → **4.4.3** (breaking schema API changes)
- [ ] `typescript` 5.x → **6.0.3** (new strictness defaults)
- [ ] `glob` 11.x → **13.0.6**

---

## Astro Features To Adopt

### Easy wins

- [x] **Re-enable `@astrojs/sitemap`** — Uncommented in `astro.config.mjs`; `sitemap-index.xml` + `sitemap-0.xml` confirmed in build output.
- [x] **Dual Shiki themes (light/dark)** — Replaced single `github-dark` with `themes: { light: 'github-light', dark: 'github-dark' }`; syncs with the existing `prefers-color-scheme` dark mode class in `Layout.astro`.

### Experimental (Astro 5.x, stable in Astro 6)

- [ ] **Responsive Images** (`experimental.responsiveImages`) — Auto-generates `srcset` for all `<Image>` components. High value given the dense bookshelf/filmshelf cover image grids.
- [ ] **Font optimization** (`experimental.fonts`) — Introduced in Astro 5.7. Handles subsetting, preloading, and fallback font metrics automatically.
- [ ] **SVG component imports** (`experimental.svg`) — `src/assets/astro.svg` and `background.svg` could be used as Astro components with prop support.

### Bigger migrations (Astro 6)

- [ ] **Tailwind v4 + native Vite plugin** — Astro 6 drops `@astrojs/tailwind` in favour of Tailwind v4's Vite plugin. CSS-native config replaces `tailwind.config.mjs`. Largest migration effort.
