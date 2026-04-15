# Performance Improvements Backlog

Prioritised list of changes to keep the site fast as content volume grows
from the current ~1,600 posts toward an estimated 5,000–10,000 posts.

---

## Priority 1 — Do these now (affects users today)

### 1.1 Pagination on category index pages

**Problem:** Every category index page (`/blog`, `/til`, `/stream`, `/micro`, etc.)
loads the entire category into a single HTML page. At 500+ posts per category this
means large HTML payloads, slow initial render, and poor SEO.

**Affected files:**
- `src/pages/blog/index.astro`
- `src/pages/stream/index.astro`
- `src/pages/til/index.astro`
- `src/pages/micro/index.astro`
- all other category index pages

**How to fix:** Use Astro's built-in `paginate()` helper.

```astro
---
// src/pages/blog/[page].astro
export async function getStaticPaths({ paginate }) {
  const allPosts = await getAllPosts();
  const blogPosts = getPostsByCategory(allPosts, 'blog');
  return paginate(blogPosts, { pageSize: 24 });
}

const { page } = Astro.props;
---
```

Rename `index.astro` → `[page].astro` and add a redirect from `/blog/` → `/blog/1/`.
The `page` prop gives you `page.data` (current slice), `page.url.prev`, `page.url.next`
for navigation links.

**Target page size:** 20–30 posts.

---

### 1.2 Bookshelf client-side filtering → server-side

**Problem:** `src/pages/bookshelf/index.astro` sends every book's metadata as HTML
data attributes so the client-side JS filter can work. At 155 books this is already
a few hundred KB; at 500+ it becomes a real memory burden on mobile.

**How to fix:** Create filter pages statically:
```
/bookshelf/              → all books (paginated)
/bookshelf/reading/      → status=reading
/bookshelf/read/         → status=read
/bookshelf/genre/[genre] → by genre
```

Each is a static page built at compile time — no client-side filtering needed.
Keep the JavaScript filter as a progressive enhancement for in-page search only.

---

## Priority 2 — Do before 3,000 posts

### 2.1 Pre-compute and cache the tag index

**Problem:** `src/utils/tagPages.ts` rebuilds the full tag index from scratch on every
build by iterating all posts × all tags. There is no persistent cache for it, unlike
backlinks.

**Current cost:** O(n × m) where n = posts (~1,600), m = avg tags per post (~4).
At 5,000 posts with 4 tags each: 20,000 tag assignments processed every build.

**How to fix:** Apply the same caching strategy already used for backlinks:

1. After building the tag index, write it to `src/data/tag-index.json`.
2. On subsequent builds, compare a file manifest (identical to the backlinks approach
   in `src/utils/backlinks.ts:104–137`).
3. Only regenerate when files are added, removed, or renamed.

```ts
// src/utils/tagIndex.ts
const CACHE_FILE = path.join(DATA_DIRECTORY, 'tag-index.json');

async function buildAndCacheTagIndex(): Promise<TagIndex> {
  // ... build index ...
  await writeTagIndexArtifact(index);
  return index;
}
```

Add `REGENERATE_TAGS=true` env var to force a full rebuild (same pattern as
`REGENERATE_BACKLINKS`).

---

### 2.2 Lazy category loading in `getAllPosts()`

**Problem:** `src/utils/content.ts:getAllPosts()` loads all categories in parallel on
the first call, then caches the full result for the build. Every page that needs only
`til` posts still triggers a load of all 14 categories.

**How to fix:** Add a per-category cache alongside the all-posts cache:

```ts
const categoryCache = new Map<string, Post[]>();

export async function getPostsByCollectionCategory(category: string): Promise<Post[]> {
  if (categoryCache.has(category)) return categoryCache.get(category)!;
  const posts = await getCollection(category as any);
  const mapped = posts.map(normalisePost);
  categoryCache.set(category, mapped);
  return mapped;
}
```

Pages that only need one category (e.g. `/til`) can call this directly instead of
`getAllPosts()` + filter, halving the data loaded for those pages.

---

## Priority 3 — Do before 5,000 posts

### 3.1 Build time monitoring

**Problem:** There is no visibility into build time growth. By the time builds feel
slow, the cause is already baked in.

**How to fix:** Wrap the build command in `package.json` to emit timing:

```json
"build": "node -e \"console.log('Build started:', new Date().toISOString())\" && npm run cache-nordletter-images && npm run generate-covers && npm run fetch-webmentions && astro build && node -e \"console.log('Build finished:', new Date().toISOString())\""
```

Or add a dedicated script:

```js
// scripts/build-with-timing.mjs
const start = Date.now();
// ... spawn astro build ...
console.log(`Build completed in ${((Date.now() - start) / 1000).toFixed(1)}s`);
```

Set a CI budget: fail the build if it exceeds 120 seconds. This gives early warning
before the problem is noticeable in local dev.

---

### 3.2 Parallelize pre-build scripts

**Problem:** `package.json` runs pre-build steps sequentially:
```
cache-nordletter-images → generate-covers → fetch-webmentions → astro build
```

The first three are independent and could run in parallel.

**How to fix:**
```json
"prebuild": "npm run cache-nordletter-images & npm run generate-covers & npm run fetch-webmentions & wait"
```

Or use `npm-run-all` (already a common dev dependency) with `--parallel`:
```json
"prebuild": "npm-run-all --parallel cache-nordletter-images generate-covers fetch-webmentions"
```

---

### 3.3 Search index size management

**Problem:** `src/pages/search-index.json.ts` generates a full JSON index of all posts.
At 1,600 posts this is ~200–300 KB. At 10,000 posts it will exceed 1.5 MB, which
hurts time-to-interactive on slower connections.

**How to fix (pick one):**

**Option A — Trim fields:** Only include `slug`, `title`, and `tags` in the search index.
Strip `description` and `body` previews. This keeps the index under 500 KB even at 10,000 posts.

**Option B — Split by category:** Generate separate search indexes per category
(`/search-index-til.json`, etc.) and only load the relevant one when the user is
browsing a specific section.

**Option C — Switch to a proper search backend:** Pagefind (zero-config, runs at build
time, ships its own index format) or Fuse.js with a lazy-loaded index are both
good fits for Astro static sites.

---

### 3.4 Sitemap

`astro.config.mjs` has the sitemap integration commented out (line 5). Re-enable it
before the site grows further — search engines use it to discover and prioritise new
content, and it becomes harder to backfill the SEO debt as post count grows.

```js
import sitemap from '@astrojs/sitemap';

// in integrations:
sitemap(),
```

---

## Reference: Risk matrix

| Component | ~1,600 files | ~5,000 files | ~10,000 files |
|---|---|---|---|
| Content schema validation | Fast | Fast | Fast |
| `getStaticPaths()` | Fast | 2–5 s | 4–10 s |
| `getAllPosts()` (cached) | Fast | Fast | Fast |
| Tag index rebuild | 1–2 s | 3–5 s | 5–10 s |
| Category index pages | Acceptable | Slow | Very slow |
| Bookshelf client filter | 2–3 MB | 10–15 MB | 30–50 MB |
| Search index JSON | ~250 KB | ~750 KB | ~1.5 MB |
| Backlinks cache | 2–3 s | 4–5 s | 6–8 s |
| Build time (total) | ~30 s | ~90 s | ~180 s |
