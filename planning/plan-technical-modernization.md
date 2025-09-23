## Technical Modernization Plan

- Current Phase: P1 – Consolidation and DRY utilities
- Overall Progress: 0%
- Last Updated: run `npm run date` and replace this line per workspace rule

### Goals
- Remove duplication, centralize helpers, improve SEO/feeds/search/index, and keep JS footprint small.

### Tasks
- [x] P1.1 Consolidate layout shell
  - Retired the extra base layout file and folded required head/meta/theme logic into `Layout.astro`.
- [ ] P1.2 Centralize RSS generation
  - Create `src/utils/rss.ts` with a function `buildFeed({ title, description, site, items })` and sanitizer logic.
  - Update `rss.xml.js`, `stream/rss.xml.js`, `prose/rss.xml.js`, `garden/rss.xml.js`, `nordletter.xml.js` to use the helper.
- [ ] P1.3 Add `src/utils/categories.ts`
  - House `getCategoryUrl`, `getBucket`, constants for categories and buckets.
- [ ] P1.4 SEO improvements
  - Add canonical link tag, ensure `og:url` is a string URL, add JSON-LD on post pages.
  - Enable sitemap (integration exists in deps) and add `robots.txt` and a `404` page.
- [ ] P1.5 Search data index
  - Build-time `public/search-index.json` with: title, description, category, tags, pubDate, url.
  - Keep client-side search using existing modal; later optional MiniSearch/FlexSearch.
- [ ] P1.6 Year discovery everywhere
  - Replace any remaining hardcoded year arrays (see `Footer.astro`, `now.astro`).
- [ ] P1.7 Types quality pass
  - Strengthen `src/utils/content.ts` types; remove simple `any`s in transformations.
- [ ] P1.8 Performance
  - Evaluate `bg-color-randomizer.js` and `random-link-colors.js`; gate behind a flag or remove if not essential.
  - Preload only critical assets.

### Implementation Notes
- Keep routes and rendered HTML structure stable. Only add non-breaking head tags and utilities.

### Acceptance
- Feeds behave identically; code duplication reduced.
- No hardcoded years remain.
- Lighthouse (or similar) shows no regressions.

### Completion Log
- Add dated notes here as tasks complete.