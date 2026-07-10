# Search Page

Search is implemented as a single page, `src/pages/search.astro`, backed by
[Pagefind](https://pagefind.app/), a static search index generated at build
time. There is no separate search modal, JSON index endpoint, or custom
element — the whole experience lives in one inline script.

## Index Generation

- Pagefind runs as a post-build step (`pagefind --site dist`, see the `build`
  script in `package.json`) and crawls the built HTML output, indexing any
  page with a `data-pagefind-body` element.
- The generated index is written to `dist/pagefind/` and served statically;
  there is no Astro endpoint involved in producing it.

## Page Behavior

- `src/pages/search.astro` renders a search input, a list of popular tags
  (computed server-side from `getAllPosts()`), and a results container.
- An inline `<script>` lazily imports `/pagefind/pagefind.js` on first use
  (and pre-loads it in the background via `requestIdleCallback`/`setTimeout`
  so the first keystroke doesn't pay the import cost).
- Queries are debounced (200ms) and reflected into the URL as `?q=`, so
  results are linkable and survive a page reload.
- A `tag:<name>` prefix filters by the `tag` Pagefind filter instead of doing
  a full-text search; popular tag links on the page link to
  `/search?q=tag:<name>`.
- Results are capped at 50 rendered items and show title, category, a
  highlighted excerpt, and up to 5 tag chips per result.

## Extending Search

| Goal | Suggested Changes |
| --- | --- |
| Change what's indexed | Adjust which elements carry `data-pagefind-body` / `data-pagefind-ignore` in the relevant layout, not `search.astro` itself. |
| Change result rendering | Edit the `performSearch()` template-building code in `src/pages/search.astro`. |
| Add filters beyond `tag:` | Add a new Pagefind filter attribute on the indexed markup, then branch on a new prefix alongside the existing `tag:` handling. |

## Accessibility Notes

- The input auto-focuses when there's no initial query, and the popular-tags
  hint list is hidden as soon as a query is present, so the results container
  is the primary landmark once a search starts.
- Result links are ordinary anchors (no custom keyboard handling), so native
  tab/Enter behavior applies.
