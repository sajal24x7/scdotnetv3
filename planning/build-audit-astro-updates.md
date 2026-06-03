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

## Astro 6 Upgrade Plan

**Target version:** `astro@6.4.3` (latest as of 2026-06-03, released June 2)

### Pre-Upgrade: Required Changes

These must be done before or alongside the version bump — the build will fail or behave incorrectly if skipped.

#### 1. Move content collection config file (BREAKING)

Astro 6 ends the Astro 5 grace period: `src/content/config.ts` must move to `src/content.config.ts` at the **src root**.

```
mv src/content/config.ts src/content.config.ts
```

Update the import path from `astro/loaders` — the glob pattern `base` paths (`./src/content/blog`, etc.) remain unchanged. All `getCollection()` calls are unaffected.

#### 2. Switch Tailwind integration (BREAKING)

`@astrojs/tailwind` is deprecated for Tailwind v4 and must be replaced with the official `@tailwindcss/vite` Vite plugin. Astro 6 itself still ships with `@astrojs/tailwind` as a compatibility shim, but the real migration is to Tailwind v4.

Steps:
1. `npm uninstall @astrojs/tailwind tailwindcss`
2. `npm install tailwindcss@4 @tailwindcss/vite @tailwindcss/typography`
3. In `astro.config.mjs`: remove `tailwind()` from `integrations`, add `@tailwindcss/vite` to `vite.plugins`
4. Migrate config: Tailwind v4 uses a CSS-native config (`@import "tailwindcss"` in the main CSS file) rather than `tailwind.config.mjs`. Content paths, theme extensions, and plugin setup all move into CSS.
5. `@tailwindcss/typography` syntax changes — prose classes are the same but some v3 config API differs.

This is the largest migration effort. Do it as its own PR.

#### 3. Update Node.js engines constraint

Astro 6 requires Node.js ≥ 22.12.0. The environment is already on v22.22.2, but `package.json` still declares `"node": ">=20.0.0"`. Update to `"node": ">=22.12.0"`.

#### 4. Upgrade companion integrations alongside Astro

These packages must track the Astro major version:

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| `@astrojs/mdx` | 4.x | **6.0.1** | Must match Astro major |
| `@astrojs/check` | 0.4.1 | **0.9.9** | Type-checking CLI |
| `@astrojs/rss` | 4.x | verify compat | Likely fine, check changelog |
| `@astrojs/sitemap` | 3.x | verify compat | Likely fine, check changelog |

---

### What Will Break

#### Likely to break

| Issue | Where | Severity |
|-------|-------|----------|
| Content config not found | `src/content/config.ts` | 🔴 Build fails until moved |
| Tailwind styles missing | `astro.config.mjs`, all CSS | 🔴 Visual regression until migrated |
| Heading anchor IDs changed | Markdown heading ID algorithm updated | 🟡 Deep links in prose/garden content may 404 |
| Shiki v4 API changes | `astro.config.mjs` `shikiConfig` | 🟡 Verify `themes: { light, dark }` still works — likely fine |
| `remarkPlugins` deprecation warning | `astro.config.mjs` | 🟢 Still works; removed in Astro 8 |

#### Probably fine (verify after upgrade)

- `getCollection()`, `render()`, `CollectionEntry` — stable, no API changes in v6
- `getStaticPaths()` in 6 dynamic route pages — stable
- `Astro.props`, `Astro.params`, `Astro.url`, `Astro.site` — stable
- `set:html` directive — stable
- `is:inline` scripts — stable
- `APIRoute` type in `src/pages/api/` — stable
- `<Image>` from `astro:assets` — stable; SVG rasterization behavior changed in 6.3 (only affects `<Image src="file.svg">` optimization pipeline, not SVG component imports)
- RSS feeds — `@astrojs/rss` 4.x should remain compatible

#### Not applicable to this project

- i18n routing default change — not using i18n
- Cloudflare adapter `Astro.locals.runtime` change — not using SSR
- `astro.config.cjs` dropped — already using `.mjs`
- Client directives (`client:load`, etc.) — no interactive islands

#### Bonus: Nordletter image 403s (Astro 6.3+)

Astro 6.3 now follows up to 10 redirects when fetching remote images. The known pre-build 403 errors from `storage.sajalchoudhary.net` are likely a storage bucket permission issue, not redirects — but worth re-testing after upgrade to see if the new redirect-following behaviour changes anything.

---

## Astro Features To Adopt

### Easy wins

- [x] **Re-enable `@astrojs/sitemap`** — Uncommented in `astro.config.mjs`; `sitemap-index.xml` + `sitemap-0.xml` confirmed in build output.
- [x] **Dual Shiki themes (light/dark)** — Replaced single `github-dark` with `themes: { light: 'github-light', dark: 'github-dark' }`; syncs with the existing `prefers-color-scheme` dark mode class in `Layout.astro`.

### Now stable in Astro 6 (were experimental in 5.x)

- [ ] **Responsive Images** — No longer behind `experimental.responsiveImages`. Call `<Image layout="responsive">` (or set a global default in config). Generates `srcset` at build time using CSS classes + `data-*` attributes, CSP-safe. High value for the bookshelf/filmshelf cover grids and any `<Image>` in content.

- [ ] **Fonts API** — No longer behind `experimental.fonts`. Configure Google Fonts, Fontsource, or local font files directly in `astro.config.mjs`. Astro downloads and self-hosts them, generates optimised CSS `@font-face` fallbacks, and injects `<link rel="preload">` automatically. Replaces any manual `@font-face` or Google Fonts `<link>` tags in `Layout.astro`.

- [ ] **SVG component imports** — No longer behind `experimental.svg`. Any `.svg` file can be imported as an Astro component and rendered with props (e.g. `width`, `height`, `class`). Relevant if any icons or illustrations are currently inlined manually.

### New in Astro 6.0

- [ ] **Built-in Content Security Policy (CSP) API** — `security.checkOrigin` exists already but Astro 6 adds a full CSP header generation API. Can define allowed script/style sources in config and Astro injects the correct `<meta http-equiv="Content-Security-Policy">` or response headers. Worth evaluating alongside the Tailwind v4 migration (Tailwind v4 generates hashed styles that play well with strict CSP).

- [ ] **Live Content Collections** — External content (APIs, databases, headless CMSes) can now be connected via the Astro content layer using a remote loader. Not immediately needed, but relevant if Nordletter content ever moves to an external source.

### New in Astro 6.3

- [ ] **Image redirect following** — `<Image>` now follows up to 10 HTTP redirects when optimising remote images. Relevant to the `cache-nordletter-images` CDN fetch issue; re-test after upgrade.

- [ ] **Advanced routing (experimental)** — Hono-based request routing with middleware support. Not needed now but available if server-side logic grows.

### New in Astro 6.4

- [ ] **Pluggable Markdown processor** — New `@astrojs/markdown-satteri` package offers a Rust-based Markdown/MDX pipeline (Sätteri) that is significantly faster than the default unified pipeline. Opt-in; current setup stays on unified by default. Worth benchmarking against the 45s build time given the 4,353-page output. **Note:** The existing top-level `markdown.remarkPlugins` (including the custom `remarkBreaks`) keeps working but is now deprecated — plan to migrate `remarkBreaks` to the `unified({ remarkPlugins: [remarkBreaks] })` form before Astro 8.

### Bigger migrations (Astro 6)

- [ ] **Tailwind v4 + native Vite plugin** — See pre-upgrade step 2 above. CSS-native config replaces `tailwind.config.mjs`. Largest migration effort — do as its own PR after the core Astro upgrade lands.

### Experimental in Astro 6 (not yet stable)

- [ ] **Rust compiler** — Successor to the Go-based `.astro` compiler. Opt-in via `experimental.rustCompiler`. Faster builds and reportedly more reliable than the Go version in some edge cases. Worth testing but not production-ready yet.
