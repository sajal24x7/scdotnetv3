# 01 — Critical bugs (P0)

Five independent fixes. Each is small; they can share one PR. All were verified broken
against a production build on 2026-07-07.

---

## 1.1 Web fonts never load (Google Fonts URL returns HTTP 400)

**Symptom:** No page on the site loads Inter or Merriweather. Headings silently fall back
to Georgia, body text to system-ui. Verified:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@8..144,100..900&family=Merriweather:opsz,wght@8..144,400;500;600;700&display=swap"
# → 400
```

**Cause:** The optical-size axis range `8..144` is invalid for both families. Inter's
`opsz` axis is `14..32`; Merriweather's variable release uses `opsz 18..144` with weights
`300..900` (the `400;500;600;700` weight list is also not valid syntax when combined with
an `opsz` range).

**Files:**
- `src/layouts/Layout.astro` (line ~84–87, the `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">`)
- `src/pages/games/cards-29/index.astro` (line ~16–19, its own copy of the Inter link)

**Fix:** Replace the stylesheet URL in `Layout.astro` with:

```
https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap
```

And in `games/cards-29/index.astro` with:

```
https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap
```

Both URLs verified to return 200 on 2026-07-07.

> Note: brief **04-performance.md §4.1** replaces Google Fonts entirely with self-hosted
> Fontsource packages. If you are doing brief 04 in the same sprint, skip this URL fix and
> go straight to self-hosting. Do NOT ship both.

**Verify:**
```bash
curl -s -o /dev/null -w "%{http_code}" "<new URL>"   # expect 200
npm run build && npm run preview
# open a page, DevTools → Network → filter "fonts" → woff2 files load;
# Computed style of an <h2> shows font-family Merriweather (rendered), not Georgia.
```

Expect a visible typography change site-wide once this lands — that is the intended design
finally rendering.

---

## 1.2 All RSS feeds ship items without `<pubDate>`

**Symptom:** `dist/rss.xml` (and all 20 per-section feeds) contain `<item>` elements with
no `<pubDate>`. Feed readers show items undated and may order them arbitrarily. Verified:

```bash
grep -c "<item>" dist/rss.xml    # 50
grep -c pubDate dist/rss.xml     # 0
```

**Cause:** Items are built with a `created:` key, but `@astrojs/rss` expects `pubDate`.
The Zod schema strips the unknown `created` key silently.

**Files:**
- `src/utils/rss.js` — `buildRssItem()` returns `created: item.data.created`
- `src/pages/rss.xml.js` — inlines the same object literal with `created:`

**Fix:** In both files, rename the item key `created` → `pubDate` (the value stays
`item.data.created`):

```js
return {
    link: `/${item.data.category}/${item.id}/`,
    title: item.data.title || 'Untitled',
    description: item.data.description || '',
    content,
    pubDate: item.data.created,   // was: created: item.data.created
    ...
};
```

All 20 per-section feeds (`src/pages/*/rss.xml.js`) call `buildRssItem` from
`src/utils/rss.js`, so fixing the util fixes them all. Only the site-wide
`src/pages/rss.xml.js` has its own copy.

*(Optional, recommended)*: while in `src/pages/rss.xml.js`, replace its hand-rolled item
mapping with `buildRssItem`/`rssNamespaces`/`sortByDate` from `src/utils/rss.js` — the
code is a byte-for-byte duplicate except for the 50-item limit, which you keep:
`items: await Promise.all(sortByDate(flatPosts).slice(0, 50).map(buildRssItem))`.

**Verify:**
```bash
npm run build
grep -c "<pubDate>" dist/rss.xml           # expect 50
grep -c "<pubDate>" dist/blog/rss.xml      # expect > 0
```

---

## 1.3 Search results render broken links and no styling (curly-quote bug)

**Symptom:** On `/search/`, every result card is unstyled and result links 404 (the URL
contains `%E2%80%9D`).

**Cause:** The client-side result template in `src/pages/search.astro` (lines ~195–210)
uses typographic curly quotes `”` instead of straight quotes `"` for **every** HTML
attribute in the concatenated string, e.g.:

```js
return '<article class=”border-b ...”>' + ... '<a href=”' + href + '” class=”...”>'
```

HTML treats `”` as part of an unquoted attribute value, so classes don't match and hrefs
become `”/blog/foo/”`.

**Fix:** In `src/pages/search.astro`, within the `<script>` block that builds result
markup (the `.map(function (d) { ... return '<article ...' })` section, roughly lines
190–212), replace every `”` with `\"` (escaped straight quote) — or rewrite the template
using template literals with straight quotes. Search the file for the character `”`; there
should be **zero** occurrences left in the script block when done (the visible copy text
elsewhere on the page may legitimately keep typographic quotes).

**Verify:**
```bash
grep -n '”' src/pages/search.astro   # only prose strings, none inside the results template
npm run build && npm run preview
# visit /search/, type a query: results are styled, clicking a result navigates correctly.
```

---

## 1.4 No 404 page

**Symptom:** `dist/404.html` does not exist; Cloudflare Pages serves its generic 404.

**Fix:** Create `src/pages/404.astro`. Cloudflare Pages automatically serves `404.html`
for unmatched routes on static sites. Keep it inside the site chrome:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout
    title="Page not found - Sajal Choudhary"
    description="This page doesn't exist (anymore)."
    currentPage="/404/"
    pageWrapper={{
        maxWidth: '4xl',
        padding: 'md',
        paddingScale: 'container',
        centered: true,
        grid: { gap: 'loose', padding: 'narrow' }
    }}
>
    <div class="grid-span-full py-16 text-center space-y-6">
        <p class="text-small uppercase tracking-wide text-gray-500 dark:text-gray-400">404</p>
        <h1 class="text-huge font-bold">This page doesn't exist</h1>
        <p class="text-normal text-gray-700 dark:text-gray-300">
            It may have moved, or the link may be wrong. Try one of these instead:
        </p>
        <nav class="flex flex-wrap justify-center gap-3" aria-label="Recovery links">
            <a href="/" class="tag-chip">Home</a>
            <a href="/search/" class="tag-chip">Search the site</a>
            <a href="/garden/" class="tag-chip">Garden</a>
            <a href="/stream/" class="tag-chip">Stream</a>
            <a href="/feeds/" class="tag-chip">RSS feeds</a>
        </nav>
    </div>
</Layout>
```

Adjust classes to match current conventions if they have drifted; the `tag-chip` class is
defined in `src/styles/global.css` and renders the site's pill links.

**Verify:**
```bash
npm run build && test -f dist/404.html && echo OK
# npm run preview → visit /this-page-does-not-exist → styled 404 within site chrome.
```

---

## 1.5 No robots.txt

**Symptom:** `dist/robots.txt` does not exist, and the sitemap
(`/sitemap-index.xml`, generated by `@astrojs/sitemap`) is never advertised to crawlers.

**Fix:** Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://sajalchoudhary.net/sitemap-index.xml
```

If the owner wants to block AI-training crawlers, that is a separate decision — leave the
file permissive by default and note the option in the PR description.

**Verify:**
```bash
npm run build && cat dist/robots.txt
```

---

## Acceptance checklist for this brief

- [ ] Font stylesheet URL(s) return 200; Merriweather actually renders (or fonts are self-hosted per brief 04)
- [ ] Every feed in `dist/**/rss.xml` has `<pubDate>` on every item
- [ ] `/search/` result cards styled, links work
- [ ] `dist/404.html` exists and uses site layout
- [ ] `dist/robots.txt` exists and points at the sitemap index
- [ ] `npm run build` completes with no new warnings
