# 04 — Performance (P1–P2)

Measured on a full local build (2026-07-07): 4,463 HTML pages, `dist/` = **454 MB**, of
which `dist/tags/` = **221 MB** (2,765 pages) and `dist/_astro/` = 98 MB (mostly
responsive image variants, which are fine).

## 4.1 Self-host the web fonts (do after/instead of brief 01 §1.1) — ✅ done

Already complete as of this audit pass (2026-07-10). `global.css` imports
`@fontsource-variable/inter` and `@fontsource-variable/fraunces` directly (the serif was
swapped from Merriweather to Fraunces along the way, not just self-hosted). No
`fonts.googleapis.com`/`gstatic.com` references, no `preconnect` to Google Fonts, and no
leftover `Merriweather` references anywhere in `src/`. Verified via grep across the repo.

Google Fonts adds two extra origins and a render-blocking stylesheet on every page — and
is currently broken anyway (brief 01). Self-hosting removes the third-party dependency and
the FOUT window.

**Steps:**

1. `npm install @fontsource-variable/inter @fontsource-variable/merriweather`
2. In `src/styles/global.css`, at the very top (before `@import "tailwindcss"`):

```css
@import '@fontsource-variable/inter';
@import '@fontsource-variable/merriweather';
```

3. Delete from `src/layouts/Layout.astro`: the two `preconnect` links and the
   `fonts.googleapis.com` stylesheet link. Same in `src/pages/games/cards-29/index.astro`
   (that page imports `global.css` already, so it needs no replacement).
4. Font-family names: Fontsource variable fonts register as `'Inter Variable'` and
   `'Merriweather Variable'`. `global.css` already lists `'Inter Variable', 'Inter', ...`
   for sans — good. The serif stack (`--font-serif` and the heading rule, ~lines 12/134)
   lists only `'Merriweather'`; add `'Merriweather Variable'` in front:

```css
--font-serif: 'Merriweather Variable', 'Merriweather', ui-serif, Georgia, serif;
```

   (Also update the literal `font-family: 'Merriweather', ...` in the `h1..h6` rule and in
   `UnifiedFeed.astro`'s `.feed-entry__verse`.)

**Verify:** build; Network tab shows same-origin `/_astro/*.woff2` requests, zero requests
to `fonts.googleapis.com`/`gstatic.com`; headings render in Merriweather.

## 4.2 Background randomizer: eliminate the flash, keep the feature — ✅ done (2026-07-10)

Implemented as specified, with one deviation: used separate `--color-bg-1`/`--color-bg-2`
custom properties instead of reusing `--color-bg`, since `--color-bg` is also consumed
elsewhere (`.skip-link` text color, unused `--color-bgLight`/`--color-bgDark` tokens) and
those shouldn't track the random per-session palette. Both scripts merged into one
`is:inline` block in `Layout.astro`, gradient + noise-texture overlay moved into
`global.css` (`body` / `.dark body` rules), `public/bg-color-randomizer.js` deleted.
Verified with Playwright: no request to the old script, `--color-bg-1/2` set before first
paint, values stable across in-tab navigation (sessionStorage), body renders the gradient
purely from CSS.

**File:** `public/bg-color-randomizer.js`, loaded from `Layout.astro` head as a blocking
external script but internally waiting for `DOMContentLoaded`.

Problems:
- Page paints with the default `--color-bg` first; the random gradient lands after
  DOMContentLoaded → visible flash on *every* navigation.
- A new random color per page makes navigation feel like changing sites.
- It's an extra render-blocking request in `<head>`.

**Fix (keeps random-per-session, stable within session):**

1. Move the logic inline into `Layout.astro` as a small `is:inline` script in `<head>`
   (merge with the existing theme script), and set **only CSS custom properties** on
   `document.documentElement` — no waiting for the body:

```js
// pick once per browser session
let pick = sessionStorage.getItem('bg-pick');
if (pick === null) {
    pick = String(Math.floor(Math.random() * LIGHT_COLORS.length));
    sessionStorage.setItem('bg-pick', pick);
}
const isDark = document.documentElement.classList.contains('dark');
const palette = isDark ? DARK_COLORS : LIGHT_COLORS;
document.documentElement.style.setProperty('--color-bg', palette[Number(pick)]);
```

2. Express the gradient in CSS instead of writing `body.style.background` from JS: in
   `global.css`, define `body { background: linear-gradient(135deg, rgba(var(--color-bg),1), rgba(var(--color-bg-2),0.9)); }`
   and have the script set `--color-bg` and `--color-bg-2`. Port the second-color pick and
   the dark palette mapping from the current file.
3. Delete `public/bg-color-randomizer.js` and its `<script src>` from `Layout.astro`, and
   remove the now-redundant `<script is:inline src="/bg-color-randomizer.js">` reference.
4. Keep the `prefers-color-scheme` change listener (swap palettes when theme flips) —
   fold it into the same inline script. If brief 08 adds a manual theme toggle, that
   toggle must re-run this palette swap.

**Verify:** hard-reload any page with DevTools → Performance → screenshots: first paint
already has the tinted background; navigating between pages keeps the same color within a
tab; opening a new tab may differ.

## 4.3 Post hero images bypass the image pipeline — ✅ done (2026-07-10, simplest path)

Checked frontmatter across all content: every `image` value in the collection is a remote
`http(s)://` URL — 100%, none local — and a large share point at
`storage.sajalchoudhary.net`, the same host the build log already flags for persistent
403s when Astro's remote-image optimizer tries to fetch it (see "Known issue" in
`build-audit-astro-updates.md`). Routing ~150+ posts' hero images through `astro:assets`
`<Image>`/`inferRemoteSize` would very likely hit that same failure mode at build time, so
took the brief's explicit fallback instead: dropped the hard-coded `width="1200"
height="630"` (which asserted a pixel size no actual source image has) and replaced it
with a real CSS `aspect-[1200/630]` utility on the `<img>`, preserving the exact same
rendered box/crop behavior via `object-cover` without lying about intrinsic dimensions.
Verified with Playwright: the rendered box now reports `aspect-ratio: 1200 / 630` as a
CSS property (not a false HTML attribute), same visual size as before.

**File:** `src/components/layout/PostLayout.astro` (~line 219): non-shelf hero images use
a raw `<img src={heroImage} width="1200" height="630">` with hard-coded (usually wrong)
dimensions, so no responsive variants, no format conversion, and possible CLS.

**Fix:** frontmatter `image` values are strings (often remote URLs), so use Astro's
`inferRemoteSize`/`Image` for remote images, or simplest: keep `<img>` but drop the fake
`width`/`height` and add `style="aspect-ratio: auto"` — **only if** most values are
remote. Preferred path: pass local hero images through `astro:assets` `<Image>` the same
way shelf covers already do (`getBookCoverImage` pattern) and fall back to plain `<img>`
for `http(s)://` values. Keep `loading="lazy" decoding="async"`.

## 4.4 Tag-page explosion: 2,765 pages, 221 MB (62 % of the site) — ✅ done (2026-07-10, different approach)

Investigated before implementing the ≥3-post threshold below and found the per-category
slice pages (`/tags/[tag]/[category]/`) have exactly one consumer in the whole codebase:
the tab nav on `/tags/[tag]/` itself. The in-page "click a tag to filter" feature on
category landing pages (`/blog/`, `/stream/`, etc.) is a fully separate, already-client-side
filter (`SectionLanding.astro` + `tag-list-island.js`) that never navigates to these routes.

Given that, rather than raise the survival bar to `count >= 3`, the category-slice route
(`src/pages/tags/[tag]/[category].astro`) was deleted outright and replaced with a
same-page client-side filter on `/tags/[tag]/` (category chips as buttons that toggle
`data-filtered` on already-rendered `[data-content-item]`s, matched via each post's
`data-category` attribute — mirrors the `SectionLanding` filter pattern). `TagCategorySlice`
in `src/utils/tagPages.ts` dropped its per-slice `transformedPosts` field since filtering no
longer needs a separate rendered list per slice.

Also fixed: the dead `?category=` handler on `/tags/index.astro` was still building hrefs to
`/tags/{tag}/{category}/`; repointed those to `/tags/{tag}/` so it can't produce 404s if ever
triggered (nothing currently links to it with that query param).

Result: build page count dropped from 4,463 → **2,546** (all 1,936 slice pages gone, tag
index pages unchanged). Verified zero `/tags/{tag}/{category}/`-shaped hrefs anywhere in
`dist/`, and the new in-page filter tested end-to-end with Playwright (clicking a category
chip correctly shows/hides posts and updates the count text).

<details>
<summary>Original brief text (superseded)</summary>



**Files:** `src/pages/tags/[tag]/index.astro`, `src/pages/tags/[tag]/[category].astro`,
`src/utils/tagPages.ts`.

Every tag gets a page *plus one page per category slice* (`/tags/sony/`,
`/tags/sony/blog/`, `/tags/sony/stream/`, `/tags/sony/micro/`, …), each ~60–80 KB.
Most tags have one or two posts. Costs: build time, 221 MB of deploy weight (Cloudflare
Pages uploads changed files each deploy), and thin-content crawl bloat.

**Fix in two steps (both in `getStaticPaths`/`tagPages.ts`):**

1. **Drop per-category tag pages for small slices.** In
   `src/pages/tags/[tag]/[category].astro`'s `getStaticPaths`, only emit a
   `(tag, category)` page when that slice has **≥ 3 posts**. Update the links/chips that
   point to category slices (`TagDetailPage.astro` / tag chip components) to only link to
   slices that exist — the slice data (`categorySlices` with `count`) is already available
   where links are rendered; filter on the same `count >= 3` threshold.
2. **Keep `/tags/[tag]/` for every tag** (so no chip 404s), but if the total count is 1,
   consider `index=false` meta (needs brief 02's `index` prop) instead of dropping the page.

Expected result: tag pages drop from ~2,765 to a few hundred; `dist/` shrinks by
~150–200 MB. **Guardrail:** after building, crawl for broken tag links:

```bash
npm run build
# every tag link in built HTML must resolve to a built file:
grep -rhoE 'href="/tags/[^"]+"' dist --include='*.html' | sort -u | sed 's/href="//;s/"$//' \
  | while read -r p; do [ -f "dist${p}index.html" ] || echo "MISSING $p"; done | sort -u | head
```

Empty output = no broken links.

</details>

## 4.5 Small head cleanups — ✅ done (2026-07-10)

- Removed the `<link rel="preload" href="/logo/logo-square-v2.svg" as="image" />` from
  `Layout.astro`.
- Theme + background scripts merged into one inline script (see 4.2).

## Verification (whole brief)

```bash
npm run build
du -sh dist dist/tags
find dist -name '*.html' | wc -l
```

Targets: `dist/tags` well under 80 MB; total pages under ~2,500; no
`fonts.googleapis.com` references (`grep -rl fonts.googleapis dist --include='*.html' | wc -l` → 0);
Lighthouse performance run on `/` and one post page before/after, scores recorded in PR.
